import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Проверяем авторизацию
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/simple-auth');
      return;
    }

    // Подключаемся к Socket.IO
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://energy888-1.onrender.com';
    console.log('🔌 Подключаемся к Socket.IO:', socketUrl);

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.connected);
      setSocket(newSocket);
      
      // Запрашиваем информацию о комнате
      newSocket.emit('join-room', { roomId: id });
    });

    newSocket.on('room-joined', (roomData: Room) => {
      console.log('📋 Получена информация о комнате:', roomData);
      setRoom(roomData);
      setLoading(false);
    });

    newSocket.on('room-updated', (roomData: Room) => {
      console.log('📋 Комната обновлена:', roomData);
      setRoom(roomData);
    });

    newSocket.on('error', (error: string) => {
      console.error('❌ Socket error:', error);
      setError(error);
      setLoading(false);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setSocket(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id, router]);

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', { roomId: id });
    }
    router.push('/simple-rooms');
  };

  const handleReady = () => {
    if (socket && room) {
      socket.emit('player-ready', { roomId: id });
    }
  };

  const handleSetupCharacter = () => {
    router.push(`/room/setup?id=${id}`);
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
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            color: 'white',
            fontSize: '1.5rem',
            marginBottom: '20px'
          }}>
            🔌 Подключение к комнате...
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem'
          }}>
            ID комнаты: {id}
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
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 107, 107, 0.5)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            color: '#ff6b6b',
            fontSize: '1.5rem',
            marginBottom: '20px'
          }}>
            ❌ Ошибка подключения
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem',
            marginBottom: '30px'
          }}>
            {error}
          </div>
          <button
            onClick={handleLeaveRoom}
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
              transition: 'all 0.3s ease'
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
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            color: 'white',
            fontSize: '1.5rem',
            marginBottom: '20px'
          }}>
            🔍 Комната не найдена
          </div>
          <button
            onClick={handleLeaveRoom}
            style={{
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
              transition: 'all 0.3s ease'
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
              ID: {room.id} | Игроков: {room.currentPlayers}/{room.maxPlayers} | Время хода: {room.turnTime} мин
            </div>
          </div>
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

        {/* Room Status */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '30px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            color: 'white',
            fontSize: '1.5rem',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            Статус: {room.status === 'waiting' ? '⏳ Ожидание игроков' : 
                    room.status === 'playing' ? '🎮 Игра идет' : 
                    '🏁 Игра завершена'}
          </div>
          
          {room.status === 'waiting' && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleSetupCharacter}
                style={{
                  background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px 30px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                  transition: 'all 0.3s ease',
                  marginRight: '10px'
                }}
              >
                Настроить персонажа
              </button>
              <button
                onClick={handleReady}
                style={{
                  background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '15px 30px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                Готов играть!
              </button>
            </div>
          )}
        </div>

        {/* Players List */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '15px',
          padding: '20px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <h2 style={{
            color: 'white',
            margin: '0 0 20px 0',
            fontSize: '1.5rem',
            textAlign: 'center'
          }}>
            Игроки ({room.players.length})
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            {room.players.map((player, index) => (
              <div
                key={player.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '15px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  {player.name}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.9rem',
                  marginBottom: '8px'
                }}>
                  {player.email}
                </div>
                {player.profession && (
                  <div style={{
                    color: '#2196F3',
                    fontSize: '0.8rem',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }}>
                    💼 {player.profession}
                  </div>
                )}
                {player.dream && (
                  <div style={{
                    color: '#FF9800',
                    fontSize: '0.8rem',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }}>
                    🌟 {player.dream}
                  </div>
                )}
                <div style={{
                  color: player.isReady ? '#4CAF50' : '#ff6b6b',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  {player.isReady ? '✅ Готов' : '⏳ Не готов'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
