import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { Player, GameCell, DealCard, Asset } from '../types';
import { useGameState } from '../hooks/useGameState';
import { useGameLogic } from '../hooks/useGameLogic';
import useTurnState from '../lib/useTurnState';
import GameGrid from './GameGrid';
import PlayerTokens from './PlayerTokens';
import GameCenter from './GameCenter';
import PlayerPanel from './PlayerPanel';
import CellPopup from './CellPopup';
import ProfessionDetails from './ProfessionDetails';
import { assignPlayerColor } from '../styles/playerColors';

interface RefactoredGameBoardProps {
  roomId: string;
  playerData: Player;
  onExit?: () => void;
}

const RefactoredGameBoard: React.FC<RefactoredGameBoardProps> = ({ 
  roomId, 
  playerData, 
  onExit 
}) => {
  // Game state
  const {
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
  } = useGameState(playerData);

  // Game logic
  const { handleLanding, purchaseDeal, calculatePassiveIncome, calculateBusinessCount } = useGameLogic();

  // Turn state
  const { state: turnState, timeLeft, isRolling, isMoving, dice: diceValue, roll: rollDice, pass: passTurn, canPass } = useTurnState(120);

  // UI state
  const [scale, setScale] = useState(1);
  const [showCellPopup, setShowCellPopup] = useState(false);
  const [selectedCell, setSelectedCell] = useState<GameCell | null>(null);
  const [showProfession, setShowProfession] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [currentDealCard, setCurrentDealCard] = useState<DealCard | null>(null);
  const [charityOpen, setCharityOpen] = useState(false);

  // Deal decks
  const smallDeck = useMemo(() => [
    { id: 's1', name: 'Акции TechCo', cost: 1000, income: 50, type: 'small' as const },
    { id: 's2', name: 'Облигации City', cost: 2000, income: 110, type: 'small' as const },
    { id: 's3', name: 'Стартап доля', cost: 3000, income: 0, type: 'small' as const }
  ], []);

  const bigDeck = useMemo(() => [
    { id: 'b1', name: 'Кофейня', cost: 10000, income: 700, type: 'big' as const },
    { id: 'b2', name: 'Квартира', cost: 40000, income: 700, type: 'big' as const },
    { id: 'b3', name: 'Франшиза', cost: 25000, income: 1200, type: 'big' as const }
  ], []);

  // Responsive scaling
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      if (w < 900) {
        const s = Math.max(0.55, (w - 32) / 800);
        setScale(s);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle cell landing
  const handleCellLanding = useCallback((cellId: number) => {
    handleLanding(
      cellId,
      (amount) => {
        updatePlayerBalance(amount);
        showToast(`💰 PAYDAY: +$${amount.toLocaleString()}`, 'success');
      },
      () => {
        const childDice = Math.floor(Math.random() * 6) + 1;
        if (childDice <= 4) {
          setChildrenCount(prev => prev + 1);
          setMonthlyChildExpense(prev => prev + 500);
          updatePlayerBalance(5000);
          showToast(`👶 Ребёнок родился! +$5,000 (кубик ${childDice})`, 'success');
        } else {
          showToast(`👶 Ребёнок не родился (кубик ${childDice})`, 'info');
        }
      },
      () => setDealDialogOpen(true),
      (amount) => {
        updatePlayerBalance(-amount);
        showToast(`🧾 Всякая всячина: -$${amount.toLocaleString()}`, 'warning');
      },
      () => showToast('🏪 Рынок: изменения цен активов', 'info'),
      () => setCharityOpen(true),
      (amount) => {
        updatePlayerBalance(-amount);
        showToast(`⚫ Потеря: -$${amount.toLocaleString()}`, 'error');
      },
      (cell) => {
        setSelectedCell(cell);
        setShowCellPopup(true);
      }
    );
  }, [handleLanding, updatePlayerBalance, showToast, setChildrenCount, setMonthlyChildExpense]);

  // Handle dice roll
  const handleRollDice = useCallback(() => {
    rollDice();
  }, [rollDice]);

  // Handle turn pass
  const handlePassTurn = useCallback(() => {
    passTurn();
  }, [passTurn]);

  // Handle deal purchase
  const handlePurchaseDeal = useCallback((card: DealCard) => {
    purchaseDeal(
      card,
      playerMoney,
      (purchasedCard) => {
        setPlayerMoney(prev => prev - purchasedCard.cost);
        addAsset(purchasedCard);
        showToast(`✅ Куплено: ${purchasedCard.name}`, 'success');
        setCurrentDealCard(null);
      },
      (error) => showToast(error, 'error')
    );
  }, [purchaseDeal, playerMoney, setPlayerMoney, addAsset, showToast]);

  // Handle deal cancel
  const handleCancelDeal = useCallback((card: DealCard) => {
    setCurrentDealCard(null);
  }, []);

  // Draw deal card
  const drawDeal = useCallback((type: 'small' | 'big') => {
    const deck = type === 'small' ? smallDeck : bigDeck;
    if (deck.length === 0) {
      showToast('❌ Колода пуста', 'warning');
      return null;
    }
    const card = deck[Math.floor(Math.random() * deck.length)];
    return card;
  }, [smallDeck, bigDeck, showToast]);

  // Handle deal dialog
  const handleDealDialog = useCallback((type: 'small' | 'big') => {
    setDealDialogOpen(false);
    const card = drawDeal(type);
    if (card) {
      setCurrentDealCard(card);
    }
  }, [drawDeal]);

  // Handle charity
  const handleCharity = useCallback(() => {
    const amount = Math.floor((playerData.profession?.salary ?? 0 + calculatePassiveIncome(assets)) * 0.1);
    setPlayerMoney(prev => Math.max(0, prev - amount));
    showToast(`❤️ Благотворительность: -$${amount.toLocaleString()}`, 'info');
    setCharityOpen(false);
  }, [playerData.profession, calculatePassiveIncome, assets, setPlayerMoney, showToast]);

  // Handle player click
  const handlePlayerClick = useCallback((player: Player) => {
    setSelectedPlayer(player);
    setShowProfession(true);
  }, []);

  // Handle bank balance change
  const handleBankBalanceChange = useCallback((balance: number) => {
    setPlayerMoney(balance);
  }, [setPlayerMoney]);

  // Memoized values
  const currentPlayerName = useMemo(() => 
    gamePlayers[currentPlayer]?.username || 'Игрок', 
    [gamePlayers, currentPlayer]
  );

  const canRoll = turnState === 'yourTurn' && !isRolling && !isMoving;
  const canPassTurn = turnState === 'rolled' && canPass;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      p: { xs: 1.5, md: 2 },
      display: 'flex',
      gap: 2,
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      {/* Game Board */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <GameGrid scale={scale} onCellClick={handleCellLanding} />
          <PlayerTokens players={gamePlayers} scale={scale} />
          <GameCenter 
            onRollDice={handleRollDice}
            isRolling={isRolling}
            isMoving={isMoving}
            canRoll={canRoll}
          />
        </Box>

        {/* Player Panel */}
        <PlayerPanel
          players={gamePlayers}
          currentPlayer={currentPlayerName}
          playerMoney={playerMoney}
          assets={assets}
          onPlayerClick={handlePlayerClick}
          onRollDice={handleRollDice}
          onPassTurn={handlePassTurn}
          canRoll={canRoll}
          canPass={canPassTurn}
          timeLeft={timeLeft}
          maxTime={120}
          roomId={roomId}
          playerData={playerData}
          onBankBalanceChange={handleBankBalanceChange}
        />
      </Box>

      {/* Modals and Dialogs */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={3000} 
        onClose={hideToast}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>

      <CellPopup 
        open={showCellPopup} 
        onClose={() => setShowCellPopup(false)} 
        cell={selectedCell} 
      />

      <Dialog open={showProfession} onClose={() => setShowProfession(false)} fullWidth maxWidth="sm">
        <DialogTitle>Профессия игрока</DialogTitle>
        <DialogContent>
          <ProfessionDetails profession={selectedPlayer?.profession} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProfession(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={charityOpen} onClose={() => setCharityOpen(false)}>
        <DialogTitle>Благотворительность</DialogTitle>
        <DialogContent>
          <Typography>
            Пожертвовать 10% от дохода: ${Math.floor((playerData.profession?.salary ?? 0 + calculatePassiveIncome(assets)) * 0.1).toLocaleString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCharityOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCharity}>Пожертвовать</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dealDialogOpen} onClose={() => setDealDialogOpen(false)}>
        <DialogTitle>Выберите тип сделки</DialogTitle>
        <DialogActions>
          <Button onClick={() => handleDealDialog('small')}>Малая</Button>
          <Button onClick={() => handleDealDialog('big')}>Большая</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!currentDealCard} onClose={() => currentDealCard && handleCancelDeal(currentDealCard)}>
        <DialogTitle>{currentDealCard?.name}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Цена: ${currentDealCard?.cost?.toLocaleString()} | Доход: ${currentDealCard?.income?.toLocaleString()}/мес
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => currentDealCard && handleCancelDeal(currentDealCard)}>Отмена</Button>
          <Button variant="contained" onClick={() => currentDealCard && handlePurchaseDeal(currentDealCard)}>Купить</Button>
        </DialogActions>
      </Dialog>

      {/* Debug info */}
      <Box sx={{ 
        mt: 2, 
        p: 1, 
        color: 'rgba(255,255,255,0.65)', 
        fontFamily: 'monospace', 
        fontSize: 12, 
        borderTop: '1px dashed rgba(255,255,255,0.15)' 
      }}>
        DEBUG: RefactoredGameBoard | dice: {diceValue} | state: {turnState} | time: {timeLeft}s
      </Box>
    </Box>
  );
};

export default RefactoredGameBoard;
