import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ActivityBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Sightseeing"
    cost: float = Field(default=0.0, ge=0)
    duration_hours: float = Field(default=2.0, gt=0)
    rating: float = Field(default=4.5, ge=0, le=5)
    image_url: Optional[str] = None


class ActivityCreate(ActivityBase):
    city_id: int


class ActivityResponse(ActivityBase):
    id: int
    city_id: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
