const http = require('http');
const url = require('url');
const { Server } = require('socket.io');

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

// Создание HTTP сервера
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
      message: 'Energy888 Socket Server is running',
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
      rooms: rooms.size,
      connectedClients: io.engine.clientsCount
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

// Создание Socket.IO сервера
const io = new Server(server, {
  cors: {
    origin: [
      "https://money8888-production.up.railway.app",
      "http://localhost:3000",
      "https://money8888-production.up.railway.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO обработчики
io.on('connection', (socket) => {
  console.log('🔌 Клиент подключен:', socket.id);
  
  // Получение списка комнат
  socket.on('get-rooms', () => {
    const roomsList = Array.from(rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      players: room.players.length,
      maxPlayers: room.maxPlayers,
      status: room.status,
      timing: room.timing,
      createdAt: room.createdAt
    }));
    
    socket.emit('rooms-list', roomsList);
    console.log('📋 Отправлен список комнат:', roomsList.length);
  });
  
  // Создание комнаты
  socket.on('create-room', (roomData) => {
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      const room = {
        id: roomId,
        name: roomData.name || `Комната ${rooms.size + 1}`,
        players: [],
        maxPlayers: roomData.maxPlayers || 4,
        status: 'waiting',
        timing: roomData.timing || 120, // 2 минуты по умолчанию
        createdAt: Date.now(),
        createdBy: socket.id
      };
      
      rooms.set(roomId, room);
      
      // Присоединяем создателя к комнате
      socket.join(roomId);
      room.players.push({
        id: socket.id,
        name: roomData.playerName || 'Игрок',
        email: roomData.playerEmail || 'player@example.com',
        isReady: false
      });
      
      console.log('🏠 Создана комната:', roomId, room.name);
      
      // Уведомляем всех о новой комнате
      io.emit('room-created', {
        id: room.id,
        name: room.name,
        players: room.players.length,
        maxPlayers: room.maxPlayers,
        status: room.status,
        timing: room.timing,
        createdAt: room.createdAt
      });
      
      socket.emit('room-created-success', room);
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      socket.emit('room-created-error', { error: 'Failed to create room' });
    }
  });
  
  // Присоединение к комнате
  socket.on('join-room', (data) => {
    try {
      const { roomId, playerName, playerEmail } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('join-room-error', { error: 'Room not found' });
        return;
      }
      
      if (room.players.length >= room.maxPlayers) {
        socket.emit('join-room-error', { error: 'Room is full' });
        return;
      }
      
      if (room.status !== 'waiting') {
        socket.emit('join-room-error', { error: 'Room is not available' });
        return;
      }
      
      // Проверяем, не присоединился ли уже этот игрок
      const existingPlayer = room.players.find(p => p.id === socket.id);
      if (existingPlayer) {
        // Игрок уже в комнате, просто отправляем обновленную информацию
        socket.emit('room-joined', {
          id: room.id,
          name: room.name,
          maxPlayers: room.maxPlayers,
          currentPlayers: room.players.length,
          turnTime: room.timing,
          status: room.status,
          players: room.players
        });
        return;
      }
      
      // Присоединяем к комнате
      socket.join(roomId);
      room.players.push({
        id: socket.id,
        name: playerName || 'Игрок',
        email: playerEmail || 'player@example.com',
        isReady: false
      });
      
      console.log('👤 Игрок присоединился к комнате:', roomId, playerName);
      
      // Отправляем полную информацию о комнате
      socket.emit('room-joined', {
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        currentPlayers: room.players.length,
        turnTime: room.timing,
        status: room.status,
        players: room.players
      });
      
      // Уведомляем всех в комнате
      io.to(roomId).emit('player-joined', {
        playerId: socket.id,
        playerName: playerName || 'Игрок',
        players: room.players
      });
      
      // Уведомляем всех о обновлении списка комнат
      io.emit('rooms-updated');
      
    } catch (error) {
      console.error('❌ Ошибка присоединения к комнате:', error);
      socket.emit('join-room-error', { error: 'Failed to join room' });
    }
  });
  
  // Покидание комнаты
  socket.on('leave-room', (data) => {
    try {
      const { roomId } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        return;
      }
      
      // Удаляем игрока из комнаты
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        socket.leave(roomId);
        
        console.log('👤 Игрок покинул комнату:', roomId);
        
        // Если комната пустая, удаляем её
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log('🗑️ Комната удалена (пустая):', roomId);
        } else {
          // Уведомляем остальных игроков
          io.to(roomId).emit('room-updated', {
            id: room.id,
            name: room.name,
            maxPlayers: room.maxPlayers,
            currentPlayers: room.players.length,
            turnTime: room.timing,
            status: room.status,
            players: room.players
          });
        }
        
        // Уведомляем всех о обновлении списка комнат
        io.emit('rooms-updated');
      }
      
    } catch (error) {
      console.error('❌ Ошибка покидания комнаты:', error);
    }
  });
  
  // Настройка персонажа (профессия и мечта)
  socket.on('player-setup', (data) => {
    try {
      const { roomId, profession, dream } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        return;
      }
      
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.profession = profession;
        player.dream = dream;
        player.isReady = true;
        
        console.log('👤 Игрок настроил персонажа:', roomId, player.name, profession, dream);
        
        // Уведомляем всех в комнате
        io.to(roomId).emit('room-updated', {
          id: room.id,
          name: room.name,
          maxPlayers: room.maxPlayers,
          currentPlayers: room.players.length,
          turnTime: room.timing,
          status: room.status,
          players: room.players
        });
        
        // Проверяем, все ли готовы для начала игры
        const allReady = room.players.length >= 2 && room.players.every(p => p.isReady && p.profession && p.dream);
        if (allReady && room.status === 'waiting') {
          room.status = 'playing';
          console.log('🎮 Игра началась в комнате:', roomId);
          
          io.to(roomId).emit('game-started', {
            id: room.id,
            name: room.name,
            maxPlayers: room.maxPlayers,
            currentPlayers: room.players.length,
            turnTime: room.timing,
            status: room.status,
            players: room.players
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Ошибка настройки персонажа:', error);
    }
  });

  // Готовность игрока
  socket.on('player-ready', (data) => {
    try {
      const { roomId } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        return;
      }
      
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.isReady = !player.isReady;
        
        console.log('👤 Игрок изменил готовность:', roomId, player.name, player.isReady);
        
        // Уведомляем всех в комнате
        io.to(roomId).emit('room-updated', {
          id: room.id,
          name: room.name,
          maxPlayers: room.maxPlayers,
          currentPlayers: room.players.length,
          turnTime: room.timing,
          status: room.status,
          players: room.players
        });
        
        // Проверяем, все ли готовы для начала игры
        const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);
        if (allReady && room.status === 'waiting') {
          room.status = 'playing';
          console.log('🎮 Игра началась в комнате:', roomId);
          
          io.to(roomId).emit('game-started', {
            id: room.id,
            name: room.name,
            maxPlayers: room.maxPlayers,
            currentPlayers: room.players.length,
            turnTime: room.timing,
            status: room.status,
            players: room.players
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Ошибка изменения готовности:', error);
    }
  });
  
  // Отключение
  socket.on('disconnect', () => {
    console.log('🔌 Клиент отключен:', socket.id);
    
    // Удаляем игрока из всех комнат
    for (const [roomId, room] of rooms.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        // Если комната пустая, удаляем её
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log('🗑️ Комната удалена (пустая):', roomId);
        } else {
          // Уведомляем остальных игроков
          io.to(roomId).emit('player-left', {
            playerId: socket.id,
            players: room.players
          });
        }
        
        // Уведомляем всех о обновлении списка комнат
        io.emit('rooms-updated');
        break;
      }
    }
  });
});

// Запуск сервера
server.listen(PORT, HOST, () => {
  console.log(`🚀 Socket Server listening on ${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Process ID: ${process.pid}`);
  console.log(`🔌 Socket.IO enabled for real-time rooms`);
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
