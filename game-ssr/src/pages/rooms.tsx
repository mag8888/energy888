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
  const [createForm, setCreateForm] = useState({ name: '', maxPlayers: 2, timing: 2, gameDurationSec: 10800, password: '', assignAll: true, dreamId: '', professionId: 'entrepreneur' });
  const dreams = getFastTrackDreams();
  const prof = getProfession(createForm.professionId);
  const [joinPwd, setJoinPwd] = useState('');
  const [joinRoomId, setJoinRoomId] = useState<string | null>(null);

  useEffect(() => {
    const handleRooms = (list:any[]) => {
      console.log('📋 Получен список комнат:', list);
      setRooms(list);
    };
    
    console.log('🔌 Подключаемся к Socket.IO...');
    console.log('🔌 Socket connected:', socket.connected);
    console.log('🔌 Socket ID:', socket.id);
    
    socket.on('roomsList', handleRooms);
    socket.emit('getRooms');
    
    return () => { 
      console.log('🔌 Отключаемся от Socket.IO');
      socket.off('roomsList', handleRooms); 
    };
  }, []);

  const doCreate = () => {
    if (!user) { setSnack('Сначала авторизуйтесь'); return; }
    socket.emit('createRoom', {
      id: undefined,
      name: createForm.name || `Комната ${user?.username || 'Игрока'}`,
      creatorId: user.id,
      creatorUsername: user.username,
      creatorProfession: prof,
      creatorDream: dreams.find(d=>d.id===createForm.dreamId) || null,
      assignProfessionToAll: !!createForm.assignAll,
      maxPlayers: Number(createForm.maxPlayers),
      password: createForm.password || null,
      timing: Number(createForm.timing) * 60, // Конвертируем минуты в секунды
      gameDurationSec: Number(createForm.gameDurationSec)
    });
    setOpenCreate(false);
    setSnack('Комната создана');
  };

  const doJoin = async (room:any) => {
    if (!user) { 
      // Если пользователь не авторизован, предлагаем авторизацию через Telegram
      await handleTelegramAuth(room);
      return; 
    }
    if (room.hasPassword) { setJoinRoomId(room.id); return; }
    socket.emit('joinRoomMeta', { roomId: room.id, user: { id: user.id, username: user.username }, password: '' });
    setSnack('Подключаемся к комнате...');
    setTimeout(()=>{ window.location.href = `/room/${room.id}`; }, 400);
  };

  // Функция авторизации через Telegram бота
  const handleTelegramAuth = async (room: any) => {
    try {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
      const r = await fetch(`${socketUrl}/tg/new-token`);
      const j = await r.json();
      
      if (j.ok) {
        const botUrl = `https://t.me/energy_money_bot?start=login_${j.token}`;
        setSnack('Открываем Telegram для авторизации...');
        
        // Открываем бота в новом окне
        window.open(botUrl, '_blank');
        
        // Ожидаем авторизации
        const t0 = Date.now();
        const iv = setInterval(async () => {
          const p = await fetch(`${socketUrl}/tg/poll?token=${j.token}`);
          const pj = await p.json();
          if (pj?.authorized) {
            clearInterval(iv);
            setSnack('Авторизация успешна! Входим в комнату...');
            
            // Сохраняем данные пользователя в localStorage для авторизации
            const userData = {
              id: pj.user.id,
              username: pj.user.username,
              first_name: pj.user.first_name,
              last_name: pj.user.last_name,
              photo_url: pj.user.photo_url,
              tgId: pj.user.id
            };
            localStorage.setItem('eom_user', JSON.stringify(userData));
            
            // Обновляем страницу для применения авторизации
            window.location.reload();
          } else if (Date.now() - t0 > 5 * 60 * 1000) {
            clearInterval(iv);
            setSnack('Время ожидания истекло');
          }
        }, 2000);
      } else {
        setSnack('Ошибка создания токена авторизации');
      }
    } catch (e: any) {
      setSnack('Ошибка авторизации: ' + (e?.message || 'Неизвестная ошибка'));
    }
  };

  const doJoinWithPwd = () => {
    socket.emit('joinRoomMeta', { roomId: joinRoomId, user: { id: user?.id, username: user?.username }, password: joinPwd });
    const rid = joinRoomId;
    setJoinRoomId(null); setJoinPwd('');
    setTimeout(()=>{ if (rid) window.location.href = `/room/${rid}`; }, 400);
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      <GlassCard sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>Комнаты</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Создавайте комнаты с параметрами и приглашайте друзей.</Typography>
          </Box>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                👤 {user.username}
              </Typography>
              <GradientButton 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('eom_user');
                    window.location.reload();
                  }
                }}
                sx={{ px: 2, py: 1, fontSize: '0.875rem' }}
              >
                Выйти
              </GradientButton>
            </Box>
          )}
        </Box>
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
                <GradientButton onClick={()=>doJoin(r)}>
                  {user ? 'Войти' : '🤖 Начать игру'}
                </GradientButton>
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
                <TextField 
                  label="Название" 
                  value={createForm.name} 
                  onChange={e=>setCreateForm({...createForm, name: e.target.value})} 
                  placeholder={`Комната ${user?.username || 'Игрока'}`}
                  fullWidth 
                />
                <TextField label="Макс. игроков" type="number" value={createForm.maxPlayers} onChange={e=>setCreateForm({...createForm, maxPlayers: Number(e.target.value)})} fullWidth />
                <TextField select label="Время хода" value={createForm.timing} onChange={e=>setCreateForm({...createForm, timing: Number(e.target.value)})} fullWidth>
                  <MenuItem value={1}>1 минута</MenuItem>
                  <MenuItem value={2}>2 минуты</MenuItem>
                  <MenuItem value={3}>3 минуты</MenuItem>
                  <MenuItem value={4}>4 минуты</MenuItem>
                  <MenuItem value={5}>5 минут</MenuItem>
                </TextField>
                <TextField label="Пароль (необязательно)" value={createForm.password} onChange={e=>setCreateForm({...createForm, password: e.target.value})} fullWidth />
                <TextField select label="Длительность игры" value={createForm.gameDurationSec} onChange={e=>setCreateForm({...createForm, gameDurationSec: Number(e.target.value)})} fullWidth>
                  <MenuItem value={1800}>30 минут</MenuItem>
                  <MenuItem value={3600}>1 час</MenuItem>
                  <MenuItem value={7200}>2 часа</MenuItem>
                  <MenuItem value={10800}>3 часа</MenuItem>
                  <MenuItem value={14400}>4 часа</MenuItem>
                  <MenuItem value={18000}>5 часов</MenuItem>
                </TextField>
                <TextField select label="Мечта создателя (Большой круг)" value={createForm.dreamId} onChange={e=>setCreateForm({...createForm, dreamId: String(e.target.value)})} fullWidth>
                  {dreams.map(d => (
                    <MenuItem key={d.id} value={d.id}>{d.name} — ${d.cost.toLocaleString('en-US')}</MenuItem>
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
                  <Grid item xs={6}><Box sx={{ p: 1, bgcolor: '#E6FFF3', borderRadius: 1, textAlign: 'center', fontWeight: 700, color: '#10B981' }}>${prof.salary.toLocaleString('en-US')}<Typography variant="caption" display="block">Зарплата</Typography></Box></Grid>
                  <Grid item xs={6}><Box sx={{ p: 1, bgcolor: '#FFECEC', borderRadius: 1, textAlign: 'center', fontWeight: 700, color: '#EF4444' }}>${prof.totalExpenses.toLocaleString('en-US')}<Typography variant="caption" display="block">Расходы</Typography></Box></Grid>
                  <Grid item xs={12}><Box sx={{ p: 1, border: '2px solid #16a34a', borderRadius: 1, textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>${prof.cashFlow.toLocaleString('en-US')}<Typography variant="caption" display="block">Денежный поток</Typography></Box></Grid>
                </Grid>
                {prof.taxes || prof.otherExpenses ? (
                  <Box sx={{ mt: 1.5, color: '#374151' }}>
                    {prof.taxes ? <Typography variant="body2">Налоги: ${prof.taxes.toLocaleString('en-US')}</Typography> : null}
                    {prof.otherExpenses ? <Typography variant="body2">Прочие расходы: ${prof.otherExpenses.toLocaleString('en-US')}</Typography> : null}
                  </Box>
                ) : null}
                {prof.credits?.length ? (
                  <Box sx={{ mt: 1.5 }}>
                    {prof.credits.map((c, i) => (
                      <Typography key={i} variant="body2">{c.name}: ${c.monthly.toLocaleString('en-US')} <span style={{ color: '#6b7280' }}>(${c.principal.toLocaleString('en-US')} тело)</span></Typography>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>Итого тело кредитов: ${prof.creditsTotalPrincipal.toLocaleString('en-US')}</Typography>
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
