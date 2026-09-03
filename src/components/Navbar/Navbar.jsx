import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleExploreClick = (e) => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);

    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById('explore');
      if (el) {
        const navbarHeight = 80;
        const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - navbarHeight,
          behavior: 'smooth'
        });
      }
    } else {
      // Navigate to /#explore from detail page
      navigate('/#explore');
    }
  };

  const openWeather = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('open-weather-modal'));
  };

  const openAI = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('open-ai-chat'));
  };

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">TravelPlanner</Link>
        
        <nav className="navbar-links desktop-only">
          <Link to="/">Home</Link>
          <button type="button" className="navbar-btn-link" onClick={handleExploreClick}>
            Explore
          </button>
          <button type="button" className="navbar-btn-link" onClick={openWeather}>
            🌤️ Weather
          </button>
          <button type="button" className="navbar-btn-link" onClick={openAI}>
            ✨ AI Assistant
          </button>
        </nav>

        <button 
          className="mobile-menu-btn" 
          aria-label="Toggle menu"
          onClick={toggleMenu}
        >
          <span className="hamburger"></span>
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav 
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Link to="/" onClick={toggleMenu}>Home</Link>
            <button type="button" className="navbar-btn-link mobile-link" onClick={handleExploreClick}>
              Explore Destinations
            </button>
            <button 
              type="button" 
              className="navbar-btn-link mobile-link" 
              onClick={openWeather}
            >
              🌤️ Live Weather
            </button>
            <button 
              type="button" 
              className="navbar-btn-link mobile-link" 
              onClick={openAI}
            >
              ✨ AI Travel Assistant
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
