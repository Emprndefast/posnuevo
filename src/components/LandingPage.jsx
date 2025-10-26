import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Grid, Card, CardContent, CardActions } from '@mui/material';
import { Login as LoginIcon, PersonAdd as RegisterIcon } from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          POSENT - Sistema POS Avanzado
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          La solución completa para gestionar tu negocio
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            sx={{ px: 4, py: 1.5 }}
          >
            Iniciar Sesión
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<RegisterIcon />}
            onClick={handleRegister}
            sx={{ px: 4, py: 1.5 }}
          >
            Registrarse
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Gestión de Inventario
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Controla tu stock, productos y proveedores de manera eficiente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Ventas y Facturación
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Procesa ventas, genera facturas y maneja pagos fácilmente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Reportes y Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analiza el rendimiento de tu negocio con reportes detallados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Call to Action */}
      <Box sx={{ textAlign: 'center', bgcolor: 'grey.50', p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          ¿Listo para comenzar?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Únete a miles de negocios que ya confían en POSENT
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleRegister}
          sx={{ px: 6, py: 2 }}
        >
          Crear Cuenta Gratuita
        </Button>
      </Box>
    </Container>
  );
};

export default LandingPage;
