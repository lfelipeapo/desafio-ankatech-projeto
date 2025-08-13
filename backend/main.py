from __future__ import annotations
import uvicorn
from fastapi import FastAPI, WebSocket
import sys
import os

# Adiciona o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api import create_app
from websocket import price_stream, dashboard_price_stream

app: FastAPI = create_app()

@app.websocket("/ws/prices/{symbol}")
async def ws_prices(websocket: WebSocket, symbol: str) -> None:
    """WebSocket que transmite preços periódicos de um ticker específico.

    Para iniciar uma assinatura, conecte‑se a `/ws/prices/{symbol}` onde
    `symbol` é o ticker do ativo (ex.: AAPL). A cada 5 segundos será
    enviado um JSON contendo o ticker, o preço atual e um timestamp.
    """
    await price_stream(websocket, symbol)

@app.websocket("/ws/dashboard")
async def ws_dashboard(websocket: WebSocket) -> None:
    """WebSocket que transmite preços de múltiplos símbolos para o dashboard.
    
    Conecte-se a `/ws/dashboard` para receber atualizações de preços
    de vários ativos a cada 5 segundos.
    """
    await dashboard_price_stream(websocket)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
