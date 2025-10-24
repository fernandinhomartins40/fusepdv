# PDV Desktop App - Electron + React

Aplicação desktop para Ponto de Venda com importação de NF-e.

## Stack

- **Electron** - Framework desktop
- **React 18** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **SQLite** + **Prisma** - Banco local
- **Axios** - Requisições HTTP

## Funcionalidades

### ✅ Implementadas

- Login/Logout
- Tela de Caixa (PDV)
- Leitura de código de barras
- Carrinho de compras
- Finalização de venda
- Múltiplas formas de pagamento
- Cálculo de troco
- **Importação de NF-e** (CORE FEATURE)
  - Upload de XML
  - Parser automático
  - Edição de produtos
  - Margem de lucro configurável
  - Seleção de produtos
  - Importação em lote
- Busca de produtos
- Atalhos de teclado (F2-F6)

### 🚧 Pendentes

- Sincronização offline
- Gestão de caixa (abertura/fechamento)
- Sangrias e reforços
- Configurações locais
- Impressão de cupom

## Instalação

```bash
npm install

# Gerar Prisma Client
npm run db:generate

# Executar migrations
npm run db:migrate
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Atalhos de Teclado

- **F2** - Buscar produto
- **F3** - Aplicar desconto
- **F4** - Cancelar item
- **F5** - Finalizar venda
- **F6** - Importar NF-e

## Estrutura

```
desktop-app/
├── src/
│   ├── main/              # Processo principal Electron
│   │   ├── index.ts
│   │   └── preload.ts
│   └── renderer/          # Interface React
│       ├── components/
│       │   ├── ImportNFEModal.tsx  # Modal de importação
│       │   ├── CartView.tsx
│       │   ├── PaymentModal.tsx
│       │   └── ProductSearch.tsx
│       ├── pages/
│       │   ├── LoginPage.tsx
│       │   └── POSPage.tsx
│       ├── store/
│       │   ├── useAuthStore.ts
│       │   └── useCartStore.ts
│       ├── lib/
│       │   └── api.ts
│       └── App.tsx
├── prisma/
│   └── schema.prisma      # Schema SQLite local
└── package.json
```

## Configuração

Edite `.env`:

```
VITE_API_URL=http://localhost:3333
```

## Uso

1. Faça login com credenciais do servidor
2. Use o leitor de código de barras ou digite manualmente
3. Produtos são adicionados ao carrinho
4. Clique em "Finalizar Venda" (F5)
5. Escolha forma de pagamento
6. Para importar NF-e, clique em "Importar NF-e" (F6)
