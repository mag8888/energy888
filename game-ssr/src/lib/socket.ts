// Minimal event bus socket stub to preserve visuals without real backend
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
    (this.handlers[event] || []).forEach(h => {
      try { h(...args); } catch { /* noop */ }
    });
  }
  get id() { return 'socket-stub-id'; }
}

const socket = new SocketStub();
export default socket;

