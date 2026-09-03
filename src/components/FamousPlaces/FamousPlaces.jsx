import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useDestinationImage } from '../../hooks/useDestinationImages';
import './FamousPlaces.css';

function PlaceCard({ place, destinationName }) {
  const { imageUrl, loading } = useDestinationImage(`${place.name} ${destinationName}`);

  return (
    <motion.div
      className="famous-place-card"
      whileHover={{ scale: 1.02 }}
    >
      <div className="famous-place-image-wrapper">
        {loading ? (
          <div className="famous-place-skeleton" />
        ) : imageUrl ? (
          <img src={imageUrl} alt={place.name} className="famous-place-image" />
        ) : (
          <div className="famous-place-fallback" />
        )}
      </div>
      <div className="famous-place-content">
        <h4 className="famous-place-title">{place.name}</h4>
        <p className="famous-place-blurb">{place.blurb}</p>
      </div>
    </motion.div>
  );
}

export default function FamousPlaces({ places, destinationName }) {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (!places || places.length === 0) return null;

  return (
    <div className="famous-places-container">
      <button className="carousel-arrow left-arrow" onClick={scrollLeft} aria-label="Scroll left">
        ←
      </button>
      <div className="famous-places-scroll" ref={scrollRef}>
        {places.map((place, idx) => (
          <PlaceCard key={idx} place={place} destinationName={destinationName} />
        ))}
      </div>
      <button className="carousel-arrow right-arrow" onClick={scrollRight} aria-label="Scroll right">
        →
      </button>
    </div>
  );
}
