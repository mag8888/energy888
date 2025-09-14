import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomController, PROFESSIONS, ROOM_CONFIGS } from '../modules/rooms/index.js';
import DatabaseService from '../modules/rooms/services/DatabaseService.js';

dotenv.config();

const app = express();
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || '*';

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://money8888-production.up.railway.app',
      'https://money8888-production.up.railway.app',
      'https://money8888-production.up.railway.app',
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
      'https://money8888-production.up.railway.app',
      'https://money8888-production.up.railway.app',
      'https://money8888-production.up.railway.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  } 
});

// Инициализация контроллера комнат
const roomController = new RoomController();
let dbInitialized = false;

// ===== REST API ENDPOINTS =====

app.get('/', (_req, res) => res.json({ 
  ok: true, 
  name: 'energy888-rooms-server',
  message: 'Energy of Money Rooms Server with MongoDB',
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  timestamp: new Date().toISOString(),
  features: ['rooms', 'professions', 'mongodb', 'socket.io']
}));

app.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbInitialized ? 'connected' : 'disconnected'
  });
});

app.get('/stats', async (_req, res) => {
  try {
    const stats = await roomController.getServerStats();
    res.json({
      ok: true,
      ...stats
    });
  } catch (error) {
    console.error('❌ Ошибка получения статистики:', error);
    res.status(500).json({ ok: false, error: 'Ошибка получения статистики' });
  }
});

app.get('/professions', (_req, res) => {
  res.json({
    ok: true,
    professions: PROFESSIONS,
    configs: ROOM_CONFIGS
  });
});

app.get('/rooms', async (_req, res) => {
  try {
    const rooms = await roomController.getAllRooms();
    const roomsData = roomController.getRoomsListData(rooms);
    res.json({
      ok: true,
      rooms: roomsData,
      total: roomsData.length
    });
  } catch (error) {
    console.error('❌ Ошибка получения списка комнат:', error);
    res.status(500).json({ ok: false, error: 'Ошибка получения списка комнат' });
  }
});

// ===== SOCKET.IO HANDLERS =====

io.on('connection', async (socket) => {
  console.log('🔌 Новое подключение:', socket.id);

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

  // Получить список комнат
  socket.on('get-rooms', async () => {
    try {
      console.log('📋 Запрос списка комнат от:', socket.id);
      const rooms = await roomController.getAllRooms();
      const roomsData = roomController.getRoomsListData(rooms);
      socket.emit('rooms-list', roomsData);
      console.log('📋 Отправлено комнат:', roomsData.length);
    } catch (error) {
      console.error('❌ Ошибка получения списка комнат:', error);
      socket.emit('error', { message: 'Ошибка получения списка комнат' });
    }
  });

  // Создать комнату
  socket.on('create-room', async (data) => {
    try {
      console.log('🏠 Создание комнаты от:', socket.id, data);
      
      const result = await roomController.createRoom(data);
      if (result.success && result.room) {
        const roomData = roomController.getRoomClientData(result.room);
        socket.emit('room-created', roomData);
        io.emit('rooms-updated');
        console.log('✅ Комната создана:', result.room.id);
      } else {
        socket.emit('error', { message: result.error || 'Ошибка создания комнаты' });
      }
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      socket.emit('error', { message: 'Ошибка создания комнаты' });
    }
  });

  // Присоединиться к комнате
  socket.on('join-room', async (data) => {
    try {
      console.log('🚪 Присоединение к комнате от:', socket.id, data);
      
      const result = await roomController.joinRoom(data, socket.id);
      if (result.success && result.room) {
        socket.join(result.room.id);
        const roomData = roomController.getRoomClientData(result.room);
        socket.emit('room-joined', roomData);
        io.to(result.room.id).emit('room-updated', roomData);
        io.emit('rooms-updated');
        console.log('✅ Игрок присоединился к комнате:', data.roomId);
      } else {
        socket.emit('error', { message: result.error || 'Ошибка присоединения к комнате' });
      }
    } catch (error) {
      console.error('❌ Ошибка присоединения к комнате:', error);
      socket.emit('error', { message: 'Ошибка присоединения к комнате' });
    }
  });

  // Выбрать профессию
  socket.on('select-profession', async (data) => {
    try {
      console.log('🎭 Выбор профессии от:', socket.id, data);
      
      const result = await roomController.selectProfession(data);
      if (result.success) {
        const room = await roomController.getRoom(data.roomId);
        if (room) {
          const roomData = roomController.getRoomClientData(room);
          socket.emit('profession-selected', {
            roomId: data.roomId,
            playerId: data.playerId,
            profession: data.profession,
            success: true
          });
          io.to(data.roomId).emit('profession-selection-updated', {
            roomId: data.roomId,
            players: Array.from(room.players.values()),
            availableProfessions: room.availableProfessions.filter(prof => 
              !Array.from(room.players.values()).some(p => p.profession === prof)
            ),
            allProfessionsSelected: Array.from(room.players.values()).every(p => p.profession)
          });
        }
      } else {
        socket.emit('error', { message: result.error || 'Ошибка выбора профессии' });
      }
    } catch (error) {
      console.error('❌ Ошибка выбора профессии:', error);
      socket.emit('error', { message: 'Ошибка выбора профессии' });
    }
  });

  // Подтвердить выбор профессии
  socket.on('confirm-profession', async (data) => {
    try {
      console.log('✅ Подтверждение профессии от:', socket.id, data);
      
      const result = await roomController.confirmProfession(data);
      if (result.success) {
        const room = await roomController.getRoom(data.roomId);
        if (room) {
          socket.emit('profession-confirmed', {
            roomId: data.roomId,
            playerId: data.playerId,
            profession: data.profession,
            confirmed: data.confirmed
          });
          io.to(data.roomId).emit('room-updated', roomController.getRoomClientData(room));
        }
      } else {
        socket.emit('error', { message: result.error || 'Ошибка подтверждения профессии' });
      }
    } catch (error) {
      console.error('❌ Ошибка подтверждения профессии:', error);
      socket.emit('error', { message: 'Ошибка подтверждения профессии' });
    }
  });

  // Получить доступные профессии
  socket.on('get-available-professions', async (data) => {
    try {
      console.log('🎯 Запрос доступных профессий от:', socket.id, data);
      
      const result = await roomController.getAvailableProfessions(data.roomId);
      if (result.success) {
        socket.emit('available-professions', {
          roomId: data.roomId,
          professions: result.professions,
          selectionMode: 'choice',
          selectedProfessions: result.selectedProfessions
        });
      } else {
        socket.emit('error', { message: result.error || 'Ошибка получения профессий' });
      }
    } catch (error) {
      console.error('❌ Ошибка получения профессий:', error);
      socket.emit('error', { message: 'Ошибка получения профессий' });
    }
  });

  // Обновить список комнат
  socket.on('rooms-updated', async () => {
    try {
      console.log('🔄 Обновление списка комнат от:', socket.id);
      const rooms = await roomController.getAllRooms();
      const roomsData = roomController.getRoomsListData(rooms);
      socket.emit('rooms-list', roomsData);
    } catch (error) {
      console.error('❌ Ошибка обновления списка комнат:', error);
      socket.emit('error', { message: 'Ошибка обновления списка комнат' });
    }
  });

  // Обработка отключения
  socket.on('disconnect', async () => {
    console.log('🔌 Отключение:', socket.id);
    
    try {
      // Находим комнаты, где был этот игрок
      const rooms = await roomController.getAllRooms();
      for (const room of rooms) {
        const player = room.players.get(socket.id);
        if (player) {
          const result = await roomController.leaveRoom(room.id, socket.id);
          if (result.success && result.room) {
            io.to(room.id).emit('room-updated', roomController.getRoomClientData(result.room));
            io.emit('rooms-updated');
            console.log('👋 Игрок покинул комнату:', room.id);
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

server.listen(PORT, HOST, async () => {
  console.log(`🚀 Rooms Server запущен на ${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Front origin: ${FRONT_ORIGIN}`);
  
  // Инициализация базы данных
  try {
    await DatabaseService.connect();
    console.log('✅ База данных подключена');
    
    // Восстановление комнат
    const rooms = await roomController.getAllRooms();
    console.log(`🔄 Восстановлено ${rooms.length} активных комнат`);
    
    console.log('✅ Сервер полностью инициализирован');
  } catch (error) {
    console.error('❌ Ошибка инициализации сервера:', error);
  }
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Получен SIGTERM, завершение работы...');
  await DatabaseService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Получен SIGINT, завершение работы...');
  await DatabaseService.disconnect();
  process.exit(0);
});
