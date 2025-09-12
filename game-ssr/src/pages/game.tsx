import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Game from '../components/game/Game';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSocket } from '../contexts/SocketContext';

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

interface GameState {
  players: Player[];
  currentPlayer?: Player;
  currentIndex?: number;
  diceValue?: number | null;
  isRolling?: boolean;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner?: Player;
}

export default function GamePage() {
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    gameStatus: 'waiting'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Check authentication
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/simple-auth');
      return;
    }
  }, [router]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleGameState = (data: any) => {
      setGameState(prev => ({
        ...prev,
        players: data.players || [],
        currentPlayer: data.currentPlayer,
        currentIndex: data.currentIndex,
        gameStatus: data.gameStatus || 'waiting'
      }));
      setLoading(false);
    };

    const handleDiceRolled = (data: any) => {
      setGameState(prev => ({
        ...prev,
        diceValue: data.value,
        isRolling: false
      }));
      setSnackbar({
        open: true,
        message: `Выпало: ${data.value}`,
        severity: 'info'
      });
    };

    const handlePlayerMoved = (data: any) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === data.playerId 
            ? { ...p, position: data.position, money: data.money }
            : p
        )
      }));
    };

    const handleGameError = (error: any) => {
      setError(error.message || 'Ошибка игры');
      setSnackbar({
        open: true,
        message: error.message || 'Ошибка игры',
        severity: 'error'
      });
    };

    const handlePlayerJoined = (data: any) => {
      setGameState(prev => ({
        ...prev,
        players: [...prev.players, data.player]
      }));
      setSnackbar({
        open: true,
        message: `${data.player.name} присоединился к игре`,
        severity: 'info'
      });
    };

    const handlePlayerLeft = (data: any) => {
      setGameState(prev => ({
        ...prev,
        players: prev.players.filter(p => p.id !== data.playerId)
      }));
      setSnackbar({
        open: true,
        message: 'Игрок покинул игру',
        severity: 'info'
      });
    };

    // Register event listeners
    socket.on('gameState', handleGameState);
    socket.on('diceRolled', handleDiceRolled);
    socket.on('playerMoved', handlePlayerMoved);
    socket.on('gameError', handleGameError);
    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);

    // Request initial game state
    socket.emit('getGameState');

    return () => {
      socket.off('gameState', handleGameState);
      socket.off('diceRolled', handleDiceRolled);
      socket.off('playerMoved', handlePlayerMoved);
      socket.off('gameError', handleGameError);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
    };
  }, [socket]);

  // Game actions
  const handleRollDice = useCallback(() => {
    if (!socket || !isConnected) return;
    
    setGameState(prev => ({ ...prev, isRolling: true }));
    socket.emit('rollDice');
  }, [socket, isConnected]);

  const handleBuyCard = useCallback((cardId: string, price: number) => {
    if (!socket || !isConnected) return;
    
    socket.emit('buyCard', { cardId, price });
    setSnackbar({
      open: true,
      message: `Карта куплена за $${price.toLocaleString()}`,
      severity: 'success'
    });
  }, [socket, isConnected]);

  const handleGetGameState = useCallback(() => {
    if (!socket || !isConnected) return;
    
    socket.emit('getGameState');
  }, [socket, isConnected]);

  const handlePlayerAction = useCallback((action: string, data?: any) => {
    if (!socket || !isConnected) return;
    
    socket.emit('playerAction', { action, data });
  }, [socket, isConnected]);

  // Check if it's current user's turn
  const isMyTurn = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const user = localStorage.getItem('user');
    if (!user || !gameState.currentPlayer) return false;
    
    const userData = JSON.parse(user);
    return gameState.currentPlayer.id === userData.id;
  }, [gameState.currentPlayer]);

  // Get current user
  const currentUser = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
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

  if (!isConnected) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Нет соединения с сервером
        </Alert>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <LoadingSpinner 
            size={40} 
            message="Попытка переподключения..." 
          />
        </motion.div>
      </Box>
    );
  }

  if (gameState.players.length === 0) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography variant="h5" sx={{ textAlign: 'center' }}>
          Ожидание игроков...
        </Typography>
        <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
          Пригласите друзей присоединиться к игре
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key="game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Game
            players={gameState.players}
            currentPlayer={gameState.currentPlayer}
            currentIndex={gameState.currentIndex}
            onRollDice={handleRollDice}
            onBuyCard={handleBuyCard}
            onGetGameState={handleGetGameState}
            onPlayerAction={handlePlayerAction}
            isMyTurn={isMyTurn}
            isLoading={loading}
            error={error}
            diceValue={gameState.diceValue}
            isRolling={gameState.isRolling}
          />
        </motion.div>
      </AnimatePresence>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
