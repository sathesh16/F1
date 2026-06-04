from pydantic import BaseModel

class DriverTelemetry(BaseModel):

    code: str

    number: int

    name: str

    team: str

    position: int | None = None

    speed: int | None = None

    rpm: int | None = None

    gear: int | None = None

    throttle: int | None = None

    brake: int | None = None

    distance: float | None = None

    lap_distance_pct: float | None = None

    x: float | None = None

    y: float | None = None