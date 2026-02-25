import React, { useState, startTransition } from 'react';
import {
  Container, TextField, Button, Typography, Box, Snackbar, Alert, Link,
  Paper, useTheme, useMediaQuery, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme as useCustomTheme } from './ThemeContext';
import { subscriptionService } from '../services/subscriptionService';
import { useAuth } from '../context/AuthContextMongo';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [trialExpiredDialog, setTrialExpiredDialog] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { darkMode } = useCustomTheme();
  const { login: authLogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authLogin(email, password);
      
      if (result.success) {
        // Obtener datos del usuario del contexto después del login
        const token = localStorage.getItem('token');
        if (token) {
          // Importar dinámicamente el método para obtener el perfil
          const { default: api } = await import('../api/api');
          try {
            const profileResponse = await api.get('/auth/profile');
            if (profileResponse.data.success) {
              const userData = profileResponse.data.user;
              
              // Verificar si el usuario está en período de prueba
              if (userData._id || userData.id) {
                const trialStatus = await subscriptionService.checkTrialExpiration(userData._id || userData.id);
                
                if (trialStatus.isExpired) {
                  setTrialExpiredDialog(true);
                  setLoading(false);
                  return;
                }
              }

              // Mostrar mensaje de bienvenida con nombre del usuario
              const userName = userData?.nombre || userData?.name || userData?.email?.split('@')[0] || 'Usuario';
              setSnackbar({ open: true, message: `Bienvenido ${userName}`, severity: 'success' });

              setTimeout(() => {
                // Navegar al dashboard por defecto
                navigate('/dashboard', { replace: true });
              }, 1000);
            }
          } catch (profileErr) {
            console.error('Error obteniendo perfil:', profileErr);
            // De todos modos navegar al dashboard
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1000);
          }
        }
      } else {
        setError(result.error || 'Correo o contraseña incorrectos');
        setSnackbar({ open: true, message: result.error || 'Correo o contraseña incorrectos', severity: 'error' });
      }
    } catch (err) {
      setError('Correo o contraseña incorrectos');
      setSnackbar({ open: true, message: 'Correo o contraseña incorrectos', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTrialExpiredClose = () => {
    setTrialExpiredDialog(false);
    navigate('/subscription');
  };

  const handleOpenResetDialog = () => {
    setResetEmail(email);
    setResetDialog(true);
  };

  const handleCloseResetDialog = () => {
    setResetDialog(false);
    setResetEmail('');
  };

  const handleSendResetEmail = async () => {
    setResetLoading(true);
    try {
      // TODO: Implementar endpoint en backend para reset de contraseña
      const { default: authApi } = await import('../api/auth');
      await authApi.resetPassword(resetEmail);
      setSnackbar({ open: true, message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.', severity: 'success' });
      setResetDialog(false);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al enviar el correo de recuperación. Verifica el correo ingresado.', severity: 'error' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Container maxWidth="xs">
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 4 }, 
            borderRadius: 3,
            bgcolor: '#ffffff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <Box display="flex" justifyContent="center" mb={4}>
            <img
              src="/Logo.png"
              alt="POSENT"
              style={{
                maxWidth: isMobile ? 120 : 140,
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Box>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            align="center"
            sx={{
              fontWeight: 500,
              mb: 2,
              color: theme.palette.text.main
            }}
          >
            POSENT
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              fontWeight: 400,
              mb: 2,
              color: theme.palette.text.secondary,
              fontStyle: 'italic',
              letterSpacing: '0.5px',
            }}
          >
            Sistema de venta moderno y móvil
          </Typography>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            gutterBottom 
            align="center" 
            sx={{ 
              fontWeight: 700,
              mb: 3,
              color: theme.palette.primary.main,
              letterSpacing: '-0.5px',
            }}
          >
            Iniciar Sesión
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              margin="normal"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                },
              }}
              disabled={loading}
            />
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              margin="normal"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  '&:hover': {
                    backgroundColor: '#f1f5f9',
                  },
                },
              }}
              disabled={loading}
            />
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ 
                mt: 2, 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión'}
            </Button>
          </form>
          <Button
            onClick={() => startTransition(() => navigate('/register'))}
            variant="outlined"
            sx={{ 
              mt: 2,
              width: '100%',
              borderRadius: 2,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
              },
            }}
            disabled={loading}
          >
            Crear cuenta nueva
          </Button>
          <Box textAlign="center" mt={2}>
            <Button color="primary" onClick={handleOpenResetDialog} sx={{ textTransform: 'none' }}>
              ¿Olvidaste tu contraseña?
            </Button>
          </Box>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center" 
            sx={{ mt: 4, px: 2, lineHeight: 1.6 }}
          >
            Al continuar, aceptas nuestros{' '}
            <Link 
              component="a"
              href="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover" 
              color="primary" 
              sx={{ fontWeight: 600 }}
              onClick={(e) => {
                e.preventDefault();
                window.open('/terminos', '_blank', 'noopener,noreferrer');
              }}
            >
              Términos y Condiciones
            </Link>{' '}
            y nuestra{' '}
            <Link 
              component="a"
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover" 
              color="primary" 
              sx={{ fontWeight: 600 }}
              onClick={(e) => {
                e.preventDefault();
                window.open('/privacidad', '_blank', 'noopener,noreferrer');
              }}
            >
              Política de Privacidad
            </Link>.
          </Typography>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              severity={snackbar.severity}
              variant="filled"
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              sx={{ 
                width: '100%',
                borderRadius: 2,
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          <Dialog
            open={trialExpiredDialog}
            onClose={handleTrialExpiredClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                p: 2
              }
            }}
          >
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 600 }}>
              Período de Prueba Expirado
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" align="center" sx={{ mb: 2 }}>
                Tu período de prueba ha expirado. Para continuar usando nuestros servicios, por favor realiza tu pago.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleTrialExpiredClose}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4
                }}
              >
                Ir a Suscripción
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={resetDialog} onClose={handleCloseResetDialog}>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.<br />
                Si tienes problemas, contáctanos a <b>posntrd@gmail.com</b> o WhatsApp <b>+1 809-340-8435</b>.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Correo electrónico"
                type="email"
                fullWidth
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseResetDialog} disabled={resetLoading}>Cancelar</Button>
              <Button onClick={handleSendResetEmail} disabled={resetLoading || !resetEmail} variant="contained">
                {resetLoading ? <CircularProgress size={20} /> : 'Enviar correo'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;