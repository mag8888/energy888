# 🚀 Пошаговая настройка на Render.com

## 📋 Текущий статус:
- ✅ Bot Server: Работает
- ✅ Game App: Работает  
- ⏳ Unified Server: Нужно создать

## 🎯 Шаг 1: Создание Unified Server

### 1.1 Откройте Render.com
- Перейдите на [https://render.com](https://render.com)
- Войдите в свой аккаунт

### 1.2 Создайте новый Web Service
- Нажмите **"New +"** в правом верхнем углу
- Выберите **"Web Service"**

### 1.3 Подключите репозиторий
- Выберите **"Build and deploy from a Git repository"**
- Нажмите **"Connect account"** если GitHub не подключен
- Выберите репозиторий: **`mag8888/energy888`**

### 1.4 Настройте сервис
Заполните поля:

**Основные настройки:**
- **Name**: `energy888-unified-server`
- **Environment**: `Node`
- **Plan**: `Free`
- **Region**: `Oregon (US West)`

**Команды:**
- **Build Command**: `cd server && npm install`
- **Start Command**: `cd server && node unified-server.js`

**Health Check:**
- **Health Check Path**: `/health`

### 1.5 Добавьте Environment Variables
Нажмите **"Add Environment Variable"** и добавьте:

```
NODE_ENV = production
BOT_TOKEN = 8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI
PORT = 10000
```

### 1.6 Создайте сервис
- Нажмите **"Create Web Service"**
- Дождитесь завершения деплоя (2-3 минуты)

## 🎯 Шаг 2: Проверка Unified Server

### 2.1 Проверьте статус
После деплоя проверьте:
- **Статус**: https://energy888-unified-server.onrender.com/
- **Health**: https://energy888-unified-server.onrender.com/health
- **API**: https://energy888-unified-server.onrender.com/tg/new-token

### 2.2 Запустите проверку
```bash
./check-servers.sh
```

Должно показать:
```
🔧 Unified Server: ✅ Работает
```

## 🎯 Шаг 3: Обновление Game App

### 3.1 Откройте настройки Game App
- В Render Dashboard найдите сервис **`energy888`**
- Нажмите на него

### 3.2 Добавьте Environment Variables
Перейдите в раздел **"Environment"** и добавьте:

```
NEXT_PUBLIC_SOCKET_URL = https://energy888-unified-server.onrender.com
NEXT_PUBLIC_TELEGRAM_BOT = energy_m_bot
```

### 3.3 Пересоберите приложение
- Нажмите **"Manual Deploy"**
- Выберите **"Deploy latest commit"**
- Дождитесь завершения сборки

## 🎯 Шаг 4: Финальная проверка

### 4.1 Запустите полную проверку
```bash
./check-servers.sh
```

Все серверы должны показать ✅ OK

### 4.2 Протестируйте игру
1. Откройте https://energy888.onrender.com
2. Перейдите в "Комнаты"
3. Создайте тестовую комнату
4. Убедитесь, что комната появилась в списке

### 4.3 Протестируйте Telegram
1. Откройте https://t.me/energy_m_bot
2. Нажмите "Start"
3. Должен ответить приветствием

## ✅ Готово!

После выполнения всех шагов:
- ✅ Комнаты будут работать
- ✅ Socket.IO подключение стабильно
- ✅ Telegram авторизация работает
- ✅ Все WebSocket ошибки исчезли

## 🆘 Если что-то не работает

### Проблема: Unified Server не запускается
**Решение**: Проверьте логи в Render Dashboard, убедитесь что все Environment Variables установлены

### Проблема: Комнаты не отображаются
**Решение**: Проверьте, что `NEXT_PUBLIC_SOCKET_URL` правильно настроен в Game App

### Проблема: Telegram авторизация не работает
**Решение**: Убедитесь, что бот и unified server используют один `BOT_TOKEN`

---
**Время настройки: ~10 минут**
**Сложность: Простая**
