# 🚀 Инструкции по деплою объединенного сервера

## ✅ Готово к деплою!

Все файлы подготовлены и готовы для развертывания на Render.com.

## 📋 Пошаговая инструкция:

### 1. Запушить на GitHub
```bash
git add .
git commit -m "Deploy unified server with Telegram integration"
git push origin main
```

### 2. Создать Web Service на Render.com

1. Зайдите на [https://render.com](https://render.com)
2. Нажмите **"New +"** → **"Web Service"**
3. Подключите ваш GitHub репозиторий
4. Выберите репозиторий с проектом

### 3. Настройки деплоя

**Основные настройки:**
- **Name**: `energy888-unified-server`
- **Environment**: `Node`
- **Plan**: `Free`
- **Region**: `Oregon (US West)`

**Команды:**
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && node unified-server.js`

**Environment Variables:**
```
NODE_ENV=production
BOT_TOKEN=8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI
PORT=10000
```

**Health Check:**
- **Path**: `/health`

### 4. После деплоя

Сервер будет доступен по адресу:
`https://energy888-unified-server.onrender.com`

**Проверка работы:**
- Статус: `https://energy888-unified-server.onrender.com/`
- Health: `https://energy888-unified-server.onrender.com/health`
- Telegram токен: `https://energy888-unified-server.onrender.com/tg/new-token`

## 🔧 Что будет работать:

### ✅ Socket.IO
- Создание комнат
- Присоединение к комнатам
- Реальное время обновлений

### ✅ Telegram авторизация
- Создание токенов
- Авторизация через бота @energy_m_bot
- Интеграция с существующим ботом

### ✅ API Endpoints
- `GET /` - Статус сервера
- `GET /health` - Проверка здоровья
- `GET /tg/new-token` - Создание токена
- `GET /tg/poll` - Проверка статуса токена
- `POST /tg/authorize` - Авторизация

## 🎯 Результат

После деплоя:
1. **Комнаты будут отображаться** в браузере
2. **Telegram авторизация будет работать**
3. **Socket.IO подключение будет стабильным**
4. **Все ошибки WebSocket исчезнут**

## 📞 Поддержка

Если возникнут проблемы:
1. Проверьте логи в Render.com Dashboard
2. Убедитесь, что все Environment Variables установлены
3. Проверьте, что порт 10000 доступен

---
**Готово к деплою! 🚀**
