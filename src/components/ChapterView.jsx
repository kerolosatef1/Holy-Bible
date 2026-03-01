import React from 'react';
import '../styles/BookViewer.css';

const ChapterView = ({ 
  currentBook, 
  currentChapter, 
  verses, 
  highlightedVerse,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  isFlipping
}) => {
  return (
    <div className={`book-viewer__page ${isFlipping ? 'page-flip' : ''}`}>
      <div className="chapter-header">
        <h2 className="chapter-header__book-title">{currentBook}</h2>
        <div className="chapter-header__chapter-number">الإصحاح {currentChapter}</div>
      </div>

      <div className="verses">
        {verses.map(v => (
          <span
            key={v.verse}
            className={`verse ${highlightedVerse === v.verse ? 'verse--highlighted' : ''}`}
          >
            <span className="verse__number">{v.verse}</span>
            {v.text}{' '}
          </span>
        ))}
      </div>

      <div className="page-nav">
        <button
          className="page-nav__btn"
          onClick={onPrev}
          disabled={!hasPrev}
        >
          → السابق
        </button>
        <span className="page-nav__indicator">{currentBook} {currentChapter}</span>
        <button
          className="page-nav__btn"
          onClick={onNext}
          disabled={!hasNext}
        >
          التالي ←
        </button>
      </div>
    </div>
  );
};

export default ChapterView;