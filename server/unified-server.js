const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { Telegraf } = require('telegraf');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://money8888-production.up.railway.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// Telegram Bot
const BOT_TOKEN = process.env.BOT_TOKEN || '8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI';
const bot = new Telegraf(BOT_TOKEN);

// Middleware
app.use(cors({
  origin: ["https://money8888-production.up.railway.app"],
  credentials: true
}));
app.use(express.json());

// Хранилище токенов и комнат
const tokens = new Map(); // token -> { userId, username, createdAt }
const rooms = new Map(); // roomId -> room data

// ===== EXPRESS ENDPOINTS =====

app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Energy888 Unified Server is running',
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
    
    // Сохраняем токен (без привязки к пользователю пока)
    tokens.set(token, {
      createdAt: Date.now(),
      authorized: false
    });
    
    console.log('🔑 Создан новый токен:', token);
    
    res.json({ 
      ok: true, 
      token,
      expiresIn: 300000 // 5 минут
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
    
    // Проверяем, не истек ли токен (5 минут)
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
    
    // Проверяем, не истек ли токен
    if (Date.now() - tokenData.createdAt > 300000) {
      tokens.delete(token);
      return res.status(410).json({ ok: false, error: 'Token expired' });
    }
    
    // Сохраняем данные пользователя
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
  
  // Получение списка комнат
  socket.on('getRooms', () => {
    const roomsList = Array.from(rooms.values());
    console.log('📋 Отправляем список комнат:', roomsList.length);
    socket.emit('roomsList', roomsList);
  });
  
  // Создание комнаты
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
      
      // Уведомляем всех о новой комнате
      io.emit('roomsList', Array.from(rooms.values()));
      
      socket.emit('roomCreated', { ok: true, roomId });
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      socket.emit('roomCreated', { ok: false, error: 'Failed to create room' });
    }
  });
  
  // Присоединение к комнате
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
      
      // Добавляем игрока в комнату
      room.players.push({
        id: user.id,
        username: user.username,
        profession: room.creatorProfession, // Пока используем профессию создателя
        dream: room.creatorDream
      });
      
      console.log('👤 Игрок присоединился к комнате:', user.username, 'Комната:', room.name);
      
      // Уведомляем всех об обновлении
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

// ===== TELEGRAM BOT =====

bot.start((ctx) => {
  const message = ctx.message.text;
  const token = message.split(' ')[1]; // Получаем токен из команды /start login_token
  
  if (token && token.startsWith('login_')) {
    // Обработка авторизации
    const loginToken = token.replace('login_', '');
    handleLogin(ctx, loginToken);
  } else {
    ctx.reply('🎮 Добро пожаловать в игру "Энергия Денег"!\n\nИспользуйте /help для списка команд.');
  }
});

// Функция обработки авторизации
async function handleLogin(ctx, token) {
  try {
    const user = ctx.from;
    
    console.log('🔐 Попытка авторизации через бота:', { token, userId: user.id, username: user.username });
    
    // Отправляем данные пользователя на наш сервер
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? 'https://money8888-production.up.railway.app'
      : `http://localhost:${PORT}`;
    
    const response = await fetch(`${serverUrl}/tg/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_url: user.photo_url
      })
    });
    
    const result = await response.json();
    
    if (result.ok && result.authorized) {
      await ctx.reply('✅ Вы успешно авторизовались!\n\n🎮 Теперь вы можете играть в Energy of Money!\n\nПерейдите обратно в браузер для продолжения игры.');
    } else {
      await ctx.reply('❌ Ошибка входа. Возможно, ссылка устарела. Попробуйте снова.');
    }
  } catch (error) {
    console.error('❌ Ошибка авторизации через бота:', error);
    await ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
  }
}

bot.command('help', (ctx) => {
  ctx.reply(`
🎮 Команды бота:

/start - Начать работу с ботом
/help - Показать эту справку

🌐 Игра: https://money8888-production.up.railway.app
  `);
});

// Обработка ошибок бота
bot.catch((err, ctx) => {
  console.error('❌ Ошибка бота:', err);
  ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
});

// ===== ЗАПУСК СЕРВЕРА =====

// Запуск Express + Socket.IO сервера
server.listen(PORT, HOST, () => {
  console.log(`🚀 Unified Server listening on ${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Process ID: ${process.pid}`);
  console.log(`🔌 Socket.IO enabled`);
});

// Запуск Telegram бота
bot.launch()
  .then(() => {
    console.log('🤖 Telegram Bot started successfully!');
    console.log(`📱 Bot token: ${BOT_TOKEN.substring(0, 10)}...`);
  })
  .catch((err) => {
    console.error('❌ Bot failed to start:', err);
  });

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  bot.stop('SIGINT');
  server.close(() => {
    process.exit(0);
  });
});

process.once('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  bot.stop('SIGTERM');
  server.close(() => {
    process.exit(0);
  });
});

module.exports = { app, server, io, bot };
