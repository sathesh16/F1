import React, { useState } from 'react';

export default function DashboardIndex() {
  // Simple simulator state for testing dynamic team changes
  const [activeTeam, setActiveTeam] = useState('theme-ferrari');

  const handleTeamChange = (themeClass) => {
    // Update the body class directly to transition CSS custom properties seamlessly
    document.body.className = `${themeClass} antialiased bg-carbon-800 text-gray-100 font-mono`;
    setActiveTeam(themeClass);
  };

  return (
    <div className="min-h-screen flex flex-col bg-carbon-900 text-gray-100">
      
      {/* HEADER / SESSION RIBBON */}
      <header className="border-b border-carbon-600 bg-carbon-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="h-3 w-3 rounded-full bg-neon-green animate-pulse" />
          <h1 className="text-lg font-bold tracking-wider uppercase">
            Live Telemetry Control Room
          </h1>
        </div>
        
        {/* Prototype Theme Toggles (Simulating dynamic grid customization) */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-400">Active Identity:</span>
          <button 
            onClick={() => handleTeamChange('theme-ferrari')}
            className={`px-3 py-1 border transition-all ${activeTeam === 'theme-ferrari' ? 'border-neon-red bg-neon-red/10 text-white' : 'border-carbon-600 text-gray-400 hover:text-white'}`}
          >
            SF-24
          </button>
          <button 
            onClick={() => handleTeamChange('theme-mercedes')}
            className={`px-3 py-1 border transition-all ${activeTeam === 'theme-mercedes' ? 'border-team-primary bg-team-primary/10 text-white' : 'border-carbon-600 text-gray-400 hover:text-white'}`}
          >
            W15
          </button>
          <button 
            onClick={() => handleTeamChange('theme-mclaren')}
            className={`px-3 py-1 border transition-all ${activeTeam === 'theme-mclaren' ? 'border-team-primary bg-team-primary/10 text-white' : 'border-carbon-600 text-gray-400 hover:text-white'}`}
          >
            MCL38
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 p-4 gap-4">
        
        {/* TIMING TOWER / SYSTEM RADAR SLOT */}
        <aside className="xl:col-span-1 bg-carbon-700 border border-carbon-600 rounded p-4 flex flex-col space-y-4">
          <div className="border-b border-carbon-600 pb-2">
            <h2 className="text-sm font-bold text-gray-400 tracking-widest uppercase">
               Timing Tower
            </h2>
          </div>
          <div className="flex-1 flex items-center justify-center border border-dashed border-carbon-600 rounded bg-carbon-800/50 p-6 text-center text-xs text-gray-500">
            Placeholder: components/timing-tower/LiveTower.jsx
          </div>
        </aside>

        {/* MODULAR TELEMETRY BLOCKS */}
        <main className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Real-time Telemetry Graph Slot */}
          <section className="bg-carbon-700 border border-carbon-600 rounded p-4 flex flex-col h-[300px] md:h-auto shadow-neon-glow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold tracking-wide uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-team-primary inline-block rounded-sm"></span>
                Throttle & Brake Input
              </h3>
              <span className="text-[10px] bg-carbon-600 text-neon-red px-2 py-0.5 rounded font-bold">LIVE</span>
            </div>
            <div className="flex-1 flex items-center justify-center border border-dashed border-carbon-600 rounded bg-carbon-800/50 text-xs text-gray-500">
              Placeholder: components/telemetry/TelemetryChart.jsx
            </div>
          </section>

          {/* Canvas Engine G-Force/RPM Matrix Slot */}
          <section className="bg-carbon-700 border border-carbon-600 rounded p-4 flex flex-col h-[300px] md:h-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold tracking-wide uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-purple inline-block rounded-sm"></span>
                G-Force / Sector Diagnostics
              </h3>
              <span className="text-[10px] bg-carbon-600 text-neon-purple px-2 py-0.5 rounded font-bold">240 Hz</span>
            </div>
            <div className="flex-1 flex items-center justify-center border border-dashed border-carbon-600 rounded bg-carbon-800/50 text-xs text-gray-500">
              Placeholder: components/telemetry/GForceCanvas.jsx
            </div>
          </section>

          {/* Global Race Metadata / Alerts Console */}
          <section className="md:col-span-2 bg-carbon-700 border border-carbon-600 rounded p-4 flex flex-col h-40">
            <div className="mb-2">
              <h3 className="text-sm font-bold text-neon-yellow tracking-wide uppercase">
                ▲ Race Control Notifications
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-xs text-gray-400 space-y-1 p-2 bg-carbon-900 border border-carbon-600 rounded">
              <p><span className="text-neon-yellow">[14:02:11]</span> SAFETY CAR DEPLOYED — SECTOR 2</p>
              <p><span className="text-gray-500">[14:02:45]</span> Telemetry Stream Sync: API Latency 14ms</p>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}