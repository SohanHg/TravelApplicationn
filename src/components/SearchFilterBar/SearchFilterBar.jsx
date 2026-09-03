import React from 'react';
import './SearchFilterBar.css';

const REGIONS = ['All', 'India', 'Asia', 'Europe', 'Americas', 'Africa', 'Oceania'];

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  activeRegion,
  onRegionChange,
  showFavoritesOnly,
  onFavoritesToggle,
  favoritesCount
}) {
  return (
    <div className="search-filter-bar">
      <div className="search-input-wrapper">
        <label htmlFor="destination-search" className="visually-hidden">Search destinations</label>
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          id="destination-search"
          type="text"
          className="search-input"
          placeholder="Search destinations..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="region-filters">
        {REGIONS.map((region) => (
          <button
            key={region}
            type="button"
            className={`region-pill ${activeRegion === region ? 'active' : ''}`}
            onClick={() => onRegionChange(region)}
          >
            {region}
          </button>
        ))}
        <button
          type="button"
          className={`region-pill favorites-pill ${showFavoritesOnly ? 'active' : ''}`}
          onClick={onFavoritesToggle}
        >
          ❤️ Favorites{favoritesCount > 0 ? ` (${favoritesCount})` : ''}
        </button>
      </div>
    </div>
  );
}
