import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, Tab, Tabs, TextField, Typography, Alert, Snackbar } from '@mui/material';
import { useAuth } from '@/lib/auth';

export default function AuthPage() {
  const { user, registerEmail, loginEmail, loginTelegram } = useAuth();
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const bot = process.env.NEXT_PUBLIC_TELEGRAM_BOT || 'EnergyMoneyBot';

  useEffect(() => {
    // Telegram login widget loader
    if (tab !== 1) return;
    if (typeof window === 'undefined') return;
    // Callback handler for widget with server-side verification
    (window as any).onTelegramAuth = async (data: any) => {
      try {
        const qs = new URLSearchParams();
        Object.keys(data || {}).forEach(k => qs.append(k, String((data as any)[k])));
        const resp = await fetch(`/api/tg-verify?${qs.toString()}`);
        const json = await resp.json();
        if (!json.ok) throw new Error(json.error || 'Верификация не пройдена');
        await loginTelegram(data);
        setSnackbar('Вход через Telegram выполнен');
      } catch (e: any) {
        setSnackbar(e?.message || 'Ошибка входа через Telegram');
      }
    };
    const s = document.createElement('script');
    s.src = 'https://telegram.org/js/telegram-widget.js?22';
    s.async = true;
    s.setAttribute('data-telegram-login', bot);
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-onauth', 'onTelegramAuth(user)');
    s.setAttribute('data-request-access', 'write');
    const mount = document.getElementById('tg-mount');
    mount?.appendChild(s);
    return () => { mount && (mount.innerHTML = ''); };
  }, [tab, bot, loginTelegram]);

  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 560, width: '100%', background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,41,59,0.9))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>Вход / Регистрация</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>Выберите способ авторизации. После входа вам назначим User ID и используем его в игре.</Typography>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Email" />
            <Tab label="Telegram" />
          </Tabs>

          {tab === 0 && (
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>Регистрация</Typography>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
                <TextField label="Имя" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} fullWidth />
                <TextField label="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} fullWidth />
                <TextField label="Пароль" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} fullWidth />
                <Button variant="contained" onClick={async ()=>{ try{ await registerEmail(form.name, form.email, form.password); setSnackbar('Регистрация успешна'); }catch(e:any){ setSnackbar(e.message||'Ошибка'); } }}>Зарегистрироваться</Button>
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 2, mb: 1 }}>Вход</Typography>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
                <TextField label="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} fullWidth />
                <TextField label="Пароль" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} fullWidth />
                <Box />
                <Button variant="outlined" onClick={async ()=>{ try{ await loginEmail(form.email, form.password); setSnackbar('Вход выполнен'); }catch(e:any){ setSnackbar(e.message||'Ошибка'); } }}>Войти</Button>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ textAlign: 'center' }}>
              <Box id="tg-mount" />
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 2 }}>Или откройте бота и нажмите «Играть»:</Typography>
              <Button href={`https://t.me/${bot}`} target="_blank" rel="noreferrer" variant="outlined" sx={{ mt: 1 }}>Открыть бота</Button>
            </Box>
          )}

          {user && (
            <Box sx={{ mt: 3, p: 2, border: '1px solid rgba(34,197,94,0.4)', borderRadius: 2, background: 'rgba(34,197,94,0.08)' }}>
              <Typography sx={{ color: '#22C55E' }}>В системе как: <b>{user.username}</b> (ID: {user.id})</Typography>
              <Button href="/1game" variant="contained" sx={{ mt: 1 }}>Перейти в игру</Button>
            </Box>
          )}
        </CardContent>
      </Card>
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={()=>setSnackbar(null)}>
        <Alert severity="info">{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}
