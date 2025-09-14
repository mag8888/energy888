#!/usr/bin/env node

// Безопасный HTTP сервер для Railway с поддержкой Socket.IO
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');

// Валидация конфигурации
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не настроен!');
  process.exit(1);
}

console.log('🚀 Starting Energy of Money Secure Server...');
console.log('📁 Working directory:', process.cwd());
console.log(`📡 Server will run on port: ${PORT}`);

// Функция для валидации webhook данных
function validateWebhookData(data) {
  try {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Invalid data format' };
    }
    
    // Проверяем обязательные поля для Telegram webhook
    if (data.message) {
      const message = data.message;
      if (!message.chat || !message.from) {
        return { valid: false, error: 'Invalid message structure' };
      }
      
      // Санитизируем текст сообщения
      if (message.text && typeof message.text === 'string') {
        message.text = message.text.slice(0, 4096); // Ограничиваем длину
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Функция для санитизации HTML
function sanitizeHtml(html) {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// HTML страница с безопасностью
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
        
        // Socket.IO подключение с обработкой ошибок
        let socket;
        try {
            socket = io();
            
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
        } catch (error) {
            document.getElementById('socket-status').textContent = '❌ Ошибка инициализации Socket.IO';
            console.error('Ошибка Socket.IO:', error);
        }
    </script>
</body>
</html>`;

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
  const startTime = Date.now();
  
  // Логирование с ограничением
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Rate limiting (простая реализация)
  const clientIP = req.connection.remoteAddress;
  if (!global.rateLimit) {
    global.rateLimit = new Map();
  }
  
  const now = Date.now();
  const windowMs = 60000; // 1 минута
  const maxRequests = 100; // максимум 100 запросов в минуту
  
  if (global.rateLimit.has(clientIP)) {
    const requests = global.rateLimit.get(clientIP);
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Too Many Requests' }));
      return;
    }
    
    recentRequests.push(now);
    global.rateLimit.set(clientIP, recentRequests);
  } else {
    global.rateLimit.set(clientIP, [now]);
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
      socketio: 'available',
      uptime: process.uptime()
    }));
  }
  // Webhook endpoint для Telegram с валидацией
  else if (req.url === '/webhook' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const update = JSON.parse(body);
        
        // Валидация данных
        const validation = validateWebhookData(update);
        if (!validation.valid) {
          console.error('❌ Невалидные webhook данные:', validation.error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: validation.error }));
          return;
        }
        
        console.log('📨 Получен валидный webhook:', update);
        
        // Простая обработка webhook
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        console.error('❌ Ошибка обработки webhook:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Internal server error' }));
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
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
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
  
  // Логирование времени ответа
  const duration = Date.now() - startTime;
  if (process.env.NODE_ENV !== 'production' && duration > 1000) {
    console.warn(`⚠️ Медленный запрос: ${req.url} - ${duration}ms`);
  }
});

// Создаем Socket.IO сервер с ограничениями
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e6, // 1MB максимум
  pingTimeout: 60000,
  pingInterval: 25000
});

// Обработка Socket.IO подключений с ограничениями
const connectedClients = new Map();
const MAX_CLIENTS = 1000;

io.on('connection', (socket) => {
  // Проверяем лимит подключений
  if (connectedClients.size >= MAX_CLIENTS) {
    socket.emit('error', 'Server is at capacity');
    socket.disconnect();
    return;
  }
  
  const clientId = socket.id;
  connectedClients.set(clientId, {
    connectedAt: Date.now(),
    ip: socket.handshake.address
  });
  
  console.log(`🔌 Новое Socket.IO подключение: ${clientId} (${connectedClients.size}/${MAX_CLIENTS})`);
  
  // Отправляем приветственное сообщение
  socket.emit('welcome', {
    message: 'Добро пожаловать в Energy of Money!',
    timestamp: new Date().toISOString(),
    clientId: clientId
  });
  
  // Обработка получения комнат с валидацией
  socket.on('getRooms', (callback) => {
    try {
      console.log('📋 Запрос списка комнат');
      const rooms = [
        { id: 'room1', name: 'Комната 1', players: 2, maxPlayers: 6 },
        { id: 'room2', name: 'Комната 2', players: 1, maxPlayers: 6 }
      ];
      
      if (typeof callback === 'function') {
        callback({ rooms });
      }
    } catch (error) {
      console.error('❌ Ошибка получения комнат:', error);
      if (typeof callback === 'function') {
        callback({ error: 'Failed to get rooms' });
      }
    }
  });
  
  // Обработка создания комнаты с валидацией
  socket.on('createRoom', (data, callback) => {
    try {
      // Валидация данных
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid room data');
      }
      
      console.log('🏠 Создание комнаты:', data);
      const roomId = 'room_' + Date.now();
      
      if (typeof callback === 'function') {
        callback({
          success: true,
          roomId: roomId,
          message: 'Комната создана успешно'
        });
      }
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });
  
  // Обработка присоединения к комнате с валидацией
  socket.on('joinRoom', (data, callback) => {
    try {
      // Валидация данных
      if (!data || !data.roomId) {
        throw new Error('Room ID is required');
      }
      
      console.log('🚪 Присоединение к комнате:', data);
      
      if (typeof callback === 'function') {
        callback({
          success: true,
          message: 'Вы присоединились к комнате'
        });
      }
    } catch (error) {
      console.error('❌ Ошибка присоединения к комнате:', error);
      if (typeof callback === 'function') {
        callback({ success: false, error: error.message });
      }
    }
  });
  
  // Обработка отключения
  socket.on('disconnect', () => {
    connectedClients.delete(clientId);
    console.log(`🔌 Socket.IO отключение: ${clientId} (${connectedClients.size}/${MAX_CLIENTS})`);
  });
});

// Глобальная обработка ошибок
process.on('uncaughtException', (error) => {
  console.error('❌ Необработанная ошибка:', error);
  // Не завершаем процесс в production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Критическая ошибка, но продолжаем работу');
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение Promise:', reason);
  // Не завершаем процесс в production
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Критическая ошибка Promise, но продолжаем работу');
  }
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`🌐 Откройте http://localhost:${PORT} в браузере`);
  console.log(`🔌 Socket.IO доступен на /socket.io/`);
  console.log(`🔐 Webhook secret: ${WEBHOOK_SECRET.substring(0, 8)}...`);
});

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`🛑 Получен ${signal}, завершаем работу...`);
  
  // Закрываем Socket.IO
  io.close(() => {
    console.log('🔌 Socket.IO закрыт');
  });
  
  // Закрываем HTTP сервер
  server.close(() => {
    console.log('✅ HTTP сервер остановлен');
    process.exit(0);
  });
  
  // Принудительное завершение через 10 секунд
  setTimeout(() => {
    console.error('❌ Принудительное завершение');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
