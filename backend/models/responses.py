from pydantic import BaseModel
from models.driver import DriverTelemetry


class SessionResponse(BaseModel):
    session: dict
    race: dict
    drivers: list[DriverTelemetry]