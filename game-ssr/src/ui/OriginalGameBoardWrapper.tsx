import React from 'react';
import { Box, Alert } from '@mui/material';
import OriginalGameBoard from '../components/OriginalGameBoard';
import { useAuth } from '@/lib/auth';

export default function OriginalGameBoardWrapper() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Вы не авторизованы. Перейдите на страницу Auth для входа/регистрации.</Alert>
      </Box>
    );
  }

  const playerData = {
    id: user.id,
    username: user.username,
    profession: { name: 'Программист', salary: 6000, balance: 3000, totalExpenses: 2500 }
  } as any;

  return (
    <Box>
      <OriginalGameBoard roomId="demo-room" playerData={playerData as any} onExit={() => {}} />
    </Box>
  );
}
