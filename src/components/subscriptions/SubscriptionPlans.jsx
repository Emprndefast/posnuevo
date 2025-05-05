import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Container,
  Divider,
  Paper,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Check as CheckIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  LocalOffer as LocalOfferIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Update as UpdateIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  Group as GroupIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { styled } from '@mui/material/styles';
import { useSubscription } from '../../hooks/useSubscription';
import { useLocation, useNavigate } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
  },
}));

const FeatureList = styled('ul')({
  listStyle: 'none',
  padding: 0,
  margin: '20px 0',
});

const FeatureItem = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const plans = [
  {
    id: 'free',
    name: 'Prueba Gratis',
    price: 0,
    period: 'mes',
    features: [
      'Facturación básica disponible',
      'Hasta 20 productos en inventario',
      'Solo 1 usuario permitido',
      'Soporte únicamente por email (no prioritario)',
      'Sin facturación electrónica avanzada',
      'Sin backup automático en la nube',
      'Sin personalización de facturas (sin logo)',
      'Sin reportes avanzados de ventas',
      'Sin integraciones con otros sistemas',
      'Sin integración con otros dispositivos',
    ],
    limitations: {
      products: 20,
      users: 1,
      support: '48h',
      backup: 'manual',
      registers: 1
    },
    icon: <LocalOfferIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    title: 'Prueba Gratis',
    buttonText: 'Comenzar Gratis',
    highlighted: false,
    description: 'Solo por 15 días',
  },
  {
    id: 'basic',
    name: 'Plan Básico',
    price: 1000,
    period: 'mes',
    features: [
      'Facturación ilimitada básica',
      'Máximo 200 productos',
      'Hasta 2 usuarios',
      'Sin backup automático',
      'Soporte básico por email',
      'Sin integraciones externas',
      'Reportes básicos',
    ],
    limitations: {
      products: 200,
      users: 2,
      support: '24h',
      backup: 'manual',
      registers: 2
    },
    icon: <LocalOfferIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    title: 'Plan Básico',
    buttonText: 'Elegir Básico',
    highlighted: false,
    hostedButtonId: 'R9AUWJE3LPB4J',
    description: 'Para negocios pequeños',
  },
  {
    id: 'pro',
    name: 'Plan Profesional',
    price: 2000,
    period: 'mes',
    features: [
      'Hasta 750 productos',
      'Hasta 10 usuarios',
      'Facturación electrónica avanzada',
      'Backup automático en la nube',
      'Personalización de factura con logo y datos',
      'Reportes avanzados',
      'Soporte 24/7',
    ],
    limitations: {
      products: 750,
      users: 10,
      support: '24/7',
      backup: 'nube',
      registers: 'ilimitado'
    },
    icon: <StarIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
    title: 'Plan Profesional',
    buttonText: 'Elegir Profesional',
    highlighted: true,
    hostedButtonId: '4YT6DN8ENNZEG',
    description: 'Para negocios establecidos',
  },
  {
    id: 'business',
    name: 'Plan Empresarial',
    price: 3250,
    period: 'mes',
    features: [
      'Facturación ilimitada + analítica avanzada',
      'Productos y usuarios ilimitados',
      'Backup en tiempo real en la nube',
      'Soporte dedicado 24/7 con asesor personal',
      'Integraciones API avanzadas + CRM / ERP',
      'Reportes inteligentes + asesorías',
    ],
    limitations: {
      products: 'ilimitado',
      users: 'ilimitado',
      support: '24/7',
      backup: 'nube',
      registers: 'ilimitado'
    },
    icon: <BusinessIcon sx={{ fontSize: 40, color: 'info.main' }} />,
    title: 'Plan Empresarial',
    buttonText: 'Elegir Empresarial',
    highlighted: false,
    hostedButtonId: 'M3BQWFCN9ELSQ',
    description: 'Para grandes empresas',
  }
];

const FeatureCategory = ({ title, icon, children }) => (
  <Box sx={{ mb: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {icon}
      <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
);

const PlanHighlight = ({ text, color = 'primary' }) => (
  <Chip
    label={text}
    color={color}
    size="small"
    sx={{ 
      ml: 1,
      height: 20,
      '& .MuiChip-label': {
        px: 1,
        fontSize: '0.75rem',
        fontWeight: 600
      }
    }}
  />
);

// Utilidad para validar fecha
function isValidDate(date) {
  if (!date) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
}

// Agregar la función para abrir el popup de PayPal
const openPayPalPopup = (hostedButtonId, userId, planId) => {
  const popup = window.open(
    '',
    'PayPalPago',
    'width=500,height=700'
  );
  if (popup) {
    popup.document.write(`
      <html>
        <head>
          <title>Pagar con PayPal</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #f4f6fb;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .container {
              background: #fff;
              border-radius: 12px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.08);
              padding: 32px 24px 24px 24px;
              display: flex;
              flex-direction: column;
              align-items: center;
              min-width: 320px;
            }
            h2 {
              margin-bottom: 8px;
              color: #222;
              font-size: 1.4rem;
              font-weight: 700;
            }
            p {
              margin-bottom: 24px;
              color: #555;
              font-size: 1rem;
              text-align: center;
            }
          </style>
          <script src="https://www.paypal.com/sdk/js?client-id=BAA3zpEv3CRtJ-4mmbdJzPmFa2zr-gnJyTDSqQhL5eAlp08l21b3HqgVV1sJLYCj6YLf4rLsFDyg7oSAz0&components=hosted-buttons&disable-funding=venmo&currency=USD"></script>
        </head>
        <body>
          <div class="container">
            <h2>Pago Seguro con PayPal</h2>
            <p>Haz clic en el botón para completar tu suscripción.<br>Serás redirigido automáticamente después del pago.</p>
            <div id="paypal-container-${hostedButtonId}"></div>
          </div>
          <script>
            function notifyParentPaid() {
              if (window.opener) {
                window.opener.postMessage({ paypalPaid: true }, '*');
              }
            }
            document.addEventListener('DOMContentLoaded', function() {
              if (window.paypal && window.paypal.HostedButtons) {
                window.paypal.HostedButtons({
                  hostedButtonId: '${hostedButtonId}',
                  custom: '${userId}:${planId}',
                  onApprove: function() { notifyParentPaid(); }
                }).render('#paypal-container-${hostedButtonId}');
              } else {
                var interval = setInterval(function() {
                  if (window.paypal && window.paypal.HostedButtons) {
                    window.paypal.HostedButtons({
                      hostedButtonId: '${hostedButtonId}',
                      custom: '${userId}:${planId}',
                      onApprove: function() { notifyParentPaid(); }
                    }).render('#paypal-container-${hostedButtonId}');
                    clearInterval(interval);
                  }
                }, 200);
              }
            });
          </script>
        </body>
      </html>
    `);
    popup.document.close();
  }
};

export const SubscriptionPlans = () => {
  // --- HOOKS AL INICIO DEL COMPONENTE ---
  const location = useLocation();
  const { subscription, loading: subscriptionLoading, error: subscriptionError, subscribe, cancelSubscription, checkSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const paypalRef = useRef(null);
  const [currency, setCurrency] = useState({ code: 'DOP', symbol: 'RD$', locale: 'es-DO', rate: 1 });
  const [paypalPaid, setPaypalPaid] = useState(false);

  // Efecto para verificar la suscripción cuando el componente se monta
  useEffect(() => {
    if (user && !subscription) {
      checkSubscription().catch(console.error);
    }
  }, [user, checkSubscription]);

  // Efecto para actualizar el estado cuando cambia la suscripción
  useEffect(() => {
    if (subscription) {
      console.log('Estado de suscripción actualizado:', subscription);
    }
  }, [subscription?.id]); // Solo actualizar cuando cambie el ID de la suscripción

  // Efecto para mostrar mensaje si viene redirigido
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
    }
  }, [location]);

  // Efecto para cargar el SDK de PayPal solo una vez
  useEffect(() => {
    if (!document.getElementById('paypal-sdk')) {
      const script = document.createElement('script');
      script.src = "https://www.paypal.com/sdk/js?client-id=BAA3zpEv3CRtJ-4mmbdJzPmFa2zr-gnJyTDSqQhL5eAlp08l21b3HqgVV1sJLYCj6YLf4rLsFDyg7oSAz0&components=hosted-buttons&disable-funding=venmo&currency=USD";
      script.id = "paypal-sdk";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Efecto para renderizar el botón de PayPal según el plan seleccionado
  useEffect(() => {
    if (
      openDialog &&
      selectedPlan?.hostedButtonId &&
      document.getElementById(`paypal-container-${selectedPlan.hostedButtonId}`)
    ) {
      const interval = setInterval(() => {
        if (window.paypal && window.paypal.HostedButtons) {
          window.paypal.HostedButtons({
            hostedButtonId: selectedPlan.hostedButtonId
          }).render(`#paypal-container-${selectedPlan.hostedButtonId}`);
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [openDialog, selectedPlan]);

  useEffect(() => {
    // Detectar país y moneda usando ipapi.co
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        let code = 'DOP', symbol = 'RD$', locale = 'es-DO';
        if (data && data.currency) {
          code = data.currency;
          switch (code) {
            case 'USD': symbol = 'US$'; locale = 'en-US'; break;
            case 'MXN': symbol = 'MXN$'; locale = 'es-MX'; break;
            case 'COP': symbol = 'COP$'; locale = 'es-CO'; break;
            case 'EUR': symbol = '€'; locale = 'es-ES'; break;
            // Puedes agregar más monedas aquí
            case 'DOP': default: symbol = 'RD$'; locale = 'es-DO'; break;
          }
        }
        // Obtener tasa de cambio si no es DOP
        if (code !== 'DOP') {
          fetch(`https://open.er-api.com/v6/latest/DOP`)
            .then(res => res.json())
            .then(ratesData => {
              const rate = ratesData.rates && ratesData.rates[code] ? ratesData.rates[code] : 1;
              setCurrency({ code, symbol, locale, rate });
            })
            .catch(() => setCurrency({ code, symbol, locale, rate: 1 }));
        } else {
          setCurrency({ code, symbol, locale, rate: 1 });
        }
      })
      .catch(() => {
        setCurrency({ code: 'DOP', symbol: 'RD$', locale: 'es-DO', rate: 1 });
      });
  }, []);

  function formatPrice(price) {
    const converted = price * currency.rate;
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0
    }).format(converted).replace(/^\D+/, currency.symbol + ' ');
  }

  // --- LÓGICA Y FUNCIONES ---
  // Determinar si la suscripción está expirada
  const isExpired = subscription && isValidDate(subscription.endDate) && new Date(subscription.endDate) < new Date();

  // Determinar el plan actual (aunque esté expirado)
  const currentPlan = plans.find(p => p.id === subscription?.planId) || plans[0];

  const handleSelectPlan = (plan) => {
    console.log('Plan seleccionado:', plan);
    setSelectedPlan(plan);
    setOpenDialog(true);
  };

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      console.log('Intentando suscribirse al plan:', selectedPlan);
      // Si es el mismo plan y está activo, mostrar mensaje
      if (subscription?.planId === selectedPlan.id && subscription?.isActive) {
        setError('Ya tienes este plan activo.');
        return;
      }
      // Intentar suscribirse al nuevo plan
      const newSubscription = await subscribe({
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        ...selectedPlan
      });
      console.log('Suscripción creada:', newSubscription);
      // Recargar el estado de la suscripción y esperar a que se actualice
      await checkSubscription();
      setSuccessMessage(`Has actualizado exitosamente al ${selectedPlan.name}.`);
      setOpenDialog(false);
      // Redirigir de vuelta a la página anterior si existe
      if (location.state?.from) {
        navigate(location.state.from.pathname);
      }
    } catch (err) {
      console.error('Error al suscribirse:', err);
      setError('Error al procesar la suscripción: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      if (!subscription?.isActive) {
        setError('No hay una suscripción activa para cancelar');
        return;
      }

      await cancelSubscription();
      
      // Cerrar el diálogo y mostrar mensaje de éxito
      setOpenCancelDialog(false);
      setSuccessMessage('Tu suscripción ha sido cancelada exitosamente. Tendrás una semana para renovar tu suscripción o el sistema se bloqueará. Tus datos permanecerán en el servidor por 30 días, después de este período serán eliminados permanentemente.');
      
      // Recargar el estado de la suscripción
      await checkSubscription();
    } catch (err) {
      console.error('Error al cancelar:', err);
      setError(err.message || 'Error al cancelar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  // Agregar useEffect para escuchar el mensaje de confirmación de PayPal
  useEffect(() => {
    function handlePaypalMessage(event) {
      if (event.data && event.data.paypalPaid) {
        setPaypalPaid(true);
      }
    }
    window.addEventListener('message', handlePaypalMessage);
    return () => window.removeEventListener('message', handlePaypalMessage);
  }, []);

  // --- RENDERIZADO ---
  // Fallback visual si no hay suscripción activa o está cancelada
  if (!subscription || !subscription.isActive) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: 'center', 
            mb: { xs: 4, sm: 6, md: 8 }
          }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                mb: 2
              }}
            >
              Planes de Suscripción
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              paragraph
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                maxWidth: '800px',
                mx: 'auto',
                mb: 4
              }}
            >
              Comienza gratis y escala según las necesidades de tu negocio
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 2,
              mb: 4
            }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  px: 3,
                  py: 1.5,
                  bgcolor: 'success.light',
                  borderRadius: 2,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Typography variant="body2" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'success.dark',
                  whiteSpace: 'nowrap'
                }}>
                  <UpdateIcon sx={{ mr: 1, fontSize: 20 }} />
                  Actualizaciones gratuitas
                </Typography>
              </Paper>
              <Paper 
                elevation={0} 
                sx={{ 
                  px: 3,
                  py: 1.5,
                  bgcolor: 'info.light',
                  borderRadius: 2,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Typography variant="body2" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'info.dark',
                  whiteSpace: 'nowrap'
                }}>
                  <SecurityIcon sx={{ mr: 1, fontSize: 20 }} />
                  Cumplimiento fiscal
                </Typography>
              </Paper>
              <Paper 
                elevation={0} 
                sx={{ 
                  px: 3,
                  py: 1.5,
                  bgcolor: 'warning.light',
                  borderRadius: 2,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Typography variant="body2" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'warning.dark',
                  whiteSpace: 'nowrap'
                }}>
                  <SupportIcon sx={{ mr: 1, fontSize: 20 }} />
                  Soporte incluido
                </Typography>
              </Paper>
            </Box>
          </Box>
          {error && (
            <Alert 
              severity="error"
              sx={{ 
                mb: 4,
                maxWidth: '800px',
                mx: 'auto',
                borderRadius: 2
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert 
              severity="success"
              sx={{ 
                mb: 4,
                maxWidth: '800px',
                mx: 'auto',
                borderRadius: 2
              }}
              onClose={() => setSuccessMessage(null)}
            >
              {successMessage}
            </Alert>
          )}
          <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 4 }} 
            justifyContent="center"
            alignItems="stretch"
            sx={{
              maxWidth: '1400px',
              mx: 'auto'
            }}
          >
            {plans.map((plan) => (
              <Grid item xs={12} sm={6} md={4} key={plan.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    border: plan.highlighted ? `2px solid ${plan.id === 'pro' ? '#9c27b0' : '#1976d2'}` : '1px solid #e0e0e0',
                    borderRadius: 4,
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
                      borderColor: plan.id === 'pro' ? '#9c27b0' : '#1976d2'
                    },
                    mx: 'auto',
                    maxWidth: { xs: '100%', sm: '340px', md: '380px' }
                  }}
                >
                  {plan.id === 'free' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 20,
                        right: -35,
                        transform: 'rotate(45deg)',
                        backgroundColor: 'success.main',
                        color: 'white',
                        padding: '4px 40px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        zIndex: 1,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      ¡GRATIS!
                    </Box>
                  )}

                  <CardContent sx={{ 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    flexGrow: 1 
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 3,
                      flexDirection: { xs: 'column', sm: 'row' },
                      textAlign: { xs: 'center', sm: 'left' }
                    }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: plan.id === 'free' ? 'success.light' :
                                  plan.id === 'pro' ? 'secondary.light' : 'primary.light',
                          mb: { xs: 2, sm: 0 },
                          mr: { sm: 2 }
                        }}
                      >
                        {plan.icon}
                      </Box>
                      <Box>
                        <Typography variant="h5" component="h2" sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1.5rem', sm: '1.75rem' }
                        }}>
                          {plan.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {plan.name}
                        </Typography>
                      </Box>
                    </Box>

                    <Box 
                      sx={{ 
                        mb: 4,
                        pb: 3,
                        borderBottom: '2px solid',
                        borderColor: plan.id === 'free' ? 'success.light' :
                                   plan.id === 'pro' ? 'secondary.light' : 'primary.light'
                      }}
                    >
                      <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                        {plan.price === 0 ? (
                          'Gratis'
                        ) : (
                          <>
                            {formatPrice(plan.price)}
                          </>
                        )}
                      </Typography>
                      {plan.id !== 'free' && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Facturado mensualmente
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        Límites del Plan
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Tooltip title="Número máximo de productos que puedes gestionar" arrow>
                            <Paper 
                              elevation={0} 
                              sx={{ 
                                p: 1.5, 
                                textAlign: 'center',
                                bgcolor: theme => theme.palette.background.paper,
                                borderRadius: 2
                              }}
                            >
                              <InventoryIcon color="primary" sx={{ mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                Productos
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {plan.limitations.products}
                              </Typography>
                            </Paper>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={6}>
                          <Tooltip title="Número de usuarios permitidos" arrow>
                            <Paper 
                              elevation={0} 
                              sx={{ 
                                p: 1.5, 
                                textAlign: 'center',
                                bgcolor: theme => theme.palette.background.paper,
                                borderRadius: 2
                              }}
                            >
                              <GroupIcon color="primary" sx={{ mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                Usuarios
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {plan.limitations.users}
                              </Typography>
                            </Paper>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={6}>
                          <Tooltip title="Tiempo de respuesta del soporte" arrow>
                            <Paper 
                              elevation={0} 
                              sx={{ 
                                p: 1.5, 
                                textAlign: 'center',
                                bgcolor: theme => theme.palette.background.paper,
                                borderRadius: 2
                              }}
                            >
                              <TimerIcon color="primary" sx={{ mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                Soporte
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {plan.limitations.support}
                              </Typography>
                            </Paper>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={6}>
                          <Tooltip title="Frecuencia de respaldo de datos" arrow>
                            <Paper 
                              elevation={0} 
                              sx={{ 
                                p: 1.5, 
                                textAlign: 'center',
                                bgcolor: theme => theme.palette.background.paper,
                                borderRadius: 2
                              }}
                            >
                              <StorageIcon color="primary" sx={{ mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                Respaldo
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {plan.limitations.backup}
                              </Typography>
                            </Paper>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <FeatureCategory 
                      title="Punto de Venta" 
                      icon={<SpeedIcon color="primary" sx={{ fontSize: 20 }} />}
                    >
                      <List disablePadding>
                        {plan.features.filter(f => 
                          f.includes('POS') || f.includes('caja') || f.includes('pago')
                        ).map((feature, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircleIcon sx={{ 
                                fontSize: 20,
                                color: plan.id === 'free' ? 'success.main' : 
                                      plan.id === 'pro' ? 'secondary.main' : 'primary.main'
                              }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{
                                variant: 'body2',
                                sx: { fontWeight: 500 }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </FeatureCategory>

                    <FeatureCategory 
                      title="Facturación e Impuestos" 
                      icon={<ReceiptIcon color="primary" sx={{ fontSize: 20 }} />}
                    >
                      <List disablePadding>
                        {plan.features.filter(f => 
                          f.includes('factur') || f.includes('impuesto') || f.includes('fiscal')
                        ).map((feature, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircleIcon sx={{ 
                                fontSize: 20,
                                color: plan.id === 'free' ? 'success.main' : 
                                      plan.id === 'pro' ? 'secondary.main' : 'primary.main'
                              }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{
                                variant: 'body2',
                                sx: { fontWeight: 500 }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </FeatureCategory>

                    <FeatureCategory 
                      title="Otras Características" 
                      icon={<StarIcon color="primary" sx={{ fontSize: 20 }} />}
                    >
                      <List disablePadding>
                        {plan.features.filter(f => 
                          !f.includes('POS') && !f.includes('caja') && !f.includes('pago') &&
                          !f.includes('factur') && !f.includes('impuesto') && !f.includes('fiscal')
                        ).map((feature, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircleIcon sx={{ 
                                fontSize: 20,
                                color: plan.id === 'free' ? 'success.main' : 
                                      plan.id === 'pro' ? 'secondary.main' : 'primary.main'
                              }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              primaryTypographyProps={{
                                variant: 'body2',
                                sx: { fontWeight: 500 }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </FeatureCategory>
                  </CardContent>

                  <CardActions sx={{ 
                    p: { xs: 2, sm: 3, md: 4 }, 
                    pt: 0,
                    flexDirection: 'column'
                  }}>
                    <Button
                      fullWidth
                      variant={subscription?.planId === plan.id ? "outlined" : "contained"}
                      onClick={() => {
                        if (plan.id !== 'free') {
                          handleSelectPlan(plan);
                        }
                      }}
                      disabled={
                        plan.id === 'free' ||
                        loading ||
                        (plan.id === 'free' && (
                          subscription?.freePlanUsed ||
                          subscription?.canUseFreePlan === false ||
                          (subscription?.planId === 'free' && subscription?.isActive)
                        )) ||
                        (subscription?.planId === plan.id && subscription?.isActive)
                      }
                      color={plan.id === 'free' ? 'success' : plan.id === 'pro' ? 'secondary' : 'primary'}
                      sx={{
                        py: 1.5,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        fontWeight: 600,
                        boxShadow: subscription?.planId === plan.id ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      {subscription?.planId === plan.id ? 'Plan Actual' : plan.buttonText}
                    </Button>
                    {plan.id === 'free' && (subscription?.freePlanUsed || subscription?.canUseFreePlan === false) && (
                      <Alert severity="warning" sx={{ mt: 2, width: '100%' }}>
                        Ya has utilizado tu período de prueba gratuito. Debes elegir un plan de pago para continuar.
                      </Alert>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Dialog 
            open={openDialog} 
            onClose={() => !loading && setOpenDialog(false)}
          >
            <DialogTitle>
              {(subscription && subscription.isActive && subscription.planId === selectedPlan?.id)
                ? 'Plan Actual'
                : 'Confirmar Cambio de Plan'}
            </DialogTitle>
            <DialogContent>
              {(subscription && subscription.isActive && subscription.planId === selectedPlan?.id) ? (
                <Typography variant="body1">
                  Ya tienes el plan {selectedPlan?.name} activo. ¿Deseas elegir un plan diferente?
                </Typography>
              ) : (
                <>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ¿Estás seguro de que deseas {subscription ? 'cambiar al' : 'suscribirte al'} {selectedPlan?.name} por {formatPrice(selectedPlan?.price)}/{selectedPlan?.period}?
                  </Typography>
                  {subscription && subscription.isActive && (
                    <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
                      Tu plan actual será reemplazado por el nuevo plan inmediatamente.
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Al confirmar, se procesará el pago y se activará tu nueva suscripción inmediatamente.
                  </Typography>
                </>
              )}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              {selectedPlan?.hostedButtonId && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setPaypalPaid(false);
                    openPayPalPopup(selectedPlan.hostedButtonId, user?.uid, selectedPlan.id);
                  }}
                  style={{ marginTop: 16, marginBottom: 16 }}
                >
                  Pagar con PayPal
                </Button>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setOpenDialog(false)} 
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleSubscribe}
                disabled={
                  loading ||
                  (selectedPlan?.id !== 'free' && !paypalPaid) ||
                  (selectedPlan?.id === 'free' && (subscription?.freePlanUsed || subscription?.canUseFreePlan === false))
                }
              >
                {loading ? <CircularProgress size={24} /> : subscription ? 'Confirmar Cambio' : 'Confirmar Suscripción'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    );
  }

  console.log('Usuario actual:', user);
  console.log('openDialog:', openDialog, 'selectedPlan:', selectedPlan);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Mostrar siempre el plan actual, aunque esté expirado
  if (subscription) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Planes de Suscripción
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Comienza gratis y escala según las necesidades de tu negocio
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
            <Paper elevation={0} sx={{ px: 2, py: 1, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'success.dark' }}>
                <UpdateIcon sx={{ mr: 1, fontSize: 20 }} />
                Actualizaciones gratuitas
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ px: 2, py: 1, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'info.dark' }}>
                <SecurityIcon sx={{ mr: 1, fontSize: 20 }} />
                Cumplimiento fiscal
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ px: 2, py: 1, bgcolor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', color: 'warning.dark' }}>
                <SupportIcon sx={{ mr: 1, fontSize: 20 }} />
                Soporte incluido
              </Typography>
            </Paper>
          </Box>
        </Box>

        {error && (
          <Alert 
            severity="error"
            sx={{ mb: 4 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert 
            severity="success"
            sx={{ mb: 4 }}
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}

        {/* Mostrar siempre el plan actual, aunque esté expirado */}
        <Alert 
          severity={isExpired ? "warning" : "info"}
          sx={{ mb: 4 }}
          action={
            subscription.isActive && !isExpired && (
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => {
                  setError(null);
                  setSuccessMessage(null);
                  setOpenCancelDialog(true);
                }}
                disabled={loading}
              >
                Cancelar Suscripción
              </Button>
            )
          }
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Tu suscripción actual
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Plan: <strong>{currentPlan?.name || 'Gratuito'}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Válido hasta: <strong>{
                isValidDate(subscription.endDate)
                  ? new Date(subscription.endDate).toLocaleDateString()
                  : 'N/A'
              }</strong>
            </Typography>
            {isExpired && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Tu suscripción ha expirado. Por favor, renueva o elige un nuevo plan para continuar usando el sistema.
              </Typography>
            )}
            {!isExpired && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Puedes cambiar tu plan en cualquier momento.
              </Typography>
            )}
          </Box>
        </Alert>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: plan.highlighted ? `2px solid ${plan.id === 'pro' ? '#9c27b0' : '#1976d2'}` : '1px solid #e0e0e0',
                  borderRadius: 4,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)',
                    borderColor: plan.id === 'pro' ? '#9c27b0' : '#1976d2'
                  },
                  mx: 'auto',
                  maxWidth: { xs: '100%', sm: '340px', md: '380px' }
                }}
              >
                {plan.id === 'free' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: -35,
                      transform: 'rotate(45deg)',
                      backgroundColor: 'success.main',
                      color: 'white',
                      padding: '4px 40px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      zIndex: 1,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    ¡GRATIS!
                  </Box>
                )}

                {/* Indicador de plan actual - solo se muestra para el plan activo */}
                {subscription?.planId === plan.id && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: 3,
                    borderColor: plan.id === 'free' ? 'success.main' : 
                               plan.id === 'pro' ? 'secondary.main' : 'primary.main',
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    zIndex: 0
                  }} />
                )}

                {/* Chip de plan actual - solo se muestra para el plan activo */}
                {subscription?.planId === plan.id && (
                  <Chip
                    label="Plan Actual"
                    color={plan.id === 'free' ? 'success' : 
                           plan.id === 'pro' ? 'secondary' : 'primary'}
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 2,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      py: 0.5,
                      px: 1,
                      '& .MuiChip-label': {
                        px: 1
                      }
                    }}
                  />
                )}

                <CardContent sx={{ 
                  p: { xs: 2, sm: 3, md: 4 }, 
                  flexGrow: 1 
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                    textAlign: { xs: 'center', sm: 'left' }
                  }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: plan.id === 'free' ? 'success.light' :
                                plan.id === 'pro' ? 'secondary.light' : 'primary.light',
                        mb: { xs: 2, sm: 0 },
                        mr: { sm: 2 }
                      }}
                    >
                      {plan.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" component="h2" sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '1.5rem', sm: '1.75rem' }
                      }}>
                        {plan.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box 
                    sx={{ 
                      mb: 4,
                      pb: 3,
                      borderBottom: '2px solid',
                      borderColor: plan.id === 'free' ? 'success.light' :
                                 plan.id === 'pro' ? 'secondary.light' : 'primary.light'
                    }}
                  >
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700 }}>
                      {plan.price === 0 ? (
                        'Gratis'
                      ) : (
                        <>
                          {formatPrice(plan.price)}
                        </>
                      )}
                    </Typography>
                    {plan.id !== 'free' && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Facturado mensualmente
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Límites del Plan
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Tooltip title="Número máximo de productos que puedes gestionar" arrow>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 1.5, 
                              textAlign: 'center',
                              bgcolor: theme => theme.palette.background.paper,
                              borderRadius: 2
                            }}
                          >
                            <InventoryIcon color="primary" sx={{ mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Productos
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {plan.limitations.products}
                            </Typography>
                          </Paper>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={6}>
                        <Tooltip title="Número de usuarios permitidos" arrow>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 1.5, 
                              textAlign: 'center',
                              bgcolor: theme => theme.palette.background.paper,
                              borderRadius: 2
                            }}
                          >
                            <GroupIcon color="primary" sx={{ mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Usuarios
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {plan.limitations.users}
                            </Typography>
                          </Paper>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={6}>
                        <Tooltip title="Tiempo de respuesta del soporte" arrow>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 1.5, 
                              textAlign: 'center',
                              bgcolor: theme => theme.palette.background.paper,
                              borderRadius: 2
                            }}
                          >
                            <TimerIcon color="primary" sx={{ mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Soporte
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {plan.limitations.support}
                            </Typography>
                          </Paper>
                        </Tooltip>
                      </Grid>
                      <Grid item xs={6}>
                        <Tooltip title="Frecuencia de respaldo de datos" arrow>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 1.5, 
                              textAlign: 'center',
                              bgcolor: theme => theme.palette.background.paper,
                              borderRadius: 2
                            }}
                          >
                            <StorageIcon color="primary" sx={{ mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Respaldo
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {plan.limitations.backup}
                            </Typography>
                          </Paper>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <FeatureCategory 
                    title="Punto de Venta" 
                    icon={<SpeedIcon color="primary" sx={{ fontSize: 20 }} />}
                  >
                    <List disablePadding>
                      {plan.features.filter(f => 
                        f.includes('POS') || f.includes('caja') || f.includes('pago')
                      ).map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon sx={{ 
                              fontSize: 20,
                              color: plan.id === 'free' ? 'success.main' : 
                                    plan.id === 'pro' ? 'secondary.main' : 'primary.main'
                            }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: { fontWeight: 500 }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </FeatureCategory>

                  <FeatureCategory 
                    title="Facturación e Impuestos" 
                    icon={<ReceiptIcon color="primary" sx={{ fontSize: 20 }} />}
                  >
                    <List disablePadding>
                      {plan.features.filter(f => 
                        f.includes('factur') || f.includes('impuesto') || f.includes('fiscal')
                      ).map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon sx={{ 
                              fontSize: 20,
                              color: plan.id === 'free' ? 'success.main' : 
                                    plan.id === 'pro' ? 'secondary.main' : 'primary.main'
                            }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: { fontWeight: 500 }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </FeatureCategory>

                  <FeatureCategory 
                    title="Otras Características" 
                    icon={<StarIcon color="primary" sx={{ fontSize: 20 }} />}
                  >
                    <List disablePadding>
                      {plan.features.filter(f => 
                        !f.includes('POS') && !f.includes('caja') && !f.includes('pago') &&
                        !f.includes('factur') && !f.includes('impuesto') && !f.includes('fiscal')
                      ).map((feature, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon sx={{ 
                              fontSize: 20,
                              color: plan.id === 'free' ? 'success.main' : 
                                    plan.id === 'pro' ? 'secondary.main' : 'primary.main'
                            }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: { fontWeight: 500 }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </FeatureCategory>
                </CardContent>

                <CardActions sx={{ 
                  p: { xs: 2, sm: 3, md: 4 }, 
                  pt: 0,
                  flexDirection: 'column'
                }}>
                  <Button
                    fullWidth
                    variant={subscription?.planId === plan.id ? "outlined" : "contained"}
                    onClick={() => {
                      if (plan.id !== 'free') {
                        handleSelectPlan(plan);
                      }
                    }}
                    disabled={
                      plan.id === 'free' ||
                      loading ||
                      (plan.id === 'free' && (
                        subscription?.freePlanUsed ||
                        subscription?.canUseFreePlan === false ||
                        (subscription?.planId === 'free' && subscription?.isActive)
                      )) ||
                      (subscription?.planId === plan.id && subscription?.isActive)
                    }
                    color={plan.id === 'free' ? 'success' : plan.id === 'pro' ? 'secondary' : 'primary'}
                    sx={{
                      py: 1.5,
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      fontWeight: 600,
                      boxShadow: subscription?.planId === plan.id ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    {subscription?.planId === plan.id ? 'Plan Actual' : plan.buttonText}
                  </Button>
                  {plan.id === 'free' && (subscription?.freePlanUsed || subscription?.canUseFreePlan === false) && (
                    <Alert severity="warning" sx={{ mt: 2, width: '100%' }}>
                      Ya has utilizado tu período de prueba gratuito. Debes elegir un plan de pago para continuar.
                    </Alert>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog
          open={openCancelDialog}
          onClose={() => !loading && setOpenCancelDialog(false)}
        >
          <DialogTitle>
            Confirmar Cancelación de Suscripción
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              ¿Estás seguro de que deseas cancelar tu suscripción al plan {subscription?.planName || ''}?
            </Typography>
            <Typography variant="body2" color="warning.main" sx={{ mb: 2 }}>
              Al cancelar tu suscripción:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <TimerIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Tienes 7 días para renovar tu suscripción"
                  secondary="Después de este período, el sistema se bloqueará"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StorageIcon color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Tus datos se mantendrán por 30 días"
                  secondary="Después de este período, todos tus datos serán eliminados permanentemente"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocalOfferIcon color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="No podrás acceder al sistema sin una suscripción activa"
                  secondary="Renueva tu suscripción para mantener el acceso completo"
                />
              </ListItem>
            </List>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mt: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setOpenCancelDialog(false);
                setError(null);
              }} 
              disabled={loading}
            >
              Mantener Suscripción
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleCancelSubscription}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  return null;
}; 