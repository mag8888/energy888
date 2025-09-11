# 🚀 Railway Setup Instructions

## Шаг 1: Подготовка репозитория

1. Убедитесь, что все файлы закоммичены:
```bash
git add .
git commit -m "Railway deployment setup"
git push
```

## Шаг 2: Создание проекта на Railway

1. Перейдите на [Railway](https://railway.com/new)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите "Deploy from GitHub repo"
5. Выберите ваш репозиторий
6. **ВАЖНО**: Установите Root Directory как `server/`

## Шаг 3: Настройка переменных окружения

В панели Railway добавьте следующие переменные:

```bash
NODE_ENV=production
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/energy888
CORS_ORIGIN=https://your-frontend-domain.com
RAILWAY_ENVIRONMENT=production
```

## Шаг 4: Настройка домена

1. В настройках проекта найдите "Domains"
2. Railway автоматически создаст домен типа `https://your-project.railway.app`
3. Скопируйте этот URL для настройки CORS_ORIGIN

## Шаг 5: Обновление фронтенда

Обновите URL сервера в фронтенде:
```javascript
const SOCKET_URL = 'https://your-project.railway.app';
```

## Шаг 6: Мониторинг

1. Откройте вкладку "Deployments" для просмотра логов
2. Проверьте health check: `https://your-project.railway.app/health`
3. Следите за использованием ресурсов

## 🔧 Troubleshooting

### Проблема: Сервер не запускается
- Проверьте логи в Railway Dashboard
- Убедитесь, что все переменные окружения настроены
- Проверьте, что Root Directory установлен как `server/`

### Проблема: MongoDB не подключается
- Проверьте MONGODB_URI
- Убедитесь, что IP адрес Railway добавлен в whitelist MongoDB Atlas

### Проблема: CORS ошибки
- Обновите CORS_ORIGIN с правильным доменом фронтенда
- Проверьте, что фронтенд использует HTTPS

## 📊 Мониторинг ресурсов

Railway показывает:
- Использование RAM (должно быть < 512MB)
- CPU usage
- Network traffic
- Количество деплоев

## 💰 Управление кредитами

- Hobby Plan: $5/месяц (≈500 часов)
- Следите за расходом в Dashboard
- При необходимости переходите на Pro Plan

## 🚀 Готово!

После настройки ваш сервер будет доступен по адресу:
`https://your-project.railway.app`

Health check: `https://your-project.railway.app/health`
