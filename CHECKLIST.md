# Checklist de Desenvolvimento - Sistema PDV

## ✅ FASE 1 - Fundação (Backend + DB) - CONCLUÍDA

### Configuração Inicial
- [x] Criar estrutura de pastas do projeto
- [x] Setup do backend (Fastify + TypeScript)
- [x] Configurar package.json com dependências
- [x] Configurar tsconfig.json
- [x] Criar .env e .env.example
- [x] Configurar .gitignore

### Banco de Dados
- [x] Configurar Prisma ORM
- [x] Criar schema.prisma completo
  - [x] Model Establishment
  - [x] Model User (com roles)
  - [x] Model RefreshToken
  - [x] Model Product
  - [x] Model Sale
  - [x] Model SaleItem
  - [x] Model NfeImport
  - [x] Model CaixaMovimentacao
- [x] Criar seed.ts para dados de teste

### Autenticação JWT
- [x] Implementar AuthService
  - [x] Registro de estabelecimento
  - [x] Login
  - [x] Verificação de refresh token
  - [x] Revogação de tokens
- [x] Implementar AuthController
- [x] Criar auth.types.ts com schemas Zod
- [x] Criar auth.middleware.ts
- [x] Criar auth.routes.ts
- [x] Implementar access token (15min)
- [x] Implementar refresh token (7 dias)

### CRUD de Produtos
- [x] Implementar ProductService
  - [x] Criar produto
  - [x] Criar produtos em lote (bulk)
  - [x] Listar com filtros e paginação
  - [x] Buscar por ID
  - [x] Buscar por código
  - [x] Buscar por EAN
  - [x] Atualizar produto
  - [x] Deletar produto (soft delete)
  - [x] Listar categorias
  - [x] Produtos com estoque baixo
  - [x] Atualizar estoque
- [x] Implementar ProductController
- [x] Criar product.types.ts com schemas Zod
- [x] Criar product.routes.ts

### Servidor
- [x] Configurar servidor Fastify
- [x] Registrar plugins (CORS, JWT, Multipart)
- [x] Registrar rotas
- [x] Health check endpoint
- [x] Graceful shutdown

### Documentação
- [x] README.md principal
- [x] README.md do backend
- [x] QUICK_START.md
- [x] PROJECT_STRUCTURE.md
- [x] test.http para testes de API
- [x] Este checklist

---

## 🚧 FASE 2 - Parser de NF-e (PRÓXIMA)

### Parser XML
- [ ] Criar NFEParserService
  - [ ] Validar estrutura XML
  - [ ] Extrair dados do emitente
  - [ ] Extrair produtos (nProd, cProd, cEAN, xProd, NCM, etc.)
  - [ ] Extrair impostos (ICMS, PIS, COFINS)
  - [ ] Tratar diferentes versões de NF-e
  - [ ] Tratar NFC-e
  - [ ] Tratar SAT
- [ ] Criar nfe.types.ts
- [ ] Criar NFEController
- [ ] Criar nfe.routes.ts
  - [ ] POST /nfe/parse (recebe XML, retorna JSON)
  - [ ] GET /nfe/history (histórico de importações)
- [ ] Validações
  - [ ] Verificar assinatura digital
  - [ ] Validar CNPJ
  - [ ] Validar código EAN
  - [ ] Tratar produtos sem EAN
  - [ ] Tratar valores decimais
  - [ ] Tratar caracteres especiais

### Testes
- [ ] Baixar XMLs de exemplo da SEFAZ
- [ ] Testar com NF-e versão 4.00
- [ ] Testar com NFC-e
- [ ] Testar com diferentes fornecedores
- [ ] Testar edge cases

---

## 📋 FASE 3 - Desktop PDV (PLANEJADO)

### Setup
- [ ] Configurar Electron + React + TypeScript
- [ ] Configurar Vite para build
- [ ] Configurar SQLite + Prisma local
- [ ] Configurar TailwindCSS + shadcn/ui
- [ ] Configurar Zustand
- [ ] Configurar electron-store

### Autenticação
- [ ] Tela de login
- [ ] Login local (offline)
- [ ] Login online
- [ ] Armazenar credenciais seguramente

### Tela de Caixa
- [ ] Interface de venda
- [ ] Leitura de código de barras
- [ ] Adicionar produtos à venda
- [ ] Remover produtos
- [ ] Aplicar descontos
- [ ] Calcular totais
- [ ] Atalhos de teclado (F2, F3, F4, F5)

### Finalização de Venda
- [ ] Escolher forma de pagamento
- [ ] Calcular troco
- [ ] Salvar venda no SQLite local
- [ ] Enfileirar para sincronização

### Gestão de Produtos
- [ ] Listar produtos
- [ ] Buscar produtos
- [ ] Cadastro manual
- [ ] **Modal de importação de NF-e**
  - [ ] Upload de arquivo XML
  - [ ] Colar conteúdo XML
  - [ ] Enviar para backend parse
  - [ ] Exibir tabela editável
  - [ ] Marcar/desmarcar produtos
  - [ ] Editar campos
  - [ ] Sugerir margem de lucro
  - [ ] Validar duplicatas
  - [ ] Salvar produtos

### Sincronização
- [ ] Sincronização automática em background
- [ ] Fila de sincronização
- [ ] Resolver conflitos
- [ ] Indicador visual de status
- [ ] Retry automático

### Gerenciamento de Caixa
- [ ] Abertura de caixa
- [ ] Sangrias
- [ ] Reforços
- [ ] Fechamento de caixa
- [ ] Relatório de fechamento

### Configurações
- [ ] Dados do estabelecimento
- [ ] Configuração de impressora
- [ ] Margem de lucro padrão
- [ ] URL do servidor
- [ ] Toggle sincronização

---

## 📋 FASE 4 - Painel Web (PLANEJADO)

### Setup
- [ ] Configurar Next.js 14+ com App Router
- [ ] Configurar TailwindCSS + shadcn/ui
- [ ] Configurar Recharts
- [ ] Configurar TanStack Table
- [ ] Configurar React Hook Form + Zod

### Autenticação
- [ ] Página de login
- [ ] Integração com API
- [ ] Persistência de tokens
- [ ] Refresh automático

### Dashboard
- [ ] Cards com métricas principais
- [ ] Gráfico de vendas (7/30 dias)
- [ ] Top 10 produtos
- [ ] Últimas vendas
- [ ] Status de sincronização dos PDVs

### Gestão de Produtos
- [ ] Tabela com TanStack Table
- [ ] Filtros avançados
- [ ] Busca
- [ ] Exportar para Excel/CSV
- [ ] Edição inline ou modal
- [ ] Exclusão com confirmação
- [ ] Upload de imagem (opcional)

### Relatório de Vendas
- [ ] Filtros por período
- [ ] Gráficos
- [ ] Vendas por forma de pagamento
- [ ] Vendas por categoria
- [ ] Exportar relatórios

### Histórico de NF-e
- [ ] Listar todas as importações
- [ ] Detalhes da importação
- [ ] Download do XML
- [ ] Produtos importados

### Gestão de Estoque
- [ ] Visualização de estoque
- [ ] Alertas de estoque baixo
- [ ] Histórico de movimentações
- [ ] Ajuste manual

### Gestão de Usuários
- [ ] Listar usuários
- [ ] Adicionar usuário
- [ ] Definir permissões
- [ ] Desativar usuário

### Configurações
- [ ] Dados do estabelecimento
- [ ] Configurações fiscais
- [ ] Margem de lucro padrão
- [ ] Preferências

---

## 📋 FASE 5 - Refinamento (PLANEJADO)

### Funcionalidades Avançadas
- [ ] WebSocket para tempo real
  - [ ] Notificações de vendas
  - [ ] Atualização de estoque
  - [ ] Status de caixas
- [ ] Relatórios avançados
- [ ] Backup automático
- [ ] Logs de auditoria

### CRUD de Vendas (Backend)
- [ ] SaleService
- [ ] SaleController
- [ ] sale.routes.ts
- [ ] Filtros e relatórios

### Qualidade
- [ ] Testes unitários (Jest)
- [ ] Testes de integração
- [ ] Melhorar tratamento de erros
- [ ] Melhorar logging
- [ ] Documentação de API (Swagger)

### Performance
- [ ] Cache com Redis (opcional)
- [ ] Otimização de queries
- [ ] Compressão de respostas
- [ ] Rate limiting

### Deploy
- [ ] Configurar Docker
- [ ] CI/CD
- [ ] Monitoramento
- [ ] Backup automático

---

## Legenda

- ✅ **Concluído** - Implementado e testado
- 🚧 **Em andamento** - Próxima fase
- 📋 **Planejado** - Futuras fases
- [ ] **A fazer** - Ainda não iniciado
- [x] **Feito** - Já implementado
