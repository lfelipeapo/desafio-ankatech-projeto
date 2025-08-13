"use client";
import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { connectPriceWS } from '@/lib/ws';
import Spinner from '@/components/ui/spinner';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceData {
  ticker: string;
  price: number;
  change?: number;
  change_percent?: number;
  timestamp: string;
}

export default function LivePrice(){
  const [symbol, setSymbol] = useState('AAPL');
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(()=>{
    try{ wsRef.current?.close(); }catch{}
    setIsConnecting(true);
    setConnectionStatus('disconnected');
    setPriceData(null);
    
    const ws = connectPriceWS(symbol);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setIsConnecting(false);
      setConnectionStatus('connected');
    };
    
    ws.onmessage = (ev)=>{
      try{ 
        const data = JSON.parse(ev.data); 
        if (typeof data.price === 'number') {
          setPriceData({
            ticker: data.ticker || symbol,
            price: data.price,
            change: data.change || 0,
            change_percent: data.change_percent || 0,
            timestamp: data.timestamp || new Date().toISOString()
          });
          setIsConnecting(false);
          setConnectionStatus('connected');
        }
      }catch(error){
        console.error('Erro ao processar dados do WebSocket:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
      setIsConnecting(false);
      setConnectionStatus('error');
    };
    
    ws.onclose = () => {
      setConnectionStatus('disconnected');
      setIsConnecting(false);
    };
    
    return ()=> { 
      try{ 
        ws.close(); 
      }catch{} 
    };
  }, [symbol]);
  
  const getTrendIcon = (change?: number) => {
    if (!change) return <Minus className="w-4 h-4 text-gray-500" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };
  
  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          Preço ao vivo
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'error' ? 'bg-red-500' : 
            'bg-gray-400'
          }`} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input 
              value={symbol} 
              onChange={(e)=>setSymbol(e.target.value.toUpperCase())} 
              className="border rounded-lg px-3 py-2 bg-transparent w-28 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="AAPL"
            />
            <div className="text-2xl font-semibold">
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <span className="text-sm">Conectando...</span>
                </div>
              ) : priceData === null ? '—' : `$${priceData.price.toFixed(2)}`}
            </div>
          </div>
          
          {priceData && (
            <div className="flex items-center gap-2 text-sm">
              {getTrendIcon(priceData.change)}
              <span className={getChangeColor(priceData.change)}>
                {priceData.change ? (priceData.change > 0 ? '+' : '') + priceData.change.toFixed(2) : '0.00'}
              </span>
              <span className={getChangeColor(priceData.change_percent)}>
                ({priceData.change_percent ? (priceData.change_percent > 0 ? '+' : '') + priceData.change_percent.toFixed(2) : '0.00'}%)
              </span>
            </div>
          )}
          
          {connectionStatus === 'error' && (
            <div className="text-xs text-red-500">
              Erro na conexão. Tentando reconectar...
            </div>
          )}
          
          {priceData && (
            <div className="text-xs text-gray-500">
              Última atualização: {new Date(priceData.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


