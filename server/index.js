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

app.get('/', (_req, res) => res.json({ ok: true, name: 'energy888-socket-server' }));

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
  const botToken = process.env.BOT_TOKEN;
  const hdr = req.headers['authorization'];
  if (!botToken || hdr !== `Bearer ${botToken}`) {
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
app.get('/tg/poll', (req, res) => {
  const { token } = req.query;
  const sess = tgSessions.get(token);
  if (!sess) return res.json({ ok: false, authorized: false });
  if (Date.now() - sess.createdAt > 10 * 60 * 1000) { tgSessions.delete(token); return res.json({ ok: false, authorized: false, expired: true }); }
  res.json({ ok: true, authorized: !!sess.authorized, user: sess.user });
});

// Hall of Fame public endpoint
app.get('/hall-of-fame', (_req, res) => {
  const list = Array.from(hallOfFame.entries()).map(([username, v]) => ({ username, ...v }));
  list.sort((a,b) => {
    if (a.wins !== b.wins) return b.wins - a.wins;
    return b.points - a.points;
  });
  res.json({ ok: true, list });
});

const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: [
      'https://energy-of-money-1game.onrender.com',
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

  // Create room
  socket.on('createRoom', (payload = {}) => {
    const id = payload.id || `room_${Date.now().toString(36)}`;
    if (rooms.has(id)) {
      socket.emit('roomCreateError', { message: 'Комната с таким ID уже существует' });
      return;
    }
    const room = {
      id,
      name: payload.name || 'Комната',
      creatorId: payload.creatorId || socket.id,
      creatorUsername: payload.creatorUsername || 'Игрок',
      creatorProfession: payload.creatorProfession || null,
      creatorDream: payload.creatorDream || null,
      assignProfessionToAll: !!payload.assignProfessionToAll,
      maxPlayers: Number(payload.maxPlayers || 6),
      password: payload.password || null,
      timing: Number(payload.timing || 120),
      createdAt: Date.now(),
      gameDurationSec: Number(payload.gameDurationSec || 10800),
      gameEndAt: null,
      deleteAfterAt: null,
      players: new Map()
    };
    rooms.set(id, room);
    socket.emit('roomCreated', { id, ...room, players: [] });
    io.emit('roomsList', listRooms());
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

  // Join room with metadata
  socket.on('joinRoomMeta', ({ roomId, user, password }) => {
    const room = rooms.get(roomId);
    if (!room) { socket.emit('roomJoinError', { message: 'Комната не найдена' }); return; }
    if (room.password && room.password !== password) { socket.emit('roomJoinError', { message: 'Неверный пароль' }); return; }
    if (room.players.size >= (room.maxPlayers || 6)) { socket.emit('roomJoinError', { message: 'Комната заполнена' }); return; }

    socket.join(roomId);
    const p = {
      id: user?.id || socket.id,
      username: user?.username || `User-${socket.id.slice(0,5)}`,
      socketId: socket.id,
      profession: user?.profession || (room.assignProfessionToAll && room.creatorProfession ? room.creatorProfession : null),
      balance: Number(user?.balance ?? 3000),
      isHost: room.players.size === 0 && !room.creatorId ? true : (user?.id === room.creatorId),
      ready: false
    };
    room.id = room.id || roomId;
    room.players.set(p.username, p);
    io.to(roomId).emit('playersUpdate', Array.from(room.players.values()));
    socket.emit('roomJoinedMeta', { roomId, room: { ...room, players: Array.from(room.players.values()) } });
    io.emit('roomsList', listRooms());
  });

  // Fetch room meta
  socket.on('getRoomMeta', (roomId) => {
    const room = rooms.get(roomId);
    if (!room) { socket.emit('roomJoinError', { message: 'Комната не найдена' }); return; }
    socket.emit('roomMeta', { ...room, players: Array.from(room.players.values()) });
  });

  // Toggle ready
  socket.on('playerReady', ({ roomId, username, ready }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const p = room.players.get(username);
    if (!p) return;
    p.ready = !!ready;
    room.players.set(username, p);
    io.to(roomId).emit('roomMeta', { ...room, players: Array.from(room.players.values()) });
  });

  // Start game (host only)
  socket.on('startGame', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    // Verify host
    const starter = Array.from(room.players.values()).find(x => x.socketId === socket.id);
    if (!starter || !(starter.id === room.creatorId)) { socket.emit('roomJoinError', { message: 'Старт может инициировать только создатель' }); return; }
    if (room.players.size < 2) { socket.emit('roomJoinError', { message: 'Нужно минимум 2 игрока' }); return; }
    room.started = true;
    room.order = Array.from(room.players.values()).map(p => p.username);
    room.currentIndex = 0;
    const timing = Number(room.timing || 120);
    room.gameEndAt = Date.now() + (room.gameDurationSec || 10800) * 1000;
    const schedule = () => {
      room.turnEndAt = Date.now() + timing * 1000;
      io.to(roomId).emit('playerTurnChanged', {
        currentPlayer: { username: room.order[room.currentIndex] },
        currentPlayerIndex: room.currentIndex,
        turnTimeLeft: timing
      });
    };
    schedule();
    // clear previous interval
    const old = roomIntervals.get(roomId);
    if (old) clearInterval(old);
    const iv = setInterval(() => {
      const left = Math.max(0, Math.ceil((room.turnEndAt - Date.now()) / 1000));
      io.to(roomId).emit('turnTimerSynced', { timeLeft: left, isTurnEnding: left <= 20 });
      const gameLeft = Math.max(0, Math.ceil((room.gameEndAt - Date.now()) / 1000));
      if (gameLeft <= 0) {
        finalizeGame(roomId);
        return;
      }
      if (left <= 0) {
        // next turn
        room.currentIndex = (room.currentIndex + 1) % room.order.length;
        schedule();
      }
    }, 1000);
    roomIntervals.set(roomId, iv);
    io.to(roomId).emit('roomMeta', { ...room, players: Array.from(room.players.values()) });
  });

  // Pass turn (only current player)
  socket.on('passTurn', ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room || !room.started) return;
    const currentName = room.order[room.currentIndex];
    const player = Array.from(room.players.values()).find(x => x.id === playerId);
    if (!player || player.username !== currentName) return; // not your turn
    const timing = Number(room.timing || 120);
    room.currentIndex = (room.currentIndex + 1) % room.order.length;
    room.turnEndAt = Date.now() + timing * 1000;
    
    // Отправляем обновленное состояние игры
    io.to(roomId).emit('gameState', {
      players: Array.from(room.players.values()),
      currentPlayerId: room.order[room.currentIndex],
      gameStarted: room.started,
      turnState: 'waiting'
    });
    
    io.to(roomId).emit('turnPassed', {
      nextPlayerId: room.order[room.currentIndex],
      currentPlayerIndex: room.currentIndex,
      turnTimeLeft: timing
    });
  });

  // Roll dice
  socket.on('rollDice', ({ roomId, playerId, value }) => {
    const room = rooms.get(roomId);
    if (!room || !room.started) return;
    const currentName = room.order[room.currentIndex];
    const player = Array.from(room.players.values()).find(x => x.id === playerId);
    if (!player || player.username !== currentName) return; // not your turn
    
    // Отправляем результат всем игрокам
    io.to(roomId).emit('diceRolled', {
      playerId,
      value,
      playerName: player.username
    });
    
    // Обновляем состояние игры
    io.to(roomId).emit('gameState', {
      players: Array.from(room.players.values()),
      currentPlayerId: playerId,
      gameStarted: room.started,
      turnState: 'rolled'
    });
  });

  // Get game state
  socket.on('getGameState', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    socket.emit('gameState', {
      players: Array.from(room.players.values()),
      currentPlayerId: room.started ? room.order[room.currentIndex] : null,
      gameStarted: room.started,
      turnState: room.started ? 'waiting' : 'waiting'
    });
  });

  // Player stats update (from clients)
  socket.on('updatePlayerStats', ({ roomId, username, stats }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const p = room.players.get(username);
    if (!p) return;
    p.isOnBigCircle = !!stats.isOnBigCircle;
    p.passiveIncome = Number(stats.passiveIncome || 0);
    p.balance = Number(stats.balance || 0);
    p.businessCount = Number(stats.businessCount || 0);
    p.dreamPurchased = !!stats.dreamPurchased;
    if (p.baselinePassiveIncome === undefined && stats.baselinePassiveIncome !== undefined) {
      p.baselinePassiveIncome = Number(stats.baselinePassiveIncome || 0);
    }
    room.players.set(username, p);
    io.to(roomId).emit('playersUpdate', Array.from(room.players.values()));
    // Check end conditions (all finished)
    const vals = Array.from(room.players.values());
    const allDone = vals.length>0 && vals.every(x => (x.dreamPurchased && (x.businessCount||0)>=2) || ((x.businessCount||0)>=1 && (x.passiveIncome - (x.baselinePassiveIncome||0)) >= 50000));
    if (allDone) finalizeGame(roomId);
  });

  socket.on('joinRoom', (roomId, player) => {
    try {
      const room = getRoom(roomId);
      socket.join(roomId);
      const user = {
        id: player?.id || socket.id,
        username: player?.username || `User-${socket.id.slice(0,5)}`,
        socketId: socket.id,
        balance: Number(player?.balance ?? 3000)
      };
      room.players.set(user.username, user);
      io.to(roomId).emit('playersUpdate', Array.from(room.players.values()));
    } catch (e) {
      // ignore
    }
  });

  socket.on('bankTransfer', (payload) => {
    try {
      const { roomId, username, recipient, amount = 0, currentBalance = 0, transactionId } = payload || {};
      const room = getRoom(roomId);
      const sender = room.players.get(username) || { username, balance: currentBalance, socketId: socket.id };
      const amt = Number(amount) || 0;
      if (amt <= 0) return;

      // Update balances
      const newBalance = Number(sender.balance ?? currentBalance) - amt;
      if (newBalance < 0) {
        socket.emit('bankTransferError', { message: 'Недостаточно средств' });
        return;
      }
      sender.balance = newBalance;
      room.players.set(sender.username, sender);

      // Recipient
      const rec = room.players.get(recipient);
      if (rec) {
        rec.balance = Number(rec.balance ?? 0) + amt;
        room.players.set(recipient, rec);
        io.to(rec.socketId).emit('bankTransferReceived', { fromPlayer: sender.username, amount: amt });
      } else {
        // Broadcast receive event (fallback)
        socket.to(roomId).emit('bankTransferReceived', { fromPlayer: sender.username, amount: amt });
      }

      // Notify sender success
      socket.emit('bankTransferSuccess', { message: 'Перевод выполнен', newBalance, transactionId });

      // Emit updated players list
      io.to(roomId).emit('playersUpdate', Array.from(room.players.values()));
    } catch (e) {
      socket.emit('bankTransferError', { message: 'Ошибка перевода' });
    }
  });

  socket.on('disconnect', () => {
    // Clean up user from rooms
    rooms.forEach((room, roomId) => {
      for (const [username, u] of room.players) {
        if (u.socketId === socket.id) {
          room.players.delete(username);
        }
      }
      io.to(roomId).emit('playersUpdate', Array.from(room.players.values()));
    });
    io.emit('roomsList', listRooms());
  });
});

function finalizeGame(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.finished) return;
  room.finished = true;
  if (roomIntervals.get(roomId)) { clearInterval(roomIntervals.get(roomId)); roomIntervals.delete(roomId); }
  const players = Array.from(room.players.values());
  // Ranking
  const rankOrder = players.slice().sort((a,b) => {
    const aWin = a.dreamPurchased && (a.businessCount||0) >= 2;
    const bWin = b.dreamPurchased && (b.businessCount||0) >= 2;
    if (aWin !== bWin) return aWin ? -1 : 1;
    if (a.isOnBigCircle && b.isOnBigCircle) return (b.passiveIncome||0) - (a.passiveIncome||0);
    if (a.isOnBigCircle !== b.isOnBigCircle) return a.isOnBigCircle ? -1 : 1;
    // both small circle
    if ((a.passiveIncome||0) !== (b.passiveIncome||0)) return (b.passiveIncome||0) - (a.passiveIncome||0);
    return (b.balance||0) - (a.balance||0);
  });
  // Points
  const n = rankOrder.length;
  const results = rankOrder.map((p, i) => ({ username: p.username, place: i+1, points: (n - (i+1)) }));
  if (n === 2) results[0].points += 1; // 1v1 bonus
  // Hall of fame update
  results.forEach((r, idx) => {
    const p = room.players.get(r.username);
    const rec = hallOfFame.get(r.username) || { games: 0, wins: 0, points: 0 };
    rec.games += 1;
    rec.points += r.points;
    if (idx === 0) rec.wins += 1;
    hallOfFame.set(r.username, rec);
  });
  room.deleteAfterAt = Date.now() + 60*60*1000; // delete 1h after finish
  io.to(roomId).emit('gameOver', { rankings: results, hallOfFame: Array.from(hallOfFame.entries()).map(([u,v])=>({ username:u, ...v })) });
}

// cleanup loop
setInterval(() => {
  const now = Date.now();
  Array.from(rooms.entries()).forEach(([roomId, room]) => {
    if (room.deleteAfterAt && now > room.deleteAfterAt) {
      if (roomIntervals.get(roomId)) { clearInterval(roomIntervals.get(roomId)); roomIntervals.delete(roomId); }
      rooms.delete(roomId);
    }
  });
}, 60000);

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

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
