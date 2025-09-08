import { Player, Asset, DealCard } from '../types';

export const validatePlayer = (player: Partial<Player>): player is Player => {
  return !!(
    player.id &&
    player.username &&
    player.profession &&
    typeof player.balance === 'number' &&
    typeof player.position === 'number' &&
    player.color
  );
};

export const validateAsset = (asset: Partial<Asset>): asset is Asset => {
  return !!(
    asset.id &&
    asset.name &&
    typeof asset.cost === 'number' &&
    typeof asset.income === 'number' &&
    asset.cost >= 0 &&
    asset.income >= 0
  );
};

export const validateDealCard = (card: Partial<DealCard>): card is DealCard => {
  return !!(
    card.id &&
    card.name &&
    typeof card.cost === 'number' &&
    typeof card.income === 'number' &&
    card.cost > 0 &&
    card.income >= 0 &&
    (card.type === 'small' || card.type === 'big')
  );
};

export const validateRoomId = (roomId: string): boolean => {
  return typeof roomId === 'string' && roomId.length > 0 && roomId.length <= 50;
};

export const validateUsername = (username: string): boolean => {
  return typeof username === 'string' && username.length >= 3 && username.length <= 20;
};

export const validateBalance = (balance: number): boolean => {
  return typeof balance === 'number' && balance >= 0 && balance <= 1000000;
};

export const validatePosition = (position: number): boolean => {
  return typeof position === 'number' && position >= 0 && position < 24;
};

export const validateDiceValue = (value: number): boolean => {
  return typeof value === 'number' && value >= 1 && value <= 6;
};

export const validateGameAction = (action: string): boolean => {
  const validActions = ['roll', 'pass', 'purchase', 'sell', 'charity'];
  return validActions.includes(action);
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6 && password.length <= 100;
};
