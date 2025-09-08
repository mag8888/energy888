import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { BOARD_SIZE, OUTER_PADDING, OUTER_CELL, OUTER_STEPS, INNER_RING_RADIUS, INNER_CELL, ACTION_CARD_OFFSETS } from '../styles/boardLayout';
import BankModule from '../bank/BankModule';

interface SimpleGameBoardProps {
  roomId: string;
  playerData: any;
  onCellClick?: (cellNumber: number) => void;
}

const SimpleGameBoard: React.FC<SimpleGameBoardProps> = ({ roomId, playerData, onCellClick }) => {
  const renderOuterCells = () => {
    console.log('🔍 renderOuterCells called');
    const cells = [];
    const boardSize = BOARD_SIZE;
    const padding = OUTER_PADDING;
    const cell = OUTER_CELL;
    
    console.log('📐 Board dimensions:', { boardSize, padding, cell });
    
    // Правильное квадратное расположение: 14+12+14+12 = 52 клетки
    const topCells = 14;    // Верхний ряд
    const rightCells = 12;  // Правый столбец  
    const bottomCells = 14; // Нижний ряд
    const leftCells = 12;   // Левый столбец
    
    // Координаты квадрата
    const squareLeft = padding;
    const squareTop = padding;
    const squareRight = boardSize - padding;
    const squareBottom = boardSize - padding;
    const squareWidth = squareRight - squareLeft;
    const squareHeight = squareBottom - squareTop;
    
    // Шаги для равномерного распределения с интервалом 1px
    const topBottomStep = (squareWidth - cell) / (topCells - 1) + 1; // Интервал 1 пиксель
    const leftRightStep = (squareHeight - cell) / (rightCells - 1) + 1; // Интервал 1 пиксель

    let cellIndex = 1;

    // TOP row (14 клеток: 1-14) - слева направо
    console.log('🔝 Rendering TOP row, step:', topBottomStep);
    for (let i = 0; i < topCells; i++) {
      const cellNumber = cellIndex++;
      const cellColor = getCellColor(cellNumber);
      const cellType = getCellType(cellNumber);
      
      const left = squareLeft + i * topBottomStep;
      const top = squareTop;
      console.log(`📍 Cell ${cellNumber}: left=${left}, top=${top}`);
      
      cells.push(
        <Box 
          key={`top-${i}`} 
          sx={{ 
            position: 'absolute', 
            left: left, 
            top: top, 
            width: cell, 
            height: cell, 
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
              border: `1px solid ${cellColor}30`
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, ${cellColor}, ${cellColor}CC, ${cellColor})`,
              animation: 'shimmer 2s infinite'
            }
          }}
          onClick={() => handleCellClick(cellNumber)}
        >
          {/* Иконка типа клетки */}
          <Box sx={{ 
            position: 'absolute', 
            top: 4, 
            left: 4, 
            fontSize: '12px',
            color: cellColor,
            fontWeight: 'bold'
          }}>
            {cellType}
          </Box>
          
          {/* Номер клетки */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 4, 
            right: 4, 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '10px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>
            {cellNumber}
          </Box>
          
          {/* Центральный контент */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            pt: 1
          }}>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '8px',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.2
            }}>
              {getCellDescription(cellNumber)}
            </Typography>
          </Box>
        </Box>
      );
    }

    // RIGHT column (12 клеток: 15-26) - сверху вниз
    console.log('➡️ Rendering RIGHT column, step:', leftRightStep);
    for (let i = 0; i < rightCells; i++) {
      const cellNumber = cellIndex++;
      const cellColor = getCellColor(cellNumber);
      const cellType = getCellType(cellNumber);
      
      const left = squareRight - cell;
      const top = squareTop + i * leftRightStep;
      console.log(`📍 Cell ${cellNumber}: left=${left}, top=${top}`);
      
      cells.push(
        <Box 
          key={`right-${i}`} 
          sx={{ 
            position: 'absolute', 
            left: left, 
            top: top, 
            width: cell, 
            height: cell, 
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
              border: `1px solid ${cellColor}30`
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, ${cellColor}, ${cellColor}CC, ${cellColor})`,
              animation: 'shimmer 2s infinite'
            }
          }}
          onClick={() => handleCellClick(cellNumber)}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: 4, 
            left: 4, 
            fontSize: '12px',
            color: cellColor,
            fontWeight: 'bold'
          }}>
            {cellType}
          </Box>
          
          <Box sx={{ 
            position: 'absolute', 
            bottom: 4, 
            right: 4, 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '10px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>
            {cellNumber}
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            pt: 1
          }}>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '8px',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.2
            }}>
              {getCellDescription(cellNumber)}
            </Typography>
          </Box>
        </Box>
      );
    }

    // BOTTOM row (14 клеток: 27-40) - справа налево
    console.log('⬇️ Rendering BOTTOM row, step:', topBottomStep);
    for (let i = 0; i < bottomCells; i++) {
      const cellNumber = cellIndex++;
      const cellColor = getCellColor(cellNumber);
      const cellType = getCellType(cellNumber);
      
      const left = squareLeft + (bottomCells - 1 - i) * topBottomStep;
      const top = squareBottom - cell;
      console.log(`📍 Cell ${cellNumber}: left=${left}, top=${top}`);
      
      cells.push(
        <Box 
          key={`bottom-${i}`} 
          sx={{ 
            position: 'absolute', 
            left: left, 
            top: top, 
            width: cell, 
            height: cell, 
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
              border: `1px solid ${cellColor}30`
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, ${cellColor}, ${cellColor}CC, ${cellColor})`,
              animation: 'shimmer 2s infinite'
            }
          }}
          onClick={() => handleCellClick(cellNumber)}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: 4, 
            left: 4, 
            fontSize: '12px',
            color: cellColor,
            fontWeight: 'bold'
          }}>
            {cellType}
          </Box>
          
          <Box sx={{ 
            position: 'absolute', 
            bottom: 4, 
            right: 4, 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '10px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>
            {cellNumber}
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            pt: 1
          }}>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '8px',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.2
            }}>
              {getCellDescription(cellNumber)}
            </Typography>
          </Box>
        </Box>
      );
    }

    // LEFT column (12 клеток: 41-52) - снизу вверх
    console.log('⬅️ Rendering LEFT column, step:', leftRightStep);
    for (let i = 0; i < leftCells; i++) {
      const cellNumber = cellIndex++;
      const cellColor = getCellColor(cellNumber);
      const cellType = getCellType(cellNumber);
      
      const left = squareLeft;
      const top = squareTop + (leftCells - 1 - i) * leftRightStep;
      console.log(`📍 Cell ${cellNumber}: left=${left}, top=${top}`);
      
      cells.push(
        <Box 
          key={`left-${i}`} 
          sx={{ 
            position: 'absolute', 
            left: left, 
            top: top, 
            width: cell, 
            height: cell, 
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            // removed duplicate position key to satisfy TS literal rules
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
              border: `1px solid ${cellColor}30`
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, ${cellColor}, ${cellColor}CC, ${cellColor})`,
              animation: 'shimmer 2s infinite'
            }
          }}
          onClick={() => handleCellClick(cellNumber)}
        >
          <Box sx={{ 
            position: 'absolute', 
            top: 4, 
            left: 4, 
            fontSize: '12px',
            color: cellColor,
            fontWeight: 'bold'
          }}>
            {cellType}
          </Box>
          
          <Box sx={{ 
            position: 'absolute', 
            bottom: 4, 
            right: 4, 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '10px',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}>
            {cellNumber}
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            pt: 1
          }}>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '8px',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              lineHeight: 1.2
            }}>
              {getCellDescription(cellNumber)}
            </Typography>
          </Box>
        </Box>
      );
    }

    console.log('✅ renderOuterCells completed, total cells:', cells.length);
    return cells;
  };

  // Функция для получения описания клетки — определена ниже (подробная версия)

  // Функция для определения цвета клетки
  const getCellColor = (cellNumber: number) => {
    // ДЕНЬГИ (Желтый цвет - #FFD700)
    if ([1, 14, 36, 40, 27].includes(cellNumber)) {
      return '#FFD700';
    }
    // МЕЧТЫ (Розовый цвет - #E91E63)
    else if ([2, 6, 12, 16, 18, 20, 24, 26, 28, 30, 32, 35, 37, 42, 44, 46, 48].includes(cellNumber)) {
      return '#E91E63';
    }
    // БИЗНЕС (Зеленый цвет - #4CAF50)
    else if ([3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 29, 31, 33, 38, 41, 43, 45, 47, 49].includes(cellNumber)) {
      return '#4CAF50';
    }
    // ПОТЕРИ (Бордовый цвет - #8B0000)
    else if ([4, 10, 22, 34, 39].includes(cellNumber)) {
      return '#8B0000';
    }
    // БЛАГОТВОРИТЕЛЬНОСТЬ (Розовый цвет - #FF69B4)
    else if (cellNumber === 8) {
      return '#FF69B4';
    }
    // По умолчанию синий
    return '#3B82F6';
  };

  // Функция для определения типа клетки
  const getCellType = (cellNumber: number) => {
    // ДЕНЬГИ
    if ([1, 14, 36, 40, 27].includes(cellNumber)) {
      return '💰';
    }
    // МЕЧТЫ
    else if ([2, 6, 12, 16, 18, 20, 24, 26, 28, 30, 32, 35, 37, 42, 44, 46, 48].includes(cellNumber)) {
      return '🎯';
    }
    // БИЗНЕС
    else if ([3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 29, 31, 33, 38, 41, 43, 45, 47, 49].includes(cellNumber)) {
      return '💼';
    }
    // ПОТЕРИ
    else if ([4, 10, 22, 34, 39].includes(cellNumber)) {
      return '⚠️';
    }
    // БЛАГОТВОРИТЕЛЬНОСТЬ
    else if (cellNumber === 8) {
      return '🎗️';
    }
    // По умолчанию
    return '';
  };

  // Функция для получения описания клетки
  const getCellDescription = (cellNumber: number) => {
    const descriptions: { [key: number]: string } = {
      1: 'Доход от инвестиций',
      2: 'Дом мечты',
      3: 'Кофейня',
      4: 'Аудит',
      5: 'Центр здоровья',
      6: 'Антарктида',
      7: 'Мобильное приложение',
      8: 'Благотворительность',
      9: 'Агентство маркетинга',
      10: 'Кража наличных',
      11: 'Мини-отель',
      12: 'Высочайшие вершины',
      13: 'Франшиза ресторана',
      14: 'Объехать 100 стран',
      15: 'Йога-центр',
      16: 'Яхта в Средиземном море',
      17: 'Салон красоты',
      18: 'Фонд поддержки',
      19: 'Автомойки',
      20: 'Мировой фестиваль',
      21: 'Ретрит-центр',
      22: 'Развод',
      23: 'Автомойки',
      24: 'Эко-ранчо',
      25: 'Кругосветное плавание',
      26: 'Биржа',
      27: 'Денежная клетка',
      28: 'NFT-платформа',
      29: 'Лидер мнений',
      30: 'Полет на Марс',
      31: 'Биржа',
      32: 'Школа будущего',
      33: 'Полнометражный фильм',
      34: 'Рейдерский захват',
      35: 'Кругосветное плавание',
      36: 'Денежная клетка',
      37: 'Белоснежная Яхта',
      38: 'Франшиза "поток денег"',
      39: 'Санкции',
      40: 'Доход от инвестиций',
      41: 'Частный самолёт',
      42: 'Белоснежная Яхта',
      43: 'Пекарня с доставкой',
      44: 'Благотворительный фонд',
      45: 'Онлайн-образование',
      46: 'Полёт в космос',
      47: 'Сеть фитнес-студий',
      48: 'Кругосветное путешествие',
      49: 'Коворкинг-пространство',
      50: 'Дополнительная клетка',
      51: 'Дополнительная клетка',
      52: 'Дополнительная клетка'
    };
    
    return descriptions[cellNumber] || 'Fast Track';
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
    
    const card = (key: string, label: string, colorFrom: string, colorTo: string, dx: number, dy: number) => {
      const discardCount = 0; // TODO: wire up from game state
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
          <Box sx={{
            position: 'absolute',
            bottom: 6,
            left: 6,
            right: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            color: '#fff',
            fontSize: '10px',
            opacity: 0.9,
            background: 'rgba(0,0,0,0.18)',
            borderRadius: '8px',
            padding: '2px 6px'
          }}>
            <span>В отбое:</span>
            <b style={{ fontWeight: 700 }}>{discardCount}</b>
          </Box>
        </Box>
      );
    };

    return [
      card('big', 'Большая сделка', '#00BCD4', '#0097A7', ACTION_CARD_OFFSETS.big.dx, ACTION_CARD_OFFSETS.big.dy),
      card('small', 'Малая сделка', '#3B82F6', '#2563EB', ACTION_CARD_OFFSETS.small.dx, ACTION_CARD_OFFSETS.small.dy),
      card('expenses', 'Расходы', '#EF4444', '#DC2626', ACTION_CARD_OFFSETS.expenses.dx, ACTION_CARD_OFFSETS.expenses.dy),
      card('market', 'Рынок', '#F59E0B', '#D97706', ACTION_CARD_OFFSETS.market.dx, ACTION_CARD_OFFSETS.market.dy)
    ];
  };

  // Чистая генерация внешних клеток без побочных стилей
  const renderOuterCellsClean = () => {
    const cells: JSX.Element[] = [];
    const cellSize = OUTER_CELL + 1; // +1px as requested
    const gap = 1;
    const step = cellSize + gap;
    const left0 = OUTER_PADDING;
    const top0 = OUTER_PADDING;
    const rightX = BOARD_SIZE - OUTER_PADDING - cellSize;
    const bottomY = BOARD_SIZE - OUTER_PADDING - cellSize;

    let idx = 1;

    const make = (num: number, left: number, top: number) => {
      const typeIcon = getCellType(num);
      const baseColor = getCellColor(num);
      const isBusiness = typeIcon === '💼';
      const owned = Array.isArray(playerData?.ownedBusinessCells) && playerData.ownedBusinessCells.includes(num);
      const playerColor = playerData?.color || '#3B82F6';
      const colorFrom = owned && isBusiness ? playerColor : baseColor;
      const colorTo = owned && isBusiness ? playerColor : baseColor;
      return (
        <Box
          key={`outer-${num}`}
          sx={{
            position: 'absolute',
            left,
            top,
            width: cellSize,
            height: cellSize,
            borderRadius: '12px',
            background: `linear-gradient(145deg, ${colorFrom}55 0%, ${colorTo}CC 100%)`,
            border: `1px solid ${baseColor}88`,
            boxShadow: `0 8px 22px ${baseColor}33, inset 0 0 18px ${baseColor}22`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none'
          }}
          onClick={() => handleCellClick(num)}
        >
          <Box sx={{ fontSize: '14px' }}>{typeIcon}</Box>
        </Box>
      );
    };

    // top 1..14
    for (let i = 0; i < 14; i++) cells.push(make(idx++, left0 + i * step, top0));
    // right 15..26 (shifted down by 1 cell to avoid corner)
    for (let i = 0; i < 12; i++) cells.push(make(idx++, rightX, top0 + (i + 1) * step));
    // bottom 27..40 (right->left)
    for (let i = 0; i < 14; i++) cells.push(make(idx++, left0 + (13 - i) * step, bottomY));
    // left 41..52 (bottom->top, also exclude corners)
    for (let i = 0; i < 12; i++) cells.push(make(idx++, left0, top0 + (12 - i) * step));

    console.log('✅ renderOuterCellsClean total:', cells.length);
    return cells;
  };

  // Popup for cell details
  const [selectedCell, setSelectedCell] = React.useState<number | null>(null);
  const handleCellClick = (num: number) => {
    setSelectedCell(num);
    if (typeof onCellClick === 'function') {
      try {
        onCellClick(num);
      } catch (e) {
        console.warn('onCellClick handler threw', e);
      }
    }
  };

  console.log('🎮 SimpleGameBoard rendering');
  
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* DEBUG: Simple indicator */}
      <Box sx={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'red',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px',
        zIndex: 9999
      }}>
        🎮 SimpleGameBoard LOADED
      </Box>
      {/* Top Bank Panel */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Bank Module */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            borderRadius: '12px',
            p: 2,
            minWidth: '120px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              БАНК
            </Typography>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              ${playerData.balance?.toLocaleString('en-US') || '3,000'}
            </Typography>
          </Box>
        </Box>

        {/* Players Info */}
        <Box sx={{
          display: 'flex',
          gap: 2
        }}>
          <Box sx={{
            background: 'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)',
            borderRadius: '12px',
            p: 2,
            minWidth: '120px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)'
          }}>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
              Игрок
            </Typography>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              {playerData.username}
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.8 }}>
              ${playerData.balance?.toLocaleString('en-US') || '3,000'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Game Area */}
      <Box sx={{
        flex: 1,
        p: { xs: 1.5, md: 2 },
        display: 'flex',
        gap: 2,
        flexDirection: { xs: 'column', md: 'row' }
      }}>
      {/* Game Board */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ 
            // removed duplicate position key to satisfy TS literal rules
            width: BOARD_SIZE, 
            height: BOARD_SIZE, 
            borderRadius: 4, 
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.01) 100%)', 
            border: '2px solid rgba(139,92,246,0.3)' 
          }}>
            {/* DEBUG: Visual indicator */}
            <Box sx={{
              position: 'absolute',
              left: 10,
              top: 10,
              background: 'red',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              zIndex: 1000
            }}>
              DEBUG: Cells should be here
            </Box>
            
            {renderOuterCellsClean()}
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

        {/* Stylish popup for cell details */}
        {selectedCell !== null && (
          <Box sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            zIndex: 2000
          }} onClick={() => setSelectedCell(null)}>
            <Box sx={{
              minWidth: 320,
              maxWidth: 380,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
              color: '#fff',
              p: 2
            }} onClick={(e) => e.stopPropagation()}>
              <Typography variant="h6" sx={{ mb: 1 }}>Клетка {selectedCell}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>{getCellDescription(selectedCell)}</Typography>
              <Typography variant="body2">Тип: {getCellType(selectedCell)}</Typography>
            </Box>
          </Box>
        )}

        {/* Right Panel - Bank, Dice, Timing */}
        <Box sx={{ 
          minWidth: 300, 
          background: 'rgba(17,24,39,0.6)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: 2, 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {/* Bank Module */}
          <BankModule
            playerData={playerData}
            gamePlayers={[playerData]}
            socket={null}
            bankBalance={playerData.balance || 3000}
            playerCredit={0}
            getMaxCredit={() => 10000}
            getCashFlow={() => playerData.profession?.salary - playerData.profession?.totalExpenses || 3500}
            setShowCreditModal={() => {}}
            roomId={roomId}
            onBankBalanceChange={() => {}}
          />

          {/* Dice Module */}
          <Box sx={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            borderRadius: '12px',
            p: 2,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
              КУБИК
            </Typography>
            <Button 
              variant="contained" 
              fullWidth 
              sx={{ 
                background: 'linear-gradient(45deg, #22C55E, #16A34A)',
                color: 'white',
                fontWeight: 'bold',
                py: 1.5,
                fontSize: '16px',
                '&:hover': {
                  background: 'linear-gradient(45deg, #16A34A, #15803D)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              🎲 БРОСИТЬ
            </Button>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, mt: 1 }}>
              Последний бросок: 6
            </Typography>
          </Box>

          {/* Timing Module */}
          <Box sx={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            borderRadius: '12px',
            p: 2,
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
              ТАЙМИНГ
            </Typography>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              02:30
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, mt: 1 }}>
              Осталось времени
            </Typography>
          </Box>

          {/* Player Info */}
          <Box sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            p: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, mb: 1 }}>
              Игрок: {playerData.username}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, mb: 1 }}>
              Профессия: {playerData.profession?.name || 'Программист'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
              Зарплата: ${playerData.profession?.salary?.toLocaleString('en-US') || '6,000'}
            </Typography>
          </Box>
        </Box>
      </Box>
      </Box>
    </Box>
  );
};

export default SimpleGameBoard;
