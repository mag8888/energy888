import React, { useState, useEffect } from 'react';
import BankModule from './bank-module/src/BankModule';
import type { Transaction } from '../types/bank';

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
  const [showAssets, setShowAssets] = useState(false);

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

  // Рендер внешних клеток (52 в квадрате) - УВЕЛИЧЕНЫ НА 15%
  const renderOuterCells = () => {
    const cells = [];
    const cellSize = 46; // Увеличено на 15% с 40 до 46
    const spacing = 2;
    const startX = 50;
    const startY = 50;
    
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
    
    // Правый столбец (12 клеток) - СМЕЩЕН ВЛЕВО НА ОДНУ КЛЕТКУ
    for (let i = 0; i < 12; i++) {
      const cell = OUTER_CELLS[14 + i];
      const x = startX + 13 * (cellSize + spacing); // Смещено влево на одну клетку
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
            left: 150,
            top: 150,
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
            right: 150,
            top: 150,
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
            right: 150,
            bottom: 150,
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
            left: 150,
            bottom: 150,
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
      {/* Центральная область с золотым логотипом */}
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
          boxShadow: '0 10px 30px rgba(156, 39, 176, 0.4)',
          zIndex: 1
        }}
      >
        <div style={{
          fontSize: '60px',
          color: '#FFD700',
          textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
          fontWeight: 'bold'
        }}>
          💰
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
            transferHistory={[
              {
                id: 'initial_1',
                type: 'initial' as const,
                amount: currentPlayer?.money || 0,
                description: 'Начальный баланс профессии',
                timestamp: new Date().toLocaleString('ru-RU'),
                from: 'Банк',
                to: currentPlayer?.name || 'Игрок',
                status: 'completed' as const,
                balanceAfter: currentPlayer?.money || 0
              }
            ]}
          />
        </div>

        {/* 2. Текущий игрок */}
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
              {currentPlayer?.name || 'Неизвестно'}
            </div>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '14px',
              marginBottom: '5px'
            }}>
              Профессия: {currentPlayer?.profession || 'Не выбрана'}
            </div>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '14px'
            }}>
              Мечта: {currentPlayer?.dream || 'Не выбрана'}
            </div>
          </div>
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
            onClick={handleRollDice}
            disabled={!isMyTurn || isRolling}
            style={{
              width: '100%',
              padding: '15px',
              background: isMyTurn && !isRolling 
                ? 'linear-gradient(45deg, #4CAF50, #45a049)' 
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
                width: '65%', // Примерное значение
                height: '100%',
                background: 'linear-gradient(90deg, #4CAF50, #FFC107, #FF5722)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ 
              color: 'rgba(255, 255, 255, 0.7)', 
              fontSize: '12px',
              textAlign: 'center'
            }}>
              1:30 / 2:00
            </div>
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
      </div>
    </div>
  );
};

export default FullGameBoard;