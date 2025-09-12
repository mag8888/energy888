import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
  email: string;
  socketId: string;
  isReady: boolean;
  profession: string;
  dream: string;
  selectedProfession: string;
  professionConfirmed: boolean;
  joinedAt: string;
  money: number;
  position: number;
  cards: any[];
  isActive: boolean;
}

interface Room {
  id: string;
  name: string;
  maxPlayers: number;
  currentPlayers: number;
  started: boolean;
  createdAt: string;
  creator: string;
  players: Player[];
  professionSelectionMode: string;
  availableProfessions: string[];
  timing: number;
}

interface CreateRoomData {
  name: string;
  maxPlayers: number;
  timing: number;
  creatorUsername: string;
  creatorProfession: string;
  creatorDream: string;
  assignProfessionToAll: boolean;
  professionSelectionMode: string;
  password: string;
}

const PROFESSIONS = [
  'Предприниматель', 'Инвестор', 'Финансист', 'Консультант', 
  'Менеджер', 'Аналитик', 'Трейдер', 'Банкир'
];

const DREAMS = [
  'Финансовая независимость', 'Собственный бизнес', 'Инвестиционный портфель',
  'Пассивный доход', 'Международная карьера', 'Образовательный центр',
  'Благотворительный фонд', 'Технологический стартап'
];

export default function AdvancedRooms() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateRoomData>({
    name: '',
    maxPlayers: 4,
    timing: 120,
    creatorUsername: '',
    creatorProfession: '',
    creatorDream: '',
    assignProfessionToAll: false,
    professionSelectionMode: 'assigned',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedDream, setSelectedDream] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Проверяем авторизацию
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/simple-auth');
      return;
    }

    // Загружаем данные пользователя
    try {
      const userData = JSON.parse(user);
      setUserData(userData);
      setCreateForm(prev => ({
        ...prev,
        creatorUsername: userData.name || 'Игрок',
        creatorProfession: userData.profession || '',
        creatorDream: userData.dream || ''
      }));
    } catch (error) {
      console.error('❌ Ошибка парсинга данных пользователя:', error);
    }

    // Подключаемся к Socket.IO
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://botenergy-7to1-production.up.railway.app';
    console.log('🔌 Подключаемся к Advanced Socket.IO:', socketUrl);
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.connected);
      setSocket(newSocket);
      
      // Запрашиваем список комнат
      newSocket.emit('get-rooms');
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setSocket(null);
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
      
      // Автоматически присоединяемся к созданной комнате
      console.log('🚪 Автоматически присоединяемся к комнате:', room.id);
      newSocket.emit('join-room', {
        roomId: room.id,
        playerName: userData?.name || 'Игрок',
        playerEmail: userData?.email || 'player@example.com',
        profession: selectedProfession,
        dream: selectedDream
      });
      
      // Переходим в комнату
      setTimeout(() => {
        router.push(`/advanced-room/${room.id}`);
      }, 500);
    });

    newSocket.on('join-room-error', (error: any) => {
      console.error('❌ Ошибка присоединения к комнате:', error);
      setMessage(`Ошибка: ${error.error}`);
    });

    newSocket.on('rooms-updated', () => {
      console.log('🔄 Обновляем список комнат...');
      newSocket.emit('get-rooms');
    });

    newSocket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
      setMessage(`Ошибка: ${error.message}`);
    });

    return () => {
      newSocket.close();
    };
  }, [router, userData?.name, userData?.email, selectedProfession, selectedDream]);

  const handleCreateRoom = () => {
    if (!socket) {
      setMessage('Нет подключения к серверу');
      return;
    }

    if (!createForm.name.trim()) {
      setMessage('Введите название комнаты');
      return;
    }

    setLoading(true);
    setMessage('');

    socket.emit('create-room', createForm);
  };

  const handleJoinRoom = (roomId: string) => {
    if (!socket) {
      setMessage('Нет подключения к серверу');
      return;
    }

    setLoading(true);
    setMessage('');

    socket.emit('join-room', {
      roomId,
      playerName: userData?.name || 'Игрок',
      playerEmail: userData?.email || 'player@example.com',
      profession: selectedProfession,
      dream: selectedDream
    });

    // Переходим в комнату
    setTimeout(() => {
      router.push(`/advanced-room/${roomId}`);
    }, 500);
  };

  const handleProfessionChange = (profession: string) => {
    setSelectedProfession(profession);
  };

  const handleDreamChange = (dream: string) => {
    setSelectedDream(dream);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            color: '#2d3748', 
            fontSize: '2.5rem', 
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            🎮 Energy of Money - Advanced Rooms
          </h1>
          <p style={{ color: '#718096', fontSize: '1.1rem' }}>
            Добро пожаловать, {userData?.name || 'Игрок'}! Выберите профессию и мечту для игры.
          </p>
        </div>

        {/* Profession and Dream Selection */}
        <div style={{
          background: '#f7fafc',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          border: '2px solid #e2e8f0'
        }}>
          <h3 style={{ color: '#2d3748', marginBottom: '20px', fontSize: '1.3rem' }}>
            ⚙️ Настройка персонажа
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Profession Selection */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: 'bold',
                color: '#4a5568'
              }}>
                🎭 Выберите профессию:
              </label>
              <select
                value={selectedProfession}
                onChange={(e) => handleProfessionChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  background: 'white'
                }}
              >
                <option value="">Выберите профессию...</option>
                {PROFESSIONS.map(prof => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
            </div>

            {/* Dream Selection */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontWeight: 'bold',
                color: '#4a5568'
              }}>
                🌟 Выберите мечту:
              </label>
              <select
                value={selectedDream}
                onChange={(e) => handleDreamChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e2e8f0',
                  fontSize: '16px',
                  background: 'white'
                }}
              >
                <option value="">Выберите мечту...</option>
                {DREAMS.map(dream => (
                  <option key={dream} value={dream}>{dream}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{
            background: message.includes('Ошибка') ? '#fed7d7' : '#c6f6d5',
            color: message.includes('Ошибка') ? '#c53030' : '#2f855a',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {message}
          </div>
        )}

        {/* Create Room Button */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            {showCreateForm ? '❌ Отмена' : '➕ Создать комнату'}
          </button>
        </div>

        {/* Create Room Form */}
        {showCreateForm && (
          <div style={{
            background: '#f7fafc',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '30px',
            border: '2px solid #e2e8f0'
          }}>
            <h3 style={{ color: '#2d3748', marginBottom: '20px', fontSize: '1.3rem' }}>
              🏠 Создание комнаты
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#4a5568'
                }}>
                  Название комнаты:
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название комнаты"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#4a5568'
                }}>
                  Максимум игроков:
                </label>
                <select
                  value={createForm.maxPlayers}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px'
                  }}
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} игроков</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#4a5568'
                }}>
                  Время хода (секунды):
                </label>
                <select
                  value={createForm.timing}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, timing: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px'
                  }}
                >
                  <option value={60}>60 секунд</option>
                  <option value={90}>90 секунд</option>
                  <option value={120}>120 секунд</option>
                  <option value={180}>180 секунд</option>
                  <option value={300}>300 секунд</option>
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#4a5568'
                }}>
                  Режим выбора профессий:
                </label>
                <select
                  value={createForm.professionSelectionMode}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, professionSelectionMode: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    fontSize: '16px'
                  }}
                >
                  <option value="choice">Выбор игроками</option>
                  <option value="random">Случайный</option>
                  <option value="assigned">Назначенные</option>
                </select>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                style={{
                  background: loading ? '#a0aec0' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '25px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? '⏳ Создание...' : '🚀 Создать комнату'}
              </button>
            </div>
          </div>
        )}

        {/* Rooms List */}
        <div>
          <h2 style={{ 
            color: '#2d3748', 
            marginBottom: '20px', 
            fontSize: '1.8rem',
            textAlign: 'center'
          }}>
            🏠 Доступные комнаты ({rooms.length})
          </h2>
          
          {rooms.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#718096',
              fontSize: '1.1rem'
            }}>
              Нет доступных комнат. Создайте новую!
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {rooms.map(room => (
                <div
                  key={room.id}
                  style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '20px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                  }}
                >
                  <h3 style={{ 
                    color: '#2d3748', 
                    marginBottom: '15px',
                    fontSize: '1.3rem',
                    fontWeight: 'bold'
                  }}>
                    {room.name}
                  </h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ color: '#4a5568', margin: '5px 0' }}>
                      👥 Игроки: {room.currentPlayers}/{room.maxPlayers}
                    </p>
                    <p style={{ color: '#4a5568', margin: '5px 0' }}>
                      ⏱️ Время хода: {room.timing} сек
                    </p>
                    <p style={{ color: '#4a5568', margin: '5px 0' }}>
                      👤 Создатель: {room.creator}
                    </p>
                    <p style={{ color: '#4a5568', margin: '5px 0' }}>
                      🎭 Режим профессий: {room.professionSelectionMode}
                    </p>
                    <p style={{ color: '#4a5568', margin: '5px 0' }}>
                      📅 Создана: {new Date(room.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={loading || room.started || room.currentPlayers >= room.maxPlayers}
                    style={{
                      width: '100%',
                      background: room.started || room.currentPlayers >= room.maxPlayers 
                        ? '#a0aec0' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: room.started || room.currentPlayers >= room.maxPlayers 
                        ? 'not-allowed' 
                        : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {room.started 
                      ? '🎮 Игра началась' 
                      : room.currentPlayers >= room.maxPlayers 
                        ? '❌ Комната заполнена'
                        : loading 
                          ? '⏳ Присоединение...'
                          : '🚪 Присоединиться'
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: socket?.connected ? '#c6f6d5' : '#fed7d7',
          color: socket?.connected ? '#2f855a' : '#c53030',
          padding: '10px 15px',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          {socket?.connected ? '🟢 Подключено' : '🔴 Отключено'}
        </div>
      </div>
    </div>
  );
}
