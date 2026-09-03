/**
 * Travel API service for Phase 16:
 * - Flights (via /api/flights serverless proxy to Aviationstack)
 * - Trains (via /api/trains serverless proxy to RailRadar)
 * - Private Route Driving (via free OSRM engine)
 */

export async function searchFlights(origin, destination, date) {
  try {
    const query = new URLSearchParams({
      destination: destination || '',
      origin: origin || '',
      date: date || ''
    });

    const res = await fetch(`/api/flights?${query.toString()}`);
    if (res.status === 429) {
      return {
        error: 'Aviationstack free-tier rate limit reached (100 req/month). Please check back later.'
      };
    }
    if (!res.ok) {
      throw new Error(`Flight service returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // If running in local Vite dev server where /api/ serverless functions aren't directly mounted without vercel dev:
    console.warn('Local proxy fallback for flights:', err.message);
    return {
      status: 'demo',
      warning: 'Live flight data requires Vercel serverless deployment with AVIATIONSTACK_KEY.',
      flights: [
        {
          flightNumber: 'AI 405',
          airline: 'Air India',
          departure: { airport: origin || 'DEL', time: '08:30', terminal: 'T3' },
          arrival: { airport: destination, time: '10:15', terminal: 'T1' },
          status: 'Scheduled',
          priceEstimate: '$120'
        },
        {
          flightNumber: '6E 214',
          airline: 'IndiGo',
          departure: { airport: origin || 'BOM', time: '14:45', terminal: 'T2' },
          arrival: { airport: destination, time: '16:30', terminal: 'T1' },
          status: 'Active',
          priceEstimate: '$95'
        },
        {
          flightNumber: 'UK 981',
          airline: 'Vistara',
          departure: { airport: origin || 'BLR', time: '19:10', terminal: 'T2' },
          arrival: { airport: destination, time: '21:05', terminal: 'T1' },
          status: 'On Time',
          priceEstimate: '$110'
        }
      ]
    };
  }
}

export async function searchTrains(stationCode, date) {
  try {
    const query = new URLSearchParams({
      stationCode: stationCode || '',
      date: date || ''
    });

    const res = await fetch(`/api/trains?${query.toString()}`);
    if (res.status === 429) {
      return {
        error: 'RailRadar free-tier daily rate limit reached (50 req/day).'
      };
    }
    if (!res.ok) {
      throw new Error(`Train service returned ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Local proxy fallback for trains:', err.message);
    return {
      status: 'demo',
      warning: 'Live train data requires Vercel serverless deployment with RAILRADAR_KEY.',
      note: 'Status-only endpoint (date does not alter live timetable on this tier).',
      trains: [
        {
          trainNumber: '12956',
          trainName: 'Superfast Express',
          departureTime: '14:00',
          platform: 'PF 1',
          status: 'On Time',
          delay: '0 min'
        },
        {
          trainNumber: '12015',
          trainName: 'Shatabdi Express',
          departureTime: '06:10',
          platform: 'PF 3',
          status: 'Active',
          delay: '5 min late'
        },
        {
          trainNumber: '12986',
          trainName: 'AC Double Decker',
          departureTime: '17:35',
          platform: 'PF 2',
          status: 'Scheduled',
          delay: 'On Time'
        }
      ]
    };
  }
}

/**
 * Fetch driving directions from OSRM (Open Source Routing Machine)
 * Coordinates must be [longitude, latitude] for OSRM
 */
export async function fetchDrivingRoute(originLng, originLat, destLng, destLat) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM routing failed: ${res.status}`);

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No driving route found between these locations (could be separated by ocean).');
    }

    const route = data.routes[0];
    const distanceKm = Math.round(route.distance / 1000);
    const totalMinutes = Math.round(route.duration / 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;

    // OSRM returns coordinates as [lng, lat], Leaflet polyline expects [lat, lng]
    const leafletCoordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

    return {
      coordinates: leafletCoordinates,
      distanceKm,
      durationFormatted
    };
  } catch (err) {
    console.error('OSRM route error:', err);
    throw err;
  }
}
