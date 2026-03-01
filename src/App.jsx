import React, { useState, useMemo, useCallback } from 'react';
import { Navbar, Sidebar, BookViewer } from './components';
import bibleData from './data/bibleData';
import { oldTestament, newTestament } from './data/constants';
import { 
  getBooks, 
  getChapters, 
  getVerses, 
  parseReference, 
  searchBible 
} from './utils/helpers';
import './styles/global.css';

function App() {
  // State
  const [currentBook, setCurrentBook] = useState('التكوين');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Memoized data
  const books = useMemo(() => getBooks(bibleData), []);
  
  const getChaptersForBook = useCallback((book) => {
    return getChapters(bibleData, book);
  }, []);

  const chapters = useMemo(
    () => getChaptersForBook(currentBook), 
    [currentBook, getChaptersForBook]
  );
  
  const verses = useMemo(
    () => getVerses(bibleData, currentBook, currentChapter), 
    [currentBook, currentChapter]
  );

  const otBooks = useMemo(
    () => books.filter(b => oldTestament.includes(b)), 
    [books]
  );
  
  const ntBooks = useMemo(
    () => books.filter(b => newTestament.includes(b)), 
    [books]
  );

  // Navigation checks
  const currentChapterIndex = chapters.indexOf(currentChapter);
  const bookIndex = books.indexOf(currentBook);
  const hasPrev = currentChapterIndex > 0 || bookIndex > 0;
  const hasNext = currentChapterIndex < chapters.length - 1 || bookIndex < books.length - 1;

  // Navigation functions
  const goToChapter = useCallback((book, chapter, verse = null) => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentBook(book);
      setCurrentChapter(chapter);
      setIsSearchMode(false);
      setHighlightedVerse(verse);
      setIsFlipping(false);
    }, 200);
  }, []);

  const goToPrev = useCallback(() => {
    const currentIndex = chapters.indexOf(currentChapter);
    if (currentIndex > 0) {
      goToChapter(currentBook, chapters[currentIndex - 1]);
    } else {
      const bIndex = books.indexOf(currentBook);
      if (bIndex > 0) {
        const prevBook = books[bIndex - 1];
        const prevChapters = getChaptersForBook(prevBook);
        goToChapter(prevBook, prevChapters[prevChapters.length - 1]);
      }
    }
  }, [chapters, currentChapter, currentBook, books, getChaptersForBook, goToChapter]);

  const goToNext = useCallback(() => {
    const currentIndex = chapters.indexOf(currentChapter);
    if (currentIndex < chapters.length - 1) {
      goToChapter(currentBook, chapters[currentIndex + 1]);
    } else {
      const bIndex = books.indexOf(currentBook);
      if (bIndex < books.length - 1) {
        const nextBook = books[bIndex + 1];
        goToChapter(nextBook, getChaptersForBook(nextBook)[0]);
      }
    }
  }, [chapters, currentChapter, currentBook, books, getChaptersForBook, goToChapter]);

  // Search function
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;

    const ref = parseReference(searchQuery, books);
    
    if (ref) {
      goToChapter(ref.book, ref.chapter, ref.verse);
      setSidebarOpen(false);
      return;
    }

    const results = searchBible(bibleData, searchQuery);
    setSearchResults(results);
    setIsSearchMode(true);
    setIsFlipping(true);
    setTimeout(() => setIsFlipping(false), 200);
  }, [searchQuery, books, goToChapter]);

  const clearSearch = useCallback(() => {
    setIsSearchMode(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleSelectResult = useCallback((book, chapter, verse) => {
    goToChapter(book, chapter, verse);
  }, [goToChapter]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      if (e.key === 'ArrowLeft' && !isSearchMode) {
        goToNext();
      } else if (e.key === 'ArrowRight' && !isSearchMode) {
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchMode, goToNext, goToPrev]);

  return (
    <div className="app">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onMenuClick={() => setSidebarOpen(true)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        books={books}
        otBooks={otBooks}
        ntBooks={ntBooks}
        currentBook={currentBook}
        currentChapter={currentChapter}
        getChapters={getChaptersForBook}
        onSelectChapter={goToChapter}
      />

      <BookViewer
        isSearchMode={isSearchMode}
        searchResults={searchResults}
        searchQuery={searchQuery}
        currentBook={currentBook}
        currentChapter={currentChapter}
        verses={verses}
        highlightedVerse={highlightedVerse}
        hasPrev={hasPrev}
        hasNext={hasNext}
        isFlipping={isFlipping}
        onPrev={goToPrev}
        onNext={goToNext}
        onClearSearch={clearSearch}
        onSelectResult={handleSelectResult}
      />
    </div>
  );
}

export default App;