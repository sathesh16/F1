import pandas as pd
from services.trackmap_service import TrackMapService


class TelemetryService:

    def __init__(
        self,
        track_bounds
    ):
        self.trackmap_service = (
            TrackMapService()
        )

        self.track_bounds = (
            track_bounds
        )

    def build_full_session_cache(
        self,
        session,
        drivers
    ):

        lap_cache = {}
        position_cache = {}

        total_laps = int(
            session.laps["LapNumber"].max()
        )

        for lap_number in range(1, total_laps + 1):

            lap_cache[lap_number] = {}
            position_cache[lap_number] = {}

            for driver_number in drivers.keys():

                try:

                    driver_laps = session.laps.pick_drivers(
                        driver_number
                    )

                    lap_row = driver_laps[
                        driver_laps["LapNumber"] == lap_number
                    ]

                    if lap_row.empty:
                        continue

                    lap = lap_row.iloc[0]

                    if "Position" in lap_row.columns:
                        position = lap.get("Position")

                        if pd.notna(position):
                            position_cache[lap_number][driver_number] = int(position)

                    car_data = (
                        lap
                        .get_car_data()
                        .add_distance()
                    )

                    if car_data.empty:
                        continue
                    
                    try:
                    
                        pos_data = lap.get_pos_data()

                        if not pos_data.empty:
                        
                            merged = car_data.merge_channels(
                                pos_data
                            )

                        else:
                        
                            merged = car_data

                    except Exception:
                    
                        merged = car_data

                    frames = []

                    track_frames = (
                        self.trackmap_service
                        .extract_frame_data(
                            merged,
                            self.track_bounds
                        )
                    )

                    for idx, (_, row) in enumerate(
                        merged.iterrows()
                    ):

                        brake_raw = row.get(
                            "Brake",
                            0
                        )

                        frames.append({
                            "speed": int(
                                row.get(
                                    "Speed",
                                    0
                                )
                            ),
                            "rpm": int(
                                row.get(
                                    "RPM",
                                    0
                                )
                            ),
                            "gear": int(
                                row.get(
                                    "nGear",
                                    row.get(
                                        "Gear",
                                        0
                                    )
                                )
                            ),
                            "throttle": int(
                                row.get(
                                    "Throttle",
                                    0
                                )
                            ),
                            "brake": (
                                100
                                if brake_raw
                                else 0
                            ),
                            **track_frames[idx]
                        })

                    lap_cache[
                        lap_number
                    ][driver_number] = frames

                except Exception as e:
                    print(
                        f"Telemetry preload error "
                        f"{driver_number} "
                        f"lap {lap_number}: {e}"
                    )

        return (
            lap_cache,
            position_cache,
            total_laps
        )