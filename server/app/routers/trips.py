from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.trip import Trip
from app.models.stop import TripStop
from app.schemas.trip import TripCreate, TripUpdate, TripResponse, TripDetailResponse
from app.auth.dependencies import get_current_user, get_optional_user
from app.utils.validators import verify_trip_ownership, get_trip_or_404

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.get("", response_model=List[TripResponse])
def list_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trips = db.query(Trip).filter(Trip.user_id == current_user.id).order_by(Trip.start_date.desc()).all()
    results = []
    for t in trips:
        stops_cnt = len(t.stops)
        days_cnt = max(1, (t.end_date - t.start_date).days + 1)
        res = TripResponse(
            id=t.id,
            user_id=t.user_id,
            public_id=t.public_id,
            title=t.title,
            description=t.description,
            start_date=t.start_date,
            end_date=t.end_date,
            budget_limit=t.budget_limit,
            is_public=t.is_public,
            created_at=t.created_at,
            updated_at=t.updated_at,
            stops_count=stops_cnt,
            total_days=days_cnt
        )
        results.append(res)
    return results


@router.post("", response_model=TripDetailResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = Trip(
        user_id=current_user.id,
        title=trip_in.title,
        description=trip_in.description,
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        budget_limit=trip_in.budget_limit,
        is_public=trip_in.is_public
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    total_days = max(1, (trip.end_date - trip.start_date).days + 1)
    return TripDetailResponse(
        id=trip.id,
        user_id=trip.user_id,
        public_id=trip.public_id,
        title=trip.title,
        description=trip.description,
        start_date=trip.start_date,
        end_date=trip.end_date,
        budget_limit=trip.budget_limit,
        is_public=trip.is_public,
        created_at=trip.created_at,
        updated_at=trip.updated_at,
        stops=[],
        expenses=[],
        total_days=total_days
    )


@router.get("/{trip_id}", response_model=TripDetailResponse)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    trip = get_trip_or_404(db, trip_id)
    if not trip.is_public:
        if not current_user or current_user.id != trip.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to view this private trip."
            )

    total_days = max(1, (trip.end_date - trip.start_date).days + 1)
    return TripDetailResponse(
        id=trip.id,
        user_id=trip.user_id,
        public_id=trip.public_id,
        title=trip.title,
        description=trip.description,
        start_date=trip.start_date,
        end_date=trip.end_date,
        budget_limit=trip.budget_limit,
        is_public=trip.is_public,
        created_at=trip.created_at,
        updated_at=trip.updated_at,
        stops=trip.stops,
        expenses=trip.expenses,
        total_days=total_days
    )


@router.put("/{trip_id}", response_model=TripDetailResponse)
def update_trip(
    trip_id: int,
    trip_in: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = get_trip_or_404(db, trip_id)
    verify_trip_ownership(trip, current_user)

    if trip_in.title is not None:
        trip.title = trip_in.title
    if trip_in.description is not None:
        trip.description = trip_in.description
    if trip_in.start_date is not None:
        trip.start_date = trip_in.start_date
    if trip_in.end_date is not None:
        trip.end_date = trip_in.end_date
    if trip_in.budget_limit is not None:
        trip.budget_limit = trip_in.budget_limit
    if trip_in.is_public is not None:
        trip.is_public = trip_in.is_public

    # Validate that existing stops fit into new trip dates
    for stop in trip.stops:
        if stop.start_date < trip.start_date or stop.end_date > trip.end_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Existing stop '{stop.city.name if stop.city else stop.id}' ({stop.start_date} to {stop.end_date}) falls outside new trip dates ({trip.start_date} to {trip.end_date}). Update stop dates first."
            )

    db.commit()
    db.refresh(trip)

    total_days = max(1, (trip.end_date - trip.start_date).days + 1)
    return TripDetailResponse(
        id=trip.id,
        user_id=trip.user_id,
        public_id=trip.public_id,
        title=trip.title,
        description=trip.description,
        start_date=trip.start_date,
        end_date=trip.end_date,
        budget_limit=trip.budget_limit,
        is_public=trip.is_public,
        created_at=trip.created_at,
        updated_at=trip.updated_at,
        stops=trip.stops,
        expenses=trip.expenses,
        total_days=total_days
    )


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = get_trip_or_404(db, trip_id)
    verify_trip_ownership(trip, current_user)

    db.delete(trip)
    db.commit()
    return None
