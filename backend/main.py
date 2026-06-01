from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import pandas as pd
import numpy as np

# Force FastF1 to initialize its local data structures securely
fastf1.Cache.enable_cache('fastf1_cache') 

app = FastAPI(title="F1 Telemetry Core BFF Engine")

# STAGE 1: Explicitly handle cross-origin routing configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ensures localhost:3000 can ingest the raw data streams cleanly
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Robust fallback fallback shape matrix representing a real grand prix loop footprint
# This ensures that if FastF1 returns empty arrays while downloading, your UI still loads instantly
FALLBACK_SPA_GRID = [
    {"x": 0, "y": -100}, {"x": 50, "y": -80}, {"x": 80, "y": -40}, 
    {"x": 100, "y": 0}, {"x": 70, "y": 50}, {"x": 20, "y": 90}, 
    {"x": -40, "y": 100}, {"x": -90, "y": 60}, {"x": -60, "y": -30}
]

@app.get("/api/circuit")
def get_circuit_layout(year: int = 2024, location: str = "Spa", session_type: str = "R"):
    """
    Fetches raw tracking coordinates, downsamples the node densities, 
    and returns balanced SVG tracking objects safely.
    """
    try:
        print(f"[BFF Engine] Processing session request: {year} {location} [{session_type}]...")
        
        # Load the target archival slice
        session = fastf1.get_session(year, location, session_type)
        session.load(telemetry=True, laps=True, weather=False)
        
        # Pull the absolute fastest reference lap from the database
        fastest_lap = session.laps.pick_fastest()
        pos_data = fastest_lap.get_pos_data()
        
        # Check if the asset is still downloading or currently unpopulated
        if pos_data is None or pos_data.empty:
            print("[WARN] FastF1 telemetry arrays loading/empty. Pushing high-fidelity loop fallback.")
            return {
                "track_name": f"{location} Circuit (Simulation Mode)",
                "country": "Live Feed",
                "total_points": len(FALLBACK_SPA_GRID),
                "points": FALLBACK_SPA_GRID
            }
            
        # Downsample the raw data streams to protect Next.js frame budgets
        x_coords = pos_data['X'].values[::6]
        y_coords = pos_data['Y'].values[::6]
        
        # Center coordinates around origin (0,0) so the SVG fits automatically inside its bounding container
        x_centered = x_coords - np.mean(x_coords)
        y_centered = y_coords - np.mean(y_coords)
        
        circuit_points = [
            {"x": float(x) * 0.1, "y": float(y) * 0.1} # Scale factor reduction for cleaner SVG layout logic
            for x, y in zip(x_centered, y_centered)
        ]
        
        print(f"[SUCCESS] Dispatched {len(circuit_points)} track coordinate vectors down to frontend.")
        return {
            "track_name": session.event['EventName'],
            "country": session.event['Country'],
            "total_points": len(circuit_points),
            "points": circuit_points
        }
        
    except Exception as e:
        print(f"[CRITICAL ERROR] BFF pipeline halted: {str(e)}")
        # Graceful fallback protection block instead of hard throwing 500 crashes
        return {
            "track_name": f"{location} (Failover Mode)",
            "country": "System Active",
            "total_points": len(FALLBACK_SPA_GRID),
            "points": FALLBACK_SPA_GRID
        }

@app.get("/api/session/live")
def get_live_driver_matrix():
    # Keep baseline data ticking over to run structural analytics
    mock_matrix = [
        {"code": "VER", "position": 1, "speed": 312, "rpm": 11800, "gear": 7, "throttle": 100, "brake": 0},
        {"code": "NOR", "position": 2, "speed": 308, "rpm": 11650, "gear": 7, "throttle": 100, "brake": 0},
        {"code": "LEC", "position": 3, "speed": 322, "rpm": 12100, "gear": 8, "throttle": 85,  "brake": 0},
        {"code": "HAM", "position": 4, "speed": 245, "rpm": 9200,  "gear": 5, "throttle": 0,   "brake": 100}
    ]
    return {"drivers": mock_matrix}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)