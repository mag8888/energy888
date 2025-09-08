// 🏦 Bank Utilities - Утилиты для банковского модуля

/**
 * Форматирует сумму валюты
 * @param {number} amount - Сумма
 * @param {string} currency - Валюта (по умолчанию '$')
 * @returns {string} Отформатированная сумма
 */
export const formatCurrency = (amount, currency = '$') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${currency}0`;
  }
  
  return `${currency}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

/**
 * Вычисляет максимальный кредит на основе дохода
 * @param {number} monthlyIncome - Месячный доход
 * @param {number} monthlyExpenses - Месячные расходы
 * @returns {number} Максимальный кредит
 */
export const calculateMaxCredit = (monthlyIncome, monthlyExpenses = 0) => {
  const netIncome = monthlyIncome - monthlyExpenses;
  return Math.floor(netIncome * 10); // 10 месяцев дохода
};

/**
 * Вычисляет денежный поток
 * @param {Object} player - Данные игрока
 * @returns {number} Денежный поток
 */
export const calculateCashFlow = (player) => {
  if (!player || !player.profession) {
    return 0;
  }
  
  const profession = player.profession;
  const monthlyIncome = profession.monthlyIncome || 0;
  const monthlyExpenses = profession.monthlyExpenses || 0;
  const passiveIncome = profession.passiveIncome || 0;
  
  return monthlyIncome + passiveIncome - monthlyExpenses;
};

/**
 * Проверяет, может ли игрок взять кредит
 * @param {number} requestedAmount - Запрашиваемая сумма
 * @param {number} maxCredit - Максимальный кредит
 * @param {number} currentCredit - Текущий кредит
 * @returns {Object} Результат проверки
 */
export const canTakeCredit = (requestedAmount, maxCredit, currentCredit = 0) => {
  const availableCredit = maxCredit - currentCredit;
  
  return {
    canTake: requestedAmount <= availableCredit,
    availableCredit,
    requestedAmount,
    maxCredit,
    currentCredit
  };
};

/**
 * Вычисляет ежемесячный платеж по кредиту
 * @param {number} principal - Основная сумма кредита
 * @param {number} annualRate - Годовая процентная ставка
 * @param {number} months - Количество месяцев
 * @returns {number} Ежемесячный платеж
 */
export const calculateMonthlyPayment = (principal, annualRate = 0.1, months = 12) => {
  if (principal <= 0 || months <= 0) return 0;
  
  const monthlyRate = annualRate / 12;
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
  
  return Math.round(monthlyPayment);
};

/**
 * Валидирует сумму транзакции
 * @param {number} amount - Сумма
 * @param {number} minAmount - Минимальная сумма
 * @param {number} maxAmount - Максимальная сумма
 * @returns {Object} Результат валидации
 */
export const validateTransactionAmount = (amount, minAmount = 0, maxAmount = Infinity) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'Сумма должна быть числом' };
  }
  
  if (amount < minAmount) {
    return { isValid: false, error: `Минимальная сумма: ${formatCurrency(minAmount)}` };
  }
  
  if (amount > maxAmount) {
    return { isValid: false, error: `Максимальная сумма: ${formatCurrency(maxAmount)}` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Создает уникальный ID транзакции
 * @returns {string} Уникальный ID
 */
export const generateTransactionId = () => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Форматирует дату для отображения
 * @param {Date|string|number} date - Дата
 * @returns {string} Отформатированная дата
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Константы для банковского модуля
 */
export const BANK_CONSTANTS = {
  DEFAULT_INTEREST_RATE: 0.1, // 10% годовых
  MIN_CREDIT_AMOUNT: 1000,
  MAX_CREDIT_AMOUNT: 1000000,
  CREDIT_MULTIPLIER: 10, // Кредит = 10 месяцев дохода
  TRANSACTION_TYPES: {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    CREDIT: 'credit',
    PAYMENT: 'payment',
    TRANSFER: 'transfer'
  },
  CURRENCIES: {
    USD: '$',
    EUR: '€',
    RUB: '₽'
  }
};
