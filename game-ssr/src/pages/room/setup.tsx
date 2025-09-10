import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import DebugRoomsPanel from '../../components/DebugRoomsPanel';

interface Player {
  id: string;
  name: string;
  email: string;
  isReady: boolean;
  profession?: string;
  dream?: string;
}

interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  turnTime: number;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
}

const PROFESSIONS = [
  'Врач', 'Учитель', 'Инженер', 'Программист', 'Дизайнер',
  'Менеджер', 'Юрист', 'Бухгалтер', 'Повар', 'Архитектор',
  'Психолог', 'Журналист', 'Фотограф', 'Музыкант', 'Художник'
];

const DREAMS = [
  'Путешествовать по миру', 'Купить дом', 'Начать свой бизнес',
  'Выучить новый язык', 'Написать книгу', 'Создать семью',
  'Стать знаменитым', 'Помогать другим', 'Изучить космос',
  'Жить у моря', 'Играть на сцене', 'Создать шедевр',
  'Покорить горы', 'Изучить историю', 'Создать изобретение'
];

export default function RoomSetup() {
  const router = useRouter();
  const { id } = router.query;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedDream, setSelectedDream] = useState('');
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
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://energy888-advanced-socket.onrender.com';
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

  const handleProfessionSelect = (profession: string) => {
    setSelectedProfession(profession);
  };

  const handleDreamSelect = (dream: string) => {
    setSelectedDream(dream);
  };

  const handleSaveSetup = () => {
    if (!socket || !room || !selectedProfession || !selectedDream) return;

    // Обновляем данные игрока
    socket.emit('player-setup', {
      roomId: id,
      profession: selectedProfession,
      dream: selectedDream
    });

    // Переходим к игре
    router.push(`/room/${id}`);
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room', { roomId: id });
    }
    router.push('/simple-rooms');
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
        </div>
      </div>
    );
  }

  if (error || !room) {
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
              Настройка персонажа
            </h1>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
              marginTop: '5px'
            }}>
              Комната: {room.name} | Игроков: {room.currentPlayers}/{room.maxPlayers}
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Выбор профессии */}
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
              Выберите профессию
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '10px'
            }}>
              {PROFESSIONS.map((profession) => (
                <button
                  key={profession}
                  onClick={() => handleProfessionSelect(profession)}
                  style={{
                    background: selectedProfession === profession 
                      ? 'linear-gradient(45deg, #4CAF50, #45a049)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: selectedProfession === profession 
                      ? '2px solid #4CAF50' 
                      : '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '12px 8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    textAlign: 'center'
                  }}
                >
                  {profession}
                </button>
              ))}
            </div>
          </div>

          {/* Выбор мечты */}
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
              Выберите мечту
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '8px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {DREAMS.map((dream) => (
                <button
                  key={dream}
                  onClick={() => handleDreamSelect(dream)}
                  style={{
                    background: selectedDream === dream 
                      ? 'linear-gradient(45deg, #2196F3, #1976D2)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: selectedDream === dream 
                      ? '2px solid #2196F3' 
                      : '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    textAlign: 'left'
                  }}
                >
                  {dream}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Кнопка сохранения */}
        <div style={{
          textAlign: 'center'
        }}>
          <button
            onClick={handleSaveSetup}
            disabled={!selectedProfession || !selectedDream}
            style={{
              background: (!selectedProfession || !selectedDream) 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'linear-gradient(45deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '15px 30px',
              cursor: (!selectedProfession || !selectedDream) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: (!selectedProfession || !selectedDream) 
                ? 'none' 
                : '0 4px 15px rgba(76, 175, 80, 0.4)',
              transition: 'all 0.3s ease',
              opacity: (!selectedProfession || !selectedDream) ? 0.5 : 1
            }}
          >
            {(!selectedProfession || !selectedDream) 
              ? 'Выберите профессию и мечту' 
              : 'Начать игру!'}
          </button>
        </div>
      </div>
      
      {/* Дебаг-панель */}
      <DebugRoomsPanel currentRoomId={id as string} />
    </div>
  );
}
