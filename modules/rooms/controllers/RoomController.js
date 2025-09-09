import { RoomUtils } from '../utils/roomUtils.js';
import { ProfessionUtils } from '../utils/professions.js';
import { DatabaseService } from '../services/DatabaseService.js';

export class RoomController {
  constructor() {
    this.rooms = new Map();
    this.dbService = DatabaseService.getInstance();
  }

  // ===== ОСНОВНЫЕ ОПЕРАЦИИ С КОМНАТАМИ =====

  /**
   * Создать комнату
   */
  async createRoom(data) {
    try {
      // Валидация данных
      const validation = RoomUtils.validateCreateRoomData(data);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Генерация ID
      const roomId = RoomUtils.generateRoomId();
      const playerId = RoomUtils.generatePlayerId();

      // Создание игрока-создателя
      const creator = RoomUtils.createPlayer({
        id: playerId,
        name: data.playerName,
        email: data.playerEmail,
        socketId: '' // Будет установлен при подключении
      });

      // Создание комнаты
      const roomData = {
        id: roomId,
        name: data.name,
        creatorId: playerId,
        creatorUsername: data.playerName,
        maxPlayers: data.maxPlayers,
        timing: data.timing,
        professionSelectionMode: data.professionSelectionMode,
        availableProfessions: data.availableProfessions,
        assignProfessionToAll: data.assignProfessionToAll,
        password: data.password
      };

      const room = RoomUtils.createRoom(roomData);

      // Сохранение в БД
      await this.dbService.createRoom(roomData);

      // Добавление в кэш
      this.rooms.set(roomId, room);

      console.log('✅ Комната создана:', roomId);
      return { success: true, room };
    } catch (error) {
      console.error('❌ Ошибка создания комнаты:', error);
      return { success: false, error: 'Ошибка создания комнаты' };
    }
  }

  /**
   * Получить комнату по ID
   */
  async getRoom(roomId) {
    try {
      // Сначала проверяем кэш
      if (this.rooms.has(roomId)) {
        return this.rooms.get(roomId);
      }

      // Если нет в кэше, загружаем из БД
      const room = await this.dbService.getRoom(roomId);
      if (room) {
        this.rooms.set(roomId, room);
        return room;
      }

      return null;
    } catch (error) {
      console.error('❌ Ошибка получения комнаты:', error);
      return null;
    }
  }

  /**
   * Получить все комнаты
   */
  async getAllRooms() {
    try {
      const rooms = await this.dbService.getAllRooms();
      
      // Обновляем кэш
      rooms.forEach(room => {
        this.rooms.set(room.id, room);
      });

      return rooms;
    } catch (error) {
      console.error('❌ Ошибка получения списка комнат:', error);
      return [];
    }
  }

  /**
   * Присоединиться к комнате
   */
  async joinRoom(data, socketId) {
    try {
      // Валидация данных
      const validation = RoomUtils.validateJoinRoomData(data);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Получение комнаты
      const room = await this.getRoom(data.roomId);
      if (!room) {
        return { success: false, error: 'Комната не найдена' };
      }

      // Проверка возможности присоединения
      const canJoin = RoomUtils.canPlayerJoinRoom(room, data.password);
      if (!canJoin.canJoin) {
        return { success: false, error: canJoin.reason || 'Не удается присоединиться к комнате' };
      }

      // Создание игрока
      const player = RoomUtils.createPlayer({
        id: RoomUtils.generatePlayerId(),
        name: data.playerName,
        email: data.playerEmail,
        socketId
      });

      // Добавление игрока в комнату
      const added = RoomUtils.addPlayerToRoom(room, player);
      if (!added) {
        return { success: false, error: 'Не удалось добавить игрока в комнату' };
      }

      // Сохранение в БД
      await this.dbService.addPlayerToRoom(room.id, player);

      // Обновление кэша
      this.rooms.set(room.id, room);

      console.log('✅ Игрок присоединился к комнате:', player.name);
      return { success: true, room };
    } catch (error) {
      console.error('❌ Ошибка присоединения к комнате:', error);
      return { success: false, error: 'Ошибка присоединения к комнате' };
    }
  }

  /**
   * Покинуть комнату
   */
  async leaveRoom(roomId, socketId) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        return { success: false, error: 'Комната не найдена' };
      }

      // Удаление игрока из комнаты
      const removed = RoomUtils.removePlayerFromRoom(room, socketId);
      if (!removed) {
        return { success: false, error: 'Игрок не найден в комнате' };
      }

      // Сохранение в БД
      await this.dbService.removePlayerFromRoom(roomId, socketId);

      // Обновление кэша
      this.rooms.set(room.id, room);

      console.log('✅ Игрок покинул комнату:', socketId);
      return { success: true, room };
    } catch (error) {
      console.error('❌ Ошибка покидания комнаты:', error);
      return { success: false, error: 'Ошибка покидания комнаты' };
    }
  }

  // ===== РАБОТА С ПРОФЕССИЯМИ =====

  /**
   * Выбрать профессию
   */
  async selectProfession(data) {
    try {
      const room = await this.getRoom(data.roomId);
      if (!room) {
        return { success: false, error: 'Комната не найдена' };
      }

      const player = RoomUtils.getPlayerFromRoom(room, data.playerId);
      if (!player) {
        return { success: false, error: 'Игрок не найден в комнате' };
      }

      // Проверка режима выбора профессий
      if (room.professionSelectionMode !== 'choice') {
        return { success: false, error: 'Выбор профессий недоступен в этом режиме' };
      }

      // Получение уже выбранных профессий
      const selectedProfessions = Array.from(room.players.values())
        .filter(p => p.profession)
        .map(p => p.profession);

      // Валидация выбора
      const validation = ProfessionUtils.validateProfessionSelection(
        data.profession,
        room.availableProfessions,
        selectedProfessions
      );

      if (!validation.valid) {
        return { success: false, error: validation.error || 'Неверный выбор профессии' };
      }

      // Обновление игрока
      player.selectedProfession = data.profession;
      player.profession = data.profession;

      // Сохранение в БД
      await this.dbService.updatePlayerInRoom(room.id, data.playerId, {
        selectedProfession: data.profession,
        profession: data.profession
      });

      // Обновление кэша
      this.rooms.set(room.id, room);

      console.log('✅ Профессия выбрана:', data.profession);
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка выбора профессии:', error);
      return { success: false, error: 'Ошибка выбора профессии' };
    }
  }

  /**
   * Подтвердить выбор профессии
   */
  async confirmProfession(data) {
    try {
      const room = await this.getRoom(data.roomId);
      if (!room) {
        return { success: false, error: 'Комната не найдена' };
      }

      const player = RoomUtils.getPlayerFromRoom(room, data.playerId);
      if (!player) {
        return { success: false, error: 'Игрок не найден в комнате' };
      }

      if (!player.selectedProfession) {
        return { success: false, error: 'Профессия не выбрана' };
      }

      // Подтверждение выбора
      player.professionConfirmed = data.confirmed;

      // Применение специальных способностей
      if (data.confirmed && player.profession) {
        const profession = ProfessionUtils.getProfessionById(player.profession);
        if (profession) {
          ProfessionUtils.applySpecialAbilities(player, profession.specialAbilities);
        }
      }

      // Сохранение в БД
      await this.dbService.updatePlayerInRoom(room.id, data.playerId, {
        professionConfirmed: data.confirmed
      });

      // Обновление кэша
      this.rooms.set(room.id, room);

      console.log('✅ Выбор профессии подтвержден:', data.confirmed);
      return { success: true };
    } catch (error) {
      console.error('❌ Ошибка подтверждения профессии:', error);
      return { success: false, error: 'Ошибка подтверждения профессии' };
    }
  }

  /**
   * Получить доступные профессии
   */
  async getAvailableProfessions(roomId) {
    try {
      const room = await this.getRoom(roomId);
      if (!room) {
        return { success: false, error: 'Комната не найдена' };
      }

      const selectedProfessions = Array.from(room.players.values())
        .filter(p => p.profession)
        .map(p => p.profession);

      const availableProfessions = room.availableProfessions.filter(
        prof => !selectedProfessions.includes(prof)
      );

      return {
        success: true,
        professions: availableProfessions,
        selectedProfessions
      };
    } catch (error) {
      console.error('❌ Ошибка получения доступных профессий:', error);
      return { success: false, error: 'Ошибка получения доступных профессий' };
    }
  }

  // ===== УТИЛИТЫ =====

  /**
   * Получить данные комнаты для клиента
   */
  getRoomClientData(room) {
    return RoomUtils.getRoomClientData(room);
  }

  /**
   * Получить список комнат для клиента
   */
  getRoomsListData(rooms) {
    return RoomUtils.getRoomsListData(rooms);
  }

  /**
   * Проверить готовность комнаты к игре
   */
  isRoomReadyToStart(room) {
    return RoomUtils.isRoomReadyToStart(room);
  }

  /**
   * Получить статистику комнаты
   */
  getRoomStats(room) {
    return RoomUtils.getRoomStats(room);
  }

  /**
   * Обновить активность комнаты
   */
  updateRoomActivity(room) {
    RoomUtils.updateRoomActivity(room);
  }

  /**
   * Проверить, нужно ли удалить комнату
   */
  shouldDeleteRoom(room) {
    return RoomUtils.shouldDeleteRoom(room);
  }

  /**
   * Очистить неактивные комнаты
   */
  async cleanupInactiveRooms() {
    try {
      const deletedCount = await this.dbService.cleanupInactiveRooms();
      
      // Обновляем кэш
      const activeRooms = await this.getAllRooms();
      this.rooms.clear();
      activeRooms.forEach(room => {
        this.rooms.set(room.id, room);
      });

      return deletedCount;
    } catch (error) {
      console.error('❌ Ошибка очистки комнат:', error);
      return 0;
    }
  }

  /**
   * Получить статистику сервера
   */
  async getServerStats() {
    return await this.dbService.getStats();
  }
}
