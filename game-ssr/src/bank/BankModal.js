import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Chip, IconButton, useMediaQuery, useTheme, Alert, Snackbar, Card, CardContent, Grid, Divider, Avatar, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { motion } from 'framer-motion';
import { Close as CloseIcon, AccountBalance, Send, History, CheckCircle, Error, TrendingUp, TrendingDown, AccountBalanceWallet, CreditCard, AttachMoney, Schedule, ShoppingCart, VolunteerActivism } from '@mui/icons-material';

const BankModal = ({ isOpen, onClose, playerData, gamePlayers = [], socket, roomId, bankBalance: externalBankBalance = 0, onBankBalanceChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [bankBalance, setBankBalance] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [transferHistory, setTransferHistory] = useState([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConnected, setIsConnected] = useState(socket?.connected || false);

  const getCurrentPlayer = useCallback(() => {
    if (!gamePlayers || !Array.isArray(gamePlayers) || !playerData?.id) return null;
    let player = gamePlayers.find(p => p.id === playerData.id || p.userId === playerData.id);
    if (!player && playerData?.username) player = gamePlayers.find(p => p.username === playerData.username);
    return player;
  }, [gamePlayers, playerData?.id, playerData?.username]);

  const getInitialBalance = useCallback(() => {
    const currentPlayer = getCurrentPlayer();
    const profession = currentPlayer?.profession || playerData?.profession;
    if (profession?.balance !== undefined) return Number(profession.balance);
    return 3000;
  }, [getCurrentPlayer, playerData?.profession]);

  const getRecipients = useCallback(() => {
    if (!gamePlayers || !Array.isArray(gamePlayers) || !playerData?.id) return [];
    return gamePlayers.filter(player => (player.id !== playerData.id && player.userId !== playerData.id) && player.username && player.username.trim() !== '');
  }, [gamePlayers, playerData?.id]);

  const saveTransactionHistory = useCallback((history) => {
    try {
      if (playerData?.id && roomId) localStorage.setItem(`bank_history_${playerData.id}_${roomId}`, JSON.stringify(history));
    } catch {}
  }, [playerData?.id, roomId]);

  const handleTransfer = useCallback(async () => {
    if (!transferAmount || !selectedRecipient || isTransferring) return;
    const amount = parseFloat(transferAmount);
    if (amount <= 0) { setError('Сумма должна быть больше нуля'); return; }
    const currentPlayer = getCurrentPlayer ? getCurrentPlayer() : null;
    const actualBalance = currentPlayer?.balance !== undefined ? currentPlayer.balance : (bankBalance || 0);
    if (amount > actualBalance) { setError(`Недостаточно средств. Доступно: $${actualBalance.toLocaleString()}`); return; }
    const recipients = getRecipients ? getRecipients() : [];
    const recipient = recipients.find(p => p.username === selectedRecipient);
    if (!recipient) { setError('Получатель не найден'); return; }

    setIsTransferring(true);
    setError('');

    try {
      const transaction = { id: `transfer_${Date.now()}`, type: 'transfer', amount, description: `Перевод игроку ${selectedRecipient}`, timestamp: new Date().toLocaleString('ru-RU'), from: currentPlayer?.username || playerData?.username || 'Игрок', to: selectedRecipient, status: 'pending', balanceAfter: (bankBalance || 0) - amount };
      const updatedHistory = [transaction, ...transferHistory];
      setTransferHistory(updatedHistory);
      saveTransactionHistory(updatedHistory);

      if (socket && roomId) {
        socket.emit('bankTransfer', { roomId, playerId: currentPlayer?.id || currentPlayer?.userId || playerData?.id, socketId: socket.id, username: currentPlayer?.username || playerData?.username, recipient: selectedRecipient, amount, currentBalance: actualBalance, transactionId: transaction.id });
      }

      setTransferAmount('');
      setSelectedRecipient('');
    } catch (e) {
      setError('Ошибка при переводе средств');
      setTransferHistory(prev => prev.filter(t => t.status !== 'pending'));
    } finally {
      setIsTransferring(false);
    }
  }, [transferAmount, selectedRecipient, isTransferring, bankBalance, getRecipients, getCurrentPlayer, playerData?.username, transferHistory, saveTransactionHistory, socket, roomId, playerData?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const currentPlayer = getCurrentPlayer();
    let balanceToSet = 0;
    if (currentPlayer?.balance !== undefined && currentPlayer.balance !== null) balanceToSet = Number(currentPlayer.balance);
    else if (externalBankBalance !== undefined && externalBankBalance !== null && externalBankBalance > 0) balanceToSet = Number(externalBankBalance);
    else balanceToSet = getInitialBalance();
    setBankBalance(balanceToSet);
    if (onBankBalanceChange && balanceToSet !== bankBalance) onBankBalanceChange(balanceToSet);

    try {
      if (playerData?.id && roomId) {
        const saved = localStorage.getItem(`bank_history_${playerData.id}_${roomId}`);
        if (saved) setTransferHistory(JSON.parse(saved));
      }
    } catch {}
  }, [isOpen]);

  useEffect(() => {
    if (!socket || !isOpen) return;
    const handleDisconnect = () => { setIsConnected(false); setError('Соединение потеряно'); };
    const handleConnect = () => { setIsConnected(true); setError(''); };
    const handleBankTransferSuccess = (data) => {
      setSuccess(data.message);
      if (data.newBalance !== undefined) {
        setBankBalance(data.newBalance);
        onBankBalanceChange && onBankBalanceChange(data.newBalance);
        setTransferHistory(prev => prev.map(t => t.status === 'pending' ? { ...t, status: 'completed', balanceAfter: data.newBalance } : t));
      }
    };
    const handleBankTransferError = (data) => { setError(data.message); setTransferHistory(prev => prev.filter(t => t.status !== 'pending')); };
    const handleBankTransferReceived = (data) => {
      const receivedTransaction = { id: `received_${Date.now()}`, type: 'received', amount: data.amount, description: `Перевод от ${data.fromPlayer}`, timestamp: new Date().toLocaleString('ru-RU'), from: data.fromPlayer, to: getCurrentPlayer()?.username || playerData?.username || 'Игрок', status: 'completed', balanceAfter: (bankBalance || 0) + data.amount };
      const newBalance = (bankBalance || 0) + data.amount;
      setBankBalance(newBalance);
      onBankBalanceChange && onBankBalanceChange(newBalance);
      const updatedHistory = [receivedTransaction, ...transferHistory];
      setTransferHistory(updatedHistory);
      saveTransactionHistory(updatedHistory);
      setSuccess(`Получен перевод $${data.amount.toLocaleString()} от ${data.fromPlayer}!`);
    };
    socket.on('bankTransferSuccess', handleBankTransferSuccess);
    socket.on('bankTransferError', handleBankTransferError);
    socket.on('bankTransferReceived', handleBankTransferReceived);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleConnect);
    return () => {
      socket.off('bankTransferSuccess', handleBankTransferSuccess);
      socket.off('bankTransferError', handleBankTransferError);
      socket.off('bankTransferReceived', handleBankTransferReceived);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleConnect);
    };
  }, [socket, isOpen, bankBalance, onBankBalanceChange, transferHistory]);

  const recipients = getRecipients();

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#ffffff', borderRadius: 3, border: '1px solid rgba(74,144,226,0.5)' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance sx={{ color: '#4a90e2' }} />
          <Typography variant="h6">Банковские операции</Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon sx={{ color: 'white' }} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card sx={{ background: 'rgba(255,255,255,0.06)' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Текущий баланс</Typography>
                <Typography variant="h4" sx={{ color: '#10B981', fontWeight: 'bold' }}>{(bankBalance||0).toLocaleString()}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>Перевод денег</Typography>
                <TextField value={transferAmount} onChange={(e)=>setTransferAmount(e.target.value)} type="number" size="small" fullWidth placeholder="Сумма" sx={{ mb: 1 }} />
                <FormControl size="small" fullWidth sx={{ mb: 1 }}>
                  <InputLabel id="recipient">Получатель</InputLabel>
                  <Select labelId="recipient" value={selectedRecipient} label="Получатель" onChange={(e)=>setSelectedRecipient(e.target.value)}>
                    {recipients.map(r => <MenuItem key={r.username} value={r.username}>{r.username}</MenuItem>)}
                  </Select>
                </FormControl>
                <Button variant="contained" fullWidth onClick={handleTransfer} disabled={isTransferring}>
                  {isTransferring ? 'Отправка...' : 'Отправить'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ background: 'rgba(255,255,255,0.06)' }}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 1 }}>История</Typography>
                <List dense>
                  {transferHistory.map(t => (
                    <ListItem key={t.id} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 0.5, borderRadius: 1 }}>
                      <ListItemIcon>
                        <Send sx={{ color: t.status === 'completed' ? '#10B981' : '#EAB308' }} />
                      </ListItemIcon>
                      <ListItemText primary={`${t.description}`} secondary={`${t.timestamp} — $${t.amount.toLocaleString()}`} />
                      <ListItemSecondaryAction>
                        <Chip size="small" label={t.status === 'completed' ? 'OK' : 'PENDING'} color={t.status==='completed'?'success':'warning'} />
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Snackbar open={!!error} autoHideDuration={3000} onClose={()=>setError('')}><Alert severity="error">{error}</Alert></Snackbar>
        <Snackbar open={!!success} autoHideDuration={3000} onClose={()=>setSuccess('')}><Alert severity="success">{success}</Alert></Snackbar>
      </DialogContent>
    </Dialog>
  );
};

export default BankModal;

