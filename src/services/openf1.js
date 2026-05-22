const OPENF1_BASE_URL = 'https://api.openf1.org/v1';

/**
 * Core utility to handle API requests and format query parameters cleanly.
 * @param {string} endpoint - The target endpoint (e.g., '/car_data')
 * @param {Object} [params={}] - Key-value pairs for query parameters
 */
async function openF1Fetch(endpoint, params = {}) {
  // Ensure the endpoint starts with a forward slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Construct URL with query parameters
  const url = new URL(`${OPENF1_BASE_URL}${cleanEndpoint}`);
  
  // Cleanly append query parameters, filtering out null/undefined values
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Next.js specific or standard fetch cache options can be added here if needed
    });

    if (!response.ok) {
      throw new Error(`OpenF1 API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[OpenF1 Service Failure] ${cleanEndpoint}:`, error);
    throw error;
  }
}

/**
 * Dedicated API Endpoints mapped to OpenF1 Documentation
 */
export const openF1Client = {
  /**
   * Get session details (useful to find the active session_key)
   * @param {Object} [params] - Filter by year, country_name, circuit_short_name, etc.
   */
  getSessions: (params) => openF1Fetch('/sessions', params),

  /**
   * Get driver information for a session
   * @param {Object} params - e.g., { session_key: 9567, driver_number: 16 }
   */
  getDrivers: (params) => openF1Fetch('/drivers', params),

  /**
   * Get real-time/historical car telemetry (RPM, Speed, Throttle, Brake, Gear, DRS)
   * @param {Object} params - Must include session_key. Can filter by driver_number and dates.
   */
  getCarData: (params) => openF1Fetch('/car_data', params),

  /**
   * Get live timing data (Lap times, sector times, pit stops)
   * @param {Object} params - e.g., { session_key: 9567, driver_number: 4 }
   */
  getLapData: (params) => openF1Fetch('/laps', params),

  /**
   * Get interval data between cars on track
   * @param {Object} params - { session_key: 9567 }
   */
  getIntervals: (params) => openF1Fetch('/intervals', params),

  /**
   * Get active track signals / Flag status (Red, Yellow, Green, VSC)
   * @param {Object} params - { session_key: 9567 }
   */
  getRaceControl: (params) => openF1Fetch('/race_control', params),
};