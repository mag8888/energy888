// Socket wrapper: real socket.io-client if NEXT_PUBLIC_SOCKET_URL is set, otherwise a local stub.
type Handler = (...args: any[]) => void;

class SocketStub {
  connected = true;
  private handlers: Record<string, Handler[]> = {};
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
    (this.handlers[event] || []).forEach(h => { try { h(...args); } catch {} });
  }
  get id() { return 'socket-stub-id'; }
}

const sock: any = new SocketStub();

declare const process: any;
const url = typeof window !== 'undefined' ? (process?.env?.NEXT_PUBLIC_SOCKET_URL as string | undefined) : undefined;

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

export default sock;
