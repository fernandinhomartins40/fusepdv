# Estrutura do Projeto

```
fusepdv/
│
├── 📄 README.md                      # Documentação principal
├── 📄 QUICK_START.md                 # Guia rápido de instalação
├── 📄 PROJECT_STRUCTURE.md           # Este arquivo
├── 📄 .gitignore                     # Ignorar arquivos no git
│
├── 📁 backend-api/                   # API Backend (Node.js + Fastify)
│   ├── 📄 package.json               # Dependências do backend
│   ├── 📄 tsconfig.json              # Configuração TypeScript
│   ├── 📄 README.md                  # Documentação do backend
│   ├── 📄 .env                       # Variáveis de ambiente
│   ├── 📄 .env.example               # Exemplo de variáveis
│   ├── 📄 .gitignore                 # Ignorar arquivos
│   ├── 📄 test.http                  # Testes de API (REST Client)
│   │
│   ├── 📁 prisma/                    # Prisma ORM
│   │   ├── 📄 schema.prisma          # Schema do banco de dados
│   │   └── 📄 seed.ts                # Script para popular banco
│   │
│   └── 📁 src/                       # Código fonte
│       ├── 📄 server.ts              # Entry point da aplicação
│       │
│       ├── 📁 controllers/           # Controllers (camada de apresentação)
│       │   ├── 📄 auth.controller.ts
│       │   └── 📄 product.controller.ts
│       │
│       ├── 📁 services/              # Services (lógica de negócio)
│       │   ├── 📄 auth.service.ts
│       │   └── 📄 product.service.ts
│       │
│       ├── 📁 routes/                # Definição de rotas
│       │   ├── 📄 auth.routes.ts
│       │   └── 📄 product.routes.ts
│       │
│       ├── 📁 middlewares/           # Middlewares
│       │   └── 📄 auth.middleware.ts
│       │
│       ├── 📁 types/                 # Types e Schemas Zod
│       │   ├── 📄 auth.types.ts
│       │   └── 📄 product.types.ts
│       │
│       ├── 📁 database/              # Configuração do banco
│       │   └── 📄 prisma.ts
│       │
│       └── 📁 utils/                 # Utilitários
│           └── 📁 nfe-parser/        # Parser de NF-e (em breve)
│
├── 📁 desktop-app/                   # Aplicação Desktop (Electron) [EM BREVE]
│   └── 📁 src/
│       ├── 📁 main/                  # Processo principal Electron
│       ├── 📁 renderer/              # Interface React
│       │   ├── 📁 components/
│       │   ├── 📁 pages/
│       │   ├── 📁 hooks/
│       │   ├── 📁 store/
│       │   ├── 📁 lib/
│       │   └── 📁 types/
│       └── 📁 database/              # SQLite + Prisma local
│
└── 📁 web-admin/                     # Painel Web (Next.js) [EM BREVE]
    └── 📁 src/
        ├── 📁 app/                   # App Router (Next.js 14+)
        ├── 📁 components/            # Componentes React
        ├── 📁 hooks/                 # Hooks customizados
        ├── 📁 lib/                   # Bibliotecas e utils
        └── 📁 types/                 # Types TypeScript
```

## Arquivos Principais

### Backend API

| Arquivo | Descrição |
|---------|-----------|
| `src/server.ts` | Entry point, configuração do Fastify |
| `src/controllers/*.ts` | Controllers de cada módulo |
| `src/services/*.ts` | Lógica de negócio |
| `src/routes/*.ts` | Definição de rotas |
| `src/middlewares/auth.middleware.ts` | Middleware de autenticação JWT |
| `src/types/*.types.ts` | Types TypeScript e schemas Zod |
| `src/database/prisma.ts` | Cliente Prisma |
| `prisma/schema.prisma` | Schema do banco PostgreSQL |
| `prisma/seed.ts` | Dados de teste |
| `test.http` | Arquivo para testar API |

## Arquivos Implementados ✅

- ✅ Backend API completo
  - ✅ Autenticação JWT (access + refresh tokens)
  - ✅ CRUD de produtos
  - ✅ Gestão de estabelecimentos
  - ✅ Middleware de autenticação
  - ✅ Validação com Zod
  - ✅ Schema Prisma completo

## Próximos Arquivos 🚧

- 🚧 Parser de NF-e (`src/utils/nfe-parser/`)
- 🚧 CRUD de vendas
- 🚧 Endpoints de sincronização
- 🚧 WebSocket para tempo real

## Arquivos Planejados 📋

- 📋 Aplicação Electron
- 📋 Painel Web Next.js
- 📋 Testes automatizados
- 📋 Documentação de API (Swagger)

## Tecnologias por Camada

### Backend API
- **Runtime**: Node.js 18+
- **Framework**: Fastify 4.x
- **ORM**: Prisma 5.x
- **Database**: PostgreSQL 14+
- **Validation**: Zod 3.x
- **Auth**: JWT (@fastify/jwt)
- **Language**: TypeScript 5.x

### Desktop App (Planejado)
- **Framework**: Electron 28.x
- **UI**: React 18.x
- **Local DB**: SQLite + Prisma
- **State**: Zustand 4.x
- **Styling**: TailwindCSS + shadcn/ui

### Web Admin (Planejado)
- **Framework**: Next.js 14+
- **UI**: React 18.x
- **Styling**: TailwindCSS + shadcn/ui
- **Charts**: Recharts 2.x
- **Tables**: TanStack Table 8.x

## Fluxo de Dados

```
┌─────────────────┐
│   Desktop PDV   │
│   (Electron)    │
│                 │
│  SQLite Local   │ ◄────┐
└────────┬────────┘      │
         │               │
         │ Sync          │
         │               │
         ▼               │
┌─────────────────┐      │
│   Backend API   │      │
│   (Fastify)     │      │
│                 │      │
│   PostgreSQL    │      │
└────────┬────────┘      │
         │               │
         │ REST/WS       │
         │               │
         ▼               │
┌─────────────────┐      │
│   Web Admin     │      │
│   (Next.js)     │ ─────┘
└─────────────────┘
```

## Comandos Úteis

```bash
# Backend
cd backend-api
npm install          # Instalar dependências
npm run dev          # Desenvolvimento
npm run build        # Build
npm start            # Produção
npm run db:migrate   # Executar migrations
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco

# Desktop (em breve)
cd desktop-app
npm install
npm run dev

# Web (em breve)
cd web-admin
npm install
npm run dev
```
