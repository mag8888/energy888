#!/usr/bin/env node

// Продвинутый HTTP сервер для Railway с поддержкой Socket.IO
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Energy of Money Advanced Server...');
console.log('📁 Working directory:', process.cwd());
console.log(`📡 Server will run on port: ${PORT}`);

// HTML страница встроена в код
const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Energy of Money - Игра</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
            font-size: 2.5em;
        }
        p {
            color: #666;
            font-size: 1.2em;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .status {
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 1.1em;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
        }
        .info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .socket-status {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Energy of Money</h1>
        <div class="status">✅ Сервер работает!</div>
        <p>Добро пожаловать в игру "Энергия денег" - интерактивную игру для изучения финансовой грамотности.</p>
        
        <div class="socket-status">
            <h3>🔌 Socket.IO Status</h3>
            <p id="socket-status">Подключение...</p>
        </div>
        
        <div class="info">
            <h3>🚀 Статус развертывания</h3>
            <p><strong>Платформа:</strong> Railway.app</p>
            <p><strong>Статус:</strong> Успешно развернуто</p>
            <p><strong>Время:</strong> <span id="time"></span></p>
        </div>
        
        <div class="info">
            <h3>🎯 Возможности игры</h3>
            <p>• Изучение основ финансовой грамотности</p>
            <p>• Интерактивные задания и квесты</p>
            <p>• Система достижений и прогресса</p>
            <p>• Многопользовательские комнаты</p>
        </div>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        // Показываем текущее время
        function updateTime() {
            const now = new Date();
            document.getElementById('time').textContent = now.toLocaleString('ru-RU');
        }
        updateTime();
        setInterval(updateTime, 1000);
        
        // Socket.IO подключение
        const socket = io();
        
        socket.on('connect', () => {
            document.getElementById('socket-status').textContent = '✅ Подключено к Socket.IO';
            console.log('Socket.IO подключен');
        });
        
        socket.on('disconnect', () => {
            document.getElementById('socket-status').textContent = '❌ Отключено от Socket.IO';
            console.log('Socket.IO отключен');
        });
        
        socket.on('error', (error) => {
            document.getElementById('socket-status').textContent = '❌ Ошибка Socket.IO: ' + error;
            console.error('Socket.IO ошибка:', error);
        });
    </script>
</body>
</html>`;

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Обслуживаем главную страницу
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
  }
  // Health check endpoint
  else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString(),
      socketio: 'available'
    }));
  }
  // Webhook endpoint для Telegram
  else if (req.url === '/webhook' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const update = JSON.parse(body);
        console.log('📨 Получен webhook:', update);
        
        // Простая обработка webhook
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        console.error('❌ Ошибка обработки webhook:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
  }
  // API endpoint для статуса
  else if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'Bot is running',
      bot: 'https://t.me/energy_m_bot',
      game: 'https://money8888-production.up.railway.app/',
      socketio: 'available',
      timestamp: new Date().toISOString()
    }));
  }
  else {
    // Для всех остальных запросов возвращаем 404
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <html>
        <head><title>404 - Страница не найдена</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>404 - Страница не найдена</h1>
          <p>Перейдите на <a href="/">главную страницу</a></p>
        </body>
      </html>
    `);
  }
});

// Создаем Socket.IO сервер
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Обработка Socket.IO подключений
io.on('connection', (socket) => {
  console.log(`🔌 Новое Socket.IO подключение: ${socket.id}`);
  
  // Отправляем приветственное сообщение
  socket.emit('welcome', {
    message: 'Добро пожаловать в Energy of Money!',
    timestamp: new Date().toISOString()
  });
  
  // Обработка получения комнат
  socket.on('getRooms', (callback) => {
    console.log('📋 Запрос списка комнат');
    callback({
      rooms: [
        { id: 'room1', name: 'Комната 1', players: 2, maxPlayers: 6 },
        { id: 'room2', name: 'Комната 2', players: 1, maxPlayers: 6 }
      ]
    });
  });
  
  // Обработка создания комнаты
  socket.on('createRoom', (data, callback) => {
    console.log('🏠 Создание комнаты:', data);
    const roomId = 'room_' + Date.now();
    callback({
      success: true,
      roomId: roomId,
      message: 'Комната создана успешно'
    });
  });
  
  // Обработка присоединения к комнате
  socket.on('joinRoom', (data, callback) => {
    console.log('🚪 Присоединение к комнате:', data);
    callback({
      success: true,
      message: 'Вы присоединились к комнате'
    });
  });
  
  // Обработка отключения
  socket.on('disconnect', () => {
    console.log(`🔌 Socket.IO отключение: ${socket.id}`);
  });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Откройте http://localhost:${PORT} в браузере`);
  console.log(`🔌 Socket.IO доступен на /socket.io/`);
});

// Обработка завершения работы
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM, завершаем работу...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Получен SIGINT, завершаем работу...');
  server.close(() => {
    console.log('✅ Сервер остановлен');
    process.exit(0);
  });
});

module.exports = server;
