// 🏦 Пример расширенного использования Bank Module

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BankModule, 
  BankModal, 
  BankOperations,
  formatCurrency, 
  calculateMaxCredit,
  calculateCashFlow,
  canTakeCredit,
  calculateMonthlyPayment,
  generateTransactionId,
  formatDate,
  TRANSACTION_TYPES,
  BANK_CONSTANTS
} from 'energy-money-bank-module';

// Расширенные данные игроков
const mockPlayers = [
  {
    id: 'player1',
    username: 'Игрок 1',
    balance: 15000,
    profession: {
      name: 'Врач',
      monthlyIncome: 12000,
      monthlyExpenses: 6000,
      passiveIncome: 2000,
      balance: 15000
    }
  },
  {
    id: 'player2', 
    username: 'Игрок 2',
    balance: 8000,
    profession: {
      name: 'Учитель',
      monthlyIncome: 6000,
      monthlyExpenses: 4000,
      passiveIncome: 500,
      balance: 8000
    }
  }
];

function AdvancedUsageExample() {
  const [currentPlayer, setCurrentPlayer] = useState(mockPlayers[0]);
  const [bankBalance, setBankBalance] = useState(0);
  const [playerCredit, setPlayerCredit] = useState(0);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [credits, setCredits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Функции для работы с банком
  const getMaxCredit = useCallback(() => {
    return calculateMaxCredit(
      currentPlayer.profession.monthlyIncome, 
      currentPlayer.profession.monthlyExpenses
    );
  }, [currentPlayer]);

  const getCashFlow = useCallback(() => {
    return calculateCashFlow(currentPlayer);
  }, [currentPlayer]);

  const handleBankBalanceChange = useCallback((newBalance) => {
    setBankBalance(newBalance);
    console.log('Bank balance changed:', newBalance);
  }, []);

  const handleTransaction = useCallback((transaction) => {
    const newTransaction = {
      ...transaction,
      id: generateTransactionId(),
      timestamp: new Date(),
      playerId: currentPlayer.id
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    console.log('New transaction:', newTransaction);
  }, [currentPlayer]);

  const handleCreditRequest = useCallback((amount) => {
    const maxCredit = getMaxCredit();
    const creditCheck = canTakeCredit(amount, maxCredit, playerCredit);
    
    if (!creditCheck.canTake) {
      alert(`Недостаточно кредитного лимита. Доступно: ${formatCurrency(creditCheck.availableCredit)}`);
      return;
    }

    const monthlyPayment = calculateMonthlyPayment(amount, BANK_CONSTANTS.DEFAULT_INTEREST_RATE);
    
    const newCredit = {
      id: generateTransactionId(),
      amount,
      interestRate: BANK_CONSTANTS.DEFAULT_INTEREST_RATE,
      termMonths: 12,
      monthlyPayment,
      startDate: new Date(),
      endDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000)
    };

    setCredits(prev => [...prev, newCredit]);
    setPlayerCredit(prev => prev + amount);
    
    handleTransaction({
      type: TRANSACTION_TYPES.CREDIT,
      amount,
      description: `Кредит на ${formatCurrency(amount)}`
    });
  }, [getMaxCredit, playerCredit, handleTransaction]);

  const handlePayment = useCallback((amount) => {
    if (amount > currentPlayer.balance) {
      alert('Недостаточно средств');
      return;
    }

    setPlayerCredit(prev => Math.max(0, prev - amount));
    
    handleTransaction({
      type: TRANSACTION_TYPES.PAYMENT,
      amount: -amount,
      description: `Платеж по кредиту ${formatCurrency(amount)}`
    });
  }, [currentPlayer.balance, handleTransaction]);

  // Эффект для обновления баланса при изменении транзакций
  useEffect(() => {
    const totalDeposits = transactions
      .filter(tx => tx.type === TRANSACTION_TYPES.DEPOSIT)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const totalWithdrawals = transactions
      .filter(tx => tx.type === TRANSACTION_TYPES.WITHDRAWAL)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    setBankBalance(totalDeposits - totalWithdrawals);
  }, [transactions]);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>🏦 Расширенное использование Bank Module</h1>
      
      {/* Выбор игрока */}
      <div style={{ marginBottom: '20px' }}>
        <h2>Выберите игрока</h2>
        <select 
          value={currentPlayer.id} 
          onChange={(e) => setCurrentPlayer(mockPlayers.find(p => p.id === e.target.value))}
          style={{ padding: '8px', fontSize: '16px' }}
        >
          {mockPlayers.map(player => (
            <option key={player.id} value={player.id}>
              {player.username} ({player.profession.name})
            </option>
          ))}
        </select>
      </div>

      {/* Информация об игроке */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>📊 Финансовая информация</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <div><strong>Имя:</strong> {currentPlayer.username}</div>
          <div><strong>Профессия:</strong> {currentPlayer.profession.name}</div>
          <div><strong>Баланс:</strong> {formatCurrency(currentPlayer.balance)}</div>
          <div><strong>Месячный доход:</strong> {formatCurrency(currentPlayer.profession.monthlyIncome)}</div>
          <div><strong>Месячные расходы:</strong> {formatCurrency(currentPlayer.profession.monthlyExpenses)}</div>
          <div><strong>Пассивный доход:</strong> {formatCurrency(currentPlayer.profession.passiveIncome)}</div>
          <div><strong>Денежный поток:</strong> {formatCurrency(getCashFlow())}</div>
          <div><strong>Максимальный кредит:</strong> {formatCurrency(getMaxCredit())}</div>
          <div><strong>Текущий кредит:</strong> {formatCurrency(playerCredit)}</div>
          <div><strong>Доступный кредит:</strong> {formatCurrency(getMaxCredit() - playerCredit)}</div>
        </div>
      </div>

      {/* Основной банковский модуль */}
      <BankModule
        playerData={currentPlayer}
        gamePlayers={mockPlayers}
        socket={null} // В примере не используем WebSocket
        bankBalance={bankBalance}
        playerCredit={playerCredit}
        getMaxCredit={getMaxCredit}
        getCashFlow={getCashFlow}
        setShowCreditModal={setShowCreditModal}
        roomId="advanced-example-room"
        onBankBalanceChange={handleBankBalanceChange}
      />

      {/* Модальное окно банка */}
      <BankModal
        open={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        player={currentPlayer}
        onTransaction={handleTransaction}
        bankState={{
          balance: bankBalance,
          credit: playerCredit,
          credits: credits,
          transactions: transactions,
          isLoading: isLoading,
          error: null
        }}
      />

      {/* Дополнительные операции */}
      <div style={{ marginTop: '20px' }}>
        <h2>🔧 Дополнительные операции</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleCreditRequest(10000)}
            disabled={getMaxCredit() - playerCredit < 10000}
            style={{ padding: '10px 15px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Взять кредит $10,000
          </button>
          <button 
            onClick={() => handlePayment(1000)}
            disabled={currentPlayer.balance < 1000 || playerCredit <= 0}
            style={{ padding: '10px 15px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Платеж по кредиту $1,000
          </button>
        </div>
      </div>

      {/* История транзакций */}
      <div style={{ marginTop: '20px' }}>
        <h2>📋 История транзакций</h2>
        {transactions.length === 0 ? (
          <p>Транзакций пока нет</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Дата</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Тип</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Сумма</th>
                  <th style={{ padding: '8px', border: '1px solid #ddd' }}>Описание</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index}>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{formatDate(tx.timestamp)}</td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.type}</td>
                    <td style={{ 
                      padding: '8px', 
                      border: '1px solid #ddd',
                      color: tx.amount > 0 ? 'green' : 'red'
                    }}>
                      {formatCurrency(Math.abs(tx.amount))}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #ddd' }}>{tx.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Активные кредиты */}
      {credits.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>💳 Активные кредиты</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {credits.map((credit, index) => (
              <div key={index} style={{ 
                padding: '15px', 
                border: '1px solid #ddd', 
                borderRadius: '8px',
                backgroundColor: '#fff3e0'
              }}>
                <div><strong>Сумма:</strong> {formatCurrency(credit.amount)}</div>
                <div><strong>Ставка:</strong> {(credit.interestRate * 100).toFixed(1)}% годовых</div>
                <div><strong>Ежемесячный платеж:</strong> {formatCurrency(credit.monthlyPayment)}</div>
                <div><strong>Срок:</strong> {credit.termMonths} месяцев</div>
                <div><strong>Дата выдачи:</strong> {formatDate(credit.startDate)}</div>
                <div><strong>Дата погашения:</strong> {formatDate(credit.endDate)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvancedUsageExample;
