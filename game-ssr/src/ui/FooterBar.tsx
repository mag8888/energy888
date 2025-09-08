import React from 'react';
import Link from 'next/link';
import { Box, Button, Stack } from '@mui/material';

export default function FooterBar() {
  return (
    <Box sx={{
      px: 2, py: 1,
      borderTop: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(2,6,23,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <Box sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace', fontSize: 12 }}>
        DEBUG: Energy888 • SSR Pages • v1
      </Box>
      <Stack direction="row" spacing={1}>
        <Link href="/1game" passHref legacyBehavior><Button size="small" variant="outlined">1game</Button></Link>
        <Link href="/rooms" passHref legacyBehavior><Button size="small" variant="outlined">Rooms</Button></Link>
        <Link href="/hall-of-fame" passHref legacyBehavior><Button size="small" variant="outlined">Hall of Fame</Button></Link>
        <Link href="/auth" passHref legacyBehavior><Button size="small" variant="outlined">Auth</Button></Link>
        <Link href="/" passHref legacyBehavior><Button size="small" variant="outlined">Home</Button></Link>
      </Stack>
    </Box>
  );
}
