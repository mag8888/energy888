# 🚀 Деплой Advanced Socket Server с MongoDB

## 📋 Обзор

Новая система комнат включает:
- ✅ **MongoDB** с Mongoose для персистентного хранения
- ✅ **Профессии и мечты** для игроков
- ✅ **Зал славы** с рейтингом игроков
- ✅ **Расширенная система комнат** с настройками
- ✅ **Автоматическая очистка** неактивных комнат

## 🗄️ Настройка MongoDB

### Вариант 1: MongoDB Atlas (рекомендуется)
1. Создайте аккаунт на [MongoDB Atlas](https://cloud.mongodb.com)
2. Создайте кластер
3. Получите connection string
4. Добавьте в переменные окружения: `MONGODB_URI=mongodb+srv://...`

### Вариант 2: Локальная MongoDB
```bash
# Установка MongoDB
brew install mongodb-community
# Или
sudo apt-get install mongodb

# Запуск
mongod
```

## 🚀 Деплой на Render.com

### 1. Создайте новый Web Service
- **Name**: `energy888-advanced-socket`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node advanced-socket-server.js`

### 2. Настройте переменные окружения
```
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/energy888
```

### 3. Подключите GitHub репозиторий
- Выберите репозиторий с кодом
- Root Directory: `server`

## 🧪 Тестирование

### Локальное тестирование
```bash
cd server
npm install
npm start
```

### Тестирование API
```bash
node test-advanced-server.js
```

### Тестирование Socket.IO
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Connected to server');
  
  // Получить список комнат
  socket.emit('get-rooms');
  
  // Создать комнату
  socket.emit('create-room', {
    name: 'Test Room',
    maxPlayers: 4,
    creatorUsername: 'Test User'
  });
});

socket.on('rooms-list', (rooms) => {
  console.log('Rooms:', rooms);
});
```

## 📊 API Endpoints

### REST API
- `GET /` - Статус сервера
- `GET /health` - Здоровье сервера
- `GET /stats` - Статистика
- `GET /rooms` - Список комнат
- `GET /hall-of-fame` - Зал славы

### Socket.IO Events
- `get-rooms` - Получить список комнат
- `create-room` - Создать комнату
- `join-room` - Присоединиться к комнате
- `leave-room` - Покинуть комнату
- `player-setup` - Настроить игрока
- `player-ready` - Готовность игрока
- `get-room-info` - Информация о комнате

## 🔧 Настройка Game App

Обновите переменные окружения в Game App:
```
NEXT_PUBLIC_SOCKET_URL=https://money8888-production.up.railway.app
```

## 📈 Мониторинг

### Логи
- Проверяйте логи в Render.com Dashboard
- Ищите ошибки MongoDB подключения
- Следите за очисткой комнат

### Метрики
- Количество активных комнат
- Количество подключенных клиентов
- Статистика зала славы

## 🛠️ Устранение неполадок

### MongoDB не подключается
1. Проверьте MONGODB_URI
2. Убедитесь, что IP адрес добавлен в whitelist
3. Проверьте логи подключения

### Комнаты не создаются
1. Проверьте права доступа к MongoDB
2. Убедитесь, что схема корректна
3. Проверьте логи ошибок

### Socket.IO не работает
1. Проверьте CORS настройки
2. Убедитесь, что порт доступен
3. Проверьте подключение клиента

## 🎯 Следующие шаги

1. **Деплой сервера** на Render.com
2. **Настройка MongoDB** Atlas
3. **Обновление Game App** для работы с новым API
4. **Тестирование** всех функций
5. **Мониторинг** производительности

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь в корректности переменных окружения
3. Протестируйте API endpoints
4. Проверьте подключение к MongoDB
