from __future__ import annotations
import asyncio, os
from typing import Any, Dict, List, Optional
from datetime import date
from sqlalchemy import select
from database import async_session
import models
import httpx
import redis.asyncio as redis
REDIS_URL = os.environ.get("REDIS_URL","redis://localhost:6379/0")
CACHE_TTL = int(os.environ.get("PRICE_CACHE_TTL","3600"))
async def _get_redis(): return redis.from_url(REDIS_URL, encoding="utf-8", decode_responses=True)
async def _backoff(attempt:int): await asyncio.sleep(min(2**attempt, 30))

async def yahoo_search(query: str) -> List[Dict[str, Any]]:
    url = "https://query2.finance.yahoo.com/v1/finance/search"; params={"q":query,"quotesCount":10,"newsCount":0}
    async with httpx.AsyncClient(timeout=10) as client:
        for i in range(4):
            try:
                r = await client.get(url, params=params); r.raise_for_status()
                data = r.json(); quotes = data.get("quotes",[])
                return [{"symbol":q.get("symbol"),"shortname":q.get("shortname")} for q in quotes if q.get("symbol")]
            except Exception:
                if i==3: raise
                await _backoff(i)
    return []

_RATE_KEY = "rate:yy:ts"  # janela simples por segundo
_FAIL_KEY = "rate:yy:fail"  # contador de falhas 429

async def _throttle(client: httpx.AsyncClient) -> None:
    r = await _get_redis()
    # janela de 1 segundo com burst 2
    ts = await r.incr(_RATE_KEY)
    if ts == 1:
        await r.expire(_RATE_KEY, 1)
    elif ts > 2:
        # dorme até janela expirar
        await asyncio.sleep(1)

async def yahoo_quote(symbol: str) -> Optional[Dict[str, Any]]:
    url = "https://query2.finance.yahoo.com/v7/finance/quote"; params={"symbols":symbol}
    async with httpx.AsyncClient(timeout=10) as client:
        for i in range(4):
            try:
                await _throttle(client)
                r = await client.get(url, params=params); r.raise_for_status()
                res = r.json().get("quoteResponse",{}).get("result",[]); return res[0] if res else None
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429:
                    r = await _get_redis(); await r.incrby(_FAIL_KEY, 1); await r.expire(_FAIL_KEY, 60)
                if i==3: raise
                await _backoff(i)
            except Exception:
                if i==3: raise
                await _backoff(i)
    return None

async def get_current_price(symbol: str) -> Optional[float]:
    key=f"price:{symbol.upper()}"; r=await _get_redis(); cached=await r.get(key)
    if cached:
        try: return float(cached)
        except: pass
    # Circuit breaker: se muitas falhas, não chamar remoto agora
    fail = await r.get(_FAIL_KEY)
    if fail and int(fail) >= 5:
        # usar fallback imediatamente
        prev = await get_previous_close(symbol)
        if prev is not None:
            await r.setex(key, CACHE_TTL, str(prev))
            await r.setex(f"last_good:{symbol.upper()}", CACHE_TTL*6, str(prev))
            return float(prev)
        lg = await r.get(f"last_good:{symbol.upper()}")
        return float(lg) if lg else None
    q = await yahoo_quote(symbol)
    if not q:
        # fallback em cascata
        prev = await get_previous_close(symbol)
        if prev is not None:
            await r.setex(key, CACHE_TTL, str(prev))
            await r.setex(f"last_good:{symbol.upper()}", CACHE_TTL*6, str(prev))
            return float(prev)
        lg = await r.get(f"last_good:{symbol.upper()}")
        return float(lg) if lg else None
    price = q.get("regularMarketPrice") or q.get("regularMarketPreviousClose")
    if price is not None:
        await r.setex(key, CACHE_TTL, str(price))
        await r.setex(f"last_good:{symbol.upper()}", CACHE_TTL*6, str(price))
    return float(price) if price is not None else None

async def get_previous_close(symbol: str) -> Optional[float]:
    # Tenta cache primeiro
    key=f"prev:{symbol.upper()}"; r=await _get_redis(); cached=await r.get(key)
    if cached:
        try: return float(cached)
        except: pass
    q = await yahoo_quote(symbol)
    prev = None if not q else q.get("regularMarketPreviousClose")
    if prev is None:
        # Fallback: usa tabela daily_returns
        async with async_session() as s:  # type: ignore[call-arg]
            a = (await s.execute(select(models.Asset).where(models.Asset.ticker == symbol))).scalar_one_or_none()
            if a:
                row = (await s.execute(select(models.DailyReturn).where(models.DailyReturn.asset_id==a.id).order_by(models.DailyReturn.date.desc()))).scalars().first()
                if row: prev = row.close_price
    if prev is not None:
        try: await r.setex(key, CACHE_TTL, str(prev))
        except: pass
    return float(prev) if prev is not None else None
