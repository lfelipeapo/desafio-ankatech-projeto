#!/usr/bin/env python3
"""
Script para executar testes com imports corretos
"""
import sys
import os
import asyncio
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# Adiciona o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Agora importa os módulos
from database import Base, get_session
from api import create_app
from auth import get_token_for_form
from fastapi.security import OAuth2PasswordRequestForm

async def test_basic_functionality():
    """Teste básico de funcionalidade"""
    print("Executando testes básicos...")
    
    # Setup do banco de teste
    database_url = "sqlite+aiosqlite:///:memory:"
    engine = create_async_engine(database_url, future=True)
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async def _get_session_override():
        async with async_session() as s: 
            yield s
    
    app = create_app()
    app.dependency_overrides[get_session] = _get_session_override
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Teste de health check
        response = await client.get("/")
        print(f"Health check: {response.status_code}")
        
        # Teste de autenticação
        try:
            response = await client.post("/api/token", data={
                "username": "admin@example.com",
                "password": "admin123"
            })
            print(f"Auth test: {response.status_code}")
            if response.status_code == 200:
                token = response.json()["access_token"]
                headers = {"Authorization": f"Bearer {token}"}
                
                # Teste de criação de cliente
                response = await client.post("/api/clients", json={
                    "name": "Test Client",
                    "email": "test@example.com"
                }, headers=headers)
                print(f"Client creation: {response.status_code}")
                
                # Teste de listagem de clientes
                response = await client.get("/api/clients", headers=headers)
                print(f"Client list: {response.status_code}")
                
        except Exception as e:
            print(f"Error in auth test: {e}")
    
    print("Testes básicos concluídos!")

if __name__ == "__main__":
    asyncio.run(test_basic_functionality())

