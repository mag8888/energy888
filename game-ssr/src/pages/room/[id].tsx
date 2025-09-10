import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { DREAMS } from '../../data/professions';

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
  const [showDreamSelection, setShowDreamSelection] = useState(false);

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
      setLoading(false);
    };

    const handleRoomUpdated = (roomData: Room) => {
      console.log('📋 Комната обновлена:', roomData);
      setRoom(roomData);
    };

    const handleError = (error: string) => {
      console.error('❌ Socket error:', error);
      setError(error);
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
    };

    // Подписываемся на события
    socket.on('room-joined', handleRoomJoined);
    socket.on('room-updated', handleRoomUpdated);
    socket.on('player-joined', handlePlayerJoined);
    socket.on('player-left', handlePlayerLeft);
    socket.on('player-ready-updated', handlePlayerReadyUpdated);
    socket.on('join-room-error', handleJoinRoomError);
    socket.on('error', handleError);

    // Cleanup при размонтировании
    return () => {
      socket.off('room-joined', handleRoomJoined);
      socket.off('room-updated', handleRoomUpdated);
      socket.off('player-joined', handlePlayerJoined);
      socket.off('player-left', handlePlayerLeft);
      socket.off('player-ready-updated', handlePlayerReadyUpdated);
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

  const handleReady = () => {
    if (!selectedDream) {
      setShowDreamSelection(true);
      return;
    }
    
    if (socket && room && id) {
      socket.emit('player-ready', { roomId: id, dream: selectedDream });
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
                      {player.profession && ` • Профессия: ${player.profession}`}
                      {player.dream && ` • Мечта: ${player.dream}`}
                    </div>
                  </div>
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
                    <button
                      onClick={handleReady}
                      disabled={player.isReady || !isConnected}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        borderRadius: '6px',
                        background: player.isReady || !isConnected
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'linear-gradient(45deg, #667eea, #764ba2)',
                        color: 'white',
                        cursor: player.isReady || !isConnected ? 'not-allowed' : 'pointer',
                        opacity: player.isReady || !isConnected ? 0.5 : 1,
                        fontSize: '14px'
                      }}
                    >
                      {player.isReady ? 'Готов' : 'Готовность'}
                    </button>
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
                : room.currentPlayers < room.maxPlayers 
                  ? `Ожидаем еще ${room.maxPlayers - room.currentPlayers} игроков (можно начать с ${room.currentPlayers})`
                  : 'Все игроки готовы! Нажмите "Начать игру"'
              }
            </div>
          )}

          {room.status === 'waiting' && room.currentPlayers >= 2 && room.players.every(p => p.isReady) && (
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
                🎮 Начать игру
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
              🎯 Выбранная мечта: {selectedDream ? DREAMS.find(d => d.id === selectedDream as string)?.name || selectedDream : ''}
            </div>
          )}

          {room.status === 'playing' && (
            <div style={{
              color: '#4CAF50',
              fontSize: '1.1rem',
              marginBottom: '20px'
            }}>
              🎮 Игра идет!
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

        {/* Dream Selection Modal */}
        {showDreamSelection && (
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
            zIndex: 1000
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h2 style={{ 
                color: 'white', 
                textAlign: 'center', 
                marginTop: 0, 
                marginBottom: '20px' 
              }}>
                🎯 Выберите мечту
              </h2>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                textAlign: 'center', 
                marginBottom: '20px' 
              }}>
                Перед началом игры необходимо выбрать свою мечту
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                {DREAMS.map(dream => (
                  <button
                    key={dream.id}
                    onClick={() => setSelectedDream(dream.id)}
                    style={{
                      padding: '15px',
                      background: selectedDream === dream.id 
                        ? 'rgba(76, 175, 80, 0.3)' 
                        : 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      border: selectedDream === dream.id 
                        ? '2px solid #4CAF50' 
                        : '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDream !== dream.id) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDream !== dream.id) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                      }
                    }}
                  >
                    <div style={{ fontSize: '18px', marginBottom: '5px' }}>
                      {dream.icon} {dream.name}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      opacity: 0.8,
                      lineHeight: '1.4'
                    }}>
                      {dream.description}
                    </div>
                  </button>
                ))}
              </div>
              
              <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => setShowDreamSelection(false)}
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    if (selectedDream) {
                      setShowDreamSelection(false);
                    }
                  }}
                  disabled={!selectedDream}
                  style={{
                    padding: '10px 20px',
                    background: selectedDream 
                      ? 'linear-gradient(45deg, #667eea, #764ba2)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: selectedDream ? 'pointer' : 'not-allowed',
                    opacity: selectedDream ? 1 : 0.5
                  }}
                >
                  Подтвердить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}