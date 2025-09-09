// Типы для системы комнат Energy of Money

export interface Player {
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
  cards: Card[];
  isActive: boolean;
}

export interface Card {
  id: string;
  type: 'expense' | 'income' | 'investment' | 'opportunity';
  title: string;
  description: string;
  value: number;
  category: string;
}

export interface Room {
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
  players: Map<string, Player>;
  started: boolean;
  order: string[];
  currentIndex: number;
  turnEndAt: Date | null;
  lastActivity: Date;
  isActive: boolean;
}

export interface HallOfFamePlayer {
  username: string;
  games: number;
  wins: number;
  points: number;
  lastPlayed: Date;
  totalPlayTime: number;
  averageGameTime: number;
  winRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profession {
  id: string;
  name: string;
  description: string;
  startingMoney: number;
  monthlyIncome: number;
  specialAbilities: string[];
}

export interface RoomStats {
  totalRooms: number;
  totalPlayers: number;
  isConnected: boolean;
  uptime: number;
  timestamp: string;
}

export interface CreateRoomData {
  name: string;
  maxPlayers: number;
  timing: number;
  playerName: string;
  playerEmail: string;
  password?: string;
  professionSelectionMode: 'random' | 'choice' | 'assigned';
  availableProfessions: string[];
  assignProfessionToAll: boolean;
}

export interface JoinRoomData {
  roomId: string;
  playerName: string;
  playerEmail: string;
  password?: string;
}

export interface SelectProfessionData {
  roomId: string;
  profession: string;
  playerId: string;
}

export interface ConfirmProfessionData {
  roomId: string;
  playerId: string;
  confirmed: boolean;
}

// Socket.IO Events
export interface SocketEvents {
  // Client to Server
  'get-rooms': () => void;
  'create-room': (data: CreateRoomData) => void;
  'join-room': (data: JoinRoomData) => void;
  'select-profession': (data: SelectProfessionData) => void;
  'confirm-profession': (data: ConfirmProfessionData) => void;
  'get-available-professions': (data: { roomId: string }) => void;
  'rooms-updated': () => void;
  
  // Server to Client
  'rooms-list': (rooms: Room[]) => void;
  'room-created': (room: Room) => void;
  'room-joined': (room: Room) => void;
  'room-updated': (room: Room) => void;
  'available-professions': (data: {
    roomId: string;
    professions: string[];
    selectionMode: string;
    selectedProfessions: string[];
  }) => void;
  'profession-selected': (data: {
    roomId: string;
    playerId: string;
    profession: string;
    success: boolean;
  }) => void;
  'profession-confirmed': (data: {
    roomId: string;
    playerId: string;
    profession: string;
    confirmed: boolean;
  }) => void;
  'profession-selection-updated': (data: {
    roomId: string;
    players: Player[];
    availableProfessions: string[];
    allProfessionsSelected: boolean;
  }) => void;
  'rooms-updated': () => void;
  'error': (error: { message: string; code?: string }) => void;
}

// API Response Types
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface RoomListResponse {
  rooms: Room[];
  total: number;
  active: number;
}

export interface StatsResponse {
  totalRooms: number;
  totalPlayers: number;
  isConnected: boolean;
  uptime: number;
  timestamp: string;
}

export interface HallOfFameResponse {
  players: HallOfFamePlayer[];
  limit: number;
  sortBy: string;
}

// Error Types
export enum RoomErrorCode {
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND',
  ROOM_FULL = 'ROOM_FULL',
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  PROFESSION_NOT_AVAILABLE = 'PROFESSION_NOT_AVAILABLE',
  PROFESSION_ALREADY_TAKEN = 'PROFESSION_ALREADY_TAKEN',
  INVALID_SELECTION_MODE = 'INVALID_SELECTION_MODE',
  SELECTION_TIMEOUT = 'SELECTION_TIMEOUT',
  PLAYER_NOT_IN_ROOM = 'PLAYER_NOT_IN_ROOM',
  ROOM_ALREADY_STARTED = 'ROOM_ALREADY_STARTED',
  INVALID_PLAYER_DATA = 'INVALID_PLAYER_DATA',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

export interface RoomError {
  code: RoomErrorCode;
  message: string;
  details?: any;
}

// Configuration Types
export interface RoomConfig {
  maxPlayers: number;
  timing: number;
  professionSelectionMode: 'random' | 'choice' | 'assigned';
  selectionTimeout: number;
  cleanupInterval: number;
  roomLifetime: number;
  emptyRoomTimeout: number;
}

export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
  };
}

// Event Types
export interface RoomEvent {
  type: 'created' | 'updated' | 'deleted' | 'player_joined' | 'player_left' | 'profession_selected';
  roomId: string;
  data: any;
  timestamp: Date;
}

export interface PlayerEvent {
  type: 'joined' | 'left' | 'profession_selected' | 'profession_confirmed' | 'ready';
  playerId: string;
  roomId: string;
  data: any;
  timestamp: Date;
}
