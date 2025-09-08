import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Snackbar, Alert, Chip, Avatar, Stack } from '@mui/material';
import socket from '@/lib/socket';
import GlassCard from '@/ui/GlassCard';
import GradientButton from '@/ui/GradientButton';
import { useAuth } from '@/lib/auth';
import { getFastTrackDreams } from '@/data/fastTrackCells';

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [snack, setSnack] = useState<string|null>(null);
  const [createForm, setCreateForm] = useState({ name: '', maxPlayers: 6, timing: 120, password: '', assignAll: false, dreamId: '' });
  const dreams = getFastTrackDreams();
  const [joinPwd, setJoinPwd] = useState('');
  const [joinRoomId, setJoinRoomId] = useState<string | null>(null);

  useEffect(() => {
    const handleRooms = (list:any[]) => setRooms(list);
    socket.on('roomsList', handleRooms);
    socket.emit('getRooms');
    return () => { socket.off('roomsList', handleRooms); };
  }, []);

  const doCreate = () => {
    if (!user) { setSnack('Сначала авторизуйтесь'); return; }
    socket.emit('createRoom', {
      id: undefined,
      name: createForm.name || `Комната ${Math.floor(Math.random()*1000)}`,
      creatorId: user.id,
      creatorUsername: user.username,
      creatorProfession: { name: 'Программист', salary: 6000, totalExpenses: 2500 },
      creatorDream: dreams.find(d=>d.id===createForm.dreamId) || null,
      assignProfessionToAll: createForm.assignAll,
      maxPlayers: Number(createForm.maxPlayers),
      password: createForm.password || null,
      timing: Number(createForm.timing)
    });
    setOpenCreate(false);
    setSnack('Комната создана');
  };

  const doJoin = (room:any) => {
    if (!user) { setSnack('Сначала авторизуйтесь'); return; }
    if (room.hasPassword) { setJoinRoomId(room.id); return; }
    socket.emit('joinRoomMeta', { roomId: room.id, user: { id: user.id, username: user.username }, password: '' });
    setSnack('Подключаемся к комнате...');
  };

  const doJoinWithPwd = () => {
    socket.emit('joinRoomMeta', { roomId: joinRoomId, user: { id: user?.id, username: user?.username }, password: joinPwd });
    setJoinRoomId(null); setJoinPwd('');
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      <GlassCard sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>Комнаты</Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Создавайте комнаты с параметрами и приглашайте друзей.</Typography>
      </GlassCard>

      <GlassCard sx={{ mb: 2 }}>
        <Stack direction={{ xs:'column', md:'row' }} gap={2}>
          <TextField label="Поиск комнат" fullWidth placeholder="По названию, ID или создателю..." />
          <GradientButton onClick={()=>setOpenCreate(true)}>+ Создать комнату</GradientButton>
        </Stack>
      </GlassCard>

      <Grid container spacing={2}>
        {rooms.map((r) => (
          <Grid key={r.id} item xs={12} md={6}>
            <GlassCard>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography sx={{ color: '#fff', fontWeight: 700 }}>{r.name}</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Создатель: {r.creatorUsername || r.creatorId}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip size="small" label={`Игроков: ${r.playersCount}/${r.maxPlayers}`} />
                    {r.hasPassword && <Chip size="small" color="warning" label="Пароль" />}
                    <Chip size="small" label={`Таймер: ${r.timing}с`} />
                  </Stack>
                </Box>
                <GradientButton onClick={()=>doJoin(r)}>Войти</GradientButton>
              </Stack>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Create room dialog */}
      <Dialog open={openCreate} onClose={()=>setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Создать комнату</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 1.2 }}>
            <TextField label="Название" value={createForm.name} onChange={e=>setCreateForm({...createForm, name: e.target.value})} />
            <TextField label="Макс. игроков" type="number" value={createForm.maxPlayers} onChange={e=>setCreateForm({...createForm, maxPlayers: Number(e.target.value)})} />
            <TextField label="Таймер (сек)" type="number" value={createForm.timing} onChange={e=>setCreateForm({...createForm, timing: Number(e.target.value)})} />
            <TextField label="Пароль (необязательно)" value={createForm.password} onChange={e=>setCreateForm({...createForm, password: e.target.value})} />
            <TextField select label="Мечта создателя (из Большого круга)" value={createForm.dreamId} onChange={e=>setCreateForm({...createForm, dreamId: String(e.target.value)})}>
              {dreams.map(d => (
                <MenuItem key={d.id} value={d.id}>{d.name} — ${d.cost.toLocaleString()}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenCreate(false)}>Отмена</Button>
          <Button onClick={doCreate} variant="contained">Создать</Button>
        </DialogActions>
      </Dialog>

      {/* Join with password */}
      <Dialog open={!!joinRoomId} onClose={()=>setJoinRoomId(null)}>
        <DialogTitle>Введите пароль</DialogTitle>
        <DialogContent>
          <TextField label="Пароль" value={joinPwd} onChange={e=>setJoinPwd(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setJoinRoomId(null)}>Отмена</Button>
          <Button variant="contained" onClick={doJoinWithPwd}>Войти</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={2000} onClose={()=>setSnack(null)}>
        <Alert severity="info">{snack}</Alert>
      </Snackbar>
    </Box>
  );
}
