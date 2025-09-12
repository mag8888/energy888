import React, { memo } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

interface GameCellProps {
  id: number;
  type: string;
  name: string;
  color: string;
  icon: string;
  cost?: number;
  income?: number;
  description?: string;
  loss?: string;
  special?: string;
  isActive?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  position?: { x: number; y: number };
  size?: 'small' | 'medium' | 'large';
}

const GameCell: React.FC<GameCellProps> = memo(({
  id,
  type,
  name,
  color,
  icon,
  cost,
  income,
  description,
  loss,
  special,
  isActive = false,
  isHovered = false,
  onClick,
  position = { x: 0, y: 0 },
  size = 'medium'
}) => {
  const getSizeStyles = () => {
    const sizes = {
      small: { width: '40px', height: '40px', fontSize: '12px' },
      medium: { width: '60px', height: '60px', fontSize: '14px' },
      large: { width: '80px', height: '80px', fontSize: '16px' }
    };
    return sizes[size];
  };

  const getTypeStyles = () => {
    const typeStyles = {
      start: { border: '3px solid #FFD700', boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' },
      business: { border: '2px solid #4CAF50' },
      opportunity: { border: '2px solid #10B981' },
      loss: { border: '2px solid #8B0000' },
      charity: { border: '2px solid #FF69B4' },
      payday: { border: '2px solid #FFD700' }
    };
    return typeStyles[type as keyof typeof typeStyles] || {};
  };

  const cellContent = (
    <motion.div
      whileHover={{ scale: 1.1, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          ...getSizeStyles(),
          ...getTypeStyles(),
          position: 'absolute',
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
          backgroundColor: color,
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          opacity: isActive ? 1 : 0.8,
          zIndex: isHovered ? 20 : 1,
          boxShadow: isActive 
            ? '0 8px 25px rgba(0, 0, 0, 0.3)' 
            : '0 4px 15px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
            transform: 'translate(-50%, -50%) scale(1.05)'
          }
        }}
        onClick={onClick}
      >
        <Box sx={{ fontSize: size === 'small' ? '16px' : size === 'medium' ? '20px' : '24px' }}>
          {icon}
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontSize: size === 'small' ? '8px' : size === 'medium' ? '10px' : '12px',
            lineHeight: 1,
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}
        >
          {name}
        </Typography>
        {cost && (
          <Typography
            variant="caption"
            sx={{
              fontSize: size === 'small' ? '6px' : size === 'medium' ? '8px' : '10px',
              lineHeight: 1,
              color: '#FFD700',
              fontWeight: 'bold'
            }}
          >
            ${cost.toLocaleString()}
          </Typography>
        )}
      </Box>
    </motion.div>
  );

  const tooltipContent = (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
        {name}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {description}
        </Typography>
      )}
      {cost && (
        <Typography variant="body2" sx={{ color: '#4CAF50' }}>
          💰 Стоимость: ${cost.toLocaleString()}
        </Typography>
      )}
      {income && (
        <Typography variant="body2" sx={{ color: '#10B981' }}>
          📈 Доход: ${income.toLocaleString()}
        </Typography>
      )}
      {loss && (
        <Typography variant="body2" sx={{ color: '#EF4444' }}>
          ⚠️ Потеря: {loss}
        </Typography>
      )}
      {special && (
        <Typography variant="body2" sx={{ color: '#F59E0B' }}>
          ⭐ {special}
        </Typography>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow placement="top">
      {cellContent}
    </Tooltip>
  );
});

GameCell.displayName = 'GameCell';

export default GameCell;
