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
          width: isMobile ? '400px' : '650px',
          height: isMobile ? '400px' : '650px',
          margin: '0 auto',
          background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
          borderRadius: '32px',
          border: '3px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.1),
            0 25px 50px rgba(0,0,0,0.4),
            0 0 100px rgba(139, 92, 246, 0.1),
            inset 0 1px 0 rgba(255,255,255,0.1)
          `,
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '32px',
            padding: '3px',
            background: 'linear-gradient(145deg, #8B5CF6, #3B82F6, #10B981, #F59E0B)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
            zIndex: -1
          }
        }}
      >
        {/* Центральный круг */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '140px',
            height: '140px',
            background: 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            zIndex: 5,
            boxShadow: `
              0 0 0 2px rgba(255,255,255,0.2),
              0 15px 35px rgba(139, 92, 246, 0.4),
              0 0 60px rgba(139, 92, 246, 0.2),
              inset 0 2px 0 rgba(255,255,255,0.3),
              inset 0 -2px 0 rgba(0,0,0,0.2)
            `,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
              zIndex: -1
            }
          }}
        >
          <Box
            sx={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: '800',
                fontSize: '18px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                letterSpacing: '1px'
              }}
            >
              ЦЕНТР
            </Typography>
            <Box
              sx={{
                width: '20px',
                height: '2px',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '1px',
                mt: 0.5
              }}
            />
          </Box>
        </Box>

        {/* Внутренний путь (1-24) */}
        {Array.from({ length: 24 }, (_, i) => i + 1).map((num, index) => {
          const angle = (index * 15) - 90; // Начинаем сверху
          const radius = 120; // Увеличиваем радиус для избежания наложений
          const x = 50 + Math.cos(angle * Math.PI / 180) * (radius / 2);
          const y = 50 + Math.sin(angle * Math.PI / 180) * (radius / 2);
          
          return (
            <motion.div
              key={`inner-${num}`}
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.02, 
                duration: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              style={{
                position: 'absolute',
                top: `${y}%`,
                left: `${x}%`,
                width: '45px',
                height: '35px',
                background: 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.2),
                  0 4px 12px rgba(139, 92, 246, 0.3),
                  0 0 20px rgba(139, 92, 246, 0.1),
                  inset 0 1px 0 rgba(255,255,255,0.3),
                  inset 0 -1px 0 rgba(0,0,0,0.2)
                `,
                zIndex: 3,
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              onClick={() => openCellPopup({ id: num, name: `Клетка ${num}` })}
              whileHover={{ 
                scale: 1.15,
                rotate: 5,
                boxShadow: `
                  0 0 0 2px rgba(255,255,255,0.4),
                  0 8px 20px rgba(139, 92, 246, 0.5),
                  0 0 30px rgba(139, 92, 246, 0.3),
                  inset 0 1px 0 rgba(255,255,255,0.5)
                `
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '13px',
                  fontWeight: '800',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  letterSpacing: '0.5px'
                }}
              >
                {num}
              </Typography>
            </motion.div>
          );
        })}

        {/* Внешний путь (29-49) */}
        {Array.from({ length: 21 }, (_, i) => i + 29).map((num, index) => {
          let x, y;
          if (index < 10) { // Нижняя часть (29-38)
            x = 15 + (index * 7);
            y = 90;
          } else if (index < 19) { // Левая часть (39-47)
            x = 10;
            y = 80 - ((index - 10) * 7);
          } else { // Верхняя часть (48-49)
            x = 15 + ((index - 19) * 7);
            y = 10;
          }
          
          return (
            <motion.div
              key={`outer-${num}`}
              initial={{ scale: 0, opacity: 0, rotate: 180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ 
                delay: (index + 24) * 0.02, 
                duration: 0.4,
                type: "spring",
                stiffness: 180,
                damping: 18
              }}
              style={{
                position: 'absolute',
                top: `${y}%`,
                left: `${x}%`,
                width: '42px',
                height: '32px',
                background: 'linear-gradient(145deg, #6366F1 0%, #4F46E5 50%, #3730A3 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                boxShadow: `
                  0 0 0 1px rgba(255,255,255,0.15),
                  0 3px 8px rgba(99, 102, 241, 0.25),
                  0 0 15px rgba(99, 102, 241, 0.08),
                  inset 0 1px 0 rgba(255,255,255,0.2),
                  inset 0 -1px 0 rgba(0,0,0,0.15)
                `,
                zIndex: 3,
                border: '1px solid rgba(255,255,255,0.08)'
              }}
              onClick={() => openCellPopup({ id: num, name: `Клетка ${num}` })}
              whileHover={{ 
                scale: 1.12,
                rotate: -3,
                boxShadow: `
                  0 0 0 2px rgba(255,255,255,0.3),
                  0 6px 16px rgba(99, 102, 241, 0.4),
                  0 0 25px rgba(99, 102, 241, 0.2),
                  inset 0 1px 0 rgba(255,255,255,0.4)
                `
              }}
              whileTap={{ scale: 0.88 }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                  letterSpacing: '0.3px'
                }}
              >
                {num}
              </Typography>
            </motion.div>
          );
        })}

        {/* Специальные угловые секции */}
        {/* Большая сделка (верхний левый) */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            delay: 0.5, 
            duration: 0.6,
            type: "spring",
            stiffness: 150,
            damping: 15
          }}
          style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            width: '90px',
            height: '70px',
            background: 'linear-gradient(145deg, #10B981 0%, #059669 50%, #047857 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            cursor: 'pointer',
            boxShadow: `
              0 0 0 2px rgba(255,255,255,0.2),
              0 8px 20px rgba(16, 185, 129, 0.4),
              0 0 30px rgba(16, 185, 129, 0.2),
              inset 0 2px 0 rgba(255,255,255,0.3),
              inset 0 -2px 0 rgba(0,0,0,0.2)
            `,
            zIndex: 4,
            border: '1px solid rgba(255,255,255,0.15)'
          }}
          onClick={() => openCellPopup({ id: 'big-deal', name: 'Большая сделка' })}
          whileHover={{ 
            scale: 1.08,
            rotate: 2,
            boxShadow: `
              0 0 0 3px rgba(255,255,255,0.4),
              0 12px 30px rgba(16, 185, 129, 0.6),
              0 0 40px rgba(16, 185, 129, 0.3),
              inset 0 2px 0 rgba(255,255,255,0.5)
            `
          }}
          whileTap={{ scale: 0.92 }}
        >
          <Box
            sx={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 0.5
            }}
          >
            <Typography sx={{ fontSize: '16px' }}>💰</Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              fontWeight: '800',
              fontSize: '11px',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px',
              lineHeight: 1.2
            }}
          >
            Большая сделка
          </Typography>
        </motion.div>

        {/* Малая сделка (верхний правый) */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: 45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            delay: 0.6, 
            duration: 0.6,
            type: "spring",
            stiffness: 150,
            damping: 15
          }}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '90px',
            height: '70px',
            background: 'linear-gradient(145deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            cursor: 'pointer',
            boxShadow: `
              0 0 0 2px rgba(255,255,255,0.2),
              0 8px 20px rgba(59, 130, 246, 0.4),
              0 0 30px rgba(59, 130, 246, 0.2),
              inset 0 2px 0 rgba(255,255,255,0.3),
              inset 0 -2px 0 rgba(0,0,0,0.2)
            `,
            zIndex: 4,
            border: '1px solid rgba(255,255,255,0.15)'
          }}
          onClick={() => openCellPopup({ id: 'small-deal', name: 'Малая сделка' })}
          whileHover={{ 
            scale: 1.08,
            rotate: -2,
            boxShadow: `
              0 0 0 3px rgba(255,255,255,0.4),
              0 12px 30px rgba(59, 130, 246, 0.6),
              0 0 40px rgba(59, 130, 246, 0.3),
              inset 0 2px 0 rgba(255,255,255,0.5)
            `
          }}
          whileTap={{ scale: 0.92 }}
        >
          <Box
            sx={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 0.5
            }}
          >
            <Typography sx={{ fontSize: '16px' }}>💼</Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              fontWeight: '800',
              fontSize: '11px',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px',
              lineHeight: 1.2
            }}
          >
            Малая сделка
          </Typography>
        </motion.div>

        {/* Расходы (нижний левый) */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: 45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            delay: 0.7, 
            duration: 0.6,
            type: "spring",
            stiffness: 150,
            damping: 15
          }}
          style={{
            position: 'absolute',
            bottom: '15px',
            left: '15px',
            width: '90px',
            height: '70px',
            background: 'linear-gradient(145deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            cursor: 'pointer',
            boxShadow: `
              0 0 0 2px rgba(255,255,255,0.2),
              0 8px 20px rgba(239, 68, 68, 0.4),
              0 0 30px rgba(239, 68, 68, 0.2),
              inset 0 2px 0 rgba(255,255,255,0.3),
              inset 0 -2px 0 rgba(0,0,0,0.2)
            `,
            zIndex: 4,
            border: '1px solid rgba(255,255,255,0.15)'
          }}
          onClick={() => openCellPopup({ id: 'expenses', name: 'Расходы' })}
          whileHover={{ 
            scale: 1.08,
            rotate: -2,
            boxShadow: `
              0 0 0 3px rgba(255,255,255,0.4),
              0 12px 30px rgba(239, 68, 68, 0.6),
              0 0 40px rgba(239, 68, 68, 0.3),
              inset 0 2px 0 rgba(255,255,255,0.5)
            `
          }}
          whileTap={{ scale: 0.92 }}
        >
          <Box
            sx={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 0.5
            }}
          >
            <Typography sx={{ fontSize: '16px' }}>💸</Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              fontWeight: '800',
              fontSize: '11px',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px',
              lineHeight: 1.2
            }}
          >
            Расходы
          </Typography>
        </motion.div>

        {/* Рынок (нижний правый) */}
        <motion.div
          initial={{ scale: 0, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            delay: 0.8, 
            duration: 0.6,
            type: "spring",
            stiffness: 150,
            damping: 15
          }}
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            width: '90px',
            height: '70px',
            background: 'linear-gradient(145deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            cursor: 'pointer',
            boxShadow: `
              0 0 0 2px rgba(255,255,255,0.2),
              0 8px 20px rgba(245, 158, 11, 0.4),
              0 0 30px rgba(245, 158, 11, 0.2),
              inset 0 2px 0 rgba(255,255,255,0.3),
              inset 0 -2px 0 rgba(0,0,0,0.2)
            `,
            zIndex: 4,
            border: '1px solid rgba(255,255,255,0.15)'
          }}
          onClick={() => openCellPopup({ id: 'market', name: 'Рынок' })}
          whileHover={{ 
            scale: 1.08,
            rotate: 2,
            boxShadow: `
              0 0 0 3px rgba(255,255,255,0.4),
              0 12px 30px rgba(245, 158, 11, 0.6),
              0 0 40px rgba(245, 158, 11, 0.3),
              inset 0 2px 0 rgba(255,255,255,0.5)
            `
          }}
          whileTap={{ scale: 0.92 }}
        >
          <Box
            sx={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 0.5
            }}
          >
            <Typography sx={{ fontSize: '16px' }}>📈</Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              fontWeight: '800',
              fontSize: '11px',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px',
              lineHeight: 1.2
            }}
          >
            Рынок
          </Typography>
        </motion.div>

        {/* Игроки на доске */}
        {gamePlayers.map((player, index) => {
          // Размещение игроков по внешнему кругу, чтобы не накладывались на клетки
          const angle = (index * 360 / gamePlayers.length) - 90;
          const radius = 45; // Увеличиваем радиус
          const x = 50 + Math.cos(angle * Math.PI / 180) * radius;
          const y = 50 + Math.sin(angle * Math.PI / 180) * radius;
          
          return (
            <motion.div
              key={player.id}
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ 
                scale: currentTurn === player.socketId ? 1.3 : 1, 
                opacity: 1,
                rotate: 0
              }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.4,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              style={{
                position: 'absolute',
                top: `${y}%`,
                left: `${x}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 10
              }}
            >
              <Box
                sx={{
                  width: isMobile ? 28 : 36,
                  height: isMobile ? 28 : 36,
                  borderRadius: '50%',
                  background: `linear-gradient(145deg, ${player.color} 0%, ${player.color}CC 100%)`,
                  border: '3px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `
                    0 0 0 2px rgba(255,255,255,0.3),
                    0 6px 12px rgba(0,0,0,0.4),
                    0 0 20px ${player.color}40,
                    inset 0 1px 0 rgba(255,255,255,0.3)
                  `,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60%',
                    height: '60%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                    zIndex: -1
                  }
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '14px',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    letterSpacing: '0.5px'
                  }}
                >
                  {player.username?.charAt(0).toUpperCase()}
                </Typography>
              </Box>
              
              {/* Индикатор текущего хода */}
              {currentTurn === player.socketId && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#10B981',
                    border: '2px solid white',
                    zIndex: 11
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </Box>
    );
  };

  // Рендер панели игроков
  const renderPlayersPanel = () => {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
          Очередность игроков
        </Typography>
        <Box sx={{ mb: 3 }}>
          {gamePlayers.map((player, index) => {
            const isCurrentTurn = currentTurn === player.socketId;
            const isCurrentPlayer = player.socketId === socket?.id;
            
            return (
              <Box
                key={player.socketId}
                sx={{
                  p: 1.5,
                  mb: 1,
                  background: isCurrentTurn ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  border: isCurrentTurn ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  position: 'relative'
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    minWidth: '20px'
                  }}
                >
                  {index + 1}.
                </Typography>
                
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: player.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    {player.username?.charAt(0).toUpperCase()}
                  </Typography>
                </Box>
                
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'white',
                      fontWeight: isCurrentTurn ? 'bold' : 'normal',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      mb: 0.5
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
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -5,
                      right: -5,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white'
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}
                    >
                      X
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // Рендер секции банка
  const renderBankSection = () => {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
          Банк
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
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                $
              </Typography>
            </Box>
            <Typography
              variant="h4"
              sx={{
                color: '#10B981',
                fontWeight: 'bold'
              }}
            >
              $2,500
            </Typography>
          </Box>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.8)' }}
          >
            Доход: $1,200 | Расходы: $800
          </Typography>
        </Box>
      </Box>
    );
  };

  // Рендер секции активов
  const renderAssetsSection = () => {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
          Активы
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
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                📦
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ space: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ color: 'white' }}>🏠</Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>
                Дом: $150,000
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ color: 'white' }}>📈</Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>
                Акции: $25,000
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: 'white' }}>💎</Typography>
              <Typography variant="body2" sx={{ color: 'white' }}>
                Бизнес: $80,000
              </Typography>
            </Box>
          </Box>
        </Box>
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
          {/* Левая панель - управление и информация */}
          <Grid item xs={12} md={4}>
            {renderBankSection()}
            {renderAssetsSection()}
            {renderControlPanel()}
            {renderTurnTimer()}
          </Grid>

          {/* Центральная панель - игровое поле */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {renderGameBoard()}
            </Box>
          </Grid>

          {/* Правая панель - игроки и текущий игрок */}
          <Grid item xs={12} md={4}>
            {renderPlayersPanel()}
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
