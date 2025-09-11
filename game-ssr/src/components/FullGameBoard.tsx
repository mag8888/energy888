import React, { useState, useEffect } from 'react';
import BankModule from './bank-module/src/BankModule';
// import type { Transaction } from './bank-module/src/BankModule';

interface Transaction {
  id: string;
  type: 'initial' | 'transfer' | 'received' | 'expense' | 'credit' | 'payday' | 'charity';
  amount: number;
  description: string;
  timestamp: string;
  from: string;
  to: string;
  status: 'completed' | 'pending' | 'failed';
  balanceAfter: number;
}

interface Player {
  id: string;
  name: string;
  position?: number;
  money?: number;
  isReady: boolean;
  profession?: string;
  dream?: string;
  socketId?: string;
}


interface FullGameBoardProps {
  players: Player[];
  currentPlayer?: Player;
  currentIndex?: number;
  onRollDice: () => void;
  onBuyCard: (cardId: string, price: number) => void;
  onGetGameState: () => void;
  isMyTurn: boolean;
}

// 24 внутренние клетки
const INNER_CELLS = [
  { id: 1, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 2, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️' },
  { id: 3, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 4, type: 'charity', name: 'Благотворительность', color: '#F97316', icon: '❤️' },
  { id: 5, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 6, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰' },
  { id: 7, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 8, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪' },
  { id: 9, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 10, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️' },
  { id: 11, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 12, type: 'child', name: 'Ребенок', color: '#A855F7', icon: '👶' },
  { id: 13, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 14, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰' },
  { id: 15, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 16, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪' },
  { id: 17, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 18, type: 'expenses', name: 'Всякая всячина', color: '#EC4899', icon: '🛍️' },
  { id: 19, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 20, type: 'loss', name: 'Потеря', color: '#18181B', icon: '💸' },
  { id: 21, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 22, type: 'payday', name: 'PayDay', color: '#EAB308', icon: '💰' },
  { id: 23, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 24, type: 'market', name: 'Рынок', color: '#06B6D4', icon: '🏪' }
];

// 52 внешние клетки (детальные)
const OUTER_CELLS = [
  // Верхний ряд (1-14)
  { id: 1, type: 'start', name: 'СТАРТ', color: '#FFD700', icon: '🏁' },
  { id: 2, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 3, type: 'business', name: 'Кофейня', color: '#4CAF50', icon: '☕', cost: 100000, income: 3000, description: 'Кофейня в центре города' },
  { id: 4, type: 'loss', name: 'Аудит', color: '#8B0000', icon: '📊', loss: '50% активов', description: 'Неожиданные расходы на аудит' },
  { id: 5, type: 'business', name: 'СПА-центр', color: '#4CAF50', icon: '🧘', cost: 270000, income: 5000, description: 'Центр здоровья и спа' },
  { id: 6, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 7, type: 'business', name: 'Мобильное приложение', color: '#4CAF50', icon: '📱', cost: 420000, income: 10000, description: 'Мобильное приложение (подписка)' },
  { id: 8, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 9, type: 'business', name: 'Маркетинг', color: '#4CAF50', icon: '📈', cost: 160000, income: 4000, description: 'Агентство цифрового маркетинга' },
  { id: 10, type: 'loss', name: 'Кража', color: '#8B0000', icon: '💰', loss: '100% наличных', description: 'Кража 100% наличных' },
  { id: 11, type: 'business', name: 'Мини-отель', color: '#4CAF50', icon: '🏨', cost: 200000, income: 5000, description: 'Мини-отель/бутик-гостиница' },
  { id: 12, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 13, type: 'business', name: 'Франшиза ресторана', color: '#4CAF50', icon: '🍽️', cost: 320000, income: 8000, description: 'Франшиза популярного ресторана' },
  { id: 14, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  
  // Правый столбец (15-26)
  { id: 15, type: 'business', name: 'Йога-центр', color: '#4CAF50', icon: '🧘‍♀️', cost: 170000, income: 4500, description: 'Йога- и медитационный центр' },
  { id: 16, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 17, type: 'business', name: 'Салон красоты', color: '#4CAF50', icon: '💄', cost: 500000, income: 15000, description: 'Салон красоты/барбершоп' },
  { id: 18, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 19, type: 'business', name: 'Автомойки', color: '#4CAF50', icon: '🚗', cost: 120000, income: 3000, description: 'Сеть автомоек самообслуживания' },
  { id: 20, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 21, type: 'business', name: 'Ретрит-центр', color: '#4CAF50', icon: '🏔️', cost: 500000, income: 0, description: 'Построить ретрит-центр' },
  { id: 22, type: 'loss', name: 'Развод', color: '#8B0000', icon: '💔', loss: '50% активов', description: 'Неожиданные расходы на развод' },
  { id: 23, type: 'business', name: 'Автомойки 2', color: '#4CAF50', icon: '🚗', cost: 120000, income: 3500, description: 'Сеть автомоек самообслуживания' },
  { id: 24, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 25, type: 'business', name: 'Кругосветное плавание', color: '#4CAF50', icon: '⛵', cost: 300000, income: 0, description: 'Кругосветное плавание на паруснике' },
  { id: 26, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  
  // Нижний ряд (27-40)
  { id: 27, type: 'business', name: 'Частный самолёт', color: '#4CAF50', icon: '✈️', cost: 1000000, income: 0, description: 'Купить частный самолёт' },
  { id: 28, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 29, type: 'business', name: 'Лидер мнений', color: '#4CAF50', icon: '👑', cost: 1000000, income: 0, description: 'Стать мировым лидером мнений' },
  { id: 30, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 31, type: 'business', name: 'Биржа', color: '#4CAF50', icon: '📊', cost: 50000, income: 500000, description: 'Биржа (с бонусом при 5-6)', special: 'Бонус при выпадении 5-6' },
  { id: 32, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 33, type: 'business', name: 'Фильм', color: '#4CAF50', icon: '🎬', cost: 500000, income: 0, description: 'Снять полнометражный фильм' },
  { id: 34, type: 'loss', name: 'Рейдерский захват', color: '#8B0000', icon: '⚔️', loss: 'Бизнес с крупным доходом', description: 'Рейдерский захват - потеря бизнеса' },
  { id: 35, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 36, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 37, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 38, type: 'business', name: 'Франшиза "Поток"', color: '#4CAF50', icon: '🎲', cost: 100000, income: 10000, description: 'Франшиза "поток денег"' },
  { id: 39, type: 'loss', name: 'Санкции', color: '#8B0000', icon: '🚫', loss: 'Все банковские счета', description: 'Санкции заблокировали все счета' },
  { id: 40, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  
  // Левый столбец (41-52)
  { id: 41, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 42, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 43, type: 'business', name: 'Пекарня', color: '#4CAF50', icon: '🥖', cost: 300000, income: 7000, description: 'Пекарня с доставкой' },
  { id: 44, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 45, type: 'business', name: 'Онлайн-образование', color: '#4CAF50', icon: '🎓', cost: 200000, income: 5000, description: 'Онлайн-образовательная платформа' },
  { id: 46, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 47, type: 'business', name: 'Фитнес-студии', color: '#4CAF50', icon: '💪', cost: 750000, income: 20000, description: 'Сеть фитнес-студий' },
  { id: 48, type: 'business', name: 'Кругосветное путешествие', color: '#4CAF50', icon: '🌍', cost: 300000, income: 0, description: 'Кругосветное путешествие' },
  { id: 49, type: 'business', name: 'Коворкинг', color: '#4CAF50', icon: '🏢', cost: 500000, income: 10000, description: 'Коворкинг-пространство' },
  { id: 50, type: 'charity', name: 'Благотворительность', color: '#FF69B4', icon: '❤️', description: 'Поделитесь с теми, кто нуждается' },
  { id: 51, type: 'opportunity', name: 'Возможность', color: '#10B981', icon: '🎯' },
  { id: 52, type: 'payday', name: 'Зарплата', color: '#FFD700', icon: '💰', description: 'Получите зарплату' }
];

const FullGameBoard: React.FC<FullGameBoardProps> = ({
  players,
  currentPlayer,
  currentIndex,
  onRollDice,
  onBuyCard,
  onGetGameState,
  isMyTurn
}) => {
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showAssets, setShowAssets] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 минуты в секундах
  const [hasRolled, setHasRolled] = useState(false);
  const [rollTime, setRollTime] = useState(0);
  
  // Состояния для системы ходов
  const [gameStarted, setGameStarted] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [shuffleTime, setShuffleTime] = useState(10);
  const [turnOrder, setTurnOrder] = useState<Player[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [playerPositions, setPlayerPositions] = useState<{[key: string]: number}>({});
  const [isMoving, setIsMoving] = useState(false);
  const [canPassTurn, setCanPassTurn] = useState(false);
  
  // Состояния для попапа клетки
  const [selectedCell, setSelectedCell] = useState<any>(null);
  const [showCellPopup, setShowCellPopup] = useState(false);

  // Адаптивные размеры
  const getBoardSize = () => {
    if (typeof window === 'undefined') return 800;
    if (window.innerWidth < 768) return Math.min(window.innerWidth * 0.9, 400);
    if (window.innerWidth < 1024) return 600;
    return 800;
  };

  const getScale = () => {
    const boardSize = getBoardSize();
    return boardSize / 800; // Базовый размер 800px
  };

  const boardSize = getBoardSize();
  const scale = getScale();

  // Функция для перемешивания игроков
  const shufflePlayers = (players: Player[]) => {
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Функция для получения текущего игрока
  const getCurrentPlayer = () => {
    if (turnOrder.length === 0) return null;
    return turnOrder[currentTurnIndex];
  };

  // Функция для перехода к следующему ходу
  const nextTurn = () => {
    setCurrentTurnIndex((prev) => (prev + 1) % turnOrder.length);
    setHasRolled(false);
    setCanPassTurn(false);
    setTimeLeft(120); // Сброс таймера
  };

  // Функция для движения фишки
  const movePlayerPiece = async (playerId: string, steps: number) => {
    setIsMoving(true);
    const currentPosition = playerPositions[playerId] || 0;
    
    for (let i = 1; i <= steps; i++) {
      const newPosition = (currentPosition + i) % 24; // 24 внутренние клетки
      setPlayerPositions(prev => ({
        ...prev,
        [playerId]: newPosition
      }));
      
      // Задержка 0.5 секунды на клетку
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsMoving(false);
  };

  // Функция для начала игры
  const startGame = () => {
    setGameStarted(true);
    setShuffling(true);
    setShuffleTime(10);
    
    // Перемешиваем игроков
    const shuffledPlayers = shufflePlayers(players);
    setTurnOrder(shuffledPlayers);
    
    // Инициализируем позиции игроков
    const initialPositions: {[key: string]: number} = {};
    shuffledPlayers.forEach(player => {
      initialPositions[player.id] = 0; // Все начинают с клетки 0
    });
    setPlayerPositions(initialPositions);
  };

  // Функция для обработки клика по клетке
  const handleCellClick = (cell: any) => {
    setSelectedCell(cell);
    setShowCellPopup(true);
  };

  // Функция для закрытия попапа
  const closeCellPopup = () => {
    setShowCellPopup(false);
    setSelectedCell(null);
  };

  // Функция для получения описания клетки
  const getCellDescription = (cell: any) => {
    if (cell.description) {
      return cell.description;
    }
    
    const descriptions: {[key: string]: string} = {
      'start': 'Начальная точка игры. Здесь вы начинаете свой путь к финансовой независимости.',
      'opportunity': 'Это клетка возможностей! Здесь вы можете получить шанс на дополнительный доход или инвестиции.',
      'business': 'Бизнес-клетка. Здесь можно купить или продать бизнес для пассивного дохода.',
      'loss': 'Клетка потерь. Будьте готовы к неожиданным тратам и потерям.',
      'charity': 'Клетка благотворительности. Поделитесь частью своего дохода с теми, кто в этом нуждается.',
      'payday': 'День зарплаты! Получите свой ежемесячный доход и пополните свой баланс.',
      'market': 'Рынок недвижимости. Здесь можно купить или продать недвижимость для пассивного дохода.',
      'child': 'Рождение ребенка. Это радостное событие, но оно также увеличивает ваши расходы.',
      'expenses': 'Клетка расходов. Будьте готовы к неожиданным тратам и обязательным платежам.'
    };
    
    return descriptions[cell.type] || 'Это специальная клетка игрового поля.';
  };

  // Функция для получения действий клетки
  const getCellActions = (cell: any) => {
    // Специальные действия для бизнес-клеток
    if (cell.type === 'business') {
      let actions = `• Стоимость: $${cell.cost?.toLocaleString() || 'Не указана'}\n`;
      if (cell.income > 0) {
        actions += `• Доход: $${cell.income.toLocaleString()}/мес\n`;
      } else if (cell.income === 0) {
        actions += `• Доход: $0/мес (инвестиция в мечту)\n`;
      }
      if (cell.special) {
        actions += `• ${cell.special}\n`;
      }
      actions += '• Купите бизнес для пассивного дохода\n• Продайте нерентабельные активы';
      return actions;
    }
    
    // Специальные действия для клеток потерь
    if (cell.type === 'loss') {
      return `• ${cell.loss || 'Потеря активов'}\n• Пересмотрите свою стратегию\n• Найдите способы восстановления`;
    }
    
    const actions: {[key: string]: string} = {
      'start': '• Начните свой путь к финансовой независимости\n• Получите стартовый капитал\n• Планируйте свои инвестиции',
      'opportunity': '• Получите карточку возможностей\n• Выберите подходящую инвестицию\n• Увеличьте свой пассивный доход',
      'charity': '• Пожертвуйте часть дохода\n• Получите благословение\n• Улучшите свою карму',
      'payday': '• Получите зарплату\n• Пополните банковский счет\n• Планируйте следующие расходы',
      'market': '• Изучите рынок недвижимости\n• Купите доходную недвижимость\n• Продайте нерентабельные активы',
      'child': '• Поздравьте с рождением\n• Увеличьте семейные расходы\n• Планируйте будущее ребенка',
      'expenses': '• Оплатите обязательные расходы\n• Пересмотрите свой бюджет\n• Найдите способы экономии'
    };
    
    return actions[cell.type] || '• Изучите возможности клетки\n• Примите решение\n• Продолжайте игру';
  };

  const handleRollDice = async () => {
    if (isRolling || isMoving) return;
    
    setIsRolling(true);
    setDiceValue(null);
    setHasRolled(true);
    setRollTime(Date.now());
    
    // Анимация броска кубика
    setTimeout(async () => {
      const value = Math.floor(Math.random() * 6) + 1;
      setDiceValue(value);
      setIsRolling(false);
      
      // Движение фишки
      const currentPlayer = getCurrentPlayer();
      if (currentPlayer) {
        await movePlayerPiece(currentPlayer.id, value);
      }
      
      // Активируем кнопку "Передать ход" через 5 секунд
      setTimeout(() => {
        setCanPassTurn(true);
      }, 5000);
      
      onRollDice();
    }, 1000);
  };

  const handleEndTurn = () => {
    // Переход к следующему ходу
    nextTurn();
    setRollTime(0);
  };

  // Таймер перемешивания
  useEffect(() => {
    if (!shuffling) return;

    const timer = setInterval(() => {
      setShuffleTime(prev => {
        if (prev <= 1) {
          setShuffling(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shuffling]);

  // Таймер хода
  useEffect(() => {
    if (!gameStarted || shuffling) {
      setTimeLeft(120);
      setHasRolled(false);
      setRollTime(0);
      return;
    }

    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== currentPlayer?.id) {
      setTimeLeft(120);
      setHasRolled(false);
      setRollTime(0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          // Время вышло - автоматический переход хода
          handleEndTurn();
          return 120;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, shuffling, currentTurnIndex, turnOrder]);

  // Проверка на переход кнопки в "переход хода"
  useEffect(() => {
    if (hasRolled && rollTime > 0) {
      const timeSinceRoll = Date.now() - rollTime;
      if (timeSinceRoll >= 10000) { // 10 секунд после броска
        // Кнопка должна стать "переход хода"
      }
    }
  }, [hasRolled, rollTime]);

  // Рендер внутренних клеток (24 в круге) - АДАПТИВНЫЕ РАЗМЕРЫ
  const renderInnerCells = () => {
    return INNER_CELLS.map((cell, index) => {
      const angle = (index * 360) / 24;
      const radius = 168 * scale; // Адаптивный радиус
      const centerX = boardSize / 2;
      const centerY = boardSize / 2;
      const x = centerX + Math.cos((angle - 90) * Math.PI / 180) * radius;
      const y = centerY + Math.sin((angle - 90) * Math.PI / 180) * radius;
      
      return (
        <div
          key={cell.id}
          style={{
            position: 'absolute',
            left: x - (28 * scale),
            top: y - (28 * scale),
            width: 56 * scale,
            height: 56 * scale,
            background: cell.color,
            borderRadius: `${11 * scale}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${22 * scale}px`,
            color: 'white',
            fontWeight: 'bold',
            boxShadow: `0 ${3 * scale}px ${11 * scale}px rgba(0,0,0,0.3)`,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id}) - Нажмите для подробностей`}
          onClick={() => handleCellClick(cell)}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Номер клетки в левом нижнем углу */}
            <div style={{
              position: 'absolute',
              bottom: `${2 * scale}px`,
              left: `${2 * scale}px`,
              fontSize: `${8 * scale}px`,
              fontWeight: 'bold',
              color: 'rgba(0, 0, 0, 0.8)',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: `${12 * scale}px`,
              height: `${12 * scale}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1'
            }}>
              {cell.id}
            </div>
            {/* Иконка в центре */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              {cell.icon}
            </div>
          </div>
        </div>
      );
    });
  };

  // Рендер внешних клеток (52 в квадрате) - СИММЕТРИЧНО
  const renderOuterCells = () => {
    const cells = [];
    const cellSize = 46; // Увеличено на 15% с 40 до 46
    const spacing = 2;
    const boardWidth = 14 * (cellSize + spacing) - spacing; // Общая ширина доски
    const boardHeight = 14 * (cellSize + spacing) - spacing; // Общая высота доски
    const startX = (800 - boardWidth) / 2; // Центрирование по горизонтали
    const startY = (800 - boardHeight) / 2; // Центрирование по вертикали
    
    // Верхний ряд (14 клеток)
    for (let i = 0; i < 14; i++) {
      const cell = OUTER_CELLS[i];
      const x = startX + i * (cellSize + spacing);
      const y = startY;
      cells.push(
        <div
          key={`top-${cell.id}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: cellSize,
            height: cellSize,
            background: cell.color,
            borderRadius: '5px', // Увеличено на 15% с 4px до 5px
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px', // Увеличено на 15% с 12px до 14px
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)', // Увеличено на 15%
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id})`}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Номер клетки в верхнем левом углу */}
            <div style={{
              position: 'absolute',
              top: '1px',
              left: '1px',
              fontSize: '6px',
              fontWeight: 'bold',
              color: 'rgba(0, 0, 0, 0.8)',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1'
            }}>
              {cell.id}
            </div>
            {/* Иконка в центре */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              {cell.icon}
            </div>
          </div>
        </div>
      );
    }
    
    // Правый столбец (12 клеток) - СИММЕТРИЧНО
    for (let i = 0; i < 12; i++) {
      const cell = OUTER_CELLS[14 + i];
      const x = startX + 13 * (cellSize + spacing); // Правый край доски
      const y = startY + (i + 1) * (cellSize + spacing);
      cells.push(
        <div
          key={`right-${cell.id}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: cellSize,
            height: cellSize,
            background: cell.color,
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id})`}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Номер клетки в верхнем левом углу */}
            <div style={{
              position: 'absolute',
              top: '1px',
              left: '1px',
              fontSize: '6px',
              fontWeight: 'bold',
              color: 'rgba(0, 0, 0, 0.8)',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1'
            }}>
              {cell.id}
            </div>
            {/* Иконка в центре */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              {cell.icon}
            </div>
          </div>
        </div>
      );
    }
    
    // Нижний ряд (14 клеток, справа налево) - СИММЕТРИЧНО
    for (let i = 0; i < 14; i++) {
      const cell = OUTER_CELLS[26 + i];
      const x = startX + (13 - i) * (cellSize + spacing);
      const y = startY + 13 * (cellSize + spacing);
      cells.push(
        <div
          key={`bottom-${cell.id}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: cellSize,
            height: cellSize,
            background: cell.color,
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id})`}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Номер клетки в верхнем левом углу */}
            <div style={{
              position: 'absolute',
              top: '1px',
              left: '1px',
              fontSize: '6px',
              fontWeight: 'bold',
              color: 'rgba(0, 0, 0, 0.8)',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1'
            }}>
              {cell.id}
            </div>
            {/* Иконка в центре */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              {cell.icon}
            </div>
          </div>
        </div>
      );
    }
    
    // Левый столбец (12 клеток, снизу вверх) - СИММЕТРИЧНО
    for (let i = 0; i < 12; i++) {
      const cell = OUTER_CELLS[40 + i];
      const x = startX; // Левый край доски
      const y = startY + (12 - i) * (cellSize + spacing);
      cells.push(
        <div
          key={`left-${cell.id}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: cellSize,
            height: cellSize,
            background: cell.color,
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id})`}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Номер клетки в верхнем левом углу */}
            <div style={{
              position: 'absolute',
              top: '1px',
              left: '1px',
              fontSize: '6px',
              fontWeight: 'bold',
              color: 'rgba(0, 0, 0, 0.8)',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: '1'
            }}>
              {cell.id}
            </div>
            {/* Иконка в центре */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              {cell.icon}
            </div>
          </div>
        </div>
      );
    }
    
    return cells;
  };

  // Рендер карточек сделок в углах между внешними и внутренними клетками
  const renderDealCards = () => {
    const cardSize = 60 * scale;
    const cardHeight = 80 * scale;
    
    return (
      <>
        {/* Верхний левый угол - Большая сделка */}
        <div
          style={{
            position: 'absolute',
            left: 130 * scale,
            top: 130 * scale,
            width: cardSize,
            height: cardHeight,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            borderRadius: `${12 * scale}px`,
            border: `${3 * scale}px solid #FF6B35`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 ${8 * scale}px ${25 * scale}px rgba(255, 215, 0, 0.6)`,
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Большая сделка"
        >
          <div style={{ fontSize: `${24 * scale}px`, marginBottom: `${4 * scale}px` }}>💰</div>
          <div style={{ fontSize: `${8 * scale}px`, fontWeight: 'bold', textAlign: 'center', color: '#8B4513' }}>
            Большая сделка
          </div>
        </div>

        {/* Верхний правый угол - Малая сделка */}
        <div
          style={{
            position: 'absolute',
            right: 130 * scale,
            top: 130 * scale,
            width: cardSize,
            height: cardHeight,
            background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
            borderRadius: `${12 * scale}px`,
            border: `${3 * scale}px solid #FF6B35`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 ${8 * scale}px ${25 * scale}px rgba(50, 205, 50, 0.6)`,
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Малая сделка"
        >
          <div style={{ fontSize: `${24 * scale}px`, marginBottom: `${4 * scale}px` }}>💼</div>
          <div style={{ fontSize: `${8 * scale}px`, fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
            Малая сделка
          </div>
        </div>

        {/* Нижний правый угол - Рынок */}
        <div
          style={{
            position: 'absolute',
            right: 130 * scale,
            bottom: 130 * scale,
            width: cardSize,
            height: cardHeight,
            background: 'linear-gradient(135deg, #4169E1 0%, #0000CD 100%)',
            borderRadius: `${12 * scale}px`,
            border: `${3 * scale}px solid #FF6B35`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 ${8 * scale}px ${25 * scale}px rgba(65, 105, 225, 0.6)`,
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Рынок"
        >
          <div style={{ fontSize: `${24 * scale}px`, marginBottom: `${4 * scale}px` }}>🏪</div>
          <div style={{ fontSize: `${8 * scale}px`, fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
            Рынок
          </div>
        </div>

        {/* Нижний левый угол - Расходы */}
        <div
          style={{
            position: 'absolute',
            left: 130 * scale,
            bottom: 130 * scale,
            width: cardSize,
            height: cardHeight,
            background: 'linear-gradient(135deg, #DC143C 0%, #B22222 100%)',
            borderRadius: `${12 * scale}px`,
            border: `${3 * scale}px solid #FF6B35`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 ${8 * scale}px ${25 * scale}px rgba(220, 20, 60, 0.6)`,
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Расходы"
        >
          <div style={{ fontSize: `${24 * scale}px`, marginBottom: `${4 * scale}px` }}>💸</div>
          <div style={{ fontSize: `${8 * scale}px`, fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
            Расходы
          </div>
        </div>
      </>
    );
  };

  // Рендер фишек игроков
  const renderPlayerTokens = () => {
    // Используем turnOrder если игра началась, иначе обычный порядок
    const playersToRender = gameStarted ? turnOrder : players;
    
    return playersToRender.map((player, index) => {
      const color = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][index % 5];
      const position = playerPositions[player.id] || 0;
      
      // Вычисляем позицию на основе номера клетки
      const angle = (position * 360) / 24;
      const radius = 168 * scale;
      const centerX = boardSize / 2;
      const centerY = boardSize / 2;
      const x = centerX + Math.cos((angle - 90) * Math.PI / 180) * radius;
      const y = centerY + Math.sin((angle - 90) * Math.PI / 180) * radius;
      
      // Смещаем фишки, чтобы они не накладывались
      const offsetX = (index % 2) * 20 - 10;
      const offsetY = Math.floor(index / 2) * 20 - 10;
      
      return (
        <div
          key={player.id}
          style={{
            position: 'absolute',
            left: x - 10 + offsetX,
            top: y - 10 + offsetY,
            width: 20 * scale,
            height: 20 * scale,
            background: color,
            borderRadius: '50%',
            border: `${2 * scale}px solid white`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${10 * scale}px`,
            color: 'white',
            fontWeight: 'bold',
            boxShadow: `0 ${2 * scale}px ${8 * scale}px rgba(0,0,0,0.3)`,
            zIndex: 4,
            transition: 'all 0.5s ease'
          }}
          title={`${player.name} (${player.profession || 'Предприниматель'}) - Позиция: ${position + 1}`}
        >
          {index + 1}
        </div>
      );
    });
  };

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      flexDirection: window.innerWidth < 1024 ? 'column' : 'row',
      alignItems: 'center',
      padding: '20px'
    }}>
      {/* Игровая доска */}
      <div style={{
        position: 'relative',
        width: `${boardSize}px`,
        height: `${boardSize}px`,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: `${20 * scale}px`,
        border: `${3 * scale}px solid rgba(255, 255, 255, 0.2)`,
        boxShadow: `0 ${20 * scale}px ${40 * scale}px rgba(0, 0, 0, 0.5)`,
        overflow: 'hidden'
      }}>
      {/* Центральный логотип с анимацией */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2
        }}
      >
        <div
          style={{
            width: `${160 * scale}px`,
            height: `${160 * scale}px`,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 ${8 * scale}px ${32 * scale}px rgba(255, 215, 0, 0.4), 0 0 0 ${4 * scale}px rgba(255, 215, 0, 0.2)`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Внутренний круг с градиентом */}
          <div
            style={{
              width: `${140 * scale}px`,
              height: `${140 * scale}px`,
              background: 'radial-gradient(circle, #000000 0%, #1a1a1a 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {/* Центральный результат броска кубика */}
            <div
              style={{
                fontSize: `${48 * scale}px`,
                fontWeight: 'bold',
                color: '#FFD700',
                textShadow: `0 0 ${20 * scale}px rgba(255, 215, 0, 0.8), 0 0 ${40 * scale}px rgba(255, 165, 0, 0.6)`,
                zIndex: 3,
                position: 'relative',
                animation: isRolling ? 'diceRoll 0.1s infinite' : 'none'
              }}
            >
              {diceValue || '🎲'}
            </div>
            
            {/* Энергетические линии */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 215, 0, 0.3) 45deg, transparent 90deg, rgba(255, 165, 0, 0.3) 135deg, transparent 180deg, rgba(255, 140, 0, 0.3) 225deg, transparent 270deg, rgba(255, 215, 0, 0.3) 315deg, transparent 360deg)',
                animation: 'rotate 4s linear infinite'
              }}
            />
            
            {/* Дополнительные светящиеся точки */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%'
              }}
            >
              {[0, 60, 120, 180, 240, 300].map((angle, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    width: `${6 * scale}px`,
                    height: `${6 * scale}px`,
                    background: '#FFD700',
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-50px)`,
                    boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                    animation: `pulse ${2 + index * 0.3}s ease-in-out infinite`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Внешние монеты */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%'
            }}
          >
            {[45, 135, 225, 315].map((angle, index) => (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  width: '24px',
                  height: '24px',
                  background: 'radial-gradient(circle, #FFD700 0%, #FFA500 100%)',
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-70px)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.6)',
                  border: '2px solid #FFD700'
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#000000'
                  }}
                >
                  $
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Внутренний круг (24 клетки) - УМЕНЬШЕН НА 30% */}
      {renderInnerCells()}

      {/* Внешний квадрат (52 клетки) - УВЕЛИЧЕНЫ НА 15% */}
      {renderOuterCells()}

      {/* Карточки сделок в углах */}
      {renderDealCards()}

      {/* Фишки игроков */}
      {renderPlayerTokens()}
      </div>

      {/* Правое меню (перенесено из левого) */}
      <div style={{
        width: '300px',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(15px)',
        borderRadius: '20px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* 1. Модуль банка - ПОДНЯТ ВВЕРХ */}
        <div>
          <BankModule
            playerData={currentPlayer}
            gamePlayers={players}
            socket={null}
            bankBalance={currentPlayer?.money || 0}
            playerCredit={0}
            getMaxCredit={() => 10000}
            getCashFlow={() => 1200}
            setShowCreditModal={() => {}}
            roomId="demo-room"
            onBankBalanceChange={() => {}}
          />
        </div>


        {/* 3. Активы - КНОПКА С РАСКРЫВАЕМЫМ СПИСКОМ */}
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          padding: '15px',
          borderRadius: '12px',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <button
            onClick={() => setShowAssets(!showAssets)}
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(45deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            💼 Активы {showAssets ? '▲' : '▼'}
          </button>
          
          {showAssets && (
            <div style={{ 
              marginTop: '15px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px' 
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: 'white', fontSize: '14px' }}>🏠 Дом</span>
                <span style={{ color: '#4CAF50', fontSize: '14px', fontWeight: 'bold' }}>$150,000</span>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: 'white', fontSize: '14px' }}>📈 Акции</span>
                <span style={{ color: '#4CAF50', fontSize: '14px', fontWeight: 'bold' }}>$25,000</span>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: 'white', fontSize: '14px' }}>💼 Бизнес</span>
                <span style={{ color: '#4CAF50', fontSize: '14px', fontWeight: 'bold' }}>$80,000</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. Бросить кубик с анимацией */}
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          padding: '15px',
          borderRadius: '12px',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <h3 style={{ 
            color: '#4CAF50', 
            margin: '0 0 15px 0', 
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Действия
          </h3>
          <button
            onClick={hasRolled && (Date.now() - rollTime) >= 10000 ? handleEndTurn : handleRollDice}
            disabled={!isMyTurn || isRolling}
            style={{
              width: '100%',
              padding: '15px',
              background: isMyTurn && !isRolling 
                ? hasRolled && (Date.now() - rollTime) >= 10000
                  ? 'linear-gradient(45deg, #FF9800, #F57C00)'
                  : 'linear-gradient(45deg, #4CAF50, #45a049)'
                : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isMyTurn && !isRolling ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            {isRolling ? (
              <>
                <div style={{
                  animation: 'spin 1s linear infinite',
                  fontSize: '20px'
                }}>
                  🎲
                </div>
                Бросок...
              </>
            ) : hasRolled && (Date.now() - rollTime) >= 10000 ? (
              <>
                ⏭️ Переход хода
                {diceValue && <span style={{ fontSize: '12px' }}>({diceValue})</span>}
              </>
            ) : (
              <>
                🎲 Бросить кубик
                {diceValue && <span style={{ fontSize: '12px' }}>({diceValue})</span>}
              </>
            )}
          </button>
          
          {/* Анимация кубика под кнопкой */}
          {isRolling && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              marginTop: '10px'
            }}>
              <div style={{
                fontSize: '40px',
                animation: 'bounce 0.5s ease-in-out infinite alternate'
              }}>
                🎲
              </div>
            </div>
          )}
        </div>

        {/* 5. Шкала тайминга */}
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          padding: '15px',
          borderRadius: '12px',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <h3 style={{ 
            color: '#4CAF50', 
            margin: '0 0 15px 0', 
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Время хода
          </h3>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '10px'
            }}>
              <div style={{
                width: `${(timeLeft / 120) * 100}%`,
                height: '100%',
                background: timeLeft > 60 
                  ? 'linear-gradient(90deg, #4CAF50, #8BC34A)' // Зеленая полоса (первая минута)
                  : timeLeft > 20 
                    ? 'linear-gradient(90deg, #FFC107, #FF9800)' // Желтая полоса (вторая минута)
                    : 'linear-gradient(90deg, #F44336, #E91E63)', // Красная полоса (последние 20 сек)
                borderRadius: '4px',
                transition: 'width 0.3s ease, background 0.3s ease'
              }} />
            </div>
            <div style={{ 
              color: timeLeft > 60 
                ? 'rgba(255, 255, 255, 0.8)' 
                : timeLeft > 20 
                  ? '#FFC107' 
                  : '#F44336',
              fontSize: '12px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} / 2:00
            </div>
            {timeLeft <= 20 && (
              <div style={{
                color: '#F44336',
                fontSize: '10px',
                textAlign: 'center',
                marginTop: '5px',
                animation: 'blink 1s infinite'
              }}>
                ⚠️ ВНИМАНИЕ!
              </div>
            )}
          </div>
        </div>

        {/* 6. Очередность игроков - СМЕЩЕНА ВНИЗ */}
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          padding: '15px',
          borderRadius: '12px',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <h3 style={{ 
            color: '#4CAF50', 
            margin: '0 0 15px 0', 
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Очередность игроков
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(gameStarted ? turnOrder : players).map((player, index) => {
              const isCurrentTurn = gameStarted && index === currentTurnIndex;
              const isMyPlayer = player.id === currentPlayer?.id;
              
              return (
                <div
                  key={player.id}
                  style={{
                    background: isCurrentTurn 
                      ? 'linear-gradient(45deg, #4CAF50, #45a049)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    padding: '12px',
                    borderRadius: '10px',
                    border: isCurrentTurn ? '2px solid #4CAF50' : '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.3s ease',
                    opacity: gameStarted && !isCurrentTurn ? 0.7 : 1
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    background: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][index % 5],
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                      {player.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#ccc' }}>
                      {player.profession || 'Предприниматель'}
                    </div>
                    {gameStarted && (
                      <div style={{ fontSize: '10px', color: '#aaa' }}>
                        Позиция: {(playerPositions[player.id] || 0) + 1}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc', textAlign: 'right' }}>
                    {gameStarted ? (
                      isCurrentTurn ? (
                        isMyPlayer ? '🎯 Ваш ход' : '⏳ Ходит'
                      ) : '⏸️ Ожидание'
                    ) : (
                      player.isReady ? '✅ Готов' : '⏳ Не готов'
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Текущий игрок - ПЕРЕМЕЩЕН В САМЫЙ НИЗ */}
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          padding: '15px',
          borderRadius: '12px',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        }}>
          <h3 style={{ 
            color: '#4CAF50', 
            margin: '0 0 15px 0', 
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Текущий игрок
          </h3>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ 
              color: 'white', 
              fontSize: '16px', 
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              {players[currentIndex]?.name || currentPlayer?.name || 'Неизвестно'}
            </div>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '14px',
              marginBottom: '5px'
            }}>
              Профессия: {players[currentIndex]?.profession || currentPlayer?.profession || 'Предприниматель'}
            </div>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '14px'
            }}>
              Мечта: {players[currentIndex]?.dream || currentPlayer?.dream || 'Не выбрана'}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes diceRoll {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(0.9); }
          75% { transform: rotate(270deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
      `}</style>
      
      {/* Попап с информацией о клетке */}
      {showCellPopup && selectedCell && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }} onClick={closeCellPopup}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '3px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Кнопка закрытия */}
            <button
              onClick={closeCellPopup}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            {/* Заголовок */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: selectedCell.color,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}>
                {selectedCell.icon}
              </div>
              <div>
                <h2 style={{
                  color: 'white',
                  margin: '0 0 5px 0',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  {selectedCell.name}
                </h2>
                <p style={{
                  color: '#ccc',
                  margin: '0',
                  fontSize: '16px'
                }}>
                  Клетка #{selectedCell.id}
                </p>
              </div>
            </div>
            
            {/* Описание */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h3 style={{
                color: '#4CAF50',
                margin: '0 0 15px 0',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                Описание
              </h3>
              <p style={{
                color: 'white',
                margin: '0',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                {getCellDescription(selectedCell)}
              </p>
            </div>
            
            {/* Действия */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h3 style={{
                color: '#FFC107',
                margin: '0 0 15px 0',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                Действия
              </h3>
              <p style={{
                color: 'white',
                margin: '0',
                lineHeight: '1.6',
                fontSize: '14px'
              }}>
                {getCellActions(selectedCell)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullGameBoard;