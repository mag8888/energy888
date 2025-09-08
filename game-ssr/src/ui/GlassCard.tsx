import React from 'react';
import { Box } from '@mui/material';

type Props = React.PropsWithChildren<{ sx?: any }>; 

export default function GlassCard({ children, sx }: Props) {
  return (
    <Box sx={{
      position: 'relative',
      borderRadius: 3,
      p: 2,
      background: 'linear-gradient(135deg, rgba(14,22,45,0.85) 0%, rgba(18,30,56,0.85) 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
      overflow: 'hidden',
      '::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 4,
        background: 'linear-gradient(90deg, #06B6D4, #8B5CF6, #EC4899)',
      },
      ...sx
    }}>
      {children}
    </Box>
  );
}

