import React, { Fragment } from 'react';
import { Box, Typography, Button, LinearProgress, Avatar, Chip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, List, ListItem, ListItemText, Divider, Grid, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Timer, ExitToApp, AccountBalance, Inventory, Group, Menu, Close, VolunteerActivism as CharityIcon } from '@mui/icons-material';

import { useGameState } from '../hooks/useGameState.js';
import { useUIState } from '../hooks/useUIState.js';
import { useGameLogic } from '../hooks/useGameLogic.js';
import { CELL_CONFIG } from '../../../data/gameCells.js';
import { PLAYER_COLORS, assignPlayerColor, getColorByIndex, getContrastTextColor } from '../../../styles/playerColors.js';
import socket from '../../../socket.js';

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
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 80 }}
        whileHover={{ scale: 1.02 }}
      >
        <Box
          sx={{
            position: 'relative',
            width: isMobile ? '450px' : '750px',
            height: isMobile ? '450px' : '750px',
            margin: '0 auto',
            background: 'linear-gradient(145deg, #0A0E1A 0%, #1A1F2E 20%, #2D3748 40%, #4A5568 60%, #718096 80%, #A0AEC0 100%)',
            borderRadius: '50px',
            border: '5px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: `
              0 0 0 3px rgba(255,255,255,0.25),
              0 40px 80px rgba(0,0,0,0.7),
              0 0 200px rgba(139, 92, 246, 0.25),
              inset 0 4px 0 rgba(255,255,255,0.4),
              inset 0 -4px 0 rgba(0,0,0,0.4)
            `,
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: '50px',
              padding: '5px',
              background: 'linear-gradient(145deg, #8B5CF6, #3B82F6, #10B981, #F59E0B, #EF4444, #EC4899, #8B5CF6)',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
              zIndex: -1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              height: '90%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.15) 30%, rgba(16, 185, 129, 0.1) 60%, transparent 80%)',
              zIndex: -1
            }
          }}
        >
        {/* Центральный круг */}
          <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 120 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '180px',
              height: '180px',
              background: 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 25%, #6D28D9 50%, #5B21B6 75%, #4C1D95 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              zIndex: 5,
              boxShadow: `
                0 0 0 4px rgba(255,255,255,0.4),
                0 25px 50px rgba(139, 92, 246, 0.6),
                0 0 100px rgba(139, 92, 246, 0.4),
                inset 0 4px 0 rgba(255,255,255,0.5),
                inset 0 -4px 0 rgba(0,0,0,0.4)
              `,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                zIndex: -1
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '15%',
                left: '15%',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
                zIndex: -1
              }
            }}
          >
            <Box
              sx={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                border: '3px solid rgba(255,255,255,0.4)',
                boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.2)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '70%',
                  height: '70%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                  zIndex: -1
                }
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '22px',
                  textShadow: '0 4px 8px rgba(0,0,0,0.6), 0 0 15px rgba(255,255,255,0.4)',
                  letterSpacing: '3px',
                  textAlign: 'center',
                  lineHeight: 1.1,
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                }}
              >
                ЦЕНТР
              </Typography>
              <Box
                sx={{
                  width: '30px',
                  height: '4px',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)',
                  borderRadius: '2px',
                  mt: 1.5,
                  boxShadow: '0 0 12px rgba(255,255,255,0.6)'
                }}
              />
            </Box>
          </Box>
        </motion.div>

        {/* Внутренний круг (1-24) */}
        {Array.from({ length: 24 }, (_, i) => i + 1).map((num, index) => {
          const angle = (index * 15) - 90; // Начинаем сверху
          const radius = 100; // Радиус для внутреннего круга
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
                width: '55px',
                height: '45px',
                background: 'linear-gradient(145deg, #8B5CF6 0%, #7C3AED 25%, #6D28D9 50%, #5B21B6 75%, #4C1D95 100%)',
                borderRadius: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                boxShadow: `
                  0 0 0 3px rgba(255,255,255,0.4),
                  0 8px 20px rgba(139, 92, 246, 0.5),
                  0 0 30px rgba(139, 92, 246, 0.3),
                  inset 0 3px 0 rgba(255,255,255,0.5),
                  inset 0 -3px 0 rgba(0,0,0,0.4)
                `,
                zIndex: 3,
                border: '3px solid rgba(255,255,255,0.3)'
              }}
              onClick={() => openCellPopup({ id: num, name: `Клетка ${num}` })}
              whileHover={{ 
                scale: 1.2,
                rotate: 8,
                boxShadow: `
                  0 0 0 3px rgba(255,255,255,0.5),
                  0 10px 25px rgba(139, 92, 246, 0.6),
                  0 0 40px rgba(139, 92, 246, 0.4),
                  inset 0 2px 0 rgba(255,255,255,0.6)
                `
              }}
              whileTap={{ scale: 0.85 }}
          >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '16px',
                  fontWeight: '900',
                  color: 'white',
                  textShadow: '0 3px 6px rgba(0,0,0,0.7), 0 0 12px rgba(255,255,255,0.4)',
                  letterSpacing: '1.5px',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                }}
              >
                {num}
              </Typography>
            </motion.div>
          );
        })}

        {/* Квадрат по периметру (1-52) */}
        {Array.from({ length: 52 }, (_, i) => i + 1).map((num, index) => {
          let x, y;
          const sideLength = 13; // Количество клеток на каждой стороне
          
          if (index < sideLength) { // Верхняя сторона (1-13)
            x = 5 + (index * 6.5);
            y = 5;
          } else if (index < sideLength * 2) { // Правая сторона (14-26)
            x = 85;
            y = 5 + ((index - sideLength) * 6.5);
          } else if (index < sideLength * 3) { // Нижняя сторона (27-39)
            x = 85 - ((index - sideLength * 2) * 6.5);
            y = 85;
          } else { // Левая сторона (40-52)
            x = 5;
            y = 85 - ((index - sideLength * 3) * 6.5);
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
                width: '40px',
                height: '30px',
                background: 'linear-gradient(145deg, #00BCD4 0%, #0097A7 30%, #006064 60%, #004D40 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                boxShadow: `
                  0 0 0 2px rgba(255,255,255,0.25),
                  0 4px 8px rgba(0, 188, 212, 0.35),
                  0 0 15px rgba(0, 188, 212, 0.15),
                  inset 0 1px 0 rgba(255,255,255,0.3),
                  inset 0 -1px 0 rgba(0,0,0,0.2)
                `,
                zIndex: 3,
                border: '1px solid rgba(255,255,255,0.15)'
              }}
              onClick={() => openCellPopup({ id: num, name: `Клетка ${num}` })}
              whileHover={{ 
                scale: 1.15,
                rotate: 2,
                boxShadow: `
                  0 0 0 3px rgba(255,255,255,0.4),
                  0 6px 15px rgba(0, 188, 212, 0.5),
                  0 0 25px rgba(0, 188, 212, 0.3),
                  inset 0 1px 0 rgba(255,255,255,0.5)
                `
              }}
              whileTap={{ scale: 0.85 }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: 'white',
                  textShadow: '0 1px 3px rgba(0,0,0,0.5), 0 0 4px rgba(255,255,255,0.2)',
                  letterSpacing: '0.5px'
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
            top: '2%',
            left: '2%',
            width: '100px',
            height: '80px',
            background: 'linear-gradient(145deg, #10B981 0%, #059669 30%, #047857 60%, #065F46 100%)',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            cursor: 'pointer',
            boxShadow: `
              0 0 0 3px rgba(255,255,255,0.3),
              0 12px 25px rgba(16, 185, 129, 0.5),
              0 0 40px rgba(16, 185, 129, 0.3),
              inset 0 3px 0 rgba(255,255,255,0.4),
              inset 0 -3px 0 rgba(0,0,0,0.3)
            `,
            zIndex: 4,
            border: '2px solid rgba(255,255,255,0.2)'
          }}
          onClick={() => openCellPopup({ id: 'big-deal', name: 'Большая сделка' })}
          whileHover={{ 
            scale: 1.12,
            rotate: 3,
            boxShadow: `
              0 0 0 4px rgba(255,255,255,0.5),
              0 16px 35px rgba(16, 185, 129, 0.7),
              0 0 50px rgba(16, 185, 129, 0.4),
              inset 0 3px 0 rgba(255,255,255,0.6)
            `
          }}
          whileTap={{ scale: 0.88 }}
        >
          <Box
            sx={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 0.8,
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)'
            }}
          >
            <Typography sx={{ fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>💰</Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: 'white',
              fontWeight: '900',
              fontSize: '12px',
                textAlign: 'center',
              textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.2)',
              letterSpacing: '0.8px',
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
            top: '2%',
            right: '2%',
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
            bottom: '2%',
            left: '2%',
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
            bottom: '2%',
            right: '2%',
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
          const radius = 55; // Увеличиваем радиус еще больше
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
                  width: isMobile ? 32 : 42,
                  height: isMobile ? 32 : 42,
                  borderRadius: '50%',
                  background: `linear-gradient(145deg, ${player.color} 0%, ${player.color}CC 100%)`,
                  border: '4px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `
                    0 0 0 3px rgba(255,255,255,0.4),
                    0 8px 16px rgba(0,0,0,0.5),
                    0 0 30px ${player.color}60,
                    inset 0 2px 0 rgba(255,255,255,0.4)
                  `,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '70%',
                    height: '70%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                    zIndex: -1
                  }
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    fontWeight: '800',
                    fontSize: isMobile ? '16px' : '18px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.6)',
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
                    scale: [1, 1.3, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{ 
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
                    border: '3px solid white',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.8)',
                    zIndex: 11
                  }}
                />
              )}
          </motion.div>
          );
        })}
      </Box>
      </motion.div>
    );
  };

  // Рендер панели игроков
  const renderPlayersPanel = () => {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1.5, color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
          Игроки
        </Typography>
        <Box sx={{ mb: 2 }}>
          {gamePlayers.map((player, index) => {
            const isCurrentTurn = currentTurn === player.socketId;
            const isCurrentPlayer = player.socketId === socket?.id;
            
            return (
              <motion.div
                key={player.socketId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    mb: 1,
                    background: isCurrentTurn 
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)' 
                      : 'rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    border: isCurrentTurn 
                      ? '2px solid rgba(139, 92, 246, 0.6)' 
                      : '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: isCurrentTurn 
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(59, 130, 246, 0.3) 100%)' 
                        : 'rgba(255,255,255,0.12)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                    }
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      minWidth: '16px',
                      fontSize: '12px',
                      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    {index + 1}.
                  </Typography>
                  
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: `linear-gradient(145deg, ${player.color} 0%, ${player.color}CC 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid white',
                      boxShadow: `
                        0 0 0 1px rgba(255,255,255,0.3),
                        0 2px 4px rgba(0,0,0,0.3),
                        0 0 8px ${player.color}40
                      `,
                      position: 'relative'
                    }}
                  >
                    <Typography
                      variant="body2"
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
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'white',
                        fontWeight: isCurrentTurn ? '800' : '600',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        mb: 0.25,
                        fontSize: '14px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {player.username}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      <span>💰 {player.balance || 0}</span>
                      <span>📦 {player.assets?.length || 0}</span>
                    </Typography>
                  </Box>
                  
                  {isCurrentTurn && (
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)',
                        zIndex: 10
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '10px'
                        }}
                      >
                        ✓
                      </Typography>
                    </motion.div>
                  )}
                </Box>
              </motion.div>
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
        <Typography variant="caption" sx={{ color: 'white', mt: 0.5, display: 'block', textAlign: 'center' }}>
          {turnTimeLeft}с
        </Typography>
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
        <Grid container spacing={2}>
          {/* Центральная панель - игровое поле */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {renderGameBoard()}
            </Box>
          </Grid>

          {/* Правая панель - все элементы управления */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* 1. Банк */}
              {renderBankSection()}
              
              {/* 2. Бросить кубик */}
              {renderControlPanel()}
              
              {/* 3. Время хода */}
              {renderTurnTimer()}
              
              {/* 4. Очередь игроков */}
              {renderPlayersPanel()}
            </Box>
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
