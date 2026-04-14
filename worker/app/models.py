"""Зеркало моделей API — чтобы воркер мог писать в ту же БД без зависимости от пакета api."""
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Car(Base):
    __tablename__ = "cars"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    url: Mapped[str] = mapped_column(Text)
    make: Mapped[str | None] = mapped_column(String(64))
    make_ja: Mapped[str | None] = mapped_column(String(64))
    model: Mapped[str | None] = mapped_column(String(128))
    model_ja: Mapped[str | None] = mapped_column(String(128))
    grade: Mapped[str | None] = mapped_column(String(255))
    year: Mapped[int | None] = mapped_column(Integer)
    mileage_km: Mapped[int | None] = mapped_column(Integer)
    price_jpy: Mapped[int | None] = mapped_column(BigInteger)
    price_total_jpy: Mapped[int | None] = mapped_column(BigInteger)
    body_type: Mapped[str | None] = mapped_column(String(64))
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
    repaired: Mapped[bool | None] = mapped_column(Boolean)
    primary_image: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    images: Mapped[list["CarImage"]] = relationship(back_populates="car", cascade="all, delete-orphan")
    price_history: Mapped[list["PriceHistory"]] = relationship(back_populates="car", cascade="all, delete-orphan")


class CarImage(Base):
    __tablename__ = "car_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id", ondelete="CASCADE"))
    url: Mapped[str] = mapped_column(Text)
    position: Mapped[int] = mapped_column(Integer, default=0)

    car: Mapped[Car] = relationship(back_populates="images")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    car_id: Mapped[int] = mapped_column(ForeignKey("cars.id", ondelete="CASCADE"))
    price_jpy: Mapped[int] = mapped_column(BigInteger)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    car: Mapped[Car] = relationship(back_populates="price_history")
