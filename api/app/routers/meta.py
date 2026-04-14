from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from app.core.rates import get_rates
from app.db.session import get_db
from app.models.car import Car
from app.models.user import User
from app.routers.deps import current_user

router = APIRouter(tags=["meta"])


@router.get("/rates")
async def rates():
    return await get_rates()


@router.get("/stats")
def stats(db: Session = Depends(get_db), _: User = Depends(current_user)):
    total = db.query(func.count(Car.id)).scalar() or 0
    makes_count = db.query(func.count(distinct(Car.make))).scalar() or 0
    avg_price = db.query(func.avg(Car.price_jpy)).scalar()
    min_price = db.query(func.min(Car.price_jpy)).scalar()
    max_price = db.query(func.max(Car.price_jpy)).scalar()

    day_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    new_24h = db.query(func.count(Car.id)).filter(Car.created_at >= day_ago).scalar() or 0
    updated_recent = (
        db.query(func.max(Car.updated_at)).scalar() or datetime.now(timezone.utc)
    )

    top_makes = (
        db.query(Car.make, func.count(Car.id).label("cnt"))
        .filter(Car.make.isnot(None))
        .group_by(Car.make)
        .order_by(func.count(Car.id).desc())
        .limit(5)
        .all()
    )

    return {
        "total": total,
        "makes_count": makes_count,
        "avg_price_jpy": int(avg_price) if avg_price else None,
        "min_price_jpy": int(min_price) if min_price else None,
        "max_price_jpy": int(max_price) if max_price else None,
        "new_24h": new_24h,
        "last_updated_at": updated_recent.isoformat() if updated_recent else None,
        "top_makes": [{"make": m, "count": c} for m, c in top_makes],
    }
