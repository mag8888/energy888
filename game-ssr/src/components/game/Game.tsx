import React, { useState, useCallback, useMemo } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import GameBoard from './GameBoard';
import Dice from './Dice';
import Button from '../ui/Button';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';

interface Player {
  id: string;
  name: string;
  position?: number;
  money?: number;
  isReady: boolean;
  profession?: string;
  dream?: string;
  socketId?: string;
}

interface GameProps {
  players: Player[];
  currentPlayer?: Player;
  currentIndex?: number;
  onRollDice: () => void;
  onBuyCard: (cardId: string, price: number) => void;
  onGetGameState: () => void;
  onPlayerAction: (action: string, data?: any) => void;
  isMyTurn: boolean;
  isLoading?: boolean;
  error?: string | null;
  diceValue?: number | null;
  isRolling?: boolean;
}

const Game: React.FC<GameProps> = ({
  players,
  currentPlayer,
  currentIndex = 0,
  onRollDice,
  onBuyCard,
  onGetGameState,
  onPlayerAction,
  isMyTurn,
  isLoading = false,
  error = null,
  diceValue = null,
  isRolling = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [showCardModal, setShowCardModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [gameStats, setGameStats] = useState({
    totalMoves: 0,
    totalMoney: players.reduce((sum, p) => sum + (p.money || 0), 0),
    gameTime: 0
  });

  // Memoized game statistics
  const gameStatistics = useMemo(() => {
    const totalMoney = players.reduce((sum, p) => sum + (p.money || 0), 0);
    const averageMoney = players.length > 0 ? totalMoney / players.length : 0;
    const richestPlayer = players.reduce((max, p) => 
      (p.money || 0) > (max.money || 0) ? p : max, players[0]
    );

    return {
      totalMoney,
      averageMoney,
      richestPlayer,
      totalPlayers: players.length,
      readyPlayers: players.filter(p => p.isReady).length
    };
  }, [players]);

  const handleCellClick = useCallback((cellId: number) => {
    if (!isMyTurn) return;
    
    // Find the cell data
    const outerCell = players.find(p => p.position === cellId);
    if (outerCell) {
      setSelectedCard(outerCell);
      setShowCardModal(true);
    }
  }, [isMyTurn, players]);

  const handlePlayerClick = useCallback((playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      onPlayerAction('viewPlayer', { playerId, player });
    }
  }, [players, onPlayerAction]);

  const handleDiceRollComplete = useCallback((value: number) => {
    onPlayerAction('diceRolled', { value });
  }, [onPlayerAction]);

  const handleBuyCard = useCallback(() => {
    if (selectedCard && selectedCard.cost) {
      onBuyCard(selectedCard.id.toString(), selectedCard.cost);
      setShowCardModal(false);
      setSelectedCard(null);
    }
  }, [selectedCard, onBuyCard]);

  if (isLoading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner 
          size={60} 
          message="Загрузка игры..." 
          fullScreen 
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography variant="h5" color="error" sx={{ textAlign: 'center' }}>
          Ошибка загрузки игры
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          {error}
        </Typography>
        <Button onClick={onGetGameState} variant="primary">
          Попробовать снова
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Game Header */}
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          padding: isMobile ? 1 : 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold' }}>
            Energy of Money
          </Typography>
          {currentPlayer && (
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Ход: {currentPlayer.name}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Dice
            value={diceValue}
            isRolling={isRolling}
            onRollComplete={handleDiceRollComplete}
            disabled={!isMyTurn}
            size={isMobile ? 'small' : 'medium'}
          />
          
          <Button
            variant="primary"
            onClick={onRollDice}
            disabled={!isMyTurn || isRolling}
            loading={isRolling}
            size={isMobile ? 'small' : 'medium'}
          >
            {isRolling ? 'Бросаем...' : 'Бросить кубик'}
          </Button>
          
          <Button
            variant="secondary"
            onClick={onGetGameState}
            size={isMobile ? 'small' : 'medium'}
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {/* Game Board */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <GameBoard
          players={players}
          currentPlayer={currentPlayer}
          currentIndex={currentIndex}
          onCellClick={handleCellClick}
          onPlayerClick={handlePlayerClick}
          isMyTurn={isMyTurn}
        />
      </Box>

      {/* Game Statistics */}
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          padding: isMobile ? 1 : 2,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Общий капитал
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            ${gameStatistics.totalMoney.toLocaleString()}
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Игроков готово
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {gameStatistics.readyPlayers}/{gameStatistics.totalPlayers}
          </Typography>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Лидер
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {gameStatistics.richestPlayer?.name || 'Нет'}
          </Typography>
        </Box>
      </Box>

      {/* Card Purchase Modal */}
      <Modal
        open={showCardModal}
        onClose={() => setShowCardModal(false)}
        title={selectedCard?.name}
        maxWidth="sm"
        actions={
          selectedCard?.cost ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="secondary"
                onClick={() => setShowCardModal(false)}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                onClick={handleBuyCard}
                disabled={!currentPlayer || (currentPlayer.money || 0) < selectedCard.cost}
              >
                Купить за ${selectedCard.cost?.toLocaleString()}
              </Button>
            </Box>
          ) : (
            <Button onClick={() => setShowCardModal(false)}>
              Закрыть
            </Button>
          )
        }
      >
        {selectedCard && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedCard.description}
            </Typography>
            {selectedCard.cost && (
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Стоимость: ${selectedCard.cost.toLocaleString()}
              </Typography>
            )}
            {selectedCard.income && (
              <Typography variant="body1" sx={{ color: 'success.main' }}>
                Доход: ${selectedCard.income.toLocaleString()}
              </Typography>
            )}
          </Box>
        )}
      </Modal>
    </Box>
  );
};

export default Game;
