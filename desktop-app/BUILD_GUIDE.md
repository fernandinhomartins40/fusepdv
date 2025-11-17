# 📦 Guia Completo de Build - Desktop App

## 🎯 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Preparação](#preparação)
4. [Build de Desenvolvimento](#build-de-desenvolvimento)
5. [Build de Produção](#build-de-produção)
6. [Problemas Comuns](#problemas-comuns)
7. [Otimizações](#otimizações)

---

## 🔍 Visão Geral

Este guia cobre o processo completo de build do aplicativo desktop PDV usando:
- **Electron** 28.x
- **Vite** 5.x
- **React** 18.x
- **Electron Builder** 24.x

### Estrutura de Saída

```
desktop-app/
├── dist/                    # Build de desenvolvimento
│   ├── main/               # Processo principal (Electron)
│   ├── preload/            # Script de preload
│   └── renderer/           # Interface React
│
└── release/                # Instaladores finais
    ├── win-unpacked/       # Windows (descompactado)
    ├── PDV System-Setup-1.0.0.exe  # Instalador Windows
    ├── mac/                # macOS (descompactado)
    ├── PDV System-1.0.0.dmg       # Instalador macOS
    ├── linux-unpacked/     # Linux (descompactado)
    └── PDV-System-1.0.0.AppImage  # AppImage Linux
```

---

## 🔧 Pré-requisitos

### Software Obrigatório

1. **Node.js** >= 18.0.0
   ```bash
   node --version  # v18.0.0 ou superior
   ```

2. **npm** ou **yarn**
   ```bash
   npm --version   # 9.0.0 ou superior
   ```

3. **Git**
   ```bash
   git --version
   ```

### Por Plataforma

#### Windows
- **Windows 10/11** (64-bit)
- **Visual Studio Build Tools** (para módulos nativos)
  ```powershell
  npm install --global windows-build-tools
  ```

#### macOS
- **macOS** 10.13 ou superior
- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

#### Linux
- **Ubuntu/Debian**:
  ```bash
  sudo apt-get install -y build-essential libxtst-dev libpng-dev
  ```

- **Fedora/RHEL**:
  ```bash
  sudo dnf install gcc-c++ make libXtst-devel libpng-devel
  ```

---

## 🚀 Preparação

### 1. Instalar Dependências

```bash
cd desktop-app
npm install
```

### 2. Gerar Cliente Prisma

```bash
npm run db:generate
```

### 3. Configurar Variáveis de Ambiente

Crie `.env`:
```env
VITE_API_URL="http://localhost:3333"
```

### 4. Preparar Ícones

#### Opção A: Usar Ícones Placeholder (apenas desenvolvimento)

```bash
# Gerar ícones SVG placeholder
node build/generate-icons.js

# ⚠️ AVISO: Converta para PNG/ICO/ICNS antes do build!
```

#### Opção B: Criar Ícones Profissionais (recomendado)

1. Crie um ícone PNG de 1024x1024px
2. Use `electron-icon-maker`:
   ```bash
   npm install -g electron-icon-maker
   electron-icon-maker --input=seu-icone.png --output=./build
   ```

3. Ou use ferramentas online:
   - **iConvert Icons**: https://iconverticons.com/online/

Veja `build/ICON_README.md` para mais detalhes.

---

## 🛠️ Build de Desenvolvimento

### Modo Dev com Hot Reload

```bash
npm run dev
```

Isso inicia:
- Vite dev server (porta 5173)
- Electron em modo watch
- Hot reload automático

### Build de Teste (sem installer)

```bash
npm run build:dir
```

Cria aplicativo em `release/[platform]-unpacked/` sem gerar instalador.
Útil para testar rapidamente.

---

## 📦 Build de Produção

### Build para Plataforma Atual

```bash
npm run build
```

Gera instalador para sua plataforma atual.

### Build para Plataformas Específicas

#### Windows

```bash
npm run build:win
```

Gera:
- `PDV System-Setup-{version}.exe` - Instalador NSIS
- `win-unpacked/` - Versão descompactada

**Saída**: `release/PDV System-Setup-1.0.0.exe`

#### macOS

```bash
npm run build:mac
```

Gera:
- `PDV System-{version}.dmg` - Instalador DMG
- `mac/PDV System.app` - Aplicativo macOS

**Saída**: `release/PDV System-1.0.0.dmg`

**Nota**: Para build no macOS com code signing:
```bash
# Configurar variáveis de ambiente
export CSC_IDENTITY_AUTO_DISCOVERY=false  # Desabilitar auto-discovery
npm run build:mac
```

#### Linux

```bash
npm run build:linux
```

Gera:
- `PDV-System-{version}.AppImage` - AppImage
- `pdv-desktop-app_{version}_amd64.deb` - Pacote Debian/Ubuntu
- `linux-unpacked/` - Versão descompactada

**Saída**: `release/PDV-System-1.0.0.AppImage`

### Build para Todas as Plataformas

```bash
npm run build:all
```

**Atenção**:
- No Windows, não pode gerar builds para macOS
- Requer muito espaço em disco (~2GB)
- Leva bastante tempo

---

## 🎯 Estrutura do Build

### 1. Preparação (prebuild)

```bash
npm run db:generate  # Gera cliente Prisma
```

### 2. Build do Frontend (Vite)

```bash
vite build
```

Compila:
- React/TypeScript → JavaScript otimizado
- Processo principal Electron
- Script de preload
- Interface (renderer)

Saída: `dist/`

### 3. Empacotamento (Electron Builder)

```bash
electron-builder
```

Baseado em `electron-builder.yml`:
- Copia arquivos necessários
- Empacota dependências nativas (@prisma/client)
- Cria instaladores por plataforma
- Assina código (se configurado)

Saída: `release/`

---

## 🐛 Problemas Comuns

### Erro: "Cannot find module '@prisma/client'"

**Solução**:
```bash
npm run db:generate
npm install
```

### Erro: "Application icon is not set"

**Causa**: Faltam ícones em `build/`

**Solução**:
```bash
# Verificar ícones existentes
ls -la build/icon.*

# Gerar ícones (veja seção Preparar Ícones)
electron-icon-maker --input=logo.png --output=./build
```

### Erro: "No native build was found for platform=..."

**Causa**: Módulos nativos não foram rebuiltados

**Solução**:
```bash
npm run postinstall
# ou
electron-builder install-app-deps
```

### Build muito lento

**Causas comuns**:
- Antivírus escaneando arquivos
- node_modules muito grande
- Disco lento (HDD vs SSD)

**Soluções**:
```bash
# 1. Excluir node_modules e dist do antivírus

# 2. Limpar cache
rm -rf node_modules
rm -rf dist
rm -rf release
npm install

# 3. Build apenas para uma plataforma
npm run build:win  # Em vez de build:all
```

### Erro: "ENOENT: no such file or directory"

**Causa**: Caminho incorreto no código

**Verificar**:
- `src/main/index.ts` - preload path
- `vite.config.ts` - output dirs
- `electron-builder.yml` - files array

### macOS: "App is damaged and can't be opened"

**Causa**: Aplicativo não assinado

**Solução para desenvolvimento**:
```bash
# Remover quarentena
xattr -cr "/Applications/PDV System.app"
```

**Solução para produção**:
- Obter Apple Developer ID
- Configurar code signing

### Windows: "Windows Defender SmartScreen prevented an unrecognized app"

**Causa**: Instalador não assinado

**Solução para usuários**:
- Clicar "More info" → "Run anyway"

**Solução para produção**:
- Obter certificado de code signing
- Configurar no electron-builder.yml:
  ```yaml
  win:
    certificateFile: path/to/cert.pfx
    certificatePassword: ${env.CERT_PASSWORD}
  ```

---

## ⚡ Otimizações

### Reduzir Tamanho do Instalador

#### 1. Excluir Arquivos Desnecessários

Em `electron-builder.yml`:
```yaml
files:
  - dist/**/*
  - package.json
  - "!**/{.git,.vscode,docs,test}/**/*"
  - "!**/*.{md,map}"
```

#### 2. Comprimir Melhor

```yaml
compression: maximum  # normal | store | maximum
```

#### 3. Usar asar

```yaml
asar: true
```

### Acelerar Build

#### 1. Build Incremental

```bash
# Build apenas o que mudou
npm run build:dir
```

#### 2. Paralelizar (multi-plataforma)

```bash
# No CI/CD
electron-builder --win --mac --linux --parallel
```

#### 3. Usar Cache

```yaml
directories:
  output: release
  buildResources: build

cache:
  - node_modules
  - dist
```

### Otimizar Performance do App

#### 1. Code Splitting

Em `vite.config.ts`:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-label'],
      }
    }
  }
}
```

#### 2. Lazy Loading

```typescript
// Componentes pesados
const ImportNFEModal = lazy(() => import('./components/ImportNFEModal'))
```

#### 3. Minimizar Bundle

```bash
# Analisar bundle
npm run build -- --analyze
```

---

## 📋 Checklist de Build

Antes de fazer build de produção:

- [ ] Versão atualizada em `package.json`
- [ ] Ícones profissionais em `build/`
- [ ] `.env` configurado corretamente
- [ ] Dependências atualizadas (`npm update`)
- [ ] Testes passando
- [ ] Prisma client gerado (`npm run db:generate`)
- [ ] Sem console.log em produção
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado

### Build Final

```bash
# 1. Limpar tudo
rm -rf node_modules dist release
npm install

# 2. Gerar Prisma
npm run db:generate

# 3. Build
npm run build:win   # Windows
npm run build:mac   # macOS
npm run build:linux # Linux

# 4. Testar instalador
# Instale e teste todas as funcionalidades!
```

---

## 📊 Tamanhos Esperados

### Aplicativo Instalado

- **Windows**: ~200-300 MB
- **macOS**: ~180-250 MB
- **Linux AppImage**: ~200-280 MB

### Instaladores

- **Windows (.exe)**: ~80-120 MB
- **macOS (.dmg)**: ~70-100 MB
- **Linux (.AppImage)**: ~80-120 MB

**Nota**: Tamanhos variam dependendo de:
- Dependências instaladas
- Compression level
- Ícones incluídos
- Recursos extras (imagens, fontes)

---

## 🔐 Code Signing (Produção)

### Windows

1. **Obter Certificado**:
   - Compre de CA confiável (Sectigo, DigiCert, etc)
   - Custo: ~$200-400/ano

2. **Configurar**:
   ```yaml
   # electron-builder.yml
   win:
     certificateFile: cert.pfx
     certificatePassword: ${env.WIN_CSC_PASSWORD}
     signingHashAlgorithms: ['sha256']
   ```

3. **Build**:
   ```bash
   WIN_CSC_PASSWORD=sua-senha npm run build:win
   ```

### macOS

1. **Obter Developer ID**:
   - Inscreva-se no Apple Developer Program ($99/ano)
   - Crie certificado de Developer ID Application

2. **Configurar**:
   ```bash
   # Exportar variáveis
   export CSC_NAME="Developer ID Application: Seu Nome (ID)"
   export CSC_KEY_PASSWORD="senha-do-certificado"
   ```

3. **Build com Notarization**:
   ```yaml
   mac:
     hardenedRuntime: true
     notarize: true
   ```

4. **Enviar para Apple**:
   ```bash
   npm run build:mac
   # Electron builder faz notarization automaticamente
   ```

---

## 🚀 CI/CD

### GitHub Actions

Exemplo `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd desktop-app
          npm install

      - name: Generate Prisma Client
        run: |
          cd desktop-app
          npm run db:generate

      - name: Build
        run: |
          cd desktop-app
          npm run build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: installers-${{ matrix.os }}
          path: desktop-app/release/*
```

---

## 📚 Recursos

### Documentação Oficial

- **Electron Builder**: https://www.electron.build/
- **Electron**: https://www.electronjs.org/docs/latest/
- **Vite**: https://vitejs.dev/guide/

### Ferramentas Úteis

- **electron-icon-maker**: Gerar ícones
- **electron-builder-notarize**: Notarizar macOS
- **electron-updater**: Auto-update
- **@electron/rebuild**: Rebuild módulos nativos

### Comunidade

- **Electron Discord**: https://discord.gg/electron
- **Stack Overflow**: Tag [electron]
- **GitHub Discussions**: electron-builder repo

---

## 🎓 Comandos Rápidos

```bash
# Desenvolvimento
npm run dev                 # Modo dev com hot reload

# Build de teste
npm run build:dir           # Build sem installer

# Build de produção
npm run build               # Plataforma atual
npm run build:win           # Windows
npm run build:mac           # macOS
npm run build:linux         # Linux
npm run build:all           # Todas as plataformas

# Utilitários
npm run db:generate         # Gerar Prisma client
npm run postinstall         # Rebuild app deps
node build/generate-icons.js # Gerar ícones placeholder

# Limpeza
rm -rf node_modules dist release
npm install
```

---

**Desktop App Build Guide v1.0**
Última atualização: 2024-01-15

Para problemas não listados aqui, consulte `TROUBLESHOOTING.md` ou abra uma issue.
