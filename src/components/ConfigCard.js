import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ConfigCard = ({ 
  icon: Icon, 
  title, 
  iconColor = 'primary.main',
  children,
  elevation = 2,
  sx = {}
}) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={elevation}
      sx={{
        p: 2,
        borderRadius: theme.shape.borderRadius,
        bgcolor: theme.palette.background.paper,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
        ...sx
      }}
    >
      <Box
        sx={{
          bgcolor: iconColor,
          color: '#fff',
          borderRadius: '50%',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.1)',
          }
        }}
      >
        <Icon fontSize="large" />
      </Box>
      <Typography 
        variant="subtitle1" 
        fontWeight="bold" 
        gutterBottom
        sx={{ 
          color: theme.palette.text.primary,
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
};

export default ConfigCard; 