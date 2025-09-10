import React from 'react';
import { Transaction } from '../types/bank';

declare module './bank-module/src/BankModule' {
  interface BankModuleProps {
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
  
  const BankModule: React.FC<BankModuleProps>;
  export default BankModule;
}
