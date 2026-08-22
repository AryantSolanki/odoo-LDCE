from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.trip import Trip
from app.schemas.share import ShareResponse
from app.schemas.trip import TripDetailResponse
from app.auth.dependencies import get_current_user
from app.utils.validators import verify_trip_ownership, get_trip_or_404

router = APIRouter(tags=["Sharing"])


@router.post("/trips/{trip_id}/share", response_model=ShareResponse)
def share_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = get_trip_or_404(db, trip_id)
    verify_trip_ownership(trip, current_user)

    # Enable public access if not enabled
    trip.is_public = True
    db.commit()
    db.refresh(trip)

    return ShareResponse(
        trip_id=trip.id,
        public_id=trip.public_id,
        share_url=f"/shared/{trip.public_id}",
        is_public=trip.is_public
    )


@router.get("/shared/{public_id}", response_model=TripDetailResponse)
def get_shared_trip(
    public_id: str,
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.public_id == public_id).first()
    if not trip or not trip.is_public:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shared trip not found or is no longer public."
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
