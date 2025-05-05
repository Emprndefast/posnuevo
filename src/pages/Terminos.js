import React from 'react';
import {
  Container, Typography, Box, Paper, Divider, Button
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from './ThemeContext';

function Terminos() {
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
          Términos y Condiciones
        </Typography>
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          1. Aceptación de los Términos
        </Typography>
        <Typography paragraph>
          Al acceder y utilizar esta aplicación, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no podrá acceder a la aplicación.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. Uso de la Aplicación
        </Typography>
        <Typography paragraph>
          Esta aplicación está diseñada para gestionar reparaciones, inventario y clientes. Usted se compromete a utilizar la aplicación solo para fines legítimos y de acuerdo con estos términos.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Cuentas de Usuario
        </Typography>
        <Typography paragraph>
          Para acceder a ciertas funciones de la aplicación, debe registrarse para obtener una cuenta. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Privacidad
        </Typography>
        <Typography paragraph>
          Su privacidad es importante para nosotros. Nuestra Política de Privacidad explica cómo recopilamos, usamos y protegemos su información personal.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Propiedad Intelectual
        </Typography>
        <Typography paragraph>
          Todo el contenido, marcas, logotipos, software y cualquier otro material contenido en la aplicación están protegidos por derechos de autor y otras leyes de propiedad intelectual.
        </Typography>

        <Typography variant="h6" gutterBottom>
          6. Limitación de Responsabilidad
        </Typography>
        <Typography paragraph>
          En ningún caso seremos responsables por daños directos, indirectos, incidentales, especiales o consecuentes que resulten del uso o la imposibilidad de usar la aplicación.
        </Typography>

        <Typography variant="h6" gutterBottom>
          7. Modificaciones de los Términos
        </Typography>
        <Typography paragraph>
          Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la aplicación.
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

export default Terminos; 