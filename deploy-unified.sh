#!/bin/bash

echo "🚀 Деплой объединенного сервера на Render.com..."

# Проверяем, что мы в правильной директории
if [ ! -f "server/unified-server.js" ]; then
    echo "❌ Файл server/unified-server.js не найден!"
    exit 1
fi

# Проверяем, что git инициализирован
if [ ! -d ".git" ]; then
    echo "📦 Инициализируем git репозиторий..."
    git init
    git add .
    git commit -m "Initial commit with unified server"
fi

# Добавляем все файлы
echo "📁 Добавляем файлы в git..."
git add .

# Коммитим изменения
echo "💾 Коммитим изменения..."
git commit -m "Deploy unified server with Telegram integration" || echo "Нет изменений для коммита"

# Проверяем статус
echo "📊 Статус git:"
git status

echo "✅ Готово! Теперь можно пушить на GitHub и деплоить на Render.com"
echo "🔗 Создайте новый Web Service на Render.com и подключите этот репозиторий"
echo "⚙️  Настройки деплоя:"
echo "   - Build Command: cd server && npm install"
echo "   - Start Command: cd server && node unified-server.js"
echo "   - Environment Variables:"
echo "     - NODE_ENV=production"
echo "     - BOT_TOKEN=8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI"
