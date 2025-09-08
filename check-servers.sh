#!/bin/bash

echo "🔍 Проверка всех серверов Energy of Money"
echo "========================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция проверки сервера
check_server() {
    local name=$1
    local url=$2
    local expected_status=$3
    
    echo -n "🔍 Проверяем $name ($url)... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK ($response)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL ($response)${NC}"
        return 1
    fi
}

# Функция проверки API
check_api() {
    local name=$1
    local url=$2
    local expected_key=$3
    
    echo -n "🔍 Проверяем API $name ($url)... "
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if echo "$response" | grep -q "$expected_key"; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "   Ответ: $response"
        return 1
    fi
}

echo ""
echo "📊 Проверка основных серверов:"
echo ""

# Проверка Bot Server
check_server "Bot Server" "https://botenergy-7to1.onrender.com" "200"
bot_status=$?

# Проверка Game App
check_server "Game App" "https://energy888.onrender.com" "200"
game_status=$?

# Проверка Socket Server (если уже создан)
check_server "Socket Server" "https://energy888-1.onrender.com" "200"
unified_status=$?

echo ""
echo "📊 Проверка API endpoints:"
echo ""

# Проверка Bot API
if [ $bot_status -eq 0 ]; then
    check_api "Bot Health" "https://botenergy-7to1.onrender.com/health" "OK"
fi

# Проверка Socket Server API (если доступен)
if [ $unified_status -eq 0 ]; then
    check_api "Socket Health" "https://energy888-1.onrender.com/health" "ok"
    check_api "Socket Token" "https://energy888-1.onrender.com/tg/new-token" "token"
fi

echo ""
echo "📋 Статус серверов:"
echo ""

if [ $bot_status -eq 0 ]; then
    echo -e "🤖 Bot Server: ${GREEN}✅ Работает${NC}"
else
    echo -e "🤖 Bot Server: ${RED}❌ Не работает${NC}"
fi

if [ $game_status -eq 0 ]; then
    echo -e "🎮 Game App: ${GREEN}✅ Работает${NC}"
else
    echo -e "🎮 Game App: ${RED}❌ Не работает${NC}"
fi

if [ $unified_status -eq 0 ]; then
    echo -e "🔧 Socket Server: ${GREEN}✅ Работает${NC}"
else
    echo -e "🔧 Socket Server: ${YELLOW}⏳ Нужно создать${NC}"
fi

echo ""
echo "📝 Следующие шаги:"

if [ $unified_status -ne 0 ]; then
    echo "1. Создайте Socket Server на Render.com"
    echo "   - Name: energy888-1"
    echo "   - Build: cd server && npm install"
    echo "   - Start: cd server && node socket-server.js"
    echo "   - Env: NODE_ENV=production, PORT=10000"
fi

if [ $game_status -eq 0 ] && [ $unified_status -eq 0 ]; then
    echo "2. Обновите Game App с новыми переменными:"
    echo "   - NEXT_PUBLIC_SOCKET_URL=https://energy888-1.onrender.com"
    echo "   - NEXT_PUBLIC_TELEGRAM_BOT=energy_m_bot"
    echo "3. Пересоберите Game App"
fi

echo ""
echo "🔗 Полезные ссылки:"
echo "   - Bot Server: https://botenergy-7to1.onrender.com"
echo "   - Game App: https://energy888.onrender.com"
echo "   - Socket Server: https://energy888-1.onrender.com"
echo "   - Telegram Bot: https://t.me/energy_m_bot"
echo "   - Render Dashboard: https://dashboard.render.com"
