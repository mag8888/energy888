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
    if ([1, 14, 36, 40, 27, 51].includes(cellNumber)) {
      return '#FFD700';
    }
      // МЕЧТЫ (Розовый цвет - #FF69B4)
      else if ([2, 6, 12, 16, 18, 20, 24, 26, 28, 30, 32, 35, 37, 42, 44, 46, 48].includes(cellNumber)) {
        return '#FF69B4';
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

  // Функция для определения типа клетки согласно списку
  const getCellType = (cellNumber: number) => {
    const cellIcons: { [key: number]: string } = {
      // ДЕНЬГИ (🟡)
      1: '🏦',   // Доход от инвестиций
      14: '💰',  // Деньги (перемещена с 51)
      27: '💰',  // Денежная клетка (перемещена с 41)
      36: '💰',  // Денежная клетка
      40: '📈',  // Доход от инвестиций
      41: '🏝️',  // Купить частный остров (перемещена с 27)
      51: '🌍',  // Объехать 100 стран (перемещена с 14)
      
      // МЕЧТЫ (🟣)
      2: '🏠',   // Построить дом мечты для семьи
      6: '🧊',   // Посетить Антарктиду
      12: '⛰️',  // Подняться на все высочайшие вершины мира
      16: '⛵',   // Жить год на яхте в Средиземном море
      18: '🎭',  // Создать фонд поддержки талантов
      20: '🎶',  // Организовать мировой фестиваль
      24: '🐎',  // Туристический комплекс (эко-ранчо)
      26: '📊',  // Биржа (с бонусом)
      28: '🖼️',  // NFT-платформа
      30: '🚀',  // Полет на Марс
      32: '📚',  // Создать школу будущего для детей
      35: '🚢',  // Кругосветное плавание на паруснике
      37: '⚓',   // Белоснежная яхта
      42: '🛥️',  // Белоснежная яхта
      44: '❤️',  // Организовать благотворительный фонд
      46: '🚀',  // Полёт в космос
      48: '✈️',  // Кругосветное путешествие
      
      // БИЗНЕС (🟢)
      3: '☕',    // Кофейня в центре города
      5: '🧘',   // Центр здоровья и спа
      7: '📱',   // Мобильное приложение (подписка)
      9: '💻',   // Агентство цифрового маркетинга
      11: '🏨',  // Мини-отель/бутик-гостиница
      13: '🍔',  // Франшиза популярного ресторана
      15: '🧘',  // Йога- и медитационный центр
      17: '💇',  // Салон красоты/барбершоп
      19: '🚗',  // Сеть автомоек самообслуживания
      21: '🌄',  // Построить ретрит-центр
      23: '🚙',  // Сеть автомоек самообслуживания
      25: '⛵',  // Кругосветное плавание на паруснике
      29: '✈️',  // Купить частный самолёт
      31: '🎤',  // Стать мировым лидером мнений
      33: '💹',  // Биржа (с бонусом)
      38: '🎬',  // Снять полнометражный фильм
      43: '🎲',  // Франшиза "Поток денег"
      45: '🥖',  // Пекарня с доставкой
      47: '💻',  // Онлайн-образовательная платформа
      49: '🏋️',  // Сеть фитнес-студий
      
      // ПОТЕРИ (⚠️)
      4: '📉',   // Аудит
      10: '🕵️',  // Кража 100% наличных
      22: '💔',  // Развод
      34: '🏴',  // Рейдерский захват
      39: '🚫',  // Санкции заблокировали все счета
      
      // БЛАГОТВОРИТЕЛЬНОСТЬ (🎗️)
      8: '🤲',   // Благотворительность
    };
    
    return cellIcons[cellNumber] || '💼';
  };

  // Функция для получения полного описания клетки с ценами и доходами
  const getCellDescription = (cellNumber: number) => {
    const descriptions: { [key: number]: string } = {
      // ДЕНЬГИ (🟡)
      1: 'Доход от инвестиций\n💰 Получить доход от всех активов',
      14: 'Деньги\n💰 Дополнительные денежные операции',
      27: 'Денежная клетка\n💰 Дополнительные денежные операции',
      36: 'Денежная клетка\n💰 Дополнительные денежные операции',
      40: 'Доход от инвестиций\n💰 Получить доход от всех активов',
      51: 'Объехать 100 стран\n💰 Бонус: $500,000',

      // МЕЧТЫ (🟣)
      2: 'Построить дом мечты для семьи\n🏠 Стоимость: $100,000\n💸 Доход: $0/мес',
      6: 'Посетить Антарктиду\n🧊 Стоимость: $150,000\n💸 Доход: $0/мес',
      12: 'Подняться на все высочайшие вершины мира\n⛰️ Стоимость: $500,000\n💸 Доход: $0/мес',
      16: 'Жить год на яхте в Средиземном море\n⛵ Стоимость: $300,000\n💸 Доход: $0/мес',
      18: 'Создать фонд поддержки талантов\n🎭 Стоимость: $300,000\n💸 Доход: $0/мес',
      20: 'Организовать мировой фестиваль\n🎶 Стоимость: $200,000\n💸 Доход: $0/мес',
      24: 'Туристический комплекс (эко-ранчо)\n🐎 Стоимость: $1,000,000\n💸 Доход: $0/мес',
      26: 'Биржа (с бонусом)\n📊 Стоимость: $50,000\n💰 Доход: $500,000 (при 5-6)',
      28: 'NFT-платформа\n🖼️ Стоимость: $400,000\n💸 Доход: $0/мес',
      30: 'Полет на Марс\n🚀 Стоимость: $300,000\n💸 Доход: $0/мес',
      32: 'Создать школу будущего для детей\n📚 Стоимость: $300,000\n💸 Доход: $0/мес',
      35: 'Кругосветное плавание на паруснике\n🚢 Стоимость: $200,000\n💸 Доход: $0/мес',
      37: 'Белоснежная Яхта\n⚓ Стоимость: $300,000\n💸 Доход: $0/мес',
      42: 'Белоснежная Яхта\n🛥️ Стоимость: $300,000\n💸 Доход: $0/мес',
      44: 'Организовать благотворительный фонд\n❤️ Стоимость: $200,000\n💸 Доход: $0/мес',
      46: 'Полёт в космос\n🚀 Стоимость: $250,000\n💸 Доход: $0/мес',
      48: 'Кругосветное путешествие\n✈️ Стоимость: $300,000\n💸 Доход: $0/мес',

      // БИЗНЕС (🟢)
      3: 'Кофейня в центре города\n☕ Стоимость: $100,000\n💰 Доход: $3,000/мес',
      5: 'Центр здоровья и спа\n🧘 Стоимость: $270,000\n💰 Доход: $5,000/мес',
      7: 'Мобильное приложение (подписка)\n📱 Стоимость: $420,000\n💰 Доход: $10,000/мес',
      9: 'Агентство цифрового маркетинга\n💻 Стоимость: $160,000\n💰 Доход: $4,000/мес',
      11: 'Мини-отель/бутик-гостиница\n🏨 Стоимость: $200,000\n💰 Доход: $5,000/мес',
      13: 'Франшиза популярного ресторана\n🍔 Стоимость: $320,000\n💰 Доход: $8,000/мес',
      15: 'Йога- и медитационный центр\n🧘 Стоимость: $170,000\n💰 Доход: $4,500/мес',
      17: 'Салон красоты/барбершоп\n💇 Стоимость: $500,000\n💰 Доход: $15,000/мес',
      19: 'Сеть автомоек самообслуживания\n🚗 Стоимость: $120,000\n💰 Доход: $3,000/мес',
      21: 'Построить ретрит-центр\n🌄 Стоимость: $500,000\n💸 Доход: $0/мес',
      23: 'Сеть автомоек самообслуживания\n🚙 Стоимость: $120,000\n💰 Доход: $3,500/мес',
      25: 'Кругосветное плавание на паруснике\n⛵ Стоимость: $300,000\n💸 Доход: $0/мес',
      29: 'Купить частный самолёт\n✈️ Стоимость: $1,000,000\n💸 Доход: $0/мес',
      31: 'Стать мировым лидером мнений\n🎤 Стоимость: $300,000\n💸 Доход: $0/мес',
      33: 'Биржа (с бонусом)\n💹 Стоимость: $50,000\n💰 Доход: $500,000 (при 5-6)',
      38: 'Снять полнометражный фильм\n🎬 Стоимость: $300,000\n💸 Доход: $0/мес',
      41: 'Купить частный остров\n🏝️ Стоимость: $1,000,000\n💸 Доход: $0/мес',
      43: 'Франшиза "Поток денег"\n🎲 Стоимость: $200,000\n💰 Доход: $5,000/мес',
      45: 'Пекарня с доставкой\n🥖 Стоимость: $150,000\n💰 Доход: $4,000/мес',
      47: 'Онлайн-образовательная платформа\n💻 Стоимость: $300,000\n💰 Доход: $8,000/мес',
      49: 'Сеть фитнес-студий\n🏋️ Стоимость: $400,000\n💰 Доход: $12,000/мес',

      // ПОТЕРИ (⚠️)
      4: 'Аудит\n📉 Потеря: 10% от наличных',
      10: 'Кража 100% наличных\n🕵️ Потеря: все наличные',
      22: 'Развод\n💔 Потеря: 50% активов',
      34: 'Рейдерский захват\n🏴 Потеря: 30% бизнеса',
      39: 'Санкции заблокировали все счета\n🚫 Потеря: все счета',

      // БЛАГОТВОРИТЕЛЬНОСТЬ (🎗️)
      8: 'Благотворительность\n🤲 Пожертвование: $10,000',

      // ДОПОЛНИТЕЛЬНЫЕ
      50: 'Дополнительная клетка\n💼 Fast Track',
      52: 'Дополнительная клетка\n💼 Fast Track'
    };
    
    return descriptions[cellNumber] || 'Fast Track';
  };

  // Функции для малого круга (Крысиные бега) - нумерация 1-24
  const getInnerCellType = (cellNumber: number) => {
    const cellTypes: { [key: number]: string } = {
      // ВОЗМОЖНОСТИ (🟢)
      1: '💼', 3: '💼', 5: '💼', 7: '💼', 9: '💼', 11: '💼', 13: '💼', 15: '💼', 17: '💼', 19: '💼', 21: '💼', 23: '💼',
      
      // ВСЯКАЯ ВСЯЧИНА (🟣)
      2: '🛍️', 10: '🛍️', 18: '🛍️',
      
      // БЛАГОТВОРИТЕЛЬНОСТЬ (🟠)
      4: '🤲',
      
      // PAYDAY (🟡)
      6: '💰', 14: '💰', 22: '💰',
      
      // РЫНОК (🔵)
      8: '📈', 16: '📈', 24: '📈',
      
      // РЕБЕНОК (🟣)
      12: '👶',
      
      // ПОТЕРЯ (⚫)
      20: '💔'
    };
    
    return cellTypes[cellNumber] || '💼';
  };

  const getInnerCellColor = (cellNumber: number) => {
    // ВОЗМОЖНОСТИ (Зеленый цвет - #4CAF50)
    if ([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23].includes(cellNumber)) {
      return '#4CAF50';
    }
    // ВСЯКАЯ ВСЯЧИНА (Розовый цвет - #E91E63)
    else if ([2, 10, 18].includes(cellNumber)) {
      return '#E91E63';
    }
    // БЛАГОТВОРИТЕЛЬНОСТЬ (Оранжевый цвет - #FF9800)
    else if (cellNumber === 4) {
      return '#FF9800';
    }
    // PAYDAY (Желтый цвет - #FFD700)
    else if ([6, 14, 22].includes(cellNumber)) {
      return '#FFD700';
    }
    // РЫНОК (Голубой цвет - #00BCD4)
    else if ([8, 16, 24].includes(cellNumber)) {
      return '#00BCD4';
    }
    // РЕБЕНОК (Фиолетовый цвет - #9C27B0)
    else if (cellNumber === 12) {
      return '#9C27B0';
    }
    // ПОТЕРЯ (Черный цвет - #000000)
    else if (cellNumber === 20) {
      return '#000000';
    }
    
    return '#8B5CF6'; // По умолчанию
  };

  const getInnerCellDescription = (cellNumber: number) => {
    const descriptions: { [key: number]: string } = {
      // ВОЗМОЖНОСТИ (🟢)
      1: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      3: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      5: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      7: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      9: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      11: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      13: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      15: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      17: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      19: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      21: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',
      23: 'Возможность\n💼 Вытащить карточку возможности\n💰 Покупка активов (бизнесы, акции, недвижимость)',

      // ВСЯКАЯ ВСЯЧИНА (🟣)
      2: 'Всякая всячина\n🛍️ Вытащить карточку расходов\n💸 Сумма: $100 - $4,000\n📝 Ненужные покупки (одежда, развлечения, еда)',
      10: 'Всякая всячина\n🛍️ Вытащить карточку расходов\n💸 Сумма: $100 - $4,000\n📝 Ненужные покупки (одежда, развлечения, еда)',
      18: 'Всякая всячина\n🛍️ Вытащить карточку расходов\n💸 Сумма: $100 - $4,000\n📝 Ненужные покупки (одежда, развлечения, еда)',

      // БЛАГОТВОРИТЕЛЬНОСТЬ (🟠)
      4: 'Благотворительность\n🤲 Пожертвовать 10% от дохода\n❤️ Помощь нуждающимся (необязательно, но рекомендуется)',

      // PAYDAY (🟡)
      6: 'PayDay\n💰 Получить месячную зарплату\n💵 Сумма: по профессии (например, $3,000 для инженера)\n📅 Основной доход игрока',
      14: 'PayDay\n💰 Получить месячную зарплату\n💵 Сумма: по профессии (например, $3,000 для инженера)\n📅 Основной доход игрока',
      22: 'PayDay\n💰 Получить месячную зарплату\n💵 Сумма: по профессии (например, $3,000 для инженера)\n📅 Основной доход игрока',

      // РЫНОК (🔵)
      8: 'Рынок\n📈 Вытащить карточку рынка\n📊 Изменения цен на активы (рост/падение)',
      16: 'Рынок\n📈 Вытащить карточку рынка\n📊 Изменения цен на активы (рост/падение)',
      24: 'Рынок\n📈 Вытащить карточку рынка\n📊 Изменения цен на активы (рост/падение)',

      // РЕБЕНОК (🟣)
      12: 'Ребенок\n👶 Увеличить расходы на $500/мес\n👨‍👩‍👧‍👦 Рождение ребенка увеличивает ежемесячные расходы',

      // ПОТЕРЯ (⚫)
      20: 'Потеря\n💔 Потеря работы или сокращение\n⚠️ Временная потеря дохода или увеличение расходов'
    };
    
    return descriptions[cellNumber] || 'Крысиные бега';
  };

  // Функция для рендеринга фишек игроков
  const renderPlayerTokens = () => {
    const tokens = [];
    const boardSize = BOARD_SIZE;
    const center = { x: boardSize / 2, y: boardSize / 2 };
    
    // Примерные данные игроков (в реальной игре будут приходить из пропсов)
    const players = [
      { id: 1, name: 'Игрок 1', color: '#FF6B6B', position: 1, isInner: true },
      { id: 2, name: 'Игрок 2', color: '#4ECDC4', position: 5, isInner: true },
      { id: 3, name: 'Игрок 3', color: '#45B7D1', position: 12, isInner: true },
      { id: 4, name: 'Игрок 4', color: '#96CEB4', position: 18, isInner: true },
      { id: 5, name: 'Игрок 5', color: '#FFEAA7', position: 25, isInner: false },
      { id: 6, name: 'Игрок 6', color: '#DDA0DD', position: 35, isInner: false }
    ];

    players.forEach((player, index) => {
      let x, y;
      
      if (player.isInner) {
        // Позиция на малом круге
        const angle = (Math.PI * 2 * (player.position - 1)) / 24 - Math.PI / 2;
        const ringRadius = INNER_RING_RADIUS + 15; // Немного дальше от центра
        x = center.x + Math.cos(angle) * ringRadius;
        y = center.y + Math.sin(angle) * ringRadius;
      } else {
        // Позиция на большом круге
        const angle = (Math.PI * 2 * (player.position - 1)) / 52 - Math.PI / 2;
        const ringRadius = INNER_RING_RADIUS + 100; // Внешний круг
        x = center.x + Math.cos(angle) * ringRadius;
        y = center.y + Math.sin(angle) * ringRadius;
      }

      // Смещение для нескольких фишек на одной клетке
      const offsetX = (index % 3) * 8 - 8;
      const offsetY = Math.floor(index / 3) * 8 - 4;

      tokens.push(
        <Box
          key={`token-${player.id}`}
          sx={{
            position: 'absolute',
            left: x + offsetX - 12,
            top: y + offsetY - 12,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${player.color} 0%, ${player.color}CC 100%)`,
            border: '2px solid #fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#fff',
            zIndex: 10,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)'
            }
          }}
          title={`${player.name} - Клетка ${player.position}`}
        >
          {player.id}
        </Box>
      );
    });

    return tokens;
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
      
      const cellNumber = k + 1; // Нумерация 1-24
      const cellType = getInnerCellType(cellNumber);
      const cellColor = getInnerCellColor(cellNumber);
      
      cells.push(
        <Box 
          key={`inner-${k}`} 
          sx={{ 
            position: 'absolute', 
            left: x, 
            top: y, 
            width: innerCell, 
            height: innerCell, 
            background: `linear-gradient(145deg, ${cellColor}22 0%, ${cellColor}55 100%)`,
            border: `2px solid ${cellColor}88`, 
            borderRadius: '16px', 
            boxShadow: `0 12px 30px ${cellColor}33, inset 0 0 18px ${cellColor}22`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#fff', 
            fontWeight: 'bold', 
            fontSize: 14,
            cursor: 'pointer',
            userSelect: 'none',
            // Частичная заливка 90% площади
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '5%',
              left: '5%',
              right: '5%',
              bottom: '5%',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${cellColor}CC 0%, ${cellColor}99 100%)`,
              zIndex: 1
            }
          }}
          onClick={() => handleInnerCellClick(cellNumber)}
        >
          {/* Номер клетки в левом верхнем углу */}
          <Box sx={{ 
            position: 'absolute', 
            top: '4px', 
            left: '4px', 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: 'rgba(255,255,255,0.9)',
            zIndex: 3,
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {cellNumber}
          </Box>
          {/* Иконка в центре */}
          <Box sx={{ fontSize: '20px', position: 'relative', zIndex: 2 }}>{cellType}</Box>
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

    const make = (
      num: number,
      left: number,
      top: number,
      opts?: { icon?: string; color?: string; variant?: 'bank' }
    ) => {
      const typeIcon = opts?.icon ?? getCellType(num);
      const baseColor = opts?.color ?? getCellColor(num);
      const isBusiness = typeIcon === '💼';
      const owned = Array.isArray(playerData?.ownedBusinessCells) && playerData.ownedBusinessCells.includes(num);
      const playerColor = playerData?.color || '#3B82F6';
      const colorFrom = owned && isBusiness ? playerColor : baseColor;
      const colorTo = owned && isBusiness ? playerColor : baseColor;
      const emerald = opts?.color || '#10B981';
      const isBankStyle = opts?.variant === 'bank';
      
      // Определяем насыщенный цвет для частичной заливки по типу клетки
      let fillColor = '';
      if (isBusiness) {
        fillColor = '#00E676'; // Яркий зелёный для бизнеса
      } else if (['🏠', '🧊', '⛰️', '⛵', '🎭', '🎶', '🐎', '📊', '🖼️', '🚀', '📚', '🚢', '⚓', '🛥️', '❤️', '✈️'].includes(typeIcon)) {
        fillColor = '#FF69B4'; // Яркий розовый для мечт
      } else if (['🏦', '🌍', '💰', '📈', '🏝️'].includes(typeIcon)) {
        fillColor = '#FFEB3B'; // Яркий жёлтый для денег
      } else if (['📉', '🕵️', '💔', '🏴', '🚫'].includes(typeIcon)) {
        fillColor = '#D32F2F'; // Яркий красный для потерь
      } else if (typeIcon === '🤲') {
        fillColor = '#E91E63'; // Яркий розовый для благотворительности
      } else {
        fillColor = baseColor;
      }
      
      // Базовый фон (как был)
      const baseBackground = isBankStyle
        ? 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.95) 100%)'
        : `linear-gradient(145deg, ${colorFrom}22 0%, ${colorTo}55 100%)`;
      
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
            background: baseBackground,
            border: isBankStyle
              ? `1px solid ${emerald}55`
              : `1px solid ${baseColor}88`,
            boxShadow: isBankStyle
              ? `0 8px 22px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.03) inset`
              : `0 8px 22px ${baseColor}33, inset 0 0 18px ${baseColor}22`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            // Частичная заливка 90% площади с насыщенными цветами
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '5%',
              left: '5%',
              right: '5%',
              bottom: '5%',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${fillColor}CC 0%, ${fillColor}99 100%)`,
              zIndex: 1
            }
          }}
          onClick={() => handleCellClick(num)}
        >
          {/* Номер клетки в левом верхнем углу */}
          <Box sx={{ 
            position: 'absolute', 
            top: '4px', 
            left: '4px', 
            fontSize: '10px', 
            fontWeight: 'bold', 
            color: 'rgba(255,255,255,0.8)',
            zIndex: 3,
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '50%',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {num}
          </Box>
          {/* Иконка в центре */}
          <Box sx={{ fontSize: '24px', position: 'relative', zIndex: 2 }}>{typeIcon}</Box>
        </Box>
      );
    };

    // top 1..14
    for (let i = 0; i < 14; i++) cells.push(make(idx++, left0 + i * step, top0));
    // right 15..26 (shifted down by 1 cell to avoid corner)
    for (let i = 0; i < 12; i++) cells.push(make(idx++, rightX, top0 + (i + 1) * step));
    // bottom 27..40 (right->left) — using proper icons from getCellType
    for (let i = 0; i < 14; i++) {
      cells.push(make(idx++, left0 + (13 - i) * step, bottomY, { variant: 'bank' }));
    }
    // left 41..52 (bottom->top, also exclude corners)
    for (let i = 0; i < 12; i++) cells.push(make(idx++, left0, top0 + (12 - i) * step));

    console.log('✅ renderOuterCellsClean total:', cells.length);
    return cells;
  };

  // Popup for cell details
  const [selectedCell, setSelectedCell] = React.useState<number | null>(null);
  const [selectedInnerCell, setSelectedInnerCell] = React.useState<number | null>(null);
  
  const handleCellClick = (num: number) => {
    setSelectedCell(num);
    setSelectedInnerCell(null); // Сброс выбора малого круга
    if (typeof onCellClick === 'function') {
      try {
        onCellClick(num);
      } catch (e) {
        console.warn('onCellClick handler threw', e);
      }
    }
  };

  const handleInnerCellClick = (num: number) => {
    setSelectedInnerCell(num);
    setSelectedCell(null); // Сброс выбора большого круга
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
            {renderPlayerTokens()}
            
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Клетка {selectedCell}</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedCell(null)}
                  sx={{
                    color: '#ff4444',
                    borderColor: '#ff4444',
                    '&:hover': {
                      borderColor: '#ff6666',
                      backgroundColor: 'rgba(255, 68, 68, 0.1)'
                    }
                  }}
                >
                  закрыть
                </Button>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9, 
                  mb: 1, 
                  whiteSpace: 'pre-line',
                  lineHeight: 1.6
                }}
              >
                {getCellDescription(selectedCell)}
              </Typography>
              <Typography variant="body2">Тип: {getCellType(selectedCell)}</Typography>
            </Box>
          </Box>
        )}

        {/* Stylish popup for inner cell details */}
        {selectedInnerCell !== null && (
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
          }} onClick={() => setSelectedInnerCell(null)}>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">Клетка {selectedInnerCell}</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedInnerCell(null)}
                  sx={{
                    color: '#ff4444',
                    borderColor: '#ff4444',
                    '&:hover': {
                      borderColor: '#ff6666',
                      backgroundColor: 'rgba(255, 68, 68, 0.1)'
                    }
                  }}
                >
                  закрыть
                </Button>
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.9, 
                  mb: 1, 
                  whiteSpace: 'pre-line',
                  lineHeight: 1.6
                }}
              >
                {getInnerCellDescription(selectedInnerCell)}
              </Typography>
              <Typography variant="body2">Тип: {getInnerCellType(selectedInnerCell)}</Typography>
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
