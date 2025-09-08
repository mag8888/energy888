
import React, { useState } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardContent, CardActions, Paper } from '@mui/material';
import { PlayArrow, Settings, Info } from '@mui/icons-material';
import { GameBoard } from './modules/index.js';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [gameData, setGameData] = useState(null);

  // Заглушка для данных игры
  const mockGameData = {
    roomId: 'test-room-123',
    playerData: {
      id: 'player-1',
      username: 'Тестовый игрок',
      socketId: 'socket-123'
    }
  };

  const handleStartGame = () => {
    setGameData(mockGameData);
    setCurrentView('game');
  };

  const handleExitGame = () => {
    setGameData(null);
    setCurrentView('home');
  };

  const renderHomePage = () => (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: 6,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h2"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                mb: 2,
                textShadow: '0 4px 8px rgba(0,0,0,0.3)'
              }}
            >
              🎯 Модульная игровая система
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.8)',
                mb: 4
              }}
            >
              Добро пожаловать в систему модульных игр
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <PlayArrow sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Игровая доска
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Основной модуль игровой доски с полным функционалом
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleStartGame}
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  >
                    Запустить
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: 'white',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Settings sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Настройки
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Конфигурация модулей и параметров игры
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    disabled
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    Скоро
                  </Button>
                </CardActions>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: 'white',
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Info sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                    О системе
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                    Информация о модульной архитектуре
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button
                    variant="contained"
                    disabled
                    sx={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    Скоро
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Версия 1.0.0 | Модульная архитектура
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );

  const renderGamePage = () => (
    <GameBoard
      roomId={gameData.roomId}
      playerData={gameData.playerData}
      onExit={handleExitGame}
    />
  );

  return (
    <Box>
      {currentView === 'home' && renderHomePage()}
      {currentView === 'game' && gameData && renderGamePage()}
    </Box>
  );
};

export default App;
