import React, { memo, useMemo } from 'react';
import { Box } from '@mui/material';
import { BOARD_SIZE, OUTER_PADDING, OUTER_CELL, OUTER_STEPS, INNER_RING_RADIUS, INNER_CELL, ACTION_CARD_OFFSETS } from '../styles/boardLayout';

// Helper function - should be imported from data
const getRatCell = (id: number) => ({
  id,
  name: `Клетка ${id + 1}`,
  type: 'default' as string,
  color: '#8B5CF6'
});

interface GameGridProps {
  scale: number;
  onCellClick?: (cellId: number) => void;
}

const GameGrid: React.FC<GameGridProps> = ({ scale, onCellClick }) => {
  const renderOuterCells = useMemo(() => {
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
          onClick={() => onCellClick?.(i + 1)}
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
          onClick={() => onCellClick?.(13 + i)}
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
          onClick={() => onCellClick?.(26 + i)}
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
          onClick={() => onCellClick?.(39 + i)}
        >
          {39 + i}
        </Box>
      );
    }

    return cells;
  }, [onCellClick]);

  const renderInnerRing = useMemo(() => {
    const cells = [];
    const boardSize = BOARD_SIZE;
    const center = { x: boardSize / 2, y: boardSize / 2 };
    const ringRadius = INNER_RING_RADIUS;
    const innerCell = INNER_CELL;

    for (let k = 0; k < 24; k++) {
      const angle = (Math.PI * 2 * k) / 24 - Math.PI / 2;
      const x = center.x + Math.cos(angle) * ringRadius - innerCell / 2;
      const y = center.y + Math.sin(angle) * ringRadius - innerCell / 2;
      const info = getRatCell(k);
      
      cells.push(
        <Box 
          key={`inner-${k}`} 
          sx={{ 
            position: 'absolute', 
            left: x, 
            top: y, 
            width: innerCell, 
            height: innerCell, 
            background: (info.type as string) === 'loss' ? '#111' : info.color, 
            border: '2px solid rgba(255,255,255,0.25)', 
            borderRadius: '16px', 
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: (info.type as string) === 'loss' ? '#fff' : '#fff', 
            fontWeight: 'bold', 
            fontSize: 14,
            cursor: 'pointer'
          }}
          onClick={() => onCellClick?.(k)}
        >
          {k + 1}
        </Box>
      );
    }

    return cells;
  }, []);

  const renderActionCards = useMemo(() => {
    const boardSize = BOARD_SIZE;
    const center = { x: boardSize / 2, y: boardSize / 2 };
    
    const card = (key: string, label: string, colorFrom: string, colorTo: string, dx: number, dy: number) => {
      return (
        <Box 
          key={key} 
          sx={{ 
            position: 'absolute', 
            left: center.x + dx - 55, 
            top: center.y + dy - 65, 
            width: 110, 
            height: 130, 
            background: `linear-gradient(135deg, ${colorFrom} 0%, ${colorTo} 100%)`, 
            borderRadius: '18px', 
            border: '2px solid rgba(255,255,255,0.35)', 
            boxShadow: `0 12px 38px ${colorFrom}55, 0 0 20px rgba(239, 68, 68, 0.2)`, 
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

    return [
      card('big', 'Большая сделка', '#00BCD4', '#0097A7', ACTION_CARD_OFFSETS.big.dx, ACTION_CARD_OFFSETS.big.dy),
      card('small', 'Малая сделка', '#3B82F6', '#2563EB', ACTION_CARD_OFFSETS.small.dx, ACTION_CARD_OFFSETS.small.dy),
      card('expenses', 'Расходы', '#EF4444', '#DC2626', ACTION_CARD_OFFSETS.expenses.dx, ACTION_CARD_OFFSETS.expenses.dy),
      card('market', 'Рынок', '#F59E0B', '#D97706', ACTION_CARD_OFFSETS.market.dx, ACTION_CARD_OFFSETS.market.dy)
    ];
  }, []);

  return (
    <Box sx={{ 
      position: 'relative', 
      width: BOARD_SIZE, 
      height: BOARD_SIZE, 
      transform: `scale(${scale})`, 
      transformOrigin: 'top left', 
      borderRadius: 4, 
      background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.01) 100%)', 
      border: '2px solid rgba(139,92,246,0.3)' 
    }}>
      {renderOuterCells}
      {renderInnerRing}
      {renderActionCards}
    </Box>
  );
};

GameGrid.displayName = 'GameGrid';

export default GameGrid;
