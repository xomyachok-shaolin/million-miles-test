import asyncio
import logging
import signal
import sys

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.config import settings
from app.parser import scrape
from app.upsert import save_batch

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
log = logging.getLogger("worker")


async def run_once() -> None:
    log.info("scrape start: url=%s pages=%d", settings.SCRAPE_START_URL, settings.SCRAPE_MAX_PAGES)
    try:
        items = await scrape(
            settings.SCRAPE_START_URL,
            settings.SCRAPE_MAX_PAGES,
            settings.SCRAPE_CONCURRENCY,
        )
        saved = save_batch(items)
        log.info("scrape done: parsed=%d saved=%d", len(items), saved)
    except Exception as e:
        log.exception("scrape failed: %s", e)


async def main() -> None:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        run_once,
        IntervalTrigger(minutes=settings.SCRAPE_INTERVAL_MINUTES),
        id="scrape",
        max_instances=1,
        coalesce=True,
    )
    scheduler.start()
    log.info("scheduler started (every %d min); kicking first run now", settings.SCRAPE_INTERVAL_MINUTES)
    asyncio.create_task(run_once())

    stop = asyncio.Event()

    def _shutdown():
        log.info("shutting down")
        stop.set()

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, _shutdown)

    await stop.wait()
    scheduler.shutdown(wait=False)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(0)
