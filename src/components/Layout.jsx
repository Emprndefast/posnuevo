import React, { useState } from 'react';
import { Box, AppBar, Toolbar, IconButton, Typography, useTheme as useMuiTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import NavigationDrawer from './NavigationDrawer';

const Layout = ({ children }) => {
  const muiTheme = useMuiTheme();
  const { darkMode } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: muiTheme.zIndex.drawer + 1,
          backgroundColor: darkMode ? '#1e1e1e' : '#fff',
          color: darkMode ? '#fff' : '#000',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Reparaciones POS
          </Typography>
        </Toolbar>
      </AppBar>

      <NavigationDrawer mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pt: { xs: 9, sm: 10 },
          transition: 'margin 0.3s ease',
          width: { sm: 'calc(100% - 240px)' },
          ml: { sm: '240px' },
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 