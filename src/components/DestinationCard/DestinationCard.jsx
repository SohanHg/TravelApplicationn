import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDestinationImage } from '../../hooks/useDestinationImages';
import CardSkeleton from '../Skeletons/CardSkeleton';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import './DestinationCard.css';

export default function DestinationCard({ destination }) {
  const { id, name, country, tagline } = destination;
  const { imageUrl, loading } = useDestinationImage(`${name} ${country} travel`);

  return (
    <motion.div
      className="destination-card-wrapper"
      whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.25 }}
      layout
    >
      <Link to={`/destination/${id}`} className="destination-card">
        <div className="destination-card-image-container">
          {loading ? (
            <CardSkeleton />
          ) : imageUrl ? (
            <img src={imageUrl} alt={`${name}, ${country}`} className="destination-card-image" />
          ) : (
            <div className="destination-card-fallback" />
          )}
          <div className="destination-card-fav">
            <FavoriteButton destinationId={id} size="sm" />
          </div>
        </div>
        <div className="destination-card-content">
          <h3 className="destination-card-title">{name}</h3>
          <span className="destination-card-country">{country}</span>
          <p className="destination-card-tagline">{tagline}</p>
        </div>
      </Link>
    </motion.div>
  );
}
