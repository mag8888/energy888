import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import DatabaseService from './services/database.js';

dotenv.config();

const app = express();
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || '*';

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
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
  res.header('Access-Control-Allow-Methods', 'GET, POST, 'PUT', 'DELETE', 'OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type', 'Authorization', 'X-Bot-Token');
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

// In-memory cache for active rooms (для быстрого доступа)
const roomsCache = new Map();
const roomIntervals = new Map(); // roomId -> intervalId

// Инициализация базы данных
let dbInitialized = false;

// Функции для работы с комнатами через базу данных
async function getRoom(roomId) {
  try {
    // Сначала проверяем кэш
    if (roomsCache.has(roomId)) {
      return roomsCache.get(roomId);
    }
    
    // Если нет в кэше, загружаем из БД
    const room = await DatabaseService.getRoom(roomId);
    if (room) {
      // Конвертируем players в Map для совместимости
      const roomData = {
        ...room.toObject(),
        players: new Map(room.players.map(p => [p.socketId, p]))
      };
      roomsCache.set(roomId, roomData);
      return roomData;
    }
    return null;
  } catch (error) {
    console.error('❌ Ошибка получения комнаты:', error);
    return null;
  }
}

async function listRooms() {
  try {
    const rooms = await DatabaseService.getAllRooms();
    return rooms.map(room => ({
      id: room.id,
      name: room.name || 'Комната',
      creatorId: room.creatorId,
      creatorUsername: room.creatorUsername,
      maxPlayers: room.maxPlayers || 6,
      playersCount: room.players ? room.players.length : 0,
      hasPassword: !!room.password,
      timing: room.timing || 120
    }));
  } catch (error) {
    console.error('❌ Ошибка получения списка комнат:', error);
    return [];
  }
}

async function createRoom(roomData) {
  try {
    const room = await DatabaseService.createRoom(roomData);
    
    // Добавляем в кэш
    const roomDataForCache = {
      ...room.toObject(),
      players: new Map()
    };
    roomsCache.set(room.id, roomDataForCache);
    
    return room;
  } catch (error) {
    console.error('❌ Ошибка создания комнаты:', error);
    throw error;
  }
}

async function updateRoom(roomId, updateData) {
  try {
    const room = await DatabaseService.updateRoom(roomId, updateData);
    if (room) {
      // Обновляем кэш
      const roomDataForCache = {
        ...room.toObject(),
        players: new Map(room.players.map(p => [p.socketId, p]))
      };
      roomsCache.set(roomId, roomDataForCache);
    }
    return room;
  } catch (error) {
    console.error('❌ Ошибка обновления комнаты:', error);
    throw error;
  }
}

async function deleteRoom(roomId) {
  try {
    await DatabaseService.deleteRoom(roomId);
    roomsCache.delete(roomId);
    console.log(`🗑️ Комната удалена: ${roomId}`);
  } catch (error) {
    console.error('❌ Ошибка удаления комнаты:', error);
  }
}

// ===== EXPRESS ENDPOINTS =====

app.get('/', (_req, res) => res.json({ 
  ok: true, 
  name: 'energy888-socket-server',
  message: 'Energy888 Socket Server with MongoDB is running',
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  timestamp: new Date().toISOString()
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Эндпоинт для мониторинга
app.get('/stats', async (_req, res) => {
  try {
    const stats = await DatabaseService.getStats();
    res.json({
      ok: true,
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    res.status(500).json({ ok: false, error: 'Ошибка получения статистики' });
  }
});

// Эндпоинт для получения топа игроков
app.get('/hall-of-fame', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'points';
    const players = await DatabaseService.getTopPlayers(limit, sortBy);
    res.json({
      ok: true,
      players,
      limit,
      sortBy
    });
  } catch (error) {
    console.error('❌ Ошибка получения зала славы:', error);
    res.status(500).json({ ok: false, error: 'Ошибка получения зала славы' });
  }
});

// Telegram bot deep-link flow
const tgSessions = new Map(); // token -> { createdAt, authorized, user }
app.get('/tg/new-token', (_req, res) => {
  const token = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  tgSessions.set(token, { createdAt: Date.now(), authorized: false, user: null });
  res.json({ ok: true, token });
});

app.post('/tg/bot-auth', (req, res) => {
  const botToken = process.env.BOT_TOKEN;
  const hdr = req.headers['x-bot-token'];
  if (!botToken || hdr !== botToken) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  const { token, id, username, first_name, last_name, photo_url } = req.body || {};
  const sess = tgSessions.get(token);
  if (!sess) return res.status(400).json({ ok: false, error: 'Invalid token' });
  sess.authorized = true;
  sess.user = { id, username, first_name, last_name, photo_url };
  tgSessions.set(token, sess);
  res.json({ ok: true });
});

// Эндпоинт для авторизации через бота
app.post('/tg/authorize', (req, res) => {
  const { token } = req.body || {};
  const sess = tgSessions.get(token);
  if (!sess) return res.status(400).json({ ok: false, error: 'Invalid token' });
  if (!sess.authorized) return res.status(400).json({ ok: false, error: 'Not authorized' });
  res.json({ ok: true, user: sess.user });
});

// ===== SOCKET.IO HANDLERS =====

io.on('connection', async (socket) => {
  // Инициализация базы данных при первом подключении
  if (!dbInitialized) {
    try {
      await DatabaseService.connect();
      dbInitialized = true;
      console.log('✅ База данных инициализирована');
    } catch (error) {
      console.error('❌ Ошибка инициализации БД:', error);
    }
  }

  // Rooms listing
  socket.on('getRooms', async () => {
    try {
      const rooms = await listRooms();
      socket.emit('roomsList', rooms);
    } catch (error) {
      console.error('❌ Ошибка получения списка комнат:', error);
      socket.emit('error', 'Ошибка получения списка комнат');
    }
  });

  // Get rooms (simple version)
  socket.on('get-rooms', async () => {
    try {
      console.log('📋 Запрос списка комнат');
      const rooms = await listRooms();
      const roomsList = rooms.map(room => {
        console.log('📋 Комната в списке:', room.id, room.name, 'игроков:', room.playersCount);
        return {
          id: room.id,
          name: room.name || 'Комната',
          maxPlayers: room.maxPlayers || 4,
          players: room.playersCount || 0,
          status: 'waiting', // Пока всегда waiting, можно добавить логику для started
          timing: room.timing || 120
        };
      });
      console.log('📋 Отправляем список комнат:', roomsList.length);
      socket.emit('rooms-list', roomsList);
    } catch (error) {
      console.error('❌ Ошибка получения списка комнат:', error);
      socket.emit('error', 'Ошибка получения списка комнат');
    }
  });

  // Create room (simple version)
  socket.on('create-room', async (payload = {}) => {
    try {
      console.log('🏠 Создание комнаты:', payload);
      const id = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      const roomData = {
        id,
        name: payload.name || 'Комната',
        creatorId: socket.id,
        creatorUsername: payload.playerName || 'Игрок',
        maxPlayers: Number(payload.maxPlayers || 4),
        timing: Number(payload.timing || 120),
        createdAt: new Date(),
        players: [],
        started: false
      };
      
      const room = await createRoom(roomData);
      
      const roomResponse = {
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        players: 0,
        timing: room.timing,
        status: 'waiting'
      };
      
      console.log('✅ Комната создана и сохранена в БД:', id);
      
      socket.emit('room-created', roomResponse);
      io.emit('rooms-updated');
      
      // Принудительно обновляем список комнат
      setTimeout(async () => {
        try {
          const rooms = await listRooms();
          const roomsList = rooms.map(room => ({
            id: room.id,
            name: room.name,
            maxPlayers: room.maxPlayers,
            players: room.playersCount || 0,
            status: 'waiting',
            timing: room.timing || 120
          }));
          console.log('🔄 Принудительно обновляем список комнат:', roomsList.length);
          io.emit('rooms-list', roomsList);
        } catch (error) {
          console.error('❌ Ошибка обновления списка комнат:', error);
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      socket.emit('error', 'Ошибка создания комнаты');
    }
  });

  // Join room (simple version)
  socket.on('join-room', async ({ roomId, playerName, playerEmail }) => {
    try {
      console.log('🚪 Присоединение к комнате:', { roomId, playerName, playerEmail });
      
      const room = await getRoom(roomId);
      if (!room) { 
        socket.emit('error', 'Комната не найдена'); 
        return; 
      }
      
      if (room.players.size >= (room.maxPlayers || 6)) { 
        socket.emit('error', 'Комната заполнена'); 
        return; 
      }

      socket.join(roomId);
      const player = {
        id: socket.id,
        name: playerName || 'Игрок',
        email: playerEmail || 'player@example.com',
        socketId: socket.id,
        isReady: false,
        profession: null,
        dream: null
      };
      
      // Добавляем игрока в БД
      await DatabaseService.addPlayerToRoom(roomId, player);
      
      // Обновляем кэш
      room.players.set(socket.id, player);
      roomsCache.set(roomId, room);
      
      console.log('✅ Игрок присоединился к комнате:', player);
      
      // Отправляем данные комнаты
      const roomData = {
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        players: room.players.size,
        timing: room.timing || 120,
        status: room.started ? 'playing' : 'waiting',
        playersList: Array.from(room.players.values())
      };
      
      socket.emit('room-joined', roomData);
      io.to(roomId).emit('room-updated', roomData);
      io.emit('rooms-updated');
      
    } catch (error) {
      console.error('❌ Ошибка присоединения к комнате:', error);
      socket.emit('error', 'Ошибка присоединения к комнате');
    }
  });

  // Обработка отключения игрока
  socket.on('disconnect', async () => {
    console.log('🔌 Игрок отключился:', socket.id);
    
    try {
      // Находим комнаты, где был этот игрок
      for (const [roomId, room] of roomsCache.entries()) {
        if (room.players.has(socket.id)) {
          // Удаляем игрока из БД
          await DatabaseService.removePlayerFromRoom(roomId, socket.id);
          
          // Удаляем из кэша
          room.players.delete(socket.id);
          roomsCache.set(roomId, room);
          
          console.log(`👋 Игрок покинул комнату ${roomId}`);
          
          // Если в комнате не осталось игроков, планируем удаление через 1 час
          if (room.players.size === 0) {
            console.log(`🏠 Комната ${roomId} пуста, планируем удаление через 1 час`);
            setTimeout(async () => {
              try {
                const currentRoom = await getRoom(roomId);
                if (currentRoom && currentRoom.players.size === 0 && !currentRoom.started) {
                  console.log(`🗑️ Удаляем пустую комнату после отключения всех игроков: ${roomId}`);
                  await deleteRoom(roomId);
                  io.emit('rooms-updated');
                }
              } catch (error) {
                console.error('❌ Ошибка при удалении пустой комнаты:', error);
              }
            }, 60 * 60 * 1000); // 1 час
          }
          
          // Обновляем данные комнаты
          const roomData = {
            id: room.id,
            name: room.name,
            maxPlayers: room.maxPlayers,
            players: room.players.size,
            timing: room.timing || 120,
            status: room.started ? 'playing' : 'waiting',
            playersList: Array.from(room.players.values())
          };
          
          io.to(roomId).emit('room-updated', roomData);
          io.emit('rooms-updated');
          break;
        }
      }
    } catch (error) {
      console.error('❌ Ошибка при отключении игрока:', error);
    }
  });

  // Обработчик rooms-updated
  socket.on('rooms-updated', async () => {
    try {
      console.log('🔄 Обновление списка комнат запрошено');
      const rooms = await listRooms();
      const roomsList = rooms.map(room => ({
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        players: room.playersCount || 0,
        status: 'waiting',
        timing: room.timing || 120
      }));
      console.log('🔄 Отправляем обновленный список комнат:', roomsList.length);
      socket.emit('rooms-list', roomsList);
    } catch (error) {
      console.error('❌ Ошибка обновления списка комнат:', error);
      socket.emit('error', 'Ошибка обновления списка комнат');
    }
  });
});

// ===== SERVER STARTUP =====

const PORT = process.env.PORT || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

server.listen(PORT, HOST, async () => {
  console.log(`Socket server listening on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Front origin: ${FRONT_ORIGIN}`);
  
  // Инициализация базы данных и восстановление комнат
  try {
    await DatabaseService.connect();
    console.log('✅ База данных подключена');
    
    // Восстанавливаем активные комнаты
    const rooms = await DatabaseService.restoreRooms();
    console.log(`🔄 Восстановлено ${rooms.length} активных комнат`);
    
    // Добавляем комнаты в кэш
    for (const room of rooms) {
      const roomData = {
        ...room.toObject(),
        players: new Map(room.players.map(p => [p.socketId, p]))
      };
      roomsCache.set(room.id, roomData);
    }
    
    console.log('✅ Сервер полностью инициализирован');
  } catch (error) {
    console.error('❌ Ошибка инициализации сервера:', error);
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
