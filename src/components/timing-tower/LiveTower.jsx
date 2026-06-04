import React from "react";

export default function LiveTower({
  lap,
  totalLaps,
  drivers,
  selectedDriver,
  onSelectDriver,
}) {
  return (
    <div className="flex flex-col h-full">

      <div className="mb-4">
        <div className="text-xs text-gray-400 uppercase">
          Timing Tower
        </div>

        <div className="text-sm font-bold text-white">
          Lap {lap} / {totalLaps}
        </div>
      </div>

      <div className="space-y-1 overflow-y-auto">

        {drivers.map(driver => {

          const active =
            selectedDriver === driver.code;

          return (
            <button
              key={driver.code}
              onClick={() =>
                onSelectDriver(driver.code)
              }
              className={`w-full flex items-center justify-between p-2 border text-xs ${
                active
                  ? "border-white"
                  : "border-carbon-600"
              }`}
            >
              <div className="flex items-center gap-2">

                <span className="w-5">
                  P{driver.position}
                </span>

                <span
                  className="w-2 h-4"
                  style={{
                    backgroundColor:
                      driver.teamColor,
                  }}
                />

                <span>
                  {driver.code}
                </span>

              </div>

              <span>
                {driver.speed} km/h
              </span>

            </button>
          );
        })}
      </div>
    </div>
  );
}