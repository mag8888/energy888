import React, { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  position?: number;
  money?: number;
  isReady: boolean;
  profession?: string;
  dream?: string;
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

  const handleRollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setDiceValue(null);
    
    // Анимация броска кубика
    setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      setDiceValue(value);
      setIsRolling(false);
      onRollDice();
    }, 1000);
  };

  // Рендер внутренних клеток (24 в круге)
  const renderInnerCells = () => {
    return INNER_CELLS.map((cell, index) => {
      const angle = (index * 360) / 24;
      const radius = 120;
      const x = 400 + Math.cos((angle - 90) * Math.PI / 180) * radius;
      const y = 400 + Math.sin((angle - 90) * Math.PI / 180) * radius;
      
      return (
        <div
          key={cell.id}
          style={{
            position: 'absolute',
            left: x - 20,
            top: y - 20,
            width: 40,
            height: 40,
            background: cell.color,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id})`}
        >
          {cell.icon}
        </div>
      );
    });
  };

  // Рендер внешних клеток (52 в квадрате)
  const renderOuterCells = () => {
    const cells = [];
    const cellSize = 40;
    const spacing = 2;
    const startX = 50;
    const startY = 50;
    const boardSize = 700;
    
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
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id})`}
        >
          {cell.icon}
        </div>
      );
    }
    
    // Правый столбец (12 клеток)
    for (let i = 0; i < 12; i++) {
      const cell = OUTER_CELLS[14 + i];
      const x = startX + 14 * (cellSize + spacing);
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
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id})`}
        >
          {cell.icon}
        </div>
      );
    }
    
    // Нижний ряд (14 клеток, справа налево)
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
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id})`}
        >
          {cell.icon}
        </div>
      );
    }
    
    // Левый столбец (12 клеток, снизу вверх)
    for (let i = 0; i < 12; i++) {
      const cell = OUTER_CELLS[40 + i];
      const x = startX;
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
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 2
          }}
          title={`${cell.name} (${cell.id})`}
        >
          {cell.icon}
        </div>
      );
    }
    
    return cells;
  };

  // Рендер угловых клеток
  const renderCornerCells = () => {
    const cornerSize = 80;
    const cornerHeight = 100;
    
    return (
      <>
        {/* Верхний левый - Большая сделка */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            top: 200,
            width: cornerSize,
            height: cornerHeight,
            background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
            borderRadius: '16px',
            border: '2px solid #EF4444',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(0, 188, 212, 0.4)',
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Большая сделка"
        >
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>💰</div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
            Большая сделка
          </div>
        </div>

        {/* Верхний правый - Малая сделка */}
        <div
          style={{
            position: 'absolute',
            right: 200,
            top: 200,
            width: cornerSize,
            height: cornerHeight,
            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            borderRadius: '16px',
            border: '2px solid #EF4444',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Малая сделка"
        >
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>💼</div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
            Малая сделка
          </div>
        </div>

        {/* Нижний правый - Рынок */}
        <div
          style={{
            position: 'absolute',
            right: 200,
            bottom: 200,
            width: cornerSize,
            height: cornerHeight,
            background: 'linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)',
            borderRadius: '16px',
            border: '2px solid #EF4444',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(0, 188, 212, 0.4)',
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Рынок"
        >
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏪</div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
            Рынок
          </div>
        </div>

        {/* Нижний левый - Расходы */}
        <div
          style={{
            position: 'absolute',
            left: 200,
            bottom: 200,
            width: cornerSize,
            height: cornerHeight,
            background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
            borderRadius: '16px',
            border: '2px solid #E91E63',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(233, 30, 99, 0.4)',
            zIndex: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          title="Расходы"
        >
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>💸</div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
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
      position: 'relative',
      width: '800px',
      height: '800px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      borderRadius: '20px',
      border: '3px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
      overflow: 'hidden'
    }}>
      {/* Центральная область */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 10px 30px rgba(156, 39, 176, 0.4)',
          zIndex: 1
        }}
      >
        ЦЕНТР
      </div>

      {/* Внутренний круг (24 клетки) */}
      {renderInnerCells()}

      {/* Внешний квадрат (52 клетки) */}
      {renderOuterCells()}

      {/* Угловые клетки */}
      {renderCornerCells()}

      {/* Фишки игроков */}
      {renderPlayerTokens()}

      {/* Панель управления */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 5
      }}>
        <div style={{ color: 'white', fontSize: '14px' }}>
          <div>Текущий игрок: {currentPlayer?.name || 'Неизвестно'}</div>
          <div>Позиция: {currentPlayer?.position || 0}</div>
          <div>Деньги: ${currentPlayer?.money?.toLocaleString() || 0}</div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleRollDice}
            disabled={!isMyTurn || isRolling}
            style={{
              padding: '10px 20px',
              background: isMyTurn && !isRolling 
                ? 'linear-gradient(45deg, #4CAF50, #45a049)' 
                : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isMyTurn && !isRolling ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            {isRolling ? '🎲 Бросок...' : `🎲 Бросить кубик${diceValue ? ` (${diceValue})` : ''}`}
          </button>
          
          <button
            onClick={() => onGetGameState()}
            style={{
              padding: '10px 20px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            📊 Статус
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullGameBoard;
