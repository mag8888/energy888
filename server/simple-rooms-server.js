import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || '*';

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://energy-of-money-1game.onrender.com',
      'https://energy888-1.onrender.com',
      'https://energy888-unified-server.onrender.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (FRONT_ORIGIN === '*' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Bot-Token']
};

app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Bot-Token');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://energy-of-money-1game.onrender.com',
      'https://energy888-1.onrender.com',
      'https://energy888-unified-server.onrender.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  } 
});

// Простое хранилище комнат в памяти
const rooms = new Map();

// ===== REST API ENDPOINTS =====

app.get('/', (_req, res) => res.json({ 
  ok: true, 
  name: 'energy888-simple-rooms-server',
  message: 'Energy of Money Simple Rooms Server',
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  timestamp: new Date().toISOString(),
  features: ['rooms', 'socket.io', 'simple']
}));

app.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'in-memory'
  });
});

app.get('/stats', (_req, res) => {
  res.json({
    ok: true,
    totalRooms: rooms.size,
    totalPlayers: Array.from(rooms.values()).reduce((sum, room) => sum + room.players.size, 0),
    isConnected: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/rooms', (_req, res) => {
  const roomsList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    maxPlayers: room.maxPlayers,
    players: room.players.size,
    status: room.started ? 'playing' : 'waiting',
    timing: room.timing,
    hasPassword: !!room.password
  }));
  
  res.json({
    ok: true,
    rooms: roomsList,
    total: roomsList.length
  });
});

// ===== SOCKET.IO HANDLERS =====

io.on('connection', (socket) => {
  console.log('🔌 Новое подключение:', socket.id);

  // Получить список комнат
  socket.on('get-rooms', () => {
    try {
      console.log('📋 Запрос списка комнат от:', socket.id);
      const roomsList = Array.from(rooms.values()).map(room => ({
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        players: room.players.size,
        status: room.started ? 'playing' : 'waiting',
        timing: room.timing,
        hasPassword: !!room.password
      }));
      
      socket.emit('rooms-list', roomsList);
      console.log('📋 Отправлено комнат:', roomsList.length);
    } catch (error) {
      console.error('❌ Ошибка получения списка комнат:', error);
      socket.emit('error', { message: 'Ошибка получения списка комнат' });
    }
  });

  // Создать комнату
  socket.on('create-room', (data) => {
    try {
      console.log('🏠 Создание комнаты от:', socket.id, data);
      
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      // Создаем игрока-создателя
      const creator = {
        id: playerId,
        name: data.playerName || 'Игрок',
        email: data.playerEmail || 'player@example.com',
        socketId: socket.id,
        isReady: false,
        profession: null,
        dream: null,
        selectedProfession: null,
        professionConfirmed: false,
        joinedAt: new Date(),
        money: 0,
        position: 0,
        cards: [],
        isActive: true
      };
      
      // Создаем комнату
      const room = {
        id: roomId,
        name: data.name || `Комната ${rooms.size + 1}`,
        creatorId: playerId,
        creatorUsername: data.playerName || 'Игрок',
        creatorProfession: null,
        creatorDream: null,
        assignProfessionToAll: false,
        availableProfessions: ['entrepreneur', 'doctor', 'teacher', 'engineer'],
        professionSelectionMode: 'random',
        maxPlayers: data.maxPlayers || 4,
        password: data.password || null,
        timing: data.timing || 120,
        createdAt: new Date(),
        gameDurationSec: 10800,
        gameEndAt: null,
        deleteAfterAt: null,
        players: new Map([[socket.id, creator]]),
        started: false,
        order: [],
        currentIndex: 0,
        turnEndAt: null,
        lastActivity: new Date(),
        isActive: true
      };
      
      rooms.set(roomId, room);
      
      const roomData = {
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        players: room.players.size,
        status: room.started ? 'playing' : 'waiting',
        timing: room.timing,
        professionSelectionMode: room.professionSelectionMode,
        availableProfessions: room.availableProfessions,
        playersList: Array.from(room.players.values())
      };
      
      socket.emit('room-created', roomData);
      io.emit('rooms-updated');
      console.log('✅ Комната создана:', roomId);
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      socket.emit('error', { message: 'Ошибка создания комнаты' });
    }
  });

  // Присоединиться к комнате
  socket.on('join-room', (data) => {
    try {
      console.log('🚪 Присоединение к комнате от:', socket.id, data);
      
      const room = rooms.get(data.roomId);
      if (!room) {
        socket.emit('error', { message: 'Комната не найдена' });
        return;
      }
      
      if (room.players.size >= room.maxPlayers) {
        socket.emit('error', { message: 'Комната заполнена' });
        return;
      }
      
      if (room.started) {
        socket.emit('error', { message: 'Игра уже началась' });
        return;
      }
      
      if (room.password && room.password !== data.password) {
        socket.emit('error', { message: 'Неверный пароль' });
        return;
      }
      
      // Создаем игрока
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const player = {
        id: playerId,
        name: data.playerName || 'Игрок',
        email: data.playerEmail || 'player@example.com',
        socketId: socket.id,
        isReady: false,
        profession: null,
        dream: null,
        selectedProfession: null,
        professionConfirmed: false,
        joinedAt: new Date(),
        money: 0,
        position: 0,
        cards: [],
        isActive: true
      };
      
      room.players.set(socket.id, player);
      room.lastActivity = new Date();
      
      socket.join(room.id);
      
      const roomData = {
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        players: room.players.size,
        status: room.started ? 'playing' : 'waiting',
        timing: room.timing,
        professionSelectionMode: room.professionSelectionMode,
        availableProfessions: room.availableProfessions,
        playersList: Array.from(room.players.values())
      };
      
      socket.emit('room-joined', roomData);
      io.to(room.id).emit('room-updated', roomData);
      io.emit('rooms-updated');
      console.log('✅ Игрок присоединился к комнате:', data.roomId);
    } catch (error) {
      console.error('❌ Ошибка присоединения к комнате:', error);
      socket.emit('error', { message: 'Ошибка присоединения к комнате' });
    }
  });

  // Обновить список комнат
  socket.on('rooms-updated', () => {
    try {
      console.log('🔄 Обновление списка комнат от:', socket.id);
      const roomsList = Array.from(rooms.values()).map(room => ({
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        players: room.players.size,
        status: room.started ? 'playing' : 'waiting',
        timing: room.timing,
        hasPassword: !!room.password
      }));
      
      socket.emit('rooms-list', roomsList);
    } catch (error) {
      console.error('❌ Ошибка обновления списка комнат:', error);
      socket.emit('error', { message: 'Ошибка обновления списка комнат' });
    }
  });

  // Обработка отключения
  socket.on('disconnect', () => {
    console.log('🔌 Отключение:', socket.id);
    
    try {
      // Находим комнаты, где был этот игрок
      for (const [roomId, room] of rooms.entries()) {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);
          room.lastActivity = new Date();
          
          const roomData = {
            id: room.id,
            name: room.name,
            maxPlayers: room.maxPlayers,
            players: room.players.size,
            status: room.started ? 'playing' : 'waiting',
            timing: room.timing,
            professionSelectionMode: room.professionSelectionMode,
            availableProfessions: room.availableProfessions,
            playersList: Array.from(room.players.values())
          };
          
          io.to(roomId).emit('room-updated', roomData);
          io.emit('rooms-updated');
          console.log('👋 Игрок покинул комнату:', roomId);
          
          // Удаляем пустые комнаты через 5 минут
          if (room.players.size === 0) {
            setTimeout(() => {
              if (rooms.has(roomId) && rooms.get(roomId).players.size === 0) {
                rooms.delete(roomId);
                console.log('🗑️ Пустая комната удалена:', roomId);
                io.emit('rooms-updated');
              }
            }, 5 * 60 * 1000);
          }
          break;
        }
      }
    } catch (error) {
      console.error('❌ Ошибка при отключении игрока:', error);
    }
  });
});

// ===== СЕРВЕР STARTUP =====

const PORT = process.env.PORT || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Simple Rooms Server запущен на ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Front origin: ${FRONT_ORIGIN}`);
  console.log('✅ Сервер полностью инициализирован');
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM, завершение работы...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Получен SIGINT, завершение работы...');
  process.exit(0);
});
