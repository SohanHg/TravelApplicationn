import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHeroVideo } from '../../services/imageAPI';
import './Hero.css';

const Hero = () => {
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const data = await getHeroVideo();
        setVideoData(data);
      } catch (error) {
        console.error('Failed to fetch hero video', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideo();
  }, []);

  return (
    <section className="hero">
      {isLoading || !videoData ? (
        <div className="hero-loading"></div>
      ) : (
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          src={videoData.videoUrl} 
          poster={videoData.imageUrl}
          className="hero-video"
        ></video>
      )}
      
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">Explore Without Limits.</h1>
          <p className="hero-subtitle">Discover curated destinations, real-time weather, and AI-powered trip planning.</p>
        </div>
        
        <motion.div 
          className="hero-scroll-cue"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
