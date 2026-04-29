import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { fetchOSRMRoute, getRouteInfo } from '../utils/osrmRoute';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const defaultCenter = [20.5937, 78.9629];

const ClickHandler = ({ onMapClick, isDrawingLocked }) => {
  useMapEvents({
    click(e) {
      if (!isDrawingLocked) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });

  return null;
};

const RecenterMap = ({ center }) => {
  const map = useMap();

  React.useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 15);
    }
  }, [center, map]);

  return null;
};

const normalizePath = (path) => {
  if (!Array.isArray(path)) {
    return [];
  }

  return path.filter(
    (point) => point && Number.isFinite(point.lat) && Number.isFinite(point.lng)
  );
};

const LocationPicker = ({ selectedPath = [], onPathChange, onRouteChange }) => {
  const [drawMode, setDrawMode] = useState('segment');
  const [isDrawingFinished, setIsDrawingFinished] = useState(false);
  const [routePath, setRoutePath] = useState([]);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [searchCenter, setSearchCenter] = useState(null);
  const safePath = normalizePath(selectedPath);

  const handleLocationSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Enter a place name to search.');
      setSearchResults([]);
      return;
    }

    setIsSearchingLocation(true);
    setSearchError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Unable to search this location right now.');
      }

      const results = await response.json();
      if (!Array.isArray(results) || results.length === 0) {
        setSearchResults([]);
        setSearchError('No matching place found. Try a more specific location.');
        return;
      }

      const normalizedResults = results
        .map((item) => ({
          lat: Number(item?.lat),
          lng: Number(item?.lon),
          label: item?.display_name || 'Unknown location'
        }))
        .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));

      if (normalizedResults.length === 0) {
        setSearchResults([]);
        setSearchError('No valid coordinates found for this search.');
        return;
      }

      setSearchResults(normalizedResults);
      setSearchCenter({ lat: normalizedResults[0].lat, lng: normalizedResults[0].lng });
    } catch (error) {
      setSearchResults([]);
      setSearchError(error.message || 'Location search failed. Please try again.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    setSearchCenter({ lat: result.lat, lng: result.lng });
  };

  // Fetch OSRM route when both start and end points are selected
  useEffect(() => {
    if (drawMode === 'segment' && safePath.length === 2) {
      const fetchRoute = async () => {
        setIsFetchingRoute(true);
        setRouteError('');

        const path = await fetchOSRMRoute(
          safePath[0].lat,
          safePath[0].lng,
          safePath[1].lat,
          safePath[1].lng
        );

        if (path && path.length > 0) {
          setRoutePath(path);
          if (onRouteChange) {
            onRouteChange(path);
          }

          // Get route distance and duration info
          const info = await getRouteInfo(
            safePath[0].lat,
            safePath[0].lng,
            safePath[1].lat,
            safePath[1].lng
          );
          setRouteInfo(info);
        } else {
          setRouteError('Could not find route. Connection might be blocked or points too far apart.');
          setRoutePath([]);
          setRouteInfo({ distance: 0, duration: 0 });
        }

        setIsFetchingRoute(false);
      };

      fetchRoute();
      return;
    }

    setRoutePath([]);
    setRouteError('');
    setRouteInfo({ distance: 0, duration: 0 });
    if (onRouteChange) {
      onRouteChange([]);
    }
  }, [safePath, drawMode, onRouteChange]);

  const center = useMemo(() => {
    if (safePath.length > 0) {
      return [safePath[0].lat, safePath[0].lng];
    }

    return defaultCenter;
  }, [safePath]);

  const appendPoint = (point) => {
    if (drawMode === 'segment') {
      if (safePath.length >= 2) {
        return;
      }

      onPathChange([...safePath, point]);
      if (safePath.length + 1 >= 2) {
        setIsDrawingFinished(true);
      }
      return;
    }

    onPathChange([...safePath, point]);
  };

  const handleReset = () => {
    onPathChange([]);
    setIsDrawingFinished(false);
    setRoutePath([]);
    setRouteError('');
    setRouteInfo({ distance: 0, duration: 0 });
  };

  const handleFinishDrawing = () => {
    setIsDrawingFinished(true);
  };

  const handleDrawModeChange = (mode) => {
    setDrawMode(mode);
    setIsDrawingFinished(false);
    onPathChange([]);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        appendPoint({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Geolocation failed:', error.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isDrawingLocked = isDrawingFinished || (drawMode === 'segment' && safePath.length >= 2);

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${drawMode === 'segment' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleDrawModeChange('segment')}
        >
          Segment (Start/End)
        </button>
        <button
          type="button"
          className={`btn ${drawMode === 'path' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => handleDrawModeChange('path')}
        >
          Multi-Point Path
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleUseCurrentLocation}>
          Use My Current Location
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          Reset Selection
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleFinishDrawing}
          disabled={safePath.length < 2 || isDrawingFinished}
        >
          Finish Drawing
        </button>
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location on map (e.g., Main Chowk Kathua)"
            style={{ flex: '1 1 280px' }}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleLocationSearch}
            disabled={isSearchingLocation}
          >
            {isSearchingLocation ? 'Searching...' : 'Search Place'}
          </button>
        </div>

        {searchError && (
          <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#ffebee', borderRadius: 4, color: '#d32f2f' }}>
            {searchError}
          </div>
        )}

        {searchResults.length > 0 && (
          <div style={{ marginTop: '0.5rem', border: '1px solid #e0e0e0', borderRadius: 6, maxHeight: 160, overflowY: 'auto', backgroundColor: '#fff' }}>
            {searchResults.map((result, index) => (
              <button
                key={`${result.lat}-${result.lng}-${index}`}
                type="button"
                onClick={() => handleSelectSearchResult(result)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderBottom: index === searchResults.length - 1 ? 'none' : '1px solid #f0f0f0',
                  padding: '0.6rem 0.75rem',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {result.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {isFetchingRoute && (
        <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#e3f2fd', borderRadius: 4, color: '#1976d2' }}>
          <strong>Fetching route...</strong>
        </div>
      )}

      {routeError && (
        <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#ffebee', borderRadius: 4, color: '#d32f2f' }}>
          <strong>Error:</strong> {routeError}
        </div>
      )}

      <div style={{ marginTop: '0.75rem', borderRadius: 8, overflow: 'hidden' }}>
        <MapContainer center={center} zoom={13} style={{ height: 320, width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {searchCenter && <RecenterMap center={searchCenter} />}
          <ClickHandler onMapClick={appendPoint} isDrawingLocked={isDrawingLocked} />
          {safePath.length > 0 && (
            <>
              <Marker position={[safePath[0].lat, safePath[0].lng]} />
              {safePath.length > 1 && <Marker position={[safePath[safePath.length - 1].lat, safePath[safePath.length - 1].lng]} />}
              
              {/* Segment mode uses only OSRM routePath; path mode uses drawn polyline */}
              {drawMode === 'segment' ? (
                routePath.length > 1 && (
                  <Polyline
                    positions={routePath}
                    color="#2196f3"
                    weight={5}
                    opacity={0.8}
                  />
                )
              ) : (
                safePath.length > 1 && (
                  <Polyline
                    positions={safePath.map((p) => [p.lat, p.lng])}
                    color="#d32f2f"
                    weight={5}
                    dashArray="5, 5"
                  />
                )
              )}

              <RecenterMap center={safePath[safePath.length - 1]} />
            </>
          )}
        </MapContainer>
      </div>

      {safePath.length > 0 && (
        <div className="help-text" style={{ marginTop: '0.5rem' }}>
          <p>
            {drawMode === 'segment'
              ? `Start: ${safePath[0].lat.toFixed(6)}, ${safePath[0].lng.toFixed(6)}${safePath[1] ? ` | End: ${safePath[1].lat.toFixed(6)}, ${safePath[1].lng.toFixed(6)}` : ''}`
              : `Points selected: ${safePath.length}`}
          </p>
          
          {routePath.length > 1 && (
            <p style={{ color: '#2196f3', fontWeight: 'bold' }}>
              ✓ Route found
              {routeInfo.distance > 0 && ` | Distance: ${routeInfo.distance >= 1000 ? (routeInfo.distance / 1000).toFixed(2) + ' km' : Math.round(routeInfo.distance) + ' m'}`}
              {routeInfo.duration > 0 && ` | Duration: ${Math.round(routeInfo.duration / 60)} min`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
