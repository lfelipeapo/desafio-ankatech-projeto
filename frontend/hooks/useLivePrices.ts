'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { connectPriceWS } from '@/lib/ws';

export type LiveTick = { symbol: string; price?: number; daily_change_pct?: number };
type MapTick = Record<string, LiveTick>;

export function useLivePrices(symbols: string[]) {
  const [ticks, setTicks] = useState<MapTick>({});
  const [lastUpdated, setLastUpdated] = useState<Date|null>(null);
  const sockets = useRef<Record<string, WebSocket>>({});

  const uniq = useMemo(() => Array.from(new Set(symbols.filter(Boolean))), [symbols]);

  useEffect(() => {
    uniq.forEach((sym) => {
      if (sockets.current[sym]) return;
      try {
        const ws = connectPriceWS(sym);
        sockets.current[sym] = ws;
        ws.onmessage = (ev) => {
          try {
            const msg = JSON.parse(ev.data);
            const key = (msg.ticker || msg.symbol || sym) as string;
            setTicks((prev) => ({
              ...prev,
              [key]: {
                symbol: key,
                price: typeof msg.price === 'number' ? msg.price : prev[key]?.price,
                daily_change_pct: typeof msg.daily_change_pct === 'number' ? msg.daily_change_pct : prev[key]?.daily_change_pct,
              },
            }));
            setLastUpdated(new Date());
          } catch {}
        };
        ws.onerror = () => {};
      } catch {}
    });
    return () => {
      Object.values(sockets.current).forEach((ws) => { try { ws.close(); } catch {} });
      sockets.current = {};
    };
  }, [uniq]);

  return { ticks, lastUpdated };
}
