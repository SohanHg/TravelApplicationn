export async function fetchWeather(lat, lng) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;
  
  // Try OpenWeather first
  if (apiKey) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
      );
      if (res.ok) {
        const data = await res.json();
        return {
          tempC: Math.round(data.main.temp),
          condition: data.weather[0].main,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
          icon: data.weather[0].icon,
          source: 'openweather'
        };
      }
      // If 401, fall through to Open-Meteo
      if (res.status !== 401) throw new Error('OpenWeather error');
    } catch (err) {
      console.warn('OpenWeather failed, falling back to Open-Meteo:', err.message);
    }
  }
  
  // Fallback: Open-Meteo (free, no key)
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
    );
    if (!res.ok) throw new Error('Open-Meteo error');
    const data = await res.json();
    const cw = data.current_weather;
    
    const weatherCodes = {
      0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Rime Fog', 51: 'Light Drizzle', 53: 'Drizzle',
      55: 'Heavy Drizzle', 61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
      71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow', 80: 'Light Showers',
      81: 'Showers', 82: 'Heavy Showers', 95: 'Thunderstorm'
    };
    
    return {
      tempC: Math.round(cw.temperature),
      condition: weatherCodes[cw.weathercode] || 'Unknown',
      description: weatherCodes[cw.weathercode] || 'Unknown conditions',
      humidity: null,
      windSpeed: Math.round(cw.windspeed),
      icon: null,
      source: 'open-meteo'
    };
  } catch (err) {
    throw new Error('All weather services failed: ' + err.message);
  }
}
