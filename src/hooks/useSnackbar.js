import { useState } from 'react';
import { useSnackbar as useNotistack } from 'notistack';

export const useSnackbar = () => {
  const { enqueueSnackbar } = useNotistack();

  const showSnackbar = (message, variant = 'default') => {
    enqueueSnackbar(message, {
      variant,
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'right',
      },
      autoHideDuration: 3000,
    });
  };

  return { showSnackbar };
}; 