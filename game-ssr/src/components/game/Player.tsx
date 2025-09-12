import React, { memo } from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { motion } from 'framer-motion';

interface PlayerProps {
  id: string;
  name: string;
  position?: number;
  money?: number;
  isReady: boolean;
  profession?: string;
  dream?: string;
  isCurrentPlayer?: boolean;
  isMyPlayer?: boolean;
  color: string;
  avatar?: string;
  onPlayerClick?: (playerId: string) => void;
}

const Player: React.FC<PlayerProps> = memo(({
  id,
  name,
  position = 0,
  money = 0,
  isReady,
  profession,
  dream,
  isCurrentPlayer = false,
  isMyPlayer = false,
  color,
  avatar,
  onPlayerClick
}) => {
  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '12px 16px',
          backgroundColor: isCurrentPlayer ? '#F0F9FF' : '#FFFFFF',
          border: isCurrentPlayer ? '2px solid #3B82F6' : '1px solid #E5E7EB',
          borderRadius: '12px',
          cursor: onPlayerClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          boxShadow: isCurrentPlayer 
            ? '0 4px 12px rgba(59, 130, 246, 0.15)' 
            : '0 2px 4px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)'
          }
        }}
        onClick={() => onPlayerClick?.(id)}
      >
        <Box sx={{ position: 'relative' }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: color,
              fontSize: '1.2rem',
              fontWeight: 'bold',
              border: isMyPlayer ? '3px solid #10B981' : '2px solid white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
            src={avatar}
          >
            {!avatar && getPlayerInitials(name)}
          </Avatar>
          
          {isCurrentPlayer && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 16,
                  height: 16,
                  backgroundColor: '#10B981',
                  borderRadius: '50%',
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography sx={{ fontSize: '10px', color: 'white', fontWeight: 'bold' }}>
                  ⭐
                </Typography>
              </Box>
            </motion.div>
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: '#111827',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {name}
            </Typography>
            {isMyPlayer && (
              <Chip
                label="Вы"
                size="small"
                sx={{
                  backgroundColor: '#10B981',
                  color: 'white',
                  fontSize: '0.75rem',
                  height: '20px'
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                fontWeight: 500
              }}
            >
              💰 {formatMoney(money)}
            </Typography>

            {profession && (
              <Typography
                variant="body2"
                sx={{
                  color: '#6B7280',
                  fontSize: '0.75rem'
                }}
              >
                👔 {profession}
              </Typography>
            )}

            <Chip
              label={isReady ? 'Готов' : 'Ожидает'}
              size="small"
              sx={{
                backgroundColor: isReady ? '#10B981' : '#F59E0B',
                color: 'white',
                fontSize: '0.75rem',
                height: '20px'
              }}
            />
          </Box>

          {dream && (
            <Typography
              variant="caption"
              sx={{
                color: '#9CA3AF',
                fontStyle: 'italic',
                display: 'block',
                mt: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              🎯 {dream}
            </Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
});

Player.displayName = 'Player';

export default Player;
