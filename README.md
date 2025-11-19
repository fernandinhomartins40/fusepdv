# FusePDV - Sistema PDV com Importação de NF-e ✅

**Status:** 🎉 **100% FUNCIONAL E COMPLETO**

Sistema completo de Ponto de Venda (PDV) para varejo brasileiro com importação automatizada de Notas Fiscais Eletrônicas (NF-e).

## 🚀 Tecnologias

### Backend API (100% Completo)
- Node.js 18+ com TypeScript 5.3
- Fastify 4.25 (high-performance)
- PostgreSQL 14+ com Prisma ORM 5.7
- Socket.IO 4.6 (WebSocket real-time)
- JWT com refresh tokens
- Pino (logging estruturado)
- Zod 3.22 (validação)
- Rate Limiting integrado
- Swagger/OpenAPI docs
- Vitest (testes)

### Desktop App PDV (100% Completo)
- Electron 28 + React 18
- Vite 5 (build tool)
- SQLite local com Prisma
- Zustand (state management)
- TailwindCSS + Radix UI
- **Modo offline** com sync automático
- Impressão de cupons

### Web Admin (100% Completo)
- Next.js 14 (App Router)
- TailwindCSS + shadcn/ui
- Recharts (gráficos)
- TanStack Table (tabelas avançadas)
- Dashboard completo
- Gestão de produtos, vendas, NF-e, usuários

## 📦 Instalação Rápida

### Com Docker (Recomendado)

```bash
# 1. Clone e configure
git clone <repository>
cd fusepdv
cp .env.example .env

# 2. Edite .env com JWT secrets fortes

# 3. Inicie tudo
docker-compose up -d

# URLs:
# - Backend API: http://localhost:3333
# - Web Admin: http://localhost:3000
# - Swagger Docs: http://localhost:3333/docs
```

### Instalação Manual

#### 1. Backend API
```bash
cd backend-api
npm install
cp .env.example .env
# Configure DATABASE_URL e JWT secrets
npx prisma migrate deploy
npm run dev
```

#### 2. Desktop App
```bash
cd desktop-app
npm install
cp .env.example .env
npm run dev
```

#### 3. Web Admin
```bash
cd web-admin
npm install
cp .env.example .env
npm run dev
```

## 🎯 Funcionalidades Implementadas

### ✅ Backend API (45+ endpoints)

**Autenticação (/auth)**
- ✅ Registro de estabelecimento
- ✅ Login com JWT
- ✅ Refresh tokens
- ✅ Logout
- ✅ Rate limit (10 req/min)

**Produtos (/products)**
- ✅ CRUD completo
- ✅ Busca por código/EAN/nome
- ✅ Importação em massa via NF-e
- ✅ Controle de estoque
- ✅ Alertas de estoque baixo
- ✅ Categorização

**NF-e (/nfe)**
- ✅ Parser de XML completo
- ✅ Extração de produtos (EAN, NCM, CFOP, impostos)
- ✅ Histórico de importações
- ✅ Download de XML original

**Vendas (/sales)**
- ✅ Criação com dedução automática de estoque
- ✅ Cancelamento com reversão de estoque
- ✅ Histórico com filtros
- ✅ Relatórios agregados
- ✅ Múltiplas formas de pagamento

**Caixa (/caixa)**
- ✅ Abertura com valor inicial
- ✅ Fechamento com reconciliação
- ✅ Sangria (retiradas)
- ✅ Reforço (adições)
- ✅ Histórico de movimentações

**Sincronização (/sync)**
- ✅ Push/pull de produtos
- ✅ Push/pull de vendas
- ✅ Resolução de conflitos
- ✅ Status em tempo real

**Estabelecimento (/establishment)**
- ✅ Gestão de dados
- ✅ CRUD de usuários
- ✅ Controle de roles (Admin/Operador)
- ✅ Estatísticas

**WebSocket**
- ✅ sale:new, sale:canceled
- ✅ product:created, product:updated, product:deleted
- ✅ nfe:imported
- ✅ caixa:opened, caixa:closed, caixa:sangria, caixa:reforco
- ✅ stock:low
- ✅ sync:status

### ✅ Desktop App PDV

**Interface**
- ✅ Tela de login offline-capable
- ✅ Tela de PDV completa
- ✅ Atalhos de teclado (F2-F9)

**Componentes**
- ✅ ImportNFEModal - Upload/parse XML
- ✅ CartView - Carrinho de compras
- ✅ PaymentModal - Pagamentos (Dinheiro, Débito, Crédito, PIX)
- ✅ CaixaModal - Gestão de caixa
- ✅ ConfiguracoesModal - Configurações
- ✅ ProductSearch - Busca rápida

**Funcionalidades**
- ✅ Venda offline com SQLite
- ✅ Sincronização automática (5min configurável)
- ✅ Impressão de cupons
- ✅ Controle de estoque local
- ✅ Fila de sincronização com retry

### ✅ Web Admin

**Páginas**
- ✅ /dashboard - Métricas e gráficos em tempo real
- ✅ /products - Gestão com tabela editável
- ✅ /sales - Histórico de vendas
- ✅ /reports - Relatórios personalizados
- ✅ /nfe - Histórico de importações
- ✅ /users - Gerenciamento de usuários
- ✅ /settings - Configurações do estabelecimento
- ✅ /login - Autenticação

**Gráficos**
- ✅ Vendas por dia (linha)
- ✅ Vendas por meio de pagamento (pizza)
- ✅ Top 10 produtos (barras)
- ✅ Métricas: ticket médio, total vendas, estoque baixo

## 🔐 Segurança

- ✅ Senhas bcrypt
- ✅ JWT com access (15min) + refresh (7 dias)
- ✅ Rate limiting (100/min geral, 10/min auth)
- ✅ Validação Zod em todas as rotas
- ✅ Sanitização de inputs
- ✅ Error handler centralizado
- ✅ TypeScript strict mode
- ✅ CORS configurável

## 🧪 Testes

```bash
cd backend-api
npm test              # Rodar testes
npm run test:ui       # Interface visual
npm run test:coverage # Relatório de cobertura
```

Testes implementados:
- ✅ Auth flow
- ✅ Sales operations
- ✅ NFE parsing
- ✅ Sync mechanisms

## 📚 Documentação

**API Swagger:**
- UI interativa: http://localhost:3333/docs
- JSON spec: http://localhost:3333/docs/json

**Health Check:**
- http://localhost:3333/health

## 📊 Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Desktop    │────▶│   Backend   │◀────│  Web Admin  │
│  App (PDV)  │     │   API       │     │  (Next.js)  │
│  (Electron) │     │  (Fastify)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │
   SQLite            PostgreSQL            Axios Client
   (Offline)          (Central)           (Real-time)
      │                    │                    │
      └────────────────────┴────────────────────┘
                   WebSocket (Socket.IO)
```

## 🔄 Fluxo de Dados

### Modo Online
```
Desktop → API → PostgreSQL
   ↓                ↓
WebSocket ← Real-time updates → Web Admin
```

### Modo Offline
```
Desktop → SQLite → Sync Queue
                        ↓
         (Quando online) → API → PostgreSQL
```

## 🚀 Deploy Produção

### Variáveis Críticas

```env
# MUDAR EM PRODUÇÃO!
JWT_ACCESS_SECRET=<256-bit-random-string>
JWT_REFRESH_SECRET=<different-256-bit-random-string>
DATABASE_URL=postgresql://user:pass@host:5432/db
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

### Com Docker Compose

```bash
# 1. Configure .env
cp .env.example .env
vim .env  # Adicione secrets fortes

# 2. Build e start
docker-compose up -d

# 3. Migrations
docker-compose exec backend npx prisma migrate deploy

# 4. Verificar
docker-compose ps
docker-compose logs -f backend
```

## 📈 Melhorias Implementadas

✅ **FASE 1 - Correções Críticas**
- Migrations do banco (PostgreSQL + SQLite)
- IPC handlers no Electron
- Sync endpoints corrigidos
- Middleware de auth corrigido

✅ **FASE 2 - Deploy e Qualidade**
- Dockerfile (backend + web-admin)
- docker-compose.yml completo
- Logging estruturado (Pino)
- Schemas Zod em todas as rotas
- WebSocket integrado em todos os serviços
- Testes essenciais (Vitest)

✅ **FASE 3 - Features e Refinamentos**
- Modal de edição de produtos (Web Admin)
- Rate limiting (@fastify/rate-limit)
- Timeouts em requisições API (30s)
- Error handler centralizado
- Variáveis de ambiente documentadas
- Tipos TypeScript sem `any`
- Intervalo de sync configurável

✅ **FASE 4 - Polimento Enterprise**
- Console.logs → Logger
- JSDoc comments no schema Prisma
- Documentação Swagger/OpenAPI
- Sanitização de inputs
- Paginação padronizada
- README completo

## 📝 Estrutura de Arquivos

```
fusepdv/
├── backend-api/
│   ├── src/
│   │   ├── controllers/    # Request handlers (7 arquivos)
│   │   ├── services/       # Business logic (8 arquivos)
│   │   ├── routes/         # Route defs (7 arquivos)
│   │   ├── middlewares/    # Auth middleware
│   │   ├── types/          # Types + Zod schemas (8 arquivos)
│   │   └── utils/          # Logger, errors, sanitizer
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── tests/              # Vitest tests
│   ├── Dockerfile
│   └── package.json
├── desktop-app/
│   ├── src/
│   │   ├── main/           # Electron main (IPC, database)
│   │   └── renderer/       # React UI (16+ componentes)
│   ├── prisma/
│   │   └── schema.prisma   # SQLite
│   └── package.json
├── web-admin/
│   ├── src/
│   │   ├── app/            # Next.js App Router (8 páginas)
│   │   ├── components/
│   │   ├── store/
│   │   └── lib/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 📞 Suporte

Para dúvidas ou issues, abra uma issue no repositório.

## 📜 Licença

MIT

---

**✨ Sistema 100% Funcional e Production-Ready ✨**

**Versão:** 1.0.0 | **Status:** ✅ Completo | **Cobertura:** Todas as 4 fases implementadas
