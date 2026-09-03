import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage, generateItinerary } from '../../services/geminiAPI';
import './AIChat.css';

const AIChat = ({ destination, onItineraryGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [plannerData, setPlannerData] = useState({
    days: 3,
    interests: {
      Culture: true,
      Adventure: true,
      Food: true,
      Relaxation: false,
      Nightlife: false
    }
  });
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState(null);

  const messagesEndRef = useRef(null);

  // Listen for open-ai-chat event from anywhere in the app
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpen);
    return () => window.removeEventListener('open-ai-chat', handleOpen);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMessage = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const responseText = await sendChatMessage(messages, userText, destination);
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'error', text: error.message || 'Sorry, I encountered an error responding to your request.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handlePlannerSubmit = async () => {
    setPlannerLoading(true);
    setPlannerError(null);
    try {
      const selectedInterests = Object.entries(plannerData.interests)
        .filter(([_, isSelected]) => isSelected)
        .map(([interest]) => interest);
      
      const itinerary = await generateItinerary(
        destination || { name: 'this destination', country: '', famousPlaces: [] },
        plannerData.days,
        selectedInterests
      );

      if (onItineraryGenerated) {
        onItineraryGenerated(itinerary);
      }
      
      // Also broadcast event in case detail page listens
      window.dispatchEvent(new CustomEvent('itinerary-generated', { detail: itinerary }));

      setShowPlanner(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: `✨ I've generated a customized ${plannerData.days}-day itinerary for you! You can view it below on the page.` }
      ]);
    } catch (err) {
      setPlannerError(err.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setPlannerLoading(false);
    }
  };

  const handleInterestToggle = (interest) => {
    setPlannerData(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        [interest]: !prev.interests[interest]
      }
    }));
  };

  return (
    <>
      <button 
        className="chat-fab" 
        onClick={() => setIsOpen(true)}
        aria-label="Open AI travel assistant"
        title="Open AI travel assistant"
      >
        <span className="chat-fab-icon">💬</span>
        <span className="chat-fab-text">Ask AI Assistant</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chat-panel"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-title-row">
                  <span className="chat-sparkle">✨</span>
                  <h2 className="chat-title">Travel Assistant</h2>
                </div>
                <span className="chat-subtitle">
                  {destination ? `${destination.name}, ${destination.country}` : 'Global Travel Guide'}
                </span>
              </div>
              <button 
                className="chat-close" 
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="chat-welcome">
                  <span className="welcome-emoji">👋</span>
                  <p>
                    {destination 
                      ? `Hi! Ask me anything about exploring ${destination.name}, or click "Plan My Trip" to create a custom itinerary!` 
                      : `Hi! I'm your AI travel planner. Ask me for destination recommendations, travel tips, or trip itineraries!`}
                  </p>
                </div>
              )}
              {messages.map((msg, index) => (
                <div key={index} className={`message-wrapper ${msg.role}`}>
                  <div className={`message ${msg.role}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message-wrapper assistant">
                  <div className="message assistant typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
              <button 
                className="planner-toggle-btn"
                onClick={() => setShowPlanner(!showPlanner)}
              >
                {showPlanner ? '← Back to Chat' : '📅 Plan My Trip (Custom Itinerary)'}
              </button>

              <AnimatePresence>
                {showPlanner && (
                  <motion.div 
                    className="planner-form"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="planner-field">
                      <label>Trip Duration: <strong>{plannerData.days} Days</strong></label>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={plannerData.days}
                        onChange={(e) => setPlannerData(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="planner-interests-label">Interests:</div>
                    <div className="planner-interests">
                      {Object.keys(plannerData.interests).map(interest => (
                        <label key={interest} className={`interest-chip ${plannerData.interests[interest] ? 'active' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={plannerData.interests[interest]}
                            onChange={() => handleInterestToggle(interest)}
                            style={{ display: 'none' }}
                          />
                          {interest}
                        </label>
                      ))}
                    </div>
                    {plannerError && <div className="planner-error">{plannerError}</div>}
                    <button 
                      className="generate-btn" 
                      onClick={handlePlannerSubmit}
                      disabled={plannerLoading}
                    >
                      {plannerLoading ? 'Generating Itinerary...' : '✨ Generate Itinerary'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="input-row">
                <input
                  type="text"
                  placeholder={destination ? `Ask about ${destination.name}...` : "Ask a travel question..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                />
                <button 
                  className="send-btn" 
                  onClick={handleSend}
                  disabled={isTyping || !inputValue.trim()}
                  aria-label="Send message"
                >
                  →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChat;
