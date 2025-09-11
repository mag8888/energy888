import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { DREAMS } from '../../data/professions';
import FullGameBoard from '../../components/FullGameBoard';
import DebugRoomsPanel from '../../components/DebugRoomsPanel';

const PROFESSIONS = [
  'Врач', 'Учитель', 'Инженер', 'Программист', 'Дизайнер',
  'Менеджер', 'Юрист', 'Бухгалтер', 'Повар', 'Архитектор',
  'Психолог', 'Журналист', 'Фотограф', 'Музыкант', 'Художник'
];

interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  turnTime: number;
  status: 'waiting' | 'playing' | 'finished';
  players: Array<{
    id: string;
    name: string;
    email: string;
    isReady: boolean;
    profession?: string;
    dream?: string;
    position?: number;
    money?: number;
  }>;
}

export default function RoomPage() {
  const router = useRouter();
  const { id } = router.query;
  const { socket, isConnected } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDream, setSelectedDream] = useState<string | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGameBoard, setShowGameBoard] = useState(false);
  const [myPlayer, setMyPlayer] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Проверяем авторизацию
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/simple-auth');
      return;
    }
  }, [id, router]);

  useEffect(() => {
    if (!socket || !isConnected || !id) return;

    console.log('🔌 Socket подключен, присоединяемся к комнате:', id);

    // Получаем данные пользователя
    const user = localStorage.getItem('user');
    const userData = user ? JSON.parse(user) : { name: 'Игрок', email: 'player@example.com' };
    
    // Присоединяемся к комнате
    socket.emit('join-room', { 
      roomId: id, 
      playerName: userData.name || 'Игрок',
      playerEmail: userData.email || 'player@example.com'
    });

    // Обработчики событий
    const handleRoomJoined = (roomData: Room) => {
      console.log('📋 Получена информация о комнате:', roomData);
      setRoom(roomData);
      
      // Определяем своего игрока
      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : { name: 'Игрок', email: 'player@example.com' };
      const myPlayerData = roomData.players.find(p => 
        p.email === userData.email || p.name === userData.name
      );
      setMyPlayer(myPlayerData);
      
      // Определяем, является ли игрок хостом (первый игрок в комнате)
      setIsHost(myPlayerData && roomData.players.length > 0 && roomData.players[0].id === myPlayerData.id);
      
      setLoading(false);
    };

    const handleRoomUpdated = (roomData: Room) => {
      console.log('📋 Комната обновлена:', roomData);
      setRoom(roomData);
      
      // Обновляем данные своего игрока
      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : { name: 'Игрок', email: 'player@example.com' };
      const myPlayerData = roomData.players.find(p => 
        p.email === userData.email || p.name === userData.name
      );
      setMyPlayer(myPlayerData);
      
      // Обновляем статус хоста
      setIsHost(myPlayerData && roomData.players.length > 0 && roomData.players[0].id === myPlayerData.id);
    };

    const handleError = (error: any) => {
      console.error('❌ Socket error:', error);
      const errorMessage = typeof error === 'string' ? error : error.message || 'Неизвестная ошибка';
      setError(errorMessage);
      setLoading(false);
    };

    const handleJoinRoomError = (error: any) => {
      console.error('❌ Join room error:', error);
      setError(`Ошибка присоединения к комнате: ${error.error || 'Неизвестная ошибка'}`);
      setLoading(false);
    };

    const handlePlayerJoined = (data: any) => {
      console.log('👤 Игрок присоединился:', data);
      // Обновляем список игроков
      if (data.players) {
        setRoom(prev => prev ? {
          ...prev,
          players: data.players,
          currentPlayers: data.players.length
        } : null);
      }
    };

    const handlePlayerLeft = (data: any) => {
      console.log('👋 Игрок покинул комнату:', data);
      // Обновляем список игроков
      if (data.players) {
        setRoom(prev => prev ? {
          ...prev,
          players: data.players,
          currentPlayers: data.players.length
        } : null);
      }
    };

    const handlePlayerReadyUpdated = (data: any) => {
      console.log('✅ Готовность игрока обновлена:', data);
      // Обновляем список игроков
      if (data.players) {
        setRoom(prev => prev ? {
          ...prev,
          players: data.players
        } : null);
      }
    };

    const handleGameStarted = (data: any) => {
      console.log('🎮 Игра началась:', data);
      // Обновляем статус комнаты
      setRoom(prev => prev ? {
        ...prev,
        started: true,
        status: 'playing',
        players: data.players,
        order: data.order,
        currentPlayer: data.currentPlayer,
        turnEndAt: data.turnEndAt,
        gameEndAt: data.gameEndAt
      } : null);
      
      // Устанавливаем текущего игрока и показываем доску
      setCurrentPlayer(data.currentPlayer);
      setCurrentIndex(data.currentIndex || 0);
      setShowGameBoard(true);
    };

    const handleDiceRolled = (data: any) => {
      console.log('🎲 Кубик брошен:', data);
      // Обновляем позицию игрока
      setRoom(prev => prev ? {
        ...prev,
        players: prev.players.map(p => 
          p.name === data.player 
            ? { ...p, position: data.newPosition }
            : p
        )
      } : null);
    };

    const handleTurnChanged = (data: any) => {
      console.log('🔄 Ход изменился:', data);
      // Обновляем текущего игрока
      setRoom(prev => prev ? {
        ...prev,
        currentPlayer: data.currentPlayer,
        currentIndex: data.currentIndex,
        turnEndAt: data.turnEndAt
      } : null);
      
      // Обновляем состояние доски
      setCurrentPlayer(data.currentPlayer);
      setCurrentIndex(data.currentIndex);
    };

    const handleCardBought = (data: any) => {
      console.log('💳 Карта куплена:', data);
      // Обновляем деньги игрока
      setRoom(prev => prev ? {
        ...prev,
        players: prev.players.map(p => 
          p.name === data.player 
            ? { ...p, money: data.newMoney }
            : p
        )
      } : null);
    };


    // Подписываемся на события
    socket.on('room-joined', handleRoomJoined);
    socket.on('room-updated', handleRoomUpdated);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('player-ready-updated', handlePlayerReadyUpdated);
    socket.on('game-started', handleGameStarted);
    socket.on('dice-rolled', handleDiceRolled);
    socket.on('turn-changed', handleTurnChanged);
    socket.on('card-bought', handleCardBought);
    socket.on('join-room-error', handleJoinRoomError);
    socket.on('error', handleError);

    // Cleanup при размонтировании
    return () => {
      socket.off('room-joined', handleRoomJoined);
      socket.off('room-updated', handleRoomUpdated);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('player-ready-updated', handlePlayerReadyUpdated);
      socket.off('game-started', handleGameStarted);
      socket.off('dice-rolled', handleDiceRolled);
      socket.off('turn-changed', handleTurnChanged);
      socket.off('card-bought', handleCardBought);
      socket.off('join-room-error', handleJoinRoomError);
      socket.off('error', handleError);
    };
  }, [socket, isConnected, id]);

  const handleLeaveRoom = () => {
    if (socket && id) {
      socket.emit('leave-room', { roomId: id });
    }
    router.push('/simple-rooms');
  };

  const handleProfessionSelect = (profession: string) => {
    setSelectedProfession(profession);
    if (socket && room && id) {
      socket.emit('player-setup', { 
        roomId: id, 
        profession: profession,
        dream: selectedDream 
      });
    }
  };

  const handleReady = () => {
    if (socket && room && id && selectedDream && selectedProfession) {
      socket.emit('player-ready', { 
        roomId: id, 
        dream: selectedDream,
        profession: selectedProfession 
      });
    }
  };

  const handleSetupCharacter = () => {
    router.push(`/room/setup?id=${id}`);
  };

  const handleStartGame = () => {
    if (socket && room && id) {
      socket.emit('start-game', { roomId: id });
    }
  };

  const handleRollDice = () => {
    if (socket && room && id) {
      socket.emit('roll-dice', { roomId: id });
    }
  };

  const handleBuyCard = (cardId: string, price: number) => {
    if (socket && room && id) {
      socket.emit('buy-card', { roomId: id, cardId, price });
    }
  };

  const handleGetGameState = () => {
    if (socket && room && id) {
      socket.emit('get-game-state', { roomId: id });
    }
  };


  if (loading) {
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
            {isConnected ? '🔄 Загрузка комнаты...' : '🔌 Подключение к серверу...'}
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem'
          }}>
            {isConnected ? 'Получаем информацию о комнате' : 'Ожидаем подключения'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
          border: '2px solid rgba(255, 0, 0, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            color: '#ff6b6b',
            fontSize: '1.5rem',
            marginBottom: '20px'
          }}>
            ❌ Ошибка
          </div>
          <div style={{
            color: 'white',
            fontSize: '1rem',
            marginBottom: '30px'
          }}>
            {error}
          </div>
          <button
            onClick={() => router.push('/simple-rooms')}
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Вернуться в лобби
          </button>
        </div>
      </div>
    );
  }

  if (!room) {
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
            🏠 Комната не найдена
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem',
            marginBottom: '30px'
          }}>
            Комната с ID "{id}" не существует или была удалена
          </div>
          <button
            onClick={() => router.push('/simple-rooms')}
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '15px 30px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Вернуться в лобби
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
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
              {room.name}
            </h1>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
              marginTop: '5px'
            }}>
              Игроков: {room.currentPlayers}/{room.maxPlayers} • 
              Время хода: {room.turnTime / 60} мин • 
              Статус: {room.status}
            </div>
            <div style={{
              color: isConnected ? '#4CAF50' : '#f44336',
              fontSize: '0.9rem',
              marginTop: '5px'
            }}>
              {isConnected ? '🟢 Подключено' : '🔴 Отключено'}
            </div>
          </div>
          <div>
            <button
              onClick={handleSetupCharacter}
              style={{
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                marginRight: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              Настроить персонажа
            </button>
            <button
              onClick={handleLeaveRoom}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              Покинуть комнату
            </button>
          </div>
        </div>

        {/* Players List */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>
            Игроки в комнате ({room.players.length})
          </h2>

          {room.players.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              padding: '40px'
            }}>
              Нет игроков в комнате
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {room.players.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>
                      {player.name}
                    </h3>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                      Email: {player.email}
                    </div>
                    {/* Выбор профессии и мечты - только для своего игрока */}
                    {!player.isReady && myPlayer && myPlayer.id === player.id && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        marginTop: '8px',
                        flexWrap: 'wrap'
                      }}>
                        {/* Профессия */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '12px'
                          }}>
                            💼 Профессия:
                          </span>
                          {player.profession ? (
                            <span style={{
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              padding: '4px 8px',
                              background: 'rgba(76, 175, 80, 0.2)',
                              borderRadius: '4px',
                              border: '1px solid rgba(76, 175, 80, 0.5)'
                            }}>
                              {player.profession}
                            </span>
                          ) : (
                            <select
                              value={selectedProfession || ''}
                              onChange={(e) => handleProfessionSelect(e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                fontSize: '12px',
                                minWidth: '120px'
                              }}
                            >
                              <option value="">Выберите профессию</option>
                              {PROFESSIONS.map(profession => (
                                <option key={profession} value={profession} style={{ background: '#1a1a2e', color: 'white' }}>
                                  {profession}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        
                        {/* Мечта */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '12px'
                          }}>
                            🎯 Мечта:
                          </span>
                          {player.dream ? (
                            <span style={{
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              padding: '4px 8px',
                              background: 'rgba(76, 175, 80, 0.2)',
                              borderRadius: '4px',
                              border: '1px solid rgba(76, 175, 80, 0.5)'
                            }}>
                              {player.dream}
                            </span>
                          ) : (
                            <select
                              value={selectedDream || ''}
                              onChange={(e) => setSelectedDream(e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                fontSize: '12px',
                                minWidth: '150px'
                              }}
                            >
                              <option value="">Выберите мечту</option>
                              {DREAMS.map(dream => (
                                <option key={dream.id} value={dream.id} style={{ background: '#1a1a2e', color: 'white' }}>
                                  {dream.icon} {dream.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '10px'
                  }}>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        color: player.isReady ? '#4CAF50' : '#ff9800',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {player.isReady ? '✅ Готов' : '⏳ Ожидает'}
                      </div>
                      {/* Кнопка Готов - только для своего игрока */}
                      {myPlayer && myPlayer.id === player.id && (
                        <button
                          onClick={handleReady}
                          disabled={player.isReady || !isConnected || !selectedDream || !selectedProfession}
                          style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            background: (player.isReady || !isConnected || !selectedDream || !selectedProfession)
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'linear-gradient(45deg, #667eea, #764ba2)',
                            color: 'white',
                            cursor: (player.isReady || !isConnected || !selectedDream || !selectedProfession) ? 'not-allowed' : 'pointer',
                            opacity: (player.isReady || !isConnected || !selectedDream || !selectedProfession) ? 0.5 : 1,
                            fontSize: '14px'
                          }}
                        >
                          {player.isReady ? 'Готов' : 'Готовность'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Status */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>
            Статус игры
          </h2>
          
          {room.status === 'waiting' && (
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.1rem',
              marginBottom: '20px'
            }}>
              {room.currentPlayers < 2 
                ? `Ожидаем еще ${2 - room.currentPlayers} игроков для старта`
                : room.players.filter(p => p.isReady).length < 2
                  ? `Готово: ${room.players.filter(p => p.isReady).length}/${room.currentPlayers} игроков (минимум 2)`
                  : room.players.filter(p => !p.isReady).length === 0
                    ? 'Все игроки готовы! Можно начинать игру'
                    : `Готово: ${room.players.filter(p => p.isReady).length}/${room.currentPlayers} игроков (можно начать)`
              }
            </div>
          )}

          {room.status === 'waiting' && room.currentPlayers >= 2 && room.players.filter(p => p.isReady).length >= 2 && isHost && (
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={handleStartGame}
                style={{
                  padding: '15px 30px',
                  background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)';
                }}
              >
                🚀 Старт ({room.players.filter(p => p.isReady).length}/{room.currentPlayers} готовы)
              </button>
            </div>
          )}

          {selectedDream && (
            <div style={{ 
              color: '#4CAF50', 
              fontSize: '14px', 
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              🎯 Выбранная мечта: {selectedDream ? (DREAMS.find(d => d.id === selectedDream)?.name || selectedDream) : ''}
            </div>
          )}

          {room.status === 'playing' && showGameBoard && (
            <FullGameBoard
              players={room.players}
              currentPlayer={currentPlayer}
              currentIndex={currentIndex}
              onRollDice={handleRollDice}
              onBuyCard={handleBuyCard}
              onGetGameState={handleGetGameState}
              isMyTurn={currentPlayer?.socketId === socket?.id}
            />
          )}

          {room.status === 'playing' && !showGameBoard && (
            <div style={{
              color: '#4CAF50',
              fontSize: '1.1rem',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🎮 Игра идет! Загружаем игровую доску...
            </div>
          )}

          {room.status === 'finished' && (
            <div style={{
              color: '#ff9800',
              fontSize: '1.1rem',
              marginBottom: '20px'
            }}>
              🏁 Игра завершена
            </div>
          )}

          {!isConnected && (
            <div style={{
              color: '#f44336',
              fontSize: '1rem',
              marginBottom: '20px'
            }}>
              ⚠️ Нет подключения к серверу
            </div>
          )}
        </div>

        {/* Дебаг-панель с комнатами */}
        <DebugRoomsPanel currentRoomId={id as string} />

      </div>
    </div>
  );
}