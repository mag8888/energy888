export type CellType = 'opportunity' | 'doodad' | 'charity' | 'payday' | 'market' | 'child' | 'loss';

export type RatCell = {
  index: number; // 0..23
  name: string;
  type: CellType;
  color: string;
  description?: string;
};

// Colors
const COLORS = {
  opportunity: '#4CAF50', // зеленый
  doodad: '#E91E63',      // розовый
  charity: '#FF9800',     // оранжевый
  payday: '#FFD700',      // желтый
  market: '#00BCD4',      // голубой
  child: '#9C27B0',       // фиолетовый
  loss: '#000000'         // черный
};

export const RAT_RACE_CELLS: RatCell[] = [
  { index: 0,  name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 1,  name: 'Всякая всячина', type: 'doodad', color: COLORS.doodad },
  { index: 2,  name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 3,  name: 'Благотворительность', type: 'charity', color: COLORS.charity },
  { index: 4,  name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 5,  name: 'PayDay', type: 'payday', color: COLORS.payday },
  { index: 6,  name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 7,  name: 'Рынок', type: 'market', color: COLORS.market },
  { index: 8,  name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 9,  name: 'Всякая всячина', type: 'doodad', color: COLORS.doodad },
  { index: 10, name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 11, name: 'Ребёнок', type: 'child', color: COLORS.child },
  { index: 12, name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 13, name: 'PayDay', type: 'payday', color: COLORS.payday },
  { index: 14, name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 15, name: 'Рынок', type: 'market', color: COLORS.market },
  { index: 16, name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 17, name: 'Всякая всячина', type: 'doodad', color: COLORS.doodad },
  { index: 18, name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 19, name: 'Потеря', type: 'loss', color: COLORS.loss },
  { index: 20, name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 21, name: 'PayDay', type: 'payday', color: COLORS.payday },
  { index: 22, name: 'Возможность', type: 'opportunity', color: COLORS.opportunity },
  { index: 23, name: 'Рынок', type: 'market', color: COLORS.market }
];

export function getRatCell(idx: number) {
  const i = ((idx % 24) + 24) % 24;
  return RAT_RACE_CELLS[i];
}

