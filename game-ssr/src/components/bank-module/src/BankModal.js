import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
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
  useMediaQuery,
  useTheme,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import { motion } from 'framer-motion';
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
  VolunteerActivism
} from '@mui/icons-material';

const BankModal = ({ 
  isOpen, 
  onClose, 
  playerData, 
  gamePlayers = [], 
  socket, 
  roomId,
  bankBalance: externalBankBalance = 0,
  onBankBalanceChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Состояние банковских операций
  const [bankBalance, setBankBalance] = useState(0);
  const [transferAmount, setTransferAmount] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [transferHistory, setTransferHistory] = useState([]);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isConnected, setIsConnected] = useState(socket?.connected || false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Состояние кредитной системы
  const [currentCredit, setCurrentCredit] = useState(0);
  const [creditAmount, setCreditAmount] = useState('');
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [isProcessingCredit, setIsProcessingCredit] = useState(false);

  // Добавление CSS анимации shimmer
  useEffect(() => {
    const shimmerStyle = `
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = shimmerStyle;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Эффект инициализации компонента
  useEffect(() => {
    if (playerData && gamePlayers) {
      setIsInitialized(true);
    }
  }, [playerData, gamePlayers]);

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
    }
    
    return player;
  }, [gamePlayers, playerData?.id, playerData?.username]);

  // Расчет денежного потока (доход - расходы - кредитные платежи)
  const calculateCashFlow = useCallback(() => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return 0;
    
    const income = currentPlayer.income || 1200; // Доход по умолчанию
    const expenses = currentPlayer.expenses || 800; // Расходы по умолчанию
    const creditPayments = currentCredit * 0.1; // 10% от кредита как ежемесячный платеж
    
    return income - expenses - creditPayments;
  }, [getCurrentPlayer, currentCredit]);

  // Расчет максимального кредита (денежный поток * 10)
  const getMaxCreditAmount = useCallback(() => {
    const cashFlow = calculateCashFlow();
    return Math.max(0, Math.floor(cashFlow / 100) * 1000); // Кратно 1000
  }, [calculateCashFlow]);

  // Обработка взятия кредита
  const handleTakeCredit = useCallback(() => {
    const amount = parseInt(creditAmount);
    if (!amount || amount <= 0 || amount % 1000 !== 0) {
      setError('Сумма кредита должна быть кратной 1000');
      return;
    }
    
    const maxCredit = getMaxCreditAmount();
    if (amount > maxCredit) {
      setError(`Максимальный кредит: $${maxCredit.toLocaleString()}`);
      return;
    }
    
    setIsProcessingCredit(true);
    
    // Эмулируем взятие кредита
    setTimeout(() => {
      setCurrentCredit(prev => prev + amount);
      setBankBalance(prev => prev + amount);
      
      // Добавляем в историю
      const newTransaction = {
        id: Date.now().toString(),
        type: 'credit',
        amount: amount,
        description: `Взят кредит на $${amount.toLocaleString()}`,
        timestamp: new Date().toISOString(),
        from: 'Банк',
        to: playerData?.username || 'Игрок',
        status: 'completed',
        balanceAfter: bankBalance + amount
      };
      
      setTransferHistory(prev => [newTransaction, ...prev]);
      setSuccess(`Кредит на $${amount.toLocaleString()} успешно взят`);
      setCreditAmount('');
      setShowCreditModal(false);
      setIsProcessingCredit(false);
      
      if (onBankBalanceChange) {
        onBankBalanceChange(bankBalance + amount);
      }
    }, 1000);
  }, [creditAmount, getMaxCreditAmount, bankBalance, playerData?.username, onBankBalanceChange]);

  // Обработка погашения кредита
  const handleRepayCredit = useCallback((amount) => {
    if (amount > currentCredit) {
      setError('Нельзя погасить больше, чем взято в кредит');
      return;
    }
    
    if (amount > bankBalance) {
      setError('Недостаточно средств для погашения');
      return;
    }
    
    setIsProcessingCredit(true);
    
    // Эмулируем погашение кредита
    setTimeout(() => {
      setCurrentCredit(prev => prev - amount);
      setBankBalance(prev => prev - amount);
      
      // Добавляем в историю
      const newTransaction = {
        id: Date.now().toString(),
        type: 'credit',
        amount: -amount,
        description: `Погашен кредит на $${amount.toLocaleString()}`,
        timestamp: new Date().toISOString(),
        from: playerData?.username || 'Игрок',
        to: 'Банк',
        status: 'completed',
        balanceAfter: bankBalance - amount
      };
      
      setTransferHistory(prev => [newTransaction, ...prev]);
      setSuccess(`Кредит на $${amount.toLocaleString()} успешно погашен`);
      setIsProcessingCredit(false);
      
      if (onBankBalanceChange) {
        onBankBalanceChange(bankBalance - amount);
      }
    }, 1000);
  }, [currentCredit, bankBalance, playerData?.username, onBankBalanceChange]);

  // Получение начального баланса из профессии
  const getInitialBalance = useCallback(() => {
    const currentPlayer = getCurrentPlayer ? getCurrentPlayer() : null;
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
  }, [getCurrentPlayer, playerData?.profession, playerData?.id]);

  // Получение списка получателей (все игроки кроме текущего)
  const getRecipients = useCallback(() => {
    if (!gamePlayers || !Array.isArray(gamePlayers) || !playerData?.id) {
      return [];
    }
    return gamePlayers.filter(player => 
      (player.id !== playerData.id && player.userId !== playerData.id) && 
      player.username && 
      player.username.trim() !== ''
    );
  }, [gamePlayers, playerData?.id]);

  // Сохранение истории транзакций в localStorage
  const saveTransactionHistory = useCallback((history) => {
    try {
      if (playerData?.id && roomId) {
        localStorage.setItem(`bank_history_${playerData.id}_${roomId}`, JSON.stringify(history));
        console.log('💾 [BankModal] История сохранена:', history.length, 'записей для пользователя', playerData.id);
      }
    } catch (error) {
      console.error('❌ [BankModal] Ошибка сохранения истории:', error);
    }
  }, [playerData?.id, roomId]);

  // Сброс формы перевода
  const resetTransferForm = useCallback(() => {
    setTransferAmount('');
    setSelectedRecipient('');
    setError('');
  }, []);

  // Обработка перевода средств
  const handleTransfer = useCallback(async () => {
    if (!transferAmount || !selectedRecipient || isTransferring) return;
    
    // Проверяем соединение с сервером
    if (!socket || !socket.connected) {
      setError('Нет соединения с сервером. Попробуйте позже.');
      return;
    }
    
    const amount = parseFloat(transferAmount);
    if (amount <= 0) {
      setError('Сумма должна быть больше нуля');
      return;
    }
    
    // Проверяем баланс - используем реальный баланс игрока, если доступен
    const currentPlayer = getCurrentPlayer ? getCurrentPlayer() : null;
    const actualBalance = currentPlayer?.balance !== undefined ? currentPlayer.balance : (bankBalance || 0);
    
    // Временная отладка для исправления ошибки перевода
    console.log('🔍 [BankModal] Проверка баланса для перевода:', {
      amount: parseFloat(transferAmount),
      currentPlayerBalance: currentPlayer?.balance,
      bankBalance: bankBalance,
      actualBalance: actualBalance,
      hasEnoughFunds: parseFloat(transferAmount) <= actualBalance,
      playerData: currentPlayer ? {
        id: currentPlayer.id,
        userId: currentPlayer.userId,
        username: currentPlayer.username,
        balance: currentPlayer.balance
      } : null
    });
    
    if (amount > actualBalance) {
      setError(`Недостаточно средств на счету. Доступно: $${actualBalance.toLocaleString()}`);
      return;
    }

    const recipients = getRecipients ? getRecipients() : [];
    const recipient = recipients.find(p => p.username === selectedRecipient);
    if (!recipient) {
      setError('Получатель не найден');
      return;
    }

    setIsTransferring(true);
    setError('');

    try {
      // Перевод начат
      
      // Создаем транзакцию
      const transaction = {
        id: `transfer_${Date.now()}`,
        type: 'transfer',
        amount: amount,
        description: `Перевод игроку ${selectedRecipient}`,
        timestamp: new Date().toLocaleString('ru-RU'),
        from: (getCurrentPlayer ? getCurrentPlayer() : null)?.username || playerData?.username || 'Игрок',
        to: selectedRecipient,
        status: 'pending',
        balanceAfter: (bankBalance || 0) - amount
      };

      // Добавляем транзакцию в историю
      const updatedHistory = [transaction, ...transferHistory];
      setTransferHistory(updatedHistory);
      if (saveTransactionHistory) {
        saveTransactionHistory(updatedHistory);
      }

      // Отправляем на сервер (если есть WebSocket)
      if (socket && roomId) {
        const currentPlayer = getCurrentPlayer ? getCurrentPlayer() : null;
        
        console.log('📤 [BankModal] Отправляем на сервер:', {
          amount: amount,
          currentBalance: actualBalance,
          calculation: `${actualBalance} - ${amount} = ${actualBalance - amount}`,
          recipient: selectedRecipient
        });
        
        // ПРОВЕРКА ФОРМУЛЫ НА КЛИЕНТЕ
        console.log('🧮 [BankModal] Формула баланса (клиент):', {
          формула: 'старый_баланс - сумма_перевода = новый_баланс',
          старый_баланс: actualBalance,
          сумма_перевода: amount,
          новый_баланс: actualBalance - amount,
          проверка: `${actualBalance} - ${amount} = ${actualBalance - amount}`,
          корректно: (actualBalance - amount) === (actualBalance - amount)
        });
        
        socket.emit('bankTransfer', {
          roomId,
          playerId: currentPlayer?.id || currentPlayer?.userId || playerData?.id, // Используем user ID
          socketId: socket.id, // Добавляем socket ID для совместимости
          username: currentPlayer?.username || playerData?.username, // Добавляем username
          recipient: selectedRecipient,
          amount: amount,
          currentBalance: actualBalance, // Отправляем текущий баланс для проверки
          transactionId: transaction.id
        });
      }

      // Очищаем форму
      setTransferAmount('');
      setSelectedRecipient('');

    } catch (error) {
      console.error('❌ [BankModal] Ошибка при переводе:', error);
      setError('Ошибка при переводе средств');
      
      // Удаляем pending транзакцию из истории
      setTransferHistory(prev => prev.filter(t => t.status !== 'pending'));
    } finally {
      setIsTransferring(false);
    }
  }, [transferAmount, selectedRecipient, isTransferring, bankBalance, getRecipients, getCurrentPlayer, playerData?.username, transferHistory, saveTransactionHistory, socket, roomId, playerData?.id]);

  // Инициализация банковского баланса и истории транзакций
  useEffect(() => {
    if (!isOpen || !isInitialized) return;

    // Приоритет источников данных:
    // 1. Реальный баланс игрока (если доступен)
    // 2. Внешний баланс (bankBalance prop)
    // 3. Начальный баланс из профессии
    const currentPlayer = getCurrentPlayer ? getCurrentPlayer() : null;
    let balanceToSet = 0;
    
    if (currentPlayer?.balance !== undefined && currentPlayer.balance !== null) {
      balanceToSet = Number(currentPlayer.balance);
    } else if (externalBankBalance !== undefined && externalBankBalance !== null && externalBankBalance > 0) {
      balanceToSet = Number(externalBankBalance);
    } else {
      balanceToSet = getInitialBalance ? getInitialBalance() : 3000;
    }
    
    // Устанавливаем баланс
    setBankBalance(balanceToSet);
    
    // Уведомляем родительский компонент только если баланс изменился
    if (onBankBalanceChange && balanceToSet !== bankBalance) {
      onBankBalanceChange(balanceToSet);
    }
    
    // Загружаем историю транзакций из localStorage
    let history = [];
    if (playerData?.id && roomId) {
      const savedHistory = localStorage.getItem(`bank_history_${playerData.id}_${roomId}`);
      
      if (savedHistory) {
        try {
          history = JSON.parse(savedHistory);
          console.log('📜 [BankModal] Загружена история транзакций:', history.length, 'записей для пользователя', playerData.id);
        } catch (error) {
          console.error('❌ [BankModal] Ошибка загрузки истории:', error);
          history = [];
        }
      }
    }
    
    // Если истории нет, создаем начальную транзакцию
    if (history.length === 0 && balanceToSet > 0) {
      const initialTransaction = {
        id: `initial_${Date.now()}`,
        type: 'initial',
        amount: balanceToSet,
        description: 'Начальный баланс профессии',
        timestamp: new Date().toLocaleString('ru-RU'),
        from: 'Банк',
        to: (getCurrentPlayer ? getCurrentPlayer() : null)?.username || playerData?.username || 'Игрок',
        status: 'completed',
        balanceAfter: balanceToSet
      };
      
      history = [initialTransaction];
      console.log('🆕 [BankModal] Создана начальная транзакция:', initialTransaction);
    }
    
    setTransferHistory(history);
    
    // Сохраняем историю в localStorage
    if (playerData?.id && roomId) {
      localStorage.setItem(`bank_history_${playerData.id}_${roomId}`, JSON.stringify(history));
    }
    
  }, [isOpen, isInitialized, getInitialBalance, onBankBalanceChange, playerData?.id, roomId, getCurrentPlayer, externalBankBalance, bankBalance]);

  // Синхронизация с внешним балансом и реальным балансом игрока
  useEffect(() => {
    if (!isInitialized) return;
    const currentPlayer = getCurrentPlayer ? getCurrentPlayer() : null;
    
    // Синхронизируем с реальным балансом игрока (приоритет)
    if (currentPlayer?.balance !== undefined && currentPlayer.balance !== bankBalance) {
      // Синхронизация с реальным балансом игрока
      setBankBalance(currentPlayer.balance);
      return; // Не проверяем внешний баланс, если есть реальный баланс игрока
    }
    
    // Только если нет реального баланса игрока, используем внешний баланс
    if (externalBankBalance !== undefined && externalBankBalance !== bankBalance && 
        (currentPlayer?.balance === undefined || currentPlayer.balance === null)) {
      // Синхронизация с внешним балансом
      setBankBalance(externalBankBalance);
    }
  }, [isInitialized, externalBankBalance, bankBalance, getCurrentPlayer, playerData?.id]);

  // Обработчики socket событий для банковских операций
  useEffect(() => {
    if (!socket || !isOpen || !isInitialized) return;
    
    // Обработка разрыва соединения
    const handleDisconnect = () => {
      console.log('🔌 [BankModal] WebSocket disconnected');
      setIsConnected(false);
      setError('Соединение с сервером потеряно. Попробуйте позже.');
    };
    
    const handleConnect = () => {
      console.log('🔌 [BankModal] WebSocket connected');
      setIsConnected(true);
      setError(''); // Очищаем ошибку при восстановлении соединения
    };

    // Обработка успешного перевода
    const handleBankTransferSuccess = (data) => {
      console.log('✅ [BankModal] Перевод успешен:', data);
      setSuccess(data.message);
      
      // Обновляем баланс если пришел новый
      if (data.newBalance !== undefined) {
        setBankBalance(data.newBalance);
        if (onBankBalanceChange) {
          onBankBalanceChange(data.newBalance);
        }
        
        // Обновляем последнюю транзакцию в истории
        setTransferHistory(prev => prev.map(t => 
          t.status === 'pending' ? { ...t, status: 'completed', balanceAfter: data.newBalance } : t
        ));
      }
    };

    // Обработка ошибки перевода
    const handleBankTransferError = (data) => {
      console.error('❌ [BankModal] Ошибка перевода:', data);
      setError(data.message);
      
      // Удаляем pending транзакцию из истории
      setTransferHistory(prev => prev.filter(t => t.status !== 'pending'));
    };

    // Обработка получения перевода от другого игрока
    const handleBankTransferReceived = (data) => {
      console.log('💰 [BankModal] Получен перевод:', data);
      
      // Добавляем транзакцию о получении
      const receivedTransaction = {
        id: `received_${Date.now()}`,
        type: 'received',
        amount: data.amount,
        description: `Перевод от ${data.fromPlayer}`,
        timestamp: new Date().toLocaleString('ru-RU'),
        from: data.fromPlayer,
        to: (getCurrentPlayer ? getCurrentPlayer() : null)?.username || playerData?.username || 'Игрок',
        status: 'completed',
        balanceAfter: (bankBalance || 0) + data.amount
      };

      // Обновляем баланс
      const newBalance = (bankBalance || 0) + data.amount;
      setBankBalance(newBalance);
      
      if (onBankBalanceChange) {
        onBankBalanceChange(newBalance);
      }

      // Добавляем в историю
      const updatedHistory = [receivedTransaction, ...transferHistory];
      setTransferHistory(updatedHistory);
      if (saveTransactionHistory) {
        saveTransactionHistory(updatedHistory);
      }

      setSuccess(`Получен перевод $${data.amount.toLocaleString()} от ${data.fromPlayer}!`);
    };

    // Подписываемся на события
    socket.on('bankTransferSuccess', handleBankTransferSuccess);
    socket.on('bankTransferError', handleBankTransferError);
    socket.on('bankTransferReceived', handleBankTransferReceived);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleConnect);

    // Очистка при размонтировании
    return () => {
      socket.off('bankTransferSuccess', handleBankTransferSuccess);
      socket.off('bankTransferError', handleBankTransferError);
      socket.off('bankTransferReceived', handleBankTransferReceived);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleConnect);
    };
  }, [socket, isOpen, isInitialized, bankBalance, onBankBalanceChange, transferHistory, saveTransactionHistory, getCurrentPlayer, playerData?.username, playerData?.id]);

  // Получение иконки для типа транзакции
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'initial': return <AccountBalanceWallet />;
      case 'transfer': return <Send />;
      case 'received': return <AttachMoney />;
      case 'expense': return <ShoppingCart />;
      case 'credit': return <AccountBalance />;
      case 'payday': return <AttachMoney />;
      case 'charity': return <VolunteerActivism />;
      default: return <CreditCard />;
    }
  };

  // Получение цвета для типа транзакции
  const getTransactionColor = (type, amount) => {
    if (type === 'initial' || type === 'received' || type === 'credit' || type === 'payday') {
      return '#10B981'; // Зеленый для поступлений
    }
    if (type === 'expense') {
      return '#F59E0B'; // Оранжевый для расходов
    }
    if (type === 'charity') {
      return '#EC4899'; // Розовый для благотворительности
    }
    return '#EF4444'; // Красный для переводов
  };

  // Получение знака для суммы
  const getAmountSign = (type) => {
    return type === 'initial' || type === 'received' || type === 'credit' || type === 'payday' ? '+' : '-';
  };

  // Статистика (мемоизированная)
  const { totalTransfers, totalTransferAmount, totalTransactions } = useMemo(() => {
    const transfers = transferHistory.filter(t => t.type === 'transfer');
    return {
      totalTransfers: transfers.length,
      totalTransferAmount: transfers.reduce((sum, t) => sum + t.amount, 0),
      totalTransactions: transferHistory.length
    };
  }, [transferHistory]);

  // Мемоизированный баланс
  const displayBalance = useMemo(() => {
    const currentPlayer = getCurrentPlayer ? getCurrentPlayer() : null;
    const actualBalance = currentPlayer?.balance !== undefined ? currentPlayer.balance : (bankBalance || 0);
    return actualBalance.toLocaleString();
  }, [getCurrentPlayer, bankBalance]);

  if (!isOpen || !isInitialized) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          borderRadius: '20px',
          overflow: 'hidden',
          minHeight: isMobile ? '100vh' : 'auto',
          maxHeight: isMobile ? '100vh' : '90vh',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
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
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 3,
        pt: 3,
        px: 3,
        background: 'transparent',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <AccountBalance sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold', 
            color: 'white',
            textShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
          }}>
            Банковские операции
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: 'white',
            background: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.2)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 3,
        background: 'transparent',
        borderRadius: '0 0 20px 20px'
      }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {/* Левая панель - Баланс и кредитная информация */}
          <Grid item xs={12} md={4} sx={{ height: '100%' }}>
            <Card sx={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                  <AccountBalance sx={{ color: '#4CAF50', mr: 1, fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', mr: 2 }}>
                    Банк
                  </Typography>
                  <Chip 
                    label="Активен" 
                    size="small" 
                    sx={{ 
                      background: '#4CAF50', 
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '10px'
                    }} 
                  />
                </Box>
                
                {/* Текущий баланс */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold', mb: 1 }}>
                    ${displayBalance}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Доступно для операций
                  </Typography>
                </Box>

                {/* Финансовая сводка */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp sx={{ color: '#4CAF50', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                      Доход: $10,000
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingDown sx={{ color: '#f44336', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#f44336' }}>
                      Расходы: $6,200
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney sx={{ color: '#FFC107', mr: 1 }} />
                    <Typography variant="body2" sx={{ color: '#FFC107' }}>
                      PAYDAY: $3,800/мес
                    </Typography>
                  </Box>
                </Box>

                {/* Кредитная информация */}
                <Box sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CreditCard sx={{ color: currentCredit > 0 ? '#f44336' : '#4CAF50', mr: 1, fontSize: 16 }} />
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Кредит: ${currentCredit.toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#9C27B0', mb: 1 }}>
                    Макс. кредит: ${getMaxCreditAmount().toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#FFC107', mb: 2, fontSize: '12px' }}>
                    Денежный поток: ${calculateCashFlow().toLocaleString()}/мес
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {currentCredit > 0 ? (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleRepayCredit(currentCredit)}
                        disabled={isProcessingCredit || bankBalance < currentCredit}
                        sx={{
                          background: '#4CAF50',
                          color: 'white',
                          flex: 1,
                          '&:hover': { background: '#45a049' },
                          '&:disabled': { background: 'rgba(255, 255, 255, 0.1)' }
                        }}
                      >
                        <CheckCircle sx={{ mr: 0.5, fontSize: 16 }} />
                        ПОГАСИТЬ
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        disabled
                        sx={{
                          background: '#4CAF50',
                          color: 'white',
                          flex: 1,
                          opacity: 0.7
                        }}
                      >
                        <CheckCircle sx={{ mr: 0.5, fontSize: 16 }} />
                        БЕЗ КРЕДИТОВ
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setShowCreditModal(true)}
                      disabled={isProcessingCredit || getMaxCreditAmount() <= 0}
                      sx={{
                        background: getMaxCreditAmount() > 0 ? '#f44336' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        flex: 1,
                        '&:hover': { background: getMaxCreditAmount() > 0 ? '#d32f2f' : 'rgba(255, 255, 255, 0.1)' },
                        '&:disabled': { background: 'rgba(255, 255, 255, 0.1)' }
                      }}
                    >
                      <CreditCard sx={{ mr: 0.5, fontSize: 16 }} />
                      ВЗЯТЬ
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Правая панель - Переводы и история */}
          <Grid item xs={12} md={8} sx={{ height: '100%' }}>
            <Grid container spacing={3} sx={{ height: '100%' }}>
              {/* Форма перевода */}
              <Grid item xs={12} sx={{ height: '50%' }}>
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
                      Перевод средств
                    </Typography>
                    <Grid container spacing={2} sx={{ flex: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Получатель
                          </InputLabel>
                          <Select
                            value={selectedRecipient}
                            onChange={(e) => setSelectedRecipient(e.target.value)}
                            sx={{
                              color: 'white',
                              borderRadius: '12px',
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.2)'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.4)'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#10B981',
                                borderWidth: '2px'
                              }
                            }}
                          >
                            {(getRecipients ? getRecipients() : []).map((player) => (
                              <MenuItem key={player.id || player.userId || player.socketId} value={player.username}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                                    {player.username.charAt(0).toUpperCase()}
                                  </Avatar>
                                  {player.username}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Сумма ($)"
                          type="number"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: 'white',
                              borderRadius: '12px',
                              '& fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.2)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255, 255, 255, 0.4)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#10B981',
                                borderWidth: '2px'
                              }
                            },
                            '& .MuiInputLabel-root': {
                              color: 'rgba(255, 255, 255, 0.7)'
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            onClick={handleTransfer}
                            disabled={!transferAmount || !selectedRecipient || isTransferring || parseFloat(transferAmount) <= 0 || !isConnected}
                            startIcon={<Send />}
                            sx={{
                              flex: 1,
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              color: 'white',
                              py: 1.5,
                              borderRadius: '12px',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                              fontWeight: 'bold',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                                transform: 'translateY(-2px)'
                              },
                              '&:disabled': {
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'rgba(255, 255, 255, 0.3)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {isTransferring ? 'Выполняется...' : 'Выполнить перевод'}
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={resetTransferForm || (() => {
                              setTransferAmount('');
                              setSelectedRecipient('');
                              setError('');
                            })}
                            sx={{
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              color: 'white',
                              py: 1.5,
                              borderRadius: '12px',
                              fontWeight: 'bold',
                              '&:hover': {
                                borderColor: '#10B981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                transform: 'translateY(-2px)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            Сбросить
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* История операций */}
              <Grid item xs={12} sx={{ height: '50%' }}>
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Schedule sx={{ color: '#8B5CF6' }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                        История операций
                      </Typography>
                      <Chip 
                        label={transferHistory.length} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#8B5CF6',
                          color: 'white',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                          '&:hover': {
                            backgroundColor: '#7C3AED',
                            boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)'
                          }
                        }} 
                      />
                    </Box>
                    
                    {transferHistory.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" sx={{ opacity: 0.7, color: '#94A3B8' }}>
                          История операций пуста
                        </Typography>
                      </Box>
                    ) : (
                      <List sx={{ flex: 1, overflow: 'auto' }}>
                        {transferHistory.map((transaction, index) => (
                          <React.Fragment key={transaction.id}>
                            <ListItem sx={{ 
                              py: 2,
                              backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                              borderRadius: 1,
                              mb: 1
                            }}>
                              <ListItemIcon>
                                <Box sx={{ 
                                  p: 1, 
                                  borderRadius: '50%', 
                                  backgroundColor: (getTransactionColor ? getTransactionColor(transaction.type, transaction.amount) : '#10B981') + '20',
                                  color: getTransactionColor ? getTransactionColor(transaction.type, transaction.amount) : '#10B981'
                                }}>
                                  {getTransactionIcon ? getTransactionIcon(transaction.type) : <CreditCard />}
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <Box component="span" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                      {transaction.description}
                                    </Box>
                                    <Box 
                                      component="span" 
                                      sx={{ 
                                        fontWeight: 'bold',
                                        fontSize: '1.25rem',
                                        color: getTransactionColor ? getTransactionColor(transaction.type, transaction.amount) : '#10B981'
                                      }}
                                    >
                                      {(getAmountSign ? getAmountSign(transaction.type) : '+')}${transaction.amount.toLocaleString()}
                                    </Box>
                                  </Box>
                                }
                                secondary={
                                  <Box component="span" sx={{ display: 'block' }}>
                                    <Box component="span" sx={{ opacity: 0.7, fontSize: '0.875rem', display: 'block' }}>
                                      {transaction.from} → {transaction.to}
                                    </Box>
                                    <Box component="span" sx={{ opacity: 0.5, fontSize: '0.875rem', display: 'block' }}>
                                      {transaction.timestamp}
                                    </Box>
                                  </Box>
                                }
                              />
                              <ListItemSecondaryAction>
                                <Chip
                                  label={transaction.status === 'completed' ? 'Завершено' : 'В процессе'}
                                  size="small"
                                  sx={{
                                    backgroundColor: transaction.status === 'completed' ? '#10B981' : '#F59E0B',
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </ListItemSecondaryAction>
                            </ListItem>
                            {index < transferHistory.length - 1 && <Divider sx={{ opacity: 0.1 }} />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      {/* Уведомления */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setError('')} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSuccess('')} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>

      {/* Модальное окно для выбора суммы кредита */}
      <Dialog
        open={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2,
          pt: 3,
          px: 3,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CreditCard sx={{ color: '#f44336', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white' }}>
              Взять кредит
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setShowCreditModal(false)} 
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
              Выберите сумму кредита (кратную 1000):
            </Typography>
            
            <TextField
              fullWidth
              label="Сумма кредита ($)"
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="Введите сумму, кратную 1000"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  borderRadius: '12px',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#f44336',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)'
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
              Максимальный кредит: <strong style={{ color: '#9C27B0' }}>${getMaxCreditAmount().toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
              Текущий денежный поток: <strong style={{ color: '#FFC107' }}>${calculateCashFlow().toLocaleString()}/мес</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Ежемесячный платеж: <strong style={{ color: '#f44336' }}>${creditAmount ? (parseInt(creditAmount) * 0.1).toLocaleString() : '0'}/мес</strong>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleTakeCredit}
              disabled={!creditAmount || isProcessingCredit || parseInt(creditAmount) % 1000 !== 0 || parseInt(creditAmount) > getMaxCreditAmount()}
              sx={{
                flex: 1,
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: 'white',
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)'
                },
                '&:disabled': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              {isProcessingCredit ? 'Обработка...' : 'Взять кредит'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setShowCreditModal(false)}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                py: 1.5,
                borderRadius: '12px',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#f44336',
                  backgroundColor: 'rgba(244, 67, 54, 0.1)'
                }
              }}
            >
              Отмена
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default BankModal;