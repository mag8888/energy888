#!/usr/bin/env node

// Скрипт для проверки конфигурации Railway
const https = require('https');

const RAILWAY_URL = 'https://money8888-production.up.railway.app';

console.log('🔍 Проверка конфигурации Railway...\n');

// Функция для проверки endpoint
function checkEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'money8888-production.up.railway.app',
      port: 443,
      path: path,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === expectedStatus) {
          console.log(`✅ ${path} - OK (${res.statusCode})`);
          resolve({ status: 'success', data: data });
        } else {
          console.log(`❌ ${path} - FAILED (${res.statusCode})`);
          resolve({ status: 'error', statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${path} - ERROR: ${error.message}`);
      resolve({ status: 'error', error: error.message });
    });

    req.on('timeout', () => {
      console.log(`❌ ${path} - TIMEOUT`);
      req.destroy();
      resolve({ status: 'timeout' });
    });

    req.end();
  });
}

// Функция для проверки webhook
function checkWebhook() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      test: true,
      message: {
        message_id: 1,
        from: { id: 123, first_name: 'Test' },
        chat: { id: 123 },
        text: '/start'
      }
    });

    const options = {
      hostname: 'money8888-production.up.railway.app',
      port: 443,
      path: '/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ /webhook - OK (${res.statusCode})`);
          resolve({ status: 'success', data: data });
        } else {
          console.log(`❌ /webhook - FAILED (${res.statusCode})`);
          resolve({ status: 'error', statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ /webhook - ERROR: ${error.message}`);
      resolve({ status: 'error', error: error.message });
    });

    req.on('timeout', () => {
      console.log(`❌ /webhook - TIMEOUT`);
      req.destroy();
      resolve({ status: 'timeout' });
    });

    req.write(postData);
    req.end();
  });
}

// Основная функция проверки
async function checkConfiguration() {
  console.log('📡 Проверяем API endpoints...\n');
  
  // Проверяем основные endpoints
  await checkEndpoint('/');
  await checkEndpoint('/health');
  
  console.log('\n📨 Проверяем webhook...\n');
  await checkWebhook();
  
  console.log('\n🔗 Проверяем внешние ссылки...\n');
  
  // Проверяем игру
  try {
    const gameCheck = await checkEndpoint('https://money8888-production.up.railway.app/', 200);
    if (gameCheck.status === 'success') {
      console.log('✅ Игра доступна');
    } else {
      console.log('❌ Игра недоступна');
    }
  } catch (error) {
    console.log('❌ Ошибка проверки игры:', error.message);
  }
  
  console.log('\n📋 Резюме:');
  console.log('1. Убедитесь, что все переменные окружения настроены в Railway');
  console.log('2. Проверьте, что бот запущен и отвечает');
  console.log('3. Убедитесь, что webhook установлен корректно');
  console.log('\n🔗 Ссылки:');
  console.log(`- Railway: ${RAILWAY_URL}`);
  console.log('- Бот: https://t.me/energy_m_bot');
  console.log('- Игра: https://money8888-production.up.railway.app/');
}

// Запускаем проверку
checkConfiguration().catch(console.error);
