import React from 'react';
import { Button } from '@mui/material';

export default function GradientButton(props: any) {
  const { sx, ...rest } = props;
  return (
    <Button {...rest} sx={{
      textTransform: 'none',
      fontWeight: 'bold',
      background: 'linear-gradient(90deg, #06B6D4, #8B5CF6, #EC4899)',
      color: '#fff',
      px: 2.5,
      py: 1,
      borderRadius: 3,
      boxShadow: '0 10px 25px rgba(139,92,246,0.4)',
      '&:hover': { background: 'linear-gradient(90deg, #0891B2, #7C3AED, #DB2777)' },
      ...sx
    }} />
  );
}

