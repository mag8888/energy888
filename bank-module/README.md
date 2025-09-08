# 🏦 Energy of Money Bank Module

Модуль банковских операций для игры Energy of Money. Предоставляет полный функционал для управления финансами игроков, включая кредиты, транзакции и денежный поток.

## 📦 Установка

```bash
npm install energy-money-bank-module
```

## 🚀 Использование

### Базовое использование

```jsx
import React from 'react';
import { BankModule } from 'energy-money-bank-module';

function GameComponent() {
  const playerData = {
    id: 'player1',
    username: 'Игрок 1',
    balance: 3000,
    profession: {
      monthlyIncome: 5000,
      monthlyExpenses: 3000,
      passiveIncome: 0,
      balance: 3000
    }
  };

  const gamePlayers = [playerData];

  return (
    <BankModule
      playerData={playerData}
      gamePlayers={gamePlayers}
      socket={socket}
      bankBalance={0}
      playerCredit={0}
      getMaxCredit={() => 50000}
      getCashFlow={() => 2000}
      setShowCreditModal={() => {}}
      roomId="room1"
      onBankBalanceChange={(balance) => console.log('Balance changed:', balance)}
    />
  );
}
```

### Использование отдельных компонентов

```jsx
import { BankModal, BankOperations } from 'energy-money-bank-module';

// Модальное окно банка
<BankModal
  open={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  player={playerData}
  onTransaction={(transaction) => handleTransaction(transaction)}
  bankState={bankState}
/>

// Банковские операции
<BankOperations
  player={playerData}
  onOperation={(operation) => handleOperation(operation)}
  transactions={transactions}
  isLoading={false}
/>
```

## 🧩 Компоненты

### BankModule
Основной компонент банковского модуля с полным функционалом.

**Props:**
- `playerData` - Данные текущего игрока
- `gamePlayers` - Массив всех игроков
- `socket` - WebSocket соединение
- `bankBalance` - Баланс банка
- `playerCredit` - Кредит игрока
- `getMaxCredit` - Функция получения максимального кредита
- `getCashFlow` - Функция получения денежного потока
- `setShowCreditModal` - Функция показа модального окна кредита
- `roomId` - ID комнаты
- `onBankBalanceChange` - Callback изменения баланса

### BankModal
Модальное окно для детальных банковских операций.

**Props:**
- `open` - Открыто ли модальное окно
- `onClose` - Функция закрытия
- `player` - Данные игрока
- `onTransaction` - Callback транзакции
- `bankState` - Состояние банка

### BankOperations
Компонент для выполнения банковских операций.

**Props:**
- `player` - Данные игрока
- `onOperation` - Callback операции
- `transactions` - История транзакций
- `isLoading` - Состояние загрузки

## 🛠️ Утилиты

### formatCurrency(amount, currency)
Форматирует сумму валюты.

```javascript
import { formatCurrency } from 'energy-money-bank-module';

formatCurrency(1500); // "$1,500"
formatCurrency(1500, '€'); // "€1,500"
```

### calculateMaxCredit(monthlyIncome, monthlyExpenses)
Вычисляет максимальный кредит на основе дохода.

```javascript
import { calculateMaxCredit } from 'energy-money-bank-module';

const maxCredit = calculateMaxCredit(5000, 3000); // 20000
```

### calculateCashFlow(player)
Вычисляет денежный поток игрока.

```javascript
import { calculateCashFlow } from 'energy-money-bank-module';

const cashFlow = calculateCashFlow(playerData); // 2000
```

## 📊 Типы данных

### Player
```typescript
interface Player {
  id: string;
  username: string;
  balance: number;
  profession: {
    monthlyIncome: number;
    monthlyExpenses: number;
    passiveIncome: number;
    balance: number;
  };
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'credit' | 'payment' | 'transfer';
  amount: number;
  description: string;
  timestamp: Date;
  playerId: string;
}
```

## 🎨 Стилизация

Модуль использует Material-UI и поддерживает кастомизацию через темы:

```jsx
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffd700',
    },
    secondary: {
      main: '#4ecdc4',
    },
  },
});

<ThemeProvider theme={theme}>
  <BankModule {...props} />
</ThemeProvider>
```

## 🔧 Зависимости

- React >= 16.8.0
- @mui/material >= 5.14.0
- @mui/icons-material >= 5.14.0
- framer-motion >= 10.16.0

## 📝 Лицензия

MIT

## 🤝 Поддержка

Для вопросов и предложений создавайте issues в репозитории проекта.

## 📈 Версии

### 1.0.0
- Первоначальный релиз
- Базовый функционал банковских операций
- Поддержка кредитов и транзакций
- Material-UI интерфейс
