from datetime import datetime

from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Car(Base):
    __tablename__ = "cars"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)

    make: Mapped[str | None] = mapped_column(String(64), index=True)
    make_ja: Mapped[str | None] = mapped_column(String(64))
    model: Mapped[str | None] = mapped_column(String(128), index=True)
    model_ja: Mapped[str | None] = mapped_column(String(128))
    grade: Mapped[str | None] = mapped_column(String(255))

    year: Mapped[int | None] = mapped_column(Integer, index=True)
    mileage_km: Mapped[int | None] = mapped_column(Integer, index=True)
    price_jpy: Mapped[int | None] = mapped_column(BigInteger, index=True)
    price_total_jpy: Mapped[int | None] = mapped_column(BigInteger)

    body_type: Mapped[str | None] = mapped_column(String(64), index=True)
    body_type_ja: Mapped[str | None] = mapped_column(String(64))
    transmission: Mapped[str | None] = mapped_column(String(32))
    transmission_ja: Mapped[str | None] = mapped_column(String(32))
    fuel: Mapped[str | None] = mapped_column(String(32))
    fuel_ja: Mapped[str | None] = mapped_column(String(32))
    drive: Mapped[str | None] = mapped_column(String(16))
    engine_cc: Mapped[int | None] = mapped_column(Integer)
    color: Mapped[str | None] = mapped_column(String(64))
    color_ja: Mapped[str | None] = mapped_column(String(64))

    location: Mapped[str | None] = mapped_column(String(128))
    dealer: Mapped[str | None] = mapped_column(String(255))

    inspection_until: Mapped[str | None] = mapped_column(String(32))
    repaired: Mapped[bool | None] = mapped_column()

    primary_image: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    images: Mapped[list["CarImage"]] = relationship(
        back_populates="car", cascade="all, delete-orphan", order_by="CarImage.position"
    )
    price_history: Mapped[list["PriceHistory"]] = relationship(
        back_populates="car", cascade="all, delete-orphan", order_by="PriceHistory.observed_at.desc()"
    )

    __table_args__ = (
        Index("ix_cars_make_model", "make", "model"),
        Index("ix_cars_year_price", "year", "price_jpy"),
    )


class CarImage(Base):
    __tablename__ = "car_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0)

    car: Mapped[Car] = relationship(back_populates="images")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id", ondelete="CASCADE"), index=True)
    price_jpy: Mapped[int] = mapped_column(BigInteger, nullable=False)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    car: Mapped[Car] = relationship(back_populates="price_history")
