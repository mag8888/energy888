import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function ExpenseCardModal({ open, onClose, card }: any) {
  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Всякая всячина</DialogTitle>
      <DialogContent>
        <Typography>{card?.name || 'Карточка расходов'}</Typography>
        <Typography variant="body2">{card?.description || 'Описание отсутствует'}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">OK</Button>
      </DialogActions>
    </Dialog>
  );
}

