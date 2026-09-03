import React from 'react';
import './CardSkeleton.css';

const CardSkeleton = () => {
  return (
    <div className="card-skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-text skeleton-title"></div>
        <div className="skeleton-text skeleton-subtitle"></div>
      </div>
    </div>
  );
};

export default CardSkeleton;
