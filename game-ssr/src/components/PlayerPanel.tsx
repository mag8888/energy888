import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Avatar, Button, LinearProgress } from '@mui/material';
import { Player, Asset } from '../types';
import BankModule from '../bank/BankModule';

interface PlayerPanelProps {
  players: Player[];
  currentPlayer: string;
  playerMoney: number;
  assets: Asset[];
  onPlayerClick: (player: Player) => void;
  onRollDice: () => void;
  onPassTurn: () => void;
  canRoll: boolean;
  canPass: boolean;
  timeLeft: number;
  maxTime: number;
  roomId: string;
  playerData: any;
  onBankBalanceChange: (balance: number) => void;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({
  players,
  currentPlayer,
  playerMoney,
  assets,
  onPlayerClick,
  onRollDice,
  onPassTurn,
  canRoll,
  canPass,
  timeLeft,
  maxTime,
  roomId,
  playerData,
  onBankBalanceChange
}) => {
  const progressValue = ((maxTime - timeLeft) / maxTime) * 100;
  const progressColor = timeLeft > 60 ? '#22C55E' : timeLeft > 20 ? '#EAB308' : '#EF4444';

  return (
    <Box sx={{ width: { xs: '100%', md: 300 }, mt: { xs: 2, md: 0 } }}>
      {/* Players List */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>Игроки</Typography>
        <List dense>
          {players.map((player, idx) => (
            <ListItem 
              key={player.id} 
              button 
              onClick={() => onPlayerClick(player)} 
              sx={{ 
                borderRadius: 1, 
                mb: 0.5, 
                bgcolor: 'rgba(148,163,184,0.1)' 
              }}
            >
              <Avatar sx={{ width: 28, height: 28, bgcolor: player.color, mr: 1 }}>
                {player.username?.[0] || '?'}
              </Avatar>
              <ListItemText 
                primaryTypographyProps={{ sx: { color: 'white', fontSize: 14 } }} 
                primary={`${idx + 1}. ${player.username}`} 
                secondary={player.profession?.name || 'Без профессии'} 
                secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.6)' } }} 
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Bank Module */}
      <BankModule
        playerData={{ ...playerData, balance: playerMoney }}
        gamePlayers={players}
        socket={null} // TODO: Pass socket
        bankBalance={playerMoney}
        playerCredit={0}
        getMaxCredit={() => 10000}
        getCashFlow={() => 0}
        setShowCreditModal={() => {}}
        roomId={roomId}
        onBankBalanceChange={onBankBalanceChange}
      />

      {/* Assets */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>Активы</Typography>
        {assets.length === 0 ? (
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Пока пусто</Typography>
        ) : (
          assets.map(asset => (
            <Typography key={asset.id} sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
              • {asset.name} — доход ${asset.income}/мес
            </Typography>
          ))
        )}
      </Paper>

      {/* Game Controls */}
      <Paper sx={{ p: 2, bgcolor: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>Активность</Typography>
        <Button 
          fullWidth 
          variant="contained" 
          onClick={canRoll ? onRollDice : onPassTurn}
          disabled={!canRoll && !canPass}
          sx={{ 
            background: canRoll 
              ? 'linear-gradient(45deg, #8B5CF6, #06B6D4)' 
              : canPass 
                ? 'linear-gradient(45deg, #22C55E, #16A34A)' 
                : 'linear-gradient(45deg, #6B7280, #4B5563)'
          }}
        >
          {canRoll ? '🎲 Бросить кубик' : canPass ? '⏭️ Передать ход' : '⏳ Ожидание хода'}
        </Button>
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progressValue} 
            sx={{ 
              height: 8, 
              borderRadius: 1, 
              '& .MuiLinearProgress-bar': { 
                backgroundColor: progressColor 
              } 
            }} 
          />
          <Typography 
            sx={{ 
              color: progressColor, 
              fontSize: 12, 
              mt: 0.5 
            }}
          >
            Таймер: {timeLeft}s
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default PlayerPanel;
