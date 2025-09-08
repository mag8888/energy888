import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Tab, Tabs, TextField, Typography, Alert, Snackbar, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/auth';
import GlassCard from '@/ui/GlassCard';
import GradientButton from '@/ui/GradientButton';

export default function AuthPage() {
  const router = useRouter();
  const { user, registerEmail, loginEmail, loginTelegram, logout } = useAuth();
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

  // Функции для обработки успешной авторизации
  const handleSuccessfulAuth = (message: string) => {
    setSnackbar(message);
    setTimeout(() => {
      router.push('/rooms');
    }, 1500);
  };

  const handleRegister = async () => {
    try {
      await registerEmail(form.name, form.email, form.password);
      handleSuccessfulAuth('Регистрация успешна! Переходим в лобби...');
    } catch (e: any) {
      setSnackbar(e.message || 'Ошибка');
    }
  };

  const handleLogin = async () => {
    try {
      await loginEmail(form.email, form.password);
      handleSuccessfulAuth('Вход выполнен! Переходим в лобби...');
    } catch (e: any) {
      setSnackbar(e.message || 'Ошибка');
    }
  };

  const handleTelegramLogin = async (userData: any) => {
    try {
      await loginTelegram(userData);
      handleSuccessfulAuth('Вход через Telegram выполнен! Переходим в лобби...');
    } catch (e: any) {
      setSnackbar(e.message || 'Ошибка');
    }
  };

  // Генерация ссылки для входа через бота
  const [botToken, setBotToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  const createBotToken = async () => {
    try {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://energy888-unified-server.onrender.com';
      
      console.log('🔌 Попытка подключения к серверу:', socketUrl);
      
      // Пробуем подключиться к серверу с более мягкими настройками CORS
      const r = await fetch(`${socketUrl}/tg/new-token`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!r.ok) {
        throw new Error(`Server error: ${r.status} - ${r.statusText}`);
      }
      
      const j = await r.json();
      console.log('🔌 Получен токен от сервера:', j);
      setBotToken(j.token);
      setAuthLoading(true);
      
      // Ожидаем авторизации через бота
      const t0 = Date.now();
      const iv = setInterval(async () => {
        try {
          const p = await fetch(`${socketUrl}/tg/poll?token=${j.token}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors'
          });
          
          if (!p.ok) {
            throw new Error(`Poll error: ${p.status}`);
          }
          
          const pj = await p.json();
          if (pj?.authorized) {
            clearInterval(iv);
            setAuthLoading(false);
            await handleTelegramLogin({ 
              id: pj.user.id, 
              username: pj.user.username, 
              first_name: pj.user.first_name, 
              last_name: pj.user.last_name, 
              photo_url: pj.user.photo_url 
            });
          } else if (Date.now() - t0 > 5 * 60 * 1000) {
            clearInterval(iv);
            setAuthLoading(false);
            setBotToken(null);
            setSnackbar('Время ожидания истекло');
          }
        } catch (pollError) {
          console.warn('Poll error:', pollError);
          clearInterval(iv);
          setAuthLoading(false);
          setBotToken(null);
          setSnackbar('Ошибка подключения к серверу');
        }
      }, 2000);
    } catch (e: any) {
      console.warn('Server connection failed, using fallback:', e);
      
      // Определяем тип ошибки
      let errorMessage = 'Сервер недоступен';
      if (e.message?.includes('CORS')) {
        errorMessage = 'CORS ошибка: сервер не настроен для вашего домена';
      } else if (e.message?.includes('Failed to fetch')) {
        errorMessage = 'Не удается подключиться к серверу';
      } else if (e.message?.includes('404')) {
        errorMessage = 'Endpoint не найден на сервере';
      }
      
      // Fallback: создаем демо-токен для тестирования
      const demoToken = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setBotToken(demoToken);
      setSnackbar(`${errorMessage}. Используется демо-режим. Нажмите "Демо-вход" для тестирования.`);
      
      // Показываем кнопку для демо-входа
      setTimeout(() => {
        setAuthLoading(false);
      }, 1000);
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Имя" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} fullWidth />
                <TextField label="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} fullWidth />
                <TextField label="Пароль" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} fullWidth />
                <GradientButton onClick={handleRegister}>Создать аккаунт</GradientButton>
              </Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', mt: 3, mb: 1 }}>Вход</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} fullWidth />
                <TextField label="Пароль" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} fullWidth />
                <GradientButton variant="contained" onClick={handleLogin}>Войти</GradientButton>
              </Box>
            </Box>
          )}

          {tab === 1 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 3 }}>
                Вход через Telegram бота
              </Typography>
              
              {!botToken ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <GradientButton onClick={createBotToken} sx={{ mb: 1 }}>
                    🔗 Сгенерировать ссылку входа
                  </GradientButton>
                  <GradientButton 
                    onClick={async () => {
                      // Демо-вход через Telegram
                      const demoUser = {
                        id: Math.floor(Math.random() * 1000000),
                        username: `demo_user_${Math.floor(Math.random() * 1000)}`,
                        first_name: 'Demo',
                        last_name: 'User',
                        photo_url: null
                      };
                      await handleTelegramLogin(demoUser);
                    }}
                    sx={{ 
                      bgcolor: 'rgba(34, 197, 94, 0.1)', 
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      '&:hover': {
                        bgcolor: 'rgba(34, 197, 94, 0.2)',
                      }
                    }}
                  >
                    🎮 Демо-вход (без бота)
                  </GradientButton>
                </Box>
              ) : (
                <Box>
                  <GradientButton 
                    href={`https://t.me/${botName}?start=login_${botToken}`} 
                    target="_blank" 
                    rel="noreferrer"
                    sx={{ mb: 2 }}
                  >
                    🤖 Открыть @{botName}
                  </GradientButton>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, mb: 1 }}>
                    {authLoading ? '⏳ Ожидание подтверждения в боте...' : 'Нажмите "Старт" в боте для входа'}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                    Ссылка действительна 5 минут
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {user && (
            <GlassCard sx={{ mt: 3, p: 2 }}>
              <Typography sx={{ color: '#22C55E' }}>В системе как: <b>{user.username}</b> (ID: {user.id})</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <GradientButton href="/1game">Перейти в игру</GradientButton>
                <GradientButton 
                  onClick={() => {
                    logout();
                    window.location.reload();
                  }}
                  sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                >
                  Выйти
                </GradientButton>
              </Box>
            </GlassCard>
          )}
      </GlassCard>
      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={()=>setSnackbar(null)}>
        <Alert severity="info">{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}
