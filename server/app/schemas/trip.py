import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.stop import StopResponse
from app.schemas.expense import ExpenseResponse


class TripBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: datetime.date
    end_date: datetime.date
    budget_limit: float = Field(default=0.0, ge=0)
    is_public: bool = False

    @model_validator(mode="after")
    def check_dates(self):
        if self.start_date > self.end_date:
            raise ValueError("Trip start_date must be before or equal to end_date")
        return self


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    budget_limit: Optional[float] = Field(default=None, ge=0)
    is_public: Optional[bool] = None

    @model_validator(mode="after")
    def check_dates(self):
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValueError("Trip start_date must be before or equal to end_date")
        return self


class TripResponse(TripBase):
    id: int
    user_id: int
    public_id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    stops_count: int = 0
    total_days: int = 0

    model_config = ConfigDict(from_attributes=True)


class TripDetailResponse(TripBase):
    id: int
    user_id: int
    public_id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    stops: List[StopResponse] = []
    expenses: List[ExpenseResponse] = []
    total_days: int = 0

    model_config = ConfigDict(from_attributes=True)
