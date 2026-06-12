import pandas as pd


class TrackMapService:

    def extract_frame_data(
        self,
        merged_data: pd.DataFrame,
        bounds: dict | None = None
    ) -> list[dict]:

        frames = []

        max_distance = (
            float(merged_data["Distance"].max())
            if "Distance" in merged_data.columns
            else 0
        )

        for _, row in merged_data.iterrows():

            distance = (
                float(row["Distance"])
                if "Distance" in merged_data.columns
                and pd.notna(row["Distance"])
                else 0.0
            )

            lap_distance_pct = (
                round((distance / max_distance) * 100, 2)
                if max_distance > 0
                else 0
            )

            x = (
                float(row["X"])
                if "X" in merged_data.columns
                and pd.notna(row["X"])
                else None
            )

            y = (
                float(row["Y"])
                if "Y" in merged_data.columns
                and pd.notna(row["Y"])
                else None
            )

            if (
                bounds
                and x is not None
                and y is not None
            ):
            
                x_range = (
                    bounds["max_x"]
                    - bounds["min_x"]
                )
            
                y_range = (
                    bounds["max_y"]
                    - bounds["min_y"]
                )
            
                if x_range > 0 and y_range > 0:
                
                    x = (
                        (x - bounds["min_x"])
                        / x_range
                    )
            
                    y = (
                        (y - bounds["min_y"])
                        / y_range
                    )
            
                else:
                
                    x = None
                    y = None

            frames.append({
                "distance": distance,
                "lap_distance_pct": lap_distance_pct,
                "x": round(x, 6) if x is not None else None,
                "y": round(y, 6) if y is not None else None
            })

        return frames