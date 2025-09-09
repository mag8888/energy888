import mongoose from 'mongoose';

const hallOfFameSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  games: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  lastPlayed: { type: Date, default: Date.now },
  totalPlayTime: { type: Number, default: 0 }, // в секундах
  averageGameTime: { type: Number, default: 0 }, // в секундах
  winRate: { type: Number, default: 0 }, // процент побед
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Индексы
hallOfFameSchema.index({ username: 1 });
hallOfFameSchema.index({ points: -1 });
hallOfFameSchema.index({ wins: -1 });
hallOfFameSchema.index({ winRate: -1 });

// Метод для обновления статистики
hallOfFameSchema.methods.updateStats = function(gameResult) {
  this.games += 1;
  this.totalPlayTime += gameResult.playTime || 0;
  this.averageGameTime = this.totalPlayTime / this.games;
  
  if (gameResult.won) {
    this.wins += 1;
  }
  
  this.points += gameResult.points || 0;
  this.winRate = (this.wins / this.games) * 100;
  this.lastPlayed = new Date();
  this.updatedAt = new Date();
  
  return this.save();
};

// Статический метод для получения топа игроков
hallOfFameSchema.statics.getTopPlayers = async function(limit = 10, sortBy = 'points') {
  return await this.find()
    .sort({ [sortBy]: -1 })
    .limit(limit)
    .select('username games wins points winRate lastPlayed');
};

// Статический метод для поиска игрока
hallOfFameSchema.statics.findPlayer = async function(username) {
  return await this.findOne({ username });
};

// Статический метод для создания или обновления игрока
hallOfFameSchema.statics.upsertPlayer = async function(username, gameResult = {}) {
  let player = await this.findOne({ username });
  
  if (!player) {
    player = new this({ username });
  }
  
  if (gameResult && Object.keys(gameResult).length > 0) {
    await player.updateStats(gameResult);
  }
  
  return player;
};

export default mongoose.model('HallOfFame', hallOfFameSchema);
