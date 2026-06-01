import React from 'react';

export default function WheelDisplay({ telemetry }) {
  if (!telemetry) return null;

  return (
    <div className="bg-carbon-900 border border-carbon-600 rounded p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* RPM Shift Light Strip indicator simulation */}
      <div className="w-full flex gap-1 mb-3 justify-center">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className={`h-2 w-full rounded-sm transition-colors ${
              telemetry.rpm > 11000 && i > 7 ? 'bg-neon-red animate-pulse' :
              telemetry.rpm > 8000 && i > 4 ? 'bg-neon-purple' :
              i <= Math.floor((telemetry.rpm / 13000) * 10) ? 'bg-neon-green' : 'bg-carbon-600'
            }`}
          />
        ))}
      </div>
      
      {/* Digital Cockpit readout */}
      <div className="text-center">
        <span className="text-[10px] text-gray-500 block font-bold uppercase tracking-widest">GEAR</span>
        <span className="text-5xl font-black text-neon-yellow line-height-none block my-1">{telemetry.gear}</span>
        <div className="flex gap-4 mt-2 text-xs">
          <div>
            <span className="text-gray-400 block text-[9px]">SPEED</span>
            <span className="text-md font-bold text-white">{telemetry.speed} <span className="text-[9px] text-gray-500">KM/H</span></span>
          </div>
          <div className="border-l border-carbon-600 pl-4">
            <span className="text-gray-400 block text-[9px]">RPM</span>
            <span className="text-md font-bold text-white">{telemetry.rpm}</span>
          </div>
        </div>
      </div>
    </div>
  );
}