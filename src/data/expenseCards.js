// Заглушка для expenseCards модуля
export class ExpenseDeckManager {
  constructor() {
    this.cards = [];
  }
  
  drawCard() {
    return {
      id: 'mock-expense',
      name: 'Mock Expense Card',
      type: 'expense',
      cost: 50
    };
  }
}
