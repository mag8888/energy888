import React from 'react';
import { Box } from '@mui/material';
import { Player } from '../types';
import { BOARD_SIZE, INNER_RING_RADIUS } from '../styles/boardLayout';

interface PlayerTokensProps {
  players: Player[];
  scale: number;
}

const PlayerTokens: React.FC<PlayerTokensProps> = ({ players, scale }) => {
  const center = { x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 };
  const tokenRadius = INNER_RING_RADIUS + 2;

  return (
    <>
      {players.map((player, idx) => {
        const position = (player.position ?? (idx * 2)) % 24;
        const angle = (Math.PI * 2 * position) / 24 - Math.PI / 2 + (idx * 0.12);
        const x = center.x + Math.cos(angle) * tokenRadius - 12;
        const y = center.y + Math.sin(angle) * tokenRadius - 12;

        return (
          <Box
            key={`token-${player.socketId || player.id || idx}`}
            sx={{
              position: 'absolute',
              left: x,
              top: y,
              width: 24,
              height: 24,
              background: player.color || '#FF5722',
              border: '2px solid #fff',
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              transform: `scale(${scale})`,
              transformOrigin: 'center'
            }}
          />
        );
      })}
    </>
  );
};

export default PlayerTokens;
