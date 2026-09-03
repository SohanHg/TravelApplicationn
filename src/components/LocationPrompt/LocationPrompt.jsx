import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGeolocation } from '../../hooks/useGeolocation';
import { geocodeLocation } from '../../services/geocodeAPI';
import WeatherWidget from '../WeatherWidget/WeatherWidget';
import './LocationPrompt.css';

const LocationPrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { location, status, locationName, requestLocation } = useGeolocation();
  const [searchInput, setSearchInput] = useState('');
  const [manualLocation, setManualLocation] = useState(null);
  const [manualName, setManualName] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Global event listener to trigger weather modal from navbar or elsewhere
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-weather-modal', handleOpen);
    return () => window.removeEventListener('open-weather-modal', handleOpen);
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    try {
      const result = await geocodeLocation(searchInput);
      if (result) {
        setManualLocation({ lat: result.lat, lng: result.lng });
        setManualName(result.displayName);
      } else {
        setSearchError("Couldn't find that destination. Please try another name.");
      }
    } catch (err) {
      setSearchError("Could not retrieve location. Please check your connection.");
    } finally {
      setSearchLoading(false);
    }
  };

  const resetLocation = () => {
    setManualLocation(null);
    setManualName(null);
    setSearchInput('');
    setSearchError(null);
  };

  const isLoading = status === 'loading' || searchLoading;
  const hasGeoLocation = status === 'granted' && location.lat != null;
  const hasManualLocation = manualLocation != null;
  const activeLocation = hasManualLocation ? manualLocation : (hasGeoLocation ? location : null);
  const activeName = hasManualLocation ? manualName : locationName;

  return (
    <>
      {/* Floating Weather Button (Bottom-Left) */}
      <button 
        className="weather-fab" 
        onClick={() => setIsOpen(true)}
        aria-label="Open Destination Weather Finder"
        title="Check live weather for any destination"
      >
        <span className="weather-fab-icon">🌤️</span>
        <span className="weather-fab-text">Live Weather</span>
      </button>

      {/* Floating Weather Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="weather-modal-overlay" onClick={() => setIsOpen(false)}>
            <motion.div 
              className="weather-panel"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="weather-header">
                <div className="weather-header-info">
                  <div className="weather-title-row">
                    <span className="weather-header-emoji">⛅</span>
                    <h2 className="weather-panel-title">Weather Finder</h2>
                  </div>
                  <span className="weather-panel-subtitle">Check real-time weather anywhere</span>
                </div>
                <button 
                  className="weather-close-btn" 
                  onClick={() => setIsOpen(false)}
                  aria-label="Close weather modal"
                >
                  ✕
                </button>
              </div>

              <div className="weather-body">
                {isLoading ? (
                  <div className="weather-loading-state">
                    <div className="weather-spinner"></div>
                    <p>Fetching real-time weather...</p>
                  </div>
                ) : activeLocation ? (
                  <div className="weather-result-state">
                    <div className="weather-result-header">
                      <span className="weather-location-pin">📍</span>
                      <h3 className="weather-result-city">
                        {activeName ? activeName : 'Current Location'}
                      </h3>
                    </div>

                    <WeatherWidget lat={activeLocation.lat} lng={activeLocation.lng} />

                    <button className="weather-reset-btn" onClick={resetLocation}>
                      🔍 Check Another Destination
                    </button>
                  </div>
                ) : (
                  <div className="weather-prompt-state">
                    <p className="weather-prompt-intro">
                      Get instant live temperature, conditions, and wind speed for any destination.
                    </p>

                    <button className="weather-geo-btn" onClick={requestLocation}>
                      <span className="geo-icon">📍</span> Share My Current Location
                    </button>

                    <div className="weather-divider">
                      <span>or enter a destination</span>
                    </div>

                    <form className="weather-search-form" onSubmit={handleSearchSubmit}>
                      <div className="weather-input-wrapper">
                        <input
                          type="text"
                          placeholder="e.g. Paris, Tokyo, Jaipur, Bali..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="weather-search-input"
                          autoFocus
                        />
                        <button type="submit" className="weather-search-btn" aria-label="Search weather">
                          Search
                        </button>
                      </div>
                    </form>

                    {status === 'denied' && (
                      <p className="weather-alert friendly">
                        Location access was denied — simply type your city above!
                      </p>
                    )}
                    {status === 'error' && (
                      <p className="weather-alert error">
                        Unable to determine current location — try typing your destination above.
                      </p>
                    )}
                    {searchError && (
                      <p className="weather-alert error">{searchError}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LocationPrompt;
