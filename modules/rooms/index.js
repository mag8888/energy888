// Основной модуль системы комнат Energy of Money (JavaScript версия)
export { RoomController } from './controllers/RoomController.js';
export { DatabaseService } from './services/DatabaseService.js';
export { RoomUtils } from './utils/roomUtils.js';
export { ProfessionUtils, PROFESSIONS, ROOM_CONFIGS } from './utils/professions.js';

// Экспорт моделей
export { default as RoomModel } from './models/RoomModel.js';
export { default as HallOfFameModel } from './models/HallOfFameModel.js';
