from __future__ import annotations
import os, asyncio
from datetime import date
from celery import Celery
from celery.schedules import crontab
from sqlalchemy import select
from .database import async_session
from . import models
from .pricing import get_previous_close

broker_url = os.environ.get("REDIS_URL","redis://localhost:6379/0")
celery_app = Celery("tasks", broker=broker_url, backend=broker_url)
HOUR = int(os.environ.get("BEAT_HOUR","2")); MINUTE=int(os.environ.get("BEAT_MINUTE","0"))
celery_app.conf.beat_schedule = {"update-daily-returns":{"task":"backend.tasks.update_daily_returns","schedule": crontab(hour=HOUR, minute=MINUTE)}}
celery_app.conf.timezone = "UTC"

@celery_app.task(name="backend.tasks.update_daily_returns")
def update_daily_returns() -> None:
    async def _run():
        async with async_session() as session:  # type: ignore[call-arg]
            res = await session.execute(select(models.Asset)); assets = res.scalars().all()
            for asset in assets:
                price = await get_previous_close(asset.ticker)
                if price is None: continue
                dr = models.DailyReturn(asset_id=asset.id, date=date.today(), close_price=price)
                session.add(dr)
            await session.commit()
    asyncio.run(_run())
