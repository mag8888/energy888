// Заглушка для playerColors модуля
export const PLAYER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

export const assignPlayerColor = (index) => {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
};

export const getColorByIndex = (index) => {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
};

export const getContrastTextColor = (backgroundColor) => {
  // Простая логика для определения контрастного цвета
  return '#FFFFFF';
};
