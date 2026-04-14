from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import Car, CarImage, PriceHistory


def upsert_car(db: Session, data: dict) -> Car:
    images = data.pop("images", [])
    car = db.query(Car).filter(Car.source_id == data["source_id"]).first()

    if car is None:
        car = Car(**data)
        db.add(car)
        db.flush()
        for i, url in enumerate(images):
            db.add(CarImage(car_id=car.id, url=url, position=i))
        if data.get("price_jpy"):
            db.add(PriceHistory(car_id=car.id, price_jpy=data["price_jpy"]))
        return car

    old_price = car.price_jpy
    for k, v in data.items():
        if v is not None:
            setattr(car, k, v)
    car.last_seen_at = datetime.now(timezone.utc)

    if images:
        db.query(CarImage).filter(CarImage.car_id == car.id).delete()
        for i, url in enumerate(images):
            db.add(CarImage(car_id=car.id, url=url, position=i))

    new_price = data.get("price_jpy")
    if new_price and new_price != old_price:
        db.add(PriceHistory(car_id=car.id, price_jpy=new_price))

    return car


def save_batch(items: list[dict]) -> int:
    saved = 0
    with SessionLocal() as db:
        for item in items:
            try:
                upsert_car(db, item)
                saved += 1
            except Exception:
                db.rollback()
                continue
        db.commit()
    return saved
