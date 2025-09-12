import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, CardContent, CardHeader, CardActions } from '@mui/material';
import { motion } from 'framer-motion';

interface CardProps extends MuiCardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  hoverable?: boolean;
  loading?: boolean;
  variant?: 'elevated' | 'outlined' | 'filled';
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  hoverable = false,
  loading = false,
  variant = 'elevated',
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    const variants = {
      elevated: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '&:hover': hoverable ? {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        } : {}
      },
      outlined: {
        border: '1px solid #E5E7EB',
        boxShadow: 'none',
        '&:hover': hoverable ? {
          borderColor: '#D1D5DB',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        } : {}
      },
      filled: {
        backgroundColor: '#F9FAFB',
        boxShadow: 'none',
        '&:hover': hoverable ? {
          backgroundColor: '#F3F4F6',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        } : {}
      }
    };
    return variants[variant];
  };

  const MotionCard = motion(MuiCard);

  return (
    <MotionCard
      {...props}
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        ...getVariantStyles(),
        ...props.sx
      }}
      whileHover={hoverable ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
    >
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          sx={{
            '& .MuiCardHeader-title': {
              fontSize: '1.25rem',
              fontWeight: 600,
              color: '#111827'
            },
            '& .MuiCardHeader-subheader': {
              fontSize: '0.875rem',
              color: '#6B7280'
            }
          }}
        />
      )}
      
      <CardContent sx={{ padding: '24px' }}>
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100px' 
          }}>
            <div className="loading-spinner" />
          </div>
        ) : (
          children
        )}
      </CardContent>
      
      {actions && (
        <CardActions sx={{ padding: '0 24px 24px 24px' }}>
          {actions}
        </CardActions>
      )}
    </MotionCard>
  );
};

export default Card;
