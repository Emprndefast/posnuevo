import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Telegram as TelegramIcon,
  WhatsApp as WhatsAppIcon,
  CheckCircle as CheckCircleIcon,
  Send as SendIcon,
  Message as MessageIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const NotificationGuide = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Guía de Configuración de Notificaciones
      </Typography>

      {/* Configuración de Telegram */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TelegramIcon sx={{ fontSize: 40, color: '#0088cc', mr: 2 }} />
            <Typography variant="h6">
              Configuración de Telegram
            </Typography>
          </Box>

          <Stepper orientation="vertical">
            <Step active={true}>
              <StepLabel>Crear un Bot de Telegram</StepLabel>
              <StepContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SendIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="1. Abre Telegram y busca @BotFather"
                      secondary="Este es el bot oficial para crear bots en Telegram"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MessageIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="2. Envía el comando /newbot"
                      secondary="Sigue las instrucciones para crear tu bot"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="3. Guarda el token que te proporciona BotFather"
                      secondary="Este token es único y privado para tu bot"
                    />
                  </ListItem>
                </List>
              </StepContent>
            </Step>

            <Step active={true}>
              <StepLabel>Obtener tu Chat ID</StepLabel>
              <StepContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SendIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="1. Busca tu bot por su nombre de usuario"
                      secondary="El nombre que le diste al crear el bot"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MessageIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="2. Inicia una conversación con tu bot"
                      secondary="Envía cualquier mensaje al bot"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="3. Visita https://api.telegram.org/bot<TU_TOKEN>/getUpdates"
                      secondary="Reemplaza <TU_TOKEN> con el token de tu bot"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="4. Busca el campo 'chat' y copia el 'id'"
                      secondary="Este es tu Chat ID personal"
                    />
                  </ListItem>
                </List>
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
      </Card>

      {/* Configuración de WhatsApp */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <WhatsAppIcon sx={{ fontSize: 40, color: '#25D366', mr: 2 }} />
            <Typography variant="h6">
              Configuración de WhatsApp
            </Typography>
          </Box>

          <Stepper orientation="vertical">
            <Step active={true}>
              <StepLabel>Configurar UltraMsg</StepLabel>
              <StepContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SendIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="1. Crea una cuenta en UltraMsg"
                      secondary="Visita https://ultramsg.com y regístrate"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MessageIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="2. Crea una nueva instancia"
                      secondary="Sigue el asistente de configuración"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="3. Obtén tu Instance ID y Token"
                      secondary="Estos datos estarán disponibles en tu panel de control"
                    />
                  </ListItem>
                </List>
              </StepContent>
            </Step>

            <Step active={true}>
              <StepLabel>Configurar en el POS</StepLabel>
              <StepContent>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="1. Ve a Configuración > Notificaciones"
                      secondary="Accede a la sección de configuración de notificaciones"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <MessageIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="2. Ingresa tu Instance ID y Token"
                      secondary="Los datos obtenidos de tu cuenta de UltraMsg"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="3. Ingresa tu número de WhatsApp con código de país"
                      secondary="Ejemplo: +18091234567"
                    />
                  </ListItem>
                </List>
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          ¿Necesitas ayuda? Contacta a soporte técnico
        </Typography>
      </Box>
    </Box>
  );
};

export default NotificationGuide; 