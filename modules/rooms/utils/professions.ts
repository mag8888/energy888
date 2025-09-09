import { Profession } from '../types';

// Список всех доступных профессий
export const PROFESSIONS: Profession[] = [
  {
    id: 'entrepreneur',
    name: 'Предприниматель',
    description: 'Создает бизнес, получает доходы от инвестиций',
    startingMoney: 100000,
    monthlyIncome: 50000,
    specialAbilities: ['business_creation', 'investment_bonus']
  },
  {
    id: 'doctor',
    name: 'Врач',
    description: 'Лечит людей, стабильный доход',
    startingMoney: 80000,
    monthlyIncome: 40000,
    specialAbilities: ['healing', 'stable_income']
  },
  {
    id: 'teacher',
    name: 'Учитель',
    description: 'Обучает детей, скромный но стабильный доход',
    startingMoney: 50000,
    monthlyIncome: 25000,
    specialAbilities: ['education_bonus', 'stable_income']
  },
  {
    id: 'engineer',
    name: 'Инженер',
    description: 'Создает технологии, высокий технический доход',
    startingMoney: 70000,
    monthlyIncome: 35000,
    specialAbilities: ['tech_creation', 'efficiency_bonus']
  },
  {
    id: 'artist',
    name: 'Художник',
    description: 'Создает искусство, нестабильный но творческий доход',
    startingMoney: 30000,
    monthlyIncome: 20000,
    specialAbilities: ['creativity_bonus', 'art_sales']
  },
  {
    id: 'lawyer',
    name: 'Юрист',
    description: 'Защищает права, высокий доход от консультаций',
    startingMoney: 90000,
    monthlyIncome: 45000,
    specialAbilities: ['legal_protection', 'consultation_bonus']
  },
  {
    id: 'scientist',
    name: 'Ученый',
    description: 'Проводит исследования, получает гранты',
    startingMoney: 60000,
    monthlyIncome: 30000,
    specialAbilities: ['research_bonus', 'grant_opportunities']
  },
  {
    id: 'chef',
    name: 'Повар',
    description: 'Готовит еду, доход от ресторанного бизнеса',
    startingMoney: 40000,
    monthlyIncome: 25000,
    specialAbilities: ['food_business', 'hospitality_bonus']
  },
  {
    id: 'musician',
    name: 'Музыкант',
    description: 'Создает музыку, доход от концертов и записей',
    startingMoney: 35000,
    monthlyIncome: 20000,
    specialAbilities: ['music_creation', 'performance_bonus']
  },
  {
    id: 'athlete',
    name: 'Спортсмен',
    description: 'Занимается спортом, доход от соревнований',
    startingMoney: 60000,
    monthlyIncome: 30000,
    specialAbilities: ['sports_bonus', 'competition_prizes']
  }
];

// Конфигурации комнат по умолчанию
export const ROOM_CONFIGS = {
  QUICK_GAME: {
    maxPlayers: 4,
    timing: 60,
    professionSelectionMode: 'random' as const,
    selectionTimeout: 30
  },
  STRATEGIC_GAME: {
    maxPlayers: 6,
    timing: 180,
    professionSelectionMode: 'choice' as const,
    selectionTimeout: 120
  },
  CASUAL_GAME: {
    maxPlayers: 8,
    timing: 90,
    professionSelectionMode: 'assigned' as const,
    selectionTimeout: 0
  }
};

// Утилиты для работы с профессиями
export class ProfessionUtils {
  /**
   * Получить профессию по ID
   */
  static getProfessionById(id: string): Profession | null {
    return PROFESSIONS.find(p => p.id === id) || null;
  }

  /**
   * Получить случайную профессию из списка
   */
  static getRandomProfession(availableIds: string[]): Profession | null {
    const availableProfessions = PROFESSIONS.filter(p => availableIds.includes(p.id));
    if (availableProfessions.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableProfessions.length);
    return availableProfessions[randomIndex];
  }

  /**
   * Получить профессии по списку ID
   */
  static getProfessionsByIds(ids: string[]): Profession[] {
    return PROFESSIONS.filter(p => ids.includes(p.id));
  }

  /**
   * Получить все профессии
   */
  static getAllProfessions(): Profession[] {
    return [...PROFESSIONS];
  }

  /**
   * Получить ID всех профессий
   */
  static getAllProfessionIds(): string[] {
    return PROFESSIONS.map(p => p.id);
  }

  /**
   * Проверить, доступна ли профессия
   */
  static isProfessionAvailable(professionId: string, availableIds: string[]): boolean {
    return availableIds.includes(professionId);
  }

  /**
   * Получить профессии для режима выбора
   */
  static getProfessionsForSelection(roomMaxPlayers: number): string[] {
    // Возвращаем количество профессий равное максимальному количеству игроков
    const shuffled = [...PROFESSIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, roomMaxPlayers).map(p => p.id);
  }

  /**
   * Валидировать выбор профессии
   */
  static validateProfessionSelection(
    professionId: string,
    availableProfessions: string[],
    selectedProfessions: string[]
  ): { valid: boolean; error?: string } {
    // Проверяем, что профессия доступна
    if (!this.isProfessionAvailable(professionId, availableProfessions)) {
      return { valid: false, error: 'Профессия недоступна' };
    }

    // Проверяем, что профессия не занята
    if (selectedProfessions.includes(professionId)) {
      return { valid: false, error: 'Профессия уже занята' };
    }

    return { valid: true };
  }

  /**
   * Применить специальные способности профессии к игроку
   */
  static applySpecialAbilities(player: any, abilities: string[]): void {
    // Здесь можно добавить логику применения специальных способностей
    console.log(`Применяем способности ${abilities.join(', ')} к игроку ${player.name}`);
  }
}

// Коды ошибок для профессий
export enum ProfessionErrorCode {
  PROFESSION_NOT_AVAILABLE = 'PROFESSION_NOT_AVAILABLE',
  PROFESSION_ALREADY_TAKEN = 'PROFESSION_ALREADY_TAKEN',
  INVALID_SELECTION_MODE = 'INVALID_SELECTION_MODE',
  SELECTION_TIMEOUT = 'SELECTION_TIMEOUT',
  PLAYER_NOT_IN_ROOM = 'PLAYER_NOT_IN_ROOM',
  ROOM_NOT_FOUND = 'ROOM_NOT_FOUND'
}
