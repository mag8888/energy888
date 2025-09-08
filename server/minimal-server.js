const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// Хранилище токенов и комнат
const tokens = new Map();
const rooms = new Map();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Content-Type': 'application/json'
};

// Функция для отправки JSON ответа
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, corsHeaders);
  res.end(JSON.stringify(data));
}

// Функция для парсинга POST данных
function parsePostData(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      callback(data);
    } catch (error) {
      callback(null);
    }
  });
}

// Создание сервера
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  // Обработка CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // Маршруты
  if (path === '/' && method === 'GET') {
    sendJSON(res, 200, {
      ok: true,
      message: 'Energy888 Minimal Server is running',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      host: HOST,
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        newToken: '/tg/new-token',
        poll: '/tg/poll',
        authorize: '/tg/authorize'
      }
    });
  }
  else if (path === '/health' && method === 'GET') {
    sendJSON(res, 200, {
      ok: true,
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      tokens: tokens.size,
      rooms: rooms.size
    });
  }
  else if (path === '/tg/new-token' && method === 'GET') {
    try {
      const token = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
      
      tokens.set(token, {
        createdAt: Date.now(),
        authorized: false
      });
      
      console.log('🔑 Создан новый токен:', token);
      
      sendJSON(res, 200, {
        ok: true,
        token,
        expiresIn: 300000
      });
    } catch (error) {
      console.error('❌ Ошибка создания токена:', error);
      sendJSON(res, 500, { ok: false, error: 'Failed to create token' });
    }
  }
  else if (path === '/tg/poll' && method === 'GET') {
    try {
      const { token } = parsedUrl.query;
      
      if (!token) {
        sendJSON(res, 400, { ok: false, error: 'Token required' });
        return;
      }
      
      const tokenData = tokens.get(token);
      
      if (!tokenData) {
        sendJSON(res, 404, { ok: false, error: 'Token not found' });
        return;
      }
      
      if (Date.now() - tokenData.createdAt > 300000) {
        tokens.delete(token);
        sendJSON(res, 410, { ok: false, error: 'Token expired' });
        return;
      }
      
      sendJSON(res, 200, {
        ok: true,
        authorized: tokenData.authorized,
        user: tokenData.user || null
      });
    } catch (error) {
      console.error('❌ Ошибка проверки токена:', error);
      sendJSON(res, 500, { ok: false, error: 'Failed to check token' });
    }
  }
  else if (path === '/tg/authorize' && method === 'POST') {
    parsePostData(req, (data) => {
      try {
        if (!data) {
          sendJSON(res, 400, { ok: false, error: 'Invalid JSON' });
          return;
        }

        const { token, id, username, first_name, last_name, photo_url } = data;
        
        console.log('🔐 Попытка авторизации:', { token, id, username });
        
        if (!token) {
          sendJSON(res, 400, { ok: false, error: 'Token required' });
          return;
        }
        
        const tokenData = tokens.get(token);
        
        if (!tokenData) {
          sendJSON(res, 404, { ok: false, error: 'Token not found' });
          return;
        }
        
        if (Date.now() - tokenData.createdAt > 300000) {
          tokens.delete(token);
          sendJSON(res, 410, { ok: false, error: 'Token expired' });
          return;
        }
        
        const userData = {
          id: `tg_${id}`,
          username: username || `user_${id}`,
          tgId: id,
          firstName: first_name,
          lastName: last_name,
          photoUrl: photo_url
        };
        
        tokenData.authorized = true;
        tokenData.user = userData;
        
        console.log('✅ Пользователь авторизован:', userData);
        
        sendJSON(res, 200, {
          ok: true,
          authorized: true,
          user: userData
        });
      } catch (error) {
        console.error('❌ Ошибка авторизации:', error);
        sendJSON(res, 500, { ok: false, error: 'Authorization failed' });
      }
    });
  }
  else {
    sendJSON(res, 404, { ok: false, error: 'Not found' });
  }
});

// Запуск сервера
server.listen(PORT, HOST, () => {
  console.log(`🚀 Minimal Server listening on ${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Process ID: ${process.pid}`);
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
});

process.once('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  server.close(() => {
    process.exit(0);
  });
});

module.exports = server;
