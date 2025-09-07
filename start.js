#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Запуск модульной игровой системы...\n');

// Проверяем, установлены ли зависимости
const packageJsonPath = path.join(__dirname, 'package.json');
const nodeModulesPath = path.join(__dirname, 'node_modules');

const fs = require('fs');

if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Установка зависимостей...');
  exec('npm install', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Ошибка при установке зависимостей:', error);
      return;
    }
    console.log('✅ Зависимости установлены');
    startApp();
  });
} else {
  startApp();
}

function startApp() {
  console.log('🎯 Запуск приложения...');
  exec('npm start', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Ошибка при запуске приложения:', error);
      return;
    }
    console.log(stdout);
  });
}
