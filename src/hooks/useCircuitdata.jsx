// src/hooks/useCircuitData.jsx
import { useState, useEffect } from 'react';

export function useCircuitData(locationName = "Spa") {
  const [circuitPath, setCircuitPath] = useState([]);
  const [viewBox, setViewBox] = useState("0 0 500 500");
  const [trackMetaData, setTrackMetaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchFastF1Circuit() {
      setIsLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/circuit?location=${locationName}`);
        const data = await res.json();

        if (isMounted && data.points) {
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

          // Process the zero-centered points to establish sizing constraints
          data.points.forEach((pt) => {
            if (pt.x < minX) minX = pt.x; if (pt.x > maxX) maxX = pt.x;
            if (pt.y < minY) minY = pt.y; if (pt.y > maxY) maxY = pt.y;
          });

          const width = maxX - minX;
          const height = maxY - minY;
          const padding = Math.max(width, height) * 0.15; // Balanced padding layout padding

          setViewBox(`${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`);
          setCircuitPath(data.points);
          setTrackMetaData({ name: data.track_name, country: data.country });
        }
      } catch (err) {
        console.error("FastF1 circuit mesh data down link failed:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchFastF1Circuit();
    return () => { isMounted = false; };
  }, [locationName]);

  return { circuitPath, viewBox, trackMetaData, isLoading };
}