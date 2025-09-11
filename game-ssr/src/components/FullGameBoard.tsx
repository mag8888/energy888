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

// 52 внешние клетки (упрощенные)
const OUTER_CELLS = Array.from({ length: 52 }, (_, i) => ({
  id: i + 25,
  type: ['business', 'property', 'stocks', 'opportunity', 'expenses', 'chance'][i % 6],
  name: `Клетка ${i + 25}`,
  color: ['#4CAF50', '#2196F3', '#FF9800', '#10B981', '#EC4899', '#FFC107'][i % 6],
  icon: ['💼', '🏠', '📈', '🎯', '🛍️', '🎲'][i % 6]
}));

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

  const handleRollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setDiceValue(null);
    setHasRolled(true);
    setRollTime(Date.now());
    
    // Анимация броска кубика
    setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setDiceValue(value);
      setIsRolling(false);
      onRollDice();
    }, 1000);
  };

  const handleEndTurn = () => {
    // Логика завершения хода
    setHasRolled(false);
    setTimeLeft(120);
    setRollTime(0);
    // Здесь должна быть логика перехода к следующему игроку
  };

  // Таймер хода
  useEffect(() => {
    if (!isMyTurn) {
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
  }, [isMyTurn]);

  // Проверка на переход кнопки в "переход хода"
  useEffect(() => {
    if (hasRolled && rollTime > 0) {
      const timeSinceRoll = Date.now() - rollTime;
      if (timeSinceRoll >= 10000) { // 10 секунд после броска
        // Кнопка должна стать "переход хода"
      }
    }
  }, [hasRolled, rollTime]);

  // Рендер внутренних клеток (24 в круге) - УМЕНЬШЕН НА 30%
  const renderInnerCells = () => {
    return INNER_CELLS.map((cell, index) => {
      const angle = (index * 360) / 24;
      const radius = 168; // Уменьшено на 30% с 240 до 168
      const x = 400 + Math.cos((angle - 90) * Math.PI / 180) * radius;
      const y = 400 + Math.sin((angle - 90) * Math.PI / 180) * radius;
      
      return (
        <div
          key={cell.id}
          style={{
            position: 'absolute',
            left: x - 28, // Уменьшено на 30% с 40 до 28
            top: y - 28,  // Уменьшено на 30% с 40 до 28
            width: 56,    // Уменьшено на 30% с 80 до 56
            height: 56,   // Уменьшено на 30% с 80 до 56
            background: cell.color,
            borderRadius: '11px', // Уменьшено на 30% с 16px до 11px
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px', // Уменьшено на 30% с 32px до 22px
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 3px 11px rgba(0,0,0,0.3)', // Уменьшено на 30%
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id})`}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Номер клетки в левом нижнем углу */}
            <div style={{
              position: 'absolute',
              bottom: '2px',
              left: '2px',
              fontSize: '8px',
              fontWeight: 'bold',
              color: 'rgba(0, 0, 0, 0.8)',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '50%',
              width: '12px',
              height: '12px',
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
    const cardSize = 60;
    const cardHeight = 80;
    
    return (
      <>
        {/* Верхний левый угол - Большая сделка */}
        <div
          style={{
            position: 'absolute',
            left: 130,
            top: 130,
            width: cardSize,
            height: cardHeight,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            borderRadius: '12px',
            border: '3px solid #FF6B35',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(255, 215, 0, 0.6)',
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Большая сделка"
        >
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>💰</div>
          <div style={{ fontSize: '8px', fontWeight: 'bold', textAlign: 'center', color: '#8B4513' }}>
            Большая сделка
          </div>
        </div>

        {/* Верхний правый угол - Малая сделка */}
        <div
          style={{
            position: 'absolute',
            right: 130,
            top: 130,
            width: cardSize,
            height: cardHeight,
            background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
            borderRadius: '12px',
            border: '3px solid #FF6B35',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(50, 205, 50, 0.6)',
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Малая сделка"
        >
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>💼</div>
          <div style={{ fontSize: '8px', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
            Малая сделка
          </div>
        </div>

        {/* Нижний правый угол - Рынок */}
        <div
          style={{
            position: 'absolute',
            right: 130,
            bottom: 130,
            width: cardSize,
            height: cardHeight,
            background: 'linear-gradient(135deg, #4169E1 0%, #0000CD 100%)',
            borderRadius: '12px',
            border: '3px solid #FF6B35',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(65, 105, 225, 0.6)',
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Рынок"
        >
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>🏪</div>
          <div style={{ fontSize: '8px', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
            Рынок
          </div>
        </div>

        {/* Нижний левый угол - Расходы */}
        <div
          style={{
            position: 'absolute',
            left: 130,
            bottom: 130,
            width: cardSize,
            height: cardHeight,
            background: 'linear-gradient(135deg, #DC143C 0%, #B22222 100%)',
            borderRadius: '12px',
            border: '3px solid #FF6B35',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(220, 20, 60, 0.6)',
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Расходы"
        >
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>💸</div>
          <div style={{ fontSize: '8px', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
            Расходы
          </div>
        </div>
      </>
    );
  };

  // Рендер фишек игроков
  const renderPlayerTokens = () => {
    return players.map((player, index) => {
      const color = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][index % 5];
      
      // Упрощенное позиционирование - показываем на старте
      const x = 400 + (index * 30) - (players.length * 15);
      const y = 400;
      
      return (
        <div
          key={player.id}
          style={{
            position: 'absolute',
            left: x - 10,
            top: y - 10,
            width: 20,
            height: 20,
            background: color,
            borderRadius: '50%',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 4
          }}
          title={`${player.name} (${player.position || 0})`}
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
      margin: '0 auto'
    }}>
      {/* Игровая доска */}
      <div style={{
        position: 'relative',
        width: '800px',
        height: '800px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: '20px',
        border: '3px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
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
            width: '160px',
            height: '160px',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4), 0 0 0 4px rgba(255, 215, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Внутренний круг с градиентом */}
          <div
            style={{
              width: '140px',
              height: '140px',
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
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#FFD700',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 165, 0, 0.6)',
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
                    width: '6px',
                    height: '6px',
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
            {players.map((player, index) => (
              <div
                key={player.id}
                style={{
                  background: index === currentIndex 
                    ? 'linear-gradient(45deg, #4CAF50, #45a049)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: index === currentIndex ? '2px solid #4CAF50' : '1px solid rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease'
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
                <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                  {player.name}
                </div>
                {index === currentIndex && (
                  <div style={{ marginLeft: 'auto', fontSize: '20px' }}>👑</div>
                )}
              </div>
            ))}
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
    </div>
  );
};

export default FullGameBoard;