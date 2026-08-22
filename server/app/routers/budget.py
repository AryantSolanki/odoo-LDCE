from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.budget import BudgetBreakdown
from app.services.budget_service import calculate_trip_budget
from app.auth.dependencies import get_optional_user
from app.utils.validators import get_trip_or_404

router = APIRouter(tags=["Budget"])


@router.get("/trips/{trip_id}/budget", response_model=BudgetBreakdown)
def get_trip_budget(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    trip = get_trip_or_404(db, trip_id)
    if not trip.is_public:
        if not current_user or current_user.id != trip.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to view budget for this private trip."
            )

    return calculate_trip_budget(db, trip)
