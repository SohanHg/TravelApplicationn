import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <h2 className="footer-brand">TravelPlanner</h2>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} TravelPlanner. All rights reserved.
        </p>
        <p className="footer-credits">
          Built with React, Pexels, OpenWeather, and Google Gemini
        </p>
      </div>
    </footer>
  );
};

export default Footer;
