import math
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import asc, desc, distinct, func
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.car import Car
from app.models.user import User
from app.routers.deps import current_user
from app.schemas.car import CarDetail, CarListItem, CarListResponse

router = APIRouter(prefix="/cars", tags=["cars"])

SortField = Literal["price", "year", "mileage", "updated"]
SortDir = Literal["asc", "desc"]
SORT_MAP = {"price": Car.price_jpy, "year": Car.year, "mileage": Car.mileage_km, "updated": Car.updated_at}


@router.get("/filters")
def get_filters(
    db: Session = Depends(get_db),
    _: User = Depends(current_user),
):
    """Возвращает доступные значения для фильтров (для выпадающих списков)."""
    def distinct_non_null(col, limit: int = 50) -> list:
        return [
            v for (v,) in db.query(distinct(col))
            .filter(col.isnot(None), col != "")
            .order_by(col)
            .limit(limit)
            .all()
        ]

    year_min, year_max = db.query(func.min(Car.year), func.max(Car.year)).first() or (None, None)
    price_min, price_max = db.query(func.min(Car.price_jpy), func.max(Car.price_jpy)).first() or (None, None)
    mileage_min, mileage_max = db.query(func.min(Car.mileage_km), func.max(Car.mileage_km)).first() or (None, None)

    return {
        "makes": distinct_non_null(Car.make),
        "body_types": distinct_non_null(Car.body_type),
        "transmissions": distinct_non_null(Car.transmission),
        "fuels": distinct_non_null(Car.fuel),
        "drives": distinct_non_null(Car.drive),
        "year": {"min": year_min, "max": year_max},
        "price": {"min": price_min, "max": price_max},
        "mileage": {"min": mileage_min, "max": mileage_max},
    }


@router.get("", response_model=CarListResponse)
def list_cars(
    db: Session = Depends(get_db),
    _: User = Depends(current_user),
    make: str | None = None,
    model: str | None = None,
    body_type: str | None = None,
    transmission: str | None = None,
    fuel: str | None = None,
    drive: str | None = None,
    year_from: int | None = Query(None, ge=1950, le=2100),
    year_to: int | None = Query(None, ge=1950, le=2100),
    price_from: int | None = Query(None, ge=0),
    price_to: int | None = Query(None, ge=0),
    mileage_from: int | None = Query(None, ge=0),
    mileage_to: int | None = Query(None, ge=0),
    repaired: bool | None = None,
    q: str | None = Query(None, description="Поиск по make/model/grade"),
    sort: SortField = "updated",
    order: SortDir = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> CarListResponse:
    query = db.query(Car)

    if make:
        query = query.filter(Car.make.ilike(make))
    if model:
        query = query.filter(Car.model.ilike(f"%{model}%"))
    if body_type:
        query = query.filter(Car.body_type.ilike(body_type))
    if transmission:
        query = query.filter(Car.transmission.ilike(transmission))
    if fuel:
        query = query.filter(Car.fuel.ilike(fuel))
    if drive:
        query = query.filter(Car.drive.ilike(drive))
    if year_from is not None:
        query = query.filter(Car.year >= year_from)
    if year_to is not None:
        query = query.filter(Car.year <= year_to)
    if price_from is not None:
        query = query.filter(Car.price_jpy >= price_from)
    if price_to is not None:
        query = query.filter(Car.price_jpy <= price_to)
    if mileage_from is not None:
        query = query.filter(Car.mileage_km >= mileage_from)
    if mileage_to is not None:
        query = query.filter(Car.mileage_km <= mileage_to)
    if repaired is not None:
        query = query.filter(Car.repaired == repaired)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (Car.make.ilike(like))
            | (Car.model.ilike(like))
            | (Car.model_ja.ilike(like))
            | (Car.grade.ilike(like))
        )

    total = query.count()
    col = SORT_MAP[sort]
    query = query.order_by(asc(col) if order == "asc" else desc(col), desc(Car.id))
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    pages = max(1, math.ceil(total / page_size)) if total else 0

    return CarListResponse(
        items=[CarListItem.model_validate(c) for c in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{car_id}", response_model=CarDetail)
def get_car(
    car_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(current_user),
) -> CarDetail:
    car = (
        db.query(Car)
        .options(selectinload(Car.images), selectinload(Car.price_history))
        .filter(Car.id == car_id)
        .first()
    )
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return CarDetail.model_validate(car)
