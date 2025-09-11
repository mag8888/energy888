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
  playerCredit,
  getMaxCredit,
  getCashFlow,
  setShowCreditModal,
  roomId,
  onBankBalanceChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showBankModal, setShowBankModal] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);

  // Получение текущего игрока по user ID (мемоизированное)
  const getCurrentPlayer = useCallback(() => {
    if (!gamePlayers || !Array.isArray(gamePlayers) || !playerData?.id) {
      return null;
    }
    
    // Ищем игрока по user ID (постоянный идентификатор)
    let player = gamePlayers.find(p => p.id === playerData.id || p.userId === playerData.id);
    
    // Fallback: если не найден по user ID, ищем по username (для совместимости со старыми данными)
    if (!player && playerData?.username) {
      player = gamePlayers.find(p => p.username === playerData.username);
      // Убираем избыточное логирование - только при первом успешном fallback
    }
    
    return player;
  }, [gamePlayers, playerData?.id, playerData?.username]);

  // Получение начального баланса из профессии
  const getInitialBalance = useCallback(() => {
    const currentPlayer = getCurrentPlayer();
    const profession = currentPlayer?.profession || playerData?.profession;
    
    if (profession?.balance !== undefined) {
      return Number(profession.balance);
    }
    
    // Fallback для разных профессий
    const professionBalances = {
      'Предприниматель': 3000,
      'Учитель': 2000,
      'Врач': 5000,
      'Инженер': 4000,
      'Юрист': 6000
    };
    
    return professionBalances[profession?.name] || 3000;
  }, [getCurrentPlayer, playerData?.profession]);

  // Обновление баланса
  useEffect(() => {
    const currentPlayer = getCurrentPlayer();
    let balance = 0;

    // Приоритет источников данных:
    // 1. gamePlayers balance (актуальный баланс игрока) - ВЫСШИЙ ПРИОРИТЕТ
    // 2. bankBalance prop (внешний баланс)
    // 3. playerData profession balance (баланс из профессии)
    // 4. Начальный баланс из профессии
    
    console.log('🔍 [BankModule] Источники баланса:', {
      currentPlayerBalance: currentPlayer?.balance,
      bankBalanceProp: bankBalance,
      professionBalance: playerData?.profession?.balance,
      initialBalance: getInitialBalance(),
      currentPlayer: currentPlayer
    });
    
    if (currentPlayer?.balance !== undefined && currentPlayer.balance !== null) {
      balance = Number(currentPlayer.balance);
      console.log('✅ [BankModule] Используем баланс из gamePlayers:', balance);
    } else if (bankBalance !== undefined && bankBalance !== null && bankBalance > 0) {
      balance = Number(bankBalance);
      console.log('✅ [BankModule] Используем внешний баланс:', balance);
    } else if (playerData?.profession?.balance !== undefined && playerData.profession.balance !== null) {
      balance = Number(playerData.profession.balance);
      console.log('✅ [BankModule] Используем баланс из профессии:', balance);
    } else {
      balance = getInitialBalance();
      console.log('✅ [BankModule] Используем начальный баланс:', balance);
    }

    // Обновляем баланс только если он действительно изменился
    if (balance !== currentBalance) {
      setCurrentBalance(balance);
      // Логируем только при реальном изменении баланса
      console.log('🏦 [BankModule] Баланс изменен:', {
        userId: playerData?.id,
        username: playerData?.username,
        newBalance: balance,
        previousBalance: currentBalance,
        source: currentPlayer?.balance !== undefined ? 'player' : 
                bankBalance > 0 ? 'external' : 'initial'
      });
    }
  }, [gamePlayers, playerData?.profession?.balance, bankBalance, getCurrentPlayer, getInitialBalance, currentBalance]);

  // Обработка изменения баланса
  const handleBankBalanceChange = useCallback((newBalance) => {
    console.log('🔄 [BankModule] Получено изменение баланса:', newBalance);
    setCurrentBalance(newBalance);
    
    // Уведомляем родительский компонент
    if (onBankBalanceChange) {
      onBankBalanceChange(newBalance);
    }
  }, [onBankBalanceChange]);

  // Получение информации о доходах и расходах
  const getFinancialInfo = useCallback(() => {
    const currentPlayer = getCurrentPlayer();
    const profession = currentPlayer?.profession || playerData?.profession;
    
    if (profession) {
      return {
        salary: profession.salary ?? 0,
        totalExpenses: profession.totalExpenses ?? 0
      };
    }
    
    return { salary: 0, totalExpenses: 0 };
  }, [getCurrentPlayer, playerData?.profession]);

  const financialInfo = getFinancialInfo();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <Button
        variant="contained"
        onClick={() => {
          console.log('🏦 [BankModule] Кнопка банка нажата, текущий баланс:', currentBalance);
          setShowBankModal(true);
        }}
        sx={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          p: 3,
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          width: '100%',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)'
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #10B981, #059669, #10B981)',
            animation: 'shimmer 2s infinite'
          }
        }}
      >
        {/* Заголовок */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance sx={{ color: '#10B981', fontSize: '1.5rem' }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Банк
          </Typography>
          <Chip 
            label="Активен" 
            size="small" 
            sx={{ 
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: '#10B981',
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }} 
          />
        </Box>
        
        {/* Основной баланс */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant={isMobile ? "h4" : "h3"} sx={{ 
            color: '#10B981', 
            fontWeight: 'bold',
            textShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
            mb: 0.5
          }}>
            ${(currentBalance ?? 0).toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '0.8rem',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>
            Нажмите для открытия банковских операций
          </Typography>
        </Box>
      </Button>
      
      {/* Банковский модал */}
      <BankModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        playerData={playerData}
        gamePlayers={gamePlayers}
        socket={socket}
        roomId={roomId}
        bankBalance={currentBalance}
        onBankBalanceChange={handleBankBalanceChange}
      />
    </motion.div>
  );
};

export default BankModule;