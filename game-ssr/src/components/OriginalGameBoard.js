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
import { RAT_RACE_CELLS, getRatCell } from '../data/ratRaceCells';
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
  const { state: turnState, timeLeft, isRolling, isMoving, dice: diceValue, roll: rollDice, pass: passTurn, canPass } = useTurnState(120);
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
  const [childrenCount, setChildrenCount] = useState(0);
  const [monthlyChildExpense, setMonthlyChildExpense] = useState(0);
  const [assets, setAssets] = useState([]);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [dealChoice, setDealChoice] = useState(null); // 'small'|'big'
  const [currentDealCard, setCurrentDealCard] = useState(null);
  const [discardPile, setDiscardPile] = useState([]);

  const smallDeck = useRef([
    { id: 's1', name: 'Акции TechCo', cost: 1000, income: 50 },
    { id: 's2', name: 'Облигации City', cost: 2000, income: 110 },
    { id: 's3', name: 'Стартап доля', cost: 3000, income: 0 }
  ]);
  const bigDeck = useRef([
    { id: 'b1', name: 'Кофейня', cost: 10000, income: 700 },
    { id: 'b2', name: 'Квартира', cost: 40000, income: 700 },
    { id: 'b3', name: 'Франшиза', cost: 25000, income: 1200 }
  ]);

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

  // Open cell popup and handle landing rules
  useEffect(() => {
    if (turnState === 'rolled') {
      const newPos = (position + diceValue) % 24;
      setPosition(newPos);
      handleLanding(newPos);
    }
  }, [turnState, diceValue]);

  const getCashFlow = () => {
    const salary = playerData?.profession?.salary ?? 0;
    const passive = assets.reduce((s,a)=>s+(a.income||0),0);
    const baseExpenses = playerData?.profession?.totalExpenses ?? 0;
    const childExp = monthlyChildExpense;
    return salary + passive - (baseExpenses + childExp);
  };

  const handleLanding = (cellId) => {
    const cell = getRatCell(cellId);
    if (cell.type === 'payday') {
      const salary = playerData?.profession?.salary ?? 0;
      setPlayerMoney(prev => prev + salary);
      setToast({ open: true, severity: 'success', message: `💰 PAYDAY: +$${salary.toLocaleString()}` });
      return;
    }
    if (cell.type === 'child') {
      const childDice = Math.floor(Math.random()*6)+1;
      if (childDice <= 4) {
        setChildrenCount(c=>c+1);
        setMonthlyChildExpense(e=>e+500); // по описанию $500/мес
        setPlayerMoney(prev => prev + 5000);
        setToast({ open: true, severity: 'success', message: `👶 Ребёнок родился! +$5,000 (кубик ${childDice})` });
      } else {
        setToast({ open: true, severity: 'info', message: `👶 Ребёнок не родился (кубик ${childDice})` });
      }
      return;
    }
    if (cell.type === 'opportunity') {
      setDealDialogOpen(true);
      return;
    }
    if (cell.type === 'doodad') {
      const amount = Math.floor(100 + Math.random()*3900);
      setPlayerMoney(prev => Math.max(0, prev - amount));
      setToast({ open: true, severity: 'warning', message: `🧾 Всякая всячина: -$${amount.toLocaleString()}` });
      return;
    }
    if (cell.type === 'market') {
      // простой stub события рынка
      setToast({ open: true, severity: 'info', message: '🏪 Рынок: изменения цен активов' });
      return;
    }
    if (cell.type === 'charity') {
      setCharityOpen(true);
      return;
    }
    if (cell.type === 'loss') {
      const salary = playerData?.profession?.salary ?? 0;
      const loss = Math.round((playerData?.profession?.totalExpenses ?? 0) * 1);
      const amount = Math.max(loss, Math.floor(salary/2));
      setPlayerMoney(prev => Math.max(0, prev - amount));
      setToast({ open: true, severity: 'error', message: `⚫ Потеря: -$${amount.toLocaleString()}` });
      return;
    }
    // Default popup
    setSelectedCell({ id: cellId, name: cell?.name || `Клетка ${cellId}`, description: cell?.type });
    setShowCellPopup(true);
  };

  const drawDeal = (type) => {
    const deck = type==='small' ? smallDeck.current : bigDeck.current;
    if (deck.length === 0) {
      if (discardPile.length) {
        const shuffled = [...discardPile].sort(()=>Math.random()-0.5);
        if (type==='small') smallDeck.current = shuffled;
        else bigDeck.current = shuffled;
        setDiscardPile([]);
      } else {
        setToast({ open: true, severity: 'warning', message: '❌ Колода пуста' });
        return null;
      }
    }
    const card = deck.shift();
    return card;
  };

  const purchaseDeal = (card) => {
    if (!card) return;
    if (playerMoney < card.cost) {
      setToast({ open: true, severity: 'error', message: 'Недостаточно денег для покупки' });
      return;
    }
    if (assets.find(a=>a.name===card.name)) {
      setToast({ open: true, severity: 'info', message: 'Карточка уже у вас' });
      return;
    }
    setPlayerMoney(prev=>prev-card.cost);
    setAssets(prev=>[...prev, card]);
    setToast({ open: true, severity: 'success', message: `✅ Куплено: ${card.name}` });
    setCurrentDealCard(null);
  };

  const cancelDeal = (card) => {
    if (!card) return;
    setDiscardPile(prev=>[card, ...prev]);
    setCurrentDealCard(null);
  };

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

        {/* Info bar removed per request */}

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
              const info = getRatCell(k);
              cells.push(
                <Box key={`inner-${k}`} sx={{ position: 'absolute', left: x, top: y, width: innerCell, height: innerCell, background: info.type==='loss' ? '#111' : info.color, border: '2px solid rgba(255,255,255,0.25)', borderRadius: '16px', boxShadow: '0 12px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: info.type==='loss' ? '#fff' : '#fff', fontWeight: 'bold', fontSize: 14 }}>
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

            // Player tokens
            const tokenRadius = ringRadius + 2; // чуть поверх клетки
            gamePlayers.forEach((p, idx) => {
              const pPos = (p.position ?? (idx*2)) % 24; // если нет позиций — разнести
              const a = (Math.PI * 2 * pPos) / 24 - Math.PI / 2 + (idx*0.12);
              const tx = center.x + Math.cos(a) * tokenRadius - 12;
              const ty = center.y + Math.sin(a) * tokenRadius - 12;
              cells.push(
                <Box key={`token-${p.socketId||p.id||idx}`} sx={{ position: 'absolute', left: tx, top: ty, width: 24, height: 24, background: p.color || '#FF5722', border: '2px solid #fff', borderRadius: '50%', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
              );
            });

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
              {assets.length===0 ? (
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Пока пусто</Typography>
              ) : assets.map(a => (
                <Typography key={a.id} sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>• {a.name} — доход ${a.income}/мес</Typography>
              ))}
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>Активность</Typography>
              <Button fullWidth variant="contained" onClick={() => {
                if (turnState === 'yourTurn') rollDice();
                else if (turnState === 'rolled' && canPass) passTurn();
              }}
              disabled={turnState === 'waitingOther' || isRolling || isMoving || (turnState==='rolled' && !canPass)}
              sx={{ background: turnState === 'yourTurn' ? 'linear-gradient(45deg, #8B5CF6, #06B6D4)' : (turnState === 'rolled' ? 'linear-gradient(45deg, #22C55E, #16A34A)' : 'linear-gradient(45deg, #6B7280, #4B5563)') }}>
                {turnState === 'yourTurn' ? '🎲 Бросить кубик' : turnState === 'rolled' ? (canPass ? '⏭️ Передать ход' : '⏳ Ждите...') : '⏳ Ожидание хода'}
              </Button>
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={((120 - timeLeft) / 120) * 100} sx={{ height: 8, borderRadius: 1, '& .MuiLinearProgress-bar': { backgroundColor: timeLeft>60 ? '#22C55E' : (timeLeft>20 ? '#EAB308' : '#EF4444') } }} />
                <Typography sx={{ color: timeLeft>60 ? '#22C55E' : (timeLeft>20 ? '#EAB308' : '#EF4444'), fontSize: 12, mt: 0.5 }}>Таймер: {timeLeft}s</Typography>
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
  const [position, setPosition] = useState(0); // 0..23
          <DialogActions>
            <Button onClick={() => setShowProfession(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>
        {/* Charity dialog */}
        <Dialog open={!!charityOpen} onClose={()=>setCharityOpen(false)}>
          <DialogTitle>Благотворительность</DialogTitle>
          <DialogContent>
            {(()=>{ const amount = Math.floor((playerData?.profession?.salary ?? 0 + assets.reduce((s,a)=>s+(a.income||0),0))*0.1); return (
              <Typography>Пожертвовать 10% от дохода: ${amount.toLocaleString()}</Typography>
            );})()}
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setCharityOpen(false)}>Отмена</Button>
            <Button variant="contained" onClick={()=>{ const amount = Math.floor((playerData?.profession?.salary ?? 0 + assets.reduce((s,a)=>s+(a.income||0),0))*0.1); setPlayerMoney(p=>Math.max(0,p-amount)); setToast({open:true,severity:'info',message:`❤️ Благотворительность: -$${amount.toLocaleString()}`}); setCharityOpen(false); }}>Пожертвовать</Button>
          </DialogActions>
        </Dialog>
        {/* Deal dialogs */}
        <Dialog open={dealDialogOpen} onClose={()=>setDealDialogOpen(false)}>
          <DialogTitle>Выберите тип сделки</DialogTitle>
          <DialogActions>
            <Button onClick={()=>{ setDealDialogOpen(false); const c = drawDeal('small'); setCurrentDealCard(c); }}>Малая</Button>
            <Button onClick={()=>{ setDealDialogOpen(false); const c = drawDeal('big'); setCurrentDealCard(c); }}>Большая</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={!!currentDealCard} onClose={()=>{ cancelDeal(currentDealCard); }}>
          <DialogTitle>{currentDealCard?.name}</DialogTitle>
          <DialogContent>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Цена: ${currentDealCard?.cost?.toLocaleString()} | Доход: ${currentDealCard?.income?.toLocaleString()}/мес</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>cancelDeal(currentDealCard)}>Отмена</Button>
            <Button variant="contained" onClick={()=>purchaseDeal(currentDealCard)}>Купить</Button>
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
