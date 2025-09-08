# 🚀 Полная настройка серверов Energy of Money

## 📋 Обзор архитектуры

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│  Unified Server      │◀───│  Bot Server     │
│  (game-ssr)     │    │  (Socket.IO + API)   │    │  (botEnergy)    │
│  Port: 3000     │    │  Port: 4000/10000    │    │  Port: 3001     │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
```

## 🎯 Серверы для настройки

### 1. ✅ Bot Server (УЖЕ РАБОТАЕТ)
- **URL**: https://botenergy-7to1.onrender.com
- **Bot**: [@energy_m_bot](https://t.me/energy_m_bot)
- **Статус**: ✅ Работает

### 2. 🔧 Unified Server (НУЖНО НАСТРОИТЬ)
- **URL**: https://energy888-unified-server.onrender.com
- **Назначение**: Socket.IO + Telegram API
- **Статус**: ⏳ Нужно создать

### 3. 🎮 Game App (УЖЕ РАБОТАЕТ)
- **URL**: https://energy888.onrender.com
- **Назначение**: Next.js приложение
- **Статус**: ✅ Работает

## 🔧 Настройка Unified Server на Render.com

### Шаг 1: Создание Web Service

1. Зайдите на [https://render.com](https://render.com)
2. Нажмите **"New +"** → **"Web Service"**
3. Подключите репозиторий: `https://github.com/mag8888/energy888`

### Шаг 2: Конфигурация

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

### Шаг 3: Проверка деплоя

После деплоя проверьте:
- **Статус**: https://energy888-unified-server.onrender.com/
- **Health**: https://energy888-unified-server.onrender.com/health
- **API**: https://energy888-unified-server.onrender.com/tg/new-token

## 🔗 Обновление Game App

### Шаг 1: Обновление Environment Variables

В настройках `energy888` на Render.com добавьте:
```
NEXT_PUBLIC_SOCKET_URL=https://energy888-unified-server.onrender.com
NEXT_PUBLIC_TELEGRAM_BOT=energy_m_bot
```

### Шаг 2: Пересборка

После добавления переменных:
1. Нажмите **"Manual Deploy"** → **"Deploy latest commit"**
2. Дождитесь завершения сборки

## 🧪 Тестирование

### 1. Проверка Unified Server
```bash
# Статус сервера
curl https://energy888-unified-server.onrender.com/

# Health check
curl https://energy888-unified-server.onrender.com/health

# Создание токена
curl https://energy888-unified-server.onrender.com/tg/new-token
```

### 2. Проверка Telegram Bot
1. Отправьте `/start` боту [@energy_m_bot](https://t.me/energy_m_bot)
2. Должен ответить приветствием

### 3. Проверка Game App
1. Откройте https://energy888.onrender.com
2. Перейдите в раздел "Комнаты"
3. Попробуйте создать комнату
4. Проверьте, что комнаты отображаются

## 🔧 Локальная разработка

### Запуск Unified Server
```bash
cd server
npm install
node unified-server.js
```

### Запуск Game App
```bash
cd game-ssr
npm install
npm run dev
```

## 📊 Мониторинг

### Логи Unified Server
- Render.com Dashboard → energy888-unified-server → Logs

### Логи Game App
- Render.com Dashboard → energy888 → Logs

### Логи Bot Server
- Render.com Dashboard → botenergy-7to1 → Logs

## 🚨 Troubleshooting

### Проблема: Комнаты не отображаются
**Решение**: Проверьте, что `NEXT_PUBLIC_SOCKET_URL` правильно настроен

### Проблема: Telegram авторизация не работает
**Решение**: Проверьте, что бот и unified server используют один `BOT_TOKEN`

### Проблема: WebSocket ошибки
**Решение**: Проверьте CORS настройки в unified server

## ✅ Чек-лист

- [ ] Unified Server создан на Render.com
- [ ] Environment Variables настроены
- [ ] Unified Server успешно деплоен
- [ ] Game App обновлен с новыми переменными
- [ ] Game App пересобран
- [ ] Telegram Bot работает
- [ ] Комнаты создаются и отображаются
- [ ] Socket.IO подключение стабильно

## 🎉 Результат

После настройки:
1. **Комнаты будут работать** через Socket.IO
2. **Telegram авторизация будет работать**
3. **Все ошибки WebSocket исчезнут**
4. **Игра будет полностью функциональна**

---
**Готово к настройке! 🚀**
