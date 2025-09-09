# Energy of Money - Server with Database

## Новые возможности

### ✅ Персистентность комнат
- Комнаты сохраняются в MongoDB
- Восстановление комнат после перезапуска сервера
- Автоматическая очистка неактивных комнат

### ✅ Мониторинг и статистика
- Эндпоинт `/stats` - статистика сервера
- Эндпоинт `/hall-of-fame` - топ игроков
- Отслеживание активности комнат

### ✅ Улучшенная логика очистки
- Комнаты удаляются только через 24 часа (вместо 5)
- Удаляются только пустые комнаты
- Задержка в 1 час перед удалением пустых комнат

## Установка и запуск

### 1. Установка MongoDB

#### Локально (macOS):
```bash
brew install mongodb-community
brew services start mongodb-community
```

#### Локально (Ubuntu/Debian):
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Установка зависимостей
```bash
cd server
npm install
```

### 3. Настройка переменных окружения
Создайте файл `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/energy888
PORT=4000
NODE_ENV=development
FRONT_ORIGIN=*
```

### 4. Запуск сервера
```bash
npm start
```

## API Endpoints

### Основные
- `GET /` - статус сервера
- `GET /stats` - статистика сервера
- `GET /hall-of-fame?limit=10&sortBy=points` - топ игроков

### Telegram Bot
- `GET /tg/new-token` - получение токена
- `POST /tg/bot-auth` - авторизация через бота
- `POST /tg/authorize` - проверка токена

## Socket.IO Events

### Клиент → Сервер
- `get-rooms` - получить список комнат
- `create-room` - создать комнату
- `join-room` - присоединиться к комнате
- `rooms-updated` - обновить список комнат

### Сервер → Клиент
- `rooms-list` - список комнат
- `room-created` - комната создана
- `room-joined` - присоединились к комнате
- `room-updated` - комната обновлена
- `rooms-updated` - список комнат обновлен
- `error` - ошибка

## Структура базы данных

### Коллекция: rooms
```javascript
{
  id: String,           // Уникальный ID комнаты
  name: String,         // Название комнаты
  creatorId: String,    // ID создателя
  creatorUsername: String,
  maxPlayers: Number,   // Максимум игроков
  timing: Number,       // Время хода в секундах
  createdAt: Date,      // Дата создания
  players: [Player],    // Массив игроков
  started: Boolean,     // Игра началась
  lastActivity: Date,   // Последняя активность
  isActive: Boolean     // Комната активна
}
```

### Коллекция: halloffames
```javascript
{
  username: String,     // Имя игрока
  games: Number,        // Количество игр
  wins: Number,         // Количество побед
  points: Number,       // Очки
  winRate: Number,      // Процент побед
  lastPlayed: Date,     // Последняя игра
  totalPlayTime: Number // Общее время игры
}
```

## Мониторинг

### Статистика сервера
```bash
curl http://localhost:4000/stats
```

Ответ:
```json
{
  "ok": true,
  "totalRooms": 5,
  "totalPlayers": 12,
  "isConnected": true,
  "uptime": 3600,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Топ игроков
```bash
curl "http://localhost:4000/hall-of-fame?limit=5&sortBy=points"
```

## Логи и отладка

Сервер выводит подробные логи:
- `✅` - успешные операции
- `❌` - ошибки
- `🔄` - обновления
- `🏠` - операции с комнатами
- `👋` - отключения игроков
- `🗑️` - удаления

## Производственное развертывание

### Переменные окружения для продакшена:
```env
MONGODB_URI=mongodb://username:password@host:port/database
PORT=4000
NODE_ENV=production
FRONT_ORIGIN=https://your-frontend-domain.com
```

### Рекомендации:
1. Используйте MongoDB Atlas для продакшена
2. Настройте мониторинг через `/stats`
3. Регулярно проверяйте логи
4. Настройте автоматическое резервное копирование БД
