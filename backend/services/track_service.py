import pandas as pd


class TrackService:

    def build_track_layout(self, session):

        try:

            winner = session.results.iloc[0]["Abbreviation"]

            lap = (
                session.laps
                .pick_drivers(winner)
                .pick_fastest()
            )

            pos_data = lap.get_pos_data()

            if pos_data.empty:
                return None

            pos_data = pos_data[
                pos_data["X"].notna()
                & pos_data["Y"].notna()
            ]

            min_x = float(pos_data["X"].min())
            max_x = float(pos_data["X"].max())

            min_y = float(pos_data["Y"].min())
            max_y = float(pos_data["Y"].max())

            points = []

            sampled = pos_data.iloc[::5]

            x_range = max_x - min_x
            y_range = max_y - min_y
            
            if x_range <= 0 or y_range <= 0:
                return None
            
            for _, row in sampled.iterrows():
            
                x = float(row["X"])
                y = float(row["Y"])
            
                norm_x = (
                    (x - min_x)
                    / x_range
                )
            
                norm_y = (
                    (y - min_y)
                    / y_range
                )
            
                points.append({
                    "x": round(norm_x, 6),
                    "y": round(norm_y, 6)
                })

            return {
                "track_name": session.event["EventName"],
                "country": session.event["Country"],
                "coordinate_system": "normalized",

                "bounds": {
                    "min_x": min_x,
                    "max_x": max_x,
                    "min_y": min_y,
                    "max_y": max_y
                },

                "points": points
            }

        except Exception as e:

            print(
                f"Track generation failed: {e}"
            )

            return None
        
    def normalize_coordinate(
        self,
        x,
        y,
        bounds
    ):

        if (
            x is None
            or y is None
        ):
            return None, None

        norm_x = (
            (x - bounds["min_x"])
            /
            (
                bounds["max_x"]
                - bounds["min_x"]
            )
        )

        norm_y = (
            (y - bounds["min_y"])
            /
            (
                bounds["max_y"]
                - bounds["min_y"]
            )
        )

        return (
            round(norm_x, 6),
            round(norm_y, 6)
        )