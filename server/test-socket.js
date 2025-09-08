const { io } = require('socket.io-client');

console.log('🔌 Тестируем Socket.IO подключение...');

const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('✅ Подключен к серверу! ID:', socket.id);
  
  // Тестируем создание комнаты
  console.log('🏠 Создаем тестовую комнату...');
  socket.emit('createRoom', {
    name: 'Тестовая комната',
    creatorId: 'test_user_1',
    creatorUsername: 'TestUser',
    creatorProfession: 'entrepreneur',
    creatorDream: 'financial_freedom',
    assignProfessionToAll: true,
    maxPlayers: 4,
    password: '',
    timing: 120,
    gameDurationSec: 10800
  });
});

socket.on('roomsList', (rooms) => {
  console.log('📋 Получен список комнат:', rooms.length);
  rooms.forEach(room => {
    console.log(`  - ${room.name} (${room.players.length}/${room.maxPlayers})`);
  });
});

socket.on('roomCreated', (result) => {
  console.log('🏠 Результат создания комнаты:', result);
});

socket.on('disconnect', () => {
  console.log('❌ Отключен от сервера');
});

socket.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения:', error);
});

// Завершаем через 5 секунд
setTimeout(() => {
  console.log('🛑 Завершаем тест');
  socket.disconnect();
  process.exit(0);
}, 5000);
