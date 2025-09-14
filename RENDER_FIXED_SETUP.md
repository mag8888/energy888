# 🔧 Исправленная настройка Render.com

## 📋 **Проблема решена:**
- ✅ **Создана правильная структура** для каждого сервера
- ✅ **Отдельные директории** для Bot Server и Socket Server
- ✅ **Правильные package.json** для каждого сервера

## 🚀 **Новые настройки для Render.com:**

### **1. Bot Server (botenergy-7to1):**

**Root Directory:** `bot-server`

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
- `BOT_TOKEN` = ваш токен бота
- `WEBHOOK_URL` = `https://money8888-production.up.railway.app/webhook`

### **2. Socket Server (energy888-1):**

**Root Directory:** `socket-server`

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
- `NODE_ENV` = `production`
- `PORT` = `10000`

### **3. Game App (energy888):**

**Root Directory:** `game-ssr`

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
- `NEXT_PUBLIC_SOCKET_URL` = `https://money8888-production.up.railway.app`
- `NEXT_PUBLIC_TELEGRAM_BOT` = `energy_m_bot`

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
1. **Обновите настройки на Render.com** с новыми Root Directory
2. **Пересоберите серверы**
3. **Протестируйте бота**
4. **Проверьте работу комнат**

## ⚠️ **Важно:**
- **Root Directory** должен быть указан правильно для каждого сервера
- **Build Command** теперь просто `npm install`
- **Start Command** теперь просто `npm start`



