from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database.connection import engine
from app.database.base import Base
import app.models  # Ensures all models are imported before creating tables

from app.routers import (
    auth_router,
    trips_router,
    stops_router,
    cities_router,
    activities_router,
    trip_activities_router,
    budget_router,
    timeline_router,
    share_router,
    expenses_router,
)

# Auto-create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GlobeTrotter Personalized Multi-City Travel Planning API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware for React frontend
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    simplified_errors = []
    for err in errors:
        loc = " -> ".join([str(item) for item in err.get("loc", [])])
        simplified_errors.append({
            "field": loc,
            "message": err.get("msg")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error occurred.",
            "errors": simplified_errors
        }
    )


# Register API Routers
app.include_router(auth_router)
app.include_router(trips_router)
app.include_router(stops_router)
app.include_router(cities_router)
app.include_router(activities_router)
app.include_router(trip_activities_router)
app.include_router(budget_router)
app.include_router(timeline_router)
app.include_router(share_router)
app.include_router(expenses_router)


@app.get("/", tags=["Health Check"])
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs": "/docs"
    }
