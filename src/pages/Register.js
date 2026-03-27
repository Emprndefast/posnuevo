import React, { useState } from 'react';
import {
  Container, TextField, Button, Typography, Box, MenuItem, Snackbar, Alert, Link, InputAdornment, IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../services/subscriptionService';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import * as authApi from '../api/auth';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'staff', label: 'Staff' },
  { value: 'usuario', label: 'Usuario' },
];

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [role, setRole] = useState('usuario');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [telefono, setTelefono] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setSnackbar({ open: true, message: 'Las contraseñas no coinciden.', severity: 'error' });
      return;
    }
    try {
      // Validar si el email o teléfono ya usaron el trial
      const isBlocked = await subscriptionService.isUserBlockedByEmailOrPhone(email, telefono);
      if (isBlocked) {
        setError('Este correo o teléfono ya ha utilizado la prueba gratuita. Debes adquirir un plan para continuar.');
        setSnackbar({ open: true, message: 'Este correo o teléfono ya ha utilizado la prueba gratuita. Debes adquirir un plan para continuar.', severity: 'error' });
        return;
      }
      
      const response = await authApi.register({
        email,
        password,
        name: nombre,
        role,
        phone: telefono
      });
      
      if (response.success) {
        // Activar automáticamente el plan gratuito al registrar el usuario
        await subscriptionService.createSubscription(response.data.id || response.data._id, {
          id: 'free',
          name: 'Prueba Gratis',
          price: 0,
          period: 'mes',
          features: [
            'Facturación básica',
            'Gestión limitada de productos',
          ],
          limitations: {
            products: 20,
            users: 1,
            support: '48h',
            backup: 'manual',
            registers: 1
          }
        });
        setSnackbar({ open: true, message: 'Usuario registrado correctamente', severity: 'success' });
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setError(response.message || 'Error al registrar usuario');
        setSnackbar({ open: true, message: response.message || 'Error al registrar usuario', severity: 'error' });
      }
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
      setSnackbar({ open: true, message: err.message || 'Error al registrar usuario', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Box display="flex" justifyContent="center" mb={3}>
          <img
            src="/Logo.png"
            alt="POSENT"
            style={{
              maxWidth: 120,
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </Box>
        <Typography variant="h4" gutterBottom>Crear Cuenta</Typography>
        <form onSubmit={handleRegister}>
          <TextField
            label="Nombre"
            type="text"
            fullWidth
            margin="normal"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <TextField
            label="Correo"
            type="email"
            fullWidth
            margin="normal"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Teléfono"
            type="tel"
            fullWidth
            margin="normal"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <TextField
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Mostrar/ocultar contraseña"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Repetir contraseña"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Mostrar/ocultar contraseña"
                    onClick={() => setShowConfirmPassword((show) => !show)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            select
            label="Rol"
            fullWidth
            margin="normal"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            {ROLES.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Registrarse
          </Button>
        </form>
        <Button
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Ya tengo una cuenta
        </Button>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          Al continuar, aceptas nuestros{' '}
          <Link href="/terms" underline="hover" color="primary" sx={{ fontWeight: 'bold' }}>
            Términos
          </Link>{' '}
          y{' '}
          <Link href="/privacy" underline="hover" color="primary" sx={{ fontWeight: 'bold' }}>
            Políticas de Privacidad
          </Link>.
        </Typography>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ open: false, message: '', severity: snackbar.severity })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar({ open: false, message: '', severity: snackbar.severity })}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default Register;