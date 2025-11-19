#!/bin/bash

# ============================================================================
# Script de Merge para Main - Sistema PDV
# ============================================================================
# Este script faz o merge da branch de feature para main e push para origin.
# Execute este script no seu terminal local (não no Claude Code).
# ============================================================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}    Sistema PDV - Script de Merge para Main${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] && [ ! -d "backend-api" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto fusepdv${NC}"
    exit 1
fi

echo -e "${YELLOW}📥 Buscando atualizações do repositório...${NC}"
git fetch --all --prune

echo ""
echo -e "${YELLOW}🔄 Atualizando branch main...${NC}"
git checkout main
git pull origin main

echo ""
echo -e "${YELLOW}🔀 Fazendo merge da feature branch...${NC}"

FEATURE_BRANCH="origin/claude/continue-implementation-verify-01NQocA9AeMEJSGqsk4ugdCY"

git merge $FEATURE_BRANCH --no-ff -m "feat: Verificação completa do sistema + Build do Desktop App (#1)

## 🎯 Resumo

Esta PR implementa a verificação completa do sistema PDV e configura o build do desktop app para gerar instaladores para Windows, macOS e Linux.

## ✨ Funcionalidades Implementadas

### Backend API
- **Gestão de Caixa completa** (6 endpoints)
  - POST /caixa/abrir - Abrir caixa com valor inicial
  - POST /caixa/fechar - Fechar com conferência
  - POST /caixa/sangria - Registrar retirada
  - POST /caixa/reforco - Registrar adição
  - GET /caixa/atual - Consultar caixa aberto
  - GET /caixa/movimentacoes - Histórico
- Schema Prisma atualizado com campos de controle de saldo

### Desktop App
- **Configuração completa do Electron Builder**
  - Windows: Instalador NSIS (.exe)
  - macOS: DMG com code signing
  - Linux: AppImage + DEB
- Scripts de build otimizados
- Sistema de ícones (8 tamanhos SVG)
- Correção do caminho do preload

## 📚 Documentação Criada

- GUIA_COMPLETO_INSTALACAO.md (605 linhas)
- VERIFICACAO_E_CORRECOES.md (436 linhas)
- BUILD_GUIDE.md (670 linhas)
- CORRECOES_BUILD.md (397 linhas)
- PLANO_MERGE.md (319 linhas)

## 📊 Estatísticas

- 25 arquivos alterados
- +3.782 linhas adicionadas
- 21 arquivos novos
- 4 arquivos modificados

## ✅ Commits incluídos

- 0379bde feat: Sistema PDV - Verificação completa e correções
- f9a47ae fix: Configuração completa de build do Desktop App
- 8fc171a docs: Plano de merge e análise de branches"

echo ""
echo -e "${YELLOW}📤 Enviando para origin/main...${NC}"
git push origin main

echo ""
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}✅ MERGE CONCLUÍDO COM SUCESSO!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""

# Mostrar status final
echo -e "${BLUE}📊 Status Final:${NC}"
git log --oneline -5
echo ""

# Perguntar se deseja deletar a branch de feature
echo -e "${YELLOW}🗑️  Deseja deletar a branch de feature? (s/n)${NC}"
read -r response
if [[ "$response" =~ ^([sS][iI][mM]|[sS])$ ]]; then
    echo -e "${YELLOW}Deletando branch remota...${NC}"
    git push origin --delete claude/continue-implementation-verify-01NQocA9AeMEJSGqsk4ugdCY 2>/dev/null || echo "Branch remota já deletada ou não existe"

    echo -e "${YELLOW}Deletando branch local...${NC}"
    git branch -D claude/continue-implementation-verify-01NQocA9AeMEJSGqsk4ugdCY 2>/dev/null || echo "Branch local já deletada ou não existe"

    echo -e "${GREEN}✅ Branch de feature deletada${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Tudo pronto! O sistema está atualizado.${NC}"
echo ""
echo -e "${BLUE}Próximos passos recomendados:${NC}"
echo "  1. cd backend-api && npm run db:migrate"
echo "  2. cd desktop-app && npm run db:generate"
echo "  3. Testar: npm run dev (em cada projeto)"
echo ""
