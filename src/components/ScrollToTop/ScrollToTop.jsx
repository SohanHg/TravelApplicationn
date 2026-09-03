import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const targetId = hash.replace('#', '');
      let attempts = 0;

      // Retry until element is mounted after AnimatePresence route transitions
      const intervalId = setInterval(() => {
        const element = document.getElementById(targetId);
        if (element) {
          clearInterval(intervalId);
          // Small offset to ensure navbar doesn't cover the title
          const navbarHeight = 80;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - navbarHeight,
            behavior: 'smooth'
          });
        } else if (++attempts > 30) {
          clearInterval(intervalId);
        }
      }, 50);

      return () => clearInterval(intervalId);
    } else {
      // Navigating to a page with no hash (like clicking a destination card):
      // ALWAYS start at the very top of the page immediately!
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
}
