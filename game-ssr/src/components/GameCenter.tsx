import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { BOARD_SIZE } from '../styles/boardLayout';

interface GameCenterProps {
  onRollDice: () => void;
  isRolling: boolean;
  isMoving: boolean;
  canRoll: boolean;
}

const GameCenter: React.FC<GameCenterProps> = ({ 
  onRollDice, 
  isRolling, 
  isMoving, 
  canRoll 
}) => {
  const center = { x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 };

  return (
    <Box
      sx={{
        position: 'absolute',
        left: center.x - 120,
        top: center.y - 120,
        width: 240,
        height: 240,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #A855F7, #7C3AED)',
        border: '3px solid rgba(255,255,255,0.25)',
        boxShadow: '0 25px 60px rgba(124,58,237,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          color: 'white', 
          fontWeight: 'bold', 
          textShadow: '0 3px 10px rgba(0,0,0,0.4)' 
        }}
      >
        ЦЕНТР
      </Typography>
      <Button 
        onClick={onRollDice} 
        disabled={!canRoll || isRolling || isMoving} 
        sx={{ 
          mt: 1, 
          background: 'linear-gradient(45deg, #22C55E, #16A34A)', 
          color: 'white', 
          fontWeight: 'bold', 
          borderRadius: '999px', 
          px: 2, 
          py: 0.5, 
          '&:hover': { 
            background: 'linear-gradient(45deg, #16A34A, #15803D)' 
          },
          '&:disabled': {
            background: 'rgba(255,255,255,0.3)',
            color: 'rgba(255,255,255,0.7)'
          }
        }}
      >
        $ Бросить
      </Button>
    </Box>
  );
};

export default GameCenter;
