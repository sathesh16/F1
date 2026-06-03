import { useState, useEffect } from 'react';

export function useSessionStream() {
  const [drivers, setDrivers] = useState([]);
  const [lap, setLap] = useState(0);
  const [totalLaps, setTotalLaps] = useState(0); // Added to track total laps from backend
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchLiveFeed() {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/session/live');
      const data = await res.json();

      if (data.drivers) {
        setLap(data.current_lap);
        setTotalLaps(data.total_laps || 0); // Capture the new total_laps value
        setDrivers(data.drivers);
        setError(null);
      }
    } catch (err) {
      console.error("BFF streaming node error:", err);
      setError("Failed to stream telemetry updates.");
    } finally {
      setIsLoading(false);
    }
  }

  // Infused Reset Functionality
  async function resetSession() {
    try {
      setIsLoading(true); // Show a quick loading state while backend re-caches Lap 1
      const res = await fetch('http://127.0.0.1:8000/api/session/reset');
      const data = await res.json();

      if (data.status === "success") {
        console.log("Telemetry simulation rolled back successfully.");
        // Instantly force-refresh the data matrix so the UI snaps back to Lap 1 immediately
        await fetchLiveFeed();
      }
    } catch (err) {
      console.error("BFF streaming node reset error:", err);
      setError("Failed to execute simulation reset.");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // Initial fetch handshake
    fetchLiveFeed();

    // Poll the Python BFF server every 300ms for fresh telemetry numbers
    const interval = setInterval(fetchLiveFeed, 300);

    return () => {
      clearInterval(interval);
    };
  }, []); // Keeps your clean 300ms polling lifecycle intact

  // Exposed totalLaps and resetSession to the rest of your app
  return { lap, totalLaps, drivers, isLoading, error, resetSession };
}