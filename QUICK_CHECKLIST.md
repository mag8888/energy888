# ✅ Быстрый чек-лист настройки

## 🎯 Unified Server на Render.com

### Создание сервиса:
- [ ] Открыть [https://render.com](https://render.com)
- [ ] New + → Web Service
- [ ] Подключить репозиторий `mag8888/energy888`
- [ ] Name: `energy888-unified-server`
- [ ] Environment: `Node`
- [ ] Plan: `Free`
- [ ] Build Command: `cd server && npm install`
- [ ] Start Command: `cd server && node unified-server.js`
- [ ] Health Check Path: `/health`

### Environment Variables:
- [ ] `NODE_ENV = production`
- [ ] `BOT_TOKEN = 8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI`
- [ ] `PORT = 10000`

### Проверка:
- [ ] Статус: https://money8888-production.up.railway.app/
- [ ] Health: https://money8888-production.up.railway.app/health
- [ ] API: https://money8888-production.up.railway.app/tg/new-token

## 🎮 Game App обновление

### Environment Variables:
- [ ] `NEXT_PUBLIC_SOCKET_URL = https://money8888-production.up.railway.app`
- [ ] `NEXT_PUBLIC_TELEGRAM_BOT = energy_m_bot`

### Пересборка:
- [ ] Manual Deploy → Deploy latest commit
- [ ] Дождаться завершения сборки

## 🧪 Финальная проверка

### Скрипт проверки:
- [ ] Запустить `./check-servers.sh`
- [ ] Все серверы должны показать ✅ OK

### Тестирование:
- [ ] Открыть https://money8888-production.up.railway.app
- [ ] Перейти в "Комнаты"
- [ ] Создать тестовую комнату
- [ ] Убедиться, что комната появилась

### Telegram:
- [ ] Открыть https://t.me/energy_m_bot
- [ ] Нажать "Start"
- [ ] Должен ответить приветствием

## 🎉 Результат

После выполнения всех пунктов:
- ✅ Комнаты работают
- ✅ Socket.IO подключение стабильно
- ✅ Telegram авторизация работает
- ✅ Все WebSocket ошибки исчезли

---
**Время: ~10 минут | Сложность: Простая**
