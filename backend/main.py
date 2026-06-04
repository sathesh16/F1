import fastf1

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.session_loader import (
    SessionLoader
)
from services.driver_service import (
    DriverService
)
from services.telemetry_service import (
    TelemetryService
)
from services.replay_engine import (
    ReplayEngine
)

from api.routes import (
    register_routes
)

fastf1.Cache.enable_cache(
    "fastf1_cache"
)

app = FastAPI(
    title="F1 Replay Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

loader = SessionLoader()

session = loader.load_session(
    year=2024,
    event="Belgium",
    session_type="R"
)

driver_service = DriverService()

drivers = (
    driver_service
    .discover_drivers(session)
)

telemetry_service = (
    TelemetryService()
)

(
    lap_cache,
    position_cache,
    total_laps
) = telemetry_service.build_full_session_cache(
    session,
    drivers
)

replay_engine = ReplayEngine(
    session_info={
        "year": 2024,
        "event": "Belgium",
        "session_type": "R"
    },
    driver_cache=drivers,
    lap_cache=lap_cache,
    position_cache=position_cache,
    total_laps=total_laps
)

app.include_router(
    register_routes(
        replay_engine
    )
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)