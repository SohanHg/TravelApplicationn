import React from 'react';
import { motion } from 'framer-motion';
import './ItineraryDisplay.css';

const ItineraryDisplay = ({ itinerary, destinationName }) => {
  if (!itinerary || !itinerary.days) return null;

  return (
    <div className="itinerary-display">
      <h2 className="itinerary-header">Your Trip to {destinationName}</h2>
      
      <div className="itinerary-timeline">
        {itinerary.days.map((day, index) => (
          <motion.div 
            key={index} 
            className="day-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <div className="day-badge">{day.day}</div>
            <div className="day-content">
              <h3 className="day-title">{day.title}</h3>
              <ul className="activity-list">
                {day.activities.map((activity, actIndex) => (
                  <li key={actIndex} className="activity-item">
                    <span className="activity-icon">✓</span>
                    <span className="activity-text">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ItineraryDisplay;
