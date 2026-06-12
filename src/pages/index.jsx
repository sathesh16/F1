import React, {
  useEffect,
  useState,
} from "react";

import { useSessionStream }
  from "../hooks/useSessionStream";

import useTrackData from "@/hooks/useTrackData";
  
import LiveTower
  from "../components/timing-tower/LiveTower";

import WheelDisplay
  from "../components/telemetry/WheelDisplay";

import LiveTrackMap
  from "../components/telemetry/LiveTrackMap";

import {
  getTeamColor,
} from "../utils/teamColors";
import PixiTrackMap from "@/components/trackmap/PixiTrackMap";

export default function Dashboard() {

  // console.log(PixiReact);

  const {
    session,
    race,
    drivers,
    isLoading,
    resetSession,
  } = useSessionStream();

  const {
    track,
    loading
  } = useTrackData();

  const [
    selectedDriver,
    setSelectedDriver,
  ] = useState(null);

  useEffect(() => {
    if (
      !selectedDriver &&
      drivers.length > 0
    ) {
      setSelectedDriver(
        drivers[0].code
      );
    }
  }, [drivers]);

  const activeDriver =
    drivers.find(
      d =>
        d.code === selectedDriver
    );

  const formattedDrivers =
    drivers.map(driver => ({
      ...driver,
      teamColor:
        getTeamColor(driver.team),
    }));

  const progress =
    race
      ? (
        race.current_lap /
        race.total_laps
      ) * 100
      : 0;

  return (
    <div className="min-h-screen bg-carbon-900 text-white p-4">

      <div className="mb-4 flex justify-between">

        <div>
          <h1 className="text-xl font-bold">
            {session?.event}
          </h1>

          <div className="text-sm text-gray-400">
            {session?.year}
          </div>
        </div>

        <button
          onClick={resetSession}
          className="px-4 py-2 bg-red-600"
        >
          Reset
        </button>

      </div>

      <div className="mb-4">

        <div className="h-2 bg-carbon-600">

          <div
            className="h-full bg-neon-green"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      <div className="grid grid-cols-4 gap-4">

        <aside>

          <LiveTower
            lap={race?.current_lap}
            totalLaps={race?.total_laps}
            drivers={formattedDrivers}
            selectedDriver={
              selectedDriver
            }
            onSelectDriver={
              setSelectedDriver
            }
          />

        </aside>

        <main className="col-span-3 grid md:grid-cols-2 gap-4">

          <div className="border border-carbon-600 p-4">

            <WheelDisplay
              telemetry={activeDriver}
            />

            {activeDriver && (
              <div className="mt-4 space-y-2 text-sm">

                <div>
                  {activeDriver.name}
                </div>

                <div>
                  #{activeDriver.number}
                </div>

                <div>
                  {activeDriver.team}
                </div>

                <div>
                  Position:
                  {" "}
                  P{activeDriver.position}
                </div>

                <div>
                  Distance:
                  {" "}
                  {activeDriver.distance?.toFixed(0)}
                  m
                </div>

                <div>
                  Lap:
                  {" "}
                  {activeDriver.lap_distance_pct?.toFixed(1)}
                  %
                </div>

              </div>
            )}

          </div>

          <div className="border border-carbon-600 p-4">

            <PixiTrackMap
              track={track}
              drivers={formattedDrivers}
            />

          </div>

        </main>

      </div>

    </div>
  );
}