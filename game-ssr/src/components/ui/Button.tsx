import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  icon,
  fullWidth = false,
  size = 'medium',
  children,
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    const variants = {
      primary: {
        backgroundColor: '#667eea',
        color: 'white',
        '&:hover': { backgroundColor: '#5a6fd8' }
      },
      secondary: {
        backgroundColor: '#764ba2',
        color: 'white',
        '&:hover': { backgroundColor: '#6a4190' }
      },
      success: {
        backgroundColor: '#10B981',
        color: 'white',
        '&:hover': { backgroundColor: '#059669' }
      },
      warning: {
        backgroundColor: '#F59E0B',
        color: 'white',
        '&:hover': { backgroundColor: '#D97706' }
      },
      error: {
        backgroundColor: '#EF4444',
        color: 'white',
        '&:hover': { backgroundColor: '#DC2626' }
      },
      info: {
        backgroundColor: '#3B82F6',
        color: 'white',
        '&:hover': { backgroundColor: '#2563EB' }
      }
    };
    return variants[variant];
  };

  const getSizeStyles = () => {
    const sizes = {
      small: { minHeight: '32px', padding: '4px 12px', fontSize: '0.875rem' },
      medium: { minHeight: '40px', padding: '8px 16px', fontSize: '1rem' },
      large: { minHeight: '48px', padding: '12px 24px', fontSize: '1.125rem' }
    };
    return sizes[size];
  };

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <MuiButton
        {...props}
        disabled={disabled || loading}
        fullWidth={fullWidth}
        sx={{
          ...getVariantStyles(),
          ...getSizeStyles(),
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15)',
            ...getVariantStyles()['&:hover']
          },
          '&:disabled': {
            backgroundColor: '#E5E7EB',
            color: '#9CA3AF',
            boxShadow: 'none'
          }
        }}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : icon}
      >
        {children}
      </MuiButton>
    </motion.div>
  );
};

export default Button;
