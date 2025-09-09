# Energy of Money - Rooms Module

Модуль системы комнат для игры "Energy of Money" с поддержкой MongoDB, Socket.IO и выбора профессий.

## 🚀 Возможности

- ✅ Создание и управление игровыми комнатами (2-10 игроков)
- ✅ Система выбора профессий (3 режима: random, choice, assigned)
- ✅ Персистентное хранение в MongoDB
- ✅ Real-time обновления через Socket.IO
- ✅ Автоматическая очистка неактивных комнат
- ✅ Статистика и мониторинг
- ✅ Зал славы игроков

## 📁 Структура модуля

```
modules/rooms/
├── controllers/          # Контроллеры
│   └── RoomController.ts
├── models/              # Модели MongoDB
│   ├── RoomModel.ts
│   └── HallOfFameModel.ts
├── services/            # Сервисы
│   └── DatabaseService.ts
├── types/               # TypeScript типы
│   └── index.ts
├── utils/               # Утилиты
│   ├── roomUtils.ts
│   └── professions.ts
├── index.ts             # Главный экспорт
├── package.json
└── tsconfig.json
```

## 🛠 Установка

```bash
cd modules/rooms
npm install
```

## 🔧 Использование

### Импорт модуля

```typescript
import { 
  RoomController, 
  DatabaseService, 
  PROFESSIONS, 
  ROOM_CONFIGS 
} from './modules/rooms/index.js';
```

### Создание контроллера

```typescript
const roomController = new RoomController();
```

### Создание комнаты

```typescript
const roomData = {
  name: 'Моя комната',
  maxPlayers: 6,
  timing: 120,
  playerName: 'Игрок',
  playerEmail: 'player@example.com',
  professionSelectionMode: 'choice',
  availableProfessions: ['entrepreneur', 'doctor', 'teacher'],
  assignProfessionToAll: false
};

const result = await roomController.createRoom(roomData);
if (result.success) {
  console.log('Комната создана:', result.room.id);
}
```

### Присоединение к комнате

```typescript
const joinData = {
  roomId: 'room_123',
  playerName: 'Новый игрок',
  playerEmail: 'newplayer@example.com'
};

const result = await roomController.joinRoom(joinData, socketId);
if (result.success) {
  console.log('Присоединились к комнате');
}
```

## 🎭 Система профессий

### Доступные профессии

- **Предприниматель** - создает бизнес, высокий доход
- **Врач** - стабильный доход, лечит людей
- **Учитель** - скромный но стабильный доход
- **Инженер** - технический доход, создает технологии
- **Художник** - творческий доход, нестабильный
- **Юрист** - высокий доход от консультаций
- **Ученый** - доход от исследований и грантов
- **Повар** - доход от ресторанного бизнеса
- **Музыкант** - доход от концертов и записей
- **Спортсмен** - доход от соревнований

### Режимы выбора профессий

1. **Random** - случайное назначение при присоединении
2. **Choice** - игроки выбирают из доступного списка
3. **Assigned** - все получают профессию создателя

## 🔌 Socket.IO Events

### Клиент → Сервер

- `get-rooms` - получить список комнат
- `create-room` - создать комнату
- `join-room` - присоединиться к комнате
- `select-profession` - выбрать профессию
- `confirm-profession` - подтвердить выбор
- `get-available-professions` - получить доступные профессии

### Сервер → Клиент

- `rooms-list` - список комнат
- `room-created` - комната создана
- `room-joined` - присоединились к комнате
- `room-updated` - комната обновлена
- `profession-selected` - профессия выбрана
- `profession-confirmed` - профессия подтверждена
- `available-professions` - доступные профессии

## 🗄️ База данных

### Модель Room

```typescript
interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  players: Map<string, Player>;
  professionSelectionMode: 'random' | 'choice' | 'assigned';
  availableProfessions: string[];
  // ... другие поля
}
```

### Модель Player

```typescript
interface Player {
  id: string;
  name: string;
  profession: string | null;
  selectedProfession: string | null;
  professionConfirmed: boolean;
  // ... другие поля
}
```

## 📊 API Endpoints

- `GET /` - статус сервера
- `GET /health` - проверка здоровья
- `GET /stats` - статистика сервера
- `GET /professions` - список профессий
- `GET /rooms` - список комнат

## ⚙️ Конфигурация

### Переменные окружения

```env
MONGODB_URI=mongodb://localhost:27017/energy888
PORT=4000
NODE_ENV=development
FRONT_ORIGIN=*
```

### Настройки комнат

```typescript
const ROOM_CONFIGS = {
  QUICK_GAME: {
    maxPlayers: 4,
    timing: 60,
    professionSelectionMode: 'random'
  },
  STRATEGIC_GAME: {
    maxPlayers: 6,
    timing: 180,
    professionSelectionMode: 'choice'
  }
};
```

## 🧪 Тестирование

```bash
npm test
```

## 📝 Логирование

Модуль выводит подробные логи:
- `✅` - успешные операции
- `❌` - ошибки
- `🔄` - обновления
- `🏠` - операции с комнатами
- `🎭` - выбор профессий

## 🚀 Развертывание

1. Установите MongoDB
2. Настройте переменные окружения
3. Запустите сервер:

```bash
node rooms-server.js
```

## 📈 Мониторинг

- Статистика через `/stats` endpoint
- Автоматическая очистка неактивных комнат
- Логирование всех операций
- Отслеживание производительности

## 🤝 Вклад в разработку

1. Форкните репозиторий
2. Создайте ветку для функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License
