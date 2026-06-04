from dataclasses import dataclass


@dataclass
class ReplayState:
    current_lap: int = 1
    current_frame: int = 0
    total_laps: int = 0
    race_finished: bool = False