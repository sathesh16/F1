import fastf1

class SessionLoader:

    def __init__(self):
        self.session = None

    def load_session(
        self,
        year: int,
        event: str,
        session_type: str
    ):
        session = fastf1.get_session(
            year,
            event,
            session_type
        )

        session.load(
            telemetry=True,
            laps=True,
            weather=True
        )

        self.session = session

        return session