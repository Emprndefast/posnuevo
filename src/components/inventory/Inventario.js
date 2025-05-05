import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import StockManager from './StockManager';

const Inventario = () => {
  const { darkMode } = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          bgcolor: darkMode ? 'background.paper' : 'background.default',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" gutterBottom>
          Gestión de Inventario
        </Typography>
        <StockManager />
      </Paper>
    </Box>
  );
};

export default Inventario; 