import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { lazy, Suspense, useState, useEffect } from 'react';
import destinations from '../data/destinations';
import { useDestinationImage } from '../hooks/useDestinationImages';
import FamousPlaces from '../components/FamousPlaces/FamousPlaces';
import WeatherWidget from '../components/WeatherWidget/WeatherWidget';
import AIChat from '../components/AIChat/AIChat';
import ItineraryDisplay from '../components/ItineraryDisplay/ItineraryDisplay';
import FavoriteButton from '../components/FavoriteButton/FavoriteButton';
import MapCard from '../components/MapCard/MapCard';
import TravelMode from '../components/TravelMode/TravelMode';
import './DestinationDetail.css';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function DestinationDetail() {
  const { id } = useParams();
  const destination = destinations.find((d) => d.id === id);
  const { imageUrl, loading: imageLoading } = useDestinationImage(
    destination ? `${destination.name} ${destination.country} landmark` : null
  );
  const [itinerary, setItinerary] = useState(null);

  useEffect(() => {
    const handleItinerary = (e) => {
      if (e.detail) {
        setItinerary(e.detail);
      }
    };
    window.addEventListener('itinerary-generated', handleItinerary);
    return () => window.removeEventListener('itinerary-generated', handleItinerary);
  }, []);

  if (!destination) {
    return (
      <motion.main
        className="detail-not-found"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="container">
          <h1>Destination Not Found</h1>
          <p>We couldn't find the destination you're looking for.</p>
          <Link to="/" className="detail-back-link">
            ← Back to Explore
          </Link>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Image */}
      <div className="detail-hero">
        {imageLoading ? (
          <div className="detail-hero-skeleton" />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={`${destination.name}, ${destination.country}`}
            className="detail-hero-img"
          />
        ) : (
          <div className="detail-hero-fallback" />
        )}
        <div className="detail-hero-overlay">
          <div className="container">
            <div className="detail-hero-title-row">
              <h1 className="detail-hero-title">{destination.name}</h1>
              <FavoriteButton destinationId={destination.id} size="lg" />
            </div>
            <p className="detail-hero-subtitle">
              {destination.country} · {destination.region}
            </p>
            <p className="detail-hero-tagline">{destination.tagline}</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation Bar */}
      <div className="detail-breadcrumb-bar">
        <div className="container">
          <Link to="/#explore" className="detail-breadcrumb-link">
            ← Explore Destinations
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{destination.name}</span>
        </div>
      </div>

      {/* Content */}
      <div className="container">
        <div className="detail-content">
          {/* Main info */}
          <motion.div
            className="detail-main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <section className="detail-section">
              <h2>About {destination.name}</h2>
              <p className="detail-description">{destination.description}</p>
            </section>

            <section className="detail-section">
              <h2>Best Time to Visit</h2>
              <div className="detail-best-time">
                <span className="detail-best-time-icon">📅</span>
                <span>{destination.bestTimeToVisit}</span>
              </div>
            </section>

            <section className="detail-section">
              <h2>Famous Places</h2>
              <FamousPlaces
                places={destination.famousPlaces}
                destinationName={destination.name}
              />
            </section>

            {/* AI Trip Planner Callout */}
            <section className="detail-section detail-ai-card">
              <div className="detail-ai-content">
                <span className="detail-ai-badge">✨ Gemini AI Powered</span>
                <h2>Plan Your {destination.name} Trip</h2>
                <p>Generate a customized day-by-day itinerary or ask questions about when to go, what to pack, and hidden gems.</p>
                <button 
                  className="detail-ai-btn"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-ai-chat'))}
                >
                  💬 Open AI Assistant & Trip Planner
                </button>
              </div>
            </section>

            {/* Itinerary Display */}
            {itinerary && (
              <section className="detail-section">
                <h2>Your Itinerary</h2>
                <ItineraryDisplay itinerary={itinerary} destinationName={destination.name} />
              </section>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.aside
            className="detail-sidebar"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <WeatherWidget lat={destination.lat} lng={destination.lng} />
            <div style={{ marginTop: '24px' }}>
              <MapCard
                lat={destination.lat}
                lng={destination.lng}
                destinationName={destination.name}
                famousPlaces={destination.famousPlaces}
              />
            </div>
          </motion.aside>
        </div>

        {/* Phase 16: Travel Mode (Public Transit & Private Route) */}
        <TravelMode destination={destination} />
      </div>
    </motion.main>
  );
}

export default DestinationDetail;
