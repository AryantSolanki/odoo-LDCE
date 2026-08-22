import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base


class TripStop(Base):
    __tablename__ = "trip_stops"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False, index=True)
    order_index = Column(Integer, default=0, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    transport_mode = Column(String(100), default="Flight", nullable=False)
    transport_cost = Column(Float, default=0.0, nullable=False)
    stay_cost_per_night = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False
    )

    trip = relationship("Trip", back_populates="stops")
    city = relationship("City", back_populates="stops")
    trip_activities = relationship(
        "TripActivity",
        back_populates="stop",
        cascade="all, delete-orphan",
        order_by="TripActivity.date"
    )
