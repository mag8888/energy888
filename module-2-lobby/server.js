const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Хранилище комнат
const rooms = new Map();
const players = new Map();

console.log('🚀 Starting Energy of Money - Lobby Module...');
console.log(`📡 Port: ${PORT}`);

// Главная страница лобби
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Energy of Money - Лобби</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                text-align: center;
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 800px;
                margin: 20px;
            }
            h1 {
                color: #333;
                margin-bottom: 20px;
                font-size: 2.5em;
            }
            .status {
                background: #4CAF50;
                color: white;
                padding: 15px 30px;
                border-radius: 50px;
                font-size: 1.1em;
                font-weight: bold;
                display: inline-block;
                margin: 20px 0;
            }
            .lobby-section {
                background: #f8f9fa;
                padding: 30px;
                border-radius: 15px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
            }
            .rooms-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            .room-card {
                background: white;
                border: 2px solid #e0e0e0;
                border-radius: 15px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .room-card:hover {
                border-color: #667eea;
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            }
            .room-card.available {
                border-color: #4CAF50;
            }
            .room-card.full {
                border-color: #f44336;
                opacity: 0.6;
            }
            .room-name {
                font-size: 1.2em;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }
            .room-players {
                color: #666;
                margin-bottom: 10px;
            }
            .room-status {
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.9em;
                font-weight: bold;
            }
            .status-available {
                background: #e8f5e8;
                color: #4CAF50;
            }
            .status-full {
                background: #ffebee;
                color: #f44336;
            }
            .create-room-btn {
                background: #667eea;
                color: white;
                padding: 15px 30px;
                border: none;
                border-radius: 50px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                margin: 20px 10px;
                transition: all 0.3s ease;
            }
            .create-room-btn:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .info {
                background: #e3f2fd;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                border-left: 4px solid #2196f3;
            }
            .player-count {
                background: #fff3e0;
                padding: 15px;
                border-radius: 10px;
                margin: 10px 0;
                border-left: 4px solid #ff9800;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎮 Energy of Money</h1>
            <div class="status">✅ Лобби работает!</div>
            
            <div class="lobby-section">
                <h3>🏠 Выберите комнату для игры</h3>
                <div class="player-count">
                    <strong>Игроков онлайн:</strong> <span id="online-count">0</span>
                </div>
                <div class="rooms-grid" id="rooms-grid">
                    <!-- Комнаты будут загружены через Socket.IO -->
                </div>
                <button class="create-room-btn" onclick="createRoom()">
                    ➕ Создать новую комнату
                </button>
            </div>
            
            <div class="info">
                <h3>🎯 Возможности лобби</h3>
                <p>• Создание и присоединение к комнатам</p>
                <p>• Отображение количества игроков</p>
                <p>• Реальное время обновления</p>
                <p>• Система чата в лобби</p>
            </div>
            
            <div class="info">
                <h3>🚀 Статус развертывания</h3>
                <p><strong>Модуль:</strong> Лобби и выбор комнат</p>
                <p><strong>Платформа:</strong> Railway.app</p>
                <p><strong>Время:</strong> <span id="time"></span></p>
            </div>
        </div>

        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
            let onlineCount = 0;

            // Обновление времени
            function updateTime() {
                const now = new Date();
                document.getElementById('time').textContent = now.toLocaleString('ru-RU');
            }
            updateTime();
            setInterval(updateTime, 1000);

            // Socket.IO события
            socket.on('connect', () => {
                console.log('Подключен к лобби');
                socket.emit('join-lobby');
            });

            socket.on('online-count', (count) => {
                onlineCount = count;
                document.getElementById('online-count').textContent = count;
            });

            socket.on('rooms-update', (roomsList) => {
                updateRoomsGrid(roomsList);
            });

            socket.on('room-created', (room) => {
                console.log('Создана комната:', room);
                socket.emit('get-rooms');
            });

            function updateRoomsGrid(roomsList) {
                const grid = document.getElementById('rooms-grid');
                grid.innerHTML = '';

                roomsList.forEach(room => {
                    const roomCard = document.createElement('div');
                    roomCard.className = \`room-card \${room.players.length >= room.maxPlayers ? 'full' : 'available'}\`;
                    
                    const statusClass = room.players.length >= room.maxPlayers ? 'status-full' : 'status-available';
                    const statusText = room.players.length >= room.maxPlayers ? 'Полная' : 'Доступна';
                    
                    roomCard.innerHTML = \`
                        <div class="room-name">\${room.name}</div>
                        <div class="room-players">Игроков: \${room.players.length}/\${room.maxPlayers}</div>
                        <div class="room-status \${statusClass}">\${statusText}</div>
                    \`;
                    
                    if (room.players.length < room.maxPlayers) {
                        roomCard.onclick = () => joinRoom(room.id);
                    }
                    
                    grid.appendChild(roomCard);
                });
            }

            function createRoom() {
                const roomName = prompt('Введите название комнаты:');
                if (roomName) {
                    socket.emit('create-room', { name: roomName, maxPlayers: 4 });
                }
            }

            function joinRoom(roomId) {
                socket.emit('join-room', roomId);
                alert('Присоединение к комнате...');
            }
        </script>
    </body>
    </html>
  `);
});

// API для получения списка комнат
app.get('/api/rooms', (req, res) => {
  const roomsList = Array.from(rooms.values()).map(room => ({
    id: room.id,
    name: room.name,
    players: room.players,
    maxPlayers: room.maxPlayers,
    status: room.players.length >= room.maxPlayers ? 'full' : 'available'
  }));
  
  res.json(roomsList);
});

// API для создания комнаты
app.post('/api/rooms', (req, res) => {
  const { name, maxPlayers = 4 } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Название комнаты обязательно' });
  }

  const roomId = uuidv4();
  const room = {
    id: roomId,
    name,
    players: [],
    maxPlayers,
    createdAt: new Date()
  };

  rooms.set(roomId, room);
  
  res.json(room);
});

// API для статуса
app.get('/api/status', (req, res) => {
  res.json({
    module: 'lobby',
    status: 'running',
    roomsCount: rooms.size,
    playersCount: players.size,
    timestamp: new Date().toISOString()
  });
});

// Socket.IO обработчики
io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);
  
  // Добавляем игрока
  players.set(socket.id, {
    id: socket.id,
    name: `Player_${socket.id.substring(0, 6)}`,
    roomId: null
  });

  // Отправляем обновленную информацию
  socket.emit('online-count', players.size);
  socket.emit('rooms-update', Array.from(rooms.values()));

  socket.on('join-lobby', () => {
    console.log('Пользователь присоединился к лобби:', socket.id);
  });

  socket.on('create-room', (data) => {
    const roomId = uuidv4();
    const room = {
      id: roomId,
      name: data.name,
      players: [],
      maxPlayers: data.maxPlayers || 4,
      createdAt: new Date()
    };

    rooms.set(roomId, room);
    socket.emit('room-created', room);
    
    // Уведомляем всех о новой комнате
    io.emit('rooms-update', Array.from(rooms.values()));
  });

  socket.on('join-room', (roomId) => {
    const room = rooms.get(roomId);
    const player = players.get(socket.id);
    
    if (!room || !player) return;
    
    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', 'Комната заполнена');
      return;
    }

    // Удаляем из предыдущей комнаты
    if (player.roomId) {
      const oldRoom = rooms.get(player.roomId);
      if (oldRoom) {
        oldRoom.players = oldRoom.players.filter(p => p.id !== socket.id);
      }
    }

    // Добавляем в новую комнату
    player.roomId = roomId;
    room.players.push(player);
    
    socket.join(roomId);
    socket.emit('joined-room', room);
    
    // Уведомляем всех об обновлении
    io.emit('rooms-update', Array.from(rooms.values()));
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
    
    const player = players.get(socket.id);
    if (player && player.roomId) {
      const room = rooms.get(player.roomId);
      if (room) {
        room.players = room.players.filter(p => p.id !== socket.id);
        
        // Удаляем пустые комнаты
        if (room.players.length === 0) {
          rooms.delete(player.roomId);
        }
      }
    }
    
    players.delete(socket.id);
    io.emit('online-count', players.size);
    io.emit('rooms-update', Array.from(rooms.values()));
  });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`✅ Lobby module running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in browser`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down...');
  process.exit(0);
});
