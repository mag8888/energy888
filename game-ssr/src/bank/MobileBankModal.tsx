import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Chip, 
  IconButton, 
  Alert, 
  Snackbar, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemSecondaryAction,
  Divider,
  Avatar,
  Fab,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  InputAdornment
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Close as CloseIcon, 
  AccountBalance, 
  Send, 
  History, 
  CheckCircle, 
  Error, 
  TrendingUp, 
  TrendingDown, 
  AccountBalanceWallet, 
  CreditCard, 
  AttachMoney, 
  Schedule, 
  ShoppingCart, 
  VolunteerActivism,
  ArrowBack,
  Add,
  Remove,
  SwapHoriz,
  Receipt
} from '@mui/icons-material';

interface MobileBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerData: any;
  gamePlayers: any[];
  socket: any;
  roomId: string;
  bankBalance: number;
  onBankBalanceChange: (balance: number) => void;
}

const MobileBankModal: React.FC<MobileBankModalProps> = ({ 
  isOpen, 
  onClose, 
  playerData, 
  gamePlayers = [], 
  socket, 
  roomId, 
  bankBalance: externalBankBalance = 0, 
  onBankBalanceChange 
}) => {
  const [currentView, setCurrentView] = useState<'main' | 'transfer' | 'history' | 'credit'>('main');
  const [bankBalance, setBankBalance] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConnected, setIsConnected] = useState(socket?.connected || false);
  const [creditAmount, setCreditAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  const getCurrentPlayer = useCallback(() => {
    if (!gamePlayers || !Array.isArray(gamePlayers) || !playerData?.id) return null;
    let player = gamePlayers.find(p => p.id === playerData.id || p.userId === playerData.id);
    if (!player && playerData?.username) player = gamePlayers.find(p => p.username === playerData.username);
    return player;
  }, [gamePlayers, playerData?.id, playerData?.username]);

  const getRecipients = useCallback(() => {
    if (!gamePlayers || !Array.isArray(gamePlayers) || !playerData?.id) return [];
    return gamePlayers.filter(player => 
      (player.id !== playerData.id && player.userId !== playerData.id) && 
      player.username && 
      player.username.trim() !== ''
    );
  }, [gamePlayers, playerData?.id]);

  const saveTransactionHistory = useCallback((history: any[]) => {
    try {
      if (playerData?.id && roomId) {
        localStorage.setItem(`bank_history_${playerData.id}_${roomId}`, JSON.stringify(history));
      }
    } catch {}
  }, [playerData?.id, roomId]);

  const handleTransfer = useCallback(async () => {
    if (!transferAmount || !selectedRecipient || isTransferring) return;
    const amount = parseFloat(transferAmount);
    if (amount <= 0) { setError('Сумма должна быть больше нуля'); return; }
    const currentPlayer = getCurrentPlayer();
    const actualBalance = currentPlayer?.balance !== undefined ? currentPlayer.balance : (bankBalance || 0);
    if (amount > actualBalance) { 
      setError(`Недостаточно средств. Доступно: $${actualBalance.toLocaleString()}`); 
      return; 
    }
    const recipients = getRecipients();
    const recipient = recipients.find(p => p.username === selectedRecipient);
    if (!recipient) { setError('Получатель не найден'); return; }

    setIsTransferring(true);
    setError('');

    try {
      const transaction = { 
        id: `transfer_${Date.now()}`, 
        type: 'transfer', 
        amount, 
        description: `Перевод игроку ${selectedRecipient}`, 
        timestamp: new Date().toLocaleString('ru-RU'), 
        from: currentPlayer?.username || playerData?.username || 'Игрок', 
        to: selectedRecipient, 
        status: 'pending', 
        balanceAfter: (bankBalance || 0) - amount 
      };
      const updatedHistory = [transaction, ...transferHistory];
      setTransferHistory(updatedHistory);
      saveTransactionHistory(updatedHistory);

      if (socket && roomId) {
        socket.emit('bankTransfer', { 
          roomId, 
          playerId: currentPlayer?.id || currentPlayer?.userId || playerData?.id, 
          socketId: socket.id, 
          username: currentPlayer?.username || playerData?.username, 
          recipient: selectedRecipient, 
          amount, 
          currentBalance: actualBalance, 
          transactionId: transaction.id 
        });
      }

      setTransferAmount('');
      setSelectedRecipient('');
      setSuccess(`Перевод $${amount.toLocaleString()} отправлен!`);
      setCurrentView('main');
    } catch (e) {
      setError('Ошибка при переводе средств');
      setTransferHistory(prev => prev.filter(t => t.status !== 'pending'));
    } finally {
      setIsTransferring(false);
    }
  }, [transferAmount, selectedRecipient, isTransferring, bankBalance, getRecipients, getCurrentPlayer, playerData?.username, transferHistory, saveTransactionHistory, socket, roomId, playerData?.id]);

  const handleTakeCredit = useCallback(() => {
    const amount = parseFloat(creditAmount);
    if (amount <= 0) { setError('Сумма должна быть больше нуля'); return; }
    if (amount > 10000) { setError('Максимальная сумма кредита: $10,000'); return; }
    
    const newBalance = bankBalance + amount;
    setBankBalance(newBalance);
    onBankBalanceChange?.(newBalance);
    
    const transaction = {
      id: `credit_${Date.now()}`,
      type: 'credit',
      amount,
      description: `Взят кредит $${amount.toLocaleString()}`,
      timestamp: new Date().toLocaleString('ru-RU'),
      status: 'completed',
      balanceAfter: newBalance
    };
    
    const updatedHistory = [transaction, ...transferHistory];
    setTransferHistory(updatedHistory);
    saveTransactionHistory(updatedHistory);
    
    setCreditAmount('');
    setSuccess(`Кредит $${amount.toLocaleString()} получен!`);
    setCurrentView('main');
  }, [creditAmount, bankBalance, onBankBalanceChange, transferHistory, saveTransactionHistory]);

  const handleRepayCredit = useCallback(() => {
    const amount = parseFloat(repayAmount);
    if (amount <= 0) { setError('Сумма должна быть больше нуля'); return; }
    if (amount > bankBalance) { setError('Недостаточно средств для погашения'); return; }
    
    const newBalance = bankBalance - amount;
    setBankBalance(newBalance);
    onBankBalanceChange?.(newBalance);
    
    const transaction = {
      id: `repay_${Date.now()}`,
      type: 'repay',
      amount,
      description: `Погашение кредита $${amount.toLocaleString()}`,
      timestamp: new Date().toLocaleString('ru-RU'),
      status: 'completed',
      balanceAfter: newBalance
    };
    
    const updatedHistory = [transaction, ...transferHistory];
    setTransferHistory(updatedHistory);
    saveTransactionHistory(updatedHistory);
    
    setRepayAmount('');
    setSuccess(`Кредит погашен на $${amount.toLocaleString()}!`);
    setCurrentView('main');
  }, [repayAmount, bankBalance, onBankBalanceChange, transferHistory, saveTransactionHistory]);

  useEffect(() => {
    if (!isOpen) return;
    const currentPlayer = getCurrentPlayer();
    let balanceToSet = 0;
    if (currentPlayer?.balance !== undefined && currentPlayer.balance !== null) balanceToSet = Number(currentPlayer.balance);
    else if (externalBankBalance !== undefined && externalBankBalance !== null && externalBankBalance > 0) balanceToSet = Number(externalBankBalance);
    else balanceToSet = 3000;
    setBankBalance(balanceToSet);
    if (onBankBalanceChange && balanceToSet !== bankBalance) onBankBalanceChange(balanceToSet);

    try {
      if (playerData?.id && roomId) {
        const saved = localStorage.getItem(`bank_history_${playerData.id}_${roomId}`);
        if (saved) setTransferHistory(JSON.parse(saved));
      }
    } catch {}
  }, [isOpen, externalBankBalance, onBankBalanceChange, bankBalance, getCurrentPlayer, playerData?.id, roomId]);

  const recipients = getRecipients();

  const renderMainView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        p: 3, 
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', transform: 'translate(50%, -50%)' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Банк
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            ${(bankBalance || 0).toLocaleString()}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Доступно для операций
          </Typography>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'white', fontWeight: 'bold' }}>
          Быстрые операции
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.02)' }
          }} onClick={() => setCurrentView('transfer')}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <Send sx={{ fontSize: 40, color: 'white', mb: 1 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Перевод
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.02)' }
          }} onClick={() => setCurrentView('history')}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <History sx={{ fontSize: 40, color: 'white', mb: 1 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                История
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.02)' }
          }} onClick={() => setCurrentView('credit')}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <CreditCard sx={{ fontSize: 40, color: 'white', mb: 1 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Кредит
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.02)' }
          }}>
            <CardContent sx={{ textAlign: 'center', p: 2 }}>
              <AccountBalanceWallet sx={{ fontSize: 40, color: 'white', mb: 1 }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                Счета
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Financial Summary */}
        <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
              Финансовое состояние
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Доход:</Typography>
              <Typography variant="body2" sx={{ color: '#4ade80', fontWeight: 'bold' }}>
                ${(playerData?.profession?.salary || 0).toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Расходы:</Typography>
              <Typography variant="body2" sx={{ color: '#f87171', fontWeight: 'bold' }}>
                ${(playerData?.profession?.totalExpenses || 0).toLocaleString()}
              </Typography>
            </Box>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Чистый доход:</Typography>
              <Typography variant="body2" sx={{ color: '#fbbf24', fontWeight: 'bold' }}>
                ${((playerData?.profession?.salary || 0) - (playerData?.profession?.totalExpenses || 0)).toLocaleString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );

  const renderTransferView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
        p: 3, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <IconButton onClick={() => setCurrentView('main')} sx={{ color: 'white' }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Перевод денег
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
              Сумма перевода
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Введите сумму"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#4facfe' }
                }
              }}
            />

            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
              Получатель
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Выберите игрока</InputLabel>
              <Select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                sx={{ 
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4facfe' }
                }}
              >
                {recipients.map(recipient => (
                  <MenuItem key={recipient.username} value={recipient.username}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: recipient.color || '#666' }}>
                        {recipient.username[0]}
                      </Avatar>
                      {recipient.username}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              onClick={handleTransfer}
              disabled={isTransferring || !transferAmount || !selectedRecipient}
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              {isTransferring ? 'Отправка...' : 'Отправить перевод'}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );

  const renderHistoryView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 
        p: 3, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <IconButton onClick={() => setCurrentView('main')} sx={{ color: 'white' }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          История операций
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            {transferHistory.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Receipt sx={{ fontSize: 60, color: 'rgba(255,255,255,0.5)', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Нет операций
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Ваши транзакции появятся здесь
                </Typography>
              </Box>
            ) : (
              <List>
                {transferHistory.map((transaction, index) => (
                  <ListItem key={transaction.id} sx={{ 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    mb: 1, 
                    borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <ListItemIcon>
                      {transaction.type === 'transfer' ? (
                        <Send sx={{ color: transaction.status === 'completed' ? '#4ade80' : '#fbbf24' }} />
                      ) : transaction.type === 'credit' ? (
                        <Add sx={{ color: '#4ade80' }} />
                      ) : (
                        <Remove sx={{ color: '#f87171' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={transaction.description}
                      secondary={`${transaction.timestamp} — $${transaction.amount.toLocaleString()}`}
                      primaryTypographyProps={{ color: 'white', fontWeight: 'bold' }}
                      secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        size="small" 
                        label={transaction.status === 'completed' ? 'OK' : 'PENDING'} 
                        color={transaction.status === 'completed' ? 'success' : 'warning'}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );

  const renderCreditView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
        p: 3, 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <IconButton onClick={() => setCurrentView('main')} sx={{ color: 'white' }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Кредитные операции
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Take Credit */}
        <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
              Взять кредит
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="Сумма кредита (макс. $10,000)"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#fa709a' }
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleTakeCredit}
              disabled={!creditAmount}
              sx={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Получить кредит
            </Button>
          </CardContent>
        </Card>

        {/* Repay Credit */}
        <Card sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
              Погасить кредит
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={repayAmount}
              onChange={(e) => setRepayAmount(e.target.value)}
              placeholder="Сумма погашения"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#fa709a' }
                }
              }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleRepayCredit}
              disabled={!repayAmount}
              sx={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              Погасить кредит
            </Button>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      fullScreen
      PaperProps={{ 
        sx: { 
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#ffffff'
        } 
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          {currentView === 'main' && renderMainView()}
          {currentView === 'transfer' && renderTransferView()}
          {currentView === 'history' && renderHistoryView()}
          {currentView === 'credit' && renderCreditView()}
        </AnimatePresence>

        {/* Bottom Navigation */}
        <Paper sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: 'rgba(0,0,0,0.8)', 
          backdropFilter: 'blur(10px)',
          zIndex: 1000
        }}>
          <BottomNavigation
            value={currentView}
            onChange={(event, newValue) => setCurrentView(newValue)}
            sx={{ background: 'transparent' }}
          >
            <BottomNavigationAction
              label="Главная"
              value="main"
              icon={<AccountBalance />}
              sx={{ color: 'white' }}
            />
            <BottomNavigationAction
              label="Перевод"
              value="transfer"
              icon={<Send />}
              sx={{ color: 'white' }}
            />
            <BottomNavigationAction
              label="История"
              value="history"
              icon={<History />}
              sx={{ color: 'white' }}
            />
            <BottomNavigationAction
              label="Кредит"
              value="credit"
              icon={<CreditCard />}
              sx={{ color: 'white' }}
            />
          </BottomNavigation>
        </Paper>

        {/* Close Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            background: 'rgba(0,0,0,0.5)',
            '&:hover': { background: 'rgba(0,0,0,0.7)' }
          }}
          onClick={onClose}
        >
          <CloseIcon />
        </Fab>

        {/* Notifications */}
        <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
          <Alert severity="error" sx={{ background: 'rgba(239, 68, 68, 0.9)', color: 'white' }}>
            {error}
          </Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
          <Alert severity="success" sx={{ background: 'rgba(16, 185, 129, 0.9)', color: 'white' }}>
            {success}
          </Alert>
        </Snackbar>
      </DialogContent>
    </Dialog>
  );
};

export default MobileBankModal;
