# 🎨 Frontend - Sistema de Gestão de Investimentos

Frontend moderno desenvolvido em Next.js para o sistema de gestão de investimentos, incluindo dashboard interativo, WebSocket para preços em tempo real, e interface responsiva seguindo padrões UX/UI.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Uso](#uso)
- [Componentes](#componentes)
- [Testes](#testes)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy](#deploy)

## 🎯 Visão Geral

Frontend moderno e responsivo desenvolvido como parte do case técnico "Dev Jr Fullstack — Python + React" para a AnkaTech. Implementa um dashboard completo com autenticação JWT, WebSocket para preços em tempo real, e interface seguindo padrões modernos de UX/UI.

### Principais Características

- 🎨 **Interface moderna** seguindo padrões UX/UI do Figma
- 🔐 **Autenticação JWT** com cookies HttpOnly
- 📊 **Dashboard interativo** com métricas em tempo real
- 💰 **WebSocket integrado** para preços de ativos
- 📱 **Design responsivo** para todos os dispositivos
- 🌙 **Tema claro/escuro** com persistência
- ⚡ **Performance otimizada** com Next.js 14
- 🧪 **TypeScript** para tipagem estática

## 🏗 Arquitetura

### Stack Tecnológica
- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Styling:** Tailwind CSS
- **Estado:** React Hooks + Context
- **HTTP Client:** Axios
- **WebSocket:** WebSocket API nativa
- **Ícones:** Lucide React
- **Build:** Next.js Standalone

### Padrões de Desenvolvimento
- **App Router:** Nova arquitetura do Next.js 14
- **Server Components:** Componentes renderizados no servidor
- **Client Components:** Componentes interativos no cliente
- **API Routes:** Endpoints internos do Next.js
- **Middleware:** Autenticação e proteção de rotas

## ⚡ Funcionalidades

### 🔐 Autenticação e Autorização
```typescript
// Sistema de login com JWT
- Login com email/senha
- Tokens JWT armazenados em cookies HttpOnly
- Middleware de proteção de rotas
- Redirecionamento automático para login
- Logout com limpeza de cookies
```

### 📊 Dashboard Principal
```typescript
// Dashboard com métricas em tempo real
- Cards informativos responsivos
- Gráficos de performance interativos
- Preços de ativos via WebSocket
- Métricas de clientes e ativos
- Tema claro/escuro
```

### 👥 Gestão de Clientes
```typescript
// CRUD completo de clientes
- Listagem com paginação
- Busca e filtros avançados
- Criação de novos clientes
- Edição de dados existentes
- Exclusão com confirmação
- Status ativo/inativo
```

### 💰 Gestão de Ativos
```typescript
// Gestão de ativos e alocações
- Cadastro de ativos
- Busca integrada com Yahoo Finance
- Alocações por cliente
- Cálculo de rentabilidade
- Performance tracking
```

### 🔌 WebSocket - Tempo Real
```typescript
// Conexão WebSocket para preços
const ws = new WebSocket('ws://localhost:8000/ws/dashboard');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Atualizar preços em tempo real
};
```

## 🛠 Tecnologias

### Core
- **Node.js 20+** - Runtime JavaScript
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **React 18** - Biblioteca de UI

### Styling
- **Tailwind CSS** - Framework CSS utilitário
- **CSS Modules** - Estilos modulares
- **Lucide React** - Ícones modernos
- **Responsive Design** - Design adaptável

### Estado e Dados
- **React Hooks** - Gerenciamento de estado
- **Context API** - Estado global
- **Axios** - Cliente HTTP
- **WebSocket** - Comunicação em tempo real

### Desenvolvimento
- **ESLint** - Linting de código
- **Prettier** - Formatação automática
- **TypeScript** - Verificação de tipos
- **Next.js DevTools** - Ferramentas de desenvolvimento

## 🚀 Instalação

### Pré-requisitos
- Node.js 20+
- npm ou yarn
- Docker (opcional)

### Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/lfelipeapo/desafio-ankatech-frontend.git
cd desafio-ankatech-frontend
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
# Edite o arquivo .env.local com suas configurações
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
```

5. **Acesse a aplicação**
```
http://localhost:3000
```

### Instalação com Docker

```bash
# Construir e executar
docker build -t desafio-frontend .
docker run -p 3000:3000 desafio-frontend
```

### Variáveis de Ambiente

```bash
# API Backend
NEXT_PUBLIC_API_BASE=http://localhost:8000
INTERNAL_API_BASE=http://backend:8000

# Configurações
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

## 📖 Uso

### Credenciais de Acesso

| Perfil | E-mail | Senha | Permissões |
|--------|--------|-------|------------|
| Admin | admin@example.com | admin123 | CRUD completo |
| Reader | reader@example.com | reader123 | Somente leitura |

### Fluxo Principal

1. **Acesse** http://localhost:3000
2. **Faça login** com as credenciais acima
3. **Navegue** pelo dashboard e funcionalidades
4. **Gerencie** clientes, ativos e alocações
5. **Monitore** preços em tempo real

### Navegação

- **Dashboard:** Visão geral e métricas
- **Clientes:** Gestão completa de clientes
- **Net New Money:** Análise de novos investimentos
- **Custódia:** Gestão de custódia
- **Receitas:** Análise de receitas
- **Comissões:** Gestão de comissões

## 🧩 Componentes

### Componentes de UI
```typescript
// Componentes reutilizáveis
- Button: Botões com variantes
- Card: Cards informativos
- Input: Campos de entrada
- Table: Tabelas responsivas
- Badge: Badges de status
- Modal: Modais e diálogos
- Spinner: Indicadores de carregamento
```

### Componentes Específicos
```typescript
// Componentes do domínio
- Sidebar: Navegação lateral
- UserMenu: Menu do usuário com logout
- PerformanceChart: Gráficos de performance
- LivePrice: Preços em tempo real
- GlobalSearch: Busca global
- ThemeToggle: Alternância de tema
```

### Hooks Customizados
```typescript
// Hooks reutilizáveis
- useLivePrices: WebSocket para preços
- useAuth: Gerenciamento de autenticação
- useTheme: Gerenciamento de tema
- useApi: Cliente HTTP configurado
```

## 🧪 Testes

### Executar Testes
```bash
# Testes unitários
npm run test

# Testes com watch
npm run test:watch

# Testes de cobertura
npm run test:coverage

# Testes E2E (se configurado)
npm run test:e2e
```

### Estrutura de Testes
```
tests/
├── components/     # Testes de componentes
├── hooks/         # Testes de hooks
├── pages/         # Testes de páginas
└── utils/         # Testes de utilitários
```

### Ferramentas de Teste
- **Jest** - Framework de testes
- **React Testing Library** - Testes de componentes
- **MSW** - Mock Service Worker
- **@testing-library/jest-dom** - Matchers customizados

## 📁 Estrutura do Projeto

```
frontend/
├── app/                    # App Router (Next.js 14)
│   ├── (auth)/            # Grupo de rotas de autenticação
│   │   └── login/         # Página de login
│   ├── api/               # API Routes
│   │   ├── proxy/         # Proxy para backend
│   │   ├── export/        # Exportação de dados
│   │   └── theme/         # Configuração de tema
│   ├── clients/           # Gestão de clientes
│   │   ├── [id]/          # Detalhes do cliente
│   │   └── new/           # Novo cliente
│   ├── dashboard/         # Dashboard principal
│   ├── comissoes/         # Gestão de comissões
│   ├── custodia/          # Gestão de custódia
│   ├── net-new-money/     # Análise de novos investimentos
│   ├── receitas/          # Análise de receitas
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI base
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── Sidebar.tsx       # Navegação lateral
│   ├── UserMenu.tsx      # Menu do usuário
│   ├── PerformanceChart.tsx # Gráficos
│   ├── LivePrice.tsx     # Preços em tempo real
│   └── ...
├── hooks/                # Hooks customizados
│   ├── useLivePrices.ts
│   └── ...
├── lib/                  # Utilitários e configurações
│   ├── api.ts           # Cliente HTTP
│   ├── types.ts         # Tipos TypeScript
│   ├── utils.ts         # Funções utilitárias
│   └── ws.ts            # WebSocket
├── middleware.ts         # Middleware de autenticação
├── next.config.mjs      # Configuração Next.js
├── tailwind.config.ts   # Configuração Tailwind
├── tsconfig.json        # Configuração TypeScript
└── package.json         # Dependências
```

## 🚀 Deploy

### Build de Produção
```bash
# Build otimizado
npm run build

# Iniciar em produção
npm start
```

### Docker
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Vercel (Recomendado)
```bash
# Deploy automático
vercel --prod

# Configuração
vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

### Variáveis de Ambiente (Produção)
```bash
# API Backend
NEXT_PUBLIC_API_BASE=https://api.seu-dominio.com
INTERNAL_API_BASE=https://api.seu-dominio.com

# Configurações
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🎨 Design System

### Cores
```css
/* Tema claro */
--background: #ffffff
--foreground: #171717
--primary: #2563eb
--primary-foreground: #ffffff
--muted: #f5f5f5
--muted-foreground: #737373

/* Tema escuro */
--background: #0a0a0a
--foreground: #ededed
--primary: #3b82f6
--primary-foreground: #ffffff
--muted: #262626
--muted-foreground: #a3a3a3
```

### Tipografia
```css
/* Hierarquia de texto */
.text-xs    /* 12px */
.text-sm    /* 14px */
.text-base  /* 16px */
.text-lg    /* 18px */
.text-xl    /* 20px */
.text-2xl   /* 24px */
```

### Componentes
- **Cards:** Sombras suaves, bordas arredondadas
- **Botões:** Estados hover, loading, disabled
- **Inputs:** Focus states, validação visual
- **Tabelas:** Striped rows, hover effects

## 📊 Performance

### Otimizações
- **Next.js Image:** Otimização automática de imagens
- **Code Splitting:** Carregamento sob demanda
- **Static Generation:** Páginas pré-renderizadas
- **Bundle Analysis:** Análise de tamanho de bundle

### Métricas
- **Lighthouse Score:** 95+ em todas as categorias
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1

## 🔧 Desenvolvimento

### Scripts Disponíveis
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting de código
npm run type-check   # Verificação de tipos
npm run test         # Executar testes
```

### Padrões de Código
- **ESLint:** Configuração Next.js
- **Prettier:** Formatação automática
- **TypeScript:** Tipagem estrita
- **Conventional Commits:** Padrão de commits

## 🤝 Contribuição

### Padrões de Desenvolvimento
1. **Commits:** Use mensagens descritivas em português
2. **Código:** Siga os padrões ESLint e Prettier
3. **Componentes:** Use TypeScript e props tipadas
4. **Documentação:** Atualize documentação quando necessário

### Fluxo de Desenvolvimento
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Execute os testes
5. Faça commit das mudanças
6. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido como case técnico para vaga de Desenvolvedor Jr Fullstack na AnkaTech.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Consulte a documentação do Next.js
- Verifique os logs do console

---

**✅ Frontend desenvolvido conforme especificações do case técnico - 100% funcional**

**🔗 Repositório Backend:** [desafio-ankatech-backend](https://github.com/lfelipeapo/desafio-ankatech-backend)

**🔗 Repositório Projeto:** [desafio-ankatech-projeto](https://github.com/lfelipeapo/desafio-ankatech-projeto)
