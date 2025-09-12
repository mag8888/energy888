# 🚀 Railway Deployment Guide

## Обзор
Проект Energy of Money настроен для деплоя на Railway с использованием Docker.

## Конфигурация

### Docker
- **Dockerfile**: Использует Node.js 18 Alpine
- **Порт**: 3000 (внутренний), Railway автоматически назначает внешний порт
- **Сборка**: `npm run build:minimal`
- **Запуск**: `npm start`

### Railway
- **Builder**: Docker
- **Health Check**: `/api/health`
- **Restart Policy**: on_failure с 3 попытками

## Локальный запуск

```bash
# Установка зависимостей
npm install

# Сборка проекта
npm run build:minimal

# Запуск сервера
npm start
```

## Деплой на Railway

1. Подключите GitHub репозиторий к Railway
2. Railway автоматически обнаружит Dockerfile
3. Деплой произойдет автоматически при push в main ветку

## Переменные окружения

Railway автоматически предоставляет:
- `PORT` - порт для приложения
- `NODE_ENV=production`

## Мониторинг

- **Health Check**: `https://your-app.railway.app/api/health`
- **Логи**: Доступны в Railway Dashboard
- **Метрики**: CPU, Memory, Network в реальном времени

## Устранение проблем

### Если деплой падает:
1. Проверьте логи в Railway Dashboard
2. Убедитесь, что Dockerfile корректен
3. Проверьте, что все зависимости установлены

### Если приложение не запускается:
1. Проверьте переменные окружения
2. Убедитесь, что порт 3000 доступен
3. Проверьте health check endpoint

## Структура проекта

```
game-ssr/
├── Dockerfile          # Docker конфигурация
├── railway.json        # Railway конфигурация
├── .dockerignore       # Игнорируемые файлы для Docker
├── package.json        # NPM конфигурация
└── src/               # Исходный код
```

## Технические детали

- **Node.js**: 18.x
- **Next.js**: 14.2.32
- **Material-UI**: 7.3.2
- **Framer Motion**: 12.23.12
- **Serve**: 14.2.1 (для статических файлов)

## Производительность

- **Memory**: Оптимизировано для 8GB RAM
- **Build Time**: ~2-3 минуты
- **Startup Time**: ~10-15 секунд
- **Bundle Size**: ~235KB (First Load JS)

## Безопасность

- Все зависимости проверены на уязвимости
- Используется только production режим
- Health check для мониторинга состояния