import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function BreakModal({ open, onClose, title, description }: any) {
  return (
    <Dialog open={!!open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title || 'Перерыв'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{description || 'Описание перерыва'}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Ок</Button>
      </DialogActions>
    </Dialog>
  );
}

