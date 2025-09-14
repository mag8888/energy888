# 🚀 Полная система Energy of Money - Деплой

## 📋 Обзор системы

### Компоненты:
1. **🎮 Game App** (Next.js) - `https://money8888-production.up.railway.app`
2. **🔌 Advanced Socket Server** (Node.js + MongoDB) - новый
3. **🤖 Telegram Bot** (Railway) - `https://newbot-production-fa32.up.railway.app`

### Новые возможности:
- ✅ **MongoDB** с персистентным хранением
- ✅ **Профессии и мечты** для игроков
- ✅ **Зал славы** с рейтингом
- ✅ **Расширенная система комнат**
- ✅ **Автоматическая очистка** неактивных комнат

## 🗄️ Настройка MongoDB

### 1. Создайте MongoDB Atlas
1. Перейдите на [MongoDB Atlas](https://cloud.mongodb.com)
2. Создайте бесплатный аккаунт
3. Создайте новый кластер
4. Получите connection string

### 2. Настройте доступ
- Добавьте IP адрес Render.com в whitelist
- Создайте пользователя базы данных
- Скопируйте connection string

## 🚀 Деплой Advanced Socket Server

### 1. Создайте новый Web Service на Render.com
- **Name**: `energy888-advanced-socket`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node advanced-socket-server.js`
- **Root Directory**: `server`

### 2. Настройте переменные окружения
```
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/energy888
```

### 3. Подключите GitHub
- Выберите репозиторий с кодом
- Убедитесь, что файл `server/advanced-socket-server.js` существует

## 🎮 Обновление Game App

### 1. Обновите переменные окружения
В Render.com для Game App добавьте:
```
NEXT_PUBLIC_SOCKET_URL=https://money8888-production.up.railway.app
```

### 2. Добавьте новые страницы
- `/advanced-rooms` - новая система комнат
- `/advanced-room/[id]` - страница комнаты с полным функционалом

### 3. Обновите навигацию
Добавьте ссылки на новые страницы в меню.

## 🧪 Тестирование

### 1. Локальное тестирование
```bash
# Установите зависимости
cd server
npm install

# Запустите сервер
MONGODB_URI=your_mongodb_uri node advanced-socket-server.js

# Тестируйте API
node test-advanced-server.js
```

### 2. Тестирование Socket.IO
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
    creatorUsername: 'Test User',
    creatorProfession: 'Предприниматель',
    creatorDream: 'Финансовая независимость'
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

## 🔧 Настройка переменных окружения

### Game App (Render.com)
```
NEXT_PUBLIC_SOCKET_URL=https://money8888-production.up.railway.app
```

### Advanced Socket Server (Render.com)
```
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/energy888
```

### Telegram Bot (Railway)
```
BOT_TOKEN=your_bot_token
GAME_URL=https://money8888-production.up.railway.app
NODE_ENV=production
```

## 📈 Мониторинг

### Логи сервера
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

## 🎯 Пошаговый план деплоя

### Шаг 1: MongoDB Atlas
1. Создайте аккаунт MongoDB Atlas
2. Создайте кластер
3. Получите connection string
4. Настройте whitelist

### Шаг 2: Advanced Socket Server
1. Создайте новый Web Service на Render.com
2. Настройте переменные окружения
3. Подключите GitHub репозиторий
4. Дождитесь успешного деплоя

### Шаг 3: Game App
1. Обновите переменные окружения
2. Добавьте новые страницы
3. Пересоберите приложение
4. Протестируйте функциональность

### Шаг 4: Тестирование
1. Протестируйте создание комнат
2. Протестируйте присоединение к комнатам
3. Протестируйте выбор профессий и мечт
4. Протестируйте готовность игроков

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь в корректности переменных окружения
3. Протестируйте API endpoints
4. Проверьте подключение к MongoDB

## 🎉 Результат

После успешного деплоя у вас будет:
- ✅ Полноценная система комнат с MongoDB
- ✅ Профессии и мечты для игроков
- ✅ Зал славы с рейтингом
- ✅ Автоматическая очистка комнат
- ✅ Расширенная статистика
- ✅ Стабильная работа на Render.com и Railway
