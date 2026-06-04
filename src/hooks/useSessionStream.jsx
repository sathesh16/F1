import { useState, useEffect } from "react";

const API_URL = "http://127.0.0.1:8000";

export function useSessionStream() {
  const [session, setSession] = useState(null);
  const [race, setRace] = useState(null);
  const [drivers, setDrivers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchLiveFeed() {
    try {
      const response = await fetch(
        `${API_URL}/api/session/live`
      );

      const data = await response.json();

      setSession(data.session);
      setRace(data.race);
      setDrivers(data.drivers || []);

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Backend unavailable");
    } finally {
      setIsLoading(false);
    }
  }

  async function resetSession() {
    try {
      await fetch(
        `${API_URL}/api/session/reset`
      );

      await fetchLiveFeed();
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchLiveFeed();

    const interval = setInterval(
      fetchLiveFeed,
      300
    );

    return () => clearInterval(interval);
  }, []);

  return {
    session,
    race,
    drivers,
    isLoading,
    error,
    resetSession,
  };
}