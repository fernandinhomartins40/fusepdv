# 🚀 Guia Completo de Instalação e Uso - Sistema PDV

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do Backend](#instalação-do-backend)
3. [Instalação do Desktop App](#instalação-do-desktop-app)
4. [Instalação do Web Admin](#instalação-do-web-admin)
5. [Configuração](#configuração)
6. [Executando o Sistema](#executando-o-sistema)
7. [Testando Funcionalidades](#testando-funcionalidades)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### Software Necessário

1. **Node.js** (v18 ou superior)
   ```bash
   node --version  # deve ser >= 18.0.0
   ```

2. **npm** ou **yarn**
   ```bash
   npm --version
   ```

3. **PostgreSQL** (v14 ou superior)
   ```bash
   psql --version
   ```

4. **Git**
   ```bash
   git --version
   ```

### Instalação do PostgreSQL (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Instalação do PostgreSQL (macOS)
```bash
brew install postgresql@16
brew services start postgresql@16
```

---

## 🔙 Instalação do Backend

### 1. Navegar para o diretório do backend
```bash
cd backend-api
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Criar banco de dados PostgreSQL
```bash
# Acessar o PostgreSQL
sudo -u postgres psql

# Dentro do psql, executar:
CREATE DATABASE pdv_database;
CREATE USER pdv_user WITH PASSWORD 'pdv_password';
GRANT ALL PRIVILEGES ON DATABASE pdv_database TO pdv_user;
\q
```

### 4. Configurar variáveis de ambiente
```bash
# Copiar o arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env
nano .env
```

Configurar as seguintes variáveis:
```env
DATABASE_URL="postgresql://pdv_user:pdv_password@localhost:5432/pdv_database?schema=public"
JWT_ACCESS_SECRET="meu-secret-super-seguro-change-in-production"
JWT_REFRESH_SECRET="meu-refresh-secret-super-seguro-change-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3333
HOST="0.0.0.0"
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

### 5. Executar migrations do Prisma
```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrations
npm run db:migrate

# (Opcional) Popular banco com dados de exemplo
npm run db:seed
```

### 6. Iniciar o servidor
```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3333`

### ✅ Verificar se está funcionando
```bash
curl http://localhost:3333/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 1.234
}
```

---

## 💻 Instalação do Desktop App

### 1. Navegar para o diretório do desktop app
```bash
cd desktop-app
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env
nano .env
```

Configurar:
```env
VITE_API_URL="http://localhost:3333"
```

### 4. Gerar schema do Prisma local (SQLite)
```bash
npm run db:generate
```

### 5. Executar em modo desenvolvimento
```bash
npm run dev
```

A aplicação Electron será iniciada automaticamente.

### Credenciais padrão (após seed):
- **Email**: admin@mercadoexemplo.com
- **Senha**: senha123

---

## 🌐 Instalação do Web Admin

### 1. Navegar para o diretório do web admin
```bash
cd web-admin
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
nano .env.local
```

Configurar:
```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

### 4. Executar em modo desenvolvimento
```bash
npm run dev
```

Acesse: `http://localhost:3000`

### Credenciais padrão (após seed):
- **Email**: admin@mercadoexemplo.com
- **Senha**: senha123

---

## ⚙️ Configuração

### Estrutura de Diretórios

```
fusepdv/
├── backend-api/          # Backend Fastify + Prisma
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── .env
│
├── desktop-app/          # Desktop Electron + React
│   ├── src/
│   │   ├── main/         # Electron main process
│   │   └── renderer/     # React app
│   ├── prisma/           # SQLite local
│   ├── package.json
│   └── .env
│
└── web-admin/            # Next.js 14 Admin Panel
    ├── src/
    ├── package.json
    └── .env.local
```

---

## 🏃 Executando o Sistema

### Ordem de Execução Recomendada

1. **Backend API** (Terminal 1)
```bash
cd backend-api
npm run dev
```

2. **Desktop App** (Terminal 2)
```bash
cd desktop-app
npm run dev
```

3. **Web Admin** (Terminal 3)
```bash
cd web-admin
npm run dev
```

### Scripts Úteis

#### Backend
```bash
npm run dev          # Desenvolvimento com hot-reload
npm run build        # Build para produção
npm start            # Executar build de produção
npm run db:migrate   # Executar migrations
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco com dados
```

#### Desktop
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para todas as plataformas
npm run build:win    # Build para Windows
npm run build:mac    # Build para macOS
npm run build:linux  # Build para Linux
```

#### Web
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start            # Executar build de produção
npm run lint         # Verificar código
```

---

## 🧪 Testando Funcionalidades

### 1. Testar Autenticação

**Via Web Admin:**
1. Acesse `http://localhost:3000/login`
2. Login: `admin@mercadoexemplo.com`
3. Senha: `senha123`
4. Deve redirecionar para o dashboard

**Via API (cURL):**
```bash
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mercadoexemplo.com",
    "senha": "senha123"
  }'
```

### 2. Testar Parser de NF-e

**Preparar XML de teste:**
Salve um XML de NF-e válido em `teste-nfe.xml`

**Via API:**
```bash
# Primeiro, fazer login e pegar o token
TOKEN="seu-token-aqui"

# Enviar XML para parsing
curl -X POST http://localhost:3333/nfe/parse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "xmlContent": "<?xml version=\"1.0\"...seu XML aqui..."
  }'
```

**Via Desktop App:**
1. Fazer login
2. Pressionar `F6` ou clicar em "Importar NF-e"
3. Selecionar arquivo XML ou colar conteúdo
4. Clicar em "Processar NF-e"
5. Editar produtos conforme necessário
6. Clicar em "Importar Selecionados"

### 3. Testar Venda (PDV)

**Via Desktop App:**
1. Pressionar `F2` ou buscar produto
2. Escanear/digitar código de barras
3. Produto é adicionado ao carrinho
4. Ajustar quantidade se necessário
5. Pressionar `F5` ou "Finalizar Venda"
6. Selecionar forma de pagamento
7. Confirmar venda
8. Cupom é impresso (se configurado)

### 4. Testar Gestão de Caixa

**Abrir Caixa:**
```bash
curl -X POST http://localhost:3333/caixa/abrir \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "valorInicial": 100.00
  }'
```

**Registrar Sangria:**
```bash
curl -X POST http://localhost:3333/caixa/sangria \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "valor": 50.00,
    "observacoes": "Troco para o caixa"
  }'
```

**Fechar Caixa:**
```bash
curl -X POST http://localhost:3333/caixa/fechar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "valorFinal": 150.00,
    "observacoes": "Fechamento do caixa"
  }'
```

### 5. Testar Sincronização (Desktop)

1. Fazer vendas offline (desconectar internet)
2. Verificar que vendas ficam marcadas como "não sincronizadas"
3. Reconectar internet
4. Aguardar sincronização automática (5 minutos) ou forçar sync
5. Verificar no web admin que vendas foram sincronizadas

---

## 🔍 Endpoints da API

### Autenticação
- `POST /auth/register` - Registrar novo estabelecimento
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Dados do usuário

### Produtos
- `GET /products` - Listar produtos
- `POST /products` - Criar produto
- `PATCH /products/:id` - Atualizar produto
- `DELETE /products/:id` - Excluir produto
- `GET /products/search` - Buscar por código/EAN/nome
- `POST /products/bulk` - Importação em lote

### NF-e (Funcionalidade Core)
- `POST /nfe/parse` - Parsear XML da NF-e
- `GET /nfe/history` - Histórico de importações
- `GET /nfe/:id` - Detalhes de uma importação
- `GET /nfe/:id/xml` - Download do XML original

### Vendas
- `POST /sales` - Criar venda
- `GET /sales` - Listar vendas
- `GET /sales/:id` - Detalhes de uma venda
- `POST /sales/:id/cancel` - Cancelar venda
- `GET /sales/report` - Relatório de vendas

### Caixa
- `POST /caixa/abrir` - Abrir caixa
- `POST /caixa/fechar` - Fechar caixa
- `POST /caixa/sangria` - Registrar sangria
- `POST /caixa/reforco` - Registrar reforço
- `GET /caixa/atual` - Caixa atual
- `GET /caixa/movimentacoes` - Listar movimentações

### Sincronização
- `POST /sync/products/push` - Enviar produtos
- `POST /sync/products/pull` - Receber produtos
- `POST /sync/sales/push` - Enviar vendas
- `POST /sync/sales/pull` - Receber vendas
- `GET /sync/status` - Status de sincronização

### Estabelecimento
- `GET /establishment` - Dados do estabelecimento
- `PATCH /establishment` - Atualizar estabelecimento
- `GET /establishment/users` - Listar usuários
- `POST /establishment/users` - Criar usuário
- `PATCH /establishment/users/:id` - Atualizar usuário
- `DELETE /establishment/users/:id` - Excluir usuário
- `GET /establishment/stats` - Estatísticas

---

## 🐛 Troubleshooting

### Backend não inicia

**Problema**: Erro de conexão com o banco
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solução**:
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Verificar DATABASE_URL no .env
cat backend-api/.env | grep DATABASE_URL
```

### Desktop App não conecta ao backend

**Problema**: `Network Error` ao fazer login

**Solução**:
1. Verificar se backend está rodando: `curl http://localhost:3333/health`
2. Verificar `VITE_API_URL` no `.env` do desktop app
3. Verificar CORS no backend (`.env` > `CORS_ORIGIN`)

### Parser de NF-e falha

**Problema**: Erro ao parsear XML

**Soluções**:
1. Verificar se o XML é válido (abrir em editor XML)
2. Verificar se é um XML de NF-e (não de cancelamento ou outra operação)
3. Verificar logs do backend para ver erro específico
4. Testar com XML de exemplo do portal da NF-e

### Prisma Errors

**Problema**: `Prisma Client not generated`

**Solução**:
```bash
cd backend-api
npm run db:generate
```

**Problema**: Migration falha

**Solução**:
```bash
# Resetar banco (CUIDADO: apaga todos os dados)
npx prisma migrate reset

# Ou criar nova migration
npx prisma migrate dev --name fix_issue
```

### Port já em uso

**Problema**: `EADDRINUSE: address already in use :::3333`

**Solução**:
```bash
# Encontrar processo usando a porta
lsof -i :3333

# Matar processo
kill -9 <PID>

# Ou usar outra porta no .env
```

### Build do Electron falha

**Problema**: Erro ao fazer build do desktop app

**Solução**:
```bash
# Limpar cache
rm -rf node_modules
rm -rf dist
npm install

# Reinstalar electron
npm install electron --save-dev

# Tentar novamente
npm run build
```

---

## 📚 Recursos Adicionais

### Documentação das Tecnologias

- **Fastify**: https://www.fastify.io/docs/latest/
- **Prisma**: https://www.prisma.io/docs/
- **Electron**: https://www.electronjs.org/docs/latest/
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/
- **TailwindCSS**: https://tailwindcss.com/docs
- **Zustand**: https://docs.pmnd.rs/zustand/getting-started/introduction

### Estrutura de NF-e

- Portal Nacional NF-e: https://www.nfe.fazenda.gov.br/
- Manual de Integração: https://www.nfe.fazenda.gov.br/portal/principal.aspx
- Exemplos de XML: https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=TQo1YWo/1xQ=

---

## 🎯 Próximos Passos

1. **Testar todas as funcionalidades** seguindo este guia
2. **Personalizar** de acordo com necessidades específicas
3. **Configurar impressora** para cupons fiscais
4. **Deploy em produção** quando estiver pronto
5. **Configurar backup automático** do banco de dados

---

## ✅ Checklist de Instalação

- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `pdv_database` criado
- [ ] Backend instalado e rodando em `localhost:3333`
- [ ] Desktop app instalado e conectando ao backend
- [ ] Web admin instalado e rodando em `localhost:3000`
- [ ] Login funcionando em ambas as interfaces
- [ ] Teste de parsing de NF-e realizado
- [ ] Teste de venda realizado
- [ ] Sincronização testada

---

## 🆘 Suporte

Se encontrar problemas não listados aqui:

1. Verificar logs do backend (terminal onde está rodando)
2. Verificar console do navegador (F12) no web admin
3. Verificar DevTools do Electron (Ctrl+Shift+I) no desktop app
4. Consultar documentação das tecnologias usadas

---

**Sistema PDV - Guia Completo de Instalação v1.0**
Última atualização: 2024-01-15
