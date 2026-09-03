import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import DestinationDetail from './pages/DestinationDetail';
import NotFound from './pages/NotFound';
import AIChat from './components/AIChat/AIChat';
import LocationPrompt from './components/LocationPrompt/LocationPrompt';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import destinations from './data/destinations';

function App() {
  const location = useLocation();

  // Find active destination if current route is /destination/:id
  const match = location.pathname.match(/^\/destination\/([^/]+)/);
  const activeDestinationId = match ? match[1] : null;
  const activeDestination = destinations.find((d) => d.id === activeDestinationId) || null;

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <Footer />

      {/* Global Floating Weather Finder (Bottom-Left) */}
      <LocationPrompt />

      {/* Global Floating AI Assistant (Bottom-Right) */}
      <AIChat destination={activeDestination} />
    </>
  );
}

export default App;
