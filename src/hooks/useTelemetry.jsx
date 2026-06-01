import { useState, useEffect } from 'react';

// high-fidelity mock stream representing a high-speed acceleration zone turning into a heavy braking zone
const MOCK_TELEMETRY_TRACK = [
  { speed: 88, rpm: 11200, n_gear: 1, throttle: 100, brake: 0, drs: 12 },
  { speed: 298, rpm: 11450, n_gear: 7, throttle: 100, brake: 0, drs: 12 },
  { speed: 312, rpm: 11800, n_gear: 8, throttle: 100, brake: 0, drs: 12 },
  { speed: 324, rpm: 12100, n_gear: 8, throttle: 100, brake: 0, drs: 12 },
  { speed: 331, rpm: 12350, n_gear: 8, throttle: 100, brake: 0, drs: 12 }, // Peak Speed
  { speed: 310, rpm: 11500, n_gear: 8, throttle: 40,  brake: 30, drs: 0 },  // Lift off / Initial braking
  { speed: 260, rpm: 10200, n_gear: 6, throttle: 0,   brake: 100, drs: 0 }, // Hard Braking Zone
  { speed: 195, rpm: 9100,  n_gear: 4, throttle: 0,   brake: 100, drs: 0 },
  { speed: 140, rpm: 8400,  n_gear: 3, throttle: 0,   brake: 85,  drs: 0 },
  { speed: 98,  rpm: 7200,  n_gear: 2, throttle: 5,   brake: 20,  drs: 0 },  // Apex entry
  { speed: 85,  rpm: 6800,  n_gear: 2, throttle: 25,  brake: 0,  drs: 0 },  // Mid-corner apex
  { speed: 110, rpm: 7900,  n_gear: 2, throttle: 65,  brake: 0,  drs: 0 },  // Corner exit acceleration
  { speed: 145, rpm: 8900,  n_gear: 3, throttle: 100, brake: 0,  drs: 0 },
  { speed: 185, rpm: 9800,  n_gear: 4, throttle: 100, brake: 0,  drs: 0 },
  { speed: 220, rpm: 10400, n_gear: 5, throttle: 100, brake: 0,  drs: 0 },
];

export function useTelemetry(driverNumber = 16, isLive = false) {
  const [telemetryData, setTelemetryData] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;
    let isMounted = true;

    // Simulate an instant API telemetry connection handshake
    setIsLoading(true);
    setError(null);

    let index = 0;
    
    // 270ms Interval maps perfectly to the 3.7Hz feed frequency of live F1 telemetry units
    intervalId = setInterval(() => {
      if (!isMounted) return;

      // Pull base track data frame
      const baseFrame = MOCK_TELEMETRY_TRACK[index];
      
      // Inject minor variance scaling factors depending on the driver focused
      // This allows us to see numerical offsets when toggling between LEC and RUS
      const varianceModifier = driverNumber === 16 ? 1.0 : 0.96;
      
      const realTimeFrame = {
        ...baseFrame,
        speed: Math.round(baseFrame.speed * varianceModifier),
        rpm: Math.round(baseFrame.rpm * varianceModifier),
        date: new Date().toISOString(),
        driver_number: driverNumber
      };

      setCurrentFrame(realTimeFrame);
      
      // Keep rolling buffer fixed at 30 entries for real-time visual chart rendering
      setTelemetryData(prev => [...prev.slice(-30), realTimeFrame]);
      
      index = (index + 1) % MOCK_TELEMETRY_TRACK.length; // Infinite loop track loop
      setIsLoading(false);
    }, 270);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [driverNumber]);

  return { telemetryData, currentFrame, isLoading, error };
}