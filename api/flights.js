export default async function handler(req, res) {
  // Enable CORS for client calls
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { origin, destination, date } = req.query;

  if (!destination) {
    return res.status(400).json({ error: 'Destination IATA airport code is required.' });
  }

  const apiKey = process.env.AVIATIONSTACK_KEY;
  if (!apiKey) {
    return res.status(200).json({
      status: 'demo',
      warning: 'AVIATIONSTACK_KEY not configured in environment variables.',
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
        }
      ]
    });
  }

  try {
    const queryParams = new URLSearchParams({
      access_key: apiKey,
      arr_iata: destination,
      limit: '10'
    });

    if (origin) {
      queryParams.append('dep_iata', origin);
    }
    if (date) {
      queryParams.append('flight_date', date);
    }

    const response = await fetch(`http://api.aviationstack.com/v1/flights?${queryParams.toString()}`);

    if (response.status === 429) {
      return res.status(429).json({
        error: 'Aviationstack monthly free-tier rate limit reached (100 req/mo). Please try again later.'
      });
    }

    if (!response.ok) {
      throw new Error(`Aviationstack error ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      if (data.error.code === 'usage_limit_reached') {
        return res.status(429).json({
          error: 'Aviationstack monthly request quota has been reached on this key.'
        });
      }
      throw new Error(data.error.message || 'Aviationstack lookup failed.');
    }

    const flights = (data.data || []).map(f => ({
      flightNumber: f.flight?.iata || f.flight?.number || 'N/A',
      airline: f.airline?.name || 'Commercial Airline',
      departure: {
        airport: f.departure?.iata || origin || 'DEP',
        time: f.departure?.scheduled ? new Date(f.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled',
        terminal: f.departure?.terminal || '-'
      },
      arrival: {
        airport: f.arrival?.iata || destination,
        time: f.arrival?.scheduled ? new Date(f.arrival.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled',
        terminal: f.arrival?.terminal || '-'
      },
      status: f.flight_status || 'Scheduled'
    }));

    return res.status(200).json({
      status: 'success',
      flights
    });
  } catch (err) {
    console.error('Flights proxy error:', err);
    return res.status(500).json({
      error: 'Could not fetch flight data right now. Please try again.'
    });
  }
}
