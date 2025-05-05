import { useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import icons from '../config/icons/icons';

const useNotification = () => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
    icon: null
  });

  const showNotification = useCallback((message, severity = 'info', icon = null) => {
    setNotification({
      open: true,
      message,
      severity,
      icon: icon || getIconBySeverity(severity)
    });
  }, []);

  const getIconBySeverity = (severity) => {
    switch (severity) {
      case 'success':
        return icons.status.success;
      case 'error':
        return icons.status.error;
      case 'warning':
        return icons.status.warning;
      case 'info':
        return icons.status.info;
      default:
        return icons.status.info;
    }
  };

  const handleClose = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const NotificationComponent = () => (
    <Snackbar
      open={notification.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={notification.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );

  return {
    showNotification,
    NotificationComponent
  };
};

export default useNotification; 