const http = require('http');
const https = require('https');
const url = require('url');

const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3001;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не настроен!');
  process.exit(1);
}

// Webhook URL для Render.com
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://money8888-production.up.railway.app/webhook';

// Функция для отправки запроса к Telegram API
function sendTelegramRequest(method, data = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Обработка команд бота
async function handleMessage(update) {
  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;
  const text = message.text;
  const username = message.from.username || message.from.first_name;

  console.log(`📨 Получено сообщение от @${username}: ${text}`);

  try {
    if (text === '/start') {
      await sendTelegramRequest('sendMessage', {
        chat_id: chatId,
        text: `🎮 <b>Добро пожаловать в Energy of Money!</b>\n\n` +
              `👋 Привет, ${message.from.first_name}!\n\n` +
              `🎯 Это игра про управление деньгами и достижение целей.\n\n` +
              `🔗 <a href="https://money8888-production.up.railway.app">Играть в Energy of Money</a>\n\n` +
              `💡 <b>Команды бота:</b>\n` +
              `/start - Начать\n` +
              `/help - Помощь\n` +
              `/game - Перейти к игре\n` +
              `/rooms - Список комнат`,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    }
    else if (text === '/help') {
      await sendTelegramRequest('sendMessage', {
        chat_id: chatId,
        text: `🆘 <b>Помощь по игре Energy of Money</b>\n\n` +
              `🎮 <b>Как играть:</b>\n` +
              `1. Перейдите на сайт игры\n` +
              `2. Создайте комнату или присоединитесь к существующей\n` +
              `3. Выберите профессию и мечту\n` +
              `4. Начните играть!\n\n` +
              `🔗 <a href="https://money8888-production.up.railway.app">Играть в Energy of Money</a>\n\n` +
              `💬 <b>Поддержка:</b>\n` +
              `Если у вас есть вопросы, напишите @mag8888`,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    }
    else if (text === '/game') {
      await sendTelegramRequest('sendMessage', {
        chat_id: chatId,
        text: `🎮 <b>Переход к игре</b>\n\n` +
              `🔗 <a href="https://money8888-production.up.railway.app">Играть в Energy of Money</a>\n\n` +
              `💡 <i>Игра откроется в новом окне</i>`,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    }
    else if (text === '/rooms') {
      await sendTelegramRequest('sendMessage', {
        chat_id: chatId,
        text: `🏠 <b>Список комнат</b>\n\n` +
              `🔗 <a href="https://money8888-production.up.railway.app/rooms">Просмотреть комнаты</a>\n\n` +
              `💡 <i>Там вы сможете создать новую комнату или присоединиться к существующей</i>`,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    }
    else {
      // Неизвестная команда
      await sendTelegramRequest('sendMessage', {
        chat_id: chatId,
        text: `❓ <b>Неизвестная команда</b>\n\n` +
              `Используйте /help для списка доступных команд.\n\n` +
              `🔗 <a href="https://money8888-production.up.railway.app">Играть в Energy of Money</a>`,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });
    }
  } catch (error) {
    console.error('❌ Ошибка отправки сообщения:', error);
  }
}

// Создание HTTP сервера
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (path === '/' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'Bot is running',
      bot: 'https://t.me/energy_m_bot',
      game: 'https://money8888-production.up.railway.app/',
      timestamp: new Date().toISOString()
    }));
  }
  else if (path === '/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      timestamp: new Date().toISOString()
    }));
  }
  else if (path === '/webhook' && method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const update = JSON.parse(body);
        console.log('📨 Получен webhook:', update);
        
        // Обрабатываем сообщение
        await handleMessage(update);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (error) {
        console.error('❌ Ошибка обработки webhook:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
  }
  else if (path === '/setwebhook' && method === 'POST') {
    // Установка webhook
    sendTelegramRequest('setWebhook', {
      url: WEBHOOK_URL
    }).then(result => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    }).catch(error => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: error.message }));
    });
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`🤖 Telegram Bot запущен на порту ${PORT}`);
  console.log(`🔗 Webhook URL: ${WEBHOOK_URL}`);
  console.log(`🌐 Game URL: https://money8888-production.up.railway.app`);
  
  // Устанавливаем webhook при запуске
  sendTelegramRequest('setWebhook', {
    url: WEBHOOK_URL
  }).then(result => {
    console.log('✅ Webhook установлен:', result);
  }).catch(error => {
    console.error('❌ Ошибка установки webhook:', error);
  });
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('🛑 Остановка бота...');
  server.close(() => {
    process.exit(0);
  });
});

process.once('SIGTERM', () => {
  console.log('🛑 Остановка бота...');
  server.close(() => {
    process.exit(0);
  });
});

module.exports = server;
