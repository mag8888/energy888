import React from 'react';

export interface Transaction {
  id: string;
  type: 'initial' | 'transfer' | 'received' | 'expense' | 'credit' | 'payday' | 'charity';
  amount: number;
  description: string;
  timestamp: string;
  from: string;
  to: string;
  status: 'completed' | 'pending' | 'failed';
  balanceAfter: number;
}

export interface BankModuleProps {
  playerData: any;
  gamePlayers: any[];
  socket: any;
  bankBalance: number;
  playerCredit: number;
  getMaxCredit: () => number;
  getCashFlow: () => number;
  setShowCreditModal: (show: boolean) => void;
  roomId: string;
  onBankBalanceChange: (balance: number) => void;
  transferHistory?: Transaction[];
}

declare const BankModule: React.FC<BankModuleProps>;
export default BankModule;

