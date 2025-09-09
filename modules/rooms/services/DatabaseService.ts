import mongoose from 'mongoose';
import RoomModel from '../models/RoomModel';
import HallOfFameModel from '../models/HallOfFameModel';
import { Room, Player, RoomStats, HallOfFamePlayer } from '../types';

export class DatabaseService {
  private static instance: DatabaseService;
  private isConnected: boolean = false;
  private connection: mongoose.Connection | null = null;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Подключение к базе данных
   */
  async connect(): Promise<void> {
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
      
    } catch (error) {
      console.error('❌ Ошибка подключения к MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Отключение от базы данных
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('🔌 MongoDB отключена');
    }
  }

  /**
   * Проверка подключения
   */
  isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  // ===== РАБОТА С КОМНАТАМИ =====

  /**
   * Создать комнату
   */
  async createRoom(roomData: any): Promise<Room> {
    try {
      const room = new RoomModel(roomData);
      await room.save();
      console.log('✅ Комната создана в БД:', room.id);
      return this.convertToRoom(room);
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      throw error;
    }
  }

  /**
   * Получить комнату по ID
   */
  async getRoom(roomId: string): Promise<Room | null> {
    try {
      const room = await RoomModel.findRoomById(roomId);
      return room ? this.convertToRoom(room) : null;
    } catch (error) {
      console.error('❌ Ошибка получения комнаты:', error);
      throw error;
    }
  }

  /**
   * Получить все активные комнаты
   */
  async getAllRooms(): Promise<Room[]> {
    try {
      const rooms = await RoomModel.findActiveRooms();
      return rooms.map(room => this.convertToRoom(room));
    } catch (error) {
      console.error('❌ Ошибка получения списка комнат:', error);
      throw error;
    }
  }

  /**
   * Обновить комнату
   */
  async updateRoom(roomId: string, updateData: any): Promise<Room | null> {
    try {
      const room = await RoomModel.findOneAndUpdate(
        { id: roomId, isActive: true },
        { ...updateData, lastActivity: new Date() },
        { new: true }
      );
      return room ? this.convertToRoom(room) : null;
    } catch (error) {
      console.error('❌ Ошибка обновления комнаты:', error);
      throw error;
    }
  }

  /**
   * Удалить комнату
   */
  async deleteRoom(roomId: string): Promise<boolean> {
    try {
      const result = await RoomModel.findOneAndUpdate(
        { id: roomId },
        { isActive: false },
        { new: true }
      );
      console.log('🗑️ Комната деактивирована:', roomId);
      return !!result;
    } catch (error) {
      console.error('❌ Ошибка удаления комнаты:', error);
      throw error;
    }
  }

  /**
   * Добавить игрока в комнату
   */
  async addPlayerToRoom(roomId: string, player: Player): Promise<Room | null> {
    try {
      const room = await RoomModel.findRoomById(roomId);
      if (!room) {
        throw new Error('Комната не найдена');
      }

      await room.addPlayer(player);
      console.log('✅ Игрок добавлен в комнату:', player.name);
      return this.convertToRoom(room);
    } catch (error) {
      console.error('❌ Ошибка добавления игрока:', error);
      throw error;
    }
  }

  /**
   * Удалить игрока из комнаты
   */
  async removePlayerFromRoom(roomId: string, socketId: string): Promise<Room | null> {
    try {
      const room = await RoomModel.findRoomById(roomId);
      if (!room) {
        return null;
      }

      await room.removePlayer(socketId);
      console.log('✅ Игрок удален из комнаты:', socketId);
      return this.convertToRoom(room);
    } catch (error) {
      console.error('❌ Ошибка удаления игрока:', error);
      throw error;
    }
  }

  /**
   * Обновить игрока в комнате
   */
  async updatePlayerInRoom(roomId: string, socketId: string, updateData: any): Promise<Room | null> {
    try {
      const room = await RoomModel.findRoomById(roomId);
      if (!room) {
        return null;
      }

      await room.updatePlayer(socketId, updateData);
      console.log('✅ Игрок обновлен в комнате:', socketId);
      return this.convertToRoom(room);
    } catch (error) {
      console.error('❌ Ошибка обновления игрока:', error);
      throw error;
    }
  }

  // ===== РАБОТА С ЗАЛОМ СЛАВЫ =====

  /**
   * Обновить статистику игрока
   */
  async updatePlayerStats(username: string, gameResult: {
    won: boolean;
    points: number;
    playTime: number;
  }): Promise<HallOfFamePlayer | null> {
    try {
      const player = await HallOfFameModel.upsertPlayer(username, gameResult);
      console.log('✅ Статистика игрока обновлена:', username);
      return this.convertToHallOfFamePlayer(player);
    } catch (error) {
      console.error('❌ Ошибка обновления статистики:', error);
      throw error;
    }
  }

  /**
   * Получить топ игроков
   */
  async getTopPlayers(limit: number = 10, sortBy: string = 'points'): Promise<HallOfFamePlayer[]> {
    try {
      const players = await HallOfFameModel.getTopPlayers(limit, sortBy);
      return players.map(player => this.convertToHallOfFamePlayer(player));
    } catch (error) {
      console.error('❌ Ошибка получения топа игроков:', error);
      throw error;
    }
  }

  /**
   * Получить рейтинг игрока
   */
  async getPlayerRank(username: string, sortBy: string = 'points'): Promise<any> {
    try {
      return await HallOfFameModel.getPlayerRank(username, sortBy);
    } catch (error) {
      console.error('❌ Ошибка получения рейтинга игрока:', error);
      throw error;
    }
  }

  /**
   * Получить таблицу лидеров
   */
  async getLeaderboard(options: {
    limit?: number;
    sortBy?: string;
    timeRange?: 'all' | 'week' | 'month';
  } = {}): Promise<HallOfFamePlayer[]> {
    try {
      const players = await HallOfFameModel.getLeaderboard(options);
      return players.map(player => this.convertToHallOfFamePlayer(player));
    } catch (error) {
      console.error('❌ Ошибка получения таблицы лидеров:', error);
      throw error;
    }
  }

  // ===== ВОССТАНОВЛЕНИЕ И ОЧИСТКА =====

  /**
   * Восстановить комнаты при запуске
   */
  async restoreRooms(): Promise<Room[]> {
    try {
      const rooms = await this.getAllRooms();
      console.log(`🔄 Восстановлено ${rooms.length} комнат из БД`);
      return rooms;
    } catch (error) {
      console.error('❌ Ошибка восстановления комнат:', error);
      throw error;
    }
  }

  /**
   * Очистка неактивных комнат
   */
  async cleanupInactiveRooms(): Promise<number> {
    try {
      const deletedCount = await RoomModel.cleanupInactiveRooms();
      if (deletedCount > 0) {
        console.log(`🧹 Очищено ${deletedCount} неактивных комнат`);
      }
      return deletedCount;
    } catch (error) {
      console.error('❌ Ошибка очистки комнат:', error);
      throw error;
    }
  }

  /**
   * Запуск периодической очистки
   */
  private startCleanupInterval(): void {
    // Очистка каждые 30 минут
    setInterval(async () => {
      try {
        await this.cleanupInactiveRooms();
      } catch (error) {
        console.error('❌ Ошибка периодической очистки:', error);
      }
    }, 30 * 60 * 1000); // 30 минут
  }

  // ===== СТАТИСТИКА =====

  /**
   * Получить статистику сервера
   */
  async getStats(): Promise<RoomStats> {
    try {
      const totalRooms = await RoomModel.countDocuments({ isActive: true });
      const totalPlayers = await RoomModel.aggregate([
        { $match: { isActive: true } },
        { $project: { playerCount: { $size: '$players' } } },
        { $group: { _id: null, total: { $sum: '$playerCount' } } }
      ]);
      
      const totalPlayersCount = totalPlayers[0]?.total || 0;
      
      return {
        totalRooms,
        totalPlayers: totalPlayersCount,
        isConnected: this.isConnected,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Ошибка получения статистики:', error);
      return {
        totalRooms: 0,
        totalPlayers: 0,
        isConnected: false,
        uptime: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ===== КОНВЕРТЕРЫ =====

  /**
   * Конвертировать документ MongoDB в Room
   */
  private convertToRoom(doc: any): Room {
    const playersMap = new Map<string, Player>();
    doc.players.forEach((player: any) => {
      playersMap.set(player.socketId, {
        id: player.id,
        name: player.name,
        email: player.email,
        socketId: player.socketId,
        isReady: player.isReady,
        profession: player.profession,
        dream: player.dream,
        selectedProfession: player.selectedProfession,
        professionConfirmed: player.professionConfirmed,
        joinedAt: player.joinedAt,
        money: player.money,
        position: player.position,
        cards: player.cards,
        isActive: player.isActive
      });
    });

    return {
      id: doc.id,
      name: doc.name,
      creatorId: doc.creatorId,
      creatorUsername: doc.creatorUsername,
      creatorProfession: doc.creatorProfession,
      creatorDream: doc.creatorDream,
      assignProfessionToAll: doc.assignProfessionToAll,
      availableProfessions: doc.availableProfessions,
      professionSelectionMode: doc.professionSelectionMode,
      maxPlayers: doc.maxPlayers,
      password: doc.password,
      timing: doc.timing,
      createdAt: doc.createdAt,
      gameDurationSec: doc.gameDurationSec,
      gameEndAt: doc.gameEndAt,
      deleteAfterAt: doc.deleteAfterAt,
      players: playersMap,
      started: doc.started,
      order: doc.order,
      currentIndex: doc.currentIndex,
      turnEndAt: doc.turnEndAt,
      lastActivity: doc.lastActivity,
      isActive: doc.isActive
    };
  }

  /**
   * Конвертировать документ MongoDB в HallOfFamePlayer
   */
  private convertToHallOfFamePlayer(doc: any): HallOfFamePlayer {
    return {
      username: doc.username,
      games: doc.games,
      wins: doc.wins,
      points: doc.points,
      lastPlayed: doc.lastPlayed,
      totalPlayTime: doc.totalPlayTime,
      averageGameTime: doc.averageGameTime,
      winRate: doc.winRate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}

// Экспортируем singleton
export default DatabaseService.getInstance();
