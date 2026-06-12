import { useEffect, useState } from "react";

export default function useTrackData() {

  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadTrack() {

      try {

        const res = await fetch(
          "http://127.0.0.1:8000/api/session/track"
        );

        const data = await res.json();

        setTrack(data);

      } catch (error) {

        console.error(
          "Failed to load track",
          error
        );

      } finally {

        setLoading(false);

      }

    }

    loadTrack();

  }, []);

  return {
    track,
    loading,
  };

}