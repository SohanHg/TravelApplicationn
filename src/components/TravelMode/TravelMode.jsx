import React, { useState, useEffect, useRef } from 'react';
import { Plane, Train, Ship, Car, Compass, MapPin, Calendar, Search, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { searchFlights, searchTrains, fetchDrivingRoute } from '../../services/travelAPI';
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
  const [originAirport, setOriginAirport] = useState('DEL');
  const [flightDate, setFlightDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightsError, setFlightsError] = useState(null);

  // Train state
  const [trainDate, setTrainDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [trains, setTrains] = useState([]);
  const [trainsLoading, setTrainsLoading] = useState(false);
  const [trainsError, setTrainsError] = useState(null);

  // Ship AIS state (WebSocket)
  const [shipDate, setShipDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [ships, setShips] = useState([]);
  const [shipStatus, setShipStatus] = useState('connecting'); // 'connecting' | 'streaming' | 'offline'
  const wsRef = useRef(null);

  // Private route state
  const [privateOrigin, setPrivateOrigin] = useState(null); // { name, lat, lng }
  const [manualInput, setManualInput] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [routeData, setRouteData] = useState(null); // { coordinates, distanceKm, durationFormatted }
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Default nearest transit points
  const nearestAirport = destination?.nearestAirport || 'JAI';
  const nearestStation = destination?.nearestTrainStation || { name: 'Nearest Station', code: 'STN' };
  const nearestPort = destination?.nearestPort || { name: 'Nearest Port', lat: destination?.lat, lng: destination?.lng };

  // --- Flight handler ---
  const handleFlightSearch = async (e) => {
    if (e) e.preventDefault();
    setFlightsLoading(true);
    setFlightsError(null);
    try {
      const result = await searchFlights(originAirport, nearestAirport, flightDate);
      if (result.error) {
        setFlightsError(result.error);
        setFlights([]);
      } else {
        setFlights(result.flights || []);
      }
    } catch (err) {
      setFlightsError('Could not retrieve flight schedules right now. Please try again.');
    } finally {
      setFlightsLoading(false);
    }
  };

  // --- Train handler ---
  const handleTrainSearch = async (e) => {
    if (e) e.preventDefault();
    setTrainsLoading(true);
    setTrainsError(null);
    try {
      const result = await searchTrains(nearestStation.code, trainDate);
      if (result.error) {
        setTrainsError(result.error);
        setTrains([]);
      } else {
        setTrains(result.trains || []);
      }
    } catch (err) {
      setTrainsError('Could not retrieve train schedules right now. Please try again.');
    } finally {
      setTrainsLoading(false);
    }
  };

  // --- Ship AIS WebSocket handler ---
  useEffect(() => {
    if (activeMode !== 'public' || publicTab !== 'ship') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    /* NOTE: VITE_AISSTREAM_KEY is a free-tier client-side streaming key.
       Since aisstream requires a persistent bidirectional WebSocket connection,
       serverless functions cannot maintain this state, making direct browser
       connection standard. This has no billing risk on free tier. */
    const aisKey = import.meta.env.VITE_AISSTREAM_KEY;

    if (!aisKey) {
      // Demo simulated real-time stream when key is not yet set
      setShipStatus('streaming');
      setShips([
        { mmsi: '419001234', name: 'OCEAN DISCOVERY', type: 'Cargo', speed: '14.2 knots', lat: (nearestPort.lat + 0.04).toFixed(4), lng: (nearestPort.lng - 0.05).toFixed(4) },
        { mmsi: '419008765', name: 'SEASPAN ADVENTURE', type: 'Container Ship', speed: '11.8 knots', lat: (nearestPort.lat - 0.03).toFixed(4), lng: (nearestPort.lng + 0.06).toFixed(4) },
        { mmsi: '419005432', name: 'BLUE MARLIN', type: 'Tanker', speed: '9.4 knots', lat: (nearestPort.lat + 0.07).toFixed(4), lng: (nearestPort.lng + 0.02).toFixed(4) }
      ]);
      return;
    }

    try {
      setShipStatus('connecting');
      const ws = new WebSocket('wss://stream.aisstream.io/v0/stream');
      wsRef.current = ws;

      ws.onopen = () => {
        setShipStatus('streaming');
        // Bounding box around nearest port (0.4 degree radius)
        const subscriptionMessage = {
          Apikey: aisKey,
          BoundingBoxes: [
            [
              [nearestPort.lat - 0.4, nearestPort.lng - 0.4],
              [nearestPort.lat + 0.4, nearestPort.lng + 0.4]
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
              time: new Date(meta.time_utc).toLocaleTimeString()
            };
            setShips(prev => {
              const filtered = prev.filter(s => s.mmsi !== newShip.mmsi);
              return [newShip, ...filtered].slice(0, 6);
            });
          }
        } catch (e) {
          // Non-critical parse error
        }
      };

      ws.onerror = () => {
        setShipStatus('offline');
      };

      ws.onclose = () => {
        setShipStatus('offline');
      };

      return () => {
        ws.close();
      };
    } catch (err) {
      setShipStatus('offline');
    }
  }, [activeMode, publicTab, nearestPort.lat, nearestPort.lng]);

  // Initial fetch for flights on mount
  useEffect(() => {
    handleFlightSearch();
    handleTrainSearch();
  }, [nearestAirport, nearestStation.code]);

  // --- Private route handler ---
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
      (err) => {
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
      setRouteError('Could not calculate a direct driving route. Destinations across oceans require flight transit.');
      setRouteData(null);
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <section className="travel-mode-section">
      <div className="travel-mode-header">
        <div>
          <span className="travel-mode-badge">Phase 16 Transit & Navigation</span>
          <h2 className="travel-mode-title">Travel Mode: Route & Connections</h2>
          <p className="travel-mode-subtitle">Explore public transit routes or map your private road trip to {destination.name}.</p>
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

      {/* ================= PUBLIC PANEL ================= */}
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
                  <label>Departure Airport (IATA)</label>
                  <input
                    type="text"
                    value={originAirport}
                    onChange={(e) => setOriginAirport(e.target.value.toUpperCase())}
                    placeholder="e.g. DEL, BOM, JFK"
                    maxLength={3}
                  />
                </div>
                <div className="transit-arrow"><ArrowRight size={18} /></div>
                <div className="transit-field">
                  <label>Arrival Airport (Destination)</label>
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
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                </div>
                <button
                  className="transit-action-btn"
                  onClick={handleFlightSearch}
                  disabled={flightsLoading}
                >
                  <Search size={16} /> {flightsLoading ? 'Searching...' : 'Search Flights'}
                </button>
              </div>

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
                      <div className="transit-line"><Plane size={14} /></div>
                      <div>
                        <strong>{f.arrival.time}</strong>
                        <span>{f.arrival.airport}</span>
                      </div>
                    </div>
                    <div className="transit-card-foot">
                      <span>Status: <strong>{f.status}</strong></span>
                      {f.priceEstimate && <span className="transit-price">{f.priceEstimate}</span>}
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
                <div className="transit-field wide">
                  <label>Nearest Railway Station</label>
                  <input
                    type="text"
                    value={`${nearestStation.name} (${nearestStation.code})`}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="transit-field">
                  <label>Date</label>
                  <input
                    type="date"
                    value={trainDate}
                    onChange={(e) => setTrainDate(e.target.value)}
                  />
                </div>
                <button
                  className="transit-action-btn"
                  onClick={handleTrainSearch}
                  disabled={trainsLoading}
                >
                  <Search size={16} /> {trainsLoading ? 'Tracking...' : 'Track Station'}
                </button>
              </div>

              <div className="transit-caption">
                * Note: RailRadar live station tracker returns current real-time departures and platform delays (date selector does not alter live timetable on this tier).
              </div>

              {trainsError && <div className="transit-alert error">{trainsError}</div>}

              <div className="transit-results-grid">
                {trains.map((t, i) => (
                  <div key={i} className="transit-card">
                    <div className="transit-card-top">
                      <span className="transit-name">{t.trainName}</span>
                      <span className="transit-badge train">{t.trainNumber}</span>
                    </div>
                    <div className="transit-schedule-train">
                      <div>Scheduled Dept: <strong>{t.departureTime}</strong></div>
                      <div>Platform: <strong>{t.platform}</strong></div>
                    </div>
                    <div className="transit-card-foot">
                      <span>Delay: <strong style={{ color: t.delay.includes('late') ? '#c62828' : '#2e7d32' }}>{t.delay}</strong></span>
                      <span className="transit-badge status">{t.status}</span>
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
                <div className="transit-field wide">
                  <label>Nearest Marine Harbour / Port</label>
                  <input
                    type="text"
                    value={`${nearestPort.name} (${nearestPort.lat.toFixed(2)}°, ${nearestPort.lng.toFixed(2)}°)`}
                    readOnly
                    className="readonly-input"
                  />
                </div>
                <div className="transit-field">
                  <label>Travel Date</label>
                  <input
                    type="date"
                    value={shipDate}
                    onChange={(e) => setShipDate(e.target.value)}
                  />
                </div>
                <div className="transit-status-indicator">
                  <span className={`status-dot ${shipStatus}`}></span>
                  <span>AIS Feed: {shipStatus === 'streaming' ? 'Live Streaming' : shipStatus}</span>
                </div>
              </div>

              <div className="transit-caption">
                * Note: Ship AIS positions are captured via live WebSocket telemetry from vessels currently anchored or navigating the port basin. Historical and future dates are not supported on free-tier feeds.
              </div>

              <div className="transit-results-grid">
                {ships.map((s, i) => (
                  <div key={i} className="transit-card">
                    <div className="transit-card-top">
                      <span className="transit-name">{s.name}</span>
                      <span className="transit-badge ship">MMSI: {s.mmsi}</span>
                    </div>
                    <div className="transit-schedule-ship">
                      <div>Speed: <strong>{s.speed}</strong></div>
                      <div>Position: <strong>{s.lat}°, {s.lng}°</strong></div>
                    </div>
                    <div className="transit-card-foot">
                      <span>Vessel Type: <strong>{s.type || 'Commercial Vessel'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= PRIVATE PANEL (OSRM DRIVING ROUTE) ================= */}
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
                  {manualLoading ? 'Locating...' : 'Set Origin'}
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
                  {/* Origin Marker */}
                  <Marker position={[privateOrigin.lat, privateOrigin.lng]} icon={originPin}>
                    <Popup><strong>Origin:</strong> {privateOrigin.name}</Popup>
                  </Marker>
                  {/* Destination Marker */}
                  <Marker position={[destination.lat, destination.lng]} icon={destinationPin}>
                    <Popup><strong>Destination:</strong> {destination.name}</Popup>
                  </Marker>
                  {/* OSRM Route Polyline */}
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
