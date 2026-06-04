from models.state import ReplayState


class ReplayEngine:

    def __init__(
        self,
        session_info,
        driver_cache,
        lap_cache,
        position_cache,
        total_laps
    ):

        self.session_info = session_info

        self.driver_cache = driver_cache

        self.lap_cache = lap_cache

        self.position_cache = position_cache

        self.state = ReplayState(
            total_laps=total_laps
        )

    def reset(self):

        self.state.current_lap = 1
        self.state.current_frame = 0
        self.state.race_finished = False

    def _get_max_frames(self):

        lap_data = self.lap_cache.get(
            self.state.current_lap,
            {}
        )

        if not lap_data:
            return 0

        return max(
            len(frames)
            for frames in lap_data.values()
        )

    def advance(self):

        max_frames = self._get_max_frames()

        if max_frames == 0:
            return

        self.state.current_frame += 1

        if self.state.current_frame >= max_frames:

            self.state.current_lap += 1

            self.state.current_frame = 0

            if (
                self.state.current_lap
                > self.state.total_laps
            ):

                self.reset()

    def get_live_snapshot(self):

        lap = self.state.current_lap

        frame = self.state.current_frame

        drivers = []

        for driver_number, meta in (
            self.driver_cache.items()
        ):

            lap_data = (
                self.lap_cache
                .get(lap, {})
                .get(driver_number)
            )

            if not lap_data:
                continue

            safe_frame = min(
                frame,
                len(lap_data) - 1
            )

            telemetry = lap_data[safe_frame]

            drivers.append({
                **meta,
                "position": (
                    self.position_cache
                    .get(lap, {})
                    .get(driver_number)
                ),
                **telemetry
            })

        response = {
            "session": self.session_info,
            "race": {
                "current_lap": lap,
                "total_laps": self.state.total_laps,
                "playback_frame": frame,
                "lap_frames": self._get_max_frames(),
                "race_finished": False
            },
            "drivers": sorted(
                drivers,
                key=lambda d: (
                    d["position"]
                    if d["position"]
                    else 999
                )
            )
        }

        self.advance()

        return response