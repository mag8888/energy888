import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSocket } from '../contexts/SocketContext';

interface DebugRoomsPanelProps {
  currentRoomId?: string;
}

export default function DebugRoomsPanel({ currentRoomId }: DebugRoomsPanelProps) {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [debugRooms, setDebugRooms] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Загружаем список комнат при подключении
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('get-rooms');
    }
  }, [socket, isConnected]);

  // Обработчик получения списка комнат
  useEffect(() => {
    if (!socket) return;

    const handleRoomsList = (rooms: any[]) => {
      console.log('🏠 Получен список комнат для дебага:', rooms);
      setDebugRooms(rooms);
    };

    socket.on('rooms-list', handleRoomsList);

    return () => {
      socket.off('rooms-list', handleRoomsList);
    };
  }, [socket]);

  const handleGetDebugRooms = () => {
    if (socket) {
      socket.emit('get-rooms');
    }
  };

  const handleDebugRoomClick = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isConnected) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {/* Кнопка переключения видимости */}
      <button
        onClick={toggleVisibility}
        style={{
          padding: '10px 15px',
          background: 'linear-gradient(45deg, #2196F3, #1976D2)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
          transition: 'all 0.3s ease',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        🔧 {isVisible ? 'Скрыть' : 'Показать'} комнаты
        <span style={{
          background: 'rgba(255, 255, 255, 0.2)',
          padding: '2px 6px',
          borderRadius: '10px',
          fontSize: '10px'
        }}>
          {debugRooms.length}
        </span>
      </button>

      {/* Панель с комнатами */}
      {isVisible && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(15px)',
          borderRadius: '15px',
          padding: '20px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          maxWidth: '300px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ 
              color: 'white', 
              margin: 0, 
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🏠 Комнаты
              <span style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px'
              }}>
                {debugRooms.length}
              </span>
            </h3>
            <button
              onClick={handleGetDebugRooms}
              style={{
                padding: '6px 12px',
                background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              🔄
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {debugRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleDebugRoomClick(room.id)}
                style={{
                  padding: '10px 12px',
                  background: room.id === currentRoomId 
                    ? 'linear-gradient(45deg, #4CAF50, #45a049)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: room.id === currentRoomId 
                    ? '2px solid #4CAF50' 
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (room.id !== currentRoomId) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (room.id !== currentRoomId) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {room.id === currentRoomId ? '📍 ' : '🏠 '}{room.name}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  opacity: 0.8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>👥 {room.players || 0}/{room.maxPlayers}</span>
                  <span style={{
                    color: room.started ? '#4CAF50' : '#ff9800',
                    fontWeight: 'bold'
                  }}>
                    {room.started ? '🎮' : '⏳'}
                  </span>
                </div>
              </button>
            ))}
            
            {debugRooms.length === 0 && (
              <div style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                Нет доступных комнат
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
