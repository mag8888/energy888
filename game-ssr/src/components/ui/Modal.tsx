import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  fullScreen?: boolean;
  closable?: boolean;
  loading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  fullScreen = false,
  closable = true,
  loading = false
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closable) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, closable, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={closable ? onClose : undefined}
          maxWidth={maxWidth}
          fullWidth={fullWidth}
          fullScreen={fullScreen}
          PaperProps={{
            sx: {
              borderRadius: fullScreen ? 0 : '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflow: 'hidden'
            }
          }}
          BackdropProps={{
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)'
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {title && (
              <DialogTitle
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px 24px 0 24px',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#111827'
                }}
              >
                {title}
                {closable && (
                  <IconButton
                    onClick={onClose}
                    sx={{
                      color: '#6B7280',
                      '&:hover': {
                        color: '#374151',
                        backgroundColor: '#F3F4F6'
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </DialogTitle>
            )}

            <DialogContent
              sx={{
                padding: '24px',
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
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '100px' }}>
                  <div className="loading-spinner" />
                </Box>
              ) : (
                children
              )}
            </DialogContent>

            {actions && (
              <DialogActions
                sx={{
                  padding: '0 24px 24px 24px',
                  gap: '12px',
                  justifyContent: 'flex-end'
                }}
              >
                {actions}
              </DialogActions>
            )}
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default Modal;
