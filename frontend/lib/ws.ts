export function wsBase() {
  // 1) Prefer variável explícita NEXT_PUBLIC_WS_BASE
  const wsEnv = (process.env.NEXT_PUBLIC_WS_BASE || '').trim();
  if (wsEnv) {
    try {
      const u = new URL(wsEnv);
      const host = (typeof window !== 'undefined' && u.hostname === 'backend') ? (window.location.hostname || 'localhost') : u.hostname;
      const proto = u.protocol === 'wss:' || u.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${proto}//${host}${u.port ? `:${u.port}` : ''}`;
    } catch {
      // cai para resolução via API base
    }
  }
  // 2) Derivar de NEXT_PUBLIC_API_BASE como fallback
  const http = (process.env.NEXT_PUBLIC_API_BASE || '').trim();
  if (http) {
    try {
      const u = new URL(http);
      const host = (typeof window !== 'undefined' && u.hostname === 'backend') ? (window.location.hostname || 'localhost') : u.hostname;
      const proto = u.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${proto}//${host}${u.port ? `:${u.port}` : ''}`;
    } catch {
      // ignora parse
    }
  }
  // 3) Último recurso: usa host atual do navegador com porta 8000
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const proto = protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${hostname || 'localhost'}:8000`;
  }
  return '';
}

export function connectPriceWS(symbol: string) {
  const base = wsBase();
  if (!base) throw new Error('WS base not set');
  const url = `${base}/ws/prices/${encodeURIComponent(symbol)}`;
  return new WebSocket(url);
}

// Nova função para conectar ao WebSocket do dashboard
export function connectDashboardWS() {
  const base = wsBase();
  if (!base) throw new Error('WS base not set');
  const url = `${base}/ws/dashboard`;
  return new WebSocket(url);
}

// Hook personalizado para o dashboard
export function useDashboardPrices() {
  if (typeof window === 'undefined') {
    return { prices: [], isConnected: false, lastUpdated: null };
  }

  const [prices, setPrices] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    
    const connect = () => {
      try {
        const ws = connectDashboardWS();
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('Dashboard WebSocket conectado');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'price_update' && Array.isArray(data.data)) {
              setPrices(data.data);
              setLastUpdated(new Date());
            }
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        };

        ws.onclose = () => {
          console.log('Dashboard WebSocket desconectado');
          setIsConnected(false);
          // Reconectar após 5 segundos
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = (error) => {
          console.error('Erro no Dashboard WebSocket:', error);
          setIsConnected(false);
        };

      } catch (error) {
        console.error('Erro ao conectar Dashboard WebSocket:', error);
        setIsConnected(false);
        // Tentar reconectar após 5 segundos
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { prices, isConnected, lastUpdated };
}

// Importações necessárias para o hook
import { useEffect, useRef, useState } from 'react';
