export interface Loan {
  name: string;
  monthlyPayment: number;
  principal: number;
}

export interface Expense {
  name: string;
  amount: number;
  percentage: number;
}

export interface Profession {
  id: string;
  name: string;
  description: string;
  startingMoney: number;
  monthlyIncome: number;
  monthlyExpenses?: number;
  cashFlow?: number;
  specialAbilities: string[];
  color: string;
  icon: string;
  loans?: Loan[];
  expenses?: Expense[];
}

export const PROFESSIONS: Profession[] = [
  {
    id: 'entrepreneur',
    name: 'Предприниматель',
    description: 'Владелец успешного бизнеса. Высокий доход, но и высокие расходы на кредиты.',
    startingMoney: 0,
    monthlyIncome: 10000,
    monthlyExpenses: 6200,
    cashFlow: 3800,
    specialAbilities: ['Создание бизнеса', 'Управление рисками', 'Инновации'],
    color: '#FF6B6B',
    icon: '🚀',
    loans: [
      { name: 'Кредит на авто', monthlyPayment: 700, principal: 14000 },
      { name: 'Образовательный кредит', monthlyPayment: 500, principal: 10000 },
      { name: 'Ипотека', monthlyPayment: 1200, principal: 240000 },
      { name: 'Кредитные карты', monthlyPayment: 1000, principal: 20000 }
    ],
    expenses: [
      { name: 'Налоги', amount: 1300, percentage: 13 },
      { name: 'Прочие расходы', amount: 1500, percentage: 0 }
    ]
  },
  {
    id: 'investor',
    name: 'Инвестор',
    description: 'Профессиональный инвестор. Фокусируется на долгосрочных инвестициях и портфеле.',
    startingMoney: 5000,
    monthlyIncome: 3000,
    monthlyExpenses: 1800,
    cashFlow: 1200,
    specialAbilities: ['Анализ рынка', 'Диверсификация', 'Пассивный доход'],
    color: '#4ECDC4',
    icon: '📈',
    loans: [
      { name: 'Ипотека', monthlyPayment: 800, principal: 160000 },
      { name: 'Кредитные карты', monthlyPayment: 200, principal: 4000 }
    ],
    expenses: [
      { name: 'Налоги', amount: 600, percentage: 20 },
      { name: 'Прочие расходы', amount: 800, percentage: 0 }
    ]
  },
  {
    id: 'financier',
    name: 'Финансист',
    description: 'Специалист по финансовому планированию. Помогает другим управлять деньгами.',
    startingMoney: 3000,
    monthlyIncome: 4000,
    monthlyExpenses: 2400,
    cashFlow: 1600,
    specialAbilities: ['Финансовое планирование', 'Консультации', 'Оптимизация налогов'],
    color: '#45B7D1',
    icon: '💼',
    loans: [
      { name: 'Ипотека', monthlyPayment: 1000, principal: 200000 },
      { name: 'Кредит на авто', monthlyPayment: 400, principal: 8000 }
    ],
    expenses: [
      { name: 'Налоги', amount: 800, percentage: 20 },
      { name: 'Прочие расходы', amount: 600, percentage: 0 }
    ]
  },
  {
    id: 'consultant',
    name: 'Консультант',
    description: 'Эксперт в своей области. Зарабатывает на консультациях и экспертизе.',
    startingMoney: 1500,
    monthlyIncome: 6000,
    monthlyExpenses: 3600,
    cashFlow: 2400,
    specialAbilities: ['Экспертиза', 'Сетевые связи', 'Гибкий график'],
    color: '#96CEB4',
    icon: '🎯',
    loans: [
      { name: 'Ипотека', monthlyPayment: 1200, principal: 240000 },
      { name: 'Образовательный кредит', monthlyPayment: 300, principal: 6000 }
    ],
    expenses: [
      { name: 'Налоги', amount: 1200, percentage: 20 },
      { name: 'Прочие расходы', amount: 900, percentage: 0 }
    ]
  },
  {
    id: 'manager',
    name: 'Менеджер',
    description: 'Руководитель команды. Управляет людьми и процессами в компании.',
    startingMoney: 2500,
    monthlyIncome: 4500,
    monthlyExpenses: 2700,
    cashFlow: 1800,
    specialAbilities: ['Управление командой', 'Планирование', 'Мотивация'],
    color: '#FFEAA7',
    icon: '👥',
    loans: [
      { name: 'Ипотека', monthlyPayment: 900, principal: 180000 },
      { name: 'Кредит на авто', monthlyPayment: 500, principal: 10000 }
    ],
    expenses: [
      { name: 'Налоги', amount: 900, percentage: 20 },
      { name: 'Прочие расходы', amount: 400, percentage: 0 }
    ]
  },
  {
    id: 'analyst',
    name: 'Аналитик',
    description: 'Специалист по анализу данных. Принимает решения на основе исследований.',
    startingMoney: 2000,
    monthlyIncome: 3500,
    monthlyExpenses: 2100,
    cashFlow: 1400,
    specialAbilities: ['Анализ данных', 'Прогнозирование', 'Исследования'],
    color: '#DDA0DD',
    icon: '📊',
    loans: [
      { name: 'Ипотека', monthlyPayment: 700, principal: 140000 },
      { name: 'Образовательный кредит', monthlyPayment: 200, principal: 4000 }
    ],
    expenses: [
      { name: 'Налоги', amount: 700, percentage: 20 },
      { name: 'Прочие расходы', amount: 200, percentage: 0 }
    ]
  },
  {
    id: 'trader',
    name: 'Трейдер',
    description: 'Торговец на финансовых рынках. Зарабатывает на краткосрочных операциях.',
    startingMoney: 1000,
    monthlyIncome: 8000,
    monthlyExpenses: 4800,
    cashFlow: 3200,
    specialAbilities: ['Быстрые решения', 'Управление рисками', 'Технический анализ'],
    color: '#FF7675',
    icon: '⚡',
    loans: [
      { name: 'Ипотека', monthlyPayment: 1500, principal: 300000 },
      { name: 'Кредитные карты', monthlyPayment: 800, principal: 16000 }
    ],
    expenses: [
      { name: 'Налоги', amount: 1600, percentage: 20 },
      { name: 'Прочие расходы', amount: 900, percentage: 0 }
    ]
  },
  {
    id: 'banker',
    name: 'Банкир',
    description: 'Работник банка. Стабильный доход и доступ к финансовым инструментам.',
    startingMoney: 4000,
    monthlyIncome: 2500,
    monthlyExpenses: 1500,
    cashFlow: 1000,
    specialAbilities: ['Стабильность', 'Доступ к кредитам', 'Финансовые продукты'],
    color: '#74B9FF',
    icon: '🏦',
    loans: [
      { name: 'Ипотека', monthlyPayment: 600, principal: 120000 }
    ],
    expenses: [
      { name: 'Налоги', amount: 500, percentage: 20 },
      { name: 'Прочие расходы', amount: 400, percentage: 0 }
    ]
  }
];

export const DREAMS = [
  'Финансовая независимость',
  'Собственный бизнес',
  'Инвестиционный портфель',
  'Пассивный доход',
  'Международная карьера',
  'Образовательный центр',
  'Благотворительный фонд',
  'Технологический стартап'
];

export const GAME_DURATIONS = [
  { value: 30, label: '30 минут', minutes: 30 },
  { value: 60, label: '1 час', minutes: 60 },
  { value: 120, label: '2 часа', minutes: 120 },
  { value: 180, label: '3 часа', minutes: 180 },
  { value: 240, label: '4 часа', minutes: 240 }
];

export const TURN_TIMES = [
  { value: 60, label: '1 минута' },
  { value: 120, label: '2 минуты' },
  { value: 180, label: '3 минуты' },
  { value: 240, label: '4 минуты' },
  { value: 300, label: '5 минут' }
];
