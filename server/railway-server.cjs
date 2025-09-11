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

// Простая Socket.IO логика
io.on('connection', (socket) => {
  console.log('🔌 Клиент подключен:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('🔌 Клиент отключен:', socket.id);
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
