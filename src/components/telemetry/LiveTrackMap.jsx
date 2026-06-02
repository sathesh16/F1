import React from 'react';
import { motion } from 'framer-motion';
import { useCircuitData } from '@/hooks/useCircuitdata';

export default function LiveTrackMap({ drivers }) {
  // Pull vector shapes seamlessly from our Python BFF engine running on port 8000
  const { circuitPath, viewBox, trackMetaData, isLoading } = useCircuitData("Spa");

  if (isLoading || !circuitPath || circuitPath.length === 0) {
    return (
      <div className="w-full h-[300px] flex flex-col items-center justify-center bg-carbon-900 border border-carbon-600 rounded text-xs text-gray-500 space-y-2">
        <div className="w-6 h-6 border-2 border-t-transparent border-neon-green rounded-full animate-spin" />
        <span>Synchronizing FastF1 Matrix Coordinates...</span>
      </div>
    );
  }

  // Create the instruction command string for the SVG vector canvas path
  const svgLineData = circuitPath
    .map((pt, index) => `${index === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ') + ' Z';

  return (
    <div className="relative w-full h-full bg-carbon-900 rounded border border-carbon-600 p-6 flex flex-col items-center justify-center min-h-[340px]">

      {/* Dynamic Header Badge readouts */}
      <div className="absolute top-3 left-3 flex flex-col">
        <span className="text-[11px] font-bold text-white uppercase tracking-wider">
          {trackMetaData?.name || "Loading Track..."}
        </span>
        <span className="text-[9px] text-gray-500 uppercase">
          GPS Transponder Vector Map Layer
        </span>
      </div>

      <svg
        viewBox={viewBox}
        className="w-full h-auto max-h-[260px] drop-shadow-[0_0_15px_rgba(0,210,106,0.05)]"
      >
        {/* Core Asphalt Vector Underlay Line */}
        <path
          d={svgLineData}
          fill="none"
          stroke="#1F1F23"
          strokeWidth="35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Active Driver Racing Track Guideline */}
        <path
          d={svgLineData}
          fill="none"
          stroke="#3F3F46"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* DRIVER TRANSPONDER DOT INDICATORS */}
        {Object.values(drivers).map((driver) => {

          // CRITICAL FIX: Base the index node completely on the sequential timeline index 'driver.x'
          // and loop it smoothly if it exceeds the circuit path length.
          // No random math, no arbitrary shifts.
          const nodeIndex = Number(driver.x) % circuitPath.length;
          const node = circuitPath[nodeIndex];

          // Shield rendering engine if coordinate points are momentarily undefined
          if (!node) return null;

          let teamColor = '#00D26A';
          if (driver.code === 'LEC') teamColor = '#E80020'; // Ferrari Red
          if (driver.code === 'VER') teamColor = '#3671C6'; // Red Bull Blue
          if (driver.code === 'NOR') teamColor = '#FF8000'; // McLaren Orange
          if (driver.code === 'HAM') teamColor = '#27F4D2'; // Mercedes Teal

          return (
            <motion.g
              key={driver.code}
              // Re-architect frames to use sleek linear transitions to match true car velocities
              animate={{ x: node.x, y: node.y }}
              transition={{ type: "tween", ease: "linear", duration: 0.5 }}
            >
              {/* Visual Indicator Layer Rings */}
              <circle r="14" fill={teamColor} opacity="0.25" />
              <circle r="8" fill={teamColor} stroke="#FFFFFF" strokeWidth="2" />

              {/* High contrast text badge elements */}
              <text
                y="-14"
                fill="#FFFFFF"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
                className="bg-carbon-900"
              >
                {driver.code}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}