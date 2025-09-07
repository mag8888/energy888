// Типы и интерфейсы для игровой доски

export const GAME_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished'
};

export const PLAYER_STATES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  FINISHED: 'finished'
};

export const CELL_TYPES = {
  START: 'start',
  PROFESSION: 'profession',
  MARKET: 'market',
  EXPENSE: 'expense',
  CHARITY: 'charity',
  BREAK: 'break',
  BIG_CIRCLE: 'big_circle'
};

export const CARD_TYPES = {
  STOCK: 'stock',
  REAL_ESTATE: 'real_estate',
  BUSINESS: 'business',
  EXPENSE: 'expense'
};

// Интерфейсы для TypeScript (если используется)
export const PlayerInterface = {
  id: 'string',
  username: 'string',
  socketId: 'string',
  position: 'number',
  assets: 'array',
  balance: 'number',
  color: 'string',
  isHost: 'boolean',
  isCurrentTurn: 'boolean'
};

export const GameRoomInterface = {
  id: 'string',
  players: 'array',
  currentTurn: 'string',
  gameState: 'string',
  turnTimeLeft: 'number'
};
