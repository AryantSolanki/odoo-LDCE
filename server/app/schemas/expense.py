import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ExpenseBase(BaseModel):
    category: str = "Other"  # Transport, Stay, Activity, Meal, Other
    amount: float = Field(..., ge=0)
    date: datetime.date
    description: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: int
    trip_id: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
