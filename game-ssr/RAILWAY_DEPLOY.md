# Railway Deploy Instructions

## Переменные окружения для Railway:

```
NEXT_PUBLIC_SOCKET_URL=https://botenergy-7to1-production.up.railway.app
PORT=3000
```

## Шаги деплоя:

1. Перейдите на https://railway.com
2. Нажмите "Deploy from GitHub Repo"
3. Выберите репозиторий `mag8888/energy888`
4. Установите Root Directory как `game-ssr/`
5. Добавьте переменные окружения:
   - `NEXT_PUBLIC_SOCKET_URL` = `https://botenergy-7to1-production.up.railway.app`
   - `PORT` = `3000`
6. Нажмите Deploy

## После деплоя:

- Получите публичный URL от Railway
- Фронтенд будет доступен по этому URL
- Socket.IO подключение настроено автоматически
