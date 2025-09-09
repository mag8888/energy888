# Конфигурация профессий для Energy of Money

## Список доступных профессий

### Основные профессии
```javascript
const PROFESSIONS = [
  {
    id: 'entrepreneur',
    name: 'Предприниматель',
    description: 'Создает бизнес, получает доходы от инвестиций',
    startingMoney: 100000,
    monthlyIncome: 50000,
    specialAbilities: ['business_creation', 'investment_bonus']
  },
  {
    id: 'doctor',
    name: 'Врач',
    description: 'Лечит людей, стабильный доход',
    startingMoney: 80000,
    monthlyIncome: 40000,
    specialAbilities: ['healing', 'stable_income']
  },
  {
    id: 'teacher',
    name: 'Учитель',
    description: 'Обучает детей, скромный но стабильный доход',
    startingMoney: 50000,
    monthlyIncome: 25000,
    specialAbilities: ['education_bonus', 'stable_income']
  },
  {
    id: 'engineer',
    name: 'Инженер',
    description: 'Создает технологии, высокий технический доход',
    startingMoney: 70000,
    monthlyIncome: 35000,
    specialAbilities: ['tech_creation', 'efficiency_bonus']
  },
  {
    id: 'artist',
    name: 'Художник',
    description: 'Создает искусство, нестабильный но творческий доход',
    startingMoney: 30000,
    monthlyIncome: 20000,
    specialAbilities: ['creativity_bonus', 'art_sales']
  },
  {
    id: 'lawyer',
    name: 'Юрист',
    description: 'Защищает права, высокий доход от консультаций',
    startingMoney: 90000,
    monthlyIncome: 45000,
    specialAbilities: ['legal_protection', 'consultation_bonus']
  },
  {
    id: 'scientist',
    name: 'Ученый',
    description: 'Проводит исследования, получает гранты',
    startingMoney: 60000,
    monthlyIncome: 30000,
    specialAbilities: ['research_bonus', 'grant_opportunities']
  },
  {
    id: 'chef',
    name: 'Повар',
    description: 'Готовит еду, доход от ресторанного бизнеса',
    startingMoney: 40000,
    monthlyIncome: 25000,
    specialAbilities: ['food_business', 'hospitality_bonus']
  },
  {
    id: 'musician',
    name: 'Музыкант',
    description: 'Создает музыку, доход от концертов и записей',
    startingMoney: 35000,
    monthlyIncome: 20000,
    specialAbilities: ['music_creation', 'performance_bonus']
  },
  {
    id: 'athlete',
    name: 'Спортсмен',
    description: 'Занимается спортом, доход от соревнований',
    startingMoney: 60000,
    monthlyIncome: 30000,
    specialAbilities: ['sports_bonus', 'competition_prizes']
  }
];
```

## Режимы выбора профессий

### 1. Random (Случайный)
- Профессии назначаются случайно при присоединении к комнате
- Каждый игрок получает уникальную профессию
- Не требует взаимодействия от игроков

### 2. Choice (Выбор)
- Игроки выбирают профессии из доступного списка
- Профессии должны быть уникальными в комнате
- Требует UI для выбора профессий
- Таймер для выбора (например, 2 минуты)

### 3. Assigned (Назначенные)
- Все игроки получают профессию создателя комнаты
- Создатель выбирает профессию при создании комнаты
- Простой режим без выбора

## Конфигурация комнаты

### Пример создания комнаты с выбором профессий
```javascript
const roomData = {
  name: 'Комната с выбором профессий',
  maxPlayers: 6,
  timing: 120,
  professionSelectionMode: 'choice',
  availableProfessions: [
    'entrepreneur',
    'doctor', 
    'teacher',
    'engineer',
    'artist',
    'lawyer'
  ],
  assignProfessionToAll: false
};
```

### Пример создания комнаты со случайными профессиями
```javascript
const roomData = {
  name: 'Комната со случайными профессиями',
  maxPlayers: 8,
  timing: 90,
  professionSelectionMode: 'random',
  availableProfessions: PROFESSIONS.map(p => p.id),
  assignProfessionToAll: false
};
```

### Пример создания комнаты с назначенной профессией
```javascript
const roomData = {
  name: 'Комната предпринимателей',
  maxPlayers: 4,
  timing: 150,
  professionSelectionMode: 'assigned',
  availableProfessions: ['entrepreneur'],
  assignProfessionToAll: true,
  creatorProfession: 'entrepreneur'
};
```

## Валидация выбора профессий

### Правила валидации
1. **Уникальность**: В режиме "choice" каждая профессия может быть выбрана только одним игроком
2. **Доступность**: Профессия должна быть в списке доступных для комнаты
3. **Подтверждение**: Игрок должен подтвердить выбор профессии
4. **Таймаут**: Если игрок не выбрал профессию в течение времени, назначается случайная

### Коды ошибок
```javascript
const PROFESSION_ERRORS = {
  PROFESSION_NOT_AVAILABLE: 'PROFESSION_NOT_AVAILABLE',
  PROFESSION_ALREADY_TAKEN: 'PROFESSION_ALREADY_TAKEN',
  INVALID_SELECTION_MODE: 'INVALID_SELECTION_MODE',
  SELECTION_TIMEOUT: 'SELECTION_TIMEOUT',
  PLAYER_NOT_IN_ROOM: 'PLAYER_NOT_IN_ROOM',
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND'
};
```

## UI Компоненты

### Компонент выбора профессии
```jsx
const ProfessionSelector = ({ 
  availableProfessions, 
  selectedProfession, 
  onSelect, 
  onConfirm,
  timeLeft 
}) => {
  return (
    <div className="profession-selector">
      <h3>Выберите профессию</h3>
      <div className="professions-grid">
        {availableProfessions.map(profession => (
          <ProfessionCard
            key={profession.id}
            profession={profession}
            isSelected={selectedProfession === profession.id}
            onSelect={() => onSelect(profession.id)}
          />
        ))}
      </div>
      {selectedProfession && (
        <button onClick={onConfirm}>
          Подтвердить выбор
        </button>
      )}
      <div className="timer">
        Осталось времени: {timeLeft}с
      </div>
    </div>
  );
};
```

### Компонент карточки профессии
```jsx
const ProfessionCard = ({ 
  profession, 
  isSelected, 
  onSelect 
}) => {
  return (
    <div 
      className={`profession-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <h4>{profession.name}</h4>
      <p>{profession.description}</p>
      <div className="stats">
        <span>Стартовый капитал: {profession.startingMoney}₽</span>
        <span>Доход: {profession.monthlyIncome}₽/мес</span>
      </div>
    </div>
  );
};
```

## Интеграция с игрой

### Присвоение профессии игроку
```javascript
const assignProfessionToPlayer = (player, profession) => {
  player.profession = profession.id;
  player.startingMoney = profession.startingMoney;
  player.monthlyIncome = profession.monthlyIncome;
  player.specialAbilities = profession.specialAbilities;
  player.professionConfirmed = true;
  
  // Применяем специальные способности
  applySpecialAbilities(player, profession.specialAbilities);
};
```

### Проверка готовности к игре
```javascript
const isRoomReadyToStart = (room) => {
  const allPlayersHaveProfessions = room.players.every(player => 
    player.profession && player.professionConfirmed
  );
  
  const hasMinimumPlayers = room.players.length >= 2;
  
  return allPlayersHaveProfessions && hasMinimumPlayers;
};
```

## Настройки по умолчанию

### Конфигурация для разных типов комнат
```javascript
const ROOM_CONFIGS = {
  QUICK_GAME: {
    maxPlayers: 4,
    timing: 60,
    professionSelectionMode: 'random',
    selectionTimeout: 30 // секунд
  },
  STRATEGIC_GAME: {
    maxPlayers: 6,
    timing: 180,
    professionSelectionMode: 'choice',
    selectionTimeout: 120 // секунд
  },
  CASUAL_GAME: {
    maxPlayers: 8,
    timing: 90,
    professionSelectionMode: 'assigned',
    selectionTimeout: 0 // мгновенно
  }
};
```

## Мониторинг выбора профессий

### Метрики для отслеживания
- Время выбора профессии игроками
- Популярность различных профессий
- Частота использования разных режимов выбора
- Количество ошибок при выборе профессий
- Процент успешных выборов профессий

### Логирование
```javascript
const logProfessionSelection = (roomId, playerId, profession, mode, timeSpent) => {
  console.log(`Profession selected:`, {
    roomId,
    playerId,
    profession,
    mode,
    timeSpent,
    timestamp: new Date().toISOString()
  });
};
```
