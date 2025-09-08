import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { PROFESSIONS, Profession } from '../data/professions';

interface Player {
  id: string;
  name: string;
  profession: Profession;
  color: string;
  isActive: boolean;
  position: number;
  balance: number;
}

interface PlayerTurnSystemProps {
  players: Player[];
  currentPlayerId: string;
  onPlayerClick: (playerId: string) => void;
  onTurnComplete: () => void;
  canRollDice: boolean;
}

export const PlayerTurnSystem: React.FC<PlayerTurnSystemProps> = ({
  players,
  currentPlayerId,
  onPlayerClick,
  onTurnComplete,
  canRollDice
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showProfessionDialog, setShowProfessionDialog] = useState(false);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowProfessionDialog(true);
    onPlayerClick(player.id);
  };

  const getPlayerStatus = (player: Player) => {
    if (player.id === currentPlayerId) {
      return canRollDice ? 'Ваш ход' : 'Передать ход';
    }
    return 'Ожидание хода';
  };

  const getStatusColor = (player: Player) => {
    if (player.id === currentPlayerId) {
      return canRollDice ? 'success' : 'warning';
    }
    return 'default';
  };

  const getStatusVariant = (player: Player) => {
    if (player.id === currentPlayerId) {
      return canRollDice ? 'filled' : 'outlined';
    }
    return 'outlined';
  };

  return (
    <>
      {/* Список игроков */}
      <Box sx={{ 
        position: 'fixed', 
        top: 20, 
        left: 20, 
        right: 20,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: '100%'
      }}>
        {players.map((player, index) => (
          <Card
            key={player.id}
            sx={{
              background: player.id === currentPlayerId 
                ? `linear-gradient(135deg, ${player.color}20 0%, ${player.color}40 100%)`
                : 'rgba(255, 255, 255, 0.1)',
              border: player.id === currentPlayerId ? `2px solid ${player.color}` : '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateX(-5px)',
                boxShadow: `0 4px 20px ${player.color}40`
              }
            }}
            onClick={() => handlePlayerClick(player)}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: '200px' }}>
                {/* Аватар игрока */}
                <Avatar
                  sx={{
                    bgcolor: player.color,
                    width: 32,
                    height: 32,
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </Avatar>
                
                {/* Информация об игроке */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ 
                    color: 'white', 
                    fontWeight: 'bold',
                    fontSize: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {player.name}
                  </Typography>
                  
                  <Typography variant="caption" sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '10px',
                    display: 'block'
                  }}>
                    {player.profession.name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    color: '#4CAF50',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    ${player.balance.toLocaleString('en-US')}
                  </Typography>
                </Box>
                
                {/* Статус */}
                <Chip
                  label={getPlayerStatus(player)}
                  color={getStatusColor(player) as any}
                  variant={getStatusVariant(player) as any}
                  size="small"
                  sx={{ 
                    fontSize: '9px',
                    height: '18px',
                    minWidth: '60px'
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Диалог с информацией о профессии */}
      <Dialog
        open={showProfessionDialog}
        onClose={() => setShowProfessionDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
            color: 'white',
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          background: selectedPlayer ? `linear-gradient(135deg, ${selectedPlayer.color}20 0%, ${selectedPlayer.color}40 100%)` : 'transparent',
          borderRadius: '16px 16px 0 0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: selectedPlayer?.color, width: 50, height: 50 }}>
              {selectedPlayer?.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                {selectedPlayer?.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                {selectedPlayer?.profession.name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          {selectedPlayer && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Финансовая информация */}
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                p: 2
              }}>
                <Typography variant="h6" sx={{ color: '#4CAF50', mb: 2, textAlign: 'center' }}>
                  Финансовая информация
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Зарплата
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                      ${selectedPlayer.profession.salary.toLocaleString('en-US')}/мес
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Расходы
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                      ${selectedPlayer.profession.totalExpenses.toLocaleString('en-US')}/мес
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Денежный поток
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      color: selectedPlayer.profession.cashFlow > 0 ? '#4CAF50' : '#F44336', 
                      fontWeight: 'bold' 
                    }}>
                      ${selectedPlayer.profession.cashFlow.toLocaleString('en-US')}/мес
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Текущий баланс
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 'bold' }}>
                      ${selectedPlayer.balance.toLocaleString('en-US')}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Кредиты */}
              {selectedPlayer.profession.credits.length > 0 && (
                <Box sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  p: 2
                }}>
                  <Typography variant="h6" sx={{ color: '#FF9800', mb: 2 }}>
                    Кредиты
                  </Typography>
                  
                  {selectedPlayer.profession.credits.map((credit, index) => (
                    <Box key={index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      py: 1,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {credit.name}
                      </Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: '#F44336' }}>
                          ${credit.monthly.toLocaleString('en-US')}/мес
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Остаток: ${credit.principal.toLocaleString('en-US')}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            onClick={() => setShowProfessionDialog(false)}
            sx={{
              background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
              color: 'white',
              px: 4,
              py: 1,
              borderRadius: '8px',
              '&:hover': {
                background: 'linear-gradient(135deg, #4B5563 0%, #374151 100%)'
              }
            }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
