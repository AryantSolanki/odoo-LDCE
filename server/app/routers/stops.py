from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.city import City
from app.models.stop import TripStop
from app.schemas.stop import StopCreate, StopUpdate, StopResponse, StopsReorderRequest
from app.auth.dependencies import get_current_user
from app.utils.validators import (
    verify_trip_ownership,
    validate_stop_dates_within_trip,
    get_trip_or_404,
    get_stop_or_404,
)

router = APIRouter(tags=["Stops"])


@router.post("/trips/{trip_id}/stops", response_model=StopResponse, status_code=status.HTTP_201_CREATED)
def create_stop(
    trip_id: int,
    stop_in: StopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = get_trip_or_404(db, trip_id)
    verify_trip_ownership(trip, current_user)

    # Validate city exists
    city = db.query(City).filter(City.id == stop_in.city_id).first()
    if not city:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"City with ID {stop_in.city_id} not found."
        )

    # Validate stop dates inside trip dates
    validate_stop_dates_within_trip(stop_in.start_date, stop_in.end_date, trip.start_date, trip.end_date)

    # Auto assign order index if not specified
    if stop_in.order_index is None:
        max_order = db.query(TripStop).filter(TripStop.trip_id == trip_id).count()
        order_idx = max_order
    else:
        order_idx = stop_in.order_index

    stop = TripStop(
        trip_id=trip_id,
        city_id=stop_in.city_id,
        order_index=order_idx,
        start_date=stop_in.start_date,
        end_date=stop_in.end_date,
        transport_mode=stop_in.transport_mode,
        transport_cost=stop_in.transport_cost,
        stay_cost_per_night=stop_in.stay_cost_per_night,
        notes=stop_in.notes
    )
    db.add(stop)
    db.commit()
    db.refresh(stop)

    return stop


@router.put("/stops/{stop_id}", response_model=StopResponse)
def update_stop(
    stop_id: int,
    stop_in: StopUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stop = get_stop_or_404(db, stop_id)
    verify_trip_ownership(stop.trip, current_user)

    if stop_in.city_id is not None:
        city = db.query(City).filter(City.id == stop_in.city_id).first()
        if not city:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"City {stop_in.city_id} not found")
        stop.city_id = stop_in.city_id

    new_start = stop_in.start_date if stop_in.start_date is not None else stop.start_date
    new_end = stop_in.end_date if stop_in.end_date is not None else stop.end_date

    if stop_in.start_date is not None or stop_in.end_date is not None:
        validate_stop_dates_within_trip(new_start, new_end, stop.trip.start_date, stop.trip.end_date)
        stop.start_date = new_start
        stop.end_date = new_end

        # Check if existing activities in this stop fall within new stop dates
        for act in stop.trip_activities:
            if act.date < new_start or act.date > new_end:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Existing activity '{act.title}' ({act.date}) falls outside new stop dates ({new_start} to {new_end}). Update activity dates first."
                )

    if stop_in.transport_mode is not None:
        stop.transport_mode = stop_in.transport_mode
    if stop_in.transport_cost is not None:
        stop.transport_cost = stop_in.transport_cost
    if stop_in.stay_cost_per_night is not None:
        stop.stay_cost_per_night = stop_in.stay_cost_per_night
    if stop_in.notes is not None:
        stop.notes = stop_in.notes
    if stop_in.order_index is not None:
        stop.order_index = stop_in.order_index

    db.commit()
    db.refresh(stop)
    return stop


@router.delete("/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stop(
    stop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stop = get_stop_or_404(db, stop_id)
    verify_trip_ownership(stop.trip, current_user)

    db.delete(stop)
    db.commit()
    return None


@router.patch("/trips/{trip_id}/stops/reorder", response_model=List[StopResponse])
def reorder_stops(
    trip_id: int,
    reorder_in: StopsReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = get_trip_or_404(db, trip_id)
    verify_trip_ownership(trip, current_user)

    existing_stops_map = {s.id: s for s in trip.stops}
    for item in reorder_in.order:
        if item.stop_id in existing_stops_map:
            existing_stops_map[item.stop_id].order_index = item.order_index

    db.commit()
    
    updated_stops = db.query(TripStop).filter(TripStop.trip_id == trip_id).order_by(TripStop.order_index).all()
    return updated_stops
