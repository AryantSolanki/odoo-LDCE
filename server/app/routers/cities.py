from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.city import City
from app.schemas.city import CityResponse

router = APIRouter(prefix="/cities", tags=["Cities"])


@router.get("", response_model=List[CityResponse])
def list_cities(
    q: Optional[str] = None,
    country: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(City)
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            (City.name.ilike(search_pattern)) | (City.country.ilike(search_pattern))
        )
    if country:
        query = query.filter(City.country.ilike(f"%{country}%"))

    cities = query.order_by(City.name).all()
    return cities


@router.get("/{city_id}", response_model=CityResponse)
def get_city(city_id: int, db: Session = Depends(get_db)):
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"City with ID {city_id} not found."
        )
    return city
