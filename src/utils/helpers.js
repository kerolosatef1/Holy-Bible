import { bookAbbreviations } from '../data/constants';

// Convert Arabic numerals to English
const arabicToEnglish = (str) => {
  const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (d) => arabicNums.indexOf(d));
};

// Remove Arabic diacritics (tashkeel)
export const removeTashkeel = (text) => {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '');
};

// Parse reference like "يو3:16" or "يو٣:١٦" (supports Arabic & English numbers)
export const parseReference = (query, books) => {
  // Convert Arabic numbers to English first
  const normalizedQuery = arabicToEnglish(query.trim());
  
  // Pattern: BookName + Chapter + optional(:Verse)
  // Supports: يو3:16, يو 3:16, يو3 16, يو 3 16, يو3-16, يو٣:١٦
  const refPattern = /^([^\d٠-٩]+)\s*(\d+)\s*[:\-\s]?\s*(\d+)?$/;
  const match = normalizedQuery.match(refPattern);
  
  if (match) {
    const abbr = match[1].trim();
    const chapter = parseInt(match[2]);
    const verse = match[3] ? parseInt(match[3]) : null;
    
    // Find full book name
    let bookName = bookAbbreviations[abbr];
    if (!bookName) {
      // Try to find partial match
      bookName = books.find(b => b.includes(abbr) || b.startsWith(abbr));
    }
    
    if (bookName) {
      return { book: bookName, chapter, verse };
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
    // Skip if term looks like a number (part of reference)
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