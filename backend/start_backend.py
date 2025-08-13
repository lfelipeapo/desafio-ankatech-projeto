#!/usr/bin/env python3
"""
Script para iniciar o backend corrigindo problemas de import
"""
import sys
import os
import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

# Adiciona o diretório atual ao path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Imports corrigidos
import models
import schemas
from database import Base, get_session, engine

# Cria a aplicação FastAPI
app = FastAPI(title="Investment Dashboard API", version="1.0.0")

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint básico de health check
@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Investment Dashboard API is running"}

# Endpoint de teste
@app.get("/api/test")
async def test_endpoint():
    return {"message": "API funcionando corretamente"}

# WebSocket básico para teste
@app.websocket("/ws/test")
async def websocket_test(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Echo: {data}")
    except:
        pass

# WebSocket para preços (simulado)
@app.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    import asyncio
    import json
    import random
    from datetime import datetime
    
    await websocket.accept()
    try:
        symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"]
        
        while True:
            prices_data = []
            for symbol in symbols:
                price = round(random.uniform(100, 300), 2)
                change = round(random.uniform(-5, 5), 2)
                change_percent = round(random.uniform(-3, 3), 2)
                
                prices_data.append({
                    "ticker": symbol,
                    "price": price,
                    "change": change,
                    "change_percent": change_percent,
                    "timestamp": datetime.now().isoformat()
                })
            
            payload = {
                "type": "price_update",
                "data": prices_data,
                "timestamp": datetime.now().isoformat()
            }
            
            await websocket.send_text(json.dumps(payload))
            await asyncio.sleep(5)
    except:
        pass

if __name__ == "__main__":
    print("🚀 Iniciando Investment Dashboard API...")
    print("📡 API disponível em: http://localhost:8000")
    print("🔌 WebSocket dashboard em: ws://localhost:8000/ws/dashboard")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)

