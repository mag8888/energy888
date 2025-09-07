import { useState, useCallback, useMemo } from 'react';
import socket from '../../../socket.js';
import { MarketDeckManager, checkPlayerHasMatchingAsset } from '../../../data/marketCards.js';
import { ExpenseDeckManager } from '../../../data/expenseCards.js';
import { CELL_CONFIG } from '../../../data/gameCells.js';

export const useGameLogic = (gamePlayers, currentTurn, isHost, updateCurrentPlayerAssets) => {
  // Состояние для игровой логики
  const [diceValue, setDiceValue] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [isOnBigCircle, setIsOnBigCircle] = useState(false);
  const [bigCirclePosition, setBigCirclePosition] = useState(0);

  // Менеджеры колод карт
  const marketDeckManager = useMemo(() => new MarketDeckManager(), []);
  const expenseDeckManager = useMemo(() => new ExpenseDeckManager(), []);

  // Получение текущего игрока
  const currentPlayer = useMemo(() => {
    return gamePlayers.find(player => player.socketId === currentTurn);
  }, [gamePlayers, currentTurn]);

  // Получение активов текущего игрока
  const currentPlayerAssets = useMemo(() => {
    return currentPlayer?.assets || [];
  }, [currentPlayer]);

  // Получение баланса текущего игрока
  const currentPlayerBalance = useMemo(() => {
    return currentPlayer?.balance || 0;
  }, [currentPlayer]);

  // Проверка, может ли игрок бросать кости
  const canRollDice = useMemo(() => {
    return isHost && currentPlayer && !isRolling;
  }, [isHost, currentPlayer, isRolling]);

  // Бросок костей
  const rollDice = useCallback(() => {
    if (!canRollDice) return;

    setIsRolling(true);
    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);

    // Отправляем результат на сервер
    socket.emit('rollDice', { roomId: socket.roomId, value });

    // Симулируем анимацию
    setTimeout(() => {
      setIsRolling(false);
    }, 1000);
  }, [canRollDice]);

  // Обработка движения игрока
  const handlePlayerMove = useCallback((newPosition) => {
    setPlayerPosition(newPosition);
    
    // Проверяем, попал ли игрок на большой круг
    if (newPosition >= 24) {
      setIsOnBigCircle(true);
      setBigCirclePosition(newPosition - 24);
    } else {
      setIsOnBigCircle(false);
      setBigCirclePosition(0);
    }
  }, []);

  // Обработка карточки профессии
  const handleProfessionCard = useCallback((profession) => {
    if (!currentPlayer) return;

    // Обновляем профессию игрока
    updateCurrentPlayerAssets([...currentPlayerAssets, profession]);
    
    // Отправляем на сервер
    socket.emit('updatePlayerAssets', {
      roomId: socket.roomId,
      playerId: currentPlayer.socketId,
      assets: [...currentPlayerAssets, profession]
    });
  }, [currentPlayer, currentPlayerAssets, updateCurrentPlayerAssets]);

  // Обработка карточки рынка
  const handleMarketCard = useCallback((card) => {
    if (!currentPlayer) return;

    // Проверяем, может ли игрок купить карточку
    const canBuy = currentPlayerBalance >= card.cost;
    
    if (canBuy) {
      // Обновляем активы и баланс
      const newAssets = [...currentPlayerAssets, card];
      updateCurrentPlayerAssets(newAssets);
      
      // Отправляем на сервер
      socket.emit('updatePlayerAssets', {
        roomId: socket.roomId,
        playerId: currentPlayer.socketId,
        assets: newAssets
      });
      
      socket.emit('updatePlayerBalance', {
        roomId: socket.roomId,
        playerId: currentPlayer.socketId,
        balance: currentPlayerBalance - card.cost
      });
    }
  }, [currentPlayer, currentPlayerAssets, currentPlayerBalance, updateCurrentPlayerAssets]);

  // Обработка карточки расходов
  const handleExpenseCard = useCallback((card) => {
    if (!currentPlayer) return;

    // Проверяем, может ли игрок оплатить расходы
    const canPay = currentPlayerBalance >= card.cost;
    
    if (canPay) {
      // Обновляем баланс
      socket.emit('updatePlayerBalance', {
        roomId: socket.roomId,
        playerId: currentPlayer.socketId,
        balance: currentPlayerBalance - card.cost
      });
    } else {
      // Игрок не может оплатить - нужно взять кредит
      // Логика для кредитования будет добавлена позже
    }
  }, [currentPlayer, currentPlayerBalance]);

  // Обработка благотворительности
  const handleCharity = useCallback(() => {
    if (!currentPlayer) return;

    // Логика благотворительности
    socket.emit('charityPass', {
      roomId: socket.roomId,
      playerId: currentPlayer.socketId
    });
  }, [currentPlayer]);

  // Обработка перерыва
  const handleBreak = useCallback(() => {
    if (!currentPlayer) return;

    // Логика перерыва
    socket.emit('takeBreak', {
      roomId: socket.roomId,
      playerId: currentPlayer.socketId
    });
  }, [currentPlayer]);

  // Проверка, есть ли у игрока акции
  const hasPlayerStock = useCallback((card) => {
    if (!card || !isStockCard(card)) return false;
    
    return currentPlayerAssets.some(asset => 
      asset.type === 'stock' && asset.symbol === card.symbol
    );
  }, [currentPlayerAssets]);

  // Продажа акций
  const handleSellStock = useCallback((card) => {
    if (!currentPlayer || !hasPlayerStock(card)) return;

    const newAssets = currentPlayerAssets.filter(asset => 
      !(asset.type === 'stock' && asset.symbol === card.symbol)
    );
    
    updateCurrentPlayerAssets(newAssets);
    
    // Отправляем на сервер
    socket.emit('updatePlayerAssets', {
      roomId: socket.roomId,
      playerId: currentPlayer.socketId,
      assets: newAssets
    });
  }, [currentPlayer, currentPlayerAssets, hasPlayerStock, updateCurrentPlayerAssets]);

  // Вспомогательная функция для проверки типа карточки
  const isStockCard = (card) => {
    return card && card.type === 'stock';
  };

  return {
    diceValue,
    isRolling,
    playerPosition,
    isOnBigCircle,
    bigCirclePosition,
    currentPlayer,
    currentPlayerAssets,
    currentPlayerBalance,
    canRollDice,
    rollDice,
    handlePlayerMove,
    handleProfessionCard,
    handleMarketCard,
    handleExpenseCard,
    handleCharity,
    handleBreak,
    hasPlayerStock,
    handleSellStock,
    marketDeckManager,
    expenseDeckManager
  };
};
