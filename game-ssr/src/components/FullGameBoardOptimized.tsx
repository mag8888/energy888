import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

// Lazy load the BankModule to reduce initial bundle size
const BankModule = lazy(() => import('./bank-module/src/BankModule'));

interface Transaction {
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

interface FullGameBoardProps {
  players: Player[];
  currentPlayer?: Player;
  currentIndex?: number;
  onRollDice: () => void;
  onBuyCard: (cardId: string, price: number) => void;
  onGetGameState: () => void;
  isMyTurn: boolean;
}

// Lazy load game cells data to reduce initial memory usage
const loadGameCells = async () => {
  const { INNER_CELLS, OUTER_CELLS } = await import('../data/gameCells');
  return { INNER_CELLS, OUTER_CELLS };
};

const FullGameBoardOptimized: React.FC<FullGameBoardProps> = ({
  players,
  currentPlayer,
  currentIndex,
  onRollDice,
  onBuyCard,
  onGetGameState,
  isMyTurn
}) => {
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [gameCells, setGameCells] = useState<{ INNER_CELLS: any[], OUTER_CELLS: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  // Load game cells data asynchronously
  useEffect(() => {
    loadGameCells().then(cells => {
      setGameCells(cells);
      setLoading(false);
    });
  }, []);

  if (loading || !gameCells) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Загрузка игрового поля...</Typography>
      </Box>
    );
  }

  const { INNER_CELLS, OUTER_CELLS } = gameCells;

  // Rest of the component logic remains the same but with optimized rendering
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f0f0f0',
      overflow: 'hidden'
    }}>
      {/* Game Board Container */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative',
        p: 2
      }}>
        {/* Outer Board */}
        <Box sx={{
          position: 'relative',
          width: { xs: '90vw', sm: '80vw', md: '70vw', lg: '60vw' },
          height: { xs: '90vw', sm: '80vw', md: '70vw', lg: '60vw' },
          maxWidth: '800px',
          maxHeight: '800px',
          backgroundColor: '#fff',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          border: '4px solid #333'
        }}>
          {/* Render outer cells */}
          {OUTER_CELLS.map((cell, index) => (
            <Box
              key={cell.id}
              sx={{
                position: 'absolute',
                width: '60px',
                height: '60px',
                backgroundColor: cell.color,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  zIndex: 10
                },
                // Position calculation for outer cells
                ...getOuterCellPosition(index, OUTER_CELLS.length)
              }}
            >
              <Box sx={{ fontSize: '16px' }}>{cell.icon}</Box>
              <Box sx={{ fontSize: '8px', lineHeight: 1 }}>{cell.name}</Box>
            </Box>
          ))}

          {/* Inner Board */}
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '60%',
            backgroundColor: '#f8f9fa',
            borderRadius: '15px',
            border: '2px solid #333',
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: '2px',
            p: 1
          }}>
            {INNER_CELLS.map((cell) => (
              <Box
                key={cell.id}
                sx={{
                  backgroundColor: cell.color,
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '8px',
                  fontWeight: 'bold',
                  color: 'white',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    zIndex: 10
                  }
                }}
              >
                <Box sx={{ fontSize: '12px' }}>{cell.icon}</Box>
                <Box sx={{ fontSize: '6px', lineHeight: 1 }}>{cell.name}</Box>
              </Box>
            ))}
          </Box>

          {/* Players */}
          {players.map((player, index) => (
            <Box
              key={player.id}
              sx={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: getPlayerColor(index),
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                zIndex: 20,
                transition: 'all 0.5s ease',
                // Position based on player position
                ...getPlayerPosition(player.position || 0, OUTER_CELLS.length)
              }}
            >
              {index + 1}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Game Controls */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#fff', 
        borderTop: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="h6">
            {currentPlayer ? `Ход: ${currentPlayer.name}` : 'Ожидание игроков...'}
          </Typography>
          {diceValue && (
            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              🎲 {diceValue}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={onRollDice}
            disabled={!isMyTurn}
            sx={{ minWidth: '120px' }}
          >
            Бросить кубик
          </Button>
          <Button
            variant="outlined"
            onClick={onGetGameState}
            sx={{ minWidth: '120px' }}
          >
            Обновить
          </Button>
        </Box>
      </Box>

      {/* Bank Module - Lazy loaded */}
      <Suspense fallback={<CircularProgress />}>
        <BankModule
          playerData={currentPlayer}
          gamePlayers={players}
          socket={null} // Pass socket if available
          bankBalance={currentPlayer?.money || 0}
          playerCredit={0}
          getMaxCredit={() => 10000}
          getCashFlow={() => 1000}
          setShowCreditModal={() => {}}
          roomId=""
          onBankBalanceChange={() => {}}
        />
      </Suspense>
    </Box>
  );
};

// Helper functions for positioning
const getOuterCellPosition = (index: number, totalCells: number) => {
  const angle = (index / totalCells) * 2 * Math.PI;
  const radius = 45; // Percentage from center
  const x = 50 + radius * Math.cos(angle - Math.PI / 2);
  const y = 50 + radius * Math.sin(angle - Math.PI / 2);
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)'
  };
};

const getPlayerPosition = (position: number, totalCells: number) => {
  const angle = (position / totalCells) * 2 * Math.PI;
  const radius = 40; // Slightly inside the outer cells
  const x = 50 + radius * Math.cos(angle - Math.PI / 2);
  const y = 50 + radius * Math.sin(angle - Math.PI / 2);
  
  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)'
  };
};

const getPlayerColor = (index: number) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  return colors[index % colors.length];
};

export default FullGameBoardOptimized;

