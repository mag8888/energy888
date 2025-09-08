// 🏦 Bank Types - Типы данных для банковского модуля

/**
 * @typedef {Object} Player
 * @property {string} id - Уникальный ID игрока
 * @property {string} username - Имя пользователя
 * @property {number} balance - Текущий баланс
 * @property {Object} profession - Профессия игрока
 * @property {number} profession.monthlyIncome - Месячный доход
 * @property {number} profession.monthlyExpenses - Месячные расходы
 * @property {number} profession.passiveIncome - Пассивный доход
 * @property {number} profession.balance - Начальный баланс
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id - Уникальный ID транзакции
 * @property {string} type - Тип транзакции
 * @property {number} amount - Сумма
 * @property {string} description - Описание
 * @property {Date} timestamp - Время транзакции
 * @property {string} playerId - ID игрока
 */

/**
 * @typedef {Object} CreditInfo
 * @property {number} amount - Сумма кредита
 * @property {number} interestRate - Процентная ставка
 * @property {number} termMonths - Срок в месяцах
 * @property {number} monthlyPayment - Ежемесячный платеж
 * @property {Date} startDate - Дата выдачи
 * @property {Date} endDate - Дата погашения
 */

/**
 * @typedef {Object} BankState
 * @property {number} balance - Текущий баланс
 * @property {number} credit - Текущий кредит
 * @property {CreditInfo[]} credits - Список кредитов
 * @property {Transaction[]} transactions - История транзакций
 * @property {boolean} isLoading - Состояние загрузки
 * @property {string|null} error - Ошибка
 */

/**
 * @typedef {Object} BankModuleProps
 * @property {Player} playerData - Данные игрока
 * @property {Player[]} gamePlayers - Список всех игроков
 * @property {Object} socket - WebSocket соединение
 * @property {number} bankBalance - Баланс банка
 * @property {number} playerCredit - Кредит игрока
 * @property {Function} getMaxCredit - Функция получения максимального кредита
 * @property {Function} getCashFlow - Функция получения денежного потока
 * @property {Function} setShowCreditModal - Функция показа модального окна кредита
 * @property {string} roomId - ID комнаты
 * @property {Function} onBankBalanceChange - Callback изменения баланса
 */

/**
 * @typedef {Object} BankModalProps
 * @property {boolean} open - Открыто ли модальное окно
 * @property {Function} onClose - Функция закрытия
 * @property {Player} player - Данные игрока
 * @property {Function} onTransaction - Callback транзакции
 * @property {BankState} bankState - Состояние банка
 */

/**
 * @typedef {Object} BankOperationsProps
 * @property {Player} player - Данные игрока
 * @property {Function} onOperation - Callback операции
 * @property {Transaction[]} transactions - История транзакций
 * @property {boolean} isLoading - Состояние загрузки
 */

// Константы типов транзакций
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal', 
  CREDIT: 'credit',
  PAYMENT: 'payment',
  TRANSFER: 'transfer',
  INTEREST: 'interest',
  FEE: 'fee'
};

// Константы статусов
export const BANK_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Константы валют
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  RUB: { symbol: '₽', name: 'Russian Ruble', code: 'RUB' }
};

// Валидаторы
export const validators = {
  /**
   * Валидирует ID игрока
   * @param {string} id - ID игрока
   * @returns {boolean} Валидный ли ID
   */
  playerId: (id) => typeof id === 'string' && id.length > 0,
  
  /**
   * Валидирует сумму
   * @param {number} amount - Сумма
   * @returns {boolean} Валидная ли сумма
   */
  amount: (amount) => typeof amount === 'number' && amount > 0 && !isNaN(amount),
  
  /**
   * Валидирует тип транзакции
   * @param {string} type - Тип транзакции
   * @returns {boolean} Валидный ли тип
   */
  transactionType: (type) => Object.values(TRANSACTION_TYPES).includes(type),
  
  /**
   * Валидирует данные игрока
   * @param {Player} player - Данные игрока
   * @returns {boolean} Валидные ли данные
   */
  player: (player) => {
    return player && 
           typeof player.id === 'string' && 
           typeof player.username === 'string' &&
           typeof player.balance === 'number';
  }
};

// Утилиты для работы с типами
export const typeUtils = {
  /**
   * Создает объект транзакции
   * @param {Object} data - Данные транзакции
   * @returns {Transaction} Объект транзакции
   */
  createTransaction: (data) => ({
    id: data.id || `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: data.type || TRANSACTION_TYPES.DEPOSIT,
    amount: data.amount || 0,
    description: data.description || '',
    timestamp: data.timestamp || new Date(),
    playerId: data.playerId || ''
  }),
  
  /**
   * Создает объект кредита
   * @param {Object} data - Данные кредита
   * @returns {CreditInfo} Объект кредита
   */
  createCredit: (data) => ({
    amount: data.amount || 0,
    interestRate: data.interestRate || 0.1,
    termMonths: data.termMonths || 12,
    monthlyPayment: data.monthlyPayment || 0,
    startDate: data.startDate || new Date(),
    endDate: data.endDate || new Date(Date.now() + (data.termMonths || 12) * 30 * 24 * 60 * 60 * 1000)
  })
};
