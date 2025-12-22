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
  Dialog,
  Stack,
  Divider,
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
  KeyboardArrowRight,
  Storefront,
  Devices,
  IntegrationInstructions,
  Tune,
} from '@mui/icons-material';

import { useTelegram } from '../../context/TelegramContext';
import ProCard from '../common/ui/ProCard';

// Lazy load modals
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

// Componente para un item de configuración individual
const SettingItem = ({ icon: Icon, title, description, color, onClick, isConfigured }) => {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderRadius: 2,
        '&:hover': {
          bgcolor: alpha(color, 0.05),
          transform: 'translateX(4px)'
        }
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 3,
          bgcolor: alpha(color, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mr: 2,
          flexShrink: 0
        }}
      >
        <Icon sx={{ color: color, fontSize: 24 }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle1" fontWeight={600} noWrap>
            {title}
          </Typography>
          {isConfigured && (
            <Chip
              label="Configurado"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main
              }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap>
          {description}
        </Typography>
      </Box>
      <KeyboardArrowRight sx={{ color: 'text.disabled' }} />
    </Box>
  );
};

// Componente para un grupo de configuraciones
const SettingsGroup = ({ title, icon: Icon, description, items, onOpenModal }) => {
  const theme = useTheme();

  return (
    <ProCard
      elevation={0}
      sx={{
        height: '100%',
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.02)
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
          <Icon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Stack divider={<Divider flexItem />} spacing={0} sx={{ p: 1 }}>
        {items.map((item) => (
          <SettingItem
            key={item.id}
            {...item}
            onClick={() => onOpenModal(item.id)}
          />
        ))}
      </Stack>
    </ProCard>
  );
};

const Settings = () => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(null);
  const { config: telegramConfig } = useTelegram();

  const handleOpenModal = (id) => {
    startTransition(() => {
      setOpenModal(id);
    });
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  // Definición de grupos y sus items
  const groups = [
    {
      id: 'commerce',
      title: 'Comercio',
      description: 'Gestión de identidad, facturación y finanzas',
      icon: Storefront,
      items: [
        {
          id: 'empresa',
          title: 'Información del Negocio',
          description: 'Logo, RNC, dirección y datos fiscales',
          icon: Business,
          color: '#7C3AED',
          modal: EmpresaConfigModal,
        },
        {
          id: 'facturacion',
          title: 'Facturación',
          description: 'NCF, tipos de factura y secuencias',
          icon: Receipt,
          color: '#059669',
          modal: FacturacionConfigModal,
        },
        {
          id: 'bancos',
          title: 'Bancos y Pagos',
          description: 'Cuentas bancarias y métodos de pago',
          icon: AccountBalance,
          color: '#DC2626',
          modal: BancosConfigModal,
        },
      ]
    },
    {
      id: 'hardware',
      title: 'Hardware y Red',
      description: 'Impresoras, cajones y dispositivos',
      icon: Devices,
      items: [
        {
          id: 'impresoras',
          title: 'Impresoras',
          description: 'Térmicas, fiscales y etiquetas',
          icon: LocalPrintshop,
          color: '#10B981',
          modal: ImpresoraConfigModal,
        },
      ]
    },
    {
      id: 'system',
      title: 'Sistema y Preferencias',
      description: 'Personalización, seguridad y respaldos',
      icon: Tune,
      items: [
        {
          id: 'general',
          title: 'General',
          description: 'Opciones básicas del sistema',
          icon: SettingsIcon,
          color: '#6B7280',
          modal: GeneralConfigModal,
        },
        {
          id: 'apariencia',
          title: 'Apariencia',
          description: 'Temas, colores y diseño visual',
          icon: Palette,
          color: '#EC4899',
          modal: AparienciaConfigModal,
        },
        {
          id: 'idioma',
          title: 'Idioma / Región',
          description: 'Lenguaje y formatos de fecha',
          icon: Translate,
          color: '#3B82F6',
          modal: IdiomaConfigModal,
        },
        {
          id: 'seguridad',
          title: 'Seguridad',
          description: 'Usuarios, contraseñas y accesos',
          icon: Security,
          color: '#EF4444',
          modal: SeguridadConfigModal,
        },
        {
          id: 'notificaciones',
          title: 'Notificaciones',
          description: 'Alertas de stock y eventos',
          icon: Notifications,
          color: '#F59E0B',
          modal: NotificacionesConfigModal,
        },
        {
          id: 'respaldos',
          title: 'Copias de Seguridad',
          description: 'Backup automático y restauración',
          icon: CloudUpload,
          color: '#8B5CF6',
          modal: RespaldosConfigModal,
        },
      ]
    },
    {
      id: 'integrations',
      title: 'Integraciones',
      description: 'Conexiones con servicios externos',
      icon: IntegrationInstructions,
      items: [
        {
          id: 'whatsapp',
          title: 'WhatsApp Business',
          description: 'Mensajería automática y confirmaciones',
          icon: WhatsAppIcon,
          color: '#25D366',
          modal: WhatsAppConfigModal,
        },
        {
          id: 'telegram',
          title: 'Bot de Telegram',
          description: 'Notificaciones administrativas',
          icon: LocalAtm,
          color: '#26A5E4',
          modal: TelegramConfigModal,
          isConfigured: Boolean(telegramConfig?.botToken && telegramConfig?.chatId)
        },
        {
          id: 'integraciones',
          title: 'Otras Integraciones',
          description: 'API Keys y servicios de terceros',
          icon: Extension,
          color: '#6366F1',
          modal: IntegracionesConfigModal,
        },
      ]
    },
  ];

  // Aplanar la lista de items para el renderizado de modales
  const allSettings = groups.flatMap(group => group.items);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 8 }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
            Configuración
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
            Administra todas las opciones de tu sistema POS. Los cambios se guardan automáticamente en tu base de datos segura.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} md={6} xl={3} key={group.id}>
              <SettingsGroup
                {...group}
                onOpenModal={handleOpenModal}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      <Suspense fallback={<CircularProgress />}>
        {allSettings.map((setting) => {
          const ModalComponent = setting.modal;
          const isOpen = openModal === setting.id;

          if (!isOpen && !openModal) return null; // Optimización simple render

          return (
            isOpen && (
              <Dialog
                key={setting.id}
                open={isOpen}
                onClose={handleCloseModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden'
                  }
                }}
              >
                <ModalComponent onClose={handleCloseModal} />
              </Dialog>
            )
          );
        })}
      </Suspense>
    </Box>
  );
};

export default Settings;
export { Settings };

