import React, { useState } from 'react';
import '../styles/Sidebar.css';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  books, 
  otBooks, 
  ntBooks, 
  currentBook, 
  currentChapter,
  getChapters,
  onSelectChapter 
}) => {
  const [expandedBook, setExpandedBook] = useState(null);

  const handleBookClick = (book) => {
    setExpandedBook(expandedBook === book ? null : book);
  };

  const handleChapterClick = (book, chapter) => {
    onSelectChapter(book, chapter);
    onClose();
  };

  const renderBookList = (bookList, title, icon) => (
    <div className="sidebar__testament">
      <div className="sidebar__testament-title">
        <span>{icon}</span> {title}
      </div>
      {bookList.map(book => (
        <div key={book}>
          <div
            className={`sidebar__book-item ${book === currentBook ? 'sidebar__book-item--active' : ''}`}
            onClick={() => handleBookClick(book)}
          >
            {book}
          </div>
          {expandedBook === book && (
            <div className="sidebar__chapters">
              {getChapters(book).map(ch => (
                <button
                  key={ch}
                  className={`sidebar__chapter-btn ${book === currentBook && ch === currentChapter ? 'sidebar__chapter-btn--active' : ''}`}
                  onClick={() => handleChapterClick(book, ch)}
                >
                  {ch}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div 
        className={`overlay ${isOpen ? 'overlay--visible' : ''}`} 
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <span className="sidebar__title">الأسفار</span>
          <button className="sidebar__close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="sidebar__content">
          {renderBookList(otBooks, 'العهد القديم', '📜')}
          {renderBookList(ntBooks, 'العهد الجديد', '📖')}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;