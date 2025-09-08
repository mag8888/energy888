# 🤖 Настройка Telegram авторизации

## 1. Установка переменных окружения

### Для разработки (локально):
```bash
# В корне проекта game-ssr
echo "BOT_TOKEN=8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI" > .env.local
echo "NEXT_PUBLIC_TELEGRAM_BOT=energy_m_bot" >> .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:3001" >> .env.local
```

### Для продакшена:
```bash
# На сервере (Render.com, Vercel, etc.)
export BOT_TOKEN=8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI
export NEXT_PUBLIC_TELEGRAM_BOT=energy_m_bot
export NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.com
```

## 2. Настройка бота в Telegram

### Шаг 1: Настроить домен
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду: `/setdomain`
3. Выберите бота: `@energy_m_bot`
4. Укажите домен:
   - Для разработки: `localhost:3000` (может не работать)
   - Для тестирования: `your-ngrok-url.ngrok.io`
   - Для продакшена: `yourdomain.com`

### Шаг 2: Настроить команды бота
```
/setcommands
@energy_m_bot
start - Начать игру Energy of Money
help - Помощь по игре
```

### Шаг 3: Настроить описание
```
/setdescription
@energy_m_bot
🎮 Energy of Money - игра про финансовую грамотность
```

## 3. Тестирование

### Локальное тестирование:
1. Установите переменные окружения
2. Запустите сервер: `npm run dev`
3. Откройте: `http://localhost:3000/auth`
4. Перейдите на вкладку "Telegram"
5. Нажмите кнопку "Войти через Telegram"

### С ngrok (для тестирования домена):
1. Установите ngrok: `npm install -g ngrok`
2. Запустите: `ngrok http 3000`
3. Скопируйте URL (например: `https://abc123.ngrok.io`)
4. Настройте этот URL в @BotFather
5. Протестируйте авторизацию

## 4. Проверка работы

### В консоли браузера должно появиться:
```javascript
// При успешной авторизации
onTelegramAuth({
  id: "123456789",
  first_name: "Имя",
  last_name: "Фамилия", 
  username: "username",
  photo_url: "https://...",
  auth_date: "1234567890",
  hash: "abc123..."
})
```

### В логах сервера:
```
POST /api/tg-verify - 200 OK
Telegram auth successful for user: username
```

## 5. Возможные проблемы

### Проблема: "Invalid hash"
- **Причина**: Неправильный BOT_TOKEN или домен
- **Решение**: Проверить переменные окружения и настройки бота

### Проблема: "BOT_TOKEN not configured"
- **Причина**: Переменная окружения не установлена
- **Решение**: Установить BOT_TOKEN в .env.local

### Проблема: Виджет не загружается
- **Причина**: Неправильный домен в настройках бота
- **Решение**: Настроить правильный домен в @BotFather

### Проблема: "Unauthorized" на сервере
- **Причина**: Неправильный токен в заголовке
- **Решение**: Проверить настройки сервера

## 6. Готовые команды

### Установка переменных (macOS/Linux):
```bash
cd game-ssr
echo "BOT_TOKEN=8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI" > .env.local
echo "NEXT_PUBLIC_TELEGRAM_BOT=energy_m_bot" >> .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:3001" >> .env.local
```

### Установка переменных (Windows):
```cmd
cd game-ssr
echo BOT_TOKEN=8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI > .env.local
echo NEXT_PUBLIC_TELEGRAM_BOT=energy_m_bot >> .env.local
echo NEXT_PUBLIC_SOCKET_URL=http://localhost:3001 >> .env.local
```

### Запуск с ngrok:
```bash
# Терминал 1
npm run dev

# Терминал 2  
ngrok http 3000
# Скопировать URL и настроить в @BotFather
```

## ✅ Статус: Готово к настройке!

Все компоненты для Telegram авторизации реализованы. Нужно только установить переменные окружения и настроить домен в @BotFather.
