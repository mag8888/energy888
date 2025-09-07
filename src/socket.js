// Заглушка для socket модуля
const mockSocket = {
  id: 'mock-socket-id',
  roomId: 'mock-room-id',
  emit: (event, data) => {
    console.log(`Socket emit: ${event}`, data);
  },
  on: (event, callback) => {
    console.log(`Socket on: ${event}`);
  },
  off: (event, callback) => {
    console.log(`Socket off: ${event}`);
  }
};

export default mockSocket;
