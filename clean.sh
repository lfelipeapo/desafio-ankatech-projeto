#!/bin/bash

# Script de Limpeza - Desafio AnkaTech
# Este script remove os repositórios baixados para liberar espaço

set -e

echo "🧹 Iniciando limpeza do projeto Desafio AnkaTech..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Função para confirmar ação
confirm_action() {
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Operação cancelada pelo usuário."
        exit 0
    fi
}

print_warning "Este script irá remover as pastas 'backend' e 'frontend'"
print_warning "Isso irá deletar todos os arquivos baixados dos repositórios"
confirm_action

# Remover pastas se existirem
if [ -d "backend" ]; then
    print_status "Removendo pasta backend..."
    rm -rf backend
    print_success "Pasta backend removida"
else
    print_warning "Pasta backend não encontrada"
fi

if [ -d "frontend" ]; then
    print_status "Removendo pasta frontend..."
    rm -rf frontend
    print_success "Pasta frontend removida"
else
    print_warning "Pasta frontend não encontrada"
fi

echo ""
print_success "✅ Limpeza concluída com sucesso!"
echo ""
echo "📁 Estrutura atual:"
echo "├── docker-compose.yml"
echo "├── README.md"
echo "├── setup.sh"
echo "└── clean.sh"
echo ""
echo "🔄 Para baixar novamente os repositórios:"
echo "   ./setup.sh"
echo ""
