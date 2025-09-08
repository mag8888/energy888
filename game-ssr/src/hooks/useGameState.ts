import { useState, useCallback } from 'react';
import { GameState, Player, Asset, Toast } from '../types';

export const useGameState = (initialPlayer: Player) => {
  const [gamePlayers, setGamePlayers] = useState<Player[]>([initialPlayer]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [playerMoney, setPlayerMoney] = useState(initialPlayer.balance);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [childrenCount, setChildrenCount] = useState(0);
  const [monthlyChildExpense, setMonthlyChildExpense] = useState(0);
  const [playerCredit, setPlayerCredit] = useState(0);
  const [toast, setToast] = useState<Toast>({ open: false, message: '', severity: 'info' });

  const addAsset = useCallback((asset: Asset) => {
    setAssets(prev => [...prev, asset]);
  }, []);

  const removeAsset = useCallback((assetId: string) => {
    setAssets(prev => prev.filter(asset => asset.id !== assetId));
  }, []);

  const updatePlayerBalance = useCallback((amount: number) => {
    setPlayerMoney(prev => Math.max(0, prev + amount));
  }, []);

  const showToast = useCallback((message: string, severity: Toast['severity'] = 'info') => {
    setToast({ open: true, message, severity });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, open: false }));
  }, []);

  const getCashFlow = useCallback(() => {
    const salary = initialPlayer.profession?.salary ?? 0;
    const passive = assets.reduce((sum, asset) => sum + (asset.income || 0), 0);
    const baseExpenses = initialPlayer.profession?.totalExpenses ?? 0;
    const childExp = monthlyChildExpense;
    return salary + passive - (baseExpenses + childExp);
  }, [initialPlayer.profession, assets, monthlyChildExpense]);

  return {
    gamePlayers,
    setGamePlayers,
    currentPlayer,
    setCurrentPlayer,
    playerMoney,
    setPlayerMoney,
    assets,
    addAsset,
    removeAsset,
    childrenCount,
    setChildrenCount,
    monthlyChildExpense,
    setMonthlyChildExpense,
    playerCredit,
    setPlayerCredit,
    toast,
    showToast,
    hideToast,
    updatePlayerBalance,
    getCashFlow
  };
};
