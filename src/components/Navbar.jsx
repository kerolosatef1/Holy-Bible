import React from 'react';
import '../styles/Navbar.css';

const Navbar = ({ searchQuery, setSearchQuery, onSearch, onMenuClick }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <span className="navbar__logo-icon">✝️</span>
        <h1 className="navbar__logo-title">الكتاب المقدس</h1>
      </div>

      <div className="navbar__search">
        <input
          type="text"
          className="navbar__search-input"
          placeholder="ابحث بكلمة أو مرجع (مثال: يو3:16)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="navbar__search-btn" onClick={onSearch}>
          🔍 بحث
        </button>
      </div>

      <button className="navbar__menu-btn" onClick={onMenuClick}>
        ☰ <span>الأسفار</span>
      </button>
    </nav>
  );
};

export default Navbar;