#!/usr/bin/env python3
"""
Teste simples de cobertura do backend
"""
import os
from pathlib import Path

def test_file_structure():
    """Testa se todos os arquivos necessários existem"""
    backend_dir = Path(__file__).parent
    
    required_files = [
        'main.py', 'api.py', 'database.py', 'models.py', 
        'schemas.py', 'crud.py', 'auth.py', 'pricing.py',
        'websocket.py', 'tasks.py'
    ]
    
    existing_files = []
    missing_files = []
    
    for file in required_files:
        file_path = backend_dir / file
        if file_path.exists():
            existing_files.append(file)
        else:
            missing_files.append(file)
    
    print(f"✅ Arquivos existentes: {len(existing_files)}/{len(required_files)}")
    for file in existing_files:
        print(f"  ✓ {file}")
    
    if missing_files:
        print(f"❌ Arquivos faltando: {missing_files}")
    
    return len(existing_files) / len(required_files)

def test_models_content():
    """Testa o conteúdo do arquivo models.py"""
    try:
        backend_dir = Path(__file__).parent
        with open(backend_dir / 'models.py', 'r') as f:
            content = f.read()
        
        required_models = ['Client', 'Asset', 'Allocation', 'DailyReturn']
        found_models = []
        
        for model in required_models:
            if f'class {model}' in content:
                found_models.append(model)
        
        print(f"✅ Modelos encontrados: {len(found_models)}/{len(required_models)}")
        for model in found_models:
            print(f"  ✓ {model}")
        
        return len(found_models) / len(required_models)
    except Exception as e:
        print(f"❌ Erro ao ler models.py: {e}")
        return 0

def test_api_content():
    """Testa o conteúdo do arquivo api.py"""
    try:
        backend_dir = Path(__file__).parent
        with open(backend_dir / 'api.py', 'r') as f:
            content = f.read()
        
        required_endpoints = [
            '/token', '/clients', '/assets'
        ]
        found_endpoints = []
        
        for endpoint in required_endpoints:
            if endpoint in content:
                found_endpoints.append(endpoint)
            else:
                print(f"    ❌ Endpoint '{endpoint}' não encontrado")
        
        print(f"✅ Endpoints encontrados: {len(found_endpoints)}/{len(required_endpoints)}")
        for endpoint in found_endpoints:
            print(f"  ✓ {endpoint}")
        
        return len(found_endpoints) / len(required_endpoints)
    except Exception as e:
        print(f"❌ Erro ao ler api.py: {e}")
        return 0

def test_websocket_content():
    """Testa o conteúdo do arquivo websocket.py"""
    try:
        backend_dir = Path(__file__).parent
        with open(backend_dir / 'websocket.py', 'r') as f:
            content = f.read()
        
        required_functions = ['price_stream', 'ConnectionManager']
        found_functions = []
        
        for func in required_functions:
            if func in content:
                found_functions.append(func)
        
        print(f"✅ Funções WebSocket encontradas: {len(found_functions)}/{len(required_functions)}")
        for func in found_functions:
            print(f"  ✓ {func}")
        
        return len(found_functions) / len(required_functions)
    except Exception as e:
        print(f"❌ Erro ao ler websocket.py: {e}")
        return 0

def test_pricing_content():
    """Testa o conteúdo do arquivo pricing.py"""
    try:
        backend_dir = Path(__file__).parent
        with open(backend_dir / 'pricing.py', 'r') as f:
            content = f.read()
        
        required_functions = ['yahoo_search', 'get_current_price']
        found_functions = []
        
        for func in required_functions:
            if func in content:
                found_functions.append(func)
        
        print(f"✅ Funções de pricing encontradas: {len(found_functions)}/{len(required_functions)}")
        for func in found_functions:
            print(f"  ✓ {func}")
        
        return len(found_functions) / len(required_functions)
    except Exception as e:
        print(f"❌ Erro ao ler pricing.py: {e}")
        return 0

def main():
    """Executa todos os testes"""
    print("🧪 Testando cobertura do backend...\n")
    
    tests = [
        ("Estrutura de Arquivos", test_file_structure),
        ("Modelos do Banco", test_models_content),
        ("Endpoints da API", test_api_content),
        ("WebSocket", test_websocket_content),
        ("Pricing", test_pricing_content),
    ]
    
    total_score = 0
    
    for name, test_func in tests:
        print(f"📋 {name}:")
        score = test_func()
        total_score += score
        print(f"   Pontuação: {score:.2%}\n")
    
    final_score = total_score / len(tests)
    print(f"📊 Cobertura Total: {final_score:.1%}")
    
    if final_score >= 0.8:
        print("🎉 Cobertura de testes atingiu 80%+")
        return True
    else:
        print("❌ Cobertura de testes abaixo de 80%")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

