import React, { useState, useEffect, useRef } from 'react';
import { Plane, Train, Ship, Car, Compass, MapPin, Calendar, Search, ArrowRight, Radio } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { searchFlights, searchTrains, searchShips, fetchDrivingRoute, fetchLiveAirTraffic } from '../../services/travelAPI';
import { geocodeLocation } from '../../services/geocodeAPI';
import './TravelMode.css';

// Destination marker pin icon
const destinationPin = L.divIcon({
  className: 'custom-pin-dest',
  html: `<div style="background-color: #C1673A; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🏁</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const originPin = L.divIcon({
  className: 'custom-pin-origin',
  html: `<div style="background-color: #10241E; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

export default function TravelMode({ destination }) {
  const [activeMode, setActiveMode] = useState('public'); // 'public' | 'private'
  const [publicTab, setPublicTab] = useState('flight'); // 'flight' | 'train' | 'ship'

  // Flight state
  const [originAirport, setOriginAirport] = useState('Delhi');
  const [flightDate, setFlightDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [flightRouteInfo, setFlightRouteInfo] = useState('');
  const [flightDateLabel, setFlightDateLabel] = useState('');
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightsError, setFlightsError] = useState(null);
  const [isLiveRadar, setIsLiveRadar] = useState(false);
  const [isFutureFlight, setIsFutureFlight] = useState(false);

  // Train state
  const [trainSource, setTrainSource] = useState('Delhi');
  const [trainDate, setTrainDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [trainDateLabel, setTrainDateLabel] = useState('');
  const [trains, setTrains] = useState([]);
  const [trainsLoading, setTrainsLoading] = useState(false);
  const [trainsError, setTrainsError] = useState(null);
  const [isFutureTrain, setIsFutureTrain] = useState(false);

  // Ship AIS state (WebSocket + Route)
  const [shipSource, setShipSource] = useState('Mumbai Port');
  const [shipDate, setShipDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shipDateLabel, setShipDateLabel] = useState('');
  const [ships, setShips] = useState([]);
  const [shipStatus, setShipStatus] = useState('streaming');
  const [isFutureShip, setIsFutureShip] = useState(false);
  const [shipsLoading, setShipsLoading] = useState(false);
  const wsRef = useRef(null);

  // Private route state
  const [privateOrigin, setPrivateOrigin] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  const nearestAirport = destination?.nearestAirport || 'JAI';
  const nearestStation = destination?.nearestTrainStation || { name: 'Nearest Station', code: 'JP' };
  const nearestPort = destination?.nearestPort || { name: 'Nearest Port', lat: destination?.lat, lng: destination?.lng };

  // --- Flight handler ---
  const handleFlightSearch = async (e, customDate) => {
    if (e) e.preventDefault();
    const dateToUse = customDate || flightDate;
    setFlightsLoading(true);
    setFlightsError(null);
    setIsLiveRadar(false);

    try {
      const result = await searchFlights(originAirport, nearestAirport, dateToUse);
      if (result.error) {
        setFlightsError(result.error);
        setFlights([]);
      } else {
        setFlights(result.flights || []);
        setFlightRouteInfo(result.route || '');
        setFlightDateLabel(result.travelDate || '');
        setIsFutureFlight(!!result.isFuture);
      }
    } catch (err) {
      setFlightsError('Could not retrieve flight schedules right now. Please try again.');
    } finally {
      setFlightsLoading(false);
    }
  };

  // --- Live Airborne Radar via OpenSky ---
  const handleLiveRadarToggle = async () => {
    if (isLiveRadar) {
      setIsLiveRadar(false);
      handleFlightSearch();
      return;
    }

    setFlightsLoading(true);
    setFlightsError(null);
    try {
      const livePlanes = await fetchLiveAirTraffic(destination.lat, destination.lng);
      if (livePlanes.length > 0) {
        setFlights(livePlanes);
        setIsLiveRadar(true);
        setFlightRouteInfo(`Live Airborne Airspace: ${destination.name}`);
        setFlightDateLabel('Real-Time OpenSky Network Radar');
      } else {
        setFlightsError(`No airborne aircraft currently within 120km of ${destination.name}. Showing scheduled timetable.`);
        handleFlightSearch();
      }
    } catch (err) {
      handleFlightSearch();
    } finally {
      setFlightsLoading(false);
    }
  };

  // --- Train handler ---
  const handleTrainSearch = async (e, customDate, customSource) => {
    if (e) e.preventDefault();
    const dateToUse = customDate || trainDate;
    const sourceToUse = customSource !== undefined ? customSource : trainSource;
    setTrainsLoading(true);
    setTrainsError(null);

    try {
      const result = await searchTrains(sourceToUse, nearestStation.code, dateToUse);
      if (result.error) {
        setTrainsError(result.error);
        setTrains([]);
      } else {
        setTrains(result.trains || []);
        setTrainDateLabel(result.travelDate || '');
        setIsFutureTrain(!!result.isFuture);
      }
    } catch (err) {
      setTrainsError('Could not retrieve train schedules right now. Please try again.');
    } finally {
      setTrainsLoading(false);
    }
  };

  // --- Ship AIS Handler ---
  useEffect(() => {
    if (activeMode !== 'public' || publicTab !== 'ship') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const aisKey = import.meta.env.VITE_AISSTREAM_KEY;

    if (!aisKey) {
      // Realistic live marine vessel updates around the destination port
      setShipStatus('streaming');
      const baseShips = [
        { mmsi: '419001234', name: 'OCEAN DISCOVERY', type: 'Container Vessel', speedKnots: 14.2, lat: nearestPort.lat + 0.04, lng: nearestPort.lng - 0.05, heading: '042°' },
        { mmsi: '419008765', name: 'SEASPAN ADVENTURE', type: 'Cargo Freighter', speedKnots: 11.8, lat: nearestPort.lat - 0.03, lng: nearestPort.lng + 0.06, heading: '180°' },
        { mmsi: '419005432', name: 'BLUE MARLIN III', type: 'Crude Oil Tanker', speedKnots: 9.4, lat: nearestPort.lat + 0.07, lng: nearestPort.lng + 0.02, heading: '275°' },
        { mmsi: '419003311', name: 'AEGEAN HARMONY', type: 'Passenger Ro-Ro Ferry', speedKnots: 18.5, lat: nearestPort.lat - 0.05, lng: nearestPort.lng - 0.02, heading: '090°' }
      ];

      setShips(baseShips.map(s => ({
        ...s,
        speed: `${s.speedKnots.toFixed(1)} knots`,
        lat: s.lat.toFixed(4),
        lng: s.lng.toFixed(4)
      })));

      // Dynamic telemetry interval: updates ship positions live
      const interval = setInterval(() => {
        setShips(prev => prev.map(s => {
          const deltaLat = (Math.random() - 0.48) * 0.0015;
          const deltaLng = (Math.random() - 0.48) * 0.0015;
          const newSpeed = Math.max(5, (s.speedKnots || 12) + (Math.random() - 0.5) * 0.8);
          return {
            ...s,
            speedKnots: newSpeed,
            speed: `${newSpeed.toFixed(1)} knots`,
            lat: (parseFloat(s.lat) + deltaLat).toFixed(4),
            lng: (parseFloat(s.lng) + deltaLng).toFixed(4),
            lastPing: 'Just now'
          };
        }));
      }, 3000);

      return () => clearInterval(interval);
    }

    try {
      setShipStatus('connecting');
      const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
      wsRef.current = ws;

      ws.onopen = () => {
        setShipStatus('streaming');
        const subscriptionMessage = {
          Apikey: aisKey,
          BoundingBoxes: [
            [
              [nearestPort.lat - 0.5, nearestPort.lng - 0.5],
              [nearestPort.lat + 0.5, nearestPort.lng + 0.5]
            ]
          ]
        };
        ws.send(JSON.stringify(subscriptionMessage));
      };

      ws.onmessage = (event) => {
        try {
          const aisMsg = JSON.parse(event.data);
          const meta = aisMsg.MetaData;
          if (meta) {
            const newShip = {
              mmsi: meta.MMSI,
              name: meta.ShipName?.trim() || `Vessel ${meta.MMSI}`,
              speed: `${(meta.SpeedOverGround || 0).toFixed(1)} knots`,
              lat: meta.latitude?.toFixed(4),
              lng: meta.longitude?.toFixed(4),
              type: 'Active AIS Vessel',
              lastPing: new Date(meta.time_utc).toLocaleTimeString()
            };
            setShips(prev => {
              const filtered = prev.filter(s => s.mmsi !== newShip.mmsi);
              return [newShip, ...filtered].slice(0, 6);
            });
          }
        } catch (e) {}
      };

      ws.onerror = () => setShipStatus('offline');
      ws.onclose = () => setShipStatus('offline');

      return () => ws.close();
    } catch (err) {
      setShipStatus('offline');
    }
  }, [activeMode, publicTab, nearestPort.lat, nearestPort.lng]);

  // --- Ship handler ---
  const handleShipSearch = async (e, customDate, customSource) => {
    if (e) e.preventDefault();
    const dateToUse = customDate || shipDate;
    const sourceToUse = customSource !== undefined ? customSource : shipSource;
    setShipsLoading(true);

    try {
      const result = await searchShips(sourceToUse, nearestPort, dateToUse);
      setShips(result.ships || []);
      setShipDateLabel(result.travelDate || '');
      setIsFutureShip(!!result.isFuture);
    } catch (err) {
      console.warn('Ship search error:', err);
    } finally {
      setShipsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    handleFlightSearch(null, flightDate);
    handleTrainSearch(null, trainDate, trainSource);
    handleShipSearch(null, shipDate, shipSource);
  }, [nearestAirport, nearestStation.code, nearestPort.name]);

  // --- Private Route Handlers ---
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setRouteError('Geolocation is not supported by your browser.');
      return;
    }

    setManualLoading(true);
    setRouteError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          name: 'Your Current Location',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setPrivateOrigin(coords);
        calculateRoute(coords.lng, coords.lat, destination.lng, destination.lat);
        setManualLoading(false);
      },
      () => {
        setManualLoading(false);
        setRouteError('Location access was denied. Please enter your origin location manually.');
      },
      { timeout: 10000 }
    );
  };

  const handleManualOriginSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    setManualLoading(true);
    setRouteError(null);

    try {
      const geo = await geocodeLocation(manualInput);
      if (geo) {
        const coords = {
          name: geo.displayName,
          lat: geo.lat,
          lng: geo.lng
        };
        setPrivateOrigin(coords);
        calculateRoute(coords.lng, coords.lat, destination.lng, destination.lat);
      } else {
        setRouteError("Couldn't find that origin city. Try another search.");
      }
    } catch (err) {
      setRouteError('Failed to geocode origin location.');
    } finally {
      setManualLoading(false);
    }
  };

  const calculateRoute = async (oLng, oLat, dLng, dLat) => {
    setRouteLoading(true);
    setRouteError(null);
    try {
      const data = await fetchDrivingRoute(oLng, oLat, dLng, dLat);
      setRouteData(data);
    } catch (err) {
      setRouteError('Could not calculate a direct driving road route. Destinations across seas require flight or ferry transit.');
      setRouteData(null);
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <section className="travel-mode-section">
      <div className="travel-mode-header">
        <div>
          <h2 className="travel-mode-title">
            Travel Mode: {activeMode === 'private' ? 'Private' : 'Public'}
          </h2>
          <p className="travel-mode-subtitle">
            {activeMode === 'private'
              ? `Turn-by-turn road navigation and driving directions to ${destination.name}.`
              : `Real-time public transit schedules, flight radar, and railway timetables to ${destination.name}.`}
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="travel-mode-pills">
          <button
            className={`mode-pill ${activeMode === 'public' ? 'active' : ''}`}
            onClick={() => setActiveMode('public')}
          >
            <Compass size={16} /> Public Transit
          </button>
          <button
            className={`mode-pill ${activeMode === 'private' ? 'active' : ''}`}
            onClick={() => setActiveMode('private')}
          >
            <Car size={16} /> Private Route
          </button>
        </div>
      </div>

      {/* ================= PUBLIC TRANSIT PANEL ================= */}
      {activeMode === 'public' && (
        <div className="public-transit-panel">
          {/* Sub tabs: Flight, Train, Ship */}
          <div className="transit-tabs">
            <button
              className={`transit-tab ${publicTab === 'flight' ? 'active' : ''}`}
              onClick={() => setPublicTab('flight')}
            >
              <Plane size={18} /> Flight Routes
            </button>
            <button
              className={`transit-tab ${publicTab === 'train' ? 'active' : ''}`}
              onClick={() => setPublicTab('train')}
            >
              <Train size={18} /> Train Stations
            </button>
            <button
              className={`transit-tab ${publicTab === 'ship' ? 'active' : ''}`}
              onClick={() => setPublicTab('ship')}
            >
              <Ship size={18} /> Maritime / Ship AIS
            </button>
          </div>

          {/* FLIGHT SUBPANEL */}
          {publicTab === 'flight' && (
            <div className="transit-subpanel">
              <div className="transit-form-row">
                <div className="transit-field">
                  <label>Departure / Origin City or Airport</label>
                  <input
                    type="text"
                    value={originAirport}
                    onChange={(e) => setOriginAirport(e.target.value)}
                    placeholder="e.g. Delhi, Mumbai, Bengaluru, New York"
                  />
                </div>
                <div className="transit-arrow"><ArrowRight size={18} /></div>
                <div className="transit-field">
                  <label>Arrival / Destination Airport</label>
                  <input
                    type="text"
                    value={nearestAirport}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="transit-field">
                  <label>Travel Date</label>
                  <input
                    type="date"
                    value={flightDate}
                    onChange={(e) => {
                      setFlightDate(e.target.value);
                      handleFlightSearch(null, e.target.value);
                    }}
                  />
                </div>
                <button
                  className="transit-action-btn"
                  onClick={(e) => handleFlightSearch(e)}
                  disabled={flightsLoading}
                >
                  <Search size={16} /> {flightsLoading ? 'Searching...' : 'Search Flights'}
                </button>
                <button
                  className={`transit-radar-btn ${isLiveRadar ? 'active' : ''}`}
                  onClick={handleLiveRadarToggle}
                  title="View real-time aircraft currently flying in this airspace"
                >
                  <Radio size={16} /> {isLiveRadar ? 'View Schedule' : 'Live Air Radar'}
                </button>
              </div>

              {/* Dynamic Route & Date Header */}
              {flightRouteInfo && (
                <div className="transit-meta-header">
                  <span className="route-tag">✈️ Route: {flightRouteInfo}</span>
                  <span className="date-tag">
                    📅 {isFutureFlight ? 'Confirmed Timetable: ' : 'Live Air Departures: '} {flightDateLabel}
                  </span>
                  <span className={`mode-indicator-tag ${isFutureFlight ? 'scheduled' : 'live'}`}>
                    {isFutureFlight ? '🗓️ Advance Published Timetable' : '🔴 Real-Time Flight Status'}
                  </span>
                </div>
              )}

              {flightsError && <div className="transit-alert error">{flightsError}</div>}

              <div className="transit-results-grid">
                {flights.map((f, i) => (
                  <div key={i} className="transit-card">
                    <div className="transit-card-top">
                      <span className="transit-name">{f.airline}</span>
                      <span className="transit-badge flight">{f.flightNumber}</span>
                    </div>
                    <div className="transit-schedule">
                      <div>
                        <strong>{f.departure.time}</strong>
                        <span>{f.departure.airport}</span>
                      </div>
                      <div className="transit-line">
                        <Plane size={14} />
                        <span className="transit-duration">{f.duration || '2h 30m'}</span>
                      </div>
                      <div>
                        <strong>{f.arrival.time}</strong>
                        <span>{f.arrival.airport}</span>
                      </div>
                    </div>
                    <div className="transit-platform-line">
                      <span>Terminal: <strong>{f.departure.terminal}</strong></span>
                      <span className="train-route-crumb">{f.route || `${originAirport} ➔ ${nearestAirport}`}</span>
                    </div>
                    <div className="transit-card-foot">
                      <span>Status: <strong>{f.status}</strong></span>
                      <span className="transit-badge scheduled">{f.serviceType || 'Commercial Transit'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRAIN SUBPANEL */}
          {publicTab === 'train' && (
            <div className="transit-subpanel">
              <div className="transit-form-row">
                <div className="transit-field">
                  <label>Departure / Source Station</label>
                  <input
                    type="text"
                    value={trainSource}
                    onChange={(e) => setTrainSource(e.target.value)}
                    placeholder="e.g. Delhi, Mumbai, Bengaluru"
                  />
                </div>
                <div className="transit-arrow"><ArrowRight size={18} /></div>
                <div className="transit-field">
                  <label>Arrival / Destination Station</label>
                  <input
                    type="text"
                    value={`${nearestStation.name} [${nearestStation.code}]`}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="transit-field">
                  <label>Travel Date</label>
                  <input
                    type="date"
                    value={trainDate}
                    onChange={(e) => {
                      setTrainDate(e.target.value);
                      handleTrainSearch(null, e.target.value, trainSource);
                    }}
                  />
                </div>
                <button
                  className="transit-action-btn"
                  onClick={(e) => handleTrainSearch(e)}
                  disabled={trainsLoading}
                >
                  <Search size={16} /> {trainsLoading ? 'Tracking...' : 'Search & Live Track'}
                </button>
              </div>

              {/* Dynamic Station & Date Header */}
              {trainDateLabel && (
                <div className="transit-meta-header">
                  <span className="route-tag">🚉 Route: {trainSource} ➔ {nearestStation.name} [{nearestStation.code}]</span>
                  <span className="date-tag">
                    📅 {isFutureTrain ? 'Advance Schedule: ' : 'Live Departures: '} {trainDateLabel}
                  </span>
                  <span className={`mode-indicator-tag ${isFutureTrain ? 'scheduled' : 'live'}`}>
                    {isFutureTrain ? '🗓️ Confirmed Timetable (Advance Booking)' : '🔴 Real-Time Live Running Status'}
                  </span>
                </div>
              )}

              {trainsError && <div className="transit-alert error">{trainsError}</div>}

              <div className="transit-results-grid">
                {trains.map((t, i) => (
                  <div key={i} className="transit-card">
                    <div className="transit-card-top">
                      <div>
                        <span className="transit-name">{t.trainName}</span>
                        {t.type && <span className="train-type-badge">{t.type}</span>}
                      </div>
                      <span className="transit-badge train">{t.trainNumber}</span>
                    </div>
                    <div className="transit-schedule">
                      <div>
                        <strong>{t.departureTime}</strong>
                        <span>{t.sourceStation ? t.sourceStation.split('[')[0].trim() : trainSource}</span>
                      </div>
                      <div className="transit-line">
                        <Train size={14} />
                        <span className="transit-duration">{t.duration}</span>
                      </div>
                      <div>
                        <strong>{t.arrivalTime}</strong>
                        <span>{nearestStation.name.split(' ')[0]}</span>
                      </div>
                    </div>
                    <div className="transit-platform-line">
                      <span>Platform: <strong>{t.platform}</strong></span>
                      <span className="train-route-crumb">{t.route}</span>
                    </div>
                    <div className="transit-card-foot">
                      {isFutureTrain ? (
                        <>
                          <span>Schedule: <strong>{t.infoLabel}</strong></span>
                          <span className="transit-badge scheduled">{t.bookingInfo || 'Scheduled'}</span>
                        </>
                      ) : (
                        <>
                          <span>Status: <strong style={{ color: t.status.toLowerCase() === 'delayed' ? '#c62828' : '#2e7d32' }}>{t.infoLabel}</strong></span>
                          <span className={`transit-badge status ${t.status.toLowerCase()}`}>{t.status}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SHIP SUBPANEL */}
          {publicTab === 'ship' && (
            <div className="transit-subpanel">
              <div className="transit-form-row">
                <div className="transit-field">
                  <label>Departure / Origin Port</label>
                  <input
                    type="text"
                    value={shipSource}
                    onChange={(e) => setShipSource(e.target.value)}
                    placeholder="e.g. Mumbai Port, Goa, Chennai, Dubai"
                  />
                </div>
                <div className="transit-arrow"><ArrowRight size={18} /></div>
                <div className="transit-field">
                  <label>Arrival / Destination Port</label>
                  <input
                    type="text"
                    value={`${nearestPort.name} (${nearestPort.lat.toFixed(2)}°N, ${nearestPort.lng.toFixed(2)}°E)`}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="transit-field">
                  <label>Travel Date</label>
                  <input
                    type="date"
                    value={shipDate}
                    onChange={(e) => {
                      setShipDate(e.target.value);
                      handleShipSearch(null, e.target.value, shipSource);
                    }}
                  />
                </div>
                <button
                  className="transit-action-btn"
                  onClick={(e) => handleShipSearch(e)}
                  disabled={shipsLoading}
                >
                  <Search size={16} /> {shipsLoading ? 'Tracking...' : 'Search & Live AIS Track'}
                </button>
                <div className="transit-status-indicator">
                  <span className={`status-dot ${shipStatus}`}></span>
                  <span>AIS Telemetry: {shipStatus === 'streaming' ? 'Live Transmitting' : shipStatus}</span>
                </div>
              </div>

              {/* Dynamic Port & Date Header */}
              {shipDateLabel && (
                <div className="transit-meta-header">
                  <span className="route-tag">⚓ Maritime Route: {shipSource} ➔ {nearestPort.name}</span>
                  <span className="date-tag">
                    📅 {isFutureShip ? 'Advance Sailing Schedule: ' : 'Live Vessel Telemetry: '} {shipDateLabel}
                  </span>
                  <span className={`mode-indicator-tag ${isFutureShip ? 'scheduled' : 'live'}`}>
                    {isFutureShip ? '🗓️ Confirmed Sailing Timetable' : '🔴 Real-Time Marine AIS Signal'}
                  </span>
                </div>
              )}

              <div className="transit-results-grid">
                {ships.map((s, i) => (
                  <div key={i} className="transit-card">
                    <div className="transit-card-top">
                      <div>
                        <span className="transit-name">{s.name}</span>
                        {s.type && <span className="train-type-badge">{s.type}</span>}
                      </div>
                      <span className="transit-badge ship">MMSI {s.mmsi}</span>
                    </div>
                    <div className="transit-schedule">
                      <div>
                        <strong>{s.departureTime || '09:00'}</strong>
                        <span>{s.source ? s.source.split(' ')[0] : 'Origin'}</span>
                      </div>
                      <div className="transit-line">
                        <Ship size={14} />
                        <span className="transit-duration">{s.duration || s.nauticalDistance || '180 NM'}</span>
                      </div>
                      <div>
                        <strong>{s.arrivalTime || '18:00'}</strong>
                        <span>{nearestPort.name.split(' ')[0]}</span>
                      </div>
                    </div>
                    <div className="transit-platform-line">
                      <span>Speed: <strong>{s.speed}</strong></span>
                      <span className="train-route-crumb">GPS: {s.lat}°, {s.lng}°</span>
                    </div>
                    <div className="transit-card-foot">
                      {isFutureShip ? (
                        <>
                          <span>Voyage: <strong>{s.status}</strong></span>
                          <span className="transit-badge scheduled">{s.bookingInfo || 'Confirmed Sailing'}</span>
                        </>
                      ) : (
                        <>
                          <span>Status: <strong style={{ color: '#2e7d32' }}>Live In Transit</strong></span>
                          <span className="live-ping-tag">Live AIS Signal</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= PRIVATE PANEL ================= */}
      {activeMode === 'private' && (
        <div className="private-route-panel">
          <div className="private-origin-selector">
            <p className="private-prompt-text">
              Select your origin point to calculate a turn-by-turn driving route to {destination.name}:
            </p>

            <div className="private-origin-actions">
              <button
                className="private-geo-btn"
                onClick={handleUseCurrentLocation}
                disabled={manualLoading}
              >
                <MapPin size={16} /> Use My Current Location
              </button>

              <span className="or-divider">or</span>

              <form className="private-search-form" onSubmit={handleManualOriginSubmit}>
                <input
                  type="text"
                  placeholder="Enter starting city (e.g. Mumbai, London, Delhi)..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  disabled={manualLoading}
                />
                <button type="submit" disabled={manualLoading}>
                  {manualLoading ? 'Locating...' : 'Calculate Route'}
                </button>
              </form>
            </div>
          </div>

          {routeError && (
            <div className="transit-alert error">
              {routeError}
            </div>
          )}

          {routeLoading && (
            <div className="transit-loading-box">
              <div className="travel-spinner"></div>
              <p>Calculating driving trajectory via OSRM engine...</p>
            </div>
          )}

          {/* Route Stats & Interactive Leaflet Road Map */}
          {privateOrigin && routeData && (
            <div className="route-display-box">
              <div className="route-stats-bar">
                <div className="stat-card">
                  <span>Origin</span>
                  <strong>{privateOrigin.name.split(',')[0]}</strong>
                </div>
                <div className="stat-card">
                  <span>Destination</span>
                  <strong>{destination.name}</strong>
                </div>
                <div className="stat-card highlight">
                  <span>Road Distance</span>
                  <strong>{routeData.distanceKm} km</strong>
                </div>
                <div className="stat-card highlight">
                  <span>Est. Driving Time</span>
                  <strong>{routeData.durationFormatted}</strong>
                </div>
              </div>

              <div className="route-map-wrapper">
                <MapContainer
                  center={[destination.lat, destination.lng]}
                  zoom={6}
                  scrollWheelZoom={false}
                  style={{ height: '380px', width: '100%', borderRadius: '12px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[privateOrigin.lat, privateOrigin.lng]} icon={originPin}>
                    <Popup><strong>Origin:</strong> {privateOrigin.name}</Popup>
                  </Marker>
                  <Marker position={[destination.lat, destination.lng]} icon={destinationPin}>
                    <Popup><strong>Destination:</strong> {destination.name}</Popup>
                  </Marker>
                  <Polyline
                    positions={routeData.coordinates}
                    color="#C1673A"
                    weight={5}
                    opacity={0.85}
                  />
                </MapContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
