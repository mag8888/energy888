export const PLAYER_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
];

export function assignPlayerColor(allPlayers: any[] = [], player: any) {
  const used = new Set(allPlayers.map(p => p.color).filter(Boolean));
  const color = PLAYER_COLORS.find(c => !used.has(c)) || PLAYER_COLORS[0];
  return color;
}

export function getColorByIndex(i: number) {
  return PLAYER_COLORS[i % PLAYER_COLORS.length];
}

export function getContrastTextColor(bg: string) {
  // Basic luminance check
  try {
    const c = bg.replace('#','');
    const r = parseInt(c.substring(0,2), 16);
    const g = parseInt(c.substring(2,4), 16);
    const b = parseInt(c.substring(4,6), 16);
    const yiq = (r*299 + g*587 + b*114) / 1000;
    return yiq >= 128 ? '#000' : '#fff';
  } catch {
    return '#fff';
  }
}

