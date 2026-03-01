import { highlightText } from '../utils/helpers';
import '../styles/SearchResults.css';

const SearchResults = ({ 
  results, 
  searchQuery, 
  onClear, 
  onSelectResult,
  isFlipping 
}) => {
  // Render verse text with highlights
  const renderHighlightedText = (text) => {
    const highlighted = highlightText(text, searchQuery);
    const parts = highlighted.split(/(‹‹.*?››)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('‹‹') && part.endsWith('››')) {
        return <mark key={i} className="verse__highlight">{part.slice(2, -2)}</mark>;
      }
      return part;
    });
  };

  return (
    <div className={`book-viewer__page ${isFlipping ? 'page-flip' : ''}`}>
      <div className="search-results__header">
        <span className="search-results__count">
          تم العثور على {results.length} نتيجة للبحث عن "{searchQuery}"
        </span>
        <button className="search-results__clear-btn" onClick={onClear}>
          ✕ إلغاء البحث
        </button>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <h3 className="empty-state__title">لا توجد نتائج</h3>
          <p className="empty-state__text">جرب البحث بكلمات مختلفة</p>
        </div>
      ) : (
        <>
          <div className="search-results__list">
            {results.slice(0, 50).map((v, i) => (
              <div
                key={`${v.book}-${v.chapter}-${v.verse}-${i}`}
                className="search-results__item"
                onClick={() => onSelectResult(v.book, v.chapter, v.verse)}
              >
                <div className="search-results__reference">
                  {v.book} {v.chapter}:{v.verse}
                </div>
                <div className="search-results__text">
                  {renderHighlightedText(v.text)}
                </div>
              </div>
            ))}
          </div>
          {results.length > 50 && (
            <p className="search-results__more">
              وأكثر من {results.length - 50} نتيجة أخرى...
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;