import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  socketId: { type: String, required: true },
  isReady: { type: Boolean, default: false },
  profession: { type: String, default: null },
  dream: { type: String, default: null },
  joinedAt: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  creatorId: { type: String, required: true },
  creatorUsername: { type: String, default: 'Игрок' },
  creatorProfession: { type: String, default: null },
  creatorDream: { type: String, default: null },
  assignProfessionToAll: { type: Boolean, default: false },
  maxPlayers: { type: Number, default: 6 },
  password: { type: String, default: null },
  timing: { type: Number, default: 120 },
  createdAt: { type: Date, default: Date.now },
  gameDurationSec: { type: Number, default: 10800 },
  gameEndAt: { type: Date, default: null },
  deleteAfterAt: { type: Date, default: null },
  players: [playerSchema],
  started: { type: Boolean, default: false },
  order: { type: [String], default: [] },
  currentIndex: { type: Number, default: 0 },
  turnEndAt: { type: Date, default: null },
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

// Индексы для быстрого поиска
roomSchema.index({ id: 1 });
roomSchema.index({ isActive: 1, lastActivity: 1 });
roomSchema.index({ creatorId: 1 });

// Метод для обновления активности
roomSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Метод для добавления игрока
roomSchema.methods.addPlayer = function(player) {
  const existingPlayerIndex = this.players.findIndex(p => p.socketId === player.socketId);
  
  if (existingPlayerIndex >= 0) {
    // Обновляем существующего игрока
    this.players[existingPlayerIndex] = { ...this.players[existingPlayerIndex], ...player };
  } else {
    // Добавляем нового игрока
    this.players.push(player);
  }
  
  this.lastActivity = new Date();
  return this.save();
};

// Метод для удаления игрока
roomSchema.methods.removePlayer = function(socketId) {
  this.players = this.players.filter(p => p.socketId !== socketId);
  this.lastActivity = new Date();
  return this.save();
};

// Метод для получения данных комнаты для клиента
roomSchema.methods.toClientData = function() {
  return {
    id: this.id,
    name: this.name,
    maxPlayers: this.maxPlayers,
    currentPlayers: this.players.length,
    status: this.started ? 'playing' : 'waiting',
    timing: this.timing,
    players: this.players.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      isReady: p.isReady,
      profession: p.profession,
      dream: p.dream
    }))
  };
};

// Статический метод для очистки неактивных комнат
roomSchema.statics.cleanupInactiveRooms = async function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Удаляем комнаты, которые неактивны более 24 часов
  const deletedRooms = await this.deleteMany({
    isActive: true,
    lastActivity: { $lt: oneDayAgo },
    players: { $size: 0 }
  });
  
  // Деактивируем комнаты без игроков более 1 часа
  await this.updateMany({
    isActive: true,
    lastActivity: { $lt: oneHourAgo },
    players: { $size: 0 }
  }, {
    isActive: false
  });
  
  return deletedRooms.deletedCount;
};

export default mongoose.model('Room', roomSchema);
