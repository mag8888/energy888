import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, useMediaQuery, useTheme, Card, CardContent, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { AccountBalance, TrendingUp, TrendingDown, CreditCard, AttachMoney } from '@mui/icons-material';
import BankModal from './BankModal';

const BankModule = ({
  playerData,
  gamePlayers,
  socket,
  bankBalance,
  playerCredit = 0,
  getMaxCredit = () => 0,
  getCashFlow = () => 0,
  setShowCreditModal = () => {},
  roomId,
  onBankBalanceChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showBankModal, setShowBankModal] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

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

  useEffect(() => {
    const currentPlayer = getCurrentPlayer();
    let balance = 0;
    if (currentPlayer?.balance !== undefined && currentPlayer.balance !== null) balance = Number(currentPlayer.balance);
    else if (bankBalance !== undefined && bankBalance !== null && bankBalance > 0) balance = Number(bankBalance);
    else if (playerData?.profession?.balance !== undefined) balance = Number(playerData.profession.balance);
    else balance = getInitialBalance();
    if (balance !== currentBalance) {
      setCurrentBalance(balance);
      if (onBankBalanceChange) onBankBalanceChange(balance);
    }
  }, [gamePlayers, playerData?.profession?.balance, bankBalance, getCurrentPlayer, getInitialBalance, currentBalance, onBankBalanceChange]);

  const handleBankBalanceChange = useCallback((newBalance) => {
    setCurrentBalance(newBalance);
    if (onBankBalanceChange) onBankBalanceChange(newBalance);
  }, [onBankBalanceChange]);

  const financialInfo = {
    salary: playerData?.profession?.salary ?? 0,
    totalExpenses: playerData?.profession?.totalExpenses ?? 0
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(16, 185, 129, 0.3)' },
        '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #10B981, #059669, #10B981)', animation: 'shimmer 2s infinite' }
      }} onClick={() => setShowBankModal(true)}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalance sx={{ color: '#10B981', fontSize: '1.5rem' }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>Банк</Typography>
            </Box>
            <Chip label="Активен" size="small" sx={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981', fontWeight: 'bold', fontSize: '0.7rem' }} />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ color: '#10B981', fontWeight: 'bold', textShadow: '0 0 10px rgba(16, 185, 129, 0.3)', mb: 0.5 }}>
              {(currentBalance ?? 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.8rem' }}>Доступно для операций</Typography>
          </Box>

          <Box sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp sx={{ color: '#10B981', fontSize: '1rem' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>Доход:</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.8rem' }}>{(financialInfo.salary ?? 0).toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingDown sx={{ color: '#EF4444', fontSize: '1rem' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>Расходы:</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.8rem' }}>{(financialInfo.totalExpenses ?? 0).toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AttachMoney sx={{ color: '#EAB308', fontSize: '1rem' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>PAYDAY:</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#EAB308', fontWeight: 'bold', fontSize: '0.8rem' }}>{(getCashFlow() ?? 0).toLocaleString()}/мес</Typography>
            </Box>
          </Box>

          <Box sx={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', p: 2, border: `1px solid ${playerCredit > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CreditCard sx={{ color: playerCredit > 0 ? '#EF4444' : '#10B981', fontSize: '1rem' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>Кредит:</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: playerCredit > 0 ? '#EF4444' : '#10B981', fontWeight: 'bold', fontSize: '0.8rem' }}>{(playerCredit ?? 0).toLocaleString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>Макс. кредит:</Typography>
              <Typography variant="body2" sx={{ color: '#8B5CF6', fontWeight: 'bold', fontSize: '0.8rem' }}>{(getMaxCredit() ?? 0).toLocaleString()}</Typography>
            </Box>
            <Box sx={{ background: playerCredit > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', p: 1, textAlign: 'center', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: playerCredit > 0 ? '#EF4444' : '#10B981', fontSize: '0.7rem', fontWeight: 'bold' }}>
                {playerCredit > 0 ? '💳 Есть кредит' : '✅ Без кредитов'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" size="small" onClick={(e) => { e.stopPropagation(); setShowCreditModal(true); }}
                sx={{ flex: 1, background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white', fontWeight: 'bold', py: 0.5, borderRadius: '8px', fontSize: '0.7rem', textTransform: 'none' }}>💳 Взять</Button>
              {playerCredit > 0 && (
                <Button variant="contained" size="small" onClick={(e) => { e.stopPropagation(); setShowCreditModal(true); }}
                  sx={{ flex: 1, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: 'white', fontWeight: 'bold', py: 0.5, borderRadius: '8px', fontSize: '0.7rem', textTransform: 'none' }}>💰 Погасить</Button>
              )}
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2, opacity: 0.6 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Нажмите для открытия банковских операций</Typography>
          </Box>
        </CardContent>
      </Card>

      <BankModal isOpen={showBankModal} onClose={() => setShowBankModal(false)} playerData={playerData} gamePlayers={gamePlayers} socket={socket} roomId={roomId} bankBalance={currentBalance} onBankBalanceChange={handleBankBalanceChange} />
    </motion.div>
  );
};

export default BankModule;

