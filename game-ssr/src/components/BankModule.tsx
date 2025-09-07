import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export default function BankModule(props: any) {
  const { balance } = props;
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Банк</Typography>
      <Box sx={{ mt: 1 }}>
        <Typography variant="body2">Баланс: ${balance?.toLocaleString?.() || 0}</Typography>
      </Box>
    </Paper>
  );
}

