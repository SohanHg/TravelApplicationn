import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './NotFound.css';

function NotFound() {
  return (
    <motion.main
      className="not-found"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="not-found-content">
        <span className="not-found-emoji">🧭</span>
        <h1>Page Not Found</h1>
        <p>Looks like you've wandered off the map. Let's get you back on track.</p>
        <Link to="/" className="not-found-link">
          ← Back to Home
        </Link>
      </div>
    </motion.main>
  );
}

export default NotFound;
