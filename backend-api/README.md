# PDV Backend API

Backend API para Sistema PDV com importação de NF-e.

## Stack Tecnológica

- **Node.js** com **TypeScript**
- **Fastify** - Framework web
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Database
- **JWT** - Autenticação
- **Zod** - Validação de schemas
- **bcrypt** - Hash de senhas

## Instalação

```bash
# Instalar dependências
npm install

# Copiar .env.example para .env e configurar
cp .env.example .env

# Gerar Prisma Client
npm run db:generate

# Executar migrations
npm run db:migrate

# (Opcional) Popular banco com dados de teste
npm run db:seed
```

## Configuração do Banco de Dados

1. Instale o PostgreSQL
2. Crie um banco de dados:
```sql
CREATE DATABASE pdv_database;
```

3. Configure a URL de conexão no `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/pdv_database?schema=public"
```

## Scripts Disponíveis

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Build
npm run build

# Produção
npm start

# Prisma Studio (interface visual do banco)
npm run db:studio

# Gerar Prisma Client
npm run db:generate

# Criar e executar migrations
npm run db:migrate
```

## Estrutura de Pastas

```
backend-api/
├── src/
│   ├── controllers/     # Controllers
│   ├── services/        # Lógica de negócio
│   ├── routes/          # Definição de rotas
│   ├── middlewares/     # Middlewares
│   ├── types/           # Types e schemas Zod
│   ├── utils/           # Utilitários
│   ├── database/        # Configuração Prisma
│   └── server.ts        # Entry point
├── prisma/
│   └── schema.prisma    # Schema do banco
└── package.json
```

## Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar estabelecimento
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Dados do usuário autenticado

### Produtos
- `GET /products` - Listar produtos (com filtros e paginação)
- `POST /products` - Criar produto
- `POST /products/bulk` - Criar produtos em lote
- `GET /products/:id` - Buscar por ID
- `GET /products/code/:codigo` - Buscar por código
- `GET /products/ean/:ean` - Buscar por EAN
- `PATCH /products/:id` - Atualizar produto
- `DELETE /products/:id` - Deletar produto (soft delete)
- `GET /products/meta/categories` - Listar categorias
- `GET /products/meta/low-stock` - Produtos com estoque baixo
- `PATCH /products/:id/stock` - Atualizar estoque

### Health Check
- `GET /health` - Status do servidor

## Autenticação

A API usa JWT com access token e refresh token:

1. Faça login em `/auth/login` e receba:
   - `accessToken` (expira em 15min)
   - `refreshToken` (expira em 7 dias)

2. Use o `accessToken` no header das requisições:
```
Authorization: Bearer <accessToken>
```

3. Quando o access token expirar, renove em `/auth/refresh`:
```json
{
  "refreshToken": "seu-refresh-token"
}
```

## Variáveis de Ambiente

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pdv_database?schema=public"

# JWT
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3333
HOST="0.0.0.0"
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

## Próximos Passos

- [ ] Implementar parser de NF-e
- [ ] Criar endpoints de vendas
- [ ] Implementar sincronização
- [ ] Adicionar WebSocket para tempo real
- [ ] Implementar relatórios
- [ ] Adicionar testes
