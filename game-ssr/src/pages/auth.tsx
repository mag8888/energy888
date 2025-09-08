import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Tab, Tabs, TextField, Typography, Alert, Snackbar, Stack } from '@mui/material';
import { useAuth } from '@/lib/auth';
import GlassCard from '@/ui/GlassCard';
import GradientButton from '@/ui/GradientButton';

export default function AuthPage() {
  const { user, registerEmail, loginEmail, loginTelegram } = useAuth();
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT || 'energy_m_bot';
  const botName = (bot || '').replace(/^@/, '');

  // remember chosen method
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('eom_auth_tab');
    if (saved) setTab(Number(saved));
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('eom_auth_tab', String(tab));
  }, [tab]);

  // Простая авторизация через кнопку
  const handleSimpleTelegramLogin = async () => {
    try {
      // Создаем простого пользователя с случайным ID
      const randomId = Math.floor(Math.random() * 1000000);
      const userData = {
        id: randomId,
        username: `user_${randomId}`,
        first_name: 'Telegram',
        last_name: 'User',
        photo_url: null
      };
      
      await loginTelegram(userData);
      setSnackbar('Вход выполнен успешно!');
    } catch (e: any) {
      setSnackbar(e?.message || 'Ошибка входа');
    }
  };


  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 1.5, md: 4 }, gap: 3, flexDirection: 'column' }}>
      {/* Profile welcome panel */}
      {user && (
        <GlassCard sx={{ maxWidth: 960, width: '100%', p: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(135deg,#06B6D4,#8B5CF6,#EC4899)', color: '#fff' }}>{user.username?.[0]?.toUpperCase()||'U'}</Avatar>
              <Box>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>{user.username}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)' }}>Добро пожаловать в игру!</Typography>
              </Box>
            </Stack>
            <Stack direction={{ xs:'column', sm:'row' }} spacing={1}>
              <Button href="/1game" variant="outlined" sx={{ borderColor:'rgba(255,255,255,0.2)', color:'#fff' }}>Перейти в игру</Button>
              <Button onClick={()=>location.reload()} variant="outlined" sx={{ borderColor:'rgba(255,255,255,0.2)', color:'#fff' }}>Обновить</Button>
            </Stack>
          </Stack>
        </GlassCard>
      )}

      <GlassCard sx={{ maxWidth: 960, width: '100%' }}>
        <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>Вход / Регистрация</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>Выберите способ авторизации. После входа вам назначим User ID и используем его в игре.</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Email" />
          <Tab label="Telegram" />
        </Tabs>

          {tab === 0 && (
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>Регистрация</Typography>
              <Box sx={{ display: 'grid', gap: 12, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <TextField label="Имя" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} fullWidth />
                <TextField label="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} fullWidth />
                <TextField label="Пароль" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} fullWidth />
                <GradientButton onClick={async ()=>{ try{ await registerEmail(form.name, form.email, form.password); setSnackbar('Регистрация успешна'); }catch(e:any){ setSnackbar(e.message||'Ошибка'); } }}>Создать аккаунт</GradientButton>
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 2, mb: 1 }}>Вход</Typography>
              <Box sx={{ display: 'grid', gap: 12, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                <TextField label="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} fullWidth />
                <TextField label="Пароль" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} fullWidth />
                <Box />
                <GradientButton variant="contained" onClick={async ()=>{ try{ await loginEmail(form.email, form.password); setSnackbar('Вход выполнен'); }catch(e:any){ setSnackbar(e.message||'Ошибка'); } }}>Войти</GradientButton>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 3 }}>
                Простой вход в игру
              </Typography>
              <GradientButton onClick={handleSimpleTelegramLogin} sx={{ mb: 2 }}>
                🚀 Войти в игру
              </GradientButton>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                Нажмите кнопку выше для быстрого входа
              </Typography>
            </Box>
          )}

          {user && (
            <GlassCard sx={{ mt: 3, p: 2 }}>
              <Typography sx={{ color: '#22C55E' }}>В системе как: <b>{user.username}</b> (ID: {user.id})</Typography>
              <GradientButton href="/1game" sx={{ mt: 1 }}>Перейти в игру</GradientButton>
            </GlassCard>
          )}
      </GlassCard>
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={()=>setSnackbar(null)}>
        <Alert severity="info">{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}
