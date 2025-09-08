import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

export default function CellPopup({ open, onClose, cell }: any) {
  return (
    <Dialog
      open={!!open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.96))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          overflow: 'hidden',
          '::before': {
            content: '""',
            display: 'block',
            width: '100%',
            height: 4,
            background: 'linear-gradient(90deg,#06B6D4,#8B5CF6,#EC4899)'
          }
        }
      }}
    >
      <DialogTitle sx={{ color: '#fff', fontWeight: 800 }}>{cell?.name || 'Клетка'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          {cell?.description || 'Описание недоступно'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor:'rgba(255,255,255,0.2)', color:'#fff' }}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}
