# Sistema PDV com Importação de NF-e

Sistema completo de Ponto de Venda (PDV) com painel administrativo web, focado em resolver o problema de cadastro complexo de produtos através da leitura automática de Notas Fiscais Eletrônicas.

## Visão Geral

Este projeto consiste em três aplicações integradas:

1. **Backend API** - API REST em Node.js com Fastify e PostgreSQL
2. **Desktop App** - Aplicação Electron para operação no ponto de venda (em desenvolvimento)
3. **Web Admin** - Painel administrativo Next.js (em desenvolvimento)

## Diferenciais do Sistema

- **Importação Automática de NF-e**: Lê arquivos XML de notas fiscais e extrai automaticamente todos os dados dos produtos
- **Offline-first no PDV**: Funciona sem internet com sincronização automática
- **Interface Moderna**: UI construída com TailwindCSS e shadcn/ui
- **Multi-estabelecimento**: Suporta múltiplos estabelecimentos e PDVs

## Stack Tecnológica

### Backend
- Node.js + TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod para validação

### Desktop (Em desenvolvimento)
- Electron
- React + TypeScript
- SQLite local
- Zustand para estado

### Web (Em desenvolvimento)
- Next.js 14+
- React + TypeScript
- TailwindCSS + shadcn/ui
- Recharts para gráficos

## Status do Projeto

### ✅ Fase 1 - Fundação (Backend + DB) - CONCLUÍDA

- [x] Setup do backend (Fastify + TypeScript)
- [x] Configurar Prisma + PostgreSQL
- [x] Criar schemas do banco
- [x] Implementar autenticação JWT (access + refresh tokens)
- [x] Criar endpoints básicos de CRUD de produtos

### 🚧 Fase 2 - Parser de NF-e (Em andamento)

- [ ] Implementar parser de XML
- [ ] Criar endpoint POST /nfe/parse
- [ ] Testar com XMLs reais de exemplo
- [ ] Tratar edge cases e erros

### 📋 Fase 3 - Desktop PDV (Planejado)

- [ ] Setup Electron + React + TypeScript
- [ ] Configurar SQLite + Prisma local
- [ ] Criar tela de login
- [ ] Criar tela de caixa/venda
- [ ] Implementar leitura de código de barras
- [ ] Criar modal de importação de NF-e
- [ ] Integrar com backend para parse
- [ ] Implementar sincronização básica

### 📋 Fase 4 - Painel Web (Planejado)

- [ ] Setup Next.js + TypeScript
- [ ] Dashboard com métricas
- [ ] CRUD de produtos
- [ ] Relatórios de vendas
- [ ] Histórico de NF-e importadas

## Instalação e Uso

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Backend API

```bash
cd backend-api

# Instalar dependências
npm install

# Configurar .env (já criado com valores padrão)
# Edite o .env se necessário

# Criar banco de dados PostgreSQL
createdb pdv_database

# Executar migrations
npm run db:migrate

# Iniciar servidor de desenvolvimento
npm run dev
```

O servidor estará rodando em `http://localhost:3333`

### Testando a API

```bash
# Health check
curl http://localhost:3333/health

# Registrar estabelecimento
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "establishment": {
      "nome": "Mercado Exemplo",
      "cnpj": "12345678000190",
      "email": "contato@mercadoexemplo.com"
    },
    "user": {
      "nome": "Admin",
      "email": "admin@mercadoexemplo.com",
      "senha": "senha123"
    }
  }'
```

## Estrutura do Projeto

```
fusepdv/
├── backend-api/          # API Node.js + Fastify
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── types/
│   │   └── database/
│   └── prisma/
├── desktop-app/          # Aplicação Electron (em breve)
└── web-admin/            # Painel Next.js (em breve)
```

## Funcionalidades Principais

### Já Implementadas ✅

- **Autenticação JWT** com access e refresh tokens
- **Gestão de Estabelecimentos**
- **CRUD Completo de Produtos**
  - Cadastro manual
  - Busca por código, EAN ou nome
  - Filtros e paginação
  - Controle de estoque
  - Categorização
- **Multi-tenancy** (cada estabelecimento isolado)

### Em Desenvolvimento 🚧

- **Parser de NF-e** para extração automática de produtos
- **Aplicação Desktop** para PDV
- **Painel Web Administrativo**
- **Sincronização Offline**
- **WebSocket** para atualizações em tempo real

### Planejadas 📋

- **Gestão de Vendas**
- **Relatórios e Dashboards**
- **Emissão de Cupom Fiscal (NFC-e)**
- **Controle de Caixa**
- **Gestão de Usuários e Permissões**

## Documentação

Cada aplicação tem sua própria documentação:

- [Backend API](./backend-api/README.md)
- Desktop App (em breve)
- Web Admin (em breve)

## Próximos Passos

1. **Implementar Parser de NF-e** - Funcionalidade core do sistema
2. **Criar aplicação Electron** - Interface para operação no PDV
3. **Desenvolver painel web** - Gestão remota do estabelecimento

## Licença

MIT

## Autor

Sistema desenvolvido para resolver a dor de cadastro manual de produtos no varejo brasileiro.
