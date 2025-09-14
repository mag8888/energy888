const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://money8888-production.up.railway.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());

// Хранилище токенов и комнат
const tokens = new Map();
const rooms = new Map();

// ===== EXPRESS ENDPOINTS =====

app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Energy888 Simple Server is running',
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
});

app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    tokens: tokens.size,
    rooms: rooms.size
  });
});

// Создание нового токена для авторизации
app.get('/tg/new-token', (req, res) => {
  try {
    const token = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
    
    tokens.set(token, {
      createdAt: Date.now(),
      authorized: false
    });
    
    console.log('🔑 Создан новый токен:', token);
    
    res.json({ 
      ok: true, 
      token,
      expiresIn: 300000
    });
  } catch (error) {
    console.error('❌ Ошибка создания токена:', error);
    res.status(500).json({ ok: false, error: 'Failed to create token' });
  }
});

// Проверка статуса токена
app.get('/tg/poll', (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ ok: false, error: 'Token required' });
    }
    
    const tokenData = tokens.get(token);
    
    if (!tokenData) {
      return res.status(404).json({ ok: false, error: 'Token not found' });
    }
    
    if (Date.now() - tokenData.createdAt > 300000) {
      tokens.delete(token);
      return res.status(410).json({ ok: false, error: 'Token expired' });
    }
    
    res.json({
      ok: true,
      authorized: tokenData.authorized,
      user: tokenData.user || null
    });
  } catch (error) {
    console.error('❌ Ошибка проверки токена:', error);
    res.status(500).json({ ok: false, error: 'Failed to check token' });
  }
});

// Авторизация через Telegram
app.post('/tg/authorize', async (req, res) => {
  try {
    const { token, id, username, first_name, last_name, photo_url } = req.body;
    
    console.log('🔐 Попытка авторизации:', { token, id, username });
    
    if (!token) {
      return res.status(400).json({ ok: false, error: 'Token required' });
    }
    
    const tokenData = tokens.get(token);
    
    if (!tokenData) {
      return res.status(404).json({ ok: false, error: 'Token not found' });
    }
    
    if (Date.now() - tokenData.createdAt > 300000) {
      tokens.delete(token);
      return res.status(410).json({ ok: false, error: 'Token expired' });
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
    
    res.json({ 
      ok: true, 
      authorized: true,
      user: userData
    });
  } catch (error) {
    console.error('❌ Ошибка авторизации:', error);
    res.status(500).json({ ok: false, error: 'Authorization failed' });
  }
});

// ===== SOCKET.IO EVENTS =====

io.on('connection', (socket) => {
  console.log('🔌 Пользователь подключился:', socket.id);
  
  socket.on('getRooms', () => {
    const roomsList = Array.from(rooms.values());
    console.log('📋 Отправляем список комнат:', roomsList.length);
    socket.emit('roomsList', roomsList);
  });
  
  socket.on('createRoom', (roomData) => {
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      
      const newRoom = {
        id: roomId,
        name: roomData.name || `Комната ${roomData.creatorUsername}`,
        creatorId: roomData.creatorId,
        creatorUsername: roomData.creatorUsername,
        creatorProfession: roomData.creatorProfession,
        creatorDream: roomData.creatorDream,
        assignProfessionToAll: roomData.assignProfessionToAll,
        maxPlayers: roomData.maxPlayers,
        password: roomData.password,
        timing: roomData.timing,
        gameDurationSec: roomData.gameDurationSec,
        hasPassword: !!roomData.password,
        players: [{
          id: roomData.creatorId,
          username: roomData.creatorUsername,
          profession: roomData.creatorProfession,
          dream: roomData.creatorDream
        }],
        status: 'waiting',
        createdAt: new Date().toISOString()
      };
      
      rooms.set(roomId, newRoom);
      
      console.log('🏠 Создана комната:', newRoom.name, 'ID:', roomId);
      
      io.emit('roomsList', Array.from(rooms.values()));
      
      socket.emit('roomCreated', { ok: true, roomId });
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      socket.emit('roomCreated', { ok: false, error: 'Failed to create room' });
    }
  });
  
  socket.on('joinRoomMeta', (data) => {
    try {
      const { roomId, user, password } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('joinRoomResult', { ok: false, error: 'Room not found' });
        return;
      }
      
      if (room.hasPassword && room.password !== password) {
        socket.emit('joinRoomResult', { ok: false, error: 'Invalid password' });
        return;
      }
      
      if (room.players.length >= room.maxPlayers) {
        socket.emit('joinRoomResult', { ok: false, error: 'Room is full' });
        return;
      }
      
      room.players.push({
        id: user.id,
        username: user.username,
        profession: room.creatorProfession,
        dream: room.creatorDream
      });
      
      console.log('👤 Игрок присоединился к комнате:', user.username, 'Комната:', room.name);
      
      io.emit('roomsList', Array.from(rooms.values()));
      
      socket.emit('joinRoomResult', { ok: true, room });
    } catch (error) {
      console.error('❌ Ошибка присоединения к комнате:', error);
      socket.emit('joinRoomResult', { ok: false, error: 'Failed to join room' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Пользователь отключился:', socket.id);
  });
});

// ===== ЗАПУСК СЕРВЕРА =====

server.listen(PORT, HOST, () => {
  console.log(`🚀 Simple Server listening on ${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Process ID: ${process.pid}`);
  console.log(`🔌 Socket.IO enabled`);
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

module.exports = { app, server, io };
