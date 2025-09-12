import React, { memo, useMemo, useState, useCallback } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import GameCell from './GameCell';
import Player from './Player';
import { INNER_CELLS, OUTER_CELLS } from '../../data/gameCells';

interface Player {
  id: string;
  name: string;
  position?: number;
  money?: number;
  isReady: boolean;
  profession?: string;
  dream?: string;
  socketId?: string;
}

interface GameBoardProps {
  players: Player[];
  currentPlayer?: Player;
  currentIndex?: number;
  onCellClick?: (cellId: number) => void;
  onPlayerClick?: (playerId: string) => void;
  isMyTurn?: boolean;
  className?: string;
}

const GameBoard: React.FC<GameBoardProps> = memo(({
  players,
  currentPlayer,
  currentIndex = 0,
  onCellClick,
  onPlayerClick,
  isMyTurn = false,
  className
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  // Memoized player colors
  const playerColors = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    return players.map((_, index) => colors[index % colors.length]);
  }, [players.length]);

  // Calculate outer cell positions
  const outerCellPositions = useMemo(() => {
    return OUTER_CELLS.map((_, index) => {
      const angle = (index / OUTER_CELLS.length) * 2 * Math.PI;
      const radius = isMobile ? 35 : 40; // Percentage from center
      const x = 50 + radius * Math.cos(angle - Math.PI / 2);
      const y = 50 + radius * Math.sin(angle - Math.PI / 2);
      return { x, y };
    });
  }, [isMobile]);

  // Calculate inner cell positions (6x4 grid)
  const innerCellPositions = useMemo(() => {
    return INNER_CELLS.map((_, index) => {
      const row = Math.floor(index / 6);
      const col = index % 6;
      const x = 50 + (col - 2.5) * 8; // Center around 50%
      const y = 50 + (row - 1.5) * 8;
      return { x, y };
    });
  }, []);

  // Calculate player positions
  const playerPositions = useMemo(() => {
    return players.map((player) => {
      const position = player.position || 0;
      const angle = (position / OUTER_CELLS.length) * 2 * Math.PI;
      const radius = isMobile ? 30 : 35; // Slightly inside outer cells
      const x = 50 + radius * Math.cos(angle - Math.PI / 2);
      const y = 50 + radius * Math.sin(angle - Math.PI / 2);
      return { x, y };
    });
  }, [players, isMobile]);

  const handleCellHover = useCallback((cellId: number | null) => {
    setHoveredCell(cellId);
  }, []);

  return (
    <Box
      className={className}
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Game Board Container */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: isMobile ? 1 : 2
        }}
      >
        {/* Outer Board */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Box
            sx={{
              position: 'relative',
              width: isMobile ? '90vw' : '70vw',
              height: isMobile ? '90vw' : '70vw',
              maxWidth: '800px',
              maxHeight: '800px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '6px solid #333',
              overflow: 'hidden'
            }}
          >
            {/* Outer Cells */}
            {OUTER_CELLS.map((cell, index) => (
              <GameCell
                key={cell.id}
                {...cell}
                position={outerCellPositions[index]}
                size={isMobile ? 'small' : 'medium'}
                isActive={currentPlayer?.position === cell.id}
                isHovered={hoveredCell === cell.id}
                onClick={() => onCellClick?.(cell.id)}
                onMouseEnter={() => handleCellHover(cell.id)}
                onMouseLeave={() => handleCellHover(null)}
              />
            ))}

            {/* Inner Board */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '65%',
                height: '65%',
                backgroundColor: '#F8F9FA',
                borderRadius: '20px',
                border: '4px solid #333',
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)',
                gap: '3px',
                padding: '8px',
                boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              {INNER_CELLS.map((cell, index) => (
                <GameCell
                  key={cell.id}
                  {...cell}
                  position={innerCellPositions[index]}
                  size="small"
                  isActive={currentPlayer?.position === cell.id}
                  isHovered={hoveredCell === cell.id}
                  onClick={() => onCellClick?.(cell.id)}
                  onMouseEnter={() => handleCellHover(cell.id)}
                  onMouseLeave={() => handleCellHover(null)}
                />
              ))}
            </Box>

            {/* Players */}
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                style={{
                  position: 'absolute',
                  left: `${playerPositions[index].x}%`,
                  top: `${playerPositions[index].y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 30
                }}
              >
                <Box
                  sx={{
                    width: isMobile ? '24px' : '32px',
                    height: isMobile ? '24px' : '32px',
                    borderRadius: '50%',
                    backgroundColor: playerColors[index],
                    border: '3px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? '12px' : '16px',
                    fontWeight: 'bold',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    '&:hover': {
                      transform: 'scale(1.2)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                    }
                  }}
                  onClick={() => onPlayerClick?.(player.id)}
                >
                  {index + 1}
                </Box>
              </motion.div>
            ))}

            {/* Center Title */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 10
              }}
            >
              <Typography
                variant={isMobile ? 'h6' : 'h4'}
                sx={{
                  fontWeight: 'bold',
                  color: '#333',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  mb: 1
                }}
              >
                Energy of Money
              </Typography>
              <Typography
                variant={isMobile ? 'caption' : 'body2'}
                sx={{
                  color: '#666',
                  fontWeight: 500
                }}
              >
                Игра на финансовую грамотность
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Players Panel */}
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          padding: isMobile ? 1 : 2,
          maxHeight: isMobile ? '200px' : '250px',
          overflow: 'auto'
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: '#333',
            mb: 2,
            textAlign: 'center'
          }}
        >
          Игроки ({players.length})
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 2,
            maxHeight: isMobile ? '150px' : '200px',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px'
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#F3F4F6'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#D1D5DB',
              borderRadius: '3px'
            }
          }}
        >
          {players.map((player, index) => (
            <Player
              key={player.id}
              {...player}
              color={playerColors[index]}
              isCurrentPlayer={currentIndex === index}
              isMyPlayer={player.id === currentPlayer?.id}
              onPlayerClick={onPlayerClick}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
});

GameBoard.displayName = 'GameBoard';

export default GameBoard;
