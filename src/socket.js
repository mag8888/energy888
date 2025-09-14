import { io } from 'socket.io-client';

// Определяем URL для Socket
const getSocketUrl = () => {
  // Проверяем URL параметры
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const socketParam = urlParams.get('socket');
    if (socketParam) {
      console.log('🔌 Socket URL из параметра:', socketParam);
      return socketParam;
    }
    
    // Проверяем localStorage
    const storedUrl = localStorage.getItem('SOCKET_URL');
    if (storedUrl) {
      console.log('🔌 Socket URL из localStorage:', storedUrl);
      return storedUrl;
    }
  }
  
  // Fallback на правильный сервер
  const defaultUrl = 'https://money8888-production.up.railway.app';
  console.log('🔌 Socket URL по умолчанию:', defaultUrl);
  return defaultUrl;
};

// Создаем Socket соединение
const socketUrl = getSocketUrl();
const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: false
});

// Обработчики событий
socket.on('connect', () => {
  console.log('🔌 Socket подключен:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket отключен:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Ошибка подключения Socket:', error);
});

export default socket;
