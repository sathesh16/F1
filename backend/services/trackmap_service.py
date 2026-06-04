import pandas as pd


class TrackMapService:

    def extract_frame_data(
        self,
        merged_data: pd.DataFrame
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

            frames.append({
                "distance": distance,
                "lap_distance_pct": lap_distance_pct,
                "x": (
                    float(row["X"])
                    if "X" in merged_data.columns
                    and pd.notna(row["X"])
                    else None
                ),
                "y": (
                    float(row["Y"])
                    if "Y" in merged_data.columns
                    and pd.notna(row["Y"])
                    else None
                )
            })

        return frames