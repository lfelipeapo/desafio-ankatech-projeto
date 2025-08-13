#!/bin/bash

# Script de Setup Automático - Desafio AnkaTech
# Este script baixa automaticamente os repositórios frontend e backend
# para facilitar a avaliação do projeto completo

set -e  # Para o script se houver erro

echo "🚀 Iniciando setup automático do projeto Desafio AnkaTech..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    print_error "Git não está instalado. Por favor, instale o Git primeiro."
    exit 1
fi

# URLs dos repositórios
BACKEND_URL="https://github.com/lfelipeapo/desafio-ankatech-backend.git"
FRONTEND_URL="https://github.com/lfelipeapo/desafio-ankatech-frontend.git"

print_status "Verificando estrutura atual..."

# Verificar se as pastas já existem
if [ -d "backend" ]; then
    print_warning "Pasta 'backend' já existe. Removendo..."
    rm -rf backend
fi

if [ -d "frontend" ]; then
    print_warning "Pasta 'frontend' já existe. Removendo..."
    rm -rf frontend
fi

echo ""
print_status "Baixando repositório Backend..."
if git clone "$BACKEND_URL" backend; then
    print_success "Backend baixado com sucesso!"
else
    print_error "Falha ao baixar o backend"
    exit 1
fi

echo ""
print_status "Baixando repositório Frontend..."
if git clone "$FRONTEND_URL" frontend; then
    print_success "Frontend baixado com sucesso!"
else
    print_error "Falha ao baixar o frontend"
    exit 1
fi

echo ""
print_status "Verificando estrutura dos repositórios..."

# Verificar se os READMEs foram baixados
if [ -f "backend/README.md" ]; then
    print_success "README do Backend encontrado"
else
    print_warning "README do Backend não encontrado"
fi

if [ -f "frontend/README.md" ]; then
    print_success "README do Frontend encontrado"
else
    print_warning "README do Frontend não encontrado"
fi

echo ""
print_status "Configurando permissões..."
chmod +x setup.sh

echo ""
print_success "✅ Setup concluído com sucesso!"
echo ""
echo "📁 Estrutura do projeto:"
echo "├── backend/          # Repositório do backend"
echo "├── frontend/         # Repositório do frontend"
echo "├── docker-compose.yml"
echo "├── README.md"
echo "└── setup.sh"
echo ""
echo "🚀 Para iniciar o projeto:"
echo "   docker-compose up -d --build"
echo ""
echo "📚 Para mais informações:"
echo "   - Backend: https://github.com/lfelipeapo/desafio-ankatech-backend"
echo "   - Frontend: https://github.com/lfelipeapo/desafio-ankatech-frontend"
echo "   - Projeto: https://github.com/lfelipeapo/desafio-ankatech-projeto"
echo ""
