# Guia Rápido de Instalação

## Pré-requisitos

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)
3. **Git** - [Download](https://git-scm.com/)

## Instalação em 5 Passos

### 1. Clone o repositório (ou use o projeto atual)

```bash
cd fusepdv
```

### 2. Configure o PostgreSQL

```bash
# Acesse o PostgreSQL (ajuste usuário conforme sua instalação)
psql -U postgres

# Crie o banco de dados
CREATE DATABASE pdv_database;

# Saia do psql
\q
```

### 3. Configure o Backend

```bash
cd backend-api

# Instale as dependências
npm install

# O arquivo .env já está configurado com valores padrão
# Edite se necessário (especialmente DATABASE_URL)

# Execute as migrations do Prisma
npx prisma migrate dev --name init

# (Opcional) Abra o Prisma Studio para visualizar o banco
npm run db:studio
```

### 4. Inicie o servidor

```bash
# Ainda em backend-api/
npm run dev
```

Você verá:
```
🚀 Servidor rodando em http://0.0.0.0:3333
📝 Environment: development
```

### 5. Teste a API

Abra outro terminal e teste:

```bash
# Health check
curl http://localhost:3333/health

# Registrar estabelecimento
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "establishment": {
      "nome": "Meu Mercado",
      "cnpj": "12345678000190",
      "email": "contato@meumercado.com"
    },
    "user": {
      "nome": "Admin",
      "email": "admin@meumercado.com",
      "senha": "senha123"
    }
  }'
```

Se receber uma resposta com `accessToken` e `refreshToken`, está funcionando! 🎉

## Usando o arquivo de teste HTTP

Se você usa VS Code, instale a extensão **REST Client** e abra o arquivo `backend-api/test.http` para testar todos os endpoints de forma interativa.

## Estrutura de URLs

- **API Base**: `http://localhost:3333`
- **Health Check**: `http://localhost:3333/health`
- **Autenticação**: `http://localhost:3333/auth/*`
- **Produtos**: `http://localhost:3333/products/*`

## Prisma Studio

Para visualizar e editar dados diretamente no banco:

```bash
cd backend-api
npm run db:studio
```

Abrirá em `http://localhost:5555`

## Problemas Comuns

### Erro de conexão com PostgreSQL

Verifique se:
- PostgreSQL está rodando
- Credenciais no `.env` estão corretas
- Banco `pdv_database` foi criado

```bash
# Verificar se PostgreSQL está rodando (Windows)
services.msc
# Procure por "postgresql"

# Linux/Mac
sudo systemctl status postgresql
```

### Porta 3333 em uso

Edite `.env` e mude a porta:
```
PORT=3334
```

### Dependências não instaladas

```bash
cd backend-api
rm -rf node_modules package-lock.json
npm install
```

## Próximos Passos

1. ✅ Backend funcionando
2. 🚧 Implementar parser de NF-e (Fase 2)
3. 📋 Criar aplicação Desktop (Fase 3)
4. 📋 Criar painel web (Fase 4)

## Ajuda

Para mais detalhes, consulte:
- [README principal](./README.md)
- [README do Backend](./backend-api/README.md)
- [Arquivo de testes HTTP](./backend-api/test.http)
