import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.city import CityResponse
from app.schemas.trip_activity import TripActivityResponse


class StopBase(BaseModel):
    city_id: int
    start_date: datetime.date
    end_date: datetime.date
    transport_mode: str = "Flight"
    transport_cost: float = Field(default=0.0, ge=0)
    stay_cost_per_night: float = Field(default=0.0, ge=0)
    notes: Optional[str] = None

    @model_validator(mode="after")
    def check_dates(self):
        if self.start_date > self.end_date:
            raise ValueError("Stop start date must be before or equal to stop end date")
        return self


class StopCreate(StopBase):
    order_index: Optional[int] = None


class StopUpdate(BaseModel):
    city_id: Optional[int] = None
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    transport_mode: Optional[str] = None
    transport_cost: Optional[float] = Field(default=None, ge=0)
    stay_cost_per_night: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = None
    order_index: Optional[int] = None

    @model_validator(mode="after")
    def check_dates(self):
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValueError("Stop start date must be before or equal to stop end date")
        return self


class StopResponse(BaseModel):
    id: int
    trip_id: int
    city_id: int
    order_index: int
    start_date: datetime.date
    end_date: datetime.date
    transport_mode: str
    transport_cost: float
    stay_cost_per_night: float
    notes: Optional[str] = None
    city: CityResponse
    trip_activities: List[TripActivityResponse] = []
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class StopsReorderItem(BaseModel):
    stop_id: int
    order_index: int


class StopsReorderRequest(BaseModel):
    order: List[StopsReorderItem]
