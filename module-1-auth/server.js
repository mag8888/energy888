const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Telegram Bot Token (должен быть в .env)
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

console.log('🚀 Starting Energy of Money - Auth Module...');
console.log(`📡 Port: ${PORT}`);

// Главная страница с авторизацией
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Energy of Money - Авторизация</title>
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
                max-width: 500px;
                margin: 20px;
            }
            h1 {
                color: #333;
                margin-bottom: 20px;
                font-size: 2.5em;
            }
            .auth-section {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 15px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
            }
            .telegram-btn {
                background: #0088cc;
                color: white;
                padding: 15px 30px;
                border: none;
                border-radius: 50px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
                margin: 10px;
                transition: all 0.3s ease;
            }
            .telegram-btn:hover {
                background: #006699;
                transform: translateY(-2px);
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
                background: #e3f2fd;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                border-left: 4px solid #2196f3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎮 Energy of Money</h1>
            <div class="status">✅ Модуль авторизации работает!</div>
            
            <div class="auth-section">
                <h3>🔐 Авторизация через Telegram</h3>
                <p>Войдите в игру используя свой Telegram аккаунт</p>
                <a href="#" class="telegram-btn" onclick="startTelegramAuth()">
                    📱 Войти через Telegram
                </a>
            </div>
            
            <div class="info">
                <h3>📋 Возможности модуля</h3>
                <p>• Безопасная авторизация через Telegram</p>
                <p>• Проверка пользователей</p>
                <p>• Создание игровых профилей</p>
                <p>• Сохранение прогресса</p>
            </div>
            
            <div class="info">
                <h3>🚀 Статус развертывания</h3>
                <p><strong>Модуль:</strong> Авторизация</p>
                <p><strong>Платформа:</strong> Railway.app</p>
                <p><strong>Время:</strong> <span id="time"></span></p>
            </div>
        </div>

        <script>
            function startTelegramAuth() {
                // Здесь будет логика авторизации через Telegram
                alert('Функция авторизации будет реализована в следующей версии');
            }
            
            function updateTime() {
                const now = new Date();
                document.getElementById('time').textContent = now.toLocaleString('ru-RU');
            }
            updateTime();
            setInterval(updateTime, 1000);
        </script>
    </body>
    </html>
  `);
});

// API для авторизации через Telegram
app.post('/api/auth/telegram', async (req, res) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({ error: 'Отсутствуют данные авторизации' });
    }

    // Здесь будет проверка подписи Telegram
    // Пока что просто возвращаем успех
    res.json({
      success: true,
      message: 'Авторизация успешна',
      user: {
        id: '12345',
        username: 'test_user',
        first_name: 'Test',
        last_name: 'User'
      }
    });
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API для проверки статуса
app.get('/api/status', (req, res) => {
  res.json({
    module: 'auth',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`✅ Auth module running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in browser`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down...');
  process.exit(0);
});
