import React from 'react';
import { Box } from '@mui/material';
import OriginalGameBoard from '../components/OriginalGameBoard';

// Minimal stubbed player data to render visuals
const playerData = {
  id: 'demo-user-1',
  username: 'Игрок',
  profession: { name: 'Программист', salary: 6000, balance: 3000, totalExpenses: 2500 }
};

export default function OriginalGameBoardWrapper() {
  return (
    <Box>
      {/* onExit is a no-op for now */}
      <OriginalGameBoard roomId="demo-room" playerData={playerData as any} onExit={() => {}} />
    </Box>
  );
}

