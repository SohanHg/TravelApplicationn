export async function geocodeLocation(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'TravelPlanner/1.0' } }
    );
    if (!res.ok) throw new Error('Geocode request failed');
    const data = await res.json();
    
    if (data.length === 0) return null;
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name.split(',').slice(0, 2).join(',')
    };
  } catch (err) {
    console.error('Geocoding failed:', err);
    throw err;
  }
}
