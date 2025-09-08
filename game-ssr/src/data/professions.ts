export type CreditBreakdown = {
  name: string;
  monthly: number; // ежемесячный платёж
  principal: number; // тело кредита
};

export type Profession = {
  id: string;
  name: string;
  salary: number; // доход/зарплата
  totalExpenses: number; // базовые расходы (без кредитов)
  cashFlow: number; // денежный поток (salary - totalExpenses - credit payments)
  taxes?: number; // налоги $/мес
  otherExpenses?: number; // прочие расходы $/мес
  credits: CreditBreakdown[]; // список кредитов
  creditsTotalPrincipal: number; // итог тела кредитов
};

export const PROFESSIONS: Profession[] = [
  {
    id: 'entrepreneur',
    name: 'Предприниматель',
    salary: 10000,
    totalExpenses: 6200,
    cashFlow: 3800,
    taxes: 1300,
    otherExpenses: 1500,
    credits: [
      { name: 'Кредит на авто', monthly: 700, principal: 14000 },
      { name: 'Образовательный кредит', monthly: 500, principal: 10000 },
      { name: 'Ипотека', monthly: 1200, principal: 240000 },
      { name: 'Кредитные карты', monthly: 1000, principal: 20000 }
    ],
    creditsTotalPrincipal: 284000
  },
  {
    id: 'programmer',
    name: 'Программист',
    salary: 6000,
    totalExpenses: 2500,
    cashFlow: 3500,
    credits: [],
    creditsTotalPrincipal: 0
  }
];

export function getProfession(id: string) {
  return PROFESSIONS.find(p => p.id === id) || PROFESSIONS[0];
}

