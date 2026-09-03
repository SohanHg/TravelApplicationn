export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { stationCode, date } = req.query;

  if (!stationCode) {
    return res.status(400).json({ error: 'Station code is required.' });
  }

  const apiKey = process.env.RAILRADAR_KEY;

  if (!apiKey) {
    return res.status(200).json({
      status: 'demo',
      warning: 'RAILRADAR_KEY not configured in environment variables.',
      note: 'Status-only endpoint (date does not alter live timetable on this tier).',
      trains: [
        {
          trainNumber: '12956',
          trainName: 'Jaipur Superfast Express',
          departureTime: '14:00',
          platform: 'PF 1',
          status: 'On Time',
          delay: '0 min'
        },
        {
          trainNumber: '12015',
          trainName: 'Ajmer Shatabdi',
          departureTime: '06:10',
          platform: 'PF 3',
          status: 'Active',
          delay: '5 min late'
        },
        {
          trainNumber: '12986',
          trainName: 'Delhi Sarai Rohilla AC Double Decker',
          departureTime: '17:35',
          platform: 'PF 2',
          status: 'Scheduled',
          delay: 'On Time'
        }
      ]
    });
  }

  try {
    const response = await fetch(`https://railradar.in/api/v1/live-station?code=${encodeURIComponent(stationCode)}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (response.status === 429) {
      return res.status(429).json({
        error: 'RailRadar daily request limit reached (50 requests/day on free tier).'
      });
    }

    if (!response.ok) {
      throw new Error(`RailRadar response ${response.status}`);
    }

    const data = await response.json();
    const rawTrains = data.trains || data.data || [];

    const trains = rawTrains.slice(0, 8).map(t => ({
      trainNumber: t.train_no || t.number || 'EXP',
      trainName: t.train_name || t.name || 'Express Service',
      departureTime: t.dept_time || t.departure || 'Scheduled',
      platform: t.platform ? `PF ${t.platform}` : 'TBD',
      status: t.status || 'Active',
      delay: t.delay || 'On Time'
    }));

    return res.status(200).json({
      status: 'success',
      note: 'Live status endpoint returns current schedule/status only.',
      trains
    });
  } catch (err) {
    console.error('RailRadar proxy error:', err);
    return res.status(500).json({
      error: 'Could not fetch live train data right now. Please try again.'
    });
  }
}
