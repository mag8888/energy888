#!/usr/bin/env node

// 🏦 Build script для Bank Module
// Создает готовый к распространению пакет

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏦 Building Energy of Money Bank Module...');

// Создаем директорию dist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Копируем основные файлы
const filesToCopy = [
  'package.json',
  'index.js',
  'README.md'
];

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${file}`);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

// Копируем директорию src
const srcDir = path.join(__dirname, 'src');
const distSrcDir = path.join(distDir, 'src');

if (fs.existsSync(srcDir)) {
  copyDir(srcDir, distSrcDir);
  console.log('✅ Copied src/ directory');
}

// Копируем директорию examples
const examplesDir = path.join(__dirname, 'examples');
const distExamplesDir = path.join(distDir, 'examples');

if (fs.existsSync(examplesDir)) {
  copyDir(examplesDir, distExamplesDir);
  console.log('✅ Copied examples/ directory');
}

// Создаем .npmignore
const npmignoreContent = `
# Development files
build.js
*.log
.DS_Store
node_modules/
.git/
.gitignore

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Test files
test/
tests/
__tests__/
*.test.js
*.spec.js

# Documentation
docs/
*.md
!README.md
`;

fs.writeFileSync(path.join(distDir, '.npmignore'), npmignoreContent.trim());
console.log('✅ Created .npmignore');

// Создаем .gitignore
const gitignoreContent = `
node_modules/
dist/
*.log
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
`;

fs.writeFileSync(path.join(distDir, '.gitignore'), gitignoreContent.trim());
console.log('✅ Created .gitignore');

// Функция для рекурсивного копирования директорий
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('🎉 Build completed!');
console.log('📦 Package ready in dist/ directory');
console.log('📋 To publish: cd dist && npm publish');
