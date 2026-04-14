from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CarImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    url: str
    position: int


class PricePoint(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    price_jpy: int
    observed_at: datetime


class CarListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    source_id: str
    url: str
    make: str | None
    model: str | None
    year: int | None
    mileage_km: int | None
    price_jpy: int | None
    body_type: str | None
    transmission: str | None
    fuel: str | None
    primary_image: str | None
    location: str | None
    updated_at: datetime


class CarDetail(CarListItem):
    make_ja: str | None
    model_ja: str | None
    grade: str | None
    price_total_jpy: int | None
    body_type_ja: str | None
    transmission_ja: str | None
    fuel_ja: str | None
    drive: str | None
    engine_cc: int | None
    color: str | None
    color_ja: str | None
    dealer: str | None
    inspection_until: str | None
    repaired: bool | None
    images: list[CarImageOut] = []
    price_history: list[PricePoint] = []


class CarListResponse(BaseModel):
    items: list[CarListItem]
    total: int
    page: int
    page_size: int
    pages: int
