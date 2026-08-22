from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.activity import Activity
from app.models.trip_activity import TripActivity
from app.schemas.trip_activity import TripActivityCreate, TripActivityUpdate, TripActivityResponse
from app.auth.dependencies import get_current_user
from app.utils.validators import (
    verify_trip_ownership,
    validate_activity_date_within_stop,
    get_stop_or_404,
    get_trip_activity_or_404,
)

router = APIRouter(tags=["Trip Activities"])


@router.post("/stops/{stop_id}/activities", response_model=TripActivityResponse, status_code=status.HTTP_201_CREATED)
def add_activity_to_stop(
    stop_id: int,
    activity_in: TripActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stop = get_stop_or_404(db, stop_id)
    verify_trip_ownership(stop.trip, current_user)

    # Validate activity date within stop dates
    validate_activity_date_within_stop(activity_in.date, stop.start_date, stop.end_date)

    master_activity = None
    title = activity_in.title
    cost = activity_in.cost if activity_in.cost is not None else 0.0

    if activity_in.activity_id:
        master_activity = db.query(Activity).filter(Activity.id == activity_in.activity_id).first()
        if not master_activity:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Master activity with ID {activity_in.activity_id} not found."
            )
        if not title:
            title = master_activity.title
        if activity_in.cost is None:
            cost = master_activity.cost

    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Activity title is required when not linking to a master activity."
        )

    trip_activity = TripActivity(
        stop_id=stop_id,
        activity_id=activity_in.activity_id,
        title=title,
        cost=cost,
        date=activity_in.date,
        notes=activity_in.notes
    )
    db.add(trip_activity)
    db.commit()
    db.refresh(trip_activity)

    return trip_activity


@router.patch("/trip-activities/{id}", response_model=TripActivityResponse)
def update_trip_activity(
    id: int,
    activity_in: TripActivityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip_act = get_trip_activity_or_404(db, id)
    verify_trip_ownership(trip_act.stop.trip, current_user)

    if activity_in.date is not None:
        validate_activity_date_within_stop(
            activity_in.date,
            trip_act.stop.start_date,
            trip_act.stop.end_date
        )
        trip_act.date = activity_in.date

    if activity_in.title is not None:
        trip_act.title = activity_in.title
    if activity_in.cost is not None:
        trip_act.cost = activity_in.cost
    if activity_in.notes is not None:
        trip_act.notes = activity_in.notes
    if activity_in.is_completed is not None:
        trip_act.is_completed = activity_in.is_completed

    db.commit()
    db.refresh(trip_act)
    return trip_act


@router.delete("/trip-activities/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip_activity(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip_act = get_trip_activity_or_404(db, id)
    verify_trip_ownership(trip_act.stop.trip, current_user)

    db.delete(trip_act)
    db.commit()
    return None
