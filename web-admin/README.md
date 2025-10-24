# PDV Web Admin - Painel Administrativo

Painel administrativo web para gestão remota do Sistema PDV.

## Stack

- **Next.js 14** (App Router)
- **React 18** + **TypeScript**
- **TailwindCSS** - Estilização
- **Recharts** - Gráficos
- **TanStack Table** - Tabelas avançadas
- **Axios** - Requisições HTTP

## Funcionalidades

### ✅ Implementadas

#### Dashboard
- Cards com métricas principais
- Gráficos de vendas por dia (Line Chart)
- Vendas por forma de pagamento (Pie Chart)
- Top 10 produtos mais vendidos (Bar Chart)
- Estatísticas em tempo real
- Ticket médio
- Valor total de vendas

#### Gestão de Produtos
- Tabela completa com TanStack Table
- Busca global
- Filtros por status (ativo/inativo)
- Ordenação por colunas
- Paginação
- Exportar para CSV
- Edição e exclusão
- Destaque para estoque baixo

#### Relatórios de Vendas
- Filtros por período (data inicial e final)
- Gráfico de vendas por dia
- Gráfico de vendas por forma de pagamento
- Tabela de produtos mais vendidos
- Exportar relatório em TXT
- Métricas agregadas (total, ticket médio)

#### Histórico de NF-e
- Listagem completa de importações
- Detalhes de cada NF-e
- Download do XML original
- Informações do fornecedor
- Quantidade de produtos importados
- Valor total da nota

#### Gestão de Usuários
- Listar todos os usuários
- Criar novo usuário
- Editar usuário existente
- Desativar usuário
- Definir perfil (Admin/Operador)
- Alterar senha

#### Configurações
- Dados do estabelecimento
- Telefone, endereço, cidade, estado, CEP
- Estatísticas do estabelecimento
- Contadores de produtos, vendas, usuários

#### Vendas
- Listagem completa de vendas
- Visualizar detalhes da venda
- Itens da venda
- Informações do operador
- Forma de pagamento
- Status da venda

## Instalação

```bash
npm install

# Copiar .env.example para .env.local
cp .env.example .env.local

# Editar .env.local com a URL da API
NEXT_PUBLIC_API_URL=http://localhost:3333
```

## Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Estrutura

```
web-admin/
├── src/
│   ├── app/
│   │   ├── login/page.tsx           # Login
│   │   ├── (authenticated)/
│   │   │   ├── layout.tsx           # Layout com sidebar
│   │   │   ├── dashboard/page.tsx   # Dashboard
│   │   │   ├── products/page.tsx    # Produtos
│   │   │   ├── sales/page.tsx       # Vendas
│   │   │   ├── reports/page.tsx     # Relatórios
│   │   │   ├── nfe/page.tsx         # Histórico NF-e
│   │   │   ├── users/page.tsx       # Usuários
│   │   │   └── settings/page.tsx    # Configurações
│   │   └── globals.css
│   ├── components/
│   │   └── Sidebar.tsx              # Barra lateral de navegação
│   └── lib/
│       ├── api.ts                   # Cliente Axios
│       └── utils.ts                 # Funções utilitárias
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Páginas

### Dashboard (`/dashboard`)
- Visão geral completa
- Gráficos interativos
- Métricas em tempo real

### Produtos (`/products`)
- Tabela com busca e filtros
- Exportar CSV
- Gerenciamento completo

### Vendas (`/sales`)
- Histórico de vendas
- Detalhes de cada venda
- Filtros e busca

### Relatórios (`/reports`)
- Relatórios personalizados
- Gráficos de análise
- Exportação

### NF-e (`/nfe`)
- Histórico de importações
- Download de XMLs
- Detalhes das notas

### Usuários (`/users`)
- Gestão de acesso
- Perfis e permissões
- Criar/editar/desativar

### Configurações (`/settings`)
- Dados do estabelecimento
- Informações de contato
- Estatísticas

## Recursos

- **Responsivo**: Funciona em desktop, tablet e mobile
- **Gráficos Interativos**: Recharts com tooltips
- **Tabelas Avançadas**: TanStack Table com ordenação e filtros
- **Exportação**: CSV e TXT
- **Navegação Intuitiva**: Sidebar fixa
- **Autenticação**: JWT com refresh automático

## Credenciais de Teste

```
Email: admin@mercadoexemplo.com
Senha: senha123
```

## API Endpoints Utilizados

- `GET /establishment/stats` - Estatísticas
- `GET /sales/report/summary` - Relatórios
- `GET /products` - Produtos
- `GET /sales` - Vendas
- `GET /nfe/history` - Histórico NF-e
- `GET /establishment/users` - Usuários
- `GET /establishment` - Dados do estabelecimento
- E muitos outros...

## Melhorias Futuras

- [ ] Gráficos em tempo real com WebSocket
- [ ] Notificações push
- [ ] Modo escuro
- [ ] Exportação em PDF
- [ ] Filtros salvos
- [ ] Dashboards personalizáveis
