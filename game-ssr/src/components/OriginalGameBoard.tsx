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

interface GameBoardProps {
  players: Player[];
  currentPlayer?: Player;
  currentIndex?: number;
  onRollDice: () => void;
  onBuyCard: (cardId: string, price: number) => void;
  onGetGameState: () => void;
  isMyTurn: boolean;
}

// Игровые клетки (40 клеток по периметру)
const GAME_CELLS = [
  { id: 0, name: 'Старт', type: 'start', color: '#4CAF50' },
  { id: 1, name: 'Недвижимость', type: 'property', price: 200, color: '#2196F3' },
  { id: 2, name: 'Акции', type: 'stocks', price: 150, color: '#FF9800' },
  { id: 3, name: 'Бизнес', type: 'business', price: 300, color: '#9C27B0' },
  { id: 4, name: 'Налоги', type: 'tax', amount: 100, color: '#F44336' },
  { id: 5, name: 'Инвестиции', type: 'investment', price: 250, color: '#00BCD4' },
  { id: 6, name: 'Недвижимость', type: 'property', price: 180, color: '#2196F3' },
  { id: 7, name: 'Шанс', type: 'chance', color: '#FFC107' },
  { id: 8, name: 'Акции', type: 'stocks', price: 120, color: '#FF9800' },
  { id: 9, name: 'Бизнес', type: 'business', price: 280, color: '#9C27B0' },
  { id: 10, name: 'Тюрьма', type: 'jail', color: '#795548' },
  { id: 11, name: 'Недвижимость', type: 'property', price: 220, color: '#2196F3' },
  { id: 12, name: 'Акции', type: 'stocks', price: 160, color: '#FF9800' },
  { id: 13, name: 'Бизнес', type: 'business', price: 320, color: '#9C27B0' },
  { id: 14, name: 'Налоги', type: 'tax', amount: 150, color: '#F44336' },
  { id: 15, name: 'Инвестиции', type: 'investment', price: 200, color: '#00BCD4' },
  { id: 16, name: 'Недвижимость', type: 'property', price: 190, color: '#2196F3' },
  { id: 17, name: 'Шанс', type: 'chance', color: '#FFC107' },
  { id: 18, name: 'Акции', type: 'stocks', price: 140, color: '#FF9800' },
  { id: 19, name: 'Бизнес', type: 'business', price: 260, color: '#9C27B0' },
  { id: 20, name: 'Парковка', type: 'parking', color: '#607D8B' },
  { id: 21, name: 'Недвижимость', type: 'property', price: 240, color: '#2196F3' },
  { id: 22, name: 'Акции', type: 'stocks', price: 180, color: '#FF9800' },
  { id: 23, name: 'Бизнес', type: 'business', price: 350, color: '#9C27B0' },
  { id: 24, name: 'Налоги', type: 'tax', amount: 200, color: '#F44336' },
  { id: 25, name: 'Инвестиции', type: 'investment', price: 300, color: '#00BCD4' },
  { id: 26, name: 'Недвижимость', type: 'property', price: 210, color: '#2196F3' },
  { id: 27, name: 'Шанс', type: 'chance', color: '#FFC107' },
  { id: 28, name: 'Акции', type: 'stocks', price: 170, color: '#FF9800' },
  { id: 29, name: 'Бизнес', type: 'business', price: 290, color: '#9C27B0' },
  { id: 30, name: 'Тюрьма', type: 'jail', color: '#795548' },
  { id: 31, name: 'Недвижимость', type: 'property', price: 230, color: '#2196F3' },
  { id: 32, name: 'Акции', type: 'stocks', price: 190, color: '#FF9800' },
  { id: 33, name: 'Бизнес', type: 'business', price: 310, color: '#9C27B0' },
  { id: 34, name: 'Налоги', type: 'tax', amount: 120, color: '#F44336' },
  { id: 35, name: 'Инвестиции', type: 'investment', price: 270, color: '#00BCD4' },
  { id: 36, name: 'Недвижимость', type: 'property', price: 200, color: '#2196F3' },
  { id: 37, name: 'Шанс', type: 'chance', color: '#FFC107' },
  { id: 38, name: 'Акции', type: 'stocks', price: 130, color: '#FF9800' },
  { id: 39, name: 'Бизнес', type: 'business', price: 270, color: '#9C27B0' }
];

// Цвета игроков
const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

export default function OriginalGameBoard({ 
  players, 
  currentPlayer, 
  currentIndex = 0, 
  onRollDice, 
  onBuyCard, 
  onGetGameState,
  isMyTurn 
}: GameBoardProps) {
  const [diceResult, setDiceResult] = useState<{ dice1: number; dice2: number; total: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  // Получаем позиции игроков на доске
  const getPlayerPositions = () => {
    const positions: { [key: number]: Player[] } = {};
    players.forEach(player => {
      const pos = player.position || 0;
      if (!positions[pos]) {
        positions[pos] = [];
      }
      positions[pos].push(player);
    });
    return positions;
  };

  const playerPositions = getPlayerPositions();

  // Обработка броска кубика
  const handleRollDice = () => {
    if (isMyTurn) {
      onRollDice();
    }
  };

  // Обработка покупки карты
  const handleBuyCard = (cell: any) => {
    if (cell.price && isMyTurn) {
      onBuyCard(`card_${cell.id}`, cell.price);
    }
  };

  // Рендер игровой доски
  const renderGameBoard = () => {
    const boardSize = 400;
    const cellSize = boardSize / 11; // 11 клеток по каждой стороне
    
    return (
      <div style={{
        position: 'relative',
        width: boardSize,
        height: boardSize,
        margin: '0 auto',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        borderRadius: '20px',
        border: '3px solid #4CAF50',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Внешние клетки */}
        {GAME_CELLS.map((cell, index) => {
          let x = 0, y = 0;
          
          // Позиционирование клеток по периметру
          if (index <= 10) {
            // Верхняя сторона
            x = index * cellSize;
            y = 0;
          } else if (index <= 20) {
            // Правая сторона
            x = boardSize - cellSize;
            y = (index - 10) * cellSize;
          } else if (index <= 30) {
            // Нижняя сторона
            x = boardSize - cellSize - (index - 20) * cellSize;
            y = boardSize - cellSize;
          } else {
            // Левая сторона
            x = 0;
            y = boardSize - cellSize - (index - 30) * cellSize;
          }

          return (
            <div
              key={cell.id}
              onClick={() => setSelectedCell(cell.id)}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: cellSize,
                height: cellSize,
                background: cell.color,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: selectedCell === cell.id ? 'scale(1.1)' : 'scale(1)',
                zIndex: selectedCell === cell.id ? 10 : 1,
                boxShadow: selectedCell === cell.id ? '0 5px 15px rgba(0, 0, 0, 0.5)' : 'none'
              }}
            >
              <div style={{
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {cell.name}
              </div>
              {cell.price && (
                <div style={{
                  fontSize: '8px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginTop: '2px'
                }}>
                  ${cell.price}
                </div>
              )}
              {cell.amount && (
                <div style={{
                  fontSize: '8px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginTop: '2px'
                }}>
                  -${cell.amount}
                </div>
              )}
              
              {/* Игроки на этой клетке */}
              {playerPositions[cell.id] && (
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  display: 'flex',
                  gap: '2px'
                }}>
                  {playerPositions[cell.id].map((player, playerIndex) => (
                    <div
                      key={player.id}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: PLAYER_COLORS[playerIndex % PLAYER_COLORS.length],
                        border: '1px solid white',
                        fontSize: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {playerIndex + 1}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(15px)',
      borderRadius: '20px',
      padding: '30px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    }}>
      <h2 style={{ 
        color: 'white', 
        textAlign: 'center', 
        marginTop: 0, 
        marginBottom: '20px',
        fontSize: '1.8rem'
      }}>
        🎮 Игровая доска
      </h2>

      {/* Игровая доска */}
      <div style={{ marginBottom: '30px' }}>
        {renderGameBoard()}
      </div>

      {/* Информация о текущем игроке */}
      {currentPlayer && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: 'white', marginTop: 0, marginBottom: '10px' }}>
            {isMyTurn ? '🎯 Ваш ход!' : `👤 Ход игрока: ${currentPlayer.name}`}
          </h3>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
            Позиция: {currentPlayer.position || 0} • Деньги: ${currentPlayer.money || 0}
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleRollDice}
          disabled={!isMyTurn}
          style={{
            padding: '15px 30px',
            background: isMyTurn 
              ? 'linear-gradient(45deg, #4CAF50, #45a049)' 
              : 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isMyTurn ? 'pointer' : 'not-allowed',
            opacity: isMyTurn ? 1 : 0.5,
            boxShadow: isMyTurn ? '0 4px 15px rgba(76, 175, 80, 0.4)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          🎲 Бросить кубик
        </button>

        <button
          onClick={onGetGameState}
          style={{
            padding: '15px 30px',
            background: 'linear-gradient(45deg, #2196F3, #1976D2)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          📊 Статус игры
        </button>
      </div>

      {/* Информация о выбранной клетке */}
      {selectedCell !== null && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '20px',
          marginTop: '20px',
          textAlign: 'center'
        }}>
          <h4 style={{ color: 'white', marginTop: 0, marginBottom: '10px' }}>
            {GAME_CELLS[selectedCell]?.name}
          </h4>
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '15px' }}>
            Тип: {GAME_CELLS[selectedCell]?.type}
            {GAME_CELLS[selectedCell]?.price && ` • Цена: $${GAME_CELLS[selectedCell]?.price}`}
            {GAME_CELLS[selectedCell]?.amount && ` • Налог: $${GAME_CELLS[selectedCell]?.amount}`}
          </div>
          {GAME_CELLS[selectedCell]?.price && isMyTurn && (
            <button
              onClick={() => handleBuyCard(GAME_CELLS[selectedCell])}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #FF9800, #F57C00)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              💳 Купить за ${GAME_CELLS[selectedCell]?.price}
            </button>
          )}
        </div>
      )}

      {/* Список игроков */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '20px',
        marginTop: '20px'
      }}>
        <h3 style={{ color: 'white', marginTop: 0, marginBottom: '15px' }}>
          Игроки на доске
        </h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {players.map((player, index) => (
            <div
              key={player.id}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: currentPlayer?.id === player.id ? '2px solid #4CAF50' : '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: PLAYER_COLORS[index % PLAYER_COLORS.length],
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 'bold' }}>
                    {player.name}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                    Позиция: {player.position || 0} • Деньги: ${player.money || 0}
                  </div>
                </div>
              </div>
              <div style={{
                color: currentPlayer?.id === player.id ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {currentPlayer?.id === player.id ? '🎯 Ход' : '⏳ Ожидает'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
