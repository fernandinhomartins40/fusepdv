# Prompt para Claude Code - Sistema PDV com Importação de NF-e

Você é um desenvolvedor sênior full-stack especializado em criar sistemas para varejo brasileiro. Sua missão é construir um sistema PDV (Ponto de Venda) desktop moderno com painel web administrativo, focado em resolver a dor de cadastro complexo de produtos através da leitura automática de Notas Fiscais Eletrônicas.

## OBJETIVO GERAL

Criar dois sistemas integrados:
1. **Aplicação Desktop (PDV)**: Para operação no ponto de venda (caixa)
2. **Aplicação Web (Painel Administrativo)**: Para gestão remota pelo dono do estabelecimento

## STACK TECNOLÓGICA OBRIGATÓRIA

### Desktop (PDV)
- **Framework**: Electron com React e TypeScript
- **UI**: TailwindCSS + shadcn/ui para componentes
- **Banco Local**: SQLite com Prisma ORM
- **Estado**: Zustand para gerenciamento de estado
- **Validação**: Zod para schemas
- **Sincronização**: Axios para comunicação com backend

### Backend (API)
- **Framework**: Node.js com Fastify ou Express
- **Linguagem**: TypeScript
- **Banco**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT (access token + refresh token)
- **Validação**: Zod
- **Parser XML**: fast-xml-parser para processar NF-e
- **WebSocket**: Socket.io para sincronização em tempo real

### Web (Painel Administrativo)
- **Framework**: Next.js 14+ com App Router
- **Linguagem**: TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **Gráficos**: Recharts
- **Tabelas**: TanStack Table
- **Formulários**: React Hook Form + Zod
- **Estado**: Zustand ou Context API

## ESTRUTURA DE PASTAS

```
/pdv-system
├── /desktop-app          # Aplicação Electron
│   ├── /src
│   │   ├── /main         # Processo principal Electron
│   │   ├── /renderer     # Interface React
│   │   │   ├── /components
│   │   │   ├── /pages
│   │   │   ├── /hooks
│   │   │   ├── /store
│   │   │   ├── /lib
│   │   │   └── /types
│   │   └── /database     # SQLite + Prisma
│   ├── package.json
│   └── electron-builder.json
│
├── /backend-api          # API Node.js
│   ├── /src
│   │   ├── /routes
│   │   ├── /controllers
│   │   ├── /services
│   │   ├── /middlewares
│   │   ├── /utils
│   │   │   └── /nfe-parser  # Parser de NF-e
│   │   ├── /types
│   │   └── /database
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── /web-admin           # Painel Next.js
    ├── /src
    │   ├── /app
    │   ├── /components
    │   ├── /hooks
    │   ├── /lib
    │   └── /types
    └── package.json
```

## FUNCIONALIDADES DETALHADAS

### 1. APLICAÇÃO DESKTOP (PDV)

#### 1.1 Tela de Login
- Login local ou online (verifica se há internet)
- Armazena credenciais de forma segura (electron-store)
- Modo offline: permite operação sem internet com sincronização posterior

#### 1.2 Tela de Caixa (Venda)
- Interface limpa e responsiva
- Leitura de código de barras via leitor ou digitação
- Adicionar produtos à venda
- Aplicar descontos (percentual ou valor fixo)
- Mostrar subtotal e total em tempo real
- Campos: Quantidade, Produto, Preço Unit., Subtotal
- Atalhos de teclado: F2 (buscar produto), F3 (desconto), F4 (cancelar item), F5 (finalizar venda)

#### 1.3 Finalização de Venda
- Escolher método de pagamento (Dinheiro, Débito, Crédito, PIX, Múltiplos)
- Calcular troco automaticamente
- Opção de emitir cupom fiscal (NFC-e) - preparar estrutura, não implementar totalmente no MVP
- Salvar venda no banco local
- Enfileirar para sincronização se offline

#### 1.4 Gestão de Produtos (Simplificada)
- Listar produtos com busca e filtros
- Cadastro manual básico (nome, código, preço, estoque)
- **DESTAQUE:** Botão "Importar da Nota Fiscal"

#### 1.5 Importação de NF-e (FUNCIONALIDADE PRINCIPAL)
- Upload de arquivo XML (NF-e, NFC-e, SAT)
- Opção de colar conteúdo XML diretamente
- Parser extrai automaticamente:
  - Dados do fornecedor (CNPJ, razão social)
  - Lista de produtos com:
    - Código EAN/GTIN
    - Descrição
    - NCM
    - CEST
    - Unidade
    - Quantidade
    - Preço unitário (custo)
    - Valor total
    - CFOP
    - Alíquotas de impostos (ICMS, PIS, COFINS)
- Mostrar tabela com produtos extraídos
- Permitir edição antes de importar:
  - Marcar/desmarcar produtos para importar
  - Editar descrição
  - Definir preço de venda (sugerir margem de lucro)
  - Atribuir categoria
  - Definir estoque inicial
- Validar duplicatas (avisar se EAN já existe)
- Salvar produtos no banco local
- Salvar também dados da NF-e para auditoria

#### 1.6 Gerenciamento de Caixa
- Abertura de caixa (informar valor inicial)
- Sangrias e reforços
- Fechamento de caixa com relatório

#### 1.7 Sincronização
- Sincronização automática em segundo plano quando online
- Indicador visual de status (sincronizado/sincronizando/offline)
- Fila de sincronização para vendas, produtos, movimentações
- Resolver conflitos (last-write-wins ou manual)

#### 1.8 Configurações
- Dados do estabelecimento
- Configuração de impressora (cupom não fiscal)
- Preferências de margem de lucro padrão
- URL do servidor backend
- Ativar/desativar sincronização automática

### 2. BACKEND (API)

#### 2.1 Autenticação e Autorização
- Registro de estabelecimentos (sign-up)
- Login com email/senha
- JWT com refresh token
- Middleware de autenticação
- Controle de permissões (admin, operador)

#### 2.2 API REST - Endpoints Principais

**Autenticação:**
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

**Estabelecimentos:**
- GET /establishments/:id
- PATCH /establishments/:id

**Produtos:**
- GET /products (com paginação, busca, filtros)
- GET /products/:id
- POST /products
- PATCH /products/:id
- DELETE /products/:id
- POST /products/import-nfe (endpoint especial)

**Vendas:**
- GET /sales (com filtros de data, status)
- GET /sales/:id
- POST /sales
- GET /sales/report (dados agregados)

**Sincronização:**
- POST /sync/products
- POST /sync/sales
- GET /sync/status

**NF-e Parser:**
- POST /nfe/parse (recebe XML, retorna JSON estruturado)
- GET /nfe/history (histórico de importações)

#### 2.3 Parser de NF-e
- Validar estrutura do XML
- Extrair dados do emitente
- Extrair dados dos produtos (nProd, cProd, cEAN, xProd, NCM, CFOP, uCom, qCom, vUnCom, vProd, etc.)
- Extrair impostos (ICMS, PIS, COFINS)
- Retornar estrutura JSON limpa e organizada
- Tratar diferentes versões de NF-e (4.00)
- Tratar NFC-e e SAT

#### 2.4 Banco de Dados - Schema Prisma

**Estabelecimentos:**
- id, nome, cnpj, email, telefone, endereço, createdAt, updatedAt

**Usuários:**
- id, establishmentId, nome, email, senha (hash), role, createdAt

**Produtos:**
- id, establishmentId, codigo, ean, nome, descricao, categoria, unidade, precoCusto, precoVenda, estoque, ncm, cest, cfop, ativo, createdAt, updatedAt

**Vendas:**
- id, establishmentId, userId, numero, data, subtotal, desconto, total, status, formaPagamento, sincronizado, createdAt

**ItensVenda:**
- id, vendaId, produtoId, quantidade, precoUnitario, subtotal, desconto

**NotasFiscais:**
- id, establishmentId, chave, numero, serie, fornecedorCnpj, fornecedorNome, dataEmissao, valorTotal, xmlContent, createdAt

**MovimentacoesCaixa:**
- id, estabelecimentoId, userId, tipo, valor, descricao, data

#### 2.5 WebSocket
- Emitir eventos de sincronização
- Notificar alterações em tempo real para o painel web
- Eventos: venda-nova, produto-atualizado, caixa-fechado

### 3. PAINEL WEB (ADMINISTRATIVO)

#### 3.1 Dashboard Principal
- Cards com métricas principais (vendas do dia, mês, produtos cadastrados, estoque baixo)
- Gráfico de vendas (últimos 7/30 dias)
- Top 10 produtos mais vendidos
- Últimas vendas
- Status de sincronização dos PDVs

#### 3.2 Gestão de Produtos
- Tabela completa com todos os produtos
- Filtros avançados (categoria, estoque, ativo/inativo)
- Busca por nome, código ou EAN
- Exportar para Excel/CSV
- Edição inline ou modal
- Exclusão com confirmação
- Upload de imagem de produto (nice to have)

#### 3.3 Relatório de Vendas
- Filtros por período, produto, operador
- Gráficos de vendas por dia/mês
- Vendas por forma de pagamento
- Vendas por categoria de produto
- Exportar relatórios

#### 3.4 Histórico de Importações NF-e
- Listar todas as NF-e importadas
- Mostrar data, fornecedor, valor total, quantidade de produtos
- Download do XML original
- Detalhar produtos importados

#### 3.5 Gestão de Estoque
- Visualização de estoque atual
- Alertas de estoque baixo
- Histórico de movimentações
- Ajuste manual de estoque

#### 3.6 Gestão de Usuários
- Listar usuários/operadores
- Adicionar novo usuário
- Definir permissões (admin, caixa)
- Desativar usuário

#### 3.7 Configurações
- Dados do estabelecimento
- Configurações fiscais básicas
- Margem de lucro padrão
- Preferências de relatórios

#### 3.8 Multi-dispositivo
- Responsivo (desktop, tablet, mobile)
- Funciona em qualquer navegador moderno

## REQUISITOS NÃO FUNCIONAIS

### Segurança
- Senhas com bcrypt (salt rounds: 10)
- Tokens JWT seguros
- Validação de entrada em todas as APIs
- Proteção contra SQL injection (uso de ORM)
- HTTPS obrigatório em produção
- CORS configurado corretamente

### Performance
- Listagem de produtos paginada (20-50 itens por página)
- Busca otimizada com índices no banco
- Lazy loading de imagens
- Debounce em campos de busca
- Cache de dados frequentes (opcional no MVP)

### Usabilidade
- Interface limpa e intuitiva
- Feedback visual para todas as ações
- Mensagens de erro claras
- Loading states apropriados
- Confirmações para ações destrutivas
- Atalhos de teclado no PDV

### Confiabilidade
- Tratamento de erros robusto
- Logs de operações críticas
- Retry automático em falhas de sincronização
- Validação de dados antes de salvar
- Backup automático do banco local (SQLite)

### Escalabilidade
- Arquitetura modular
- Preparado para múltiplos estabelecimentos
- Preparado para múltiplos PDVs por estabelecimento

## FLUXO COMPLETO DE IMPORTAÇÃO DE NF-e

1. Usuário clica em "Importar Nota Fiscal" no PDV
2. Modal abre com opção de upload ou colar XML
3. Usuário faz upload do arquivo XML
4. Frontend envia XML para backend via POST /nfe/parse
5. Backend valida e parseia XML
6. Backend retorna JSON com produtos extraídos
7. Frontend exibe tabela editável com produtos
8. Usuário revisa e edita:
   - Marca produtos para importar
   - Define preço de venda (sugestão baseada em margem)
   - Atribui categoria
   - Define estoque inicial
9. Usuário clica em "Importar Selecionados"
10. Frontend envia produtos finalizados para POST /products/bulk
11. Backend salva produtos no PostgreSQL
12. Backend salva registro da NF-e importada
13. Se PDV está offline, salva no SQLite local e enfileira para sync
14. Retorna sucesso e atualiza lista de produtos
15. Mostra notificação de sucesso com quantidade importada

## VALIDAÇÕES IMPORTANTES NO PARSER

- Verificar estrutura XML válida
- Validar namespace da NF-e
- Checar assinatura digital (não bloquear importação se inválida, mas avisar)
- Validar CNPJ do fornecedor
- Validar código EAN (se presente, deve ter 8, 12, 13 ou 14 dígitos)
- Tratar produtos sem EAN
- Tratar valores decimais corretamente
- Tratar caracteres especiais em descrições

## EXEMPLO DE ESTRUTURA XML DA NF-e (SIMPLIFICADO)

```xml
<nfeProc>
  <NFe>
    <infNFe>
      <emit>
        <CNPJ>12345678000190</CNPJ>
        <xNome>Fornecedor LTDA</xNome>
      </emit>
      <det nItem="1">
        <prod>
          <cProd>001</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>Produto Exemplo</xProd>
          <NCM>12345678</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>10.0000</qCom>
          <vUnCom>15.50</vUnCom>
          <vProd>155.00</vProd>
        </prod>
        <imposto>...</imposto>
      </det>
    </infNFe>
  </NFe>
</nfeProc>
```

## ORDEM DE DESENVOLVIMENTO SUGERIDA

### Fase 1 - Fundação (Backend + DB)
1. Setup do backend (Fastify/Express + TypeScript)
2. Configurar Prisma + PostgreSQL
3. Criar schemas do banco
4. Implementar autenticação JWT
5. Criar endpoints básicos de CRUD

### Fase 2 - Parser de NF-e (Core Feature)
6. Implementar parser de XML (função isolada)
7. Criar endpoint POST /nfe/parse
8. Testar com XMLs reais de exemplo
9. Tratar edge cases e erros

### Fase 3 - Desktop PDV
10. Setup Electron + React + TypeScript
11. Configurar SQLite + Prisma local
12. Criar tela de login
13. Criar tela de caixa/venda
14. Implementar leitura de código de barras
15. Criar modal de importação de NF-e
16. Integrar com backend para parse
17. Implementar cadastro local de produtos
18. Implementar sincronização básica

### Fase 4 - Painel Web
19. Setup Next.js + TypeScript
20. Criar layout e navegação
21. Implementar autenticação
22. Dashboard com métricas
23. CRUD de produtos
24. Relatórios de vendas
25. Histórico de NF-e importadas

### Fase 5 - Refinamento
26. Melhorar sincronização (queue, retry)
27. Adicionar WebSocket para tempo real
28. Melhorar tratamento de erros
29. Adicionar loading states
30. Testes básicos
31. Documentação README

## ARQUIVOS DE EXEMPLO PARA TESTAR

Procure exemplos de XML de NF-e em:
- Site da SEFAZ (exemplos oficiais)
- https://www.nfe.fazenda.gov.br/
- Gerar NF-e de teste em ambientes homologação

## OBSERVAÇÕES FINAIS

- **Priorize a funcionalidade de importação de NF-e**: É o diferencial do produto
- **Interface deve ser intuitiva**: Varejistas não são técnicos
- **Offline-first no PDV**: O caixa não pode parar
- **Performance é crítica**: PDV precisa ser rápido
- **Validação rigorosa**: Dados fiscais precisam estar corretos
- **Documentação clara**: Facilita manutenção futura

## RECURSOS E DEPENDÊNCIAS PRINCIPAIS

```json
// Desktop
{
  "electron": "^28.0.0",
  "react": "^18.2.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.4.0",
  "zustand": "^4.4.0",
  "prisma": "^5.7.0",
  "@prisma/client": "^5.7.0",
  "zod": "^3.22.0",
  "axios": "^1.6.0",
  "electron-store": "^8.1.0"
}

// Backend
{
  "fastify": "^4.25.0",
  "typescript": "^5.3.0",
  "prisma": "^5.7.0",
  "@prisma/client": "^5.7.0",
  "zod": "^3.22.0",
  "bcrypt": "^5.1.0",
  "jsonwebtoken": "^9.0.0",
  "fast-xml-parser": "^4.3.0",
  "socket.io": "^4.6.0"
}

// Web
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.3.0",
  "tailwindcss": "^3.4.0",
  "recharts": "^2.10.0",
  "@tanstack/react-table": "^8.11.0",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.0",
  "axios": "^1.6.0"
}
```

## COMECE AGORA

Inicie criando a estrutura de pastas e configurando o backend com Prisma. Depois implemente o parser de NF-e. Este é o coração do sistema e deve funcionar perfeitamente antes de prosseguir para as interfaces.

Boa sorte! Este sistema resolve uma dor real do varejo brasileiro e tem grande potencial de mercado.