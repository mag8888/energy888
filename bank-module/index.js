// 🏦 Energy of Money Bank Module
// Модуль банковских операций для игры Energy of Money

export { default as BankModule } from './src/BankModule.js';
export { default as BankModal } from './src/BankModal.js';
export { default as BankOperations } from './src/BankOperations.js';

// Экспорт типов и утилит
export * from './src/bankUtils.js';
export * from './src/bankTypes.js';

// Версия модуля
export const VERSION = '1.0.0';
export const MODULE_NAME = 'energy-money-bank-module';
