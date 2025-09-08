import { useEffect, useMemo, useState } from 'react';
import { Box, Typography, TextField, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Snackbar, Alert, Chip, Avatar, Stack, Checkbox, FormControlLabel, Divider, Paper } from '@mui/material';
import socket from '@/lib/socket';
import GlassCard from '@/ui/GlassCard';
import GradientButton from '@/ui/GradientButton';
import { useAuth } from '@/lib/auth';
import { getFastTrackDreams } from '@/data/fastTrackCells';
import { PROFESSIONS, getProfession } from '@/data/professions';

export default function RoomsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [snack, setSnack] = useState<string|null>(null);
  const [createForm, setCreateForm] = useState({ name: '', maxPlayers: 2, timing: 120, password: '', assignAll: true, dreamId: '', professionId: 'entrepreneur' });
  const dreams = getFastTrackDreams();
  const prof = getProfession(createForm.professionId);
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
      creatorProfession: prof,
      creatorDream: dreams.find(d=>d.id===createForm.dreamId) || null,
      assignProfessionToAll: !!createForm.assignAll,
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
      <Dialog open={openCreate} onClose={()=>setOpenCreate(false)} fullWidth maxWidth="md" PaperProps={{ sx: { background: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.96))', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: '#fff', fontWeight: 800 }}>Создать комнату</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'grid', gap: 1.2 }}>
                <TextField label="Название" value={createForm.name} onChange={e=>setCreateForm({...createForm, name: e.target.value})} fullWidth />
                <TextField label="Макс. игроков" type="number" value={createForm.maxPlayers} onChange={e=>setCreateForm({...createForm, maxPlayers: Number(e.target.value)})} fullWidth />
                <TextField label="Таймер (сек)" type="number" value={createForm.timing} onChange={e=>setCreateForm({...createForm, timing: Number(e.target.value)})} fullWidth />
                <TextField label="Пароль (необязательно)" value={createForm.password} onChange={e=>setCreateForm({...createForm, password: e.target.value})} fullWidth />
                <TextField select label="Мечта создателя (Большой круг)" value={createForm.dreamId} onChange={e=>setCreateForm({...createForm, dreamId: String(e.target.value)})} fullWidth>
                  {dreams.map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.name} — ${d.cost.toLocaleString()}</MenuItem>
                  ))}
                </TextField>
                <TextField select label="Профессия" value={createForm.professionId} onChange={e=>setCreateForm({...createForm, professionId: String(e.target.value)})} fullWidth>
                  {PROFESSIONS.map(p => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </TextField>
                <FormControlLabel control={<Checkbox checked={createForm.assignAll} onChange={e=>setCreateForm({...createForm, assignAll: e.target.checked})} />} label="Назначить эту профессию всем игрокам" />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Профессия — карточка предпросмотра */}
              <Paper sx={{ p: 2, background: '#fff', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{prof.name}</Typography>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}><Box sx={{ p: 1, bgcolor: '#E6FFF3', borderRadius: 1, textAlign: 'center', fontWeight: 700, color: '#10B981' }}>${prof.salary.toLocaleString()}<Typography variant="caption" display="block">Зарплата</Typography></Box></Grid>
                  <Grid item xs={6}><Box sx={{ p: 1, bgcolor: '#FFECEC', borderRadius: 1, textAlign: 'center', fontWeight: 700, color: '#EF4444' }}>${prof.totalExpenses.toLocaleString()}<Typography variant="caption" display="block">Расходы</Typography></Box></Grid>
                  <Grid item xs={12}><Box sx={{ p: 1, border: '2px solid #16a34a', borderRadius: 1, textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>${prof.cashFlow.toLocaleString()}<Typography variant="caption" display="block">Денежный поток</Typography></Box></Grid>
                </Grid>
                {prof.taxes || prof.otherExpenses ? (
                  <Box sx={{ mt: 1.5, color: '#374151' }}>
                    {prof.taxes ? <Typography variant="body2">Налоги: ${prof.taxes.toLocaleString()}</Typography> : null}
                    {prof.otherExpenses ? <Typography variant="body2">Прочие расходы: ${prof.otherExpenses.toLocaleString()}</Typography> : null}
                  </Box>
                ) : null}
                {prof.credits?.length ? (
                  <Box sx={{ mt: 1.5 }}>
                    {prof.credits.map((c, i) => (
                      <Typography key={i} variant="body2">{c.name}: ${c.monthly.toLocaleString()} <span style={{ color: '#6b7280' }}>(${c.principal.toLocaleString()} тело)</span></Typography>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Итого тело кредитов: ${prof.creditsTotalPrincipal.toLocaleString()}</Typography>
                  </Box>
                ) : null}
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Chip size="small" label="Business" color="success" variant="outlined" />
                  <Chip size="small" label="Сложный" color="warning" variant="outlined" />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenCreate(false)} sx={{ color: '#fff' }}>Отмена</Button>
          <GradientButton onClick={doCreate}>Создать</GradientButton>
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
