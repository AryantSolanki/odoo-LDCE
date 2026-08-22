import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.activity import ActivityResponse


class TripActivityBase(BaseModel):
    title: str
    cost: float = Field(default=0.0, ge=0)
    date: datetime.date
    notes: Optional[str] = None
    is_completed: bool = False


class TripActivityCreate(BaseModel):
    activity_id: Optional[int] = None
    title: Optional[str] = None
    cost: Optional[float] = Field(default=None, ge=0)
    date: datetime.date
    notes: Optional[str] = None


class TripActivityUpdate(BaseModel):
    title: Optional[str] = None
    cost: Optional[float] = Field(default=None, ge=0)
    date: Optional[datetime.date] = None
    notes: Optional[str] = None
    is_completed: Optional[bool] = None


class TripActivityResponse(TripActivityBase):
    id: int
    stop_id: int
    activity_id: Optional[int] = None
    activity: Optional[ActivityResponse] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
