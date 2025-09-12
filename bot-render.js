#!/usr/bin/env node

// Этот файл создан для совместимости с Railway
// Railway всё ещё пытается запустить bot-render.js
// Поэтому мы перенаправляем на наш простой сервер

console.log('🔄 Railway пытается запустить bot-render.js');
console.log('🔄 Перенаправляем на simple-server.js...');

// Запускаем simple-server.js
require('./simple-server.js');