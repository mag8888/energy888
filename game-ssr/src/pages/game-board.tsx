import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '../contexts/SocketContext';
import OriginalGameBoard from '../components/OriginalGameBoard';
import DebugRoomsPanel from '../components/DebugRoomsPanel';

// Тестовые данные для демонстрации
const DEMO_PLAYERS = [
  {
    id: 'player1',
    name: 'Игрок 1',
    position: 0,
    money: 1000,
    isReady: true,
    profession: 'Предприниматель',
    dream: 'Финансовая независимость'
  },
  {
    id: 'player2',
    name: 'Игрок 2',
    position: 5,
    money: 800,
    isReady: true,
    profession: 'Инвестор',
    dream: 'Собственный бизнес'
  },
  {
    id: 'player3',
    name: 'Игрок 3',
    position: 10,
    money: 1200,
    isReady: true,
    profession: 'Финансист',
    dream: 'Инвестиционный портфель'
  },
  {
    id: 'player4',
    name: 'Игрок 4',
    position: 15,
    money: 900,
    isReady: true,
    profession: 'Консультант',
    dream: 'Пассивный доход'
  }
];

export default function GameBoardPage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [players, setPlayers] = useState(DEMO_PLAYERS);
  const [currentPlayer, setCurrentPlayer] = useState(DEMO_PLAYERS[0]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Переключение между демо-режимом и реальной игрой
  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
    if (!isDemoMode) {
      // Возвращаемся к демо-данным
      setPlayers(DEMO_PLAYERS);
      setCurrentPlayer(DEMO_PLAYERS[0]);
      setCurrentIndex(0);
    }
  };

  // Обработчики для демо-режима
  const handleRollDice = () => {
    if (isDemoMode) {
      // Демо-бросок кубика
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const total = dice1 + dice2;
      
      console.log('🎲 Демо-бросок кубика:', dice1, '+', dice2, '=', total);
      
      // Обновляем позицию текущего игрока
      setPlayers(prev => prev.map((player, index) => 
        index === currentIndex 
          ? { ...player, position: (player.position || 0) + total }
          : player
      ));
      
      // Переходим к следующему игроку
      const nextIndex = (currentIndex + 1) % players.length;
      setCurrentIndex(nextIndex);
      setCurrentPlayer(players[nextIndex]);
    } else if (socket) {
      // Реальная игра через сокет
      socket.emit('roll-dice', { roomId: 'demo-room' });
    }
  };

  const handleBuyCard = (cardId: string, price: number) => {
    if (isDemoMode) {
      // Демо-покупка карты
      console.log('💳 Демо-покупка карты:', cardId, 'за', price);
      
      setPlayers(prev => prev.map((player, index) => 
        index === currentIndex 
          ? { ...player, money: (player.money || 0) - price }
          : player
      ));
    } else if (socket) {
      // Реальная игра через сокет
      socket.emit('buy-card', { roomId: 'demo-room', cardId, price });
    }
  };

  const handleGetGameState = () => {
    if (isDemoMode) {
      console.log('📊 Демо-статус игры:', { players, currentPlayer, currentIndex });
    } else if (socket) {
      socket.emit('get-game-state', { roomId: 'demo-room' });
    }
  };

  return (
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
              🎮 Игровая доска
            </h1>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
              marginTop: '5px'
            }}>
              {isDemoMode ? '🎭 Демо-режим' : '🌐 Реальная игра'} • 
              Подключение: {isConnected ? '🟢' : '🔴'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={toggleDemoMode}
              style={{
                padding: '10px 20px',
                background: isDemoMode 
                  ? 'linear-gradient(45deg, #FF9800, #F57C00)' 
                  : 'linear-gradient(45deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              {isDemoMode ? '🎭 Демо' : '🌐 Реальная игра'}
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

        {/* Игровая доска */}
        <OriginalGameBoard
          players={players}
          currentPlayer={currentPlayer}
          currentIndex={currentIndex}
          onRollDice={handleRollDice}
          onBuyCard={handleBuyCard}
          onGetGameState={handleGetGameState}
          isMyTurn={true} // В демо-режиме всегда можно играть
        />

        {/* Информация о режиме */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '15px',
          padding: '20px',
          marginTop: '20px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <h3 style={{ color: 'white', marginTop: 0, marginBottom: '15px' }}>
            ℹ️ Информация о режиме
          </h3>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: '1.6' }}>
            {isDemoMode ? (
              <>
                <p><strong>🎭 Демо-режим:</strong> Игровая доска работает с тестовыми данными. Вы можете:</p>
                <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                  <li>Бросать кубик и видеть движение игроков</li>
                  <li>Покупать карты и тратить деньги</li>
                  <li>Изучать интерфейс и функциональность</li>
                  <li>Тестировать все элементы доски</li>
                </ul>
                <p>Для реальной игры переключитесь в режим "Реальная игра" и присоединитесь к комнате.</p>
              </>
            ) : (
              <>
                <p><strong>🌐 Реальная игра:</strong> Подключение к серверу для мультиплеерной игры.</p>
                <p>Для игры с другими игроками создайте или присоединитесь к комнате в лобби.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Дебаг-панель */}
      <DebugRoomsPanel />
    </div>
  );
}
