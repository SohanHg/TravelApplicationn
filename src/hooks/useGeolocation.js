import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [status, setStatus] = useState('idle'); // idle | loading | granted | denied | error
  const [locationName, setLocationName] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        setStatus('granted');
        
        // Reverse geocode to get location name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'User-Agent': 'TravelPlanner/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
            setLocationName(city);
          }
        } catch (e) {
          // Non-critical, just won't show name
        }
      },
      (err) => {
        if (err.code === 1) {
          setStatus('denied');
        } else {
          setStatus('error');
        }
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  return { location, status, locationName, requestLocation };
}
