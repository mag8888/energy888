import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function CellPopup({ open, onClose, cell }: any) {
  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{cell?.name || 'Клетка'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{cell?.description || 'Описание недоступно'}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
}

