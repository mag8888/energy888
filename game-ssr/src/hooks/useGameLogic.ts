import { useCallback } from 'react';
import { GameCell, DealCard, Asset } from '../types';
import { getRatCell } from '../data/ratRaceCells';
import { validateDealCard, validateBalance, validateDiceValue } from '../utils/validation';

export const useGameLogic = () => {
  const handleLanding = useCallback((
    cellId: number,
    onPayday: (amount: number) => void,
    onChild: () => void,
    onOpportunity: () => void,
    onDoodad: (amount: number) => void,
    onMarket: () => void,
    onCharity: () => void,
    onLoss: (amount: number) => void,
    onDefault: (cell: GameCell) => void
  ) => {
    const cell = getRatCell(cellId);
    
    switch (cell.type) {
      case 'payday':
        const salary = 6000; // TODO: Get from player profession
        onPayday(salary);
        break;
      case 'child':
        const childDice = Math.floor(Math.random() * 6) + 1;
        if (childDice <= 4) {
          onChild();
        }
        break;
      case 'opportunity':
        onOpportunity();
        break;
      case 'doodad':
        const amount = Math.floor(100 + Math.random() * 3900);
        onDoodad(amount);
        break;
      case 'market':
        onMarket();
        break;
      case 'charity':
        onCharity();
        break;
      case 'loss':
        const lossAmount = Math.floor(6000 / 2); // TODO: Calculate based on profession
        onLoss(lossAmount);
        break;
      default:
        onDefault(cell);
    }
  }, []);

  const purchaseDeal = useCallback((
    card: DealCard,
    currentBalance: number,
    onSuccess: (card: DealCard) => void,
    onError: (message: string) => void
  ) => {
    if (!card) {
      onError('Карточка не найдена');
      return;
    }
    
    if (!validateDealCard(card)) {
      onError('Некорректные данные карточки');
      return;
    }
    
    if (!validateBalance(currentBalance)) {
      onError('Некорректный баланс');
      return;
    }
    
    if (currentBalance < card.cost) {
      onError('Недостаточно денег для покупки');
      return;
    }
    
    onSuccess(card);
  }, []);

  const calculatePassiveIncome = useCallback((assets: Asset[]) => {
    return assets.reduce((sum, asset) => sum + (asset.income || 0), 0);
  }, []);

  const calculateBusinessCount = useCallback((assets: Asset[]) => {
    return assets.filter(asset => (asset.income || 0) > 0).length;
  }, []);

  return {
    handleLanding,
    purchaseDeal,
    calculatePassiveIncome,
    calculateBusinessCount
  };
};
