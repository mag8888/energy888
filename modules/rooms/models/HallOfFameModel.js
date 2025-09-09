import mongoose from 'mongoose';

// Схема игрока в зале славы
const hallOfFameSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  games: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  lastPlayed: { type: Date, default: Date.now },
  totalPlayTime: { type: Number, default: 0 },
  averageGameTime: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Индексы для быстрого поиска
hallOfFameSchema.index({ username: 1 });
hallOfFameSchema.index({ points: -1 });
hallOfFameSchema.index({ wins: -1 });
hallOfFameSchema.index({ winRate: -1 });
hallOfFameSchema.index({ lastPlayed: -1 });

// Методы для работы с игроком
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

hallOfFameSchema.methods.getStats = function() {
  return {
    username: this.username,
    games: this.games,
    wins: this.wins,
    points: this.points,
    winRate: this.winRate,
    averageGameTime: this.averageGameTime,
    lastPlayed: this.lastPlayed
  };
};

// Статические методы
hallOfFameSchema.statics.getTopPlayers = function(limit = 10, sortBy = 'points') {
  return this.find()
    .sort({ [sortBy]: -1 })
    .limit(limit)
    .select('username games wins points winRate lastPlayed averageGameTime');
};

hallOfFameSchema.statics.findPlayer = function(username) {
  return this.findOne({ username });
};

hallOfFameSchema.statics.upsertPlayer = async function(username, gameResult) {
  let player = await this.findOne({ username });
  
  if (!player) {
    player = new this({ username });
  }
  
  if (gameResult && Object.keys(gameResult).length > 0) {
    await player.updateStats(gameResult);
  }
  
  return player;
};

hallOfFameSchema.statics.getPlayerRank = async function(username, sortBy = 'points') {
  const player = await this.findOne({ username });
  if (!player) return null;
  
  const rank = await this.countDocuments({ [sortBy]: { $gt: player[sortBy] } }) + 1;
  return {
    player: player.getStats(),
    rank,
    totalPlayers: await this.countDocuments()
  };
};

hallOfFameSchema.statics.getLeaderboard = async function(options = {}) {
  const { limit = 10, sortBy = 'points', timeRange = 'all' } = options;
  
  let query = {};
  
  if (timeRange !== 'all') {
    const now = new Date();
    let timeFilter;
    
    switch (timeRange) {
      case 'week':
        timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        timeFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeFilter = new Date(0);
    }
    
    query.lastPlayed = { $gte: timeFilter };
  }
  
  return this.find(query)
    .sort({ [sortBy]: -1 })
    .limit(limit)
    .select('username games wins points winRate lastPlayed averageGameTime');
};

// Создаем модель
const HallOfFameModel = mongoose.model('HallOfFame', hallOfFameSchema);

export default HallOfFameModel;
