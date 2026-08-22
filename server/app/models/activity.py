import datetime
from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), index=True, nullable=False, default="Sightseeing")
    cost = Column(Float, default=0.0, nullable=False)
    duration_hours = Column(Float, default=2.0, nullable=False)
    rating = Column(Float, default=4.5, nullable=False)
    image_url = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    city = relationship("City", back_populates="activities")
    trip_activities = relationship("TripActivity", back_populates="activity")
