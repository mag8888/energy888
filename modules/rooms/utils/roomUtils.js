// Утилиты для работы с комнатами
export class RoomUtils {
  /**
   * Создать новую комнату
   */
  static createRoom(data) {
    return {
      id: data.id,
      name: data.name,
      creatorId: data.creatorId,
      creatorUsername: data.creatorUsername,
      creatorProfession: null,
      creatorDream: null,
      assignProfessionToAll: data.assignProfessionToAll,
      availableProfessions: data.availableProfessions,
      professionSelectionMode: data.professionSelectionMode,
      maxPlayers: data.maxPlayers,
      password: data.password || null,
      timing: data.timing,
      createdAt: new Date(),
      gameDurationSec: 10800, // 3 часа по умолчанию
      gameEndAt: null,
      deleteAfterAt: null,
      players: new Map(),
      started: false,
      order: [],
      currentIndex: 0,
      turnEndAt: null,
      lastActivity: new Date(),
      isActive: true
    };
  }

  /**
   * Создать нового игрока
   */
  static createPlayer(data) {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      socketId: data.socketId,
      isReady: false,
      profession: null,
      dream: null,
      selectedProfession: null,
      professionConfirmed: false,
      joinedAt: new Date(),
      money: 0,
      position: 0,
      cards: [],
      isActive: true
    };
  }

  /**
   * Добавить игрока в комнату
   */
  static addPlayerToRoom(room, player) {
    if (room.players.size >= room.maxPlayers) {
      return false;
    }

    room.players.set(player.socketId, player);
    room.lastActivity = new Date();
    return true;
  }

  /**
   * Удалить игрока из комнаты
   */
  static removePlayerFromRoom(room, socketId) {
    const removed = room.players.delete(socketId);
    if (removed) {
      room.lastActivity = new Date();
    }
    return removed;
  }

  /**
   * Получить игрока из комнаты
   */
  static getPlayerFromRoom(room, socketId) {
    return room.players.get(socketId) || null;
  }

  /**
   * Проверить, может ли игрок присоединиться к комнате
   */
  static canPlayerJoinRoom(room, password) {
    if (!room.isActive) {
      return { canJoin: false, reason: 'Комната неактивна' };
    }

    if (room.started) {
      return { canJoin: false, reason: 'Игра уже началась' };
    }

    if (room.players.size >= room.maxPlayers) {
      return { canJoin: false, reason: 'Комната заполнена' };
    }

    if (room.password && room.password !== password) {
      return { canJoin: false, reason: 'Неверный пароль' };
    }

    return { canJoin: true };
  }

  /**
   * Проверить, готова ли комната к началу игры
   */
  static isRoomReadyToStart(room) {
    const hasMinimumPlayers = room.players.size >= 2;
    const allPlayersHaveProfessions = Array.from(room.players.values()).every(player => 
      player.profession && player.professionConfirmed
    );
    const allPlayersReady = Array.from(room.players.values()).every(player => 
      player.isReady
    );

    return hasMinimumPlayers && allPlayersHaveProfessions && allPlayersReady;
  }

  /**
   * Получить данные комнаты для клиента
   */
  static getRoomClientData(room) {
    return {
      id: room.id,
      name: room.name,
      maxPlayers: room.maxPlayers,
      players: room.players.size,
      status: room.started ? 'playing' : 'waiting',
      timing: room.timing,
      professionSelectionMode: room.professionSelectionMode,
      availableProfessions: room.availableProfessions,
      playersList: Array.from(room.players.values())
    };
  }

  /**
   * Получить список комнат для клиента
   */
  static getRoomsListData(rooms) {
    return rooms.map(room => ({
      id: room.id,
      name: room.name,
      maxPlayers: room.maxPlayers,
      players: room.players.size,
      status: room.started ? 'playing' : 'waiting',
      timing: room.timing,
      hasPassword: !!room.password
    }));
  }

  /**
   * Обновить активность комнаты
   */
  static updateRoomActivity(room) {
    room.lastActivity = new Date();
  }

  /**
   * Проверить, нужно ли удалить комнату
   */
  static shouldDeleteRoom(room) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Удаляем если комната неактивна более 24 часов
    if (!room.isActive && room.lastActivity < oneDayAgo) {
      return true;
    }

    // Удаляем если комната пустая более 1 часа
    if (room.players.size === 0 && room.lastActivity < oneHourAgo && !room.started) {
      return true;
    }

    return false;
  }

  /**
   * Получить статистику комнаты
   */
  static getRoomStats(room) {
    const players = Array.from(room.players.values());
    return {
      totalPlayers: players.length,
      readyPlayers: players.filter(p => p.isReady).length,
      playersWithProfessions: players.filter(p => p.profession).length,
      confirmedProfessions: players.filter(p => p.professionConfirmed).length,
      isReadyToStart: this.isRoomReadyToStart(room),
      timeSinceCreated: Date.now() - room.createdAt.getTime(),
      timeSinceLastActivity: Date.now() - room.lastActivity.getTime()
    };
  }

  /**
   * Валидировать данные создания комнаты
   */
  static validateCreateRoomData(data) {
    const errors = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Название комнаты обязательно');
    }

    if (!data.maxPlayers || data.maxPlayers < 2 || data.maxPlayers > 10) {
      errors.push('Количество игроков должно быть от 2 до 10');
    }

    if (!data.timing || data.timing < 30 || data.timing > 300) {
      errors.push('Время хода должно быть от 30 до 300 секунд');
    }

    if (!data.playerName || data.playerName.trim().length === 0) {
      errors.push('Имя игрока обязательно');
    }

    if (!data.playerEmail || data.playerEmail.trim().length === 0) {
      errors.push('Email игрока обязателен');
    }

    if (!['random', 'choice', 'assigned'].includes(data.professionSelectionMode)) {
      errors.push('Неверный режим выбора профессий');
    }

    if (!Array.isArray(data.availableProfessions) || data.availableProfessions.length === 0) {
      errors.push('Список доступных профессий не может быть пустым');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Валидировать данные присоединения к комнате
   */
  static validateJoinRoomData(data) {
    const errors = [];

    if (!data.roomId || data.roomId.trim().length === 0) {
      errors.push('ID комнаты обязателен');
    }

    if (!data.playerName || data.playerName.trim().length === 0) {
      errors.push('Имя игрока обязательно');
    }

    if (!data.playerEmail || data.playerEmail.trim().length === 0) {
      errors.push('Email игрока обязателен');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Генерировать уникальный ID комнаты
   */
  static generateRoomId() {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Генерировать уникальный ID игрока
   */
  static generatePlayerId() {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }
}
