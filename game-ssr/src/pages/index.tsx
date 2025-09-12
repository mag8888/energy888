import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Container, Grid, Card, CardContent, CardActions, Button, Chip, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { PlayArrow, Group, TrendingUp, School, Security, Speed } from '@mui/icons-material';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DebugRoomsPanel from '../components/DebugRoomsPanel';

export default function IndexPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    // Проверяем авторизацию
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser);
    }
    
    // Небольшая задержка для показа анимации
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push('/simple-rooms');
    } else {
      router.push('/simple-auth');
    }
  };

  const features = [
    {
      icon: <Group sx={{ fontSize: 40, color: '#667eea' }} />,
      title: 'Многопользовательская игра',
      description: 'Играйте с друзьями в режиме реального времени'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#10B981' }} />,
      title: 'Финансовая грамотность',
      description: 'Изучайте основы инвестирования и управления деньгами'
    },
    {
      icon: <School sx={{ fontSize: 40, color: '#F59E0B' }} />,
      title: 'Образовательный процесс',
      description: 'Получайте знания через увлекательную игру'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#EF4444' }} />,
      title: 'Безопасность',
      description: 'Ваши данные защищены современными технологиями'
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: '#8B5CF6' }} />,
      title: 'Быстрая игра',
      description: 'Оптимизированная производительность для комфортной игры'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <LoadingSpinner 
          size={80} 
          message="Загрузка Energy of Money..." 
          color="primary"
        />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ 
          padding: isMobile ? 2 : 4,
          textAlign: 'center',
          color: 'white'
        }}>
          <Typography 
            variant={isMobile ? 'h3' : 'h2'} 
            sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Energy of Money
          </Typography>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            sx={{ 
              mb: 4, 
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            Игра на финансовую грамотность
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
            <Chip 
              label="v2.1.3" 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
            <Chip 
              label={user ? 'Авторизован' : 'Гость'} 
              sx={{ 
                backgroundColor: user ? '#10B981' : '#F59E0B', 
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          </Box>
        </Box>
      </motion.div>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Grid container spacing={4}>
          {/* Features Grid */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                sx={{ 
                  color: 'white', 
                  mb: 4, 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Возможности игры
              </Typography>
              
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    >
                      <Card 
                        sx={{ 
                          height: '100%',
                          background: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '16px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                          }
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Box sx={{ mb: 2 }}>
                            {feature.icon}
                          </Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold', 
                              mb: 1,
                              color: '#111827'
                            }}
                          >
                            {feature.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#6B7280',
                              lineHeight: 1.6
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Grid>

          {/* Action Panel */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card 
                sx={{ 
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  height: 'fit-content'
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 2,
                      color: '#111827'
                    }}
                  >
                    Начать игру
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 4, 
                      color: '#6B7280',
                      lineHeight: 1.6
                    }}
                  >
                    {user 
                      ? `Добро пожаловать, ${JSON.parse(user).name || 'Игрок'}!` 
                      : 'Войдите в систему, чтобы начать играть'
                    }
                  </Typography>

                  <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={handleGetStarted}
                    icon={<PlayArrow />}
                    sx={{ mb: 2 }}
                  >
                    {user ? 'Продолжить игру' : 'Начать игру'}
                  </Button>

                  {!user && (
                    <Button
                      variant="secondary"
                      size="medium"
                      fullWidth
                      onClick={() => router.push('/simple-auth')}
                    >
                      Войти в систему
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Debug Panel (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <DebugRoomsPanel />
        </Box>
      )}
    </Box>
  );
}