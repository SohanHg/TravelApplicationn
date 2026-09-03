export async function fetchNearbyAttractions(lat, lng, radius = 10000) {
  const query = `
    [out:json][timeout:15];
    (
      node["tourism"="attraction"](around:${radius},${lat},${lng});
      node["tourism"="viewpoint"](around:${radius},${lat},${lng});
      node["tourism"="museum"](around:${radius},${lat},${lng});
      node["historic"](around:${radius},${lat},${lng});
    );
    out body 25;
  `;

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter'
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        lastError = new Error(`Overpass status ${res.status}`);
        continue;
      }

      const data = await res.json();

      // Filter out unnamed POIs
      const attractions = (data.elements || [])
        .filter(el => el.tags && el.tags.name)
        .map(el => ({
          id: el.id,
          name: el.tags.name,
          type: el.tags.tourism || el.tags.historic || 'Attraction',
          lat: el.lat,
          lng: el.lon
        }));

      return attractions;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Failed to fetch nearby attractions');
}
