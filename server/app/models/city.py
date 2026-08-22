import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    country = Column(String(255), index=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(512), nullable=True)
    description = Column(Text, nullable=True)
    avg_daily_cost = Column(Float, default=100.0, nullable=False)
    avg_meal_cost = Column(Float, default=25.0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    activities = relationship("Activity", back_populates="city", cascade="all, delete-orphan")
    stops = relationship("TripStop", back_populates="city")
    saved_by_users = relationship("SavedDestination", back_populates="city", cascade="all, delete-orphan")
