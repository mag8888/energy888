# 🤖 Настройка Telegram Bot на Render.com

## 📋 **Текущий статус:**
- ✅ **Bot Server работает** - https://money8888-production.up.railway.app
- ❌ **Bot не отвечает** - нужно исправить настройки

## 🔧 **Исправления на Render.com:**

### **1. Bot Server (botenergy-7to1):**

**Build Command:**
```bash
cd server && npm install
```

**Start Command:**
```bash
cd server && node telegram-bot.js
```

**Environment Variables:**
- `BOT_TOKEN` = ваш токен бота
- `WEBHOOK_URL` = `https://money8888-production.up.railway.app/webhook`

### **2. Socket Server (energy888-1):**

**Build Command:**
```bash
cd server && cp package-socket.json package.json && npm install
```

**Start Command:**
```bash
cd server && node socket-server.js
```

**Environment Variables:**
- `NODE_ENV` = `production`
- `PORT` = `10000`

## 🧪 **Тестирование:**

### **1. Проверка Bot Server:**
```bash
curl https://money8888-production.up.railway.app/health
```

### **2. Проверка Socket Server:**
```bash
curl https://money8888-production.up.railway.app/health
```

### **3. Тестирование Telegram Bot:**
1. Откройте https://t.me/energy_m_bot
2. Отправьте `/start`
3. Бот должен ответить приветствием

## 🔗 **Полезные ссылки:**
- Bot Server: https://money8888-production.up.railway.app
- Socket Server: https://money8888-production.up.railway.app
- Game App: https://money8888-production.up.railway.app
- Telegram Bot: https://t.me/energy_m_bot
- Render Dashboard: https://dashboard.render.com

## 📝 **Следующие шаги:**
1. Обновите настройки на Render.com
2. Пересоберите серверы
3. Протестируйте бота
4. Проверьте работу комнат
