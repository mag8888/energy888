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
    // Очищаем localStorage от неправильных URL
    if (typeof window !== 'undefined') {
      const storedUrl = localStorage.getItem('SOCKET_URL');
      if (storedUrl && storedUrl.includes('localhost')) {
        localStorage.removeItem('SOCKET_URL');
      }
    }
    
    // Определяем URL для Socket
    const qp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const qpUrl = qp?.get('socket') || undefined;
    const lsUrl = typeof window !== 'undefined' ? (localStorage.getItem('SOCKET_URL') || undefined) : undefined;
    // Принудительно используем правильный URL для production
    const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
    const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const validEnvUrl = envUrl && !envUrl.includes('localhost') ? envUrl : undefined;
    const resolvedUrl = qpUrl || lsUrl || validEnvUrl || (isProduction ? 'https://money8888-production.up.railway.app' : 'https://money8888-production.up.railway.app');
    
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
