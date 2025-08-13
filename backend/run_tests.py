#!/usr/bin/env python3
"""
Script para testar funcionalidades básicas do backend
"""
import asyncio
import sys
import os

# Adiciona o diretório atual ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_imports():
    """Testa se os imports funcionam"""
    try:
        import database
        import models
        import schemas
        import crud
        import auth
        import pricing
        import websocket
        import tasks
        print("✓ Todos os módulos importados com sucesso")
        return True
    except Exception as e:
        print(f"✗ Erro ao importar módulos: {e}")
        return False

async def test_database_models():
    """Testa os modelos do banco"""
    try:
        from database import Base
        from models import Client, Asset, Allocation, DailyReturn
        print("✓ Modelos do banco carregados com sucesso")
        return True
    except Exception as e:
        print(f"✗ Erro nos modelos: {e}")
        return False

async def test_pricing_functions():
    """Testa funções de pricing"""
    try:
        from pricing import yahoo_search, get_current_price
        
        # Teste de busca (pode falhar por rate limit, mas não deve dar erro de import)
        print("✓ Funções de pricing carregadas")
        
        # Teste básico de busca
        try:
            results = await yahoo_search("AAPL")
            print(f"✓ Yahoo search funcionando: {len(results)} resultados")
        except Exception as e:
            print(f"⚠ Yahoo search com erro (esperado): {e}")
        
        return True
    except Exception as e:
        print(f"✗ Erro nas funções de pricing: {e}")
        return False

async def test_websocket_functions():
    """Testa funções do WebSocket"""
    try:
        from websocket import ConnectionManager, manager
        print("✓ WebSocket manager carregado")
        
        # Testa se o manager foi criado
        if manager:
            print("✓ Manager instanciado corretamente")
        
        return True
    except Exception as e:
        print(f"✗ Erro no WebSocket: {e}")
        return False

async def main():
    """Executa todos os testes"""
    print("🧪 Iniciando testes do backend...\n")
    
    tests = [
        ("Imports", test_imports),
        ("Database Models", test_database_models),
        ("Pricing Functions", test_pricing_functions),
        ("WebSocket Functions", test_websocket_functions),
    ]
    
    passed = 0
    total = len(tests)
    
    for name, test_func in tests:
        print(f"\n📋 Testando {name}:")
        try:
            result = await test_func()
            if result:
                passed += 1
        except Exception as e:
            print(f"✗ Erro inesperado em {name}: {e}")
    
    print(f"\n📊 Resultados: {passed}/{total} testes passaram")
    
    if passed >= total * 0.8:  # 80% de sucesso
        print("🎉 Backend passou nos testes básicos (>80%)")
        return True
    else:
        print("❌ Backend falhou nos testes básicos (<80%)")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)

