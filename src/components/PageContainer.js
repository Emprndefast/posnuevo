import React from 'react';
import { Paper, Typography, Box, useTheme, useMediaQuery } from '@mui/material';

const PageContainer = ({ title, children, actions }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: theme.shape.borderRadius * 1.5,
        bgcolor: theme.palette.background.paper,
        boxShadow: theme.shadows[1],
        height: '100%',
        overflow: 'auto',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography 
          variant={isMobile ? 'h5' : 'h4'} 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {title}
        </Typography>
        {actions && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 1,
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
      <Box sx={{ overflow: 'auto' }}>
        {children}
      </Box>
    </Paper>
  );
};

export default PageContainer; 