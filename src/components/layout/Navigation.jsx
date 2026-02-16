import React, { startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Collapse
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as SalesIcon,
  People as CustomersIcon,
  Analytics as AnalyticsIcon,
  CardMembership as SubscriptionIcon,
  Settings as SettingsIcon,
  Payment as PaymentIcon,
  Receipt as InvoiceIcon,
  LocalShipping as SupplierIcon,
  LocalOffer as PromotionIcon,
  BuildCircle as RepairsIcon,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Link } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';

// Grouped menu items similar to Whabot
const menuGroups = [
  {
    group: 'Inicio',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    ],
  },
  {
    group: 'Ventas y Productos',
    items: [
      { text: 'Productos', icon: <InventoryIcon />, path: '/products' },
      { text: 'Ventas', icon: <SalesIcon />, path: '/sales' },
      { text: 'Reparaciones', icon: <RepairsIcon />, path: '/repairs' },
    ],
  },
  {
    group: 'Clientes y Análisis',
    items: [
      { text: 'Clientes', icon: <CustomersIcon />, path: '/customers' },
      { text: 'Análisis', icon: <AnalyticsIcon />, path: '/analytics' },
    ],
  },
  {
    group: 'Comercio',
    items: [
      { text: 'Pasarelas de Pago', icon: <PaymentIcon />, path: '/payment-gateways' },
      { text: 'Facturación', icon: <InvoiceIcon />, path: '/billing' },
      { text: 'Proveedores', icon: <SupplierIcon />, path: '/suppliers' },
      { text: 'Promociones', icon: <PromotionIcon />, path: '/promotions' },
    ],
  },
  {
    group: 'Sistema',
    items: [
      { text: 'Suscripciones', icon: <SubscriptionIcon />, path: '/subscriptions' },
      { text: 'Configuración', icon: <SettingsIcon />, path: '/settings' },
      { text: 'Ayuda', icon: <HelpOutlineIcon />, path: '/help' },
    ],
  },
];

export const Navigation = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedGroups, setExpandedGroups] = React.useState({});
  const { businessData } = useBusiness();

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      startTransition(() => {
        navigate(path);
      });
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={onClose}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: `1px solid ${theme.palette.divider}`,
          ...(isMobile && {
            maxWidth: '85vw',
          }),
        },
      }}
    >
      {/* Logo/Brand Section */}
      <Box
        sx={{
          p: 3,
          textAlign: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={businessData?.logo || "/Posent-logo.png"}
            alt={businessData?.name || "POSENT Logo"}
            sx={{
              height: 45,
              width: 'auto',
              maxWidth: 180,
              objectFit: 'contain',
              display: 'block'
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1.25rem'
            }}
          >
            POSENT PRO
          </Typography>
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        {menuGroups.map((group, groupIndex) => (
          <Box key={group.group}>
            <Box
              onClick={() => toggleGroup(group.group)}
              sx={{
                px: 2,
                py: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.65rem'
                }}
              >
                {group.group}
              </Typography>
            </Box>

            <List sx={{ py: 0 }}>
              {group.items.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      mx: 1,
                      borderRadius: '12px',
                      minHeight: 48,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main', // Usar color primario del tema
                        color: 'primary.contrastText',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'inherit',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === item.path ? 'inherit' : 'text.secondary',
                        minWidth: 40
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        color: 'inherit'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {groupIndex < menuGroups.length - 1 && (
              <Divider sx={{ my: 1 }} />
            )}
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Link to="/manual" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              transition: 'all 0.2s',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'action.selected',
                transform: 'translateY(-1px)',
                boxShadow: 2
              }
            }}
          >
            <HelpOutlineIcon sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                Manual de Usuario
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Ayuda y guía
              </Typography>
            </Box>
          </Box>
        </Link>
      </Box>
    </Drawer>
  );
}; 