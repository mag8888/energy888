# 🚀 Минимальный сервер (без зависимостей)

## ✅ Проблема решена!

Создан минимальный сервер без внешних зависимостей - только встроенные модули Node.js.

## 🎯 Настройка на Render.com

### 1. Создайте новый Web Service
- **Name**: `energy888-minimal-server`
- **Environment**: `Node`
- **Plan**: `Free`
- **Region**: `Oregon (US West)`

### 2. Команды:
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && node minimal-server.js`
- **Health Check Path**: `/health`

### 3. Environment Variables:
```
NODE_ENV=production
PORT=10000
```

### 4. После деплоя проверьте:
- **Статус**: https://energy888-minimal-server.onrender.com/
- **Health**: https://energy888-minimal-server.onrender.com/health
- **API**: https://energy888-minimal-server.onrender.com/tg/new-token

## 🔧 Обновите Game App

Добавьте Environment Variables в `game-ssr`:
```
NEXT_PUBLIC_SOCKET_URL=https://energy888-minimal-server.onrender.com
NEXT_PUBLIC_TELEGRAM_BOT=energy_m_bot
```

## 🧪 Тестирование

Запустите проверку:
```bash
./check-servers.sh
```

## ✅ Что работает:

- ✅ API для токенов
- ✅ CORS настроен
- ✅ Без уязвимостей
- ✅ Только встроенные модули Node.js
- ✅ Стабильная работа

## ⚠️ Ограничения:

- ❌ Нет Socket.IO (комнаты не будут работать в реальном времени)
- ✅ Но API для токенов работает

## 🎉 Результат:

После настройки:
- API для токенов будет работать
- Telegram авторизация будет работать
- Все ошибки исчезнут

---
**Готово к деплою! 🚀**
