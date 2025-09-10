// 🏦 Пример базового использования Bank Module

import React, { useState } from 'react';
import { BankModule, BankModal, BankOperations, formatCurrency, calculateMaxCredit } from 'energy-money-bank-module';

// Пример данных игрока
const mockPlayerData = {
  id: 'player1',
  username: 'Игрок 1',
  balance: 5000,
  profession: {
    monthlyIncome: 8000,
    monthlyExpenses: 4500,
    passiveIncome: 500,
    balance: 5000
  }
};

const mockGamePlayers = [mockPlayerData];

// Пример WebSocket (заглушка)
const mockSocket = {
  emit: (event, data) => console.log('Socket emit:', event, data),
  on: (event, callback) => console.log('Socket on:', event),
  connected: true
};

function BasicUsageExample() {
  const [bankBalance, setBankBalance] = useState(0);
  const [playerCredit, setPlayerCredit] = useState(0);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // Функции для работы с банком
  const getMaxCredit = () => {
    return calculateMaxCredit(mockPlayerData.profession.monthlyIncome, mockPlayerData.profession.monthlyExpenses);
  };

  const getCashFlow = () => {
    const income = mockPlayerData.profession.monthlyIncome + mockPlayerData.profession.passiveIncome;
    const expenses = mockPlayerData.profession.monthlyExpenses;
    return income - expenses;
  };

  const handleBankBalanceChange = (newBalance) => {
    setBankBalance(newBalance);
    console.log('Bank balance changed:', newBalance);
  };

  const handleTransaction = (transaction) => {
    setTransactions(prev => [...prev, transaction]);
    console.log('New transaction:', transaction);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🏦 Пример использования Bank Module</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Информация об игроке</h2>
        <p><strong>Имя:</strong> {mockPlayerData.username}</p>
        <p><strong>Баланс:</strong> {formatCurrency(mockPlayerData.balance)}</p>
        <p><strong>Месячный доход:</strong> {formatCurrency(mockPlayerData.profession.monthlyIncome)}</p>
        <p><strong>Месячные расходы:</strong> {formatCurrency(mockPlayerData.profession.monthlyExpenses)}</p>
        <p><strong>Пассивный доход:</strong> {formatCurrency(mockPlayerData.profession.passiveIncome)}</p>
        <p><strong>Денежный поток:</strong> {formatCurrency(getCashFlow())}</p>
        <p><strong>Максимальный кредит:</strong> {formatCurrency(getMaxCredit())}</p>
      </div>

      <BankModule
        playerData={mockPlayerData}
        gamePlayers={mockGamePlayers}
        socket={mockSocket}
        bankBalance={bankBalance}
        playerCredit={playerCredit}
        getMaxCredit={getMaxCredit}
        getCashFlow={getCashFlow}
        setShowCreditModal={setShowCreditModal}
        roomId="example-room"
        onBankBalanceChange={handleBankBalanceChange}
      />

      <BankModal
        open={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        player={mockPlayerData}
        onTransaction={handleTransaction}
        bankState={{
          balance: bankBalance,
          credit: playerCredit,
          credits: [],
          transactions: transactions,
          isLoading: false,
          error: null
        }}
      />

      <div style={{ marginTop: '20px' }}>
        <h2>История транзакций</h2>
        {transactions.length === 0 ? (
          <p>Транзакций пока нет</p>
        ) : (
          <ul>
            {transactions.map((tx, index) => (
              <li key={index}>
                {tx.type}: {formatCurrency(tx.amount)} - {tx.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default BasicUsageExample;
