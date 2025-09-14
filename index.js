const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

console.log('Starting server on port', PORT);

const html = `<!DOCTYPE html>
<html>
<head>
    <title>Energy of Money</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 0; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container { 
            background: white; 
            padding: 40px; 
            border-radius: 20px; 
            max-width: 800px; 
            margin: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
        }
        h1 { 
            color: #333; 
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        .status { 
            background: #4CAF50; 
            color: white; 
            padding: 15px 30px; 
            border-radius: 50px; 
            display: inline-block;
            margin-bottom: 30px;
            font-weight: bold;
        }
        .locations {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin: 30px 0;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        .location-btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 20px;
            border-radius: 15px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .location-btn:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .location-btn:active {
            transform: translateY(0);
        }
        .location-btn.active {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            transform: scale(1.05);
        }
        
        .location-btn[data-location="game"] {
            background: linear-gradient(45deg, #FF6B6B, #FF8E53);
            font-size: 18px;
            font-weight: bold;
        }
        
        .location-btn[data-location="game"]:hover {
            background: linear-gradient(45deg, #FF5252, #FF7043);
            transform: translateY(-8px) scale(1.05);
        }
        .location-content {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            min-height: 200px;
            display: none;
        }
        .location-content.active {
            display: block;
        }
        .location-title {
            font-size: 1.5em;
            color: #333;
            margin-bottom: 15px;
        }
        .location-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .location-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }
        .action-btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .action-btn:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            padding: 20px;
            background: #f0f0f0;
            border-radius: 10px;
        }
        .stat {
            text-align: center;
        }
        .stat-value {
            font-size: 1.5em;
            font-weight: bold;
            color: #333;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        .game-board-container {
            margin-top: 20px;
        }
        
        .game-controls {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .game-board {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            grid-template-rows: repeat(8, 1fr);
            gap: 2px;
            width: 100%;
            max-width: 600px;
            height: 600px;
            margin: 0 auto;
            border: 3px solid #333;
            border-radius: 10px;
            background: #f0f0f0;
            padding: 10px;
        }
        
        .game-cell {
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }
        
        .game-cell:hover {
            background: #e0e0e0;
            transform: scale(1.05);
        }
        
        .game-cell.start {
            background: #4CAF50;
            color: white;
        }
        
        .game-cell.income {
            background: #2196F3;
            color: white;
        }
        
        .game-cell.expense {
            background: #f44336;
            color: white;
        }
        
        .game-cell.investment {
            background: #FF9800;
            color: white;
        }
        
        .game-cell.opportunity {
            background: #9C27B0;
            color: white;
        }
        
        .game-cell.player {
            background: #FFD700;
            color: #333;
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
        }
        
        .game-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        
        .player-info, .game-status {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .player-stats div {
            margin: 5px 0;
            font-size: 14px;
        }
        
        .game-status div {
            margin: 5px 0;
            font-size: 14px;
        }
        
        #gameMessage {
            font-weight: bold;
            color: #333;
        }
        
        .dice-animation {
            animation: diceRoll 0.5s ease-in-out;
        }
        
        @keyframes diceRoll {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(90deg); }
            50% { transform: rotate(180deg); }
            75% { transform: rotate(270deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 600px) {
            .locations {
                grid-template-columns: 1fr;
            }
            .container {
                margin: 10px;
                padding: 20px;
            }
            .game-board {
                height: 400px;
                max-width: 400px;
            }
            .game-info {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Energy of Money</h1>
        <div class="status">✅ Server Running</div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value" id="money">$10,000</div>
                <div class="stat-label">Деньги</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="energy">100</div>
                <div class="stat-label">Энергия</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="level">1</div>
                <div class="stat-label">Уровень</div>
            </div>
        </div>
        
        <div class="locations">
            <button class="location-btn active" data-location="home" onclick="switchLocation('home')">
                🏠 Дом
            </button>
            <button class="location-btn" data-location="game" onclick="switchLocation('game')">
                🎲 Игра
            </button>
            <button class="location-btn" data-location="bank" onclick="switchLocation('bank')">
                🏦 Банк
            </button>
            <button class="location-btn" data-location="work" onclick="switchLocation('work')">
                💼 Работа
            </button>
            <button class="location-btn" data-location="market" onclick="switchLocation('market')">
                🛒 Рынок
            </button>
            <button class="location-btn" data-location="investments" onclick="switchLocation('investments')">
                📈 Инвестиции
            </button>
            <button class="location-btn" data-location="education" onclick="switchLocation('education')">
                🎓 Образование
            </button>
        </div>
        
        <div class="location-content active" id="home-content">
            <div class="location-title">🏠 Дом</div>
            <div class="location-description">
                Добро пожаловать в ваш дом! Здесь вы можете отдохнуть и восстановить энергию. 
                Это ваша база для планирования финансовых стратегий.
            </div>
            <div class="location-actions">
                <button class="action-btn" onclick="rest()">😴 Отдохнуть (+20 энергии)</button>
                <button class="action-btn" onclick="plan()">📋 Планировать</button>
            </div>
        </div>
        
        <div class="location-content" id="bank-content">
            <div class="location-title">🏦 Банк</div>
            <div class="location-description">
                В банке вы можете открыть депозиты, взять кредиты и управлять своими финансами. 
                Здесь хранятся ваши сбережения и можно получить консультации.
            </div>
            <div class="location-actions">
                <button class="action-btn" onclick="openDeposit()">💰 Открыть депозит</button>
                <button class="action-btn" onclick="takeLoan()">💳 Взять кредит</button>
                <button class="action-btn" onclick="checkBalance()">📊 Проверить баланс</button>
            </div>
        </div>
        
        <div class="location-content" id="market-content">
            <div class="location-title">🛒 Рынок</div>
            <div class="location-description">
                На рынке вы можете покупать и продавать активы, товары и услуги. 
                Здесь можно найти выгодные предложения и инвестиционные возможности.
            </div>
            <div class="location-actions">
                <button class="action-btn" onclick="buyAssets()">🛍️ Купить активы</button>
                <button class="action-btn" onclick="sellAssets()">💸 Продать активы</button>
                <button class="action-btn" onclick="bargain()">🤝 Торговаться</button>
            </div>
        </div>
        
        <div class="location-content" id="work-content">
            <div class="location-title">💼 Работа</div>
            <div class="location-description">
                На работе вы можете зарабатывать деньги, повышать квалификацию и строить карьеру. 
                Чем выше ваша квалификация, тем больше вы зарабатываете.
            </div>
            <div class="location-actions">
                <button class="action-btn" onclick="work()">⚡ Работать</button>
                <button class="action-btn" onclick="study()">📚 Учиться</button>
                <button class="action-btn" onclick="promotion()">⬆️ Продвижение</button>
            </div>
        </div>
        
        <div class="location-content" id="market-content">
            <div class="location-title">🛒 Рынок</div>
            <div class="location-description">
                На рынке вы можете покупать и продавать товары, находить выгодные предложения 
                и развивать свои торговые навыки.
            </div>
            <div class="location-actions">
                <button class="action-btn" onclick="buyGoods()">🛒 Покупать</button>
                <button class="action-btn" onclick="sellGoods()">💰 Продавать</button>
                <button class="action-btn" onclick="findDeals()">🔍 Искать сделки</button>
            </div>
        </div>
        
        <div class="location-content" id="investments-content">
            <div class="location-title">📈 Инвестиции</div>
            <div class="location-description">
                В разделе инвестиций вы можете вкладывать деньги в различные активы: 
                акции, облигации, недвижимость, криптовалюты и другие инструменты.
            </div>
            <div class="location-actions">
                <button class="action-btn" onclick="investStocks()">📊 Акции</button>
                <button class="action-btn" onclick="investRealEstate()">🏠 Недвижимость</button>
                <button class="action-btn" onclick="investCrypto()">₿ Криптовалюты</button>
            </div>
        </div>
        
        <div class="location-content" id="education-content">
            <div class="location-title">🎓 Образование</div>
            <div class="location-description">
                В образовательном центре вы можете изучать финансовую грамотность, 
                инвестирование, предпринимательство и другие важные навыки.
            </div>
            <div class="location-actions">
                <button class="action-btn" onclick="studyFinance()">💰 Финансы</button>
                <button class="action-btn" onclick="studyInvesting()">📈 Инвестиции</button>
                <button class="action-btn" onclick="studyBusiness()">🚀 Бизнес</button>
            </div>
        </div>
        
        <div class="location-content" id="game-content">
            <div class="location-title">🎲 Energy of Money - Игровая Доска</div>
            <div class="location-description">
                Добро пожаловать на игровую доску! Здесь вы можете играть в оригинальную игру 
                "Energy of Money" с полной механикой и интерактивностью.
            </div>
            
            <div class="game-board-container">
                <div class="game-controls">
                    <button class="action-btn" onclick="rollDice()">🎲 Бросить кубик</button>
                    <button class="action-btn" onclick="startNewGame()">🔄 Новая игра</button>
                    <button class="action-btn" onclick="showRules()">📋 Правила</button>
                </div>
                
                <div class="game-board" id="gameBoard">
                    <!-- Игровая доска будет создана динамически -->
                </div>
                
                <div class="game-info">
                    <div class="player-info">
                        <h3>Игрок 1</h3>
                        <div class="player-stats">
                            <div>💰 Деньги: $<span id="playerMoney">10000</span></div>
                            <div>⚡ Энергия: <span id="playerEnergy">100</span></div>
                            <div>📈 Уровень: <span id="playerLevel">1</span></div>
                        </div>
                    </div>
                    
                    <div class="game-status">
                        <div id="currentPlayer">Ход игрока 1</div>
                        <div id="diceResult">Бросьте кубик</div>
                        <div id="gameMessage">Добро пожаловать в игру!</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        socket.on('connect', () => console.log('Connected to server'));
        
        let currentLocation = 'home';
        let money = 10000;
        let energy = 100;
        let level = 1;
        
        // Игровые переменные
        let gameBoard = [];
        let playerPosition = 0;
        let gameStarted = false;
        let currentPlayer = 1;
        let diceValue = 0;
        
        function switchLocation(location) {
            // Убираем активный класс со всех кнопок и контента
            document.querySelectorAll('.location-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.location-content').forEach(content => content.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и контенту
            document.querySelector('[data-location="' + location + '"]').classList.add('active');
            document.getElementById(location + '-content').classList.add('active');
            
            currentLocation = location;
            console.log('Switched to location:', location);
            
            // Если переключились на игру, создаем доску
            if (location === 'game' && !gameStarted) {
                createGameBoard();
            }
            
            // Отправляем событие на сервер
            socket.emit('locationChange', { location: location });
        }
        
        function updateStats() {
            document.getElementById('money').textContent = '$' + money.toLocaleString();
            document.getElementById('energy').textContent = energy;
            document.getElementById('level').textContent = level;
        }
        
        // Действия для дома
        function rest() {
            energy = Math.min(100, energy + 20);
            updateStats();
            showMessage('Вы отдохнули и восстановили 20 энергии!');
        }
        
        function plan() {
            showMessage('Открыт план финансового развития...');
        }
        
        // Действия для банка
        function openDeposit() {
            if (money >= 1000) {
                money -= 1000;
                updateStats();
                showMessage('Депозит на $1000 открыт!');
            } else {
                showMessage('Недостаточно денег для открытия депозита!');
            }
        }
        
        function takeLoan() {
            money += 5000;
            updateStats();
            showMessage('Кредит на $5000 получен!');
        }
        
        function checkBalance() {
            showMessage('Ваш баланс: $' + money.toLocaleString());
        }
        
        // Действия для рынка
        function buyAssets() {
            if (money >= 500) {
                money -= 500;
                updateStats();
                showMessage('Активы на $500 куплены!');
            } else {
                showMessage('Недостаточно денег для покупки активов!');
            }
        }
        
        function sellAssets() {
            money += 300;
            updateStats();
            showMessage('Активы проданы за $300!');
        }
        
        function bargain() {
            showMessage('Торговля началась...');
        }
        
        // Действия для работы
        function work() {
            if (energy >= 10) {
                energy -= 10;
                money += 100;
                updateStats();
                showMessage('Вы поработали и заработали $100!');
            } else {
                showMessage('Недостаточно энергии для работы!');
            }
        }
        
        function study() {
            if (money >= 200) {
                money -= 200;
                level++;
                updateStats();
                showMessage('Вы изучили новый навык! Уровень повышен!');
            } else {
                showMessage('Недостаточно денег для обучения!');
            }
        }
        
        function promotion() {
            if (level >= 3) {
                showMessage('Поздравляем! Вы получили повышение!');
            } else {
                showMessage('Недостаточно уровня для повышения!');
            }
        }
        
        // Действия для инвестиций
        function investStocks() {
            if (money >= 1000) {
                money -= 1000;
                updateStats();
                showMessage('Инвестиция в акции на $1000!');
            } else {
                showMessage('Недостаточно денег для инвестиций!');
            }
        }
        
        function investRealEstate() {
            if (money >= 5000) {
                money -= 5000;
                updateStats();
                showMessage('Инвестиция в недвижимость на $5000!');
            } else {
                showMessage('Недостаточно денег для инвестиций!');
            }
        }
        
        function investCrypto() {
            if (money >= 500) {
                money -= 500;
                updateStats();
                showMessage('Инвестиция в криптовалюты на $500!');
            } else {
                showMessage('Недостаточно денег для инвестиций!');
            }
        }
        
        // Действия для образования
        function studyFinance() {
            if (money >= 300) {
                money -= 300;
                level++;
                updateStats();
                showMessage('Вы изучили основы финансов!');
            } else {
                showMessage('Недостаточно денег для обучения!');
            }
        }
        
        function studyInvesting() {
            if (money >= 400) {
                money -= 400;
                level++;
                updateStats();
                showMessage('Вы изучили основы инвестирования!');
            } else {
                showMessage('Недостаточно денег для обучения!');
            }
        }
        
        function studyBusiness() {
            if (money >= 500) {
                money -= 500;
                level++;
                updateStats();
                showMessage('Вы изучили основы бизнеса!');
            } else {
                showMessage('Недостаточно денег для обучения!');
            }
        }
        
        // Функции для рынка
        function buyGoods() {
            if (money >= 1000) {
                const cost = Math.floor(Math.random() * 500) + 500;
                money -= cost;
                energy -= 10;
                showMessage('Купили товары за $' + cost);
                updateStats();
            } else {
                showMessage('Недостаточно денег!');
            }
        }
        
        function sellGoods() {
            if (energy >= 15) {
                const profit = Math.floor(Math.random() * 800) + 200;
                money += profit;
                energy -= 15;
                showMessage('Продали товары! Получили $' + profit);
                updateStats();
            } else {
                showMessage('Недостаточно энергии!');
            }
        }
        
        function findDeals() {
            if (energy >= 25) {
                energy -= 25;
                const bonus = Math.floor(Math.random() * 1000) + 500;
                money += bonus;
                level += 1;
                showMessage('Нашли выгодную сделку! +$' + bonus + ', +1 уровень');
                updateStats();
            } else {
                showMessage('Недостаточно энергии!');
            }
        }
        
        function showMessage(message) {
            // Создаем временное уведомление
            const notification = document.createElement('div');
            notification.style.cssText = 
                'position: fixed;' +
                'top: 20px;' +
                'right: 20px;' +
                'background: #4CAF50;' +
                'color: white;' +
                'padding: 15px 20px;' +
                'border-radius: 10px;' +
                'box-shadow: 0 5px 15px rgba(0,0,0,0.3);' +
                'z-index: 1000;' +
                'animation: slideIn 0.3s ease;';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
        
        // Инициализация
        updateStats();
        
        // Обработка событий от сервера
        socket.on('gameUpdate', (data) => {
            if (data.money !== undefined) money = data.money;
            if (data.energy !== undefined) energy = data.energy;
            if (data.level !== undefined) level = data.level;
            updateStats();
        });
        
        socket.on('message', (data) => {
            showMessage(data.message);
        });
        
        // Игровые функции
        function createGameBoard() {
            const board = document.getElementById('gameBoard');
            board.innerHTML = '';
            
            // Создаем 8x8 сетку
            for (let i = 0; i < 64; i++) {
                const cell = document.createElement('div');
                cell.className = 'game-cell';
                cell.id = 'cell-' + i;
                cell.onclick = () => cellClick(i);
                
                // Определяем тип клетки
                if (i === 0) {
                    cell.className += ' start';
                    cell.innerHTML = '🏠<br>СТАРТ';
                } else if (i % 8 === 0) {
                    cell.className += ' income';
                    cell.innerHTML = '💰<br>ДОХОД';
                } else if (i % 8 === 1) {
                    cell.className += ' expense';
                    cell.innerHTML = '💸<br>РАСХОД';
                } else if (i % 8 === 2) {
                    cell.className += ' investment';
                    cell.innerHTML = '📈<br>ИНВЕСТ';
                } else if (i % 8 === 3) {
                    cell.className += ' opportunity';
                    cell.innerHTML = '🎯<br>ВОЗМОЖ';
                } else {
                    cell.innerHTML = i;
                }
                
                board.appendChild(cell);
            }
            
            // Размещаем игрока на старте
            updatePlayerPosition();
        }
        
        function cellClick(cellIndex) {
            if (!gameStarted) return;
            
            const cell = document.getElementById('cell-' + cellIndex);
            const cellType = getCellType(cellIndex);
            
            showMessage('Клетка ' + cellIndex + ': ' + cellType);
            handleCellAction(cellType, cellIndex);
        }
        
        function getCellType(cellIndex) {
            if (cellIndex === 0) return 'start';
            if (cellIndex % 8 === 0) return 'income';
            if (cellIndex % 8 === 1) return 'expense';
            if (cellIndex % 8 === 2) return 'investment';
            if (cellIndex % 8 === 3) return 'opportunity';
            return 'neutral';
        }
        
        function handleCellAction(cellType, cellIndex) {
            switch(cellType) {
                case 'start':
                    showMessage('Вы на старте! Получите бонус $1000!');
                    money += 1000;
                    break;
                case 'income':
                    const incomeAmount = Math.floor(Math.random() * 500) + 100;
                    showMessage('Доход! Получили $' + incomeAmount);
                    money += incomeAmount;
                    break;
                case 'expense':
                    const expenseAmount = Math.floor(Math.random() * 300) + 50;
                    showMessage('Расход! Потратили $' + expenseAmount);
                    money -= expenseAmount;
                    break;
                case 'investment':
                    const investAmount = Math.floor(Math.random() * 1000) + 200;
                    if (money >= investAmount) {
                        showMessage('Инвестиция! Потратили $' + investAmount);
                        money -= investAmount;
                        level++;
                    } else {
                        showMessage('Недостаточно денег для инвестиции!');
                    }
                    break;
                case 'opportunity':
                    const opportunityAmount = Math.floor(Math.random() * 2000) + 500;
                    showMessage('Возможность! Получили $' + opportunityAmount);
                    money += opportunityAmount;
                    break;
            }
            
            updateStats();
            updateGameStats();
        }
        
        function rollDice() {
            if (!gameStarted) {
                showMessage('Сначала начните новую игру!');
                return;
            }
            
            diceValue = Math.floor(Math.random() * 6) + 1;
            document.getElementById('diceResult').textContent = 'Выпало: ' + diceValue;
            document.getElementById('diceResult').classList.add('dice-animation');
            
            setTimeout(() => {
                document.getElementById('diceResult').classList.remove('dice-animation');
                movePlayer(diceValue);
            }, 500);
        }
        
        function movePlayer(steps) {
            const oldPosition = playerPosition;
            playerPosition = (playerPosition + steps) % 64;
            
            updatePlayerPosition();
            
            const cellType = getCellType(playerPosition);
            showMessage('Переместились на ' + steps + ' клеток! Клетка: ' + cellType);
            
            setTimeout(() => {
                handleCellAction(cellType, playerPosition);
            }, 1000);
        }
        
        function updatePlayerPosition() {
            // Убираем класс player со всех клеток
            document.querySelectorAll('.game-cell').forEach(cell => {
                cell.classList.remove('player');
            });
            
            // Добавляем класс player к текущей позиции
            const currentCell = document.getElementById('cell-' + playerPosition);
            if (currentCell) {
                currentCell.classList.add('player');
            }
        }
        
        function startNewGame() {
            gameStarted = true;
            playerPosition = 0;
            money = 10000;
            energy = 100;
            level = 1;
            
            createGameBoard();
            updateStats();
            updateGameStats();
            
            document.getElementById('gameMessage').textContent = 'Новая игра начата! Бросьте кубик!';
            showMessage('Новая игра начата! Удачи!');
        }
        
        function showRules() {
            const rules = 
                'ПРАВИЛА ИГРЫ:\n\n' +
                '1. Бросьте кубик, чтобы переместиться по доске\n' +
                '2. 🏠 СТАРТ - получите бонус $1000\n' +
                '3. 💰 ДОХОД - получите случайную сумму\n' +
                '4. 💸 РАСХОД - потратьте случайную сумму\n' +
                '5. 📈 ИНВЕСТ - инвестируйте и повысьте уровень\n' +
                '6. 🎯 ВОЗМОЖНОСТЬ - получите большой бонус\n' +
                '7. Цель: накопить как можно больше денег!';
            
            showMessage(rules);
        }
        
        function updateGameStats() {
            document.getElementById('playerMoney').textContent = money.toLocaleString();
            document.getElementById('playerEnergy').textContent = energy;
            document.getElementById('playerLevel').textContent = level;
            document.getElementById('currentPlayer').textContent = 'Ход игрока ' + currentPlayer;
        }
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
  } else if (req.url === '/webhook' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      console.log('Webhook received');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1>');
  }
});

const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.emit('welcome', { message: 'Welcome to Energy of Money!' });
  
  // Обработка смены локации
  socket.on('locationChange', (data) => {
    console.log('Location changed to:', data.location);
    socket.emit('message', { message: `Перешли в локацию: ${data.location}` });
  });
  
  // Обработка игровых действий
  socket.on('gameAction', (data) => {
    console.log('Game action:', data);
    socket.emit('message', { message: `Действие выполнено: ${data.action}` });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down');
  server.close(() => process.exit(0));
});