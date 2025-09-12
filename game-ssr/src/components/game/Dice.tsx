import React, { memo, useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface DiceProps {
  value: number | null;
  isRolling?: boolean;
  onRollComplete?: (value: number) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const Dice: React.FC<DiceProps> = memo(({
  value,
  isRolling = false,
  onRollComplete,
  disabled = false,
  size = 'medium',
  color = '#667eea'
}) => {
  const [displayValue, setDisplayValue] = useState<number | null>(value);
  const [isAnimating, setIsAnimating] = useState(false);

  const getSizeStyles = () => {
    const sizes = {
      small: { width: '40px', height: '40px', fontSize: '16px' },
      medium: { width: '60px', height: '60px', fontSize: '24px' },
      large: { width: '80px', height: '80px', fontSize: '32px' }
    };
    return sizes[size];
  };

  const getDiceDots = (num: number) => {
    const dotPatterns = {
      1: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
      2: [[1, 0, 0], [0, 0, 0], [0, 0, 1]],
      3: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      4: [[1, 0, 1], [0, 0, 0], [1, 0, 1]],
      5: [[1, 0, 1], [0, 1, 0], [1, 0, 1]],
      6: [[1, 0, 1], [1, 0, 1], [1, 0, 1]]
    };
    return dotPatterns[num as keyof typeof dotPatterns] || dotPatterns[1];
  };

  useEffect(() => {
    if (isRolling) {
      setIsAnimating(true);
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setIsAnimating(false);
        if (value !== null) {
          setDisplayValue(value);
          onRollComplete?.(value);
        }
      }, 2000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else if (value !== null) {
      setDisplayValue(value);
    }
  }, [isRolling, value, onRollComplete]);

  const renderDiceFace = (num: number) => {
    const dots = getDiceDots(num);
    
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          gap: '2px',
          width: '100%',
          height: '100%',
          padding: '4px'
        }}
      >
        {dots.map((row, rowIndex) =>
          row.map((hasDot, colIndex) => (
            <Box
              key={`${rowIndex}-${colIndex}`}
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: hasDot ? 'white' : 'transparent',
                transition: 'all 0.3s ease'
              }}
            />
          ))
        )}
      </Box>
    );
  };

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          ...getSizeStyles(),
          backgroundColor: color,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '3px solid white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <AnimatePresence mode="wait">
          {displayValue && (
            <motion.div
              key={displayValue}
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: 0,
                ...(isAnimating && {
                  rotate: [0, 360, 0],
                  scale: [1, 1.1, 1]
                })
              }}
              exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
              transition={{ 
                duration: isAnimating ? 0.1 : 0.5,
                ease: 'easeOut'
              }}
              style={{ width: '100%', height: '100%' }}
            >
              {renderDiceFace(displayValue)}
            </motion.div>
          )}
        </AnimatePresence>

        {isRolling && (
          <motion.div
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 0.3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '12px'
            }}
          />
        )}
      </Box>

      {displayValue && !isRolling && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              color: '#6B7280',
              fontWeight: 'bold',
              mt: 1
            }}
          >
            🎲 {displayValue}
          </Typography>
        </motion.div>
      )}
    </motion.div>
  );
});

Dice.displayName = 'Dice';

export default Dice;
