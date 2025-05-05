import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Divider
} from '@mui/material';

export const TermsAndConditions = () => {
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Términos y Condiciones
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Última actualización: {new Date().toLocaleDateString()}
        </Typography>

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            1. Aceptación de los Términos
          </Typography>
          <Typography paragraph>
            Al acceder y utilizar nuestro sistema POS, usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguna parte de los términos, no podrá acceder al servicio.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            2. Descripción del Servicio
          </Typography>
          <Typography paragraph>
            Nuestro sistema POS es una plataforma de gestión de punto de venta que incluye funciones de inventario, ventas, reparaciones y reportes. El servicio se proporciona "tal cual" y "según disponibilidad".
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            3. Suscripciones y Pagos
          </Typography>
          <Typography paragraph>
            Los precios de nuestros planes de suscripción están sujetos a cambios con previo aviso. Los pagos se realizarán por adelantado y no son reembolsables. Las suscripciones se renovarán automáticamente a menos que sean canceladas.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            4. Uso del Servicio
          </Typography>
          <Typography paragraph>
            Usted se compromete a utilizar el servicio de manera legal y ética. No está permitido el uso del servicio para actividades fraudulentas o que violen derechos de terceros.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            5. Privacidad y Datos
          </Typography>
          <Typography paragraph>
            Recopilamos y procesamos datos de acuerdo con nuestra Política de Privacidad. Al utilizar nuestro servicio, usted acepta nuestra política de privacidad.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            6. Limitación de Responsabilidad
          </Typography>
          <Typography paragraph>
            No nos hacemos responsables por daños indirectos, incidentales o consecuentes que puedan resultar del uso o la imposibilidad de usar el servicio.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            7. Modificaciones del Servicio
          </Typography>
          <Typography paragraph>
            Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento, con o sin previo aviso. No seremos responsables ante usted o terceros por cualquier modificación, suspensión o discontinuación del servicio.
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            8. Contacto
          </Typography>
          <Typography paragraph>
            Si tiene alguna pregunta sobre estos términos, por favor contáctenos a través de nuestro sistema de soporte o envíe un correo electrónico a soporte@posrepair.com
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}; 