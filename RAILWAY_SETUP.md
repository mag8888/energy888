# 🚀 Настройка Railway для Energy of Money Bot

## 📋 Переменные окружения

В панели Railway нужно настроить следующие переменные:

### 🔑 Обязательные переменные

```bash
BOT_TOKEN=8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI
GAME_URL=https://money8888-production.up.railway.app/
WEBHOOK_URL=https://money8888-production.up.railway.app/webhook
```

### ⚙️ Дополнительные переменные

```bash
PORT=3000
NODE_ENV=production
```

## 🛠️ Шаги настройки

### 1. Откройте панель Railway
- Перейдите в проект `money8888`
- Откройте вкладку **Variables**

### 2. Добавьте переменные
Нажмите **+ New Variable** и добавьте каждую переменную:

| Переменная | Значение |
|------------|----------|
| `BOT_TOKEN` | `8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI` |
| `GAME_URL` | `https://money8888-production.up.railway.app/` |
| `WEBHOOK_URL` | `https://money8888-production.up.railway.app/webhook` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

### 3. Перезапустите деплой
После добавления переменных:
- Перейдите на вкладку **Deployments**
- Нажмите **Redeploy** для последнего деплоя

## 🔍 Проверка работы

### 1. Проверьте статус
```bash
curl https://money8888-production.up.railway.app/health
```

Ожидаемый ответ:
```json
{
  "status": "OK",
  "timestamp": "2024-09-14T08:30:00.000Z"
}
```

### 2. Проверьте бота
- Откройте https://t.me/energy_m_bot
- Нажмите `/start`
- Проверьте, что бот отвечает

### 3. Проверьте webhook
```bash
curl -X POST https://money8888-production.up.railway.app/setwebhook
```

## 🎯 Ожидаемый результат

После настройки:
- ✅ Бот отвечает на команды
- ✅ Webhook работает корректно
- ✅ Ссылки ведут на правильную игру
- ✅ Все API endpoints доступны

## 🆘 Решение проблем

### Бот не отвечает
1. Проверьте `BOT_TOKEN` в переменных окружения
2. Убедитесь, что webhook установлен: `/setwebhook`
3. Проверьте логи в Railway

### Webhook не работает
1. Проверьте `WEBHOOK_URL` - должен быть `https://money8888-production.up.railway.app/webhook`
2. Убедитесь, что сервер запущен
3. Проверьте, что порт 3000 доступен

### Ссылки не работают
1. Проверьте `GAME_URL` - должен быть `https://money8888-production.up.railway.app/`
2. Убедитесь, что игра доступна по ссылке

## 📞 Поддержка

Если возникли проблемы:
- Проверьте логи в Railway
- Убедитесь, что все переменные настроены
- Обратитесь к @mag8888
