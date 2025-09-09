const io = require('socket.io-client');

console.log('🧪 Тестирование комнат...');

// Подключаемся к серверу
const socket = io('http://localhost:4000', {
  transports: ['websocket', 'polling'],
  timeout: 10000
});

socket.on('connect', () => {
  console.log('✅ Подключен к серверу');
  
  // Запрашиваем список комнат
  socket.emit('get-rooms');
});

socket.on('rooms-list', (rooms) => {
  console.log('📋 Получен список комнат:', rooms.length);
  rooms.forEach(room => {
    console.log(`  - ${room.name} (${room.players}/${room.maxPlayers} игроков, статус: ${room.status})`);
  });
  
  // Создаем тестовую комнату
  console.log('🏠 Создаем тестовую комнату...');
  socket.emit('create-room', {
    name: 'Тестовая комната',
    maxPlayers: 4,
    timing: 120,
    playerName: 'Тестер',
    playerEmail: 'test@example.com'
  });
});

socket.on('room-created', (room) => {
  console.log('✅ Комната создана:', room);
  
  // Присоединяемся к комнате
  console.log('🚪 Присоединяемся к комнате...');
  socket.emit('join-room', {
    roomId: room.id,
    playerName: 'Тестер 2',
    playerEmail: 'test2@example.com'
  });
});

socket.on('room-joined', (room) => {
  console.log('✅ Присоединились к комнате:', room);
  
  // Запрашиваем обновленный список комнат
  setTimeout(() => {
    console.log('🔄 Запрашиваем обновленный список комнат...');
    socket.emit('get-rooms');
  }, 1000);
});

socket.on('error', (error) => {
  console.error('❌ Ошибка:', error);
});

socket.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения:', error);
});

// Завершаем тест через 10 секунд
setTimeout(() => {
  console.log('🏁 Тест завершен');
  socket.disconnect();
  process.exit(0);
}, 10000);
