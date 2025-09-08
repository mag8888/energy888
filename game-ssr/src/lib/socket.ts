// Socket wrapper: real socket.io-client if NEXT_PUBLIC_SOCKET_URL is set, otherwise a local stub.
type Handler = (...args: any[]) => void;

class SocketStub {
  connected = true;
  private handlers: Record<string, Handler[]> = {};
  private rooms: any[] = [];
  private roomCounter = 1;

  on(event: string, handler: Handler) {
    this.handlers[event] = this.handlers[event] || [];
    this.handlers[event].push(handler);
  }
  off(event: string, handler?: Handler) {
    if (!this.handlers[event]) return;
    if (!handler) { delete this.handlers[event]; return; }
    this.handlers[event] = this.handlers[event].filter(h => h !== handler);
  }
  emit(event: string, ...args: any[]) {
    console.log(`🔌 Socket emit: ${event}`, args);
    
    // Обработка событий в заглушке
    if (event === 'createRoom') {
      const roomData = args[0];
      const newRoom = {
        id: `room_${this.roomCounter++}`,
        name: roomData.name,
        creatorId: roomData.creatorId,
        creatorUsername: roomData.creatorUsername,
        creatorProfession: roomData.creatorProfession,
        creatorDream: roomData.creatorDream,
        assignProfessionToAll: roomData.assignProfessionToAll,
        maxPlayers: roomData.maxPlayers,
        password: roomData.password,
        timing: roomData.timing,
        gameDurationSec: roomData.gameDurationSec,
        hasPassword: !!roomData.password,
        players: [{
          id: roomData.creatorId,
          username: roomData.creatorUsername,
          profession: roomData.creatorProfession,
          dream: roomData.creatorDream
        }],
        status: 'waiting',
        createdAt: new Date().toISOString()
      };
      this.rooms.push(newRoom);
      
      // Отправляем обновленный список комнат
      setTimeout(() => {
        this.trigger('roomsList', this.rooms);
      }, 100);
    } else if (event === 'getRooms') {
      // Отправляем текущий список комнат
      setTimeout(() => {
        this.trigger('roomsList', this.rooms);
      }, 100);
    }
    
    // Вызываем обработчики
    (this.handlers[event] || []).forEach(h => { 
      try { 
        h(...args); 
      } catch (error) {
        console.warn('Socket handler error:', error);
      }
    });
  }
  
  private trigger(event: string, ...args: any[]) {
    (this.handlers[event] || []).forEach(h => { 
      try { 
        h(...args); 
      } catch (error) {
        console.warn('Socket handler error:', error);
      }
    });
  }
  
  get id() { return 'socket-stub-id'; }
}

const sock: any = new SocketStub();

declare const process: any;
const url = typeof window !== 'undefined' ? (process?.env?.NEXT_PUBLIC_SOCKET_URL || 'https://energy888-unified-server.onrender.com') : undefined;

// Lazy upgrade to real socket in browser
if (typeof window !== 'undefined' && url) {
  console.log('🔌 Инициализация Socket.IO клиента для URL:', url);
  import('socket.io-client')
    .then(({ io }) => {
      console.log('🔌 Socket.IO клиент загружен, создаем соединение...');
      const real = io(url, { transports: ['websocket'] });
      
      real.on('connect', () => {
        console.log('🔌 Socket.IO подключен! ID:', real.id);
      });
      
      real.on('disconnect', () => {
        console.log('🔌 Socket.IO отключен');
      });
      
      real.on('connect_error', (error) => {
        console.error('🔌 Ошибка подключения Socket.IO:', error);
      });
      
      // bridge
      sock.on = real.on.bind(real);
      sock.off = real.off.bind(real);
      sock.emit = real.emit.bind(real);
      Object.defineProperty(sock, 'id', { get: () => (real as any).id });
      Object.defineProperty(sock, 'connected', { get: () => (real as any).connected });
    })
    .catch((error) => {
      console.error('🔌 Ошибка загрузки Socket.IO клиента:', error);
      // keep stub if client lib not available
    });
} else {
  console.log('🔌 Socket.IO URL не настроен или не в браузере, используем заглушку');
}

// Обработка ошибок message port (расширения браузера)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('message port closed')) {
      console.warn('Message port error suppressed:', event.reason.message);
      event.preventDefault();
    }
  });
}

export default sock;
