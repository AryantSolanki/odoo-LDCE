import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.activity import ActivityResponse


class CityBase(BaseModel):
    name: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    avg_daily_cost: float = 100.0
    avg_meal_cost: float = 25.0


class CityCreate(CityBase):
    pass


class CityResponse(CityBase):
    id: int
    created_at: datetime.datetime
    activities: List[ActivityResponse] = []

    model_config = ConfigDict(from_attributes=True)
