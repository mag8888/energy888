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
  creator: string;
  maxPlayers: number;
  players: Player[];
  started: boolean;
  professionSelectionMode: string;
  availableProfessions: string[];
  timing: number;
  createdAt: string;
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

export default function AdvancedRoom() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [selectedProfession, setSelectedProfession] = useState('');
  const [selectedDream, setSelectedDream] = useState('');
  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const [showDreamModal, setShowDreamModal] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;

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

    // Подключаемся к Socket.IO
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://energy888-advanced-socket.onrender.com';
    console.log('🔌 Подключаемся к Advanced Socket.IO:', socketUrl);
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.connected);
      setSocket(newSocket);
      
      // Запрашиваем информацию о комнате
      newSocket.emit('get-room-info', { roomId: id });
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setSocket(null);
    });

    newSocket.on('room-info', (roomData: Room) => {
      console.log('🏠 Информация о комнате:', roomData);
      setRoom(roomData);
      setLoading(false);
      
      // Находим текущего игрока
      const currentPlayer = roomData.players.find(p => p.socketId === newSocket.id);
      if (currentPlayer) {
        setSelectedProfession(currentPlayer.profession || '');
        setSelectedDream(currentPlayer.dream || '');
      }
    });

    newSocket.on('room-info-error', (error: any) => {
      console.error('❌ Ошибка получения информации о комнате:', error);
      setMessage(`Ошибка: ${error.error}`);
      setLoading(false);
    });

    newSocket.on('player-joined', (data: { player: Player; players: Player[] }) => {
      console.log('👤 Игрок присоединился:', data.player.name);
      setRoom(prev => prev ? { ...prev, players: data.players } : null);
    });

    newSocket.on('player-left', (data: { player: Player; players: Player[] }) => {
      console.log('👋 Игрок покинул комнату:', data.player.name);
      setRoom(prev => prev ? { ...prev, players: data.players } : null);
    });

    newSocket.on('player-updated', (data: { player: Player; players: Player[] }) => {
      console.log('⚙️ Игрок обновлен:', data.player.name);
      setRoom(prev => prev ? { ...prev, players: data.players } : null);
    });

    newSocket.on('player-ready-updated', (data: { player: Player; players: Player[] }) => {
      console.log('✅ Готовность игрока обновлена:', data.player.name);
      setRoom(prev => prev ? { ...prev, players: data.players } : null);
    });

    newSocket.on('game-started', (data: any) => {
      console.log('🎮 Игра началась!');
      setRoom(prev => prev ? { ...prev, started: true } : null);
      setMessage('🎉 Игра началась! Удачи!');
    });

    newSocket.on('join-room-error', (error: any) => {
      console.error('❌ Ошибка присоединения к комнате:', error);
      setMessage(`Ошибка: ${error.error}`);
    });

    newSocket.on('setup-error', (error: any) => {
      console.error('❌ Ошибка настройки игрока:', error);
      setMessage(`Ошибка: ${error.error}`);
    });

    newSocket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
      setMessage(`Ошибка: ${error.message}`);
    });

    return () => {
      newSocket.close();
    };
  }, [id, router]);

  const handleProfessionSelect = (profession: string) => {
    if (!socket || !room) return;

    setSelectedProfession(profession);
    setShowProfessionModal(false);

    socket.emit('player-setup', {
      roomId: room.id,
      profession: profession,
      dream: selectedDream
    });
  };

  const handleDreamSelect = (dream: string) => {
    if (!socket || !room) return;

    setSelectedDream(dream);
    setShowDreamModal(false);

    socket.emit('player-setup', {
      roomId: room.id,
      profession: selectedProfession,
      dream: dream
    });
  };

  const handleReadyToggle = () => {
    if (!socket || !room) return;

    socket.emit('player-ready', { roomId: room.id });
  };

  const handleLeaveRoom = () => {
    if (!socket || !room) return;

    socket.emit('leave-room', { roomId: room.id });
    router.push('/advanced-rooms');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>Загрузка комнаты...</h2>
          <p style={{ color: '#718096' }}>Подключаемся к серверу...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>❌</div>
          <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>Комната не найдена</h2>
          <p style={{ color: '#718096', marginBottom: '20px' }}>Комната не существует или была удалена</p>
          <button
            onClick={() => router.push('/advanced-rooms')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🏠 Вернуться к списку комнат
          </button>
        </div>
      </div>
    );
  }

  const currentPlayer = room.players.find(p => p.socketId === socket?.id);
  const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);

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
            🏠 {room.name}
          </h1>
          <p style={{ color: '#718096', fontSize: '1.1rem' }}>
            Создатель: {room.creator} • Игроков: {room.players.length}/{room.maxPlayers}
          </p>
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

        {/* Game Status */}
        {room.started ? (
          <div style={{
            background: '#c6f6d5',
            color: '#2f855a',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            marginBottom: '30px',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            🎮 Игра началась! Удачи всем игрокам!
          </div>
        ) : (
          <div style={{
            background: '#bee3f8',
            color: '#2b6cb0',
            padding: '20px',
            borderRadius: '15px',
            textAlign: 'center',
            marginBottom: '30px',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}>
            ⏳ Ожидание игроков... {allReady ? 'Все готовы!' : 'Настройте персонажа и нажмите "Готов"'}
          </div>
        )}

        {/* Players List */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ 
            color: '#2d3748', 
            marginBottom: '20px', 
            fontSize: '1.8rem',
            textAlign: 'center'
          }}>
            👥 Игроки ({room.players.length})
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {room.players.map(player => (
              <div
                key={player.id}
                style={{
                  background: player.socketId === socket?.id ? '#e6fffa' : 'white',
                  borderRadius: '15px',
                  padding: '20px',
                  border: player.socketId === socket?.id ? '3px solid #38b2ac' : '2px solid #e2e8f0',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}
              >
                {player.socketId === socket?.id && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: '#38b2ac',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    ВЫ
                  </div>
                )}
                
                <h3 style={{ 
                  color: '#2d3748', 
                  marginBottom: '15px',
                  fontSize: '1.3rem',
                  fontWeight: 'bold'
                }}>
                  {player.name}
                </h3>
                
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ color: '#4a5568', margin: '5px 0' }}>
                    🎭 Профессия: {player.profession || 'Не выбрана'}
                  </p>
                  <p style={{ color: '#4a5568', margin: '5px 0' }}>
                    🌟 Мечта: {player.dream || 'Не выбрана'}
                  </p>
                  <p style={{ color: '#4a5568', margin: '5px 0' }}>
                    💰 Деньги: {player.money}
                  </p>
                  <p style={{ color: '#4a5568', margin: '5px 0' }}>
                    📅 Присоединился: {new Date(player.joinedAt).toLocaleString()}
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    background: player.isReady ? '#c6f6d5' : '#fed7d7',
                    color: player.isReady ? '#2f855a' : '#c53030',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    {player.isReady ? '✅ Готов' : '⏳ Не готов'}
                  </div>
                  
                  {player.socketId === socket?.id && (
                    <button
                      onClick={handleReadyToggle}
                      style={{
                        background: player.isReady 
                          ? 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)' 
                          : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {player.isReady ? '❌ Не готов' : '✅ Готов'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Setup */}
        {currentPlayer && !room.started && (
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
                  🎭 Профессия:
                </label>
                <div style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '15px',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: selectedProfession ? '#2d3748' : '#a0aec0'
                }}
                onClick={() => setShowProfessionModal(true)}
                >
                  {selectedProfession || 'Выберите профессию...'}
                </div>
              </div>

              {/* Dream Selection */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  fontWeight: 'bold',
                  color: '#4a5568'
                }}>
                  🌟 Мечта:
                </label>
                <div style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '15px',
                  border: '2px solid #e2e8f0',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: selectedDream ? '#2d3748' : '#a0aec0'
                }}
                onClick={() => setShowDreamModal(true)}
                >
                  {selectedDream || 'Выберите мечту...'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleLeaveRoom}
            style={{
              background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginRight: '20px',
              boxShadow: '0 4px 15px rgba(245, 101, 101, 0.4)'
            }}
          >
            🚪 Покинуть комнату
          </button>
          
          <button
            onClick={() => router.push('/advanced-rooms')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
            }}
          >
            🏠 К списку комнат
          </button>
        </div>

        {/* Profession Modal */}
        {showProfessionModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 style={{ 
                color: '#2d3748', 
                marginBottom: '20px', 
                fontSize: '1.5rem',
                textAlign: 'center'
              }}>
                🎭 Выберите профессию
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                {PROFESSIONS.map(prof => (
                  <button
                    key={prof}
                    onClick={() => handleProfessionSelect(prof)}
                    style={{
                      background: selectedProfession === prof 
                        ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
                        : 'white',
                      color: selectedProfession === prof ? 'white' : '#2d3748',
                      border: '2px solid #e2e8f0',
                      padding: '15px',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {prof}
                  </button>
                ))}
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setShowProfessionModal(false)}
                  style={{
                    background: '#a0aec0',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dream Modal */}
        {showDreamModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 style={{ 
                color: '#2d3748', 
                marginBottom: '20px', 
                fontSize: '1.5rem',
                textAlign: 'center'
              }}>
                🌟 Выберите мечту
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                {DREAMS.map(dream => (
                  <button
                    key={dream}
                    onClick={() => handleDreamSelect(dream)}
                    style={{
                      background: selectedDream === dream 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'white',
                      color: selectedDream === dream ? 'white' : '#2d3748',
                      border: '2px solid #e2e8f0',
                      padding: '15px',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {dream}
                  </button>
                ))}
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setShowDreamModal(false)}
                  style={{
                    background: '#a0aec0',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Отмена
                </button>
              </div>
            </div>
          </div>
        )}

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
