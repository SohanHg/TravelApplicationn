import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DestinationCard from '../DestinationCard/DestinationCard';
import './DestinationGrid.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DestinationGrid({ destinations, showFavoritesOnly }) {
  if (!destinations || destinations.length === 0) {
    return (
      <div className="destination-empty-state">
        <span className="destination-empty-icon" aria-hidden="true">
          {showFavoritesOnly ? '❤️' : '🗺️'}
        </span>
        <h2 className="destination-empty-title">
          {showFavoritesOnly
            ? "You haven't favorited any destinations yet"
            : 'No destinations match your search'}
        </h2>
        <p className="destination-empty-subtext">
          {showFavoritesOnly
            ? 'Tap the heart on a destination you like to save it here.'
            : 'Try adjusting your filters or search query.'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="destination-grid"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {destinations.map((dest) => (
          <motion.div
            key={dest.id}
            variants={itemVariants}
            layout
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <DestinationCard destination={dest} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
