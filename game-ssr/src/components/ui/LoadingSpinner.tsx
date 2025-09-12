import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message = 'Загрузка...',
  color = 'primary',
  fullScreen = false
}) => {
  const getColorValue = () => {
    const colors = {
      primary: '#667eea',
      secondary: '#764ba2',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    };
    return colors[color];
  };

  const containerStyles = fullScreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999
  } : {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px'
  };

  return (
    <Box sx={containerStyles}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CircularProgress
          size={size}
          sx={{
            color: getColorValue(),
            marginBottom: message ? 2 : 0
          }}
        />
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Typography
              variant="body1"
              sx={{
                color: '#6B7280',
                fontSize: '0.875rem',
                fontWeight: 500,
                textAlign: 'center'
              }}
            >
              {message}
            </Typography>
          </motion.div>
        )}
      </motion.div>
    </Box>
  );
};

export default LoadingSpinner;
