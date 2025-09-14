# 🚀 Деплой объединенного сервера

## Описание
Объединенный сервер включает в себя:
- **Socket.IO** для игровых комнат и реального времени
- **Telegram Bot** для авторизации
- **Express API** для управления токенами и комнатами

## 🔧 Настройка на Render.com

### 1. Создание Web Service
1. Зайдите на [Render.com](https://render.com)
2. Нажмите "New +" → "Web Service"
3. Подключите GitHub репозиторий

### 2. Конфигурация
- **Name**: `energy888-unified-server`
- **Environment**: `Node`
- **Plan**: `Free`
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && node unified-server.js`

### 3. Environment Variables
```
NODE_ENV=production
BOT_TOKEN=8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI
PORT=10000
```

### 4. Health Check
- **Path**: `/health`

## 🌐 Endpoints

### Основные
- `GET /` - Статус сервера
- `GET /health` - Проверка здоровья

### Telegram
- `GET /tg/new-token` - Создание токена для авторизации
- `GET /tg/poll?token=xxx` - Проверка статуса токена
- `POST /tg/authorize` - Авторизация через Telegram

### Socket.IO
- `wss://money8888-production.up.railway.app` - WebSocket подключение
- События: `getRooms`, `createRoom`, `joinRoomMeta`

## 🔗 Интеграция с клиентом

### Обновление URL в Next.js
```typescript
// next.config.cjs
env: {
  NEXT_PUBLIC_SOCKET_URL: 'https://money8888-production.up.railway.app',
  NEXT_PUBLIC_TELEGRAM_BOT: 'energy_m_bot',
}
```

### CORS настройки
Сервер настроен для работы с:
- `https://money8888-production.up.railway.app` (основное приложение)
- `https://money8888-production.up.railway.app` (сам сервер)

## 🤖 Telegram Bot

### Существующий бот
- **URL**: [https://money8888-production.up.railway.app](https://money8888-production.up.railway.app)
- **Bot**: [@energy_m_bot](https://t.me/energy_m_bot)

### Интеграция
Бот автоматически перенаправляет авторизацию на объединенный сервер.

## 📊 Мониторинг

### Логи
- Все события логируются в консоль Render.com
- WebSocket подключения отслеживаются
- Telegram авторизация логируется

### Метрики
- Количество активных токенов
- Количество комнат
- Время работы сервера

## 🚀 Деплой

```bash
# Запуск скрипта деплоя
./deploy-unified.sh

# Или вручную
git add .
git commit -m "Deploy unified server"
git push origin main
```

## ✅ Проверка работы

1. **Сервер**: https://money8888-production.up.railway.app/health
2. **Telegram**: Отправьте `/start` боту @energy_m_bot
3. **Socket.IO**: Подключение через клиент

## 🔧 Локальная разработка

```bash
cd server
npm install
node unified-server.js
```

Сервер будет доступен на `http://localhost:4000`
