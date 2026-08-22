import datetime
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.trip import Trip
from app.models.stop import TripStop
from app.models.trip_activity import TripActivity
from app.models.user import User


def verify_trip_ownership(trip: Trip, user: User) -> None:
    if trip.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access or modify this trip."
        )


def validate_stop_dates_within_trip(
    stop_start: datetime.date,
    stop_end: datetime.date,
    trip_start: datetime.date,
    trip_end: datetime.date
) -> None:
    if stop_start < trip_start or stop_end > trip_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stop dates ({stop_start} to {stop_end}) must fall within trip dates ({trip_start} to {trip_end})."
        )


def validate_activity_date_within_stop(
    activity_date: datetime.date,
    stop_start: datetime.date,
    stop_end: datetime.date
) -> None:
    if activity_date < stop_start or activity_date > stop_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Activity date ({activity_date}) must fall within stop dates ({stop_start} to {stop_end})."
        )


def get_trip_or_404(db: Session, trip_id: int) -> Trip:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with ID {trip_id} not found."
        )
    return trip


def get_stop_or_404(db: Session, stop_id: int) -> TripStop:
    stop = db.query(TripStop).filter(TripStop.id == stop_id).first()
    if not stop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Stop with ID {stop_id} not found."
        )
    return stop


def get_trip_activity_or_404(db: Session, activity_id: int) -> TripActivity:
    trip_act = db.query(TripActivity).filter(TripActivity.id == activity_id).first()
    if not trip_act:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip activity with ID {activity_id} not found."
        )
    return trip_act
