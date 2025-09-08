import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { BOARD_SIZE, OUTER_PADDING, OUTER_CELL, OUTER_STEPS, INNER_RING_RADIUS, INNER_CELL, ACTION_CARD_OFFSETS } from '../styles/boardLayout';

interface SimpleGameBoardProps {
  roomId: string;
  playerData: any;
}

const SimpleGameBoard: React.FC<SimpleGameBoardProps> = ({ roomId, playerData }) => {
  const renderOuterCells = () => {
    const cells = [];
    const boardSize = BOARD_SIZE;
    const squareLeft = OUTER_PADDING;
    const squareTop = OUTER_PADDING;
    const squareSize = BOARD_SIZE - OUTER_PADDING * 2;
    const cell = OUTER_CELL;
    const step = (squareSize - cell) / OUTER_STEPS;

    // TOP row (13)
    for (let i = 0; i <= 12; i++) {
      cells.push(
        <Box 
          key={`t-${i}`} 
          sx={{ 
            position: 'absolute', 
            left: squareLeft + i * step, 
            top: squareTop, 
            width: cell, 
            height: cell, 
            background: 'linear-gradient(180deg, #21C1D6 0%, #1AA1B4 100%)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '10px', 
            boxShadow: '0 3px 10px rgba(6,182,212,0.3)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#04233B', 
            fontWeight: 'bold', 
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          {i + 1}
        </Box>
      );
    }

    // RIGHT column (12 without corners)
    for (let i = 1; i <= 12; i++) {
      cells.push(
        <Box 
          key={`r-${i}`} 
          sx={{ 
            position: 'absolute', 
            left: squareLeft + squareSize - cell, 
            top: squareTop + i * step, 
            width: cell, 
            height: cell, 
            background: 'linear-gradient(180deg, #21C1D6 0%, #1AA1B4 100%)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '10px', 
            boxShadow: '0 3px 10px rgba(6,182,212,0.3)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#04233B', 
            fontWeight: 'bold', 
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          {13 + i}
        </Box>
      );
    }

    // BOTTOM row (13)
    for (let i = 0; i <= 12; i++) {
      cells.push(
        <Box 
          key={`b-${i}`} 
          sx={{ 
            position: 'absolute', 
            left: squareLeft + (12 - i) * step, 
            top: squareTop + squareSize - cell, 
            width: cell, 
            height: cell, 
            background: 'linear-gradient(180deg, #21C1D6 0%, #1AA1B4 100%)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '10px', 
            boxShadow: '0 3px 10px rgba(6,182,212,0.3)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#04233B', 
            fontWeight: 'bold', 
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          {26 + i}
        </Box>
      );
    }

    // LEFT column (12 without corners)
    for (let i = 1; i <= 12; i++) {
      cells.push(
        <Box 
          key={`l-${i}`} 
          sx={{ 
            position: 'absolute', 
            left: squareLeft, 
            top: squareTop + (12 - i) * step, 
            width: cell, 
            height: cell, 
            background: 'linear-gradient(180deg, #21C1D6 0%, #1AA1B4 100%)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '10px', 
            boxShadow: '0 3px 10px rgba(6,182,212,0.3)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#04233B', 
            fontWeight: 'bold', 
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          {39 + i}
        </Box>
      );
    }

    return cells;
  };

  const renderInnerRing = () => {
    const cells = [];
    const boardSize = BOARD_SIZE;
    const center = { x: boardSize / 2, y: boardSize / 2 };
    const ringRadius = INNER_RING_RADIUS;
    const innerCell = INNER_CELL;

    for (let k = 0; k < 24; k++) {
      const angle = (Math.PI * 2 * k) / 24 - Math.PI / 2;
      const x = center.x + Math.cos(angle) * ringRadius - innerCell / 2;
      const y = center.y + Math.sin(angle) * ringRadius - innerCell / 2;
      
      cells.push(
        <Box 
          key={`inner-${k}`} 
          sx={{ 
            position: 'absolute', 
            left: x, 
            top: y, 
            width: innerCell, 
            height: innerCell, 
            background: '#8B5CF6', 
            border: '2px solid rgba(255,255,255,0.25)', 
            borderRadius: '16px', 
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff', 
            fontWeight: 'bold', 
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          {k + 1}
        </Box>
      );
    }

    return cells;
  };

  const renderActionCards = () => {
    const boardSize = BOARD_SIZE;
    const center = { x: boardSize / 2, y: boardSize / 2 };
    const cardDistance = 350; // Расстояние от центра до карточек
    const cardWidth = 110;
    const cardHeight = 130;
    
    const card = (key: string, label: string, colorFrom: string, colorTo: string, angle: number) => {
      const x = center.x + Math.cos(angle * Math.PI / 180) * cardDistance - cardWidth / 2;
      const y = center.y + Math.sin(angle * Math.PI / 180) * cardDistance - cardHeight / 2;
      
      return (
        <Box 
          key={key} 
          sx={{ 
            position: 'absolute', 
            left: x, 
            top: y, 
            width: cardWidth, 
            height: cardHeight, 
            background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)`, 
            borderRadius: '18px', 
            border: '2px solid rgba(255,255,255,0.35)', 
            boxShadow: `0 12px 38px ${colorFrom}55`, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        >
          <Box sx={{ color: 'white', mb: 1, fontSize: '24px' }}>💠</Box>
          <Box sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: '12px', lineHeight: 1.2 }}>
            {label}
          </Box>
          <Box sx={{ color: 'white', fontSize: '10px', mt: 0.5, opacity: 0.9 }}>0 карт</Box>
        </Box>
      );
    };

    // Располагаем карточки симметрично по углам (45°, 135°, 225°, 315°)
    return [
      card('big', 'Большая сделка', '#00BCD4', '#0097A7', 45),      // Верхний правый
      card('small', 'Малая сделка', '#3B82F6', '#2563EB', 135),     // Верхний левый
      card('expenses', 'Расходы', '#EF4444', '#DC2626', 225),       // Нижний левый
      card('market', 'Рынок', '#F59E0B', '#D97706', 315)            // Нижний правый
    ];
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      p: { xs: 1.5, md: 2 },
      display: 'flex',
      gap: 2,
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      {/* Game Board */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ 
            position: 'relative', 
            width: BOARD_SIZE, 
            height: BOARD_SIZE, 
            transform: 'scale(1)', 
            transformOrigin: 'top left', 
            borderRadius: 4, 
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.01) 100%)', 
            border: '2px solid rgba(139,92,246,0.3)' 
          }}>
            {renderOuterCells()}
            {renderInnerRing()}
            {renderActionCards()}
            
            {/* Center circle */}
            <Box sx={{ 
              position: 'absolute', 
              left: BOARD_SIZE / 2 - 120, 
              top: BOARD_SIZE / 2 - 120, 
              width: 240, 
              height: 240, 
              borderRadius: '50%', 
              background: 'radial-gradient(circle at 30% 30%, #A855F7, #7C3AED)', 
              border: '3px solid rgba(255,255,255,0.25)', 
              boxShadow: '0 25px 60px rgba(124,58,237,0.45)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexDirection: 'column' 
            }}>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', textShadow: '0 3px 10px rgba(0,0,0,0.4)' }}>
                ЦЕНТР
              </Typography>
              <Button 
                sx={{ 
                  mt: 1, 
                  background: 'linear-gradient(45deg, #22C55E, #16A34A)', 
                  color: 'white', 
                  fontWeight: 'bold', 
                  borderRadius: '999px', 
                  px: 2, 
                  py: 0.5, 
                  '&:hover': { background: 'linear-gradient(45deg, #16A34A, #15803D)' } 
                }}
              >
                $ БРОСИТЬ
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Player Panel */}
        <Box sx={{ 
          minWidth: 300, 
          background: 'rgba(17,24,39,0.6)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: 2, 
          p: 2 
        }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Игрок: {playerData.username}
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
            Баланс: ${playerData.balance?.toLocaleString() || '0'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
            Профессия: {playerData.profession?.name || 'Неизвестно'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
            Зарплата: ${playerData.profession?.salary?.toLocaleString() || '0'}
          </Typography>
          
          <Button 
            variant="contained" 
            fullWidth 
            sx={{ 
              background: 'linear-gradient(45deg, #8B5CF6, #06B6D4)',
              mb: 2
            }}
          >
            🎲 Бросить кубик
          </Button>
          
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            DEBUG: SimpleGameBoard работает!
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SimpleGameBoard;
