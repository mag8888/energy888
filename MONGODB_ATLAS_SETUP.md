# Настройка MongoDB Atlas для Energy of Money

## Шаг 1: Создание аккаунта MongoDB Atlas

1. Перейдите на https://www.mongodb.com/atlas
2. Нажмите "Try Free" или "Start Free"
3. Зарегистрируйтесь или войдите в аккаунт

## Шаг 2: Создание кластера

1. Выберите "Build a Database"
2. Выберите "M0 Sandbox" (бесплатный план)
3. Выберите провайдера (AWS, Google Cloud, Azure)
4. Выберите регион (ближайший к вам)
5. Нажмите "Create"

## Шаг 3: Настройка доступа

### 3.1 Создание пользователя базы данных
1. В разделе "Database Access" нажмите "Add New Database User"
2. Выберите "Password" для аутентификации
3. Создайте пользователя:
   - Username: `energy888`
   - Password: `password123` (или свой пароль)
4. Выберите "Read and write to any database"
5. Нажмите "Add User"

### 3.2 Настройка сетевого доступа
1. В разделе "Network Access" нажмите "Add IP Address"
2. Выберите "Allow Access from Anywhere" (0.0.0.0/0)
3. Нажмите "Confirm"

## Шаг 4: Получение строки подключения

1. В разделе "Clusters" нажмите "Connect"
2. Выберите "Connect your application"
3. Выберите "Node.js" и версию "4.1 or later"
4. Скопируйте строку подключения

Пример строки подключения:
```
mongodb+srv://energy888:<password>@cluster0.xxxxx.mongodb.net/energy888?retryWrites=true&w=majority
```

## Шаг 5: Обновление конфигурации

Замените `<password>` в строке подключения на ваш пароль и обновите файл `render-mongodb.yaml`:

```yaml
envVars:
  - key: MONGODB_URI
    value: mongodb+srv://energy888:ВАШ_ПАРОЛЬ@cluster0.xxxxx.mongodb.net/energy888?retryWrites=true&w=majority
```

## Шаг 6: Деплой на Render

1. Зайдите в панель Render.com
2. Создайте новый Web Service
3. Подключите ваш GitHub репозиторий
4. Используйте файл `render-mongodb.yaml` как конфигурацию
5. Убедитесь, что все переменные окружения настроены
6. Задеплойте сервис

## Проверка работы

После деплоя проверьте:

1. **Статус сервера:**
   ```bash
   curl https://your-app-name.onrender.com/
   ```

2. **Статистика:**
   ```bash
   curl https://your-app-name.onrender.com/stats
   ```

3. **Зал славы:**
   ```bash
   curl https://your-app-name.onrender.com/hall-of-fame
   ```

## Безопасность

⚠️ **Важно:**
- Не используйте простые пароли в продакшене
- Ограничьте доступ по IP если возможно
- Регулярно обновляйте пароли
- Мониторьте использование ресурсов

## Мониторинг

В MongoDB Atlas вы можете:
- Отслеживать использование ресурсов
- Просматривать логи
- Настраивать алерты
- Создавать резервные копии

## Поддержка

Если возникли проблемы:
1. Проверьте логи в Render
2. Проверьте статус кластера в MongoDB Atlas
3. Убедитесь, что строка подключения правильная
4. Проверьте настройки сетевого доступа
