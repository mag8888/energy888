import React from 'react';
import { Box, Button, Typography } from '@mui/material';

interface ActivityButtonProps {
  status: 'can-roll' | 'pass-turn' | 'waiting';
  onRollDice: () => void;
  onPassTurn: () => void;
  disabled?: boolean;
}

export const ActivityButton: React.FC<ActivityButtonProps> = ({
  status,
  onRollDice,
  onPassTurn,
  disabled = false
}) => {
  const getButtonConfig = () => {
    switch (status) {
      case 'can-roll':
        return {
          text: '🎲 БРОСИТЬ КУБИК',
          color: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
          hoverColor: 'linear-gradient(135deg, #45A049 0%, #3D8B40 100%)',
          action: onRollDice,
          icon: '🎲'
        };
      case 'pass-turn':
        return {
          text: '➡️ ПЕРЕДАТЬ ХОД',
          color: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
          hoverColor: 'linear-gradient(135deg, #F57C00 0%, #EF6C00 100%)',
          action: onPassTurn,
          icon: '➡️'
        };
      case 'waiting':
        return {
          text: '⏳ ОЖИДАНИЕ ХОДА',
          color: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
          hoverColor: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)',
          action: () => {},
          icon: '⏳'
        };
      default:
        return {
          text: '❓ НЕИЗВЕСТНО',
          color: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
          hoverColor: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)',
          action: () => {},
          icon: '❓'
        };
    }
  };

  const config = getButtonConfig();

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000
    }}>
      <Button
        onClick={config.action}
        disabled={disabled || status === 'waiting'}
        sx={{
          background: config.color,
          color: 'white',
          px: 4,
          py: 2,
          borderRadius: '25px',
          fontSize: '16px',
          fontWeight: 'bold',
          textTransform: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          minWidth: '200px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            background: config.hoverColor,
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
          },
          '&:disabled': {
            background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
            color: 'rgba(255, 255, 255, 0.5)',
            cursor: 'not-allowed',
            transform: 'none',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <Typography sx={{ fontSize: '20px' }}>
          {config.icon}
        </Typography>
        <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>
          {config.text}
        </Typography>
      </Button>
    </Box>
  );
};
