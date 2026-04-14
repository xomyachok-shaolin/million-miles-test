"""Парсер CarSensor: листинг → детальные карточки → нормализованные dict для upsert."""
import logging
import re
from dataclasses import dataclass, field
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from playwright.async_api import Browser, BrowserContext, async_playwright

from app.dictionary import (
    translate_body,
    translate_color,
    translate_drive,
    translate_fuel,
    translate_make,
    translate_transmission,
)

log = logging.getLogger(__name__)

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
)


@dataclass
class CarRaw:
    source_id: str
    url: str
    make_ja: str | None = None
    model_ja: str | None = None
    grade: str | None = None
    year: int | None = None
    mileage_km: int | None = None
    price_jpy: int | None = None
    price_total_jpy: int | None = None
    body_type_ja: str | None = None
    transmission_ja: str | None = None
    fuel_ja: str | None = None
    drive: str | None = None
    engine_cc: int | None = None
    color_ja: str | None = None
    location: str | None = None
    dealer: str | None = None
    inspection_until: str | None = None
    repaired: bool | None = None
    primary_image: str | None = None
    images: list[str] = field(default_factory=list)


_num_re = re.compile(r"[\d,\.]+")


def _to_int(s: str | None) -> int | None:
    if not s:
        return None
    m = _num_re.search(s.replace(",", ""))
    if not m:
        return None
    try:
        return int(float(m.group()))
    except ValueError:
        return None


def _price_to_jpy(s: str | None) -> int | None:
    """CarSensor отображает цены в 万円 (10 000 иен). '248.9万円' → 2 489 000."""
    if not s:
        return None
    m = re.search(r"([\d,\.]+)\s*万", s)
    if m:
        try:
            return int(float(m.group(1).replace(",", "")) * 10_000)
        except ValueError:
            return None
    return _to_int(s)


def _mileage_to_km(s: str | None) -> int | None:
    """'4.5万km' → 45000, '55,000km' → 55000"""
    if not s:
        return None
    m = re.search(r"([\d,\.]+)\s*万\s*km", s)
    if m:
        try:
            return int(float(m.group(1).replace(",", "")) * 10_000)
        except ValueError:
            pass
    m = re.search(r"([\d,\.]+)\s*km", s)
    if m:
        return _to_int(m.group(1))
    return _to_int(s)


def _year_to_int(s: str | None) -> int | None:
    if not s:
        return None
    m = re.search(r"(\d{4})", s)
    return int(m.group(1)) if m else None


def parse_detail_html(url: str, html: str) -> CarRaw | None:
    soup = BeautifulSoup(html, "lxml")

    m = re.search(r"/detail/([A-Z0-9]+)/", url)
    source_id = m.group(1) if m else url

    car = CarRaw(source_id=source_id, url=url)

    h = soup.select_one("h1, .titleArea__main, .detailMaker")
    if h:
        text = h.get_text(" ", strip=True)
        parts = text.split()
        if parts:
            car.make_ja = parts[0]
            if len(parts) > 1:
                car.model_ja = parts[1]
        car.grade = text

    specs: dict[str, str] = {}
    for row in soup.select("table tr"):
        ths = row.select("th")
        tds = row.select("td")
        for th, td in zip(ths, tds):
            k = th.get_text(" ", strip=True)
            v = td.get_text(" ", strip=True)
            if k and v:
                specs[k] = v

    def pick(*keys: str) -> str | None:
        for k in keys:
            for label, val in specs.items():
                if k in label:
                    return val
        return None

    car.year = _year_to_int(pick("年式"))
    car.mileage_km = _mileage_to_km(pick("走行距離"))
    car.price_jpy = _price_to_jpy(pick("本体価格"))
    car.price_total_jpy = _price_to_jpy(pick("支払総額"))
    car.body_type_ja = pick("ボディタイプ", "ボディ")
    car.transmission_ja = pick("ミッション", "シフト")
    car.fuel_ja = pick("燃料")
    car.drive = pick("駆動方式", "駆動")
    car.engine_cc = _to_int(pick("排気量"))
    car.color_ja = pick("カラー", "色")
    car.location = pick("所在地")
    car.inspection_until = pick("車検")
    repaired = pick("修復歴")
    if repaired:
        car.repaired = "あり" in repaired

    dealer = soup.select_one(".shopName, .shop__name, [class*=shop]")
    if dealer:
        car.dealer = dealer.get_text(" ", strip=True)[:255]

    for img in soup.select("img[src]"):
        src = img.get("src") or ""
        if ("ccsrpcml" in src or "carsensor" in src) and src.startswith("http"):
            full = urljoin(url, src)
            if full not in car.images:
                car.images.append(full)
            if len(car.images) >= 10:
                break

    if car.images:
        car.primary_image = car.images[0]

    return car


def normalize(raw: CarRaw) -> dict:
    make_en, make_ja = translate_make(raw.make_ja)
    body_en, body_ja = translate_body(raw.body_type_ja)
    tr_en, tr_ja = translate_transmission(raw.transmission_ja)
    fuel_en, fuel_ja = translate_fuel(raw.fuel_ja)
    color_en, color_ja = translate_color(raw.color_ja)
    drive = translate_drive(raw.drive)

    return dict(
        source_id=raw.source_id,
        url=raw.url,
        make=make_en,
        make_ja=make_ja,
        model=raw.model_ja,
        model_ja=raw.model_ja,
        grade=raw.grade,
        year=raw.year,
        mileage_km=raw.mileage_km,
        price_jpy=raw.price_jpy,
        price_total_jpy=raw.price_total_jpy,
        body_type=body_en,
        body_type_ja=body_ja,
        transmission=tr_en,
        transmission_ja=tr_ja,
        fuel=fuel_en,
        fuel_ja=fuel_ja,
        drive=drive,
        engine_cc=raw.engine_cc,
        color=color_en,
        color_ja=color_ja,
        location=raw.location,
        dealer=raw.dealer,
        inspection_until=raw.inspection_until,
        repaired=raw.repaired,
        primary_image=raw.primary_image,
        images=raw.images,
    )


async def _extract_detail_urls(context: BrowserContext, list_url: str) -> list[str]:
    page = await context.new_page()
    try:
        await page.goto(list_url, wait_until="domcontentloaded", timeout=45_000)
        await page.wait_for_timeout(1500)
        html = await page.content()
    finally:
        await page.close()

    soup = BeautifulSoup(html, "lxml")
    urls: list[str] = []
    for a in soup.select("a[href*='/usedcar/detail/']"):
        href = a.get("href")
        if not href:
            continue
        full = urljoin(list_url, href.split("?")[0])
        if "/usedcar/detail/" in full and full not in urls:
            urls.append(full)
    return urls


async def _fetch_detail(context: BrowserContext, url: str) -> CarRaw | None:
    page = await context.new_page()
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=45_000)
        await page.wait_for_timeout(1000)
        html = await page.content()
        return parse_detail_html(url, html)
    except Exception as e:
        log.warning("fetch_detail %s: %s", url, e)
        return None
    finally:
        await page.close()


async def scrape(list_url: str, max_pages: int, concurrency: int) -> list[dict]:
    results: list[dict] = []
    async with async_playwright() as p:
        browser: Browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context: BrowserContext = await browser.new_context(
            user_agent=USER_AGENT, locale="ja-JP", viewport={"width": 1280, "height": 900}
        )
        try:
            detail_urls: list[str] = []
            for page_num in range(1, max_pages + 1):
                url = list_url if page_num == 1 else f"{list_url}?page={page_num}"
                urls = await _extract_detail_urls(context, url)
                log.info("listing page=%d urls=%d", page_num, len(urls))
                if not urls:
                    break
                detail_urls.extend(urls)

            seen = set()
            unique_urls = [u for u in detail_urls if not (u in seen or seen.add(u))]
            log.info("total unique detail urls: %d", len(unique_urls))

            import asyncio

            sem = asyncio.Semaphore(concurrency)

            async def worker(u: str):
                async with sem:
                    raw = await _fetch_detail(context, u)
                    if raw:
                        results.append(normalize(raw))

            await asyncio.gather(*(worker(u) for u in unique_urls))
        finally:
            await context.close()
            await browser.close()
    return results
