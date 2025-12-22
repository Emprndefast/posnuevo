import React, { useState, Suspense, lazy, startTransition } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Chip,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Dialog,
} from '@mui/material';
import {
  Business,
  LocalPrintshop,
  Notifications,
  Security,
  CloudUpload,
  WhatsApp as WhatsAppIcon,
  Extension,
  Settings as SettingsIcon,
  Palette,
  Translate,
  LocalAtm,
  AccountBalance,
  Receipt,
  Category,
  Build,
  CloudBackup,
} from '@mui/icons-material';

// Telegram context to determine whether it's configured
import { useTelegram } from '../../context/TelegramContext';

const EmpresaConfigModal = lazy(() => import('./modals/EmpresaConfigModal'));
const ImpresoraConfigModal = lazy(() => import('./modals/ImpresoraConfigModal'));
const NotificacionesConfigModal = lazy(() => import('./modals/NotificacionesConfigModal'));
const SeguridadConfigModal = lazy(() => import('./modals/SeguridadConfigModal'));
const RespaldosConfigModal = lazy(() => import('./modals/RespaldosConfigModal'));
const WhatsAppConfigModal = lazy(() => import('./modals/WhatsAppConfigModal'));
const IntegracionesConfigModal = lazy(() => import('./modals/IntegracionesConfigModal'));
const TelegramConfigModal = lazy(() => import('./modals/TelegramConfigModal'));
const AparienciaConfigModal = lazy(() => import('./modals/AparienciaConfigModal'));
const IdiomaConfigModal = lazy(() => import('./modals/IdiomaConfigModal'));
const GeneralConfigModal = lazy(() => import('./modals/GeneralConfigModal'));
const FacturacionConfigModal = lazy(() => import('./modals/FacturacionConfigModal'));
const BancosConfigModal = lazy(() => import('./modals/BancosConfigModal'));

const SettingsCard = ({ icon: Icon, title, description, color, onConfigure, isConfigured = false }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 280,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `2px solid transparent`,
        background: `linear-gradient(145deg, ${alpha(color, 0.05)}, ${alpha(color, 0.02)})`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.25)}`,
          borderColor: alpha(color, 0.3),
        },
        position: 'relative',
        overflow: 'visible',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={onConfigure}
    >
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Badge de configuración */}
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          {isConfigured ? (
            <Chip 
              label="Configurado" 
              size="small" 
              sx={{ 
                bgcolor: alpha(color, 0.15),
                color: color,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          ) : (
            <Chip 
              label="No configurado" 
              size="small"
              icon={<SettingsIcon sx={{ fontSize: '0.8rem !important' }} />}
              sx={{ 
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                color: theme.palette.grey[600],
                fontWeight: 500,
                fontSize: '0.7rem',
              }}
            />
          )}
        </Box>

        {/* Icono con fondo circular */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 3,
            mt: 1
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.6)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 16px ${alpha(color, 0.3)}`,
            }}
          >
            <Icon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
        </Box>

        {/* Título y descripción */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
            textAlign: 'center',
            fontSize: '1.1rem',
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            lineHeight: 1.6,
            flex: 1,
            mb: 2,
            fontSize: '0.875rem',
          }}
        >
          {description}
        </Typography>

        {/* Botón de acción */}
        <Box sx={{ mt: 'auto', pt: 2 }}>
          <Box
            sx={{
              bgcolor: color,
              color: 'white',
              borderRadius: 2,
              py: 1.5,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: alpha(color, 0.9),
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
              },
            }}
          >
            Configurar
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const Settings = () => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(null);

  // Preload modals that are commonly used to avoid suspense on click
  React.useEffect(() => {
    import('./modals/TelegramConfigModal');
    import('./modals/NotificacionesConfigModal');
    // Add other heavy modals if needed
  }, []);

  const settingsConfig = [
    {
      id: 'empresa',
      title: 'Información del Negocio',
      description: 'Configura los datos básicos de tu negocio, logo e información fiscal',
      icon: Business,
      color: '#7C3AED',
      modal: EmpresaConfigModal,
    },
    {
      id: 'impresoras',
      title: 'Impresoras',
      description: 'Configura impresoras fiscales, térmicas y de códigos de barras',
      icon: LocalPrintshop,
      color: '#10B981',
      modal: ImpresoraConfigModal,
    },
    {
      id: 'notificaciones',
      title: 'Notificaciones',
      description: 'Configura alertas de stock bajo, ventas y recordatorios',
      icon: Notifications,
      color: '#F59E0B',
      modal: NotificacionesConfigModal,
    },
    {
      id: 'seguridad',
      title: 'Seguridad',
      description: 'Configura autenticación, contraseñas y políticas de seguridad',
      icon: Security,
      color: '#EF4444',
      modal: SeguridadConfigModal,
    },
    {
      id: 'respaldos',
      title: 'Respaldo',
      description: 'Configura respaldos automáticos y políticas de retención',
      icon: CloudUpload,
      color: '#8B5CF6',
      modal: RespaldosConfigModal,
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Business',
      description: 'Configura integración con WhatsApp Business para notificaciones',
      icon: WhatsAppIcon,
      color: '#25D366',
      modal: WhatsAppConfigModal,
    },
    {
      id: 'integraciones',
      title: 'Integraciones',
      description: 'Conecta con Whabot Pro y otras plataformas externas',
      icon: Extension,
      color: '#6366F1',
      modal: IntegracionesConfigModal,
    },
    {
      id: 'telegram',
      title: 'Telegram',
      description: 'Configura tu bot de Telegram para recibir notificaciones (token + chatId)',
      icon: LocalAtm,
      color: '#26A5E4',
      modal: TelegramConfigModal,
    },
    {
      id: 'apariencia',
      title: 'Apariencia',
      description: 'Personaliza colores, tema y aspecto visual del sistema',
      icon: Palette,
      color: '#EC4899',
      modal: AparienciaConfigModal,
    },
    {
      id: 'idioma',
      title: 'Idioma',
      description: 'Configura el idioma y región del sistema',
      icon: Translate,
      color: '#3B82F6',
      modal: IdiomaConfigModal,
    },
    {
      id: 'general',
      title: 'General',
      description: 'Configura opciones generales del sistema',
      icon: SettingsIcon,
      color: '#6B7280',
      modal: GeneralConfigModal,
    },
    {
      id: 'facturacion',
      title: 'Facturación',
      description: 'Configura tipos de facturas y secuencias',
      icon: Receipt,
      color: '#059669',
      modal: FacturacionConfigModal,
    },
    {
      id: 'bancos',
      title: 'Bancos',
      description: 'Administra cuentas bancarias y métodos de pago',
      icon: AccountBalance,
      color: '#DC2626',
      modal: BancosConfigModal,
    },
  ];

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  // Obtener estado de Telegram para mostrar el badge
  const { config: telegramConfig } = useTelegram();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 4 }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              mb: 1,
              fontSize: { xs: '1.75rem', md: '2rem' },
            }}
          >
            Configuración del Sistema
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: '1rem',
              maxWidth: '600px',
            }}
          >
            Configura todas las opciones de tu sistema POS. Cada sección puede ser configurada independientemente según tus necesidades.
          </Typography>
        </Box>

        {/* Banner informativo */}
        <Box
          sx={{
            bgcolor: alpha(theme.palette.info.main, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            borderRadius: 2,
            p: 2,
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <SettingsIcon sx={{ color: theme.palette.info.main, fontSize: 28 }} />
          <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
            Información: Las configuraciones se guardan automáticamente en MongoDB. Puedes modificar cualquier configuración en cualquier momento.
          </Typography>
        </Box>

        {/* Grid de configuraciones */}
        <Grid container spacing={3}>
          {settingsConfig.map((config) => {
            const isConfigured = config.id === 'telegram'
              ? Boolean(telegramConfig?.botToken && telegramConfig?.chatId && telegramConfig?.enabled !== false)
              : false;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={config.id}>
                <SettingsCard
                  icon={config.icon}
                  title={config.title}
                  description={config.description}
                  color={config.color}
                  onConfigure={() => startTransition(() => setOpenModal(config.id))}
                  isConfigured={isConfigured}
                />
              </Grid>
            );
          })}
        </Grid>
      </Container>
      {/* Modales como diálogos flotantes */}
      <Suspense fallback={<CircularProgress />}>
        {settingsConfig.map((config) => {
          const ModalComponent = config.modal;
          const isOpen = openModal === config.id;
          
          return (
            <Box key={config.id}>
              {isOpen && (
                <Dialog
                  open={isOpen}
                  onClose={handleCloseModal}
                  maxWidth="md"
                  fullWidth
                  PaperProps={{
                    sx: {
                      borderRadius: 3,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  <ModalComponent
                    onClose={handleCloseModal}
                  />
                </Dialog>
              )}
            </Box>
          );
        })}
      </Suspense>
    </Box>
  );
};

export default Settings;

// También exportar con nombre para compatibilidad
export { Settings };

