import dynamic from 'next/dynamic';
import { Box, Typography } from '@mui/material';

// Disable SSR for the heavy interactive board initially to avoid window/document usage errors.
const OriginalGameBoardWrapper = dynamic(() => import('../ui/OriginalGameBoardWrapper'), { ssr: false });

export default function OneGamePage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A' }}>
      <OriginalGameBoardWrapper />
    </Box>
  );
}

