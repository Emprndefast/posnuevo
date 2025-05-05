import React from 'react';
import {
  Container, Typography, Box, Paper, Divider, Button
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';

function Privacidad() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const handleVolver = () => {
    // Si hay historial, volver atrás, si no, ir al login
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/login');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          backgroundColor: darkMode ? '#1E1E1E' : '#fff'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Política de Privacidad
        </Typography>
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          1. Recopilación de Información
        </Typography>
        <Typography paragraph>
          Recopilamos información cuando usted se registra en nuestra aplicación, inicia sesión y realiza operaciones. La información incluye su nombre, correo electrónico, y datos relacionados con el uso del sistema.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. Uso de la Información
        </Typography>
        <Typography paragraph>
          La información que recopilamos se utiliza para:
          • Personalizar su experiencia
          • Mejorar nuestro servicio
          • Procesar transacciones
          • Enviar correos electrónicos sobre actualizaciones o servicios
          • Administrar su cuenta
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Protección de la Información
        </Typography>
        <Typography paragraph>
          Implementamos una variedad de medidas de seguridad para mantener la seguridad de su información personal. Utilizamos encriptación avanzada para proteger información sensible transmitida en línea.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Cookies
        </Typography>
        <Typography paragraph>
          Utilizamos cookies para mejorar el acceso a nuestra aplicación y para entender los patrones de uso. Puede elegir que su navegador rechace las cookies, pero esto podría afectar el funcionamiento de la aplicación.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Divulgación a Terceros
        </Typography>
        <Typography paragraph>
          No vendemos, intercambiamos ni transferimos su información personal identificable a terceros. Esto no incluye terceros de confianza que nos ayudan a operar nuestra aplicación.
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Consentimiento
        </Typography>
        <Typography paragraph>
          Al utilizar nuestra aplicación, usted consiente nuestra política de privacidad.
        </Typography>

        <Typography variant="h6" gutterBottom>
          7. Cambios en la Política de Privacidad
        </Typography>
        <Typography paragraph>
          Cualquier cambio en nuestra política de privacidad será publicado en esta página y, cuando sea apropiado, se le notificará por correo electrónico.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleVolver}
          >
            Volver
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/login"
          >
            Ir al Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Privacidad; 