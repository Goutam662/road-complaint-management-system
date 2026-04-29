/**
 * Fetch route from OSRM API
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {Promise<Array>} Array of [lat, lng] points along the route, or empty array on failure
 */
export const fetchOSRMRoute = async (lat1, lng1, lat2, lng2) => {
  try {
    // OSRM API expects coordinates as [lng, lat] format
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`OSRM API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    // Check if route was found
    if (data.code !== 'Ok') {
      console.warn(`OSRM route not found: ${data.code}`);
      return [];
    }

    // Check if routes exist
    if (!data.routes || data.routes.length === 0) {
      console.warn('OSRM returned no routes');
      return [];
    }

    // Extract coordinates from the first route
    const geometry = data.routes[0].geometry;
    
    if (!geometry || !geometry.coordinates) {
      console.warn('OSRM route has no geometry coordinates');
      return [];
    }

    // Convert OSRM coordinates from [lng, lat] to [lat, lng]
    const routePath = geometry.coordinates
      .filter((coordinate) => Array.isArray(coordinate) && coordinate.length >= 2)
      .map(([lng, lat]) => [lat, lng]);

    return routePath;
  } catch (error) {
    console.error('Error fetching OSRM route:', error);
    return [];
  }
};

/**
 * Get route distance and duration from OSRM
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {Promise<Object>} Object with distance (meters) and duration (seconds)
 */
export const getRouteInfo = async (lat1, lng1, lat2, lng2) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=false`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return { distance: 0, duration: 0 };
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return { distance: 0, duration: 0 };
    }

    return {
      distance: data.routes[0].distance,
      duration: data.routes[0].duration
    };
  } catch (error) {
    console.error('Error fetching route info:', error);
    return { distance: 0, duration: 0 };
  }
};
