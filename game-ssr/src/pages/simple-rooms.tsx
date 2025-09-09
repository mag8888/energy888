import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';

interface Room {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: string;
  timing: number;
  createdAt: number;
}

export default function SimpleRooms() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    maxPlayers: 4,
    timing: 2
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
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
      
      // Запрашиваем список комнат
      newSocket.emit('get-rooms');
    });

    newSocket.on('rooms-list', (roomsList: Room[]) => {
      console.log('📋 Получен список комнат:', roomsList);
      setRooms(roomsList);
    });

    newSocket.on('room-created', (room: Room) => {
      console.log('🏠 Комната создана:', room);
      setRooms(prev => [...prev, room]);
      setMessage('Комната создана успешно!');
      setShowCreateForm(false);
    });

    newSocket.on('rooms-updated', () => {
      console.log('🔄 Список комнат обновлен');
      newSocket.emit('get-rooms');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setMessage('Ошибка подключения к серверу');
    });

    return () => {
      newSocket.close();
    };
  }, [router]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket) return;

    setLoading(true);
    setMessage('');

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const roomData = {
      name: createForm.name || `Комната ${rooms.length + 1}`,
      maxPlayers: createForm.maxPlayers,
      timing: createForm.timing * 60, // конвертируем в секунды
      playerName: userData.name || 'Игрок',
      playerEmail: userData.email || 'player@example.com'
    };

    socket.emit('create-room', roomData);
    setLoading(false);
  };

  const handleJoinRoom = (roomId: string) => {
    if (!socket) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    socket.emit('join-room', {
      roomId,
      playerName: user.name || 'Игрок',
      playerEmail: user.email || 'player@example.com'
    });

    // Переходим в комнату
    router.push(`/room/${roomId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/simple-auth');
  };

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
          <h1 style={{
            color: 'white',
            margin: 0,
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            Energy of Money
          </h1>
          <div>
            <button
              onClick={() => setShowCreateForm(true)}
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
              Создать комнату
            </button>
            <button
              onClick={handleLogout}
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
              Выйти
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            {message}
          </div>
        )}

        {/* Create Room Form */}
        {showCreateForm && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>
              Создать комнату
            </h2>
            <form onSubmit={handleCreateRoom}>
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="Название комнаты"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: 'none',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ color: 'white', display: 'block', marginBottom: '5px' }}>
                    Максимум игроков
                  </label>
                  <select
                    value={createForm.maxPlayers}
                    onChange={(e) => setCreateForm({...createForm, maxPlayers: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: 'none',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '16px'
                    }}
                  >
                    <option value={2}>2 игрока</option>
                    <option value={3}>3 игрока</option>
                    <option value={4}>4 игрока</option>
                    <option value={6}>6 игроков</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ color: 'white', display: 'block', marginBottom: '5px' }}>
                    Время хода
                  </label>
                  <select
                    value={createForm.timing}
                    onChange={(e) => setCreateForm({...createForm, timing: parseInt(e.target.value)})}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: 'none',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontSize: '16px'
                    }}
                  >
                    <option value={1}>1 минута</option>
                    <option value={2}>2 минуты</option>
                    <option value={3}>3 минуты</option>
                    <option value={4}>4 минуты</option>
                    <option value={5}>5 минут</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '15px',
                    border: 'none',
                    borderRadius: '10px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Создание...' : 'Создать'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: '15px 30px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rooms List */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>
            Доступные комнаты ({rooms.length})
          </h2>

          {rooms.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.7)',
              padding: '40px'
            }}>
              Нет доступных комнат. Создайте новую!
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {rooms.map((room) => (
                <div
                  key={room.id}
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
                      {room.name}
                    </h3>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                      Игроков: {room.players}/{room.maxPlayers} • 
                      Время хода: {room.timing / 60} мин • 
                      Статус: {room.status}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.players >= room.maxPlayers || room.status !== 'waiting'}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      background: room.players >= room.maxPlayers || room.status !== 'waiting' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      cursor: room.players >= room.maxPlayers || room.status !== 'waiting' 
                        ? 'not-allowed' 
                        : 'pointer',
                      opacity: room.players >= room.maxPlayers || room.status !== 'waiting' ? 0.5 : 1
                    }}
                  >
                    {room.players >= room.maxPlayers ? 'Полная' : 
                     room.status !== 'waiting' ? 'Недоступна' : 'Присоединиться'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
