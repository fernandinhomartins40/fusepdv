# Ícones do Aplicativo

## Arquivos Necessários

Para o build completo do aplicativo, você precisa dos seguintes ícones:

### Windows
- `icon.ico` - Ícone principal (256x256px ou superior)
  - Deve conter múltiplos tamanhos: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256

### macOS
- `icon.icns` - Ícone para macOS (1024x1024px recomendado)
- `entitlements.mac.plist` - Configuração de permissões

### Linux
- `icons/` - Diretório com ícones em vários tamanhos:
  - 16x16.png
  - 32x32.png
  - 48x48.png
  - 64x64.png
  - 128x128.png
  - 256x256.png
  - 512x512.png

## Como Gerar Ícones

### Opção 1: Usando uma imagem PNG de alta qualidade

1. Tenha uma imagem PNG quadrada de pelo menos 1024x1024px
2. Use ferramentas online gratuitas:
   - **iConvert Icons**: https://iconverticons.com/online/
   - **CloudConvert**: https://cloudconvert.com/png-to-ico
   - **Icon Converter**: https://www.aconvert.com/icon/

### Opção 2: Usando Electron Icon Maker (Recomendado)

```bash
# Instalar globalmente
npm install -g electron-icon-maker

# Gerar todos os ícones a partir de uma imagem PNG
electron-icon-maker --input=logo.png --output=./build
```

### Opção 3: Usando electron-icon-builder

```bash
# Instalar como dev dependency
npm install --save-dev electron-icon-builder

# Adicionar ao package.json
"build-icons": "electron-icon-builder --input=./logo.png --output=./build --flatten"

# Executar
npm run build-icons
```

### Opção 4: Manualmente com ImageMagick

```bash
# Converter PNG para ICO (Windows)
convert logo.png -resize 256x256 icon.ico

# Para macOS (requer iconutil do macOS)
mkdir icon.iconset
sips -z 16 16     logo.png --out icon.iconset/icon_16x16.png
sips -z 32 32     logo.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     logo.png --out icon.iconset/icon_32x32.png
sips -z 64 64     logo.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   logo.png --out icon.iconset/icon_128x128.png
sips -z 256 256   logo.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   logo.png --out icon.iconset/icon_256x256.png
sips -z 512 512   logo.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   logo.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 logo.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset
```

## Requisitos dos Ícones

### Design
- Fundo transparente (PNG)
- Quadrado (proporção 1:1)
- Resolução mínima: 512x512px
- Resolução recomendada: 1024x1024px
- Cores: RGB (não CMYK)

### Estilo
- Simples e reconhecível
- Funciona bem em tamanhos pequenos (16x16)
- Contrasta com fundos claros e escuros
- Evite detalhes muito finos

## Ícones Placeholder

Atualmente, o projeto usa ícones placeholder básicos.
**IMPORTANTE**: Substitua estes ícones antes do build de produção!

## Para Produção

1. Crie ou encomende um ícone profissional
2. Gere todas as variações necessárias
3. Coloque os arquivos neste diretório (`build/`)
4. Execute o build normalmente

## Recursos Úteis

- **Flaticon**: https://www.flaticon.com/
- **Icons8**: https://icons8.com/
- **Iconfinder**: https://www.iconfinder.com/
- **The Noun Project**: https://thenounproject.com/

## Verificar Ícones

Antes de fazer o build:

```bash
# Verificar se os ícones existem
ls -la build/icon.*
ls -la build/icons/

# Tamanhos dos ícones Linux
du -sh build/icons/*
```
