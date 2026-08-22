import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base


class TripActivity(Base):
    __tablename__ = "trip_activities"

    id = Column(Integer, primary_key=True, index=True)
    stop_id = Column(Integer, ForeignKey("trip_stops.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    cost = Column(Float, default=0.0, nullable=False)
    date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    stop = relationship("TripStop", back_populates="trip_activities")
    activity = relationship("Activity", back_populates="trip_activities")
