from fastapi import APIRouter

router = APIRouter()


def register_routes(
    replay_engine
):

    @router.get(
        "/api/session/live"
    )
    def live():

        return (
            replay_engine
            .get_live_snapshot()
        )

    @router.get(
        "/api/session/reset"
    )
    def reset():

        replay_engine.reset()

        return {
            "status": "success",
            "current_lap": 1
        }
    
    @router.get(
        "/api/session/track"
    )
    def get_track():

        return (
            replay_engine
            .get_track()
        )

    return router