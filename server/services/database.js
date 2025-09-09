import mongoose from 'mongoose';
import Room from '../models/Room.js';
import HallOfFame from '../models/HallOfFame.js';

class DatabaseService {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/energy888';
      
      this.connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      this.isConnected = true;
      console.log('✅ MongoDB подключена:', mongoUri);
      
      // Запускаем периодическую очистку
      this.startCleanupInterval();
      
      return this.connection;
    } catch (error) {
      console.error('❌ Ошибка подключения к MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('🔌 MongoDB отключена');
    }
  }

  // Работа с комнатами
  async createRoom(roomData) {
    try {
      const room = new Room(roomData);
      await room.save();
      console.log('✅ Комната создана в БД:', room.id);
      return room;
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      throw error;
    }
  }

  async getRoom(roomId) {
    try {
      const room = await Room.findOne({ id: roomId, isActive: true });
      return room;
    } catch (error) {
      console.error('❌ Ошибка получения комнаты:', error);
      throw error;
    }
  }

  async getAllRooms() {
    try {
      const rooms = await Room.find({ isActive: true })
        .sort({ lastActivity: -1 });
      return rooms;
    } catch (error) {
      console.error('❌ Ошибка получения списка комнат:', error);
      throw error;
    }
  }

  async updateRoom(roomId, updateData) {
    try {
      const room = await Room.findOneAndUpdate(
        { id: roomId, isActive: true },
        { ...updateData, lastActivity: new Date() },
        { new: true }
      );
      return room;
    } catch (error) {
      console.error('❌ Ошибка обновления комнаты:', error);
      throw error;
    }
  }

  async deleteRoom(roomId) {
    try {
      const result = await Room.findOneAndUpdate(
        { id: roomId },
        { isActive: false },
        { new: true }
      );
      console.log('🗑️ Комната деактивирована:', roomId);
      return result;
    } catch (error) {
      console.error('❌ Ошибка удаления комнаты:', error);
      throw error;
    }
  }

  async addPlayerToRoom(roomId, player) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        throw new Error('Комната не найдена');
      }

      await room.addPlayer(player);
      console.log('✅ Игрок добавлен в комнату:', player.name);
      return room;
    } catch (error) {
      console.error('❌ Ошибка добавления игрока:', error);
      throw error;
    }
  }

  async removePlayerFromRoom(roomId, socketId) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        return null;
      }

      await room.removePlayer(socketId);
      console.log('✅ Игрок удален из комнаты:', socketId);
      return room;
    } catch (error) {
      console.error('❌ Ошибка удаления игрока:', error);
      throw error;
    }
  }

  // Работа с залом славы
  async updatePlayerStats(username, gameResult) {
    try {
      const player = await HallOfFame.upsertPlayer(username, gameResult);
      console.log('✅ Статистика игрока обновлена:', username);
      return player;
    } catch (error) {
      console.error('❌ Ошибка обновления статистики:', error);
      throw error;
    }
  }

  async getTopPlayers(limit = 10, sortBy = 'points') {
    try {
      const players = await HallOfFame.getTopPlayers(limit, sortBy);
      return players;
    } catch (error) {
      console.error('❌ Ошибка получения топа игроков:', error);
      throw error;
    }
  }

  // Восстановление комнат при запуске
  async restoreRooms() {
    try {
      const rooms = await this.getAllRooms();
      console.log(`🔄 Восстановлено ${rooms.length} комнат из БД`);
      return rooms;
    } catch (error) {
      console.error('❌ Ошибка восстановления комнат:', error);
      throw error;
    }
  }

  // Периодическая очистка
  startCleanupInterval() {
    // Очистка каждые 30 минут
    setInterval(async () => {
      try {
        const deletedCount = await Room.cleanupInactiveRooms();
        if (deletedCount > 0) {
          console.log(`🧹 Очищено ${deletedCount} неактивных комнат`);
        }
      } catch (error) {
        console.error('❌ Ошибка очистки комнат:', error);
      }
    }, 30 * 60 * 1000); // 30 минут
  }

  // Мониторинг
  async getStats() {
    try {
      const totalRooms = await Room.countDocuments({ isActive: true });
      const totalPlayers = await Room.aggregate([
        { $match: { isActive: true } },
        { $project: { playerCount: { $size: '$players' } } },
        { $group: { _id: null, total: { $sum: '$playerCount' } } }
      ]);
      
      const totalPlayersCount = totalPlayers[0]?.total || 0;
      
      return {
        totalRooms,
        totalPlayers: totalPlayersCount,
        isConnected: this.isConnected,
        uptime: process.uptime()
      };
    } catch (error) {
      console.error('❌ Ошибка получения статистики:', error);
      return {
        totalRooms: 0,
        totalPlayers: 0,
        isConnected: false,
        uptime: 0
      };
    }
  }
}

export default new DatabaseService();
