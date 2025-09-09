import mongoose, { Schema, Document } from 'mongoose';

// Интерфейс для игрока в MongoDB
interface IPlayer extends Document {
  id: string;
  name: string;
  email: string;
  socketId: string;
  isReady: boolean;
  profession: string | null;
  dream: string | null;
  selectedProfession: string | null;
  professionConfirmed: boolean;
  joinedAt: Date;
  money: number;
  position: number;
  cards: any[];
  isActive: boolean;
}

// Схема игрока
const playerSchema = new Schema<IPlayer>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  socketId: { type: String, required: true },
  isReady: { type: Boolean, default: false },
  profession: { type: String, default: null },
  dream: { type: String, default: null },
  selectedProfession: { type: String, default: null },
  professionConfirmed: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
  money: { type: Number, default: 0 },
  position: { type: Number, default: 0 },
  cards: { type: [Schema.Types.Mixed], default: [] },
  isActive: { type: Boolean, default: true }
});

// Интерфейс для комнаты в MongoDB
interface IRoom extends Document {
  id: string;
  name: string;
  creatorId: string;
  creatorUsername: string;
  creatorProfession: string | null;
  creatorDream: string | null;
  assignProfessionToAll: boolean;
  availableProfessions: string[];
  professionSelectionMode: 'random' | 'choice' | 'assigned';
  maxPlayers: number;
  password: string | null;
  timing: number;
  createdAt: Date;
  gameDurationSec: number;
  gameEndAt: Date | null;
  deleteAfterAt: Date | null;
  players: IPlayer[];
  started: boolean;
  order: string[];
  currentIndex: number;
  turnEndAt: Date | null;
  lastActivity: Date;
  isActive: boolean;
}

// Схема комнаты
const roomSchema = new Schema<IRoom>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  creatorId: { type: String, required: true },
  creatorUsername: { type: String, required: true },
  creatorProfession: { type: String, default: null },
  creatorDream: { type: String, default: null },
  assignProfessionToAll: { type: Boolean, default: false },
  availableProfessions: { type: [String], default: [] },
  professionSelectionMode: { 
    type: String, 
    enum: ['random', 'choice', 'assigned'], 
    default: 'random' 
  },
  maxPlayers: { type: Number, required: true, min: 2, max: 10 },
  password: { type: String, default: null },
  timing: { type: Number, required: true, min: 30, max: 300 },
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
roomSchema.index({ 'players.socketId': 1 });

// Методы для работы с комнатой
roomSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

roomSchema.methods.addPlayer = function(player: any) {
  const existingPlayerIndex = this.players.findIndex((p: any) => p.socketId === player.socketId);
  
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

roomSchema.methods.removePlayer = function(socketId: string) {
  this.players = this.players.filter((p: any) => p.socketId !== socketId);
  this.lastActivity = new Date();
  return this.save();
};

roomSchema.methods.getPlayerBySocketId = function(socketId: string) {
  return this.players.find((p: any) => p.socketId === socketId);
};

roomSchema.methods.updatePlayer = function(socketId: string, updateData: any) {
  const player = this.getPlayerBySocketId(socketId);
  if (player) {
    Object.assign(player, updateData);
    this.lastActivity = new Date();
    return this.save();
  }
  return null;
};

roomSchema.methods.toClientData = function() {
  return {
    id: this.id,
    name: this.name,
    maxPlayers: this.maxPlayers,
    players: this.players.length,
    status: this.started ? 'playing' : 'waiting',
    timing: this.timing,
    professionSelectionMode: this.professionSelectionMode,
    availableProfessions: this.availableProfessions,
    playersList: this.players.map((p: any) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      isReady: p.isReady,
      profession: p.profession,
      dream: p.dream,
      selectedProfession: p.selectedProfession,
      professionConfirmed: p.professionConfirmed
    }))
  };
};

// Статические методы
roomSchema.statics.findActiveRooms = function() {
  return this.find({ isActive: true }).sort({ lastActivity: -1 });
};

roomSchema.statics.findRoomById = function(roomId: string) {
  return this.findOne({ id: roomId, isActive: true });
};

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

// Создаем модель
const RoomModel = mongoose.model<IRoom>('Room', roomSchema);

export default RoomModel;
