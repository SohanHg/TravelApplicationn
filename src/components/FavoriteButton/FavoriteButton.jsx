import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './FavoriteButton.css';

export default function FavoriteButton({ destinationId, size = 'md' }) {
  const [favorites, setFavorites] = useLocalStorage('favoriteDestinations', []);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const isFavorite = favorites.includes(destinationId);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsAnimating(true);
    
    if (isFavorite) {
      setFavorites(favorites.filter(id => id !== destinationId));
    } else {
      setFavorites([...favorites, destinationId]);
    }
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <motion.button
      className={`favorite-btn ${size}`}
      onClick={toggleFavorite}
      aria-label={isFavorite ? `Remove ${destinationId} from favorites` : `Add ${destinationId} to favorites`}
      animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {isFavorite ? '❤️' : '🤍'}
    </motion.button>
  );
}
