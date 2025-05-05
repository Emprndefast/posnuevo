import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useLocation } from 'react-router-dom';

const TopMenu = ({ mode, toggleMode }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { label: 'Inicio', path: '/' },
    { label: 'Reparaciones', path: '/reparaciones' },
    { label: 'Inventario', path: '/inventario' },
    { label: 'Ventas', path: '/ventas' },
    { label: 'Clientes', path: '/clientes' },
  ];

  const renderButtons = () => (
    menuItems.map((item) => {
      const isActive = location.pathname === item.path;
      return (
        <Button
          key={item.path}
          component={Link}
          to={item.path}
          variant="text"
          sx={{
            color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
            fontWeight: isActive ? 'bold' : 'normal',
            borderBottom: isActive ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
            borderRadius: 0,
            transition: 'all 0.3s ease',
            '&:hover': {
              color: theme.palette.primary.main,
              backgroundColor: theme.palette.action.hover,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
            },
          }}
        >
          {item.label}
        </Button>
      );
    })
  );

  return (
    <>
      <AppBar
        position="static"
        elevation={4}
        sx={{
          borderRadius: '0 0 16px 16px',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          px: 2,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                letterSpacing: '1px',
              }}
            >
              Reparaciones POS
            </Typography>
          </Box>

          {isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <IconButton onClick={toggleMode} color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {renderButtons()}
              <IconButton onClick={toggleMode} color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer para móviles */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
            <IconButton onClick={toggleMode}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default TopMenu;