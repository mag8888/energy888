export interface Player {
  id: string;
  socketId: string;
  username: string;
  profession: Profession;
  balance: number;
  position: number;
  color: string;
  isOnBigCircle?: boolean;
  passiveIncome?: number;
  businessCount?: number;
  dreamPurchased?: boolean;
  baselinePassiveIncome?: number;
  isHost?: boolean;
  ready?: boolean;
}

export interface Profession {
  id: string;
  name: string;
  salary: number;
  totalExpenses: number;
  cashFlow: number;
  taxes?: number;
  otherExpenses?: number;
  credits: CreditBreakdown[];
  creditsTotalPrincipal: number;
}

export interface CreditBreakdown {
  name: string;
  monthly: number;
  principal: number;
}

export interface Asset {
  id: string;
  name: string;
  cost: number;
  income: number;
  type?: 'small' | 'big';
}

export interface GameCell {
  id: number;
  name: string;
  type: 'payday' | 'child' | 'opportunity' | 'doodad' | 'market' | 'charity' | 'loss' | 'default';
  color?: string;
  description?: string;
}

export interface GameState {
  players: Player[];
  currentPlayer: string;
  currentPlayerIndex: number;
  turnTimeLeft: number;
  gamePhase: 'waiting' | 'playing' | 'finished';
  roomId: string;
  isStarted: boolean;
  gameEndAt?: number;
}

export interface Room {
  id: string;
  name: string;
  creatorId: string;
  creatorUsername: string;
  creatorProfession?: Profession;
  creatorDream?: string;
  assignProfessionToAll: boolean;
  maxPlayers: number;
  password?: string;
  timing: number;
  createdAt: number;
  gameDurationSec: number;
  gameEndAt?: number;
  deleteAfterAt?: number;
  players: Map<string, Player>;
  started: boolean;
  order?: string[];
  currentIndex?: number;
  turnEndAt?: number;
  finished?: boolean;
}

export interface Toast {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export interface DealCard {
  id: string;
  name: string;
  cost: number;
  income: number;
  type: 'small' | 'big';
}

export interface TurnState {
  state: 'yourTurn' | 'rolled' | 'waitingOther';
  timeLeft: number;
  isRolling: boolean;
  isMoving: boolean;
  dice: number;
  canPass: boolean;
}
