from app.routers.auth import router as auth_router
from app.routers.trips import router as trips_router
from app.routers.stops import router as stops_router
from app.routers.cities import router as cities_router
from app.routers.activities import router as activities_router
from app.routers.trip_activities import router as trip_activities_router
from app.routers.budget import router as budget_router
from app.routers.timeline import router as timeline_router
from app.routers.share import router as share_router
from app.routers.expenses import router as expenses_router

__all__ = [
    "auth_router",
    "trips_router",
    "stops_router",
    "cities_router",
    "activities_router",
    "trip_activities_router",
    "budget_router",
    "timeline_router",
    "share_router",
    "expenses_router",
]
