import React, { useState, useEffect, Fragment, useRef } from 'react';
import socket from '../lib/socket';
import { Box, Typography, Button, Avatar, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import ProfessionDetails from './ProfessionDetails';
import MarketCardModal from './MarketCardModal';
import ExpenseCardModal from './ExpenseCardModal';
import BreakModal from './BreakModal';
import BankModule from './BankModule';
import CellPopup from './CellPopup';
import { MarketDeckManager, checkPlayerHasMatchingAsset } from '../data/marketCards';
import { ExpenseDeckManager } from '../data/expenseCards';
import { CELL_CONFIG } from '../data/gameCells';
import { PLAYER_COLORS, assignPlayerColor, getColorByIndex, getContrastTextColor } from '../styles/playerColors';

// This is a trimmed version to render the layout and preserve visuals.
// It keeps the core state and UI shells; networking/actions are stubbed.

const OriginalGameBoard = ({ roomId, playerData, onExit }) => {
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [gamePlayers, setGamePlayers] = useState(() => [
    {
      id: 'socket-stub-id',
      socketId: 'socket-stub-id',
      username: playerData?.username || 'Игрок',
      profession: playerData?.profession || { name: 'Программист', salary: 6000 },
      balance: playerData?.profession?.balance ?? 3000,
      position: 1,
      color: assignPlayerColor([], {})
    }
  ]);

  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [currentTurn, setCurrentTurn] = useState(gamePlayers[0]?.username || 'Игрок');
  const [playerMoney, setPlayerMoney] = useState(playerData?.profession?.balance ?? 3000);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [diceValue, setDiceValue] = useState(1);
  const [showCellPopup, setShowCellPopup] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isOnBigCircle] = useState(true);
  const [bigCirclePassiveIncome] = useState(0);
  const [bigCircleBalance] = useState(0);
  const [dealDeck] = useState([]);

  useEffect(() => {
    setCurrentTurn(gamePlayers[currentPlayer]?.username || 'Игрок');
  }, [currentPlayer, gamePlayers]);

  const rollDice = () => {
    if (isRolling || isMoving) return;
    setIsRolling(true);
    const val = Math.floor(Math.random() * 6) + 1;
    setTimeout(() => {
      setDiceValue(val);
      setIsRolling(false);
      // Open a simple popup to simulate landing
      setSelectedCell({ id: val, name: 'Секция', description: 'Описание клетки' });
      setShowCellPopup(true);
    }, 600);
  };

  return (
    <Fragment>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#ff4444', fontWeight: 'bold', fontFamily: 'monospace' }}>
            🐛 DEBUG: OriginalGameBoard (standalone, visuals preserved)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: gamePlayers[0]?.color || '#8B5CF6' }}>
              {gamePlayers[0]?.username?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                {gamePlayers[0]?.username || 'Игрок'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {gamePlayers[0]?.profession?.name || 'Без профессии'}
              </Typography>
              {currentTurn && (
                <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 'bold' }}>
                  🎲 {currentTurn === gamePlayers[0]?.username ? 'Ваш ход!' : `Ход: ${currentTurn}`}
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: '#22C55E', fontWeight: 'bold' }}>
                🎯 Большой круг
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ color: 'white' }}>Кубик:</Typography>
              <Box sx={{ width: 40, height: 40, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {diceValue}
              </Box>
            </Box>
            <Button variant="contained" onClick={rollDice} disabled={isRolling || isMoving} sx={{
              background: isRolling || isMoving ? 'linear-gradient(45deg, #9CA3AF, #6B7280)' : 'linear-gradient(45deg, #8B5CF6, #06B6D4)'
            }}>
              {isRolling ? 'Бросаю...' : isMoving ? 'Фишка движется...' : 'Бросить кубик'}
            </Button>
          </Box>
        </Box>

        {/* Big circle info */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, p: 2, background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.2))', borderRadius: 2, border: '1px solid rgba(34,197,94,0.3)' }}>
          <Box>
            <Typography variant="h6" sx={{ color: '#22C55E', fontWeight: 'bold' }}>💰 Баланс: ${playerMoney.toLocaleString()}</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(34,197,94,0.8)' }}>📈 Пассивный доход: ${bigCirclePassiveIncome.toLocaleString()}/ход</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(34,197,94,0.8)' }}>🏢 Бизнесов: 0</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(34,197,94,0.8)' }}>🌟 Мечт: 0</Typography>
          </Box>
        </Box>

        {/* Board visual (placeholder square with cells) */}
        <Box sx={{ position: 'relative', width: 800, height: 800, borderRadius: 4, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.01) 100%)', border: '2px solid rgba(139,92,246,0.3)', mx: 'auto' }}>
          <Box sx={{ position: 'absolute', top: 50, left: 50, width: 700, height: 700, border: '2px dashed rgba(139,92,246,0.6)'}} />
          {/* Simple ring of sample cells */}
          {Array.from({ length: 24 }).map((_, i) => (
            <Box key={i} sx={{ position: 'absolute', top: 60 + (i<6?0:i<12?((i-6)*110):i<18?660:((23-i)*110)), left: 60 + (i<6?(i*110):i<12?660:i<18?((17-i)*110):0), width: 100, height: 100, bgcolor: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>
              Клетка {i+1}
            </Box>
          ))}
        </Box>

        <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
          <Alert severity={toast.severity || 'info'}>{toast.message}</Alert>
        </Snackbar>

        <CellPopup open={showCellPopup} onClose={() => setShowCellPopup(false)} cell={selectedCell} />
      </Box>
    </Fragment>
  );
};

export default OriginalGameBoard;
