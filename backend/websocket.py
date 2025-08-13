from __future__ import annotations
import asyncio, json, random
from typing import Dict, List
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect

# Gerenciador de conexões WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            self.disconnect(websocket)

    async def broadcast(self, message: str):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                disconnected.append(connection)
        
        # Remove conexões desconectadas
        for conn in disconnected:
            self.disconnect(conn)

manager = ConnectionManager()

# Cache simples de preços para simular dados reais
price_cache = {
    "AAPL": 150.25,
    "GOOGL": 2800.50,
    "MSFT": 350.75,
    "TSLA": 800.30,
    "AMZN": 3200.15,
    "PETR4.SA": 35.80,
    "VALE3.SA": 68.45,
    "ITUB4.SA": 28.90
}

def get_simulated_price(symbol: str) -> float:
    """Gera preços simulados com variação realística."""
    base_price = price_cache.get(symbol, 100.0)
    # Variação de -2% a +2%
    variation = random.uniform(-0.02, 0.02)
    new_price = base_price * (1 + variation)
    price_cache[symbol] = new_price
    return round(new_price, 2)

async def price_stream(websocket: WebSocket, symbol: str = "AAPL") -> None:
    """Envia atualizações de preço via WebSocket para um ticker fornecido.

    O cliente conecta‑se em `/ws/prices/{symbol}` e recebe um JSON com
    o ticker, o preço atual e um carimbo de tempo aproximado a cada 5s.
    """
    await manager.connect(websocket)
    try:
        while True:
            try:
                price = get_simulated_price(symbol)
                change = round(random.uniform(-5, 5), 2)
                change_percent = round(random.uniform(-3, 3), 2)
                
                payload: Dict[str, float | str] = {
                    "ticker": symbol,
                    "price": price,
                    "timestamp": datetime.now().isoformat(),
                    "change": change,
                    "change_percent": change_percent
                }
                
                await manager.send_personal_message(json.dumps(payload), websocket)
                
            except Exception as e:
                print(f"Erro no WebSocket: {e}")
                break
            
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        return
    except Exception as e:
        print(f"Erro geral no WebSocket: {e}")
        manager.disconnect(websocket)
        return

# WebSocket para múltiplos símbolos (dashboard)
async def dashboard_price_stream(websocket: WebSocket) -> None:
    """Envia atualizações de preços para múltiplos símbolos para o dashboard."""
    await manager.connect(websocket)
    
    # Símbolos padrão para demonstração
    symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "PETR4.SA", "VALE3.SA", "ITUB4.SA"]
    
    try:
        while True:
            try:
                prices_data = []
                
                for symbol in symbols:
                    try:
                        price = get_simulated_price(symbol)
                        change = round(random.uniform(-5, 5), 2)
                        change_percent = round(random.uniform(-3, 3), 2)
                        
                        prices_data.append({
                            "ticker": symbol,
                            "price": price,
                            "change": change,
                            "change_percent": change_percent,
                            "timestamp": datetime.now().isoformat()
                        })
                    except Exception as e:
                        print(f"Erro ao obter preço para {symbol}: {e}")
                        continue
                
                payload = {
                    "type": "price_update",
                    "data": prices_data,
                    "timestamp": datetime.now().isoformat()
                }
                
                await manager.send_personal_message(json.dumps(payload), websocket)
                
            except Exception as e:
                print(f"Erro no dashboard WebSocket: {e}")
                await asyncio.sleep(5)
            
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        return
    except Exception as e:
        print(f"Erro geral no dashboard WebSocket: {e}")
        manager.disconnect(websocket)
        return
