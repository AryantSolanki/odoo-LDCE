from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.timeline import TimelineResponse
from app.services.timeline_service import generate_trip_timeline
from app.auth.dependencies import get_optional_user
from app.utils.validators import get_trip_or_404

router = APIRouter(tags=["Timeline"])


@router.get("/trips/{trip_id}/timeline", response_model=TimelineResponse)
def get_trip_timeline(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    trip = get_trip_or_404(db, trip_id)
    if not trip.is_public:
        if not current_user or current_user.id != trip.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to view timeline for this private trip."
            )

    return generate_trip_timeline(db, trip)
