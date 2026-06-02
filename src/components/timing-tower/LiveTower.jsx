import React from 'react';

export default function LiveTower({ lap, drivers, onSelectDriver, selectedDriver }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-carbon-600 pb-2 mb-3">
        <h2 className="text-xs font-bold text-gray-400 tracking-widest uppercase">Position</h2>
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Lap: {lap}</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {drivers.map((driver) => {
          const isSelected = selectedDriver === driver.code;
          return (
            <button
              key={driver.code}
              onClick={() => onSelectDriver(driver.code)}
              className={`w-full flex items-center justify-between p-2 text-left rounded text-xs border transition-all ${
                isSelected 
                  ? 'border-team-primary bg-team-primary/10' 
                  : 'border-carbon-600 bg-carbon-900/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="w-4 text-gray-500 text-right font-bold">{driver.position}</span>
                <span 
                  className="w-1 h-3 rounded-sm" 
                  style={{ backgroundColor: driver.teamColor }}
                />
                <span className="font-bold text-white uppercase">{driver.code}</span>
              </div>
              <span className="font-mono text-gray-400">{driver.gap}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}