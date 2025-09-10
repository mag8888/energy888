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
  const [isVisible, setIsVisible] = useState(true); // Всегда видим для тестирования

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

  // if (!isConnected) return null; // Убираем для тестирования

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      background: 'red', // Временный цвет для тестирования
      padding: '10px',
      borderRadius: '5px',
      color: 'white',
      fontSize: '12px'
    }}>
      <div>🔧 DEBUG PANEL</div>
      <div>Connected: {isConnected ? '✅' : '❌'}</div>
      <div>Rooms: {debugRooms.length}</div>
      <div>Current: {currentRoomId || 'none'}</div>
    </div>
  );
}
