import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  socketUrl: string;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  socketUrl: ''
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketUrl, setSocketUrl] = useState('');

  useEffect(() => {
    // Определяем URL для Socket
    const qp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const qpUrl = qp?.get('socket') || undefined;
    const lsUrl = typeof window !== 'undefined' ? (localStorage.getItem('SOCKET_URL') || undefined) : undefined;
    const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const resolvedUrl = qpUrl || lsUrl || envUrl || 'https://energy888-advanced-socket.onrender.com';
    
    if (lsUrl !== resolvedUrl && typeof window !== 'undefined') {
      localStorage.setItem('SOCKET_URL', resolvedUrl);
    }
    
    setSocketUrl(resolvedUrl);
    
    console.log('🔌 Глобальный Socket подключается к:', resolvedUrl);
    console.log('🔍 NEXT_PUBLIC_SOCKET_URL:', process.env.NEXT_PUBLIC_SOCKET_URL);
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 Override socket from:', qpUrl ? 'query' : lsUrl ? 'localStorage' : 'env/default');

    // Создаем Socket соединение
    const newSocket = io(resolvedUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false // Не создавать новое соединение, если уже есть
    });

    // Обработчики событий
    newSocket.on('connect', () => {
      console.log('🔌 Глобальный Socket подключен:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Глобальный Socket отключен:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Ошибка подключения Socket:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup при размонтировании
    return () => {
      console.log('🔌 Закрываем глобальный Socket');
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, socketUrl }}>
      {children}
    </SocketContext.Provider>
  );
};
