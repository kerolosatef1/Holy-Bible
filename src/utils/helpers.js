import { bookAbbreviations, numberedAbbreviations } from '../data/constants';

// Convert Arabic numerals to English
const arabicToEnglish = (str) => {
  const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (d) => arabicNums.indexOf(d));
};

// Remove Arabic diacritics (tashkeel)
export const removeTashkeel = (text) => {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '');
};

// Find book from abbreviation
const findBookFromAbbr = (abbr, books) => {
  const cleanAbbr = removeTashkeel(abbr);
  
  // ابحث في الاختصارات
  for (const [key, value] of Object.entries(bookAbbreviations)) {
    const cleanKey = removeTashkeel(key);
    if (cleanKey === cleanAbbr) {
      // وجدنا الاختصار، دور على السفر في الداتا
      const foundBook = books.find(b => {
        const cleanB = removeTashkeel(b);
        const cleanValue = removeTashkeel(value);
        return cleanB === cleanValue || 
               cleanB.includes(cleanValue) || 
               cleanValue.includes(cleanB);
      });
      return foundBook || null;
    }
  }
  return null;
};

// Parse reference like "يو3:16" or "كو1 5:3"
export const parseReference = (query, books) => {
  // Normalize query
  let q = arabicToEnglish(query.trim());
  q = removeTashkeel(q);
  
  // أولاً: جرب الاختصارات اللي فيها أرقام (الأطول أولاً)
  // رتبهم من الأطول للأقصر
  const sortedNumberedAbbrs = [...numberedAbbreviations].sort((a, b) => b.length - a.length);
  
  for (const abbr of sortedNumberedAbbrs) {
    const cleanAbbr = removeTashkeel(abbr);
    
    // تأكد إن الـ query بيبدأ بالاختصار ده
    if (q.startsWith(cleanAbbr)) {
      const rest = q.slice(cleanAbbr.length).trim();
      
      // الباقي لازم يكون رقم الإصحاح و/أو الآية
      // Patterns: "5:3" or "5 3" or "5-3" or "5"
      const withVerseMatch = rest.match(/^(\d+)\s*[:\-\s]\s*(\d+)$/);
      const chapterOnlyMatch = rest.match(/^(\d+)$/);
      
      if (withVerseMatch || chapterOnlyMatch) {
        const book = findBookFromAbbr(abbr, books);
        if (book) {
          if (withVerseMatch) {
            return {
              book: book,
              chapter: parseInt(withVerseMatch[1]),
              verse: parseInt(withVerseMatch[2])
            };
          } else {
            return {
              book: book,
              chapter: parseInt(chapterOnlyMatch[1]),
              verse: null
            };
          }
        }
      }
    }
  }
  
  // ثانياً: جرب الاختصارات العادية
  // Pattern: letters + space/nothing + numbers
  const regularMatch = q.match(/^([^\d]+?)\s*(\d+)\s*[:\-\s]?\s*(\d+)?$/);
  
  if (regularMatch) {
    const abbr = regularMatch[1].trim();
    const chapter = parseInt(regularMatch[2]);
    const verse = regularMatch[3] ? parseInt(regularMatch[3]) : null;
    
    // تأكد إنه مش اختصار فيه رقم
    const isNumberedAbbr = sortedNumberedAbbrs.some(na => {
      const cleanNA = removeTashkeel(na);
      return cleanNA === abbr || abbr.startsWith(cleanNA);
    });
    
    if (!isNumberedAbbr) {
      const book = findBookFromAbbr(abbr, books);
      if (book) {
        return { book, chapter, verse };
      }
      
      // جرب البحث بالاسم الكامل
      const foundBook = books.find(b => {
        const cleanB = removeTashkeel(b).toLowerCase();
        const cleanAbbr = abbr.toLowerCase();
        return cleanB.startsWith(cleanAbbr) || cleanB.includes(cleanAbbr);
      });
      
      if (foundBook) {
        return { book: foundBook, chapter, verse };
      }
    }
  }
  
  // ثالثاً: جرب الاسم الكامل مع مسافات
  const fullNameMatch = q.match(/^(.+?)\s+(\d+)\s*[:\-\s]?\s*(\d+)?$/);
  
  if (fullNameMatch) {
    const bookName = fullNameMatch[1].trim().toLowerCase();
    const chapter = parseInt(fullNameMatch[2]);
    const verse = fullNameMatch[3] ? parseInt(fullNameMatch[3]) : null;
    
    const foundBook = books.find(b => {
      const cleanB = removeTashkeel(b).toLowerCase();
      return cleanB === bookName || cleanB.includes(bookName) || bookName.includes(cleanB);
    });
    
    if (foundBook) {
      return { book: foundBook, chapter, verse };
    }
  }
  
  return null;
};

// Highlight search terms in text
export const highlightText = (text, query) => {
  if (!query) return text;
  
  const terms = removeTashkeel(query).split(/\s+/).filter(t => t);
  let result = text;
  
  terms.forEach(term => {
    // Skip numbers
    if (/^\d+$/.test(term)) return;
    
    const termChars = term.split('');
    const tashkeelPattern = '[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]*';
    const pattern = termChars.join(tashkeelPattern);
    const regex = new RegExp(`(${pattern})`, 'gi');
    result = result.replace(regex, '‹‹$1››');
  });
  
  return result;
};

// Get unique books from data
export const getBooks = (bibleData) => {
  return [...new Set(bibleData.map(v => v.book))];
};

// Get chapters for a book
export const getChapters = (bibleData, book) => {
  return [...new Set(bibleData.filter(v => v.book === book).map(v => v.chapter))].sort((a, b) => a - b);
};

// Get verses for a chapter
export const getVerses = (bibleData, book, chapter) => {
  return bibleData.filter(v => v.book === book && v.chapter === chapter).sort((a, b) => a.verse - b.verse);
};

// Search in bible data
export const searchBible = (bibleData, query) => {
  const searchTerms = removeTashkeel(query.toLowerCase()).split(/\s+/);
  return bibleData.filter(v => {
    const text = removeTashkeel(v.text.toLowerCase());
    return searchTerms.every(term => text.includes(term));
  });
};