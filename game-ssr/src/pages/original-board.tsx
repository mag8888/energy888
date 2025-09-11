import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DebugRoomsPanel from '../components/DebugRoomsPanel';
import FullGameBoard from '../components/FullGameBoard';

// Тестовые данные для демонстрации
const DEMO_PLAYERS = [
  {
    id: 'player1',
    name: 'MAG',
    position: 0,
    money: 2500,
    isReady: true,
    profession: 'Менеджер',
    dream: 'Финансовая независимость'
  },
  {
    id: 'player2',
    name: 'Игрок 2',
    position: 5,
    money: 1800,
    isReady: true,
    profession: 'Инвестор',
    dream: 'Собственный бизнес'
  },
  {
    id: 'player3',
    name: 'Игрок 3',
    position: 10,
    money: 2200,
    isReady: true,
    profession: 'Финансист',
    dream: 'Инвестиционный портфель'
  }
];

export default function OriginalBoardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Симуляция загрузки
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Обработчики для демо-режима
  const handleRollDice = () => {
    console.log('🎲 Демо-бросок кубика');
  };

  const handleBuyCard = (cardId: string, price: number) => {
    console.log('💳 Демо-покупка карты:', cardId, 'за', price);
  };

  const handleGetGameState = () => {
    console.log('📊 Демо-статус игры');
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            color: 'white',
            fontSize: '1.5rem',
            marginBottom: '20px'
          }}>
            🔄 Загрузка полной игровой доски...
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem'
          }}>
            Подготавливаем 24 внутренних + 52 внешних клетки
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-10px); }
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '15px',
          padding: '20px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <div>
            <h1 style={{
              color: 'white',
              margin: 0,
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              🎮 Полная игровая доска
            </h1>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
              marginTop: '5px'
            }}>
              24 внутренних клетки + 52 внешних клетки = 76 клеток
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => router.push('/game-board')}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              🎯 Простая доска
            </button>
            <button
              onClick={() => router.push('/simple-rooms')}
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
              🏠 В лобби
            </button>
          </div>
        </div>


        {/* Полная игровая доска */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '15px',
          padding: '20px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <FullGameBoard
            players={DEMO_PLAYERS}
            currentPlayer={DEMO_PLAYERS[0]}
            currentIndex={0}
            onRollDice={handleRollDice}
            onBuyCard={handleBuyCard}
            onGetGameState={handleGetGameState}
            isMyTurn={true}
          />
        </div>
      </div>

      {/* Дебаг-панель */}
      <DebugRoomsPanel />
      </div>
    </>
  );
}
