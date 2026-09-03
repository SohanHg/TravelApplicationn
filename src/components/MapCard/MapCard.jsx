import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNearbyAttractions } from '../../services/overpassAPI';
import { getDestinationImage } from '../../services/imageAPI';
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

// Rich popup component fetching real landmark image
function AttractionPopupContent({ attraction, destinationName }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchImg = async () => {
      try {
        const query = `${attraction.name} ${destinationName}`;
        const img = await getDestinationImage(query);
        if (active && img) {
          setImageUrl(img);
        }
      } catch (e) {
        // Fallback gracefully
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchImg();
    return () => { active = false; };
  }, [attraction.name, destinationName]);

  return (
    <div className="map-attraction-popup">
      {loading ? (
        <div className="map-popup-image-skeleton">Loading photo...</div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={attraction.name}
          className="map-popup-image"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : null}
      <h4 className="map-popup-title">{attraction.name}</h4>
      <span className="map-popup-type">{attraction.type}</span>
    </div>
  );
}

const MapCard = ({ lat, lng, destinationName, famousPlaces = [], attractions: initialAttractions = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [attractions, setAttractions] = useState(initialAttractions);
  const [status, setStatus] = useState(initialAttractions.length > 0 ? 'success' : 'loading');

  useEffect(() => {
    if (initialAttractions.length > 0) return;

    let isMounted = true;
    const fetchAttractions = async () => {
      try {
        const fetchedAttractions = await fetchNearbyAttractions(lat, lng, 10000, famousPlaces);
        if (isMounted) {
          setAttractions(fetchedAttractions);
          setStatus('success');
        }
      } catch (err) {
        if (isMounted) {
          const fallback = (famousPlaces || []).map((p, idx) => ({
            id: `poi-${idx}`,
            name: p.name,
            type: 'Tourist Attraction & Landmark',
            lat: lat + (Math.sin(idx + 1) * 0.012),
            lng: lng + (Math.cos(idx + 1) * 0.012)
          }));
          setAttractions(fallback);
          setStatus('success');
        }
      }
    };

    fetchAttractions();

    return () => {
      isMounted = false;
    };
  }, [lat, lng, initialAttractions, famousPlaces]);

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
        <Popup>
          <AttractionPopupContent
            attraction={{ name: destinationName, type: 'Destination Center' }}
            destinationName={destinationName}
          />
        </Popup>
      </Marker>
      {attractions.map(attr => (
        <Marker key={attr.id} position={[attr.lat, attr.lng]} icon={attractionIcon}>
          <Popup>
            <AttractionPopupContent
              attraction={attr}
              destinationName={destinationName}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );

  return (
    <>
      <div className="map-card">
        <div className="map-card-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Interactive Map</span>
          {attractions.length > 0 && (
            <span style={{ fontSize: '0.78rem', background: '#f5eee6', color: '#c1673a', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
              📍 {attractions.length} Attractions
            </span>
          )}
        </div>
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

      {isExpanded && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div 
            className="map-modal-backdrop"
            style={{ zIndex: 99999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div 
              className="map-modal-content"
              style={{ zIndex: 100000 }}
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
              <MapContent zoom={12} />
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default MapCard;
