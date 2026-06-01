// src/hooks/useSessionStream.jsx
import { useState, useEffect } from 'react';

export function useSessionStream() {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchLiveFeed() {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/session/live');
        const data = await res.json();
        
        if (isMounted && data.drivers) {
          setDrivers(data.drivers);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("BFF streaming node error:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    // Initial fetch handshake
    fetchLiveFeed();

    // Poll the Python BFF server every 500ms for fresh telemetry telemetry numbers
    const interval = setInterval(fetchLiveFeed, 500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return { drivers, isLoading, error };
}