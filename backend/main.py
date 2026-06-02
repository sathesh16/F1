import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import pandas as pd
import numpy as np

# Enable caching to protect disk and network bandwidth
fastf1.Cache.enable_cache('fastf1_cache') 

app = FastAPI(title="F1 Telemetry Production Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to hold our pre-loaded telemetry data structures
LAZY_SESSION_STORAGE = {
    "session": None,
    "driver_telemetries": {},
    "max_frames": 0,
    "loaded_lap": -1
}

SESSION_PLAYBACK_COUNTER = {"current_frame": 0}

FALLBACK_SPA_GRID = [
    {"x": 0, "y": -100}, {"x": 50, "y": -80}, {"x": 80, "y": -40}, 
    {"x": 100, "y": 0}, {"x": 70, "y": 50}, {"x": 20, "y": 90}, 
    {"x": -40, "y": 100}, {"x": -90, "y": 60}, {"x": -60, "y": -30}
]

def pre_load_lap_telemetry(year, search_location, session_type, lap):
    """Loads telemetry data into memory ONCE to keep resource usage extremely low."""
    print(f"[SYSTEM] Pre-loading data for Lap {lap}... Please wait.")
    
    session = fastf1.get_session(year, search_location, session_type)
    session.load(telemetry=True, laps=True, weather=False)
    
    driver_mapping = {
        # 'VER': '1', 
        # 'NOR': '4',
        'HAM': '44', 'RUS': '63', 
        # 'LEC': '16', 'SAI': '55', 'PIA': '81', 'PER': '11'
    }
    
    telemetries = {}
    max_frames = 9999
    
    for code, num in driver_mapping.items():
        try:
            drv_laps = session.laps.pick_drivers(num)
            target_lap_data = drv_laps[drv_laps['LapNumber'] == lap]
            if not target_lap_data.empty:
                car_data = target_lap_data.get_car_data()
                if not car_data.empty:
                    telemetries[code] = car_data
                    if len(car_data) < max_frames:
                        max_frames = len(car_data)
        except Exception:
            continue

    LAZY_SESSION_STORAGE["session"] = session
    LAZY_SESSION_STORAGE["driver_telemetries"] = telemetries
    LAZY_SESSION_STORAGE["max_frames"] = max_frames if telemetries else 0
    LAZY_SESSION_STORAGE["loaded_lap"] = lap
    print(f"[SYSTEM] Lap {lap} loaded successfully. Engine is running efficiently.")

@app.get("/api/circuit")
def get_circuit_layout(location: str = "Spa"):
    # Reuses the pre-loaded data in memory instantly
    try:
        if LAZY_SESSION_STORAGE["session"] is None:
            search_location = "Belgium" if location.lower() == "spa" else location
            session = fastf1.get_session(2024, search_location, "R")
            session.load(telemetry=True, laps=True, weather=False)
            LAZY_SESSION_STORAGE["session"] = session
            
        session = LAZY_SESSION_STORAGE["session"]
        fastest_lap = session.laps.pick_fastest()
        pos_data = fastest_lap.get_pos_data()
        
        if pos_data is None or pos_data.empty:
            return {"points": FALLBACK_SPA_GRID}
            
        x_coords = pos_data['X'].values[::6]
        y_coords = pos_data['Y'].values[::6]
        x_centered = x_coords - np.mean(x_coords)
        y_centered = y_coords - np.mean(y_coords)
        
        circuit_points = [
            {"x": float(x) * 0.05, "y": float(y) * 0.05} 
            for x, y in zip(x_centered, y_centered)
        ]
        return {"track_name": session.event['EventName'], "points": circuit_points}
    except Exception:
        return {"points": FALLBACK_SPA_GRID}

@app.get("/api/session/live")
def get_live_driver_matrix(lap: int = 5):
    try:
        # If we haven't loaded this lap yet, load it once. 
        # Otherwise, skip loading entirely and read straight from RAM!
        if LAZY_SESSION_STORAGE["loaded_lap"] != lap:
            pre_load_lap_telemetry(2024, "Belgium", "R", lap)
            
        telemetries = LAZY_SESSION_STORAGE["driver_telemetries"]
        max_frames = LAZY_SESSION_STORAGE["max_frames"]
        
        if not telemetries or max_frames == 0:
            return {"drivers": []}
            
        frame_index = SESSION_PLAYBACK_COUNTER["current_frame"]
        SESSION_PLAYBACK_COUNTER["current_frame"] = (frame_index + 1) % max_frames
        
        live_matrix = []
        for idx, (code, car_data) in enumerate(telemetries.items()):
            try:
                current_frame = car_data.iloc[frame_index]
                raw_brake = current_frame.get('Brake', 0)
                
                live_matrix.append({
                    "code": code,
                    "position": int(idx + 1),
                    "speed": int(current_frame.get('Speed', 0)),
                    "rpm": int(current_frame.get('RPM', 0)),
                    "gear": int(current_frame.get('Gear', 0)),
                    "throttle": int(current_frame.get('Throttle', 0)),
                    "brake": 100 if raw_brake is True or raw_brake > 0 else 0,
                    "x": frame_index 
                })
            except Exception:
                continue
                
        return {
            "current_lap": lap,
            "playback_frame": frame_index,
            "drivers": sorted(live_matrix, key=lambda x: x['position'])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)