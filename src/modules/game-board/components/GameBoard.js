import React, { Fragment } from 'react';
import { Box, Typography, Button, LinearProgress, Avatar, Chip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider, Grid, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Timer, ExitToApp, AccountBalance, Inventory, Group, Menu, Close, VolunteerActivism as CharityIcon } from '@mui/icons-material';

import { useGameState } from '../hooks/useGameState.js';
import { useUIState } from '../hooks/useUIState.js';
import { useGameLogic } from '../hooks/useGameLogic.js';
import { CELL_CONFIG } from '../../../data/gameCells.js';
import { PLAYER_COLORS, assignPlayerColor, getColorByIndex, getContrastTextColor } from '../../../styles/playerColors.js';

const GameBoard = ({ roomId, playerData, onExit }) => {
  // Хуки для управления состоянием
  const gameState = useGameState(roomId, playerData);
  const uiState = useUIState();
  const gameLogic = useGameLogic(gameState.gamePlayers, gameState.currentTurn, gameState.isHost, gameState.updateCurrentPlayerAssets);

  const {
    gamePlayers,
    currentTurn,
    isHost,
    turnTimeLeft,
    isGameFinished
  } = gameState;

  const {
    isMobile,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showProfessionModal,
    showMarketModal,
    showExpenseModal,
    showBreakModal,
    showBankModal,
    showCellPopup,
    selectedCell,
    snackbar,
    openProfessionModal,
    closeProfessionModal,
    openMarketModal,
    closeMarketModal,
    openExpenseModal,
    closeExpenseModal,
    openBreakModal,
    closeBreakModal,
    openBankModal,
    closeBankModal,
    openCellPopup,
    closeCellPopup,
    showSnackbar,
    hideSnackbar
  } = uiState;

  const {
    diceValue,
    isRolling,
    playerPosition,
    isOnBigCircle,
    bigCirclePosition,
    currentPlayer,
    currentPlayerAssets,
    currentPlayerBalance,
    canRollDice,
    rollDice,
    handlePlayerMove,
    handleProfessionCard,
    handleMarketCard,
    handleExpenseCard,
    handleCharity,
    handleBreak
  } = gameLogic;

  // Рендер игровой доски
  const renderGameBoard = () => {
    return (
      <Box
        sx={{
          position: 'relative',
          width: isMobile ? '300px' : '500px',
          height: isMobile ? '300px' : '500px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '50%',
          border: '8px solid #065F46',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Клетки игрового поля */}
        {CELL_CONFIG.map((cell, index) => (
          <motion.div
            key={cell.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            style={{
              position: 'absolute',
              top: `${cell.position.y}%`,
              left: `${cell.position.x}%`,
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              borderRadius: '8px',
              border: '2px solid #D1D5DB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            onClick={() => openCellPopup(cell)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: '10px',
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#374151'
              }}
            >
              {cell.name}
            </Typography>
          </motion.div>
        ))}

        {/* Игроки на поле */}
        {gamePlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: currentTurn === player.socketId ? 1.1 : 1, 
              opacity: 1 
            }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            style={{
              position: 'absolute',
              top: `${CELL_CONFIG[player.position]?.position.y || 50}%`,
              left: `${CELL_CONFIG[player.position]?.position.x || 50}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 10
            }}
          >
            <Avatar
              sx={{
                width: isMobile ? 30 : 40,
                height: isMobile ? 30 : 40,
                bgcolor: player.color,
                border: '3px solid white',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              {player.username?.charAt(0).toUpperCase()}
            </Avatar>
          </motion.div>
        ))}
      </Box>
    );
  };

  // Рендер панели игроков
  const renderPlayersPanel = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
          Игроки ({gamePlayers.length})
        </Typography>
        <Grid container spacing={1}>
          {gamePlayers.map((player, index) => {
            const isCurrentTurn = currentTurn === player.socketId;
            const isCurrentPlayer = player.socketId === socket?.id;
            
            return (
              <Grid item xs={12} sm={6} key={player.socketId}>
                <Box
                  sx={{
                    p: isMobile ? 0.5 : 1,
                    background: isCurrentTurn ? '#8B5CF6' : isCurrentPlayer ? 'rgba(139, 92, 246, 0.3)' : 'transparent',
                    borderRadius: '8px',
                    border: isCurrentTurn ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: player.color,
                      fontSize: '14px'
                    }}
                  >
                    {player.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'white',
                        fontWeight: isCurrentTurn ? 'bold' : 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {player.username}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                      💰 {player.balance || 0} | 📦 {player.assets?.length || 0}
                    </Typography>
                  </Box>
                  {isCurrentTurn && (
                    <Chip
                      label="Ход"
                      size="small"
                      sx={{
                        bgcolor: '#8B5CF6',
                        color: 'white',
                        fontSize: '10px'
                      }}
                    />
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Рендер панели управления
  const renderControlPanel = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
          Управление
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={rollDice}
              disabled={!canRollDice || isRolling}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                py: 1.5,
                fontSize: '16px',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                },
                '&:disabled': {
                  background: '#6B7280',
                  color: 'rgba(255,255,255,0.5)'
                }
              }}
            >
              {isRolling ? 'Бросаем...' : `🎲 Бросить кости${diceValue ? ` (${diceValue})` : ''}`}
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={openBankModal}
              sx={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                color: 'white',
                py: 1.5,
                fontSize: '16px',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)'
                }
              }}
            >
              🏦 Банк
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  };

  // Рендер таймера хода
  const renderTurnTimer = () => {
    if (!turnTimeLeft || isGameFinished) return null;

    const progress = (turnTimeLeft / 60) * 100; // Предполагаем 60 секунд на ход

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
          Время хода: {turnTimeLeft}с
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.2)',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#10B981'
            }
          }}
        />
      </Box>
    );
  };

  return (
    <Fragment>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        padding: isMobile ? '10px' : '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Заголовок */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 1,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            🎯 Игровая доска
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 2
            }}
          >
            Комната: {roomId}
          </Typography>
        </Box>

        {/* Основной контент */}
        <Grid container spacing={3}>
          {/* Левая панель - игроки и управление */}
          <Grid item xs={12} md={4}>
            {renderPlayersPanel()}
            {renderControlPanel()}
            {renderTurnTimer()}
          </Grid>

          {/* Центральная панель - игровое поле */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {renderGameBoard()}
            </Box>
          </Grid>

          {/* Правая панель - информация о текущем игроке */}
          <Grid item xs={12} md={4}>
            {currentPlayer && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
                  Текущий игрок
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: currentPlayer.color
                      }}
                    >
                      {currentPlayer.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        {currentPlayer.username}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Баланс: {currentPlayerBalance} 💰
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                    Активы: {currentPlayerAssets.length}
                  </Typography>
                  
                  {currentPlayerAssets.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Последние активы:
                      </Typography>
                      {currentPlayerAssets.slice(-3).map((asset, index) => (
                        <Chip
                          key={index}
                          label={asset.name || asset.type}
                          size="small"
                          sx={{
                            mr: 0.5,
                            mb: 0.5,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontSize: '10px'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Кнопка выхода */}
        <Box sx={{ position: 'fixed', top: 20, right: 20 }}>
          <Button
            variant="contained"
            onClick={onExit}
            startIcon={<ExitToApp />}
            sx={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: 'white',
              px: 3,
              py: 1.5,
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
              }
            }}
          >
            Выйти
          </Button>
        </Box>
      </Box>

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={hideSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Fragment>
  );
};

export default GameBoard;
