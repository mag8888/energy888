import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Stack, Button, Chip, Avatar, List, ListItem, ListItemText, ListItemSecondaryAction, Switch, Snackbar, Alert } from '@mui/material';
import socket from '@/lib/socket';
import GlassCard from '@/ui/GlassCard';
import GradientButton from '@/ui/GradientButton';
import { useAuth } from '@/lib/auth';

export default function RoomLobby() {
  const router = useRouter();
  const roomId = String(router.query.id || '');
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [snack, setSnack] = useState<string|null>(null);

  useEffect(() => {
    if (!roomId) return;
    const onMeta = (r:any) => setRoom(r);
    socket.on('roomMeta', onMeta);
    socket.emit('getRoomMeta', roomId);
    return () => { socket.off('roomMeta', onMeta); };
  }, [roomId]);

  const isHost = useMemo(() => !!(room && user && room.creatorId === user.id), [room, user]);

  const toggleReady = (val:boolean) => {
    if (!user) return;
    socket.emit('playerReady', { roomId, username: user.username, ready: val });
  };
  const startGame = () => {
    socket.emit('startGame', { roomId });
    setSnack('Игра запускается…');
    // можно перенаправить в игру и передать roomId
    localStorage.setItem('energy_of_money_current_room', roomId);
    localStorage.setItem('room_timing', String(room?.timing || 120));
    router.push('/1game');
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1000, mx: 'auto' }}>
      <GlassCard sx={{ mb: 2 }}>
        <Stack direction={{ xs:'column', md:'row' }} justifyContent='space-between' alignItems='center' gap={1}>
          <Box>
            <Typography variant='h5' sx={{ color:'#fff', fontWeight: 800 }}>{room?.name || 'Комната'}</Typography>
            <Typography sx={{ color:'rgba(255,255,255,0.7)' }}>Создатель: {room?.creatorUsername}</Typography>
          </Box>
          <Stack direction='row' spacing={1}>
            <Chip label={`Таймер: ${room?.timing || 120}s`} />
            <Chip label={`Игроков: ${(room?.players||[]).length}/${room?.maxPlayers || 6}`} />
          </Stack>
        </Stack>
      </GlassCard>

      <GlassCard>
        <Stack direction={{ xs:'column', md:'row' }} spacing={2}>
          <Box sx={{ flex:1 }}>
            <Typography sx={{ color:'#fff', fontWeight:700, mb:1 }}>Игроки</Typography>
            <List dense>
              {(room?.players||[]).map((p:any)=> (
                <ListItem key={p.username} sx={{ bgcolor:'rgba(148,163,184,0.08)', mb:0.5, borderRadius:1 }}>
                  <Avatar sx={{ width:28, height:28, mr:1 }}>{p.username[0]?.toUpperCase()}</Avatar>
                  <ListItemText primaryTypographyProps={{ sx:{ color:'#fff' } }} primary={p.username} secondary={p.profession?.name || 'Без профессии'} secondaryTypographyProps={{ sx:{ color:'rgba(255,255,255,0.6)' } }} />
                  <ListItemSecondaryAction>
                    <Chip size='small' color={p.ready?'success':'default'} label={p.ready?'Готов':'Ожидает'} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
          <Box sx={{ width:{ xs:'100%', md:300 } }}>
            <Typography sx={{ color:'#fff', fontWeight:700, mb:1 }}>Мои настройки</Typography>
            <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ p:1.5, bgcolor:'rgba(148,163,184,0.08)', borderRadius:1 }}>
              <Typography sx={{ color:'#fff' }}>Готов</Typography>
              <Switch onChange={e=>toggleReady(e.target.checked)} />
            </Stack>
            {isHost && (
              <GradientButton sx={{ mt:2 }} onClick={startGame}>Начать игру</GradientButton>
            )}
          </Box>
        </Stack>
      </GlassCard>

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={()=>setSnack(null)}>
        <Alert severity='info'>{snack}</Alert>
      </Snackbar>
    </Box>
  );
}

