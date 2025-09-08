import dynamic from 'next/dynamic';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../lib/auth';

// Disable SSR for the heavy interactive board initially to avoid window/document usage errors.
const SimpleGameBoard = dynamic(() => import('../components/SimpleGameBoard'), { ssr: false });

export default function OneGamePage() {
  const { user } = useAuth();
  
  // Mock player data for now
  const playerData = {
    id: user?.id || 'demo-user',
    socketId: 'demo-socket',
    username: user?.username || 'Игрок',
    profession: {
      id: 'programmer',
      name: 'Программист',
      salary: 6000,
      totalExpenses: 2500,
      cashFlow: 3500,
      credits: [],
      creditsTotalPrincipal: 0
    },
    balance: 3000,
    position: 0,
    color: '#FF5722'
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A' }}>
      <Typography variant="h4" sx={{ color: 'white', p: 2 }}>
        Тест: Игровое поле загружается...
      </Typography>
      <Typography variant="body1" sx={{ color: 'white', p: 2 }}>
        Пользователь: {playerData.username}
      </Typography>
      <SimpleGameBoard 
        roomId="demo-room" 
        playerData={playerData}
      />
    </Box>
  );
}

