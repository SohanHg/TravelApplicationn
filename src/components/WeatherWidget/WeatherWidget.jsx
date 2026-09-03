import React from 'react';
import { useWeather } from '../../hooks/useWeather';
import './WeatherWidget.css';

const getWeatherIcon = (condition) => {
  if (!condition) return '🌡️';
  const lowerCond = condition.toLowerCase();
  if (lowerCond.includes('clear') || lowerCond.includes('sun')) return '☀️';
  if (lowerCond.includes('partly cloudy') || lowerCond.includes('mainly clear')) return '🌤️';
  if (lowerCond.includes('cloud') || lowerCond.includes('overcast')) return '☁️';
  if (lowerCond.includes('rain') || lowerCond.includes('drizzle') || lowerCond.includes('shower')) return '🌧️';
  if (lowerCond.includes('snow') || lowerCond.includes('ice')) return '❄️';
  if (lowerCond.includes('thunder') || lowerCond.includes('storm')) return '⛈️';
  if (lowerCond.includes('fog') || lowerCond.includes('mist')) return '🌫️';
  return '🌡️';
};

const WeatherWidget = ({ lat, lng }) => {
  const { weather, loading, error } = useWeather(lat, lng);

  if (loading) {
    return (
      <div className="weather-widget loading-skeleton">
        <div className="skeleton-temp"></div>
        <div className="skeleton-cond"></div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="weather-widget error-state">
        <span className="error-icon">☁️</span>
        <p>Weather unavailable right now</p>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <div className="weather-main">
        <div className="weather-icon">{getWeatherIcon(weather.condition)}</div>
        <div className="weather-temp">{weather.tempC}°C</div>
      </div>
      <div className="weather-details">
        <div className="weather-condition">{weather.condition}</div>
        <div className="weather-extra">
          {weather.humidity != null && <span>💧 {weather.humidity}%</span>}
          {weather.windSpeed != null && <span>💨 {weather.windSpeed} km/h</span>}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
