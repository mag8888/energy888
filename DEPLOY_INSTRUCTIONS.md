# 🚀 Инструкция по деплою на Railway

## 📋 Что нужно сделать

### 1. 🔄 Перезапустить деплой на Railway

1. Откройте панель Railway: https://railway.app/project/money8888
2. Перейдите на вкладку **Deployments**
3. Найдите последний деплой и нажмите **Redeploy**
4. Дождитесь завершения деплоя

### 2. 🔑 Настроить переменные окружения

В панели Railway:
1. Перейдите на вкладку **Variables**
2. Добавьте следующие переменные:

```bash
BOT_TOKEN=8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI
GAME_URL=https://money8888-production.up.railway.app/
WEBHOOK_URL=https://money8888-production.up.railway.app/webhook
PORT=3000
NODE_ENV=production
```

### 3. ✅ Проверить работу

После деплоя проверьте:

```bash
# Проверка основных endpoints
curl https://money8888-production.up.railway.app/health
curl https://money8888-production.up.railway.app/

# Проверка webhook
curl -X POST https://money8888-production.up.railway.app/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 4. 🤖 Настроить Telegram бота

1. Откройте бота: https://t.me/energy_m_bot
2. Нажмите `/start`
3. Проверьте, что бот отвечает

### 5. 🔗 Установить webhook

```bash
curl -X POST https://money8888-production.up.railway.app/setwebhook
```

## 🎯 Ожидаемый результат

После выполнения всех шагов:
- ✅ Главная страница доступна
- ✅ Health check работает
- ✅ Webhook принимает запросы
- ✅ Telegram бот отвечает
- ✅ Все ссылки работают корректно

## 🆘 Решение проблем

### Если webhook не работает
1. Убедитесь, что переменная `WEBHOOK_URL` настроена
2. Проверьте, что сервер запущен
3. Убедитесь, что порт 3000 доступен

### Если бот не отвечает
1. Проверьте `BOT_TOKEN` в переменных окружения
2. Убедитесь, что webhook установлен
3. Проверьте логи в Railway

### Если ссылки не работают
1. Проверьте `GAME_URL` в переменных окружения
2. Убедитесь, что игра доступна

## 📞 Поддержка

Если возникли проблемы:
- Проверьте логи в Railway
- Убедитесь, что все переменные настроены
- Обратитесь к @mag8888