export type FastType = 'money' | 'dream' | 'business' | 'loss' | 'charity';

export interface FastCell {
  index: number; // 1..52
  type: FastType;
  name: string;
  color: string;
  cost?: number;
  income?: number;
  bonus?: number | string;
  description?: string;
}

const COLORS = {
  money: '#FFD700',
  dream: '#E91E63',
  business: '#4CAF50',
  loss: '#8B0000',
  charity: '#FF69B4'
};

export const FAST_TRACK_CELLS: FastCell[] = [
  // Money
  { index: 1, type: 'money', name: 'Доход от инвестиций', color: COLORS.money, description: 'Получите доход от всех активов' },
  { index: 14, type: 'money', name: 'Объехать 100 стран', color: COLORS.money, bonus: 500000, description: 'Бонус за путешествия' },
  { index: 36, type: 'money', name: 'Денежная клетка', color: COLORS.money, description: 'Специальная денежная операция' },
  { index: 40, type: 'money', name: 'Доход от инвестиций', color: COLORS.money, description: 'Получите доход от всех активов' },
  { index: 41, type: 'money', name: 'Денежная клетка', color: COLORS.money, description: 'Специальная денежная операция' },

  // Dreams
  { index: 2,  type: 'dream', name: 'Дом мечты для семьи', color: COLORS.dream, cost: 100000 },
  { index: 6,  type: 'dream', name: 'Антарктида', color: COLORS.dream, cost: 150000 },
  { index: 12, type: 'dream', name: '7 вершин мира', color: COLORS.dream, cost: 500000 },
  { index: 16, type: 'dream', name: 'Год на яхте', color: COLORS.dream, cost: 300000 },
  { index: 18, type: 'dream', name: 'Фонд поддержки талантов', color: COLORS.dream, cost: 300000 },
  { index: 20, type: 'dream', name: 'Мировой фестиваль', color: COLORS.dream, cost: 200000 },
  { index: 24, type: 'dream', name: 'Эко-ранчо (туркомплекс)', color: COLORS.dream, cost: 1000000 },
  { index: 26, type: 'dream', name: 'Биржа (с бонусом)', color: COLORS.dream, cost: 50000, bonus: '500k при 5-6' },
  { index: 28, type: 'dream', name: 'NFT-платформа', color: COLORS.dream, cost: 400000 },
  { index: 30, type: 'dream', name: 'Полет на Марс', color: COLORS.dream, cost: 300000 },
  { index: 32, type: 'dream', name: 'Школа будущего', color: COLORS.dream, cost: 300000 },
  { index: 35, type: 'dream', name: 'Кругосветное на паруснике', color: COLORS.dream, cost: 200000 },
  { index: 37, type: 'dream', name: 'Белоснежная яхта', color: COLORS.dream, cost: 300000 },
  { index: 42, type: 'dream', name: 'Белоснежная яхта', color: COLORS.dream, cost: 300000 },
  { index: 44, type: 'dream', name: 'Благотворительный фонд', color: COLORS.dream, cost: 200000 },
  { index: 46, type: 'dream', name: 'Полет в космос', color: COLORS.dream, cost: 250000 },
  { index: 48, type: 'dream', name: 'Кругосветное путешествие', color: COLORS.dream, cost: 300000 },

  // Business
  { index: 3,  type: 'business', name: 'Кофейня', color: COLORS.business, cost: 100000, income: 3000 },
  { index: 5,  type: 'business', name: 'Центр здоровья и спа', color: COLORS.business, cost: 270000, income: 5000 },
  { index: 7,  type: 'business', name: 'Мобильное приложение', color: COLORS.business, cost: 420000, income: 10000 },
  { index: 9,  type: 'business', name: 'Агентство digital-маркетинга', color: COLORS.business, cost: 160000, income: 4000 },
  { index: 11, type: 'business', name: 'Мини-отель', color: COLORS.business, cost: 200000, income: 5000 },
  { index: 13, type: 'business', name: 'Франшиза ресторана', color: COLORS.business, cost: 320000, income: 8000 },
  { index: 15, type: 'business', name: 'Йога/медитация центр', color: COLORS.business, cost: 170000, income: 4500 },
  { index: 17, type: 'business', name: 'Салон красоты/барбершоп', color: COLORS.business, cost: 500000, income: 15000 },
  { index: 19, type: 'business', name: 'Сеть автомоек', color: COLORS.business, cost: 120000, income: 3000 },
  { index: 21, type: 'business', name: 'Ретрит-центр', color: COLORS.business, cost: 500000, income: 0 },
  { index: 23, type: 'business', name: 'Сеть автомоек', color: COLORS.business, cost: 120000, income: 3500 },
  { index: 25, type: 'business', name: 'Кругосветка на паруснике', color: COLORS.business, cost: 300000, income: 0 },
  { index: 27, type: 'business', name: 'Частный самолёт', color: COLORS.business, cost: 1000000, income: 0 },
  { index: 29, type: 'business', name: 'Лидер мнений', color: COLORS.business, cost: 1000000, income: 0 },
  { index: 31, type: 'business', name: 'Биржа (с бонусом)', color: COLORS.business, cost: 50000, bonus: '500k при 5-6' },
  { index: 33, type: 'business', name: 'Полнометражный фильм', color: COLORS.business, cost: 500000, income: 0 },
  { index: 38, type: 'business', name: 'Франшиза «Поток денег»', color: COLORS.business, cost: 100000, income: 10000 },
  { index: 43, type: 'business', name: 'Пекарня с доставкой', color: COLORS.business, cost: 300000, income: 7000 },
  { index: 45, type: 'business', name: 'Онлайн-образовательная платформа', color: COLORS.business, cost: 200000, income: 5000 },
  { index: 47, type: 'business', name: 'Сеть фитнес-студий', color: COLORS.business, cost: 750000, income: 20000 },
  { index: 49, type: 'business', name: 'Коворкинг-пространство', color: COLORS.business, cost: 500000, income: 10000 },

  // Loss
  { index: 4,  type: 'loss', name: 'Аудит', color: COLORS.loss, description: 'Потеря 50% от активов' },
  { index: 10, type: 'loss', name: 'Кража 100% наличных', color: COLORS.loss, description: 'Потеря всех наличных' },
  { index: 22, type: 'loss', name: 'Развод', color: COLORS.loss, description: 'Потеря 50% от активов' },
  { index: 34, type: 'loss', name: 'Рейдерский захват', color: COLORS.loss, description: 'Потеря крупного бизнеса' },
  { index: 39, type: 'loss', name: 'Санкции', color: COLORS.loss, description: 'Блокировка всех счетов' },

  // Charity
  { index: 8,  type: 'charity', name: 'Благотворительность', color: COLORS.charity }
];

export function getFastTrackDreams() {
  return FAST_TRACK_CELLS.filter(c => c.type === 'dream').map(d => ({ id: `dream_${d.index}`, index: d.index, name: d.name, cost: d.cost!, color: d.color }));
}

