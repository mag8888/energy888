import { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import GlassCard from '@/ui/GlassCard';

export default function HallOfFamePage() {
  const [rows, setRows] = useState<any[]>([]);
  const base = process.env.NEXT_PUBLIC_SOCKET_URL as string;

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch(`${base}/hall-of-fame`);
        const j = await r.json();
        if (j?.ok) setRows(j.list || []);
      } catch {}
    };
    if (base) load();
  }, [base]);

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      <GlassCard sx={{ mb: 2 }}>
        <Typography variant='h5' sx={{ color:'#fff', fontWeight: 800 }}>Зал славы</Typography>
        <Typography sx={{ color:'rgba(255,255,255,0.7)' }}>Сводный рейтинг по играм (чем больше побед, тем выше).</Typography>
      </GlassCard>

      <Paper sx={{ overflowX:'auto' }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Место</TableCell>
              <TableCell>Игрок</TableCell>
              <TableCell align='right'>Сыграно</TableCell>
              <TableCell align='right'>Побед</TableCell>
              <TableCell align='right'>Очки</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={r.username}>
                <TableCell>{idx+1}</TableCell>
                <TableCell>{r.username}</TableCell>
                <TableCell align='right'>{r.games}</TableCell>
                <TableCell align='right'>{r.wins}</TableCell>
                <TableCell align='right'>{r.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

