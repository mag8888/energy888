# 🎯 Финальная настройка серверов - ПОШАГОВО

## ✅ Что уже готово:
- ✅ Код запушен на GitHub: `https://github.com/mag8888/energy888`
- ✅ Bot Server работает: `https://money8888-production.up.railway.app`
- ✅ Game App работает: `https://money8888-production.up.railway.app`
- ✅ Скрипт проверки создан: `./check-servers.sh`

## 🚀 ЧТО НУЖНО СДЕЛАТЬ:

### Шаг 1: Создать Unified Server на Render.com

1. **Зайдите на [https://render.com](https://render.com)**
2. **Нажмите "New +" → "Web Service"**
3. **Подключите репозиторий**: `https://github.com/mag8888/energy888`
4. **Настройте сервис**:
   - **Name**: `energy888-unified-server`
   - **Environment**: `Node`
   - **Plan**: `Free`
   - **Region**: `Oregon (US West)`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node unified-server.js`
   - **Health Check Path**: `/health`

5. **Добавьте Environment Variables**:
   ```
   NODE_ENV=production
   BOT_TOKEN=8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI
   PORT=10000
   ```

6. **Нажмите "Create Web Service"**

### Шаг 2: Дождитесь деплоя

- Деплой займет 2-3 минуты
- Следите за логами в Render Dashboard
- Дождитесь статуса "Live"

### Шаг 3: Проверьте Unified Server

После деплоя проверьте:
- **Статус**: https://money8888-production.up.railway.app/
- **Health**: https://money8888-production.up.railway.app/health
- **API**: https://money8888-production.up.railway.app/tg/new-token

### Шаг 4: Обновите Game App

1. **Зайдите в настройки `energy888` на Render.com**
2. **Добавьте Environment Variables**:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://money8888-production.up.railway.app
   NEXT_PUBLIC_TELEGRAM_BOT=energy_m_bot
   ```
3. **Нажмите "Manual Deploy" → "Deploy latest commit"**
4. **Дождитесь завершения сборки**

### Шаг 5: Проверьте работу

Запустите скрипт проверки:
```bash
./check-servers.sh
```

Все серверы должны показать ✅ OK

## 🧪 Тестирование

### 1. Проверка комнат
1. Откройте https://money8888-production.up.railway.app
2. Перейдите в "Комнаты"
3. Создайте тестовую комнату
4. Убедитесь, что комната появилась в списке

### 2. Проверка Telegram
1. Откройте https://t.me/energy_m_bot
2. Нажмите "Start"
3. Должен ответить приветствием

### 3. Проверка авторизации
1. В игре нажмите "Telegram"
2. Нажмите "Получить ссылку"
3. Скопируйте ссылку и откройте в Telegram
4. Нажмите "Start" в боте
5. Вернитесь в игру - должна произойти авторизация

## 🔧 Troubleshooting

### Проблема: Unified Server не запускается
**Решение**: Проверьте логи в Render Dashboard, убедитесь что все Environment Variables установлены

### Проблема: Комнаты не отображаются
**Решение**: Проверьте, что `NEXT_PUBLIC_SOCKET_URL` правильно настроен в Game App

### Проблема: Telegram авторизация не работает
**Решение**: Убедитесь, что бот и unified server используют один `BOT_TOKEN`

## 📊 Ожидаемый результат

После настройки:
- ✅ Комнаты создаются и отображаются
- ✅ Socket.IO подключение стабильно
- ✅ Telegram авторизация работает
- ✅ Все WebSocket ошибки исчезли
- ✅ Игра полностью функциональна

## 🎉 Готово!

После выполнения всех шагов у вас будет полностью рабочая система:
- **Bot Server**: Обработка Telegram команд
- **Unified Server**: Socket.IO + API для игры
- **Game App**: Next.js приложение с игрой

**Время настройки**: ~10 минут
**Сложность**: Простая (копирование настроек)

---
**Удачи с настройкой! 🚀**
