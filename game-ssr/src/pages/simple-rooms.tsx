import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSocket } from '../contexts/SocketContext';
import { PROFESSIONS, DREAMS, GAME_DURATIONS, TURN_TIMES } from '../data/professions';
import DebugRoomsPanel from '../components/DebugRoomsPanel';

interface Room {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: string;
  timing: number;
  gameDuration: number;
  createdAt: number;
  professionSelectionMode: string;
  availableProfessions: string[];
  currentPlayers?: number;
  turnTime?: number;
}

export default function SimpleRooms() {
  const { socket, isConnected } = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    maxPlayers: 4,
    timing: 120,
    gameDuration: 180, // 3 часа по умолчанию
    professionSelectionMode: 'choice',
    assignProfessionToAll: false,
    availableProfessions: ['entrepreneur'] // По умолчанию только Предприниматель
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [playerRooms, setPlayerRooms] = useState<Set<string>>(new Set());
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
      
      // Загружаем комнаты игрока из localStorage
      const savedRooms = localStorage.getItem(`player_rooms_${userData.email || userData.name}`);
      if (savedRooms) {
        try {
          const rooms = JSON.parse(savedRooms);
          setPlayerRooms(new Set(rooms));
          console.log('🏠 Загружены комнаты игрока:', rooms);
        } catch (error) {
          console.error('❌ Ошибка загрузки комнат игрока:', error);
        }
      }
    } catch (error) {
      console.error('❌ Ошибка парсинга данных пользователя:', error);
    }
  }, [router]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('🔌 Socket подключен, настраиваем обработчики');

    // Запрашиваем список комнат
    socket.emit('get-rooms');

    // Обработчики событий
    const handleRoomsList = (roomsList: Room[]) => {
      console.log('📋 Получен список комнат:', roomsList);
      setRooms(roomsList);
    };

    const handleRoomJoined = (roomData: any) => {
      console.log('🏠 Комната создана и присоединение:', roomData);
      
      // Преобразуем данные сервера в формат, ожидаемый интерфейсом
      const room: Room = {
        id: roomData.id,
        name: roomData.name,
        players: roomData.currentPlayers || roomData.players || 0,
        maxPlayers: roomData.maxPlayers,
        status: roomData.status || 'waiting',
        timing: roomData.turnTime || roomData.timing || 120,
        gameDuration: Math.floor((roomData.gameDurationSec || 3600) / 60), // конвертируем в минуты
        createdAt: Date.now(),
        professionSelectionMode: 'choice',
        availableProfessions: [],
        currentPlayers: roomData.currentPlayers || roomData.players || 0,
        turnTime: roomData.turnTime || roomData.timing || 120
      };
      
      setRooms(prev => [...prev, room]);
      setMessage('Комната создана успешно!');
      setShowCreateForm(false);
      
      // Сохраняем комнату для игрока
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userKey = userData.email || userData.name;
      if (userKey) {
        const currentRooms = Array.from(playerRooms);
        if (!currentRooms.includes(room.id)) {
          currentRooms.push(room.id);
          setPlayerRooms(new Set(currentRooms));
          localStorage.setItem(`player_rooms_${userKey}`, JSON.stringify(currentRooms));
          console.log('💾 Созданная комната сохранена для игрока:', room.id);
        }
      }
      
      // Переходим в комнату
      setTimeout(() => {
        router.push(`/room/${room.id}`);
      }, 500);
    };

    const handleRoomsUpdated = () => {
      console.log('🔄 Список комнат обновлен');
      socket.emit('get-rooms');
    };

    const handleConnectError = (error: any) => {
      console.error('❌ Socket connection error:', error);
      setMessage('Ошибка подключения к серверу');
    };

    // Подписываемся на события
    socket.on('rooms-list', handleRoomsList);
    socket.on('room-joined', handleRoomJoined);
    socket.on('rooms-updated', handleRoomsUpdated);
    socket.on('connect_error', handleConnectError);

    // Cleanup при размонтировании
    return () => {
      socket.off('rooms-list', handleRoomsList);
      socket.off('room-joined', handleRoomJoined);
      socket.off('rooms-updated', handleRoomsUpdated);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket, isConnected, router]);

  // Обновляем список комнат каждые 5 секунд
  useEffect(() => {
    if (!socket || !isConnected) return;

    const interval = setInterval(() => {
      console.log('🔄 Принудительное обновление списка комнат');
      socket.emit('get-rooms');
    }, 5000);

    return () => clearInterval(interval);
  }, [socket, isConnected]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !isConnected) {
      setMessage('Нет подключения к серверу');
      return;
    }

    setLoading(true);
    setMessage('');

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const roomData = {
      name: createForm.name || `Комната ${rooms.length + 1}`,
      maxPlayers: createForm.maxPlayers,
      timing: createForm.timing,
      gameDurationSec: createForm.gameDuration * 60, // конвертируем в секунды
      playerName: userData.name || 'Игрок',
      playerEmail: userData.email || 'player@example.com',
      professionSelectionMode: createForm.professionSelectionMode,
      assignProfessionToAll: createForm.assignProfessionToAll,
      availableProfessions: createForm.availableProfessions
    };

    console.log('🏠 Создаем комнату:', roomData);
    socket.emit('create-room', roomData);
    setLoading(false);
  };

  const handleJoinRoom = (roomId: string) => {
    if (!socket || !isConnected) {
      setMessage('Нет подключения к серверу');
      return;
    }

    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('🚪 Присоединяемся к комнате:', roomId);
    
    // Сохраняем комнату игрока
    const userKey = userData.email || userData.name;
    if (userKey) {
      const currentRooms = Array.from(playerRooms);
      if (!currentRooms.includes(roomId)) {
        currentRooms.push(roomId);
        setPlayerRooms(new Set(currentRooms));
        localStorage.setItem(`player_rooms_${userKey}`, JSON.stringify(currentRooms));
        console.log('💾 Комната сохранена для игрока:', roomId);
      }
    }
    
    socket.emit('join-room', {
      roomId,
      playerName: userData.name || 'Игрок',
      playerEmail: userData.email || 'player@example.com'
    });

    // Переходим в комнату
    router.push(`/room/${roomId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/simple-auth');
  };

  const toggleProfession = (professionId: string) => {
    setCreateForm(prev => ({
      ...prev,
      availableProfessions: prev.availableProfessions.includes(professionId)
        ? prev.availableProfessions.filter(id => id !== professionId)
        : [...prev.availableProfessions, professionId]
    }));
  };

  const selectAllProfessions = () => {
    setCreateForm(prev => ({
      ...prev,
      availableProfessions: PROFESSIONS.map(p => p.id)
    }));
  };

  const clearAllProfessions = () => {
    setCreateForm(prev => ({
      ...prev,
      availableProfessions: []
    }));
  };

  return (
    <>
      <style jsx>{`
        .profession-card:hover .profession-hover-effect {
          opacity: 1 !important;
        }
        .profession-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.15) !important;
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
              Energy of Money
            </h1>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
              marginTop: '5px'
            }}>
              Добро пожаловать, {userData?.name || 'Игрок'}!
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
              onClick={() => setShowCreateForm(true)}
              disabled={!isConnected}
              style={{
                background: isConnected ? 'linear-gradient(45deg, #ff6b6b, #ee5a24)' : 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                marginRight: '10px',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '16px',
                boxShadow: isConnected ? '0 4px 15px rgba(255, 107, 107, 0.4)' : 'none',
                transition: 'all 0.3s ease',
                opacity: isConnected ? 1 : 0.5
              }}
            >
              Создать комнату
            </button>
            <button
              onClick={() => {
                if (socket) {
                  console.log('🔄 Ручное обновление списка комнат');
                  socket.emit('get-rooms');
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                marginRight: '10px'
              }}
            >
              🔄 Обновить
            </button>
            <Link href="/hall-of-fame" style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              display: 'inline-block',
              marginRight: '10px'
            }}>
              🏆 Зал Славы
            </Link>
            <Link
              href="/game-board"
              style={{
                background: 'linear-gradient(45deg, #9C27B0, #7B1FA2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
                display: 'inline-block',
                marginRight: '10px',
                boxShadow: '0 4px 15px rgba(156, 39, 176, 0.4)'
              }}>
              🎮 Игровая доска
            </Link>
            <Link
              href="/original-board"
              style={{
                background: 'linear-gradient(45deg, #FF6B6B, #EE5A24)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
                display: 'inline-block',
                marginRight: '10px',
                boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)'
              }}>
              🎯 Полная доска (24+52)
            </Link>
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
              {/* Название комнаты */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Название комнаты
                </label>
                <input
                  type="text"
                  placeholder="Введите название комнаты"
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

              {/* Основные настройки */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ color: 'white', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
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
                    <option value={8}>8 игроков</option>
                    <option value={10}>10 игроков</option>
                  </select>
                </div>

                <div>
                  <label style={{ color: 'white', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
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
                    {TURN_TIMES.map(time => (
                      <option key={time.value} value={time.value}>{time.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ color: 'white', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Длительность игры
                  </label>
                  <select
                    value={createForm.gameDuration}
                    onChange={(e) => setCreateForm({...createForm, gameDuration: parseInt(e.target.value)})}
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
                    {GAME_DURATIONS.map(duration => (
                      <option key={duration.value} value={duration.value}>{duration.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Режим выбора профессий */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: 'white', display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                  Режим выбора профессий
                </label>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                  <label style={{ color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="professionMode"
                      value="choice"
                      checked={createForm.professionSelectionMode === 'choice'}
                      onChange={(e) => setCreateForm({...createForm, professionSelectionMode: e.target.value})}
                      style={{ marginRight: '8px' }}
                    />
                    Выбор игрока
                  </label>
                  <label style={{ color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="professionMode"
                      value="random"
                      checked={createForm.professionSelectionMode === 'random'}
                      onChange={(e) => setCreateForm({...createForm, professionSelectionMode: e.target.value})}
                      style={{ marginRight: '8px' }}
                    />
                    Случайно
                  </label>
                  <label style={{ color: 'white', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="professionMode"
                      value="assigned"
                      checked={createForm.professionSelectionMode === 'assigned'}
                      onChange={(e) => setCreateForm({...createForm, professionSelectionMode: e.target.value})}
                      style={{ marginRight: '8px' }}
                    />
                    Назначить всем
                  </label>
                </div>
              </div>

              {/* Выбор профессий */}
              {createForm.professionSelectionMode !== 'random' && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <label style={{ color: 'white', fontWeight: 'bold' }}>
                      Доступные профессии ({createForm.availableProfessions.length}/{PROFESSIONS.length})
                    </label>
                    <div>
                      <button
                        type="button"
                        onClick={selectAllProfessions}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '10px',
                          padding: '12px 20px',
                          marginRight: '10px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        ✅ Все
                      </button>
                      <button
                        type="button"
                        onClick={clearAllProfessions}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '10px',
                          padding: '12px 20px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        🗑️ Очистить
                      </button>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '15px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {PROFESSIONS.map(profession => (
                      <div
                        key={profession.id}
                        className="profession-card"
                        onClick={() => toggleProfession(profession.id)}
                        style={{
                          position: 'relative',
                          background: createForm.availableProfessions.includes(profession.id) 
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))' 
                            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          border: createForm.availableProfessions.includes(profession.id) 
                            ? '2px solid rgba(255, 255, 255, 0.4)' 
                            : '2px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease',
                          boxShadow: createForm.availableProfessions.includes(profession.id) 
                            ? '0 4px 15px rgba(255, 255, 255, 0.1)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.1)',
                          transform: createForm.availableProfessions.includes(profession.id) 
                            ? 'translateY(-2px)' 
                            : 'translateY(0)'
                        }}
                      >
                        {/* Checkbox indicator */}
                        {createForm.availableProfessions.includes(profession.id) && (
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '20px',
                            height: '20px',
                            background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: 'white',
                            fontWeight: 'bold'
                          }}>
                            ✓
                          </div>
                        )}
                        
                        {/* Profession icon and name */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            fontSize: '24px',
                            marginRight: '8px'
                          }}>
                            {profession.icon}
                          </div>
                          <div style={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            flex: 1
                          }}>
                            {profession.name}
                          </div>
                        </div>
                        
                        {/* Financial info */}
                        <div style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '12px',
                          lineHeight: '1.4'
                        }}>
                          <div style={{ marginBottom: '2px' }}>
                            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                              {profession.startingMoney}₽
                            </span>
                            {' • '}
                            <span style={{ color: '#FFC107', fontWeight: 'bold' }}>
                              {profession.monthlyIncome}₽/мес
                            </span>
                          </div>
                          {profession.cashFlow && (
                            <div style={{ color: '#2196F3', fontSize: '11px' }}>
                              Поток: {profession.cashFlow}₽
                            </div>
                          )}
                        </div>
                        
                        {/* Hover effect */}
                        <div 
                          className="profession-hover-effect"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent)',
                            borderRadius: '12px',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            pointerEvents: 'none'
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопки */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={loading || !isConnected}
                  style={{
                    flex: 1,
                    padding: '15px',
                    border: 'none',
                    borderRadius: '10px',
                    background: isConnected ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: (loading || !isConnected) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !isConnected) ? 0.7 : 1
                  }}
                >
                  {loading ? 'Создание...' : 'Создать комнату'}
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
              {isConnected ? 'Нет доступных комнат. Создайте новую!' : 'Подключение к серверу...'}
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
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <h3 style={{ color: 'white', margin: 0 }}>
                        {room.name}
                      </h3>
                      {playerRooms.has(room.id) && (
                        <span style={{
                          background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          МОЯ КОМНАТА
                        </span>
                      )}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '5px' }}>
                      Игроков: {room.players}/{room.maxPlayers} • 
                      Время хода: {room.timing / 60} мин • 
                      Длительность: {room.gameDuration} мин • 
                      Статус: {room.status}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                      Профессии: {room.professionSelectionMode === 'choice' ? 'Выбор' : 
                                 room.professionSelectionMode === 'random' ? 'Случайно' : 'Назначены'} • 
                      Доступно: {room.availableProfessions?.length || 0}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={(!playerRooms.has(room.id) && (room.players >= room.maxPlayers || room.status !== 'waiting')) || !isConnected}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      background: ((!playerRooms.has(room.id) && (room.players >= room.maxPlayers || room.status !== 'waiting')) || !isConnected)
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : playerRooms.has(room.id) && room.status === 'playing'
                        ? 'linear-gradient(45deg, #4CAF50, #45a049)' // Зеленая для повторного входа
                        : 'linear-gradient(45deg, #667eea, #764ba2)', // Синяя для обычного входа
                      color: 'white',
                      cursor: ((!playerRooms.has(room.id) && (room.players >= room.maxPlayers || room.status !== 'waiting')) || !isConnected)
                        ? 'not-allowed' 
                        : 'pointer',
                      opacity: ((!playerRooms.has(room.id) && (room.players >= room.maxPlayers || room.status !== 'waiting')) || !isConnected) ? 0.5 : 1
                    }}
                  >
                    {!isConnected ? 'Нет подключения' :
                     playerRooms.has(room.id) && room.status === 'playing' ? 'Войти' :
                     playerRooms.has(room.id) && room.status !== 'playing' ? 'Войти' :
                     room.players >= room.maxPlayers ? 'Полная' : 
                     room.status !== 'waiting' ? 'Недоступна' : 'Присоединиться'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Дебаг-панель */}
      <DebugRoomsPanel />
      </div>
    </>
  );
}