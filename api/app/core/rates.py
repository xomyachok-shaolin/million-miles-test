"""Кеширование курсов валют ЦБ РФ (daily_json.js). Хранится в Redis TTL 6 часов."""
import json
import logging
import time
from typing import Any

import httpx
import redis

from app.core.config import settings

log = logging.getLogger(__name__)

CBR_URL = "https://www.cbr-xml-daily.ru/daily_json.js"
CACHE_KEY = "cbr:rates:v1"
CACHE_TTL = 6 * 3600

_redis: redis.Redis | None = None


def _rds() -> redis.Redis:
    global _redis
    if _redis is None:
        _redis = redis.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, decode_responses=True)
    return _redis


async def _fetch_cbr() -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=10.0) as c:
        r = await c.get(CBR_URL)
        r.raise_for_status()
        return r.json()


async def get_rates() -> dict[str, float]:
    """Возвращает {'JPY_to_RUB': float, 'USD_to_RUB': float, 'EUR_to_RUB': float, 'timestamp': int}."""
    r = _rds()
    try:
        cached = r.get(CACHE_KEY)
        if cached:
            return json.loads(cached)
    except redis.RedisError as e:
        log.warning("redis get failed: %s", e)

    try:
        data = await _fetch_cbr()
        valute = data.get("Valute", {})
        jpy = valute.get("JPY", {})
        usd = valute.get("USD", {})
        eur = valute.get("EUR", {})
        rates = {
            "JPY_to_RUB": (jpy.get("Value") or 0) / (jpy.get("Nominal") or 1),
            "USD_to_RUB": (usd.get("Value") or 0) / (usd.get("Nominal") or 1),
            "EUR_to_RUB": (eur.get("Value") or 0) / (eur.get("Nominal") or 1),
            "timestamp": int(time.time()),
        }
        try:
            r.setex(CACHE_KEY, CACHE_TTL, json.dumps(rates))
        except redis.RedisError as e:
            log.warning("redis set failed: %s", e)
        return rates
    except Exception as e:
        log.warning("cbr fetch failed: %s", e)
        return {"JPY_to_RUB": 0.0, "USD_to_RUB": 0.0, "EUR_to_RUB": 0.0, "timestamp": int(time.time())}
