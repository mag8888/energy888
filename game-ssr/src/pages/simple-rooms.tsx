import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '../contexts/SocketContext';
import { PROFESSIONS, DREAMS, GAME_DURATIONS, TURN_TIMES } from '../data/professions';

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
}

export default function SimpleRooms() {
  const { socket, isConnected } = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    maxPlayers: 4,
    timing: 120,
    gameDuration: 60,
    professionSelectionMode: 'choice',
    assignProfessionToAll: false,
    availableProfessions: PROFESSIONS.map(p => p.id)
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<any>(null);
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

    const handleRoomCreated = (room: Room) => {
      console.log('🏠 Комната создана:', room);
      setRooms(prev => [...prev, room]);
      setMessage('Комната создана успешно!');
      setShowCreateForm(false);
      
      // Автоматически присоединяемся к созданной комнате
      console.log('🚪 Автоматически присоединяемся к комнате:', room.id);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      socket.emit('join-room', {
        roomId: room.id,
        playerName: userData.name || 'Игрок',
        playerEmail: userData.email || 'player@example.com'
      });
      
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
    socket.on('room-created', handleRoomCreated);
    socket.on('rooms-updated', handleRoomsUpdated);
    socket.on('connect_error', handleConnectError);

    // Cleanup при размонтировании
    return () => {
      socket.off('rooms-list', handleRoomsList);
      socket.off('room-created', handleRoomCreated);
      socket.off('rooms-updated', handleRoomsUpdated);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket, isConnected, router]);

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
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '5px 10px',
                          marginRight: '10px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Все
                      </button>
                      <button
                        type="button"
                        onClick={clearAllProfessions}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Очистить
                      </button>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '10px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    padding: '10px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '10px'
                  }}>
                    {PROFESSIONS.map(profession => (
                      <label
                        key={profession.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px',
                          background: createForm.availableProfessions.includes(profession.id) 
                            ? 'rgba(255, 255, 255, 0.2)' 
                            : 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: createForm.availableProfessions.includes(profession.id) 
                            ? '2px solid rgba(255, 255, 255, 0.5)' 
                            : '2px solid transparent',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={createForm.availableProfessions.includes(profession.id)}
                          onChange={() => toggleProfession(profession.id)}
                          style={{ marginRight: '10px' }}
                        />
                        <div>
                          <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                            {profession.icon} {profession.name}
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                            {profession.startingMoney}₽ • {profession.monthlyIncome}₽/мес
                          </div>
                        </div>
                      </label>
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
                    <h3 style={{ color: 'white', margin: '0 0 10px 0' }}>
                      {room.name}
                    </h3>
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
                    disabled={room.players >= room.maxPlayers || room.status !== 'waiting' || !isConnected}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '8px',
                      background: (room.players >= room.maxPlayers || room.status !== 'waiting' || !isConnected)
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      cursor: (room.players >= room.maxPlayers || room.status !== 'waiting' || !isConnected)
                        ? 'not-allowed' 
                        : 'pointer',
                      opacity: (room.players >= room.maxPlayers || room.status !== 'waiting' || !isConnected) ? 0.5 : 1
                    }}
                  >
                    {room.players >= room.maxPlayers ? 'Полная' : 
                     room.status !== 'waiting' ? 'Недоступна' : 
                     !isConnected ? 'Нет подключения' : 'Присоединиться'}
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