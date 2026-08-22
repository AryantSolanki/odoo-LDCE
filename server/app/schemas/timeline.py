import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class TimelineEvent(BaseModel):
    id: str
    event_type: str  # 'stop_arrival', 'stop_departure', 'activity', 'travel'
    title: str
    description: Optional[str] = None
    city_name: Optional[str] = None
    cost: float = 0.0
    time: Optional[str] = None
    is_completed: bool = False


class TimelineDay(BaseModel):
    date: datetime.date
    day_number: int
    city_name: Optional[str] = None
    events: List[TimelineEvent] = []


class TimelineResponse(BaseModel):
    trip_id: int
    trip_title: str
    start_date: datetime.date
    end_date: datetime.date
    total_days: int
    days: List[TimelineDay] = []

    model_config = ConfigDict(from_attributes=True)
