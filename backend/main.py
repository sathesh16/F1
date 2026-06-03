import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fastf1
import pandas as pd
import numpy as np

fastf1.Cache.enable_cache('fastf1_cache') 

app = FastAPI(title="F1 Dynamic Lap Auto-Advancer Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State Engine tracking the progression of the session
RACE_PROGRESSION_STATE = {
    "active_lap": 1,           # Starts the simulation at Lap 1
    "total_laps": 44,          # Fallback value for Spa (Belgian GP)
    "current_frame": 0,        # Tracking row cursor
    "max_frames": 0,           # Limit threshold for the loaded lap
    "driver_telemetries": {},  # Cached frames dictionary
    "session_loaded": False,
    "fastf1_session_object": None
}

DRIVER_MAPPING = {
    'VER': '1', 'NOR': '4', 'HAM': '44', 'RUS': '63', 
    'LEC': '16', 'SAI': '55', 'PIA': '81', 'PER': '11'
}

def load_session_infrastructure():
    """Bootstraps the raw session once on server startup to minimize overhead."""
    if not RACE_PROGRESSION_STATE["session_loaded"]:
        print("[SYSTEM] Fetching session infrastructure from cache...")
        session = fastf1.get_session(2024, "Belgium", "R")
        session.load(telemetry=True, laps=True, weather=False)
        
        # Safely extract total laps scheduled for this race event
        try:
            total_scheduled_laps = int(session.laps['LapNumber'].max())
            if total_scheduled_laps > 0:
                RACE_PROGRESSION_STATE["total_laps"] = total_scheduled_laps
        except Exception:
            pass # Fall back to hardcoded default if analysis fails
            
        RACE_PROGRESSION_STATE["fastf1_session_object"] = session
        RACE_PROGRESSION_STATE["session_loaded"] = True

def cache_specific_lap_telemetry(lap_number: int):
    """Slices out telemetry data rows for a targeted lap number across all drivers."""
    load_session_infrastructure()
    session = RACE_PROGRESSION_STATE["fastf1_session_object"]
    
    print(f"[PROGRESSION] Processing and caching data for Lap {lap_number}...")
    lap_telemetries = {}
    shortest_dataset_len = 99999
    
    for code, num in DRIVER_MAPPING.items():
        try:
            try:
                drv_laps = session.laps.pick_drivers(num)
            except Exception:
                drv_laps = session.laps.pick_drivers(code)
                
            target_lap_data = drv_laps[drv_laps['LapNumber'] == lap_number]
            
            if not target_lap_data.empty:
                car_data = target_lap_data.get_car_data()
                if not car_data.empty:
                    lap_telemetries[code] = car_data
                    if len(car_data) < shortest_dataset_len:
                        shortest_dataset_len = len(car_data)
        except Exception:
            continue

    if lap_telemetries:
        RACE_PROGRESSION_STATE["driver_telemetries"] = lap_telemetries
        RACE_PROGRESSION_STATE["max_frames"] = shortest_dataset_len
        RACE_PROGRESSION_STATE["current_frame"] = 0
        RACE_PROGRESSION_STATE["active_lap"] = lap_number
        print(f"[SUCCESS] Lap {lap_number} loaded into cache memory. Total frames: {shortest_dataset_len}")
        return True
    else:
        print(f"[END] No more lap data found beyond Lap {lap_number - 1}.")
        return False

@app.get("/api/session/reset")
def reset_simulation_to_start():
    """Explicitly resets playback to frame 0 of Lap 1 without stopping the server."""
    print("\n[RESET] Manual reload requested. Moving simulation back to Lap 1...")
    success = cache_specific_lap_telemetry(1)
    return {
        "status": "success" if success else "failed",
        "current_lap": RACE_PROGRESSION_STATE["active_lap"],
        "total_laps": RACE_PROGRESSION_STATE["total_laps"]
    }

@app.get("/api/session/live")
def get_live_driver_matrix():
    """Streams telemetry frames. Auto-increments lap when current lap finishes."""
    try:
        if not RACE_PROGRESSION_STATE["driver_telemetries"]:
            success = cache_specific_lap_telemetry(1)
            if not success:
                return {"drivers": [], "current_lap": "Finished", "total_laps": RACE_PROGRESSION_STATE["total_laps"]}

        frame_idx = RACE_PROGRESSION_STATE["current_frame"]
        max_limit = RACE_PROGRESSION_STATE["max_frames"]
        active_lap = RACE_PROGRESSION_STATE["active_lap"]
        total_laps = RACE_PROGRESSION_STATE["total_laps"]
        telemetries = RACE_PROGRESSION_STATE["driver_telemetries"]

        # LAP ADVANCEMENT LOGIC
        if frame_idx >= (max_limit - 1):
            next_lap = active_lap + 1
            print(f"\n[LAP COMPLETED] Lap {active_lap}/{total_laps} finished! Advancing to Lap {next_lap}...")
            
            has_more_laps = cache_specific_lap_telemetry(next_lap)
            
            if has_more_laps:
                active_lap = RACE_PROGRESSION_STATE["active_lap"]
                frame_idx = RACE_PROGRESSION_STATE["current_frame"]
                max_limit = RACE_PROGRESSION_STATE["max_frames"]
                telemetries = RACE_PROGRESSION_STATE["driver_telemetries"]
            else:
                print("[RESTART] Complete race distance covered. Restarting from Lap 1.")
                cache_specific_lap_telemetry(1)
                return {"drivers": [], "current_lap": 1, "total_laps": total_laps, "playback_frame": 0}

        RACE_PROGRESSION_STATE["current_frame"] = frame_idx + 1

        live_matrix = []
        for idx, (code, car_data) in enumerate(telemetries.items()):
            try:
                current_frame = car_data.iloc[frame_idx]
                
                speed = int(current_frame.get('Speed', 0))
                rpm = int(current_frame.get('RPM', 0))
                gear = int(current_frame.get('Gear', 0))
                throttle = int(current_frame.get('Throttle', 0))
                raw_brake = current_frame.get('Brake', 0)
                brake = 100 if raw_brake is True or raw_brake > 0 else 0
                
                live_matrix.append({
                    "code": code,
                    "position": int(idx + 1),
                    "speed": speed,
                    "rpm": rpm,
                    "gear": gear,
                    "throttle": throttle,
                    "brake": brake,
                    "x": frame_idx
                })
            except Exception:
                continue

        # Added total_laps key to response mapping dictionary
        return {
            "current_lap": active_lap,
            "total_laps": total_laps,
            "playback_frame": frame_idx,
            "total_lap_frames": max_limit,
            "drivers": sorted(live_matrix, key=lambda x: x['position'])
        }

    except Exception as e:
        print(f"[CRITICAL FAILURE] Auto-Lap Engine Error: {str(e)}")
        raise HTTPException(status_code=500, detail="Progression loop failure.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)