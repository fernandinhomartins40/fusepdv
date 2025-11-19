#!/usr/bin/env node

/**
 * Script para gerar ícones placeholder para o aplicativo
 * ATENÇÃO: Este é apenas um placeholder! Substitua por ícones profissionais.
 *
 * Para executar:
 * node build/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// SVG placeholder simples
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fundo gradiente -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Círculo de fundo -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad)"/>

  <!-- Ícone PDV (caixa registradora estilizada) -->
  <g transform="translate(${size * 0.25}, ${size * 0.25})">
    <!-- Tela/Display -->
    <rect x="${size * 0.1}" y="${size * 0.05}" width="${size * 0.3}" height="${size * 0.15}"
          fill="#fff" rx="${size * 0.02}"/>

    <!-- Corpo da caixa -->
    <rect x="${size * 0.05}" y="${size * 0.22}" width="${size * 0.4}" height="${size * 0.2}"
          fill="#fff" rx="${size * 0.02}"/>

    <!-- Gaveta -->
    <rect x="${size * 0.05}" y="${size * 0.43}" width="${size * 0.4}" height="${size * 0.08}"
          fill="#E0E7FF" rx="${size * 0.01}"/>

    <!-- Botões (grid 3x2) -->
    ${[0, 1, 2].map(row =>
      [0, 1].map(col =>
        `<rect x="${size * (0.08 + col * 0.13)}" y="${size * (0.27 + row * 0.05)}"
               width="${size * 0.04}" height="${size * 0.04}"
               fill="#818CF8" rx="${size * 0.005}"/>`
      ).join('\n')
    ).join('\n')}
  </g>

  <!-- Texto PDV -->
  <text x="${size/2}" y="${size * 0.85}"
        font-family="Arial, sans-serif"
        font-size="${size * 0.12}"
        font-weight="bold"
        fill="#fff"
        text-anchor="middle">PDV</text>
</svg>`;

// Criar diretório icons se não existir
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Tamanhos necessários para Linux
const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];

console.log('🎨 Gerando ícones placeholder...\n');

// Gerar SVG para cada tamanho
sizes.forEach(size => {
  const svg = createSVG(size);
  const filename = size === 1024 ? 'icon.svg' : `${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`✓ Criado: icons/${filename}`);
});

// Criar um ícone principal PNG (placeholder)
const mainIcon = createSVG(512);
fs.writeFileSync(path.join(__dirname, 'icon.png.svg'), mainIcon);
console.log(`✓ Criado: icon.png.svg (renomeie para icon.png depois de converter)`);

console.log('\n📝 PRÓXIMOS PASSOS:');
console.log('1. Converta os arquivos SVG para PNG usando uma ferramenta online ou local');
console.log('2. Para Windows: Use https://iconverticons.com/ para gerar icon.ico');
console.log('3. Para macOS: Use https://iconverticons.com/ para gerar icon.icns');
console.log('4. Ou instale electron-icon-maker: npm install -g electron-icon-maker');
console.log('   Depois execute: electron-icon-maker --input=icon.png --output=./build');
console.log('\n⚠️  IMPORTANTE: Estes são ícones PLACEHOLDER!');
console.log('   Substitua por ícones profissionais antes do build de produção.\n');
