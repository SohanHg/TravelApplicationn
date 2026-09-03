import { motion } from 'framer-motion';
import Hero from '../components/Hero/Hero';
import SearchFilterBar from '../components/SearchFilterBar/SearchFilterBar';
import DestinationGrid from '../components/DestinationGrid/DestinationGrid';
import { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import destinations from '../data/destinations';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites] = useLocalStorage('favoriteDestinations', []);

  useEffect(() => {
    if (window.location.hash === '#explore') {
      setTimeout(() => {
        const el = document.getElementById('explore');
        if (el) {
          const navbarHeight = 80;
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navbarHeight,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  }, []);

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      searchQuery === '' ||
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = activeRegion === 'All' || dest.region === activeRegion;

    const matchesFavorites = !showFavoritesOnly || favorites.includes(dest.id);

    return matchesSearch && matchesRegion && matchesFavorites;
  });

  const handleRegionChange = (region) => {
    setActiveRegion(region);
    setShowFavoritesOnly(false);
  };

  const handleFavoritesToggle = () => {
    setShowFavoritesOnly((prev) => {
      const next = !prev;
      if (next) {
        setActiveRegion('All');
      }
      return next;
    });
  };

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Hero />

      <motion.section
        id="explore"
        className="container"
        style={{ paddingTop: '40px', paddingBottom: 'var(--section-gap)' }}
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
      >
        <h2 className="section-heading">Explore Destinations</h2>
        <p className="section-subheading">
          Discover handpicked places around the world — from ancient temples to
          modern skylines.
        </p>
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeRegion={activeRegion}
          onRegionChange={handleRegionChange}
          showFavoritesOnly={showFavoritesOnly}
          onFavoritesToggle={handleFavoritesToggle}
          favoritesCount={favorites.length}
        />
        <DestinationGrid
          destinations={filteredDestinations}
          showFavoritesOnly={showFavoritesOnly}
        />
      </motion.section>
    </motion.main>
  );
}

export default Home;
