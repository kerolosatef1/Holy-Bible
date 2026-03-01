import React from 'react';
import ChapterView from './ChapterView';
import SearchResults from './SearchResults';
import '../styles/BookViewer.css';

const BookViewer = ({
  isSearchMode,
  searchResults,
  searchQuery,
  currentBook,
  currentChapter,
  verses,
  highlightedVerse,
  hasPrev,
  hasNext,
  isFlipping,
  onPrev,
  onNext,
  onClearSearch,
  onSelectResult
}) => {
  return (
    <main className="book-viewer">
      <div className="book-viewer__container">
        <div className="book-viewer__book">
          <div className="book-viewer__pages">
            {isSearchMode ? (
              <SearchResults
                results={searchResults}
                searchQuery={searchQuery}
                onClear={onClearSearch}
                onSelectResult={onSelectResult}
                isFlipping={isFlipping}
              />
            ) : (
              <ChapterView
                currentBook={currentBook}
                currentChapter={currentChapter}
                verses={verses}
                highlightedVerse={highlightedVerse}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={onPrev}
                onNext={onNext}
                isFlipping={isFlipping}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookViewer;