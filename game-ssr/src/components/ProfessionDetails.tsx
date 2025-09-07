import React from 'react';
import { Box, Typography } from '@mui/material';

export default function ProfessionDetails(props: any) {
  const { profession } = props;
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Профессия</Typography>
      <Typography variant="body2">{profession?.name || 'Без профессии'}</Typography>
    </Box>
  );
}

