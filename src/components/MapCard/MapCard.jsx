import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNearbyAttractions } from '../../services/overpassAPI';
import './MapCard.css';

// Fix default marker icon bug
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom red icon for attractions
const attractionIcon = L.divIcon({
  className: 'custom-attraction-marker',
  html: `<div style="background-color: var(--color-accent); width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const MapCard = ({ lat, lng, destinationName, attractions: initialAttractions = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [attractions, setAttractions] = useState(initialAttractions);
  const [status, setStatus] = useState(initialAttractions.length > 0 ? 'success' : 'loading');

  useEffect(() => {
    if (initialAttractions.length > 0) return;

    let isMounted = true;
    const fetchAttractions = async () => {
      try {
        const fetchedAttractions = await fetchNearbyAttractions(lat, lng);
        if (isMounted) {
          setAttractions(fetchedAttractions);
          setStatus('success');
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error');
        }
      }
    };

    fetchAttractions();

    return () => {
      isMounted = false;
    };
  }, [lat, lng, initialAttractions]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsExpanded(false);
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  const MapContent = ({ zoom }) => (
    <MapContainer center={[lat, lng]} zoom={zoom} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>{destinationName}</Popup>
      </Marker>
      {attractions.map(attr => (
        <Marker key={attr.id} position={[attr.lat, attr.lng]} icon={attractionIcon}>
          <Popup>
            <strong>{attr.name}</strong><br/>
            {attr.type}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );

  return (
    <>
      <div className="map-card">
        <div className="map-card-label">Interactive Map</div>
        {status === 'loading' && <div className="map-attractions-status">Loading nearby attractions...</div>}
        {status === 'error' && <div className="map-attractions-status">Couldn't load nearby attractions right now</div>}
        
        <div style={{ position: 'relative' }}>
          <button 
            className="map-expand-btn" 
            onClick={() => setIsExpanded(true)}
            aria-label="Expand map"
          >
            Expand Map
          </button>
          <MapContent zoom={12} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="map-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div 
              className="map-modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="map-modal-close"
                onClick={() => setIsExpanded(false)}
                aria-label="Close map"
              >
                &times;
              </button>
              <MapContent zoom={11} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MapCard;
