# 🤖 Настройка Telegram Bot на Render.com

## 📋 **Текущий статус:**
- ✅ **Bot Server работает** - https://botenergy-7to1.onrender.com
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
- `WEBHOOK_URL` = `https://botenergy-7to1.onrender.com/webhook`

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
curl https://botenergy-7to1.onrender.com/health
```

### **2. Проверка Socket Server:**
```bash
curl https://energy888-1.onrender.com/health
```

### **3. Тестирование Telegram Bot:**
1. Откройте https://t.me/energy_m_bot
2. Отправьте `/start`
3. Бот должен ответить приветствием

## 🔗 **Полезные ссылки:**
- Bot Server: https://botenergy-7to1.onrender.com
- Socket Server: https://energy888-1.onrender.com
- Game App: https://energy888.onrender.com
- Telegram Bot: https://t.me/energy_m_bot
- Render Dashboard: https://dashboard.render.com

## 📝 **Следующие шаги:**
1. Обновите настройки на Render.com
2. Пересоберите серверы
3. Протестируйте бота
4. Проверьте работу комнат
