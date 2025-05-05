import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Divider
} from '@mui/material';

export const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Política de Privacidad
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Última actualización: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Información que Recopilamos
          </Typography>
          <Typography paragraph>
            Recopilamos información que usted nos proporciona directamente, incluyendo:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <Typography component="li">Información de contacto (nombre, email, teléfono)</Typography>
            <Typography component="li">Información de la empresa</Typography>
            <Typography component="li">Datos de transacciones y ventas</Typography>
            <Typography component="li">Información de inventario</Typography>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Uso de la Información
          </Typography>
          <Typography paragraph>
            Utilizamos la información recopilada para:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <Typography component="li">Proporcionar y mantener nuestro servicio</Typography>
            <Typography component="li">Procesar transacciones</Typography>
            <Typography component="li">Enviar notificaciones importantes</Typography>
            <Typography component="li">Mejorar nuestros servicios</Typography>
            <Typography component="li">Cumplir con obligaciones legales</Typography>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. Compartir Información
          </Typography>
          <Typography paragraph>
            No vendemos ni compartimos su información personal con terceros, excepto:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <Typography component="li">Proveedores de servicios que nos ayudan a operar</Typography>
            <Typography component="li">Cuando sea requerido por ley</Typography>
            <Typography component="li">Con su consentimiento explícito</Typography>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Seguridad de Datos
          </Typography>
          <Typography paragraph>
            Implementamos medidas de seguridad técnicas y organizativas para proteger su información. Sin embargo, ningún método de transmisión por Internet es 100% seguro.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. Sus Derechos
          </Typography>
          <Typography paragraph>
            Usted tiene derecho a:
          </Typography>
          <Typography component="ul" sx={{ pl: 2 }}>
            <Typography component="li">Acceder a su información personal</Typography>
            <Typography component="li">Corregir información inexacta</Typography>
            <Typography component="li">Solicitar la eliminación de sus datos</Typography>
            <Typography component="li">Oponerse al procesamiento de sus datos</Typography>
            <Typography component="li">Solicitar la portabilidad de sus datos</Typography>
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Cookies y Tecnologías Similares
          </Typography>
          <Typography paragraph>
            Utilizamos cookies y tecnologías similares para mejorar su experiencia, analizar el uso del servicio y personalizar el contenido.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            7. Cambios en la Política
          </Typography>
          <Typography paragraph>
            Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos cualquier cambio publicando la nueva política en esta página.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            8. Contacto
          </Typography>
          <Typography paragraph>
            Si tiene preguntas sobre esta política de privacidad, contáctenos en privacidad@posrepair.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}; 