import { useState, useEffect } from 'react';
import { openF1Client } from '../services/openf1';

export function useTelemetry(sessionKey, driverNumber) {
  const [telemetry, setTelemetry] = useState([]);

  useEffect(() => {
    if (!sessionKey || !driverNumber) return;

    async function fetchLatestData() {
      try {
        const data = await openF1Client.getCarData({
          session_key: sessionKey,
          driver_number: driverNumber,
          // You can pass specific timestamp thresholds here to get only recent chunks
        });
        setTelemetry(data);
      } catch (err) {
        console.error("Error updates failed", err);
      }
    }

    // Initial fetch
    fetchLatestData();

    // Polling setup for live timing emulation (OpenF1 refreshes frequently)
    const interval = setInterval(fetchLatestData, 2000); 
    return () => clearInterval(interval);
  }, [sessionKey, driverNumber]);

  return telemetry;
}