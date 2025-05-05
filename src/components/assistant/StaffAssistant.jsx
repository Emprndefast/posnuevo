import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Grid,
  Chip,
  Divider,
  Button,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  useTheme
} from '@mui/material';
import { useRole } from '../../context/RoleContext';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const StaffAssistant = () => {
  const { sessionData, permissions } = useRole();
  const theme = useTheme();

  return (
    <Box sx={{ p: 2 }}>
      {/* Barra superior */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Bienvenido, {sessionData?.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Actualizar">
              <IconButton 
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': { backgroundColor: theme.palette.action.hover }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notificaciones">
              <IconButton
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': { backgroundColor: theme.palette.action.hover }
                }}
              >
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Configuración">
              <IconButton
                sx={{ 
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': { backgroundColor: theme.palette.action.hover }
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Tarjetas de métricas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Fade in={true} timeout={800}>
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }
              }}
            >
              <LocalOfferIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                120
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Productos en Stock
              </Typography>
            </Paper>
          </Fade>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Fade in={true} timeout={1000}>
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }
              }}
            >
              <ShoppingCartIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                15
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ventas Hoy
              </Typography>
            </Paper>
          </Fade>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Fade in={true} timeout={1200}>
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }
              }}
            >
              <AssessmentIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                $5,000
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Ventas
              </Typography>
            </Paper>
          </Fade>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Fade in={true} timeout={1400}>
            <Paper 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                height: '100%',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }
              }}
            >
              <InventoryIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                5
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stock Bajo
              </Typography>
            </Paper>
          </Fade>
        </Grid>
      </Grid>

      {/* Acciones rápidas */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Acciones Rápidas
        </Typography>
        <Grid container spacing={2}>
          {permissions.canViewInventory && (
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<InventoryIcon />}
                href="/products"
                sx={{ 
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  py: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.lighter,
                  }
                }}
              >
                <Typography variant="h6">Productos</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ver inventario
                </Typography>
              </Button>
            </Grid>
          )}

          {permissions.canMakeSales && (
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ShoppingCartIcon />}
                href="/quick-sale"
                sx={{ 
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  py: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.success.lighter,
                  }
                }}
              >
                <Typography variant="h6">Nueva Venta</Typography>
                <Typography variant="body2" color="text.secondary">
                  Registrar venta
                </Typography>
              </Button>
            </Grid>
          )}

          {permissions.canViewDailySales && (
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AssessmentIcon />}
                href="/sales"
                sx={{ 
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  py: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.info.lighter,
                  }
                }}
              >
                <Typography variant="h6">Reportes</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ver ventas diarias
                </Typography>
              </Button>
            </Grid>
          )}

          {permissions.canViewUserMovements && (
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HistoryIcon />}
                href="/movements"
                sx={{ 
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  py: 2,
                  '&:hover': {
                    backgroundColor: theme.palette.warning.lighter,
                  }
                }}
              >
                <Typography variant="h6">Movimientos</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ver historial
                </Typography>
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Información de sesión */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Información de Sesión
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {sessionData?.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sessionData?.position}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ID: {sessionData?.userId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Último acceso: {sessionData?.lastLogin && format(new Date(sessionData.lastLogin), 'PPpp', { locale: es })}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Permisos Activos
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(permissions)
                  .filter(([_, value]) => value)
                  .map(([key]) => (
                    <Chip
                      key={key}
                      label={key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StaffAssistant; 