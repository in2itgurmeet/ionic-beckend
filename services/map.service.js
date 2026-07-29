const axios = require('axios');

/**
 * Geocodes an address string to coordinates using Nominatim API (OpenStreetMap).
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lon: number}|null>}
 */
exports.geocodeAddress = async (address) => {
  try {
    if (!address) return null;
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'LogisticsApp/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null; // Fallback to null if API fails
  }
};

/**
 * Calculates route distance and duration between two coordinates using OSRM API.
 * @param {{lat: number, lon: number}} pickupCoords 
 * @param {{lat: number, lon: number}} deliveryCoords 
 * @returns {Promise<{distanceKm: number, durationMinutes: number}|null>}
 */
exports.calculateRoute = async (pickupCoords, deliveryCoords) => {
  try {
    if (!pickupCoords || !deliveryCoords) return null;
    
    // OSRM format: {longitude},{latitude}
    const coordsStr = `${pickupCoords.lon},${pickupCoords.lat};${deliveryCoords.lon},${deliveryCoords.lat}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=false`;
    
    const response = await axios.get(url);
    
    if (response.data && response.data.code === 'Ok' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const distanceKm = route.distance / 1000;
      const durationMinutes = route.duration / 60;
      
      return {
        distanceKm: Math.round(distanceKm),
        durationMinutes: Math.round(durationMinutes)
      };
    }
    return null;
  } catch (error) {
    console.error('OSRM Route error:', error.message);
    return null;
  }
};
