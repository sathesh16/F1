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
        {Object.values(drivers).map((driver, index) => {
          // Calculate driver's tracking offset safely against the track array size
          const nodeIndex = (index * 15 + Math.floor(Math.random() * 5)) % circuitPath.length;
          const node = circuitPath[nodeIndex];

          if (!node) return null;

          let teamColor = '#00D26A';
          if (driver.code === 'LEC') teamColor = '#E80020'; // Ferrari Red
          if (driver.code === 'VER') teamColor = '#3671C6'; 
          if (driver.code === 'NOR') teamColor = '#FF8000';
          if (driver.code === 'HAM') teamColor = '#27F4D2';

          return (
            <motion.g
              key={driver.code}
              animate={{ x: node.x, y: node.y }}
              transition={{ type: "spring", stiffness: 70, damping: 12 }}
            >
              <circle r="16" fill={teamColor} opacity="0.3" className="animate-ping" />
              <circle r="10" fill={teamColor} stroke="#FFFFFF" strokeWidth="2" />
              <text
                y="-15"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="black"
                fontFamily="sans-serif"
                textAnchor="middle"
                className="bg-carbon-900 px-1 rounded font-bold"
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