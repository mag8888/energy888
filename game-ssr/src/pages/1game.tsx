import { Box, Typography } from '@mui/material';
import { useAuth } from '../lib/auth';
import dynamic from 'next/dynamic';

// Динамический импорт без SSR для предотвращения ошибок серверного рендеринга
const SimpleGameBoard = dynamic(() => import('../components/SimpleGameBoard'), {
  ssr: false,
  loading: () => (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff'
    }}>
      <Typography variant="h4">Загрузка игрового поля...</Typography>
    </Box>
  )
});

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

