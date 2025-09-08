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

        {/* Board visual (outer square, inner ring, center, and action cards inside) */}
        <Box sx={{ position: 'relative', width: 800, height: 800, borderRadius: 4, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.01) 100%)', border: '2px solid rgba(139,92,246,0.3)', mx: 'auto' }}>
          {(() => {
            const cells = [];
            const boardSize = 800;
            const squareLeft = 50; // outer square inside the board
            const squareTop = 50;
            const squareSize = 700;
            const cell = 48; // size of outer small cells
            const step = (squareSize - cell) / 12;

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
            const ringRadius = 225; // distance from center
            const innerCell = 68;
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

            // Center circle
            cells.push(
              <Box key="center" sx={{ position: 'absolute', left: center.x - 120, top: center.y - 120, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #A855F7, #7C3AED)', border: '3px solid rgba(255,255,255,0.25)', boxShadow: '0 25px 60px rgba(124,58,237,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>🎯 ЦЕНТР</Typography>
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
            cells.push(card('big', 'Большая сделка', '#00BCD4', '#0097A7', -210, -210));
            cells.push(card('small', 'Малая сделка', '#3B82F6', '#2563EB', 210, -210));
            cells.push(card('expenses', 'Расходы', '#EF4444', '#DC2626', -210, 210));
            cells.push(card('market', 'Рынок', '#F59E0B', '#D97706', 210, 210));

            return cells;
          })()}
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
