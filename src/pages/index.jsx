import React, { useState } from 'react';
import { useSessionStream } from '../hooks/useSessionStream';
import LiveTower from '../components/timing-tower/LiveTower';
import WheelDisplay from '../components/telemetry/WheelDisplay';
import LiveTrackMap from '../components/telemetry/LiveTrackMap'; // <-- IMPORT THE MAP

export default function DashboardIndex() {
  // Pull real-time structured telemetry stream data directly from Python BFF
  const { drivers, isLoading, error } = useSessionStream();
  const [selectedDriver, setSelectedDriver] = useState('LEC');

  // Find the telemetry profile of whichever driver the user clicks in the tower
  const activeDriverData = drivers.find(d => d.code === selectedDriver);
  const activeTelemetry = activeDriverData ? {
    speed: activeDriverData.speed,
    rpm: activeDriverData.rpm,
    gear: activeDriverData.gear
  } : null;

  // Format driver items for the timing tower component safely
  const formattedTowerDrivers = drivers.map((drv, idx) => ({
    code: drv.code,
    position: drv.position || idx + 1,
    gap: drv.brake > 0 ? "BRAKING" : `${drv.speed} KM/H`,
    teamColor: drv.code === 'LEC' ? '#E80020' : drv.code === 'VER' ? '#3671C6' : drv.code === 'NOR' ? '#FF8000' : '#27F4D2'
  }));

  return (
    <div className="min-h-screen flex flex-col bg-carbon-900 text-gray-100 font-mono">
      
      {/* GLOBAL HEADER HEADER */}
      <header className="border-b border-carbon-600 bg-carbon-800 px-6 py-4 flex justify-between items-center">
        <h1 className="text-md font-bold tracking-wider uppercase flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-neon-yellow animate-pulse' : 'bg-neon-green'}`}/>
          Grand Stand Matrix // Unified Full-Stack Telemetry
        </h1>
        <span className="text-xs bg-carbon-700 border border-carbon-600 px-3 py-1 rounded text-gray-400">
          BFF Pipeline: <span className="text-neon-green font-bold">ONLINE (127.0.0.1:8000)</span>
        </span>
      </header>

      {/* CORE CONTROL ROOM WORKING GRID */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 p-4 gap-4 overflow-hidden">
        
        {/* SIDE PANEL: MULTI-CAR TIMING TOWER */}
        <aside className="xl:col-span-1 bg-carbon-700 border border-carbon-600 rounded p-4 flex flex-col h-[350px] xl:h-auto">
          <LiveTower 
            drivers={formattedTowerDrivers} 
            selectedDriver={selectedDriver} 
            onSelectDriver={setSelectedDriver} 
          />
        </aside>

        {/* CENTRAL GRAPHICS GRID COCKPIT */}
        <main className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* DIAL TELEMETRY INTERFACE CARD */}
          <section className="bg-carbon-700 border border-carbon-600 rounded p-4 flex flex-col">
            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
              {/* Telemetry Node Focus:  */}
              {selectedDriver}
            </h3>
            <WheelDisplay telemetry={activeTelemetry} />
            
            {/* Live Input Meter bars overlay */}
            {activeDriverData && (
              <div className="mt-4 space-y-2 bg-carbon-900 border border-carbon-600 p-3 rounded text-[11px]">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-neon-green font-bold">THROTTLE</span>
                    <span>{activeDriverData.throttle}%</span>
                  </div>
                  <div className="w-full bg-carbon-600 h-1.5 rounded-sm overflow-hidden">
                    <div className="bg-neon-green h-full transition-all duration-150" style={{ width: `${activeDriverData.throttle}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-neon-red font-bold">BRAKE</span>
                    <span>{activeDriverData.brake}%</span>
                  </div>
                  <div className="w-full bg-carbon-600 h-1.5 rounded-sm overflow-hidden">
                    <div className="bg-neon-red h-full transition-all duration-150" style={{ width: `${activeDriverData.brake}%` }} />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* REAL VECTOR CIRCUIT MAP INSIGHT LAYER */}
          <section className="bg-carbon-700 border border-carbon-600 rounded p-4 flex flex-col justify-between">
            <h3 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
              
            </h3>
            <div className="flex-1 min-h-[300px]">
              {/* WE REPLACE THE RECTANGLE WITH OUR COMPONENT LINK NODE */}
              <LiveTrackMap drivers={drivers} />
            </div>
          </section>
        </main>

      </div>
    </div>
  );
}