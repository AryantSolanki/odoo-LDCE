from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.auth.dependencies import get_current_user
from app.utils.validators import verify_trip_ownership, get_trip_or_404

router = APIRouter(tags=["Expenses"])


@router.post("/trips/{trip_id}/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def add_expense(
    trip_id: int,
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = get_trip_or_404(db, trip_id)
    verify_trip_ownership(trip, current_user)

    expense = Expense(
        trip_id=trip_id,
        category=expense_in.category,
        amount=expense_in.amount,
        date=expense_in.date,
        description=expense_in.description
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with ID {expense_id} not found."
        )
    verify_trip_ownership(expense.trip, current_user)

    db.delete(expense)
    db.commit()
    return None
