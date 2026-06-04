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
        {drivers.map((driver) => {

          if (
            driver.x === null ||
            driver.y === null
          ) {
            return null;
          }

          return (
            <motion.g
              key={driver.code}
              animate={{
                x: driver.x,
                y: driver.y,
              }}
              transition={{
                type: "tween",
                ease: "linear",
                duration: 0.25,
              }}
            >
              <circle
                r="10"
                fill={driver.teamColor}
              />

              <text
                y="-14"
                fill="white"
                fontSize="10"
                textAnchor="middle"
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