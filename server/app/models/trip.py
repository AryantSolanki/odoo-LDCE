import datetime
import uuid
from sqlalchemy import Column, Integer, String, Float, Text, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base


def generate_uuid():
    return str(uuid.uuid4())


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    budget_limit = Column(Float, default=0.0, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    public_id = Column(String(64), unique=True, index=True, default=generate_uuid, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow,
        nullable=False
    )

    user = relationship("User", back_populates="trips")
    stops = relationship(
        "TripStop",
        back_populates="trip",
        cascade="all, delete-orphan",
        order_by="TripStop.order_index"
    )
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
