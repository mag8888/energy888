import React, { useState, useEffect, Fragment, useRef } from 'react';
import socket from '../lib/socket';
import { Box, Typography, Button, Avatar, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, List, ListItem, ListItemText, Divider, LinearProgress, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import ProfessionDetails from './ProfessionDetails';
import MarketCardModal from './MarketCardModal';
import ExpenseCardModal from './ExpenseCardModal';
import BreakModal from './BreakModal';
import BankModule from '../bank/BankModule';
import CellPopup from './CellPopup';
import { MarketDeckManager, checkPlayerHasMatchingAsset } from '../data/marketCards';
import { ExpenseDeckManager } from '../data/expenseCards';
import { CELL_CONFIG } from '../data/gameCells';
import useTurnState from '../lib/useTurnState';
import { BOARD_SIZE, OUTER_PADDING, OUTER_CELL, OUTER_STEPS, INNER_RING_RADIUS, INNER_CELL, ACTION_CARD_OFFSETS } from '../styles/boardLayout';
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
  const { state: turnState, timeLeft, isRolling, isMoving, dice: diceValue, roll: rollDice, pass: passTurn } = useTurnState(30);
  const [showCellPopup, setShowCellPopup] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isOnBigCircle] = useState(true);
  const [bigCirclePassiveIncome] = useState(0);
  const [bigCircleBalance] = useState(0);
  const [playerCredit, setPlayerCredit] = useState(0);
  const [dealDeck] = useState([]);
  const [scale, setScale] = useState(1);
  const [showProfession, setShowProfession] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => { setCurrentTurn(gamePlayers[currentPlayer]?.username || 'Игрок'); }, [currentPlayer, gamePlayers]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      if (w < 900) {
        const s = Math.max(0.55, (w - 32) / 800);
        setScale(s);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Join socket room to enable server features
  useEffect(() => {
    try {
      if (roomId && playerData?.id && playerData?.username && (socket && typeof socket.emit === 'function')) {
        socket.emit('joinRoom', roomId, { id: playerData.id, username: playerData.username, balance: playerMoney });
      }
    } catch {}
  }, [roomId, playerData?.id, playerData?.username]);

  // open cell popup when rolled
  useEffect(() => {
    if (turnState === 'rolled') {
      setSelectedCell({ id: diceValue, name: 'Секция', description: 'Описание клетки' });
      setShowCellPopup(true);
    }
  }, [turnState, diceValue]);

  return (
    <Fragment>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
        p: { xs: 1.5, md: 2 },
        display: 'flex',
        gap: 2,
        flexDirection: { xs: 'column', md: 'row' }
      }}>

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

        {/* Board + Right panel */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ position: 'relative', width: BOARD_SIZE, height: BOARD_SIZE, transform: `scale(${scale})`, transformOrigin: 'top left', borderRadius: 4, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.01) 100%)', border: '2px solid rgba(139,92,246,0.3)' }}>
          {(() => {
            const cells = [];
            const boardSize = BOARD_SIZE;
            const squareLeft = OUTER_PADDING; // outer square inside the board
            const squareTop = OUTER_PADDING;
            const squareSize = BOARD_SIZE - OUTER_PADDING * 2;
            const cell = OUTER_CELL; // size of outer small cells
            const step = (squareSize - cell) / OUTER_STEPS;

            // TOP row (13)
            for (let i = 0; i <= 12; i++) {
              cells.push(
                <Box key={`t-${i}`} sx={{ position: 'absolute', left: squareLeft + i * step, top: squareTop, width: cell, height: cell, background: 'linear-gradient(180deg, #21C1D6 0%, #1AA1B4 100%)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', boxShadow: '0 3px 10px rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#04233B', fontWeight: 'bold', fontSize: 12 }}>
                  {i + 1}
                </Box>
              );
            }
            // RIGHT column (12 without corners)
            for (let i = 1; i <= 12; i++) {
              cells.push(
                <Box key={`r-${i}`} sx={{ position: 'absolute', left: squareLeft + squareSize - cell, top: squareTop + i * step, width: cell, height: cell, background: 'linear-gradient(180deg, #21C1D6 0%, #1AA1B4 100%)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', boxShadow: '0 3px 10px rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#04233B', fontWeight: 'bold', fontSize: 12 }}>
                  {13 + i}
                </Box>
              );
            }
            // BOTTOM row (13)
            for (let i = 0; i <= 12; i++) {
              cells.push(
                <Box key={`b-${i}`} sx={{ position: 'absolute', left: squareLeft + (12 - i) * step, top: squareTop + squareSize - cell, width: cell, height: cell, background: 'linear-gradient(180deg, #21C1D6 0%, #1AA1B4 100%)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', boxShadow: '0 3px 10px rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#04233B', fontWeight: 'bold', fontSize: 12 }}>
                  {26 + i}
                </Box>
              );
            }
            // LEFT column (12 without corners)
            for (let i = 1; i <= 12; i++) {
              cells.push(
                <Box key={`l-${i}`} sx={{ position: 'absolute', left: squareLeft, top: squareTop + (12 - i) * step, width: cell, height: cell, background: 'linear-gradient(180deg, #21C1D6 0%, #1AA1B4 100%)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', boxShadow: '0 3px 10px rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#04233B', fontWeight: 'bold', fontSize: 12 }}>
                  {39 + i}
                </Box>
              );
            }

            // Inner ring of 24 purple cells
            const center = { x: boardSize / 2, y: boardSize / 2 };
            const ringRadius = INNER_RING_RADIUS; // distance from center
            const innerCell = INNER_CELL;
            for (let k = 0; k < 24; k++) {
              const angle = (Math.PI * 2 * k) / 24 - Math.PI / 2; // start at top
              const x = center.x + Math.cos(angle) * ringRadius - innerCell / 2;
              const y = center.y + Math.sin(angle) * ringRadius - innerCell / 2;
              cells.push(
                <Box key={`inner-${k}`} sx={{ position: 'absolute', left: x, top: y, width: innerCell, height: innerCell, background: 'linear-gradient(180deg, #9B5CF6 0%, #7C3AED 100%)', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '16px', boxShadow: '0 12px 30px rgba(124,58,237,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                  {k + 1}
                </Box>
              );
            }

            // Center circle with logo and $ roll button
            cells.push(
              <Box key="center" sx={{ position: 'absolute', left: center.x - 120, top: center.y - 120, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #A855F7, #7C3AED)', border: '3px solid rgba(255,255,255,0.25)', boxShadow: '0 25px 60px rgba(124,58,237,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 3px 10px rgba(0,0,0,0.4)' }}>ЦЕНТР</Typography>
                <Button onClick={rollDice} disabled={turnState !== 'yourTurn' || isRolling || isMoving} sx={{ mt: 1, background: 'linear-gradient(45deg, #22C55E, #16A34A)', color: 'white', fontWeight: 'bold', borderRadius: '999px', px: 2, py: 0.5, '&:hover': { background: 'linear-gradient(45deg, #16A34A, #15803D)' } }}>
                  $ Бросить
                </Button>
              </Box>
            );

            // Four action cards placed between outer square and inner ring
            const card = (key, label, colorFrom, colorTo, dx, dy) => (
              <motion.div key={key} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
                style={{ position: 'absolute', left: center.x + dx, top: center.y + dy, transform: 'translate(-50%, -50%)' }}>
                <Box sx={{ width: 110, height: 130, background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)`, borderRadius: '18px', border: '2px solid rgba(255,255,255,0.35)', boxShadow: `0 12px 38px ${colorFrom}55, 0 0 20px rgba(239, 68, 68, 0.2)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Typography variant="h4" sx={{ color: 'white', mb: 1, fontSize: '24px' }}>💠</Typography>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '12px', lineHeight: 1.2 }}>
                    {label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'white', fontSize: '10px', mt: 0.5, opacity: 0.9 }}>0 карт</Typography>
                </Box>
              </motion.div>
            );

            // Offsets tuned to sit between the outer square and inner ring
            cells.push(card('big', 'Большая сделка', '#00BCD4', '#0097A7', ACTION_CARD_OFFSETS.big.dx, ACTION_CARD_OFFSETS.big.dy));
            cells.push(card('small', 'Малая сделка', '#3B82F6', '#2563EB', ACTION_CARD_OFFSETS.small.dx, ACTION_CARD_OFFSETS.small.dy));
            cells.push(card('expenses', 'Расходы', '#EF4444', '#DC2626', ACTION_CARD_OFFSETS.expenses.dx, ACTION_CARD_OFFSETS.expenses.dy));
            cells.push(card('market', 'Рынок', '#F59E0B', '#D97706', ACTION_CARD_OFFSETS.market.dx, ACTION_CARD_OFFSETS.market.dy));

            return cells;
          })()}
          </Box>

          {/* Right side panel */}
          <Box sx={{ width: { xs: '100%', md: 300 }, mt: { xs: 2, md: 0 } }}>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>Игроки</Typography>
              <List dense>
                {gamePlayers.map((p, idx) => (
                  <ListItem key={p.id} button onClick={() => { setSelectedPlayer(p); setShowProfession(true); }} sx={{ borderRadius: 1, mb: 0.5, bgcolor: 'rgba(148,163,184,0.1)' }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: p.color, mr: 1 }}>{p.username?.[0] || '?'}</Avatar>
                    <ListItemText primaryTypographyProps={{ sx: { color: 'white', fontSize: 14 } }} primary={`${idx + 1}. ${p.username}`} secondary={p.profession?.name || 'Без профессии'} secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} />
                  </ListItem>
                ))}
              </List>
            </Paper>

            <BankModule
              playerData={{ ...playerData, balance: playerMoney }}
              gamePlayers={gamePlayers}
              socket={socket}
              bankBalance={playerMoney}
              playerCredit={playerCredit}
              getMaxCredit={() => 10000}
              getCashFlow={() => 0}
              setShowCreditModal={() => {}}
              roomId={roomId}
              onBankBalanceChange={(nb) => setPlayerMoney(nb)}
            />

            <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>Активы</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Пока пусто</Typography>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>Активность</Typography>
              <Button fullWidth variant="contained" onClick={() => {
                if (turnState === 'yourTurn') rollDice();
                else if (turnState === 'rolled') passTurn();
              }}
              disabled={turnState === 'waitingOther' || isRolling || isMoving}
              sx={{ background: turnState === 'yourTurn' ? 'linear-gradient(45deg, #8B5CF6, #06B6D4)' : (turnState === 'rolled' ? 'linear-gradient(45deg, #22C55E, #16A34A)' : 'linear-gradient(45deg, #6B7280, #4B5563)') }}>
                {turnState === 'yourTurn' ? '🎲 Бросить кубик' : turnState === 'rolled' ? '⏭️ Передать ход' : '⏳ Ожидание хода'}
              </Button>
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={((30 - timeLeft) / 30) * 100} sx={{ height: 8, borderRadius: 1 }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, mt: 0.5 }}>Таймер: {timeLeft}s</Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
          <Alert severity={toast.severity || 'info'}>{toast.message}</Alert>
        </Snackbar>

        <CellPopup open={showCellPopup} onClose={() => setShowCellPopup(false)} cell={selectedCell} />
        <Dialog open={showProfession} onClose={() => setShowProfession(false)} fullWidth maxWidth="sm">
          <DialogTitle>Профессия игрока</DialogTitle>
          <DialogContent>
            <ProfessionDetails profession={selectedPlayer?.profession} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowProfession(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>
        {/* Debug footer in one line at page bottom */}
        <Box sx={{ mt: 2, p: 1, color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace', fontSize: 12, borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
          DEBUG: OriginalGameBoard standalone | dice: {diceValue} | state: {turnState} | time: {timeLeft}s
        </Box>
      </Box>
    </Fragment>
  );
};

export default OriginalGameBoard;
