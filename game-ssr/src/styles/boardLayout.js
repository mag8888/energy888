export const BOARD_SIZE = 800;
export const OUTER_PADDING = 50;
export const OUTER_CELL = 48;
export const OUTER_STEPS = 12;
export const INNER_RING_RADIUS = 225;
export const INNER_CELL = 68;

export const ACTION_CARD_OFFSETS = {
  // симметрично к углам, не перекрывая внешние клетки
  big: { dx: -230, dy: -220 },
  small: { dx: 230, dy: -220 },
  expenses: { dx: -230, dy: 220 },
  market: { dx: 230, dy: 220 }
};
