import React, { useState, useEffect } from 'react';
import { highlightText } from '../utils/helpers';
import '../styles/SearchResults.css';

const RESULTS_PER_PAGE = 20;

const SearchResults = ({ 
  results, 
  searchQuery, 
  onClear, 
  onSelectResult,
  isFlipping 
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);
  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;
  const endIndex = startIndex + RESULTS_PER_PAGE;
  const currentResults = results.slice(startIndex, endIndex);

  // Reset to page 1 when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [results]);

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

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`search-results ${isFlipping ? 'page-flip' : ''}`}>
      {/* Header */}
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
          {/* Results List */}
          <div className="search-results__list">
            {currentResults.map((v, i) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination__btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                → السابق
              </button>

              <div className="pagination__pages">
                {currentPage > 3 && totalPages > 5 && (
                  <>
                    <button 
                      className="pagination__page"
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
                    <span className="pagination__dots">...</span>
                  </>
                )}

                {getPageNumbers().map(page => (
                  <button
                    key={page}
                    className={`pagination__page ${page === currentPage ? 'pagination__page--active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                {currentPage < totalPages - 2 && totalPages > 5 && (
                  <>
                    <span className="pagination__dots">...</span>
                    <button 
                      className="pagination__page"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button 
                className="pagination__btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                التالي ←
              </button>
            </div>
          )}

          {/* Page Info */}
          <div className="search-results__info">
            عرض {startIndex + 1} - {Math.min(endIndex, results.length)} من {results.length} نتيجة
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;