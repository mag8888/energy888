const http = require('http');
const url = require('url');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/energy888';

// Подключение к MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB подключена');
}).catch(err => {
  console.error('❌ Ошибка подключения к MongoDB:', err);
});

// Схемы Mongoose
const playerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  socketId: { type: String, required: true },
  isReady: { type: Boolean, default: false },
  profession: { type: String, default: '' },
  dream: { type: String, default: '' },
  selectedProfession: { type: String, default: '' },
  professionConfirmed: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
  money: { type: Number, default: 0 },
  position: { type: Number, default: 0 },
  cards: [{ type: Object }],
  isActive: { type: Boolean, default: true }
});

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  creatorId: { type: String, required: true },
  creatorUsername: { type: String, required: true },
  creatorProfession: { type: String, default: '' },
  creatorDream: { type: String, default: '' },
  assignProfessionToAll: { type: Boolean, default: false },
  availableProfessions: [{ type: String }],
  professionSelectionMode: { 
    type: String, 
    enum: ['random', 'choice', 'assigned'], 
    default: 'choice' 
  },
  maxPlayers: { type: Number, min: 2, max: 10, default: 4 },
  password: { type: String, default: '' },
  timing: { type: Number, min: 60, max: 300, default: 120 },
  createdAt: { type: Date, default: Date.now },
  gameDurationSec: { type: Number, default: 3600 },
  gameEndAt: { type: Date },
  deleteAfterAt: { type: Date },
  players: [playerSchema],
  started: { type: Boolean, default: false },
  order: [{ type: String }],
  currentIndex: { type: Number, default: 0 },
  turnEndAt: { type: Date },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const hallOfFameSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  games: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  lastPlayed: { type: Date, default: Date.now },
  totalPlayTime: { type: Number, default: 0 },
  averageGameTime: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Модели
const Room = mongoose.model('Room', roomSchema);
const HallOfFame = mongoose.model('HallOfFame', hallOfFameSchema);

// Хранилище токенов (в памяти)
const tokens = new Map();

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

// Профессии и мечты
const PROFESSIONS = [
  'Предприниматель', 'Инвестор', 'Финансист', 'Консультант', 
  'Менеджер', 'Аналитик', 'Трейдер', 'Банкир'
];

const DREAMS = [
  'Финансовая независимость', 'Собственный бизнес', 'Инвестиционный портфель',
  'Пассивный доход', 'Международная карьера', 'Образовательный центр',
  'Благотворительный фонд', 'Технологический стартап'
];

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
      name: 'energy888-socket-server',
      message: 'Energy888 Socket Server with MongoDB is running',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      host: HOST,
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        stats: '/stats',
        rooms: '/rooms',
        hallOfFame: '/hall-of-fame',
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
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      tokens: tokens.size,
      connectedClients: io.engine.clientsCount
    });
  }
  else if (path === '/stats' && method === 'GET') {
    Room.countDocuments({ isActive: true }).then(activeRooms => {
      HallOfFame.countDocuments().then(totalPlayers => {
        sendJSON(res, 200, {
          ok: true,
          activeRooms,
          totalPlayers,
          connectedClients: io.engine.clientsCount,
          uptime: process.uptime()
        });
      });
    });
  }
  else if (path === '/rooms' && method === 'GET') {
    Room.find({ isActive: true })
      .select('id name maxPlayers players started createdAt')
      .then(rooms => {
        const roomsList = rooms.map(room => ({
          id: room.id,
          name: room.name,
          maxPlayers: room.maxPlayers,
          currentPlayers: room.players.length,
          started: room.started,
          createdAt: room.createdAt
        }));
        sendJSON(res, 200, { ok: true, rooms: roomsList });
      })
      .catch(err => {
        sendJSON(res, 500, { ok: false, error: err.message });
      });
  }
  else if (path === '/hall-of-fame' && method === 'GET') {
    HallOfFame.find()
      .sort({ points: -1, winRate: -1 })
      .limit(10)
      .then(players => {
        sendJSON(res, 200, { ok: true, players });
      })
      .catch(err => {
        sendJSON(res, 500, { ok: false, error: err.message });
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
      sendJSON(res, 500, { ok: false, error: error.message });
    }
  }
  else if (path === '/tg/poll' && method === 'POST') {
    parsePostData(req, (data) => {
      if (!data || !data.token) {
        sendJSON(res, 400, { ok: false, error: 'Token required' });
        return;
      }
      
      const tokenData = tokens.get(data.token);
      if (!tokenData) {
        sendJSON(res, 404, { ok: false, error: 'Token not found' });
        return;
      }
      
      if (tokenData.authorized) {
        sendJSON(res, 200, {
          ok: true,
          authorized: true,
          user: tokenData.user
        });
        tokens.delete(data.token);
      } else {
        sendJSON(res, 200, {
          ok: true,
          authorized: false
        });
      }
    });
  }
  else if (path === '/tg/authorize' && method === 'POST') {
    parsePostData(req, (data) => {
      if (!data || !data.token || !data.user) {
        sendJSON(res, 400, { ok: false, error: 'Token and user data required' });
        return;
      }
      
      const tokenData = tokens.get(data.token);
      if (!tokenData) {
        sendJSON(res, 404, { ok: false, error: 'Token not found' });
        return;
      }
      
      tokenData.authorized = true;
      tokenData.user = data.user;
      
      console.log('✅ Пользователь авторизован:', data.user.name);
      
      sendJSON(res, 200, {
        ok: true,
        message: 'User authorized successfully'
      });
    });
  }
  else {
    sendJSON(res, 404, { ok: false, error: 'Not found' });
  }
});

// Создание Socket.IO сервера
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Обработка подключений Socket.IO
io.on('connection', (socket) => {
  console.log('🔌 Клиент подключен:', socket.id);
  
  // Получение списка комнат
  socket.on('get-rooms', async () => {
    try {
      const rooms = await Room.find({ isActive: true })
        .select('id name maxPlayers players started createdAt creatorUsername')
        .sort({ createdAt: -1 });
      
      const roomsList = rooms.map(room => ({
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        currentPlayers: room.players.length,
        started: room.started,
        createdAt: room.createdAt,
        creator: room.creatorUsername
      }));
      
      socket.emit('rooms-list', roomsList);
      console.log('📋 Отправлен список комнат:', roomsList.length);
    } catch (error) {
      console.error('❌ Ошибка получения комнат:', error);
      socket.emit('error', { message: 'Failed to get rooms' });
    }
  });
  
  // Создание комнаты
  socket.on('create-room', async (roomData) => {
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      
      // Планируем удаление комнаты через 5 часов
      const deleteAfterAt = new Date(Date.now() + 5 * 60 * 60 * 1000);
      
      const room = new Room({
        id: roomId,
        name: roomData.name || `Комната ${Date.now()}`,
        creatorId: socket.id,
        creatorUsername: roomData.creatorUsername || 'Игрок',
        creatorProfession: roomData.creatorProfession || '',
        creatorDream: roomData.creatorDream || '',
        assignProfessionToAll: roomData.assignProfessionToAll || false,
        availableProfessions: roomData.availableProfessions || PROFESSIONS,
        professionSelectionMode: roomData.professionSelectionMode || 'choice',
        maxPlayers: roomData.maxPlayers || 4,
        password: roomData.password || '',
        timing: roomData.timing || 120,
        gameDurationSec: roomData.gameDurationSec || 3600,
        deleteAfterAt,
        players: [],
        started: false,
        order: [],
        currentIndex: 0,
        lastActivity: new Date(),
        isActive: true
      });
      
      await room.save();
      
      // Присоединяем создателя к комнате
      socket.join(roomId);
      
      console.log('🏠 Комната создана:', roomId);
      
      socket.emit('room-created', {
        id: room.id,
        name: room.name,
        maxPlayers: room.maxPlayers,
        currentPlayers: 0,
        started: room.started,
        creator: room.creatorUsername
      });
      
      // Уведомляем всех о новой комнате
      io.emit('rooms-updated');
      
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });
  
  // Присоединение к комнате
  socket.on('join-room', async (data) => {
    try {
      const { roomId, playerName, playerEmail, profession, dream } = data;
      
      const room = await Room.findOne({ id: roomId, isActive: true });
      if (!room) {
        socket.emit('join-room-error', { error: 'Room not found' });
        return;
      }
      
      if (room.players.length >= room.maxPlayers) {
        socket.emit('join-room-error', { error: 'Room is full' });
        return;
      }
      
      if (room.started) {
        socket.emit('join-room-error', { error: 'Room already started' });
        return;
      }
      
      // Проверяем, не присоединен ли уже игрок
      const existingPlayer = room.players.find(p => p.socketId === socket.id);
      if (existingPlayer) {
        socket.emit('join-room-error', { error: 'Already in room' });
        return;
      }
      
      // Создаем игрока
      const player = {
        id: socket.id,
        name: playerName,
        email: playerEmail,
        socketId: socket.id,
        isReady: false,
        profession: profession || '',
        dream: dream || '',
        selectedProfession: '',
        professionConfirmed: false,
        joinedAt: new Date(),
        money: 0,
        position: 0,
        cards: [],
        isActive: true
      };
      
      room.players.push(player);
      await room.save();
      
      // Присоединяемся к комнате
      socket.join(roomId);
      
      console.log('👤 Игрок присоединился:', playerName, 'к комнате:', roomId);
      
      // Отправляем обновленную информацию о комнате
      socket.emit('room-joined', {
        roomId: room.id,
        roomName: room.name,
        players: room.players,
        maxPlayers: room.maxPlayers,
        professionSelectionMode: room.professionSelectionMode,
        availableProfessions: room.availableProfessions
      });
      
      // Уведомляем всех в комнате
      io.to(roomId).emit('player-joined', {
        player,
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
  socket.on('leave-room', async (data) => {
    try {
      const { roomId } = data;
      
      const room = await Room.findOne({ id: roomId, isActive: true });
      if (!room) {
        return;
      }
      
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex === -1) {
        return;
      }
      
      const player = room.players[playerIndex];
      room.players.splice(playerIndex, 1);
      
      socket.leave(roomId);
      
      console.log('👋 Игрок покинул комнату:', player.name);
      
      // Если комната пустая, удаляем её
      if (room.players.length === 0) {
        room.isActive = false;
        await room.save();
        console.log('🗑️ Комната удалена (пустая):', roomId);
      } else {
        // Уведомляем остальных игроков
        io.to(roomId).emit('player-left', {
          player,
          players: room.players
        });
      }
      
      // Уведомляем всех о обновлении списка комнат
      io.emit('rooms-updated');
      
    } catch (error) {
      console.error('❌ Ошибка покидания комнаты:', error);
    }
  });
  
  // Настройка игрока (профессия и мечта)
  socket.on('player-setup', async (data) => {
    try {
      const { roomId, profession, dream } = data;
      
      const room = await Room.findOne({ id: roomId, isActive: true });
      if (!room) {
        socket.emit('setup-error', { error: 'Room not found' });
        return;
      }
      
      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) {
        socket.emit('setup-error', { error: 'Player not found' });
        return;
      }
      
      // Обновляем профессию и мечту
      if (profession) {
        player.profession = profession;
        player.selectedProfession = profession;
        player.professionConfirmed = true;
      }
      
      if (dream) {
        player.dream = dream;
      }
      
      await room.save();
      
      console.log('⚙️ Настройка игрока:', player.name, 'профессия:', profession, 'мечта:', dream);
      
      // Уведомляем всех в комнате
      io.to(roomId).emit('player-updated', {
        player,
        players: room.players
      });
      
    } catch (error) {
      console.error('❌ Ошибка настройки игрока:', error);
      socket.emit('setup-error', { error: 'Failed to setup player' });
    }
  });
  
  // Готовность игрока
  socket.on('player-ready', async (data) => {
    try {
      const { roomId } = data;
      
      const room = await Room.findOne({ id: roomId, isActive: true });
      if (!room) {
        return;
      }
      
      const player = room.players.find(p => p.socketId === socket.id);
      if (!player) {
        return;
      }
      
      player.isReady = !player.isReady;
      await room.save();
      
      console.log('✅ Готовность игрока:', player.name, player.isReady ? 'готов' : 'не готов');
      
      // Уведомляем всех в комнате
      io.to(roomId).emit('player-ready-updated', {
        player,
        players: room.players
      });
      
      // Проверяем, все ли готовы
      const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);
      if (allReady && !room.started) {
        room.started = true;
        room.gameEndAt = new Date(Date.now() + room.gameDurationSec * 1000);
        room.order = room.players.map(p => p.socketId);
        room.currentIndex = 0;
        room.turnEndAt = new Date(Date.now() + room.timing * 1000);
        await room.save();
        
        console.log('🎮 Игра началась в комнате:', roomId);
        
        io.to(roomId).emit('game-started', {
          players: room.players,
          order: room.order,
          currentPlayer: room.players[room.currentIndex],
          turnEndAt: room.turnEndAt
        });
      }
      
    } catch (error) {
      console.error('❌ Ошибка готовности игрока:', error);
    }
  });
  
  // Получение информации о комнате
  socket.on('get-room-info', async (data) => {
    try {
      const { roomId } = data;
      
      const room = await Room.findOne({ id: roomId, isActive: true });
      if (!room) {
        socket.emit('room-info-error', { error: 'Room not found' });
        return;
      }
      
      socket.emit('room-info', {
        id: room.id,
        name: room.name,
        creator: room.creatorUsername,
        maxPlayers: room.maxPlayers,
        players: room.players,
        started: room.started,
        professionSelectionMode: room.professionSelectionMode,
        availableProfessions: room.availableProfessions,
        timing: room.timing,
        createdAt: room.createdAt
      });
      
    } catch (error) {
      console.error('❌ Ошибка получения информации о комнате:', error);
      socket.emit('room-info-error', { error: 'Failed to get room info' });
    }
  });
  
  // Обработка отключения
  socket.on('disconnect', async () => {
    console.log('🔌 Клиент отключен:', socket.id);
    
    try {
      // Удаляем игрока из всех комнат
      const rooms = await Room.find({ 
        'players.socketId': socket.id, 
        isActive: true 
      });
      
      for (const room of rooms) {
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex !== -1) {
          const player = room.players[playerIndex];
          room.players.splice(playerIndex, 1);
          
          // Если комната пустая, удаляем её
          if (room.players.length === 0) {
            room.isActive = false;
            await room.save();
            console.log('🗑️ Комната удалена (пустая):', room.id);
          } else {
            // Уведомляем остальных игроков
            io.to(room.id).emit('player-left', {
              player,
              players: room.players
            });
          }
          
          // Уведомляем всех о обновлении списка комнат
          io.emit('rooms-updated');
          break;
        }
      }
    } catch (error) {
      console.error('❌ Ошибка при отключении:', error);
    }
  });
});

// Периодическая очистка неактивных комнат
setInterval(async () => {
  try {
    const now = new Date();
    const result = await Room.updateMany(
      { 
        deleteAfterAt: { $lt: now },
        isActive: true 
      },
      { 
        isActive: false 
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`🧹 Очищено неактивных комнат: ${result.modifiedCount}`);
      io.emit('rooms-updated');
    }
  } catch (error) {
    console.error('❌ Ошибка очистки комнат:', error);
  }
}, 60000); // Каждую минуту

// Запуск сервера
server.listen(PORT, HOST, () => {
  console.log(`🚀 Advanced Socket Server listening on ${HOST}:${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Process ID: ${process.pid}`);
  console.log(`🔌 Socket.IO enabled for real-time rooms`);
  console.log(`🗄️ MongoDB: ${MONGODB_URI}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Получен SIGTERM, завершаем работу...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Получен SIGINT, завершаем работу...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
