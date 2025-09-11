const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');
const cors = require('cors');

// Конфигурация для Railway
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/energy888';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production';

console.log('🚀 Запуск сервера:', {
  environment: process.env.NODE_ENV || 'development',
  railway: isRailway,
  port: PORT,
  host: HOST
});

// Создание Express приложения
const app = express();
const server = http.createServer(app);

// CORS конфигурация
const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));

// Socket.IO с CORS
const io = new Server(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

// Минимальная MongoDB конфигурация
let db;
const client = new MongoClient(MONGODB_URI, {
  maxPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
});

async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db('energy888');
    console.log('✅ MongoDB подключена', { railway: isRailway, maxPoolSize: 5 });
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error);
  }
}

// Подключение к MongoDB
connectToMongoDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT,
    host: HOST,
    railway: isRailway,
    mongoConnected: !!db
  });
});

// Основной endpoint
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Energy Money Socket.IO Server',
    timestamp: new Date().toISOString(),
    port: PORT,
    host: HOST,
    endpoints: {
      health: '/health',
      main: '/'
    }
  });
});

// Базовая игровая логика
const rooms = new Map();

// Простая Socket.IO логика
io.on('connection', (socket) => {
  console.log('🔌 Клиент подключен:', socket.id);
  
  // Получение списка комнат
  socket.on('get-rooms', () => {
    const roomsList = Array.from(rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      maxPlayers: room.maxPlayers,
      currentPlayers: room.players.length,
      started: room.started,
      creator: room.creator,
      createdAt: room.createdAt,
      professionSelectionMode: room.professionSelectionMode || 'choice',
      timing: room.timing || 120
    }));
    
    socket.emit('rooms-list', roomsList);
    console.log('📋 Отправлен список комнат:', roomsList.length);
  });

  // Создание комнаты
  socket.on('create-room', (data) => {
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const room = {
        id: roomId,
        name: data.name,
        maxPlayers: data.maxPlayers || 4,
        players: [],
        started: false,
        creator: data.creatorUsername || 'Игрок',
        createdAt: new Date().toISOString(),
        professionSelectionMode: data.professionSelectionMode || 'choice',
        timing: data.timing || 120
      };
      
      rooms.set(roomId, room);
      socket.emit('room-created', room);
      console.log('🏠 Комната создана:', room.name, roomId);
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      socket.emit('error', { message: 'Ошибка создания комнаты' });
    }
  });

  // Присоединение к комнате
  socket.on('join-room', (data) => {
    try {
      const room = rooms.get(data.roomId);
      if (!room) {
        socket.emit('join-room-error', { error: 'Комната не найдена' });
        return;
      }

      if (room.started) {
        socket.emit('join-room-error', { error: 'Игра уже началась' });
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        socket.emit('join-room-error', { error: 'Комната заполнена' });
        return;
      }

      // Проверяем, не присоединен ли уже игрок
      const existingPlayer = room.players.find(p => p.email === data.playerEmail || p.name === data.playerName);
      if (existingPlayer) {
        // Обновляем socketId существующего игрока
        existingPlayer.socketId = socket.id;
        socket.emit('room-joined', room);
        console.log('🔄 Игрок обновлен:', data.playerName);
        return;
      }

      // Создаем нового игрока
      const player = {
        id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.playerName || 'Игрок',
        email: data.playerEmail || 'player@example.com',
        socketId: socket.id,
        isReady: false,
        profession: data.profession || '',
        dream: data.dream || '',
        selectedProfession: data.profession || '',
        professionConfirmed: false,
        joinedAt: new Date().toISOString(),
        money: 1000,
        position: 0,
        cards: [],
        isActive: true
      };

      room.players.push(player);
      socket.emit('room-joined', room);
      
      // Уведомляем всех игроков в комнате
      room.players.forEach(p => {
        if (p.socketId !== socket.id) {
          io.to(p.socketId).emit('player-joined', { player, players: room.players });
        }
      });

      console.log('👤 Игрок присоединился:', data.playerName, 'в комнату', room.name);
    } catch (error) {
      console.error('❌ Ошибка присоединения к комнате:', error);
      socket.emit('join-room-error', { error: 'Ошибка присоединения к комнате' });
    }
  });

  // Настройка игрока
  socket.on('player-setup', (data) => {
    try {
      const room = rooms.get(data.roomId);
      if (!room) {
        socket.emit('setup-error', { error: 'Комната не найдена' });
        return;
      }

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) {
        socket.emit('setup-error', { error: 'Игрок не найден' });
        return;
      }

      player.profession = data.profession || player.profession;
      player.dream = data.dream || player.dream;
      player.selectedProfession = data.profession || player.selectedProfession;
      player.professionConfirmed = true;

      // Уведомляем всех игроков в комнате
      room.players.forEach(p => {
        io.to(p.socketId).emit('player-updated', { player, players: room.players });
      });

      console.log('⚙️ Игрок настроен:', player.name, 'профессия:', player.profession);
    } catch (error) {
      console.error('❌ Ошибка настройки игрока:', error);
      socket.emit('setup-error', { error: 'Ошибка настройки игрока' });
    }
  });

  // Готовность игрока
  socket.on('player-ready', (data) => {
    try {
      const room = rooms.get(data.roomId);
      if (!room) {
        socket.emit('error', { message: 'Комната не найдена' });
        return;
      }

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) {
        socket.emit('error', { message: 'Игрок не найден' });
        return;
      }

      player.isReady = !player.isReady;

      // Уведомляем всех игроков в комнате
      room.players.forEach(p => {
        io.to(p.socketId).emit('player-ready-updated', { player, players: room.players });
      });

      console.log('✅ Готовность игрока обновлена:', player.name, player.isReady);

      // Проверяем, можно ли начать игру
      if (room.players.length >= 2 && room.players.every(p => p.isReady)) {
        room.started = true;
        room.players.forEach(p => {
          io.to(p.socketId).emit('game-started', { room });
        });
        console.log('🎮 Игра началась в комнате:', room.name);
      }
    } catch (error) {
      console.error('❌ Ошибка обновления готовности:', error);
      socket.emit('error', { message: 'Ошибка обновления готовности' });
    }
  });

  // Покидание комнаты
  socket.on('leave-room', (data) => {
    try {
      const room = rooms.get(data.roomId);
      if (!room) return;

      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex === -1) return;

      const player = room.players[playerIndex];
      room.players.splice(playerIndex, 1);

      // Уведомляем остальных игроков
      room.players.forEach(p => {
        io.to(p.socketId).emit('player-left', { player, players: room.players });
      });

      // Удаляем комнату, если она пустая
      if (room.players.length === 0) {
        rooms.delete(data.roomId);
        console.log('🗑️ Комната удалена:', room.name);
      }

      console.log('👋 Игрок покинул комнату:', player.name);
    } catch (error) {
      console.error('❌ Ошибка покидания комнаты:', error);
    }
  });

  // Получение информации о комнате
  socket.on('get-room-info', (data) => {
    try {
      const room = rooms.get(data.roomId);
      if (!room) {
        socket.emit('room-info-error', { error: 'Комната не найдена' });
        return;
      }

      socket.emit('room-info', room);
      console.log('📋 Информация о комнате отправлена:', room.name);
    } catch (error) {
      console.error('❌ Ошибка получения информации о комнате:', error);
      socket.emit('room-info-error', { error: 'Ошибка получения информации о комнате' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Клиент отключен:', socket.id);
    
    // Удаляем игрока из всех комнат
    rooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        // Уведомляем остальных игроков
        room.players.forEach(p => {
          io.to(p.socketId).emit('player-left', { player, players: room.players });
        });
        
        // Удаляем комнату, если она пустая
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log('🗑️ Комната удалена:', room.name);
        }
        
        console.log('👋 Игрок отключился:', player.name);
      }
    });
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM, завершение работы...');
  server.close(() => {
    console.log('✅ HTTP сервер закрыт');
    client.close().then(() => {
      console.log('✅ MongoDB соединение закрыто');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Получен SIGINT, завершение работы...');
  server.close(() => {
    console.log('✅ HTTP сервер закрыт');
    client.close().then(() => {
      console.log('✅ MongoDB соединение закрыто');
      process.exit(0);
    });
  });
});

// Запуск сервера
server.listen(PORT, HOST, () => {
  console.log(`🚀 Socket.IO сервер запущен на ${HOST}:${PORT}`);
});
