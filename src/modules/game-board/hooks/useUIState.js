import { useState, useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

export const useUIState = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Состояние мобильного меню
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Состояние модальных окон
  const [showProfessionModal, setShowProfessionModal] = useState(false);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showCellPopup, setShowCellPopup] = useState(false);
  const [showFreeCardsModal, setShowFreeCardsModal] = useState(false);

  // Выбранные данные для модальных окон
  const [selectedProfession, setSelectedProfession] = useState(null);
  const [selectedMarketCard, setSelectedMarketCard] = useState(null);
  const [selectedExpenseCard, setSelectedExpenseCard] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  // Состояние уведомлений
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(false);

  // Состояние для кредитов
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditModalFromDeal, setCreditModalFromDeal] = useState(false);

  // Состояние для быстрых платежей
  const [showQuickPayoffModal, setShowQuickPayoffModal] = useState(false);
  const [quickPayoffAmount, setQuickPayoffAmount] = useState(0);

  // Функции для управления модальными окнами
  const openProfessionModal = (profession) => {
    setSelectedProfession(profession);
    setShowProfessionModal(true);
  };

  const closeProfessionModal = () => {
    setShowProfessionModal(false);
    setSelectedProfession(null);
  };

  const openMarketModal = (card) => {
    setSelectedMarketCard(card);
    setShowMarketModal(true);
  };

  const closeMarketModal = () => {
    setShowMarketModal(false);
    setSelectedMarketCard(null);
  };

  const openExpenseModal = (card) => {
    setSelectedExpenseCard(card);
    setShowExpenseModal(true);
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
    setSelectedExpenseCard(null);
  };

  const openBreakModal = () => {
    setShowBreakModal(true);
  };

  const closeBreakModal = () => {
    setShowBreakModal(false);
  };

  const openBankModal = () => {
    setShowBankModal(true);
  };

  const closeBankModal = () => {
    setShowBankModal(false);
  };

  const openCellPopup = (cell) => {
    setSelectedCell(cell);
    setShowCellPopup(true);
  };

  const closeCellPopup = () => {
    setShowCellPopup(false);
    setSelectedCell(null);
  };

  const openFreeCardsModal = () => {
    setShowFreeCardsModal(true);
  };

  const closeFreeCardsModal = () => {
    setShowFreeCardsModal(false);
  };

  // Функции для управления уведомлениями
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const hideSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Функции для управления кредитами
  const openCreditModal = (amount = 0, fromDeal = false) => {
    setCreditAmount(amount);
    setCreditModalFromDeal(fromDeal);
    setShowCreditModal(true);
  };

  const closeCreditModal = () => {
    setShowCreditModal(false);
    setCreditAmount(0);
    setCreditModalFromDeal(false);
  };

  // Функции для быстрых платежей
  const openQuickPayoffModal = (amount = 0) => {
    setQuickPayoffAmount(amount);
    setShowQuickPayoffModal(true);
  };

  const closeQuickPayoffModal = () => {
    setShowQuickPayoffModal(false);
    setQuickPayoffAmount(0);
  };

  return {
    isMobile,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    showProfessionModal,
    showMarketModal,
    showExpenseModal,
    showBreakModal,
    showBankModal,
    showCellPopup,
    showFreeCardsModal,
    selectedProfession,
    selectedMarketCard,
    selectedExpenseCard,
    selectedCell,
    snackbar,
    isLoading,
    showCreditModal,
    creditAmount,
    creditModalFromDeal,
    showQuickPayoffModal,
    quickPayoffAmount,
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
    openFreeCardsModal,
    closeFreeCardsModal,
    showSnackbar,
    hideSnackbar,
    openCreditModal,
    closeCreditModal,
    openQuickPayoffModal,
    closeQuickPayoffModal,
    setIsLoading
  };
};
