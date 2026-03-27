import React, { useState, useEffect } from 'react';
import {
  Stepper, Step, StepLabel, Button, Typography, Box, Paper, TextField,
  FormControl, InputLabel, Select, MenuItem, Alert, Grid, Divider, Fade,
  CircularProgress, useTheme, Card, CardContent, InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { useBusiness } from '../../context/BusinessContext';

const steps = ['🏪 Perfil de Negocio', '📱 Contacto y Redes', '🖨️ Tu Impresora POS'];

const SetupWizard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { printerConfig, savePrinterConfig, isConfigComplete } = useConfig();
  const { businessData: savedBusinessData, saveBusinessData, isBusinessConfigured, loading: businessLoading } = useBusiness();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [businessData, setBusinessData] = useState({
    name: savedBusinessData.name || '',
    legalName: savedBusinessData.legalName || '',
    address: savedBusinessData.address || '',
    phone: savedBusinessData.phone || '',
    email: savedBusinessData.email || '',
    taxId: savedBusinessData.taxId || '',
    website: savedBusinessData.website || '',
    socialMedia: {
      facebook: savedBusinessData.socialMedia?.facebook || '',
      instagram: savedBusinessData.socialMedia?.instagram || '',
      twitter: savedBusinessData.socialMedia?.twitter || ''
    },
    additionalInfo: savedBusinessData.additionalInfo || ''
  });

  const [printerData, setPrinterData] = useState({
    printerType: printerConfig.printerType || 'thermal',
    model: printerConfig.model || 'GENERIC POS',
    connection: printerConfig.connection || 'usb',
    ipAddress: printerConfig.ipAddress || '',
    port: printerConfig.port || '',
    paperWidth: printerConfig.paperWidth || '80',
    autocut: printerConfig.autocut ?? true,
  });

  useEffect(() => {
    if (!businessLoading && isConfigComplete() && isBusinessConfigured()) {
      navigate('/dashboard');
    }
  }, [isConfigComplete, isBusinessConfigured, businessLoading, navigate, savedBusinessData]);

  const handleBusinessDataChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('socialMedia.')) {
      const field = name.split('.')[1];
      setBusinessData(prev => ({
        ...prev, socialMedia: { ...prev.socialMedia, [field]: value }
      }));
    } else {
      setBusinessData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePrinterDataChange = (event) => {
    const { name, value } = event.target;
    setPrinterData(prev => ({ ...prev, [name]: value }));
  };

  const validateBusinessData = () => {
    if (!businessData.name || !businessData.address || !businessData.phone) {
      setError('¡Ey! Nos faltan algunos campos clave como el Nombre de tu tienda, Dirección y Teléfono 🧐');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      if (activeStep === 0 || activeStep === 1) {
        if (activeStep === 0 && !validateBusinessData()) {
          setIsSubmitting(false); return;
        }
        
        // Guardar progreso del negocio a medias o completo
        const saved = await saveBusinessData(businessData);
        if (!saved) throw new Error("No pudimos guardar los datos del negocio.");
      } else if (activeStep === 2) {
        if (!printerData.printerType) throw new Error("Debes elegir un tipo de impresora 👍");
        const saved = await savePrinterConfig(printerData);
        if (!saved) throw new Error("Hubo un problema guardando tu impresora.");
        
        // Redirigir al gran final
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigate('/dashboard');
        return;
      }

      setActiveStep(prev => prev + 1);
    } catch (err) {
      setError('Algo salió mal: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={true}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" color="primary.main" fontWeight={600} textAlign="center">
                ¡Hagámoslo oficial! ¿Cómo se llama tu proyecto? 🚀
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
                Estos datos aparecerán orgullosamente en los tickets y facturas que les darás a tus clientes.
              </Typography>

              <TextField required fullWidth label="Nombre de tu negocio o tienda" name="name"
                value={businessData.name} onChange={handleBusinessDataChange}
                InputProps={{ startAdornment: <InputAdornment position="start">🏪</InputAdornment> }}
                placeholder="Ej. Supermercado El Éxito" 
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Razón Social (Opcional)" name="legalName"
                    value={businessData.legalName} onChange={handleBusinessDataChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">📋</InputAdornment> }}
                    placeholder="Ej. Comercializadora SA" 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="NIT / RNC / RFC (Fiscal)" name="taxId"
                    value={businessData.taxId} onChange={handleBusinessDataChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">🏛️</InputAdornment> }}
                    placeholder="Tu número identificador de impuestos"
                  />
                </Grid>
              </Grid>

              <TextField required fullWidth label="Dirección Física" name="address"
                value={businessData.address} onChange={handleBusinessDataChange} multiline rows={2}
                InputProps={{ startAdornment: <InputAdornment position="start">📍</InputAdornment> }}
                placeholder="¿En dónde te visitan tus clientes?"
              />
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={true}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" color="primary.main" fontWeight={600} textAlign="center">
                ¿Cómo pueden encontrarte? 📱
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
                Agrega tus números e internet para que POSENT los imprima en los recibos y aumentes tus seguidores!
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField required fullWidth label="Teléfono / WhatsApp" name="phone" type="tel"
                    value={businessData.phone} onChange={handleBusinessDataChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">📞</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Correo Electrónico" name="email" type="email"
                    value={businessData.email} onChange={handleBusinessDataChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">✉️</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Tu página Web (Opcional)" name="website"
                    value={businessData.website} onChange={handleBusinessDataChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">🌐</InputAdornment> }}
                    placeholder="www.mitienda.com"
                  />
                </Grid>
              </Grid>

              <Divider><Typography variant="body2" color="text.secondary">Redes Sociales (Opcional)</Typography></Divider>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Instagram" name="socialMedia.instagram"
                    value={businessData.socialMedia.instagram} onChange={handleBusinessDataChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">📸</InputAdornment> }}
                    placeholder="@usuario"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Facebook" name="socialMedia.facebook"
                    value={businessData.socialMedia.facebook} onChange={handleBusinessDataChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">📘</InputAdornment> }}
                    placeholder="/pagina"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Otro" name="socialMedia.twitter"
                    value={businessData.socialMedia.twitter} onChange={handleBusinessDataChange}
                    InputProps={{ startAdornment: <InputAdornment position="start">✨</InputAdornment> }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={true}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" color="primary.main" fontWeight={600} textAlign="center">
                ¡Último paso! Configuremos los cobros 🧾
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
                Dinos cómo vas a imprimir los recibos. (No te preocupes, puedes cambiar esto luego en Configuración).
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>¿Qué impresora usarás?</InputLabel>
                    <Select
                      name="printerType" value={printerData.printerType}
                      onChange={handlePrinterDataChange} label="¿Qué impresora usarás?"
                    >
                      <MenuItem value="thermal">🔥 Impresora Térmica (Tickets de rollo)</MenuItem>
                      <MenuItem value="laser">📄 Impresora Láser/Tinta (Hojas A4/Carta)</MenuItem>
                      <MenuItem value="matrix">📠 Impresora Matricial (Cinta vieja escuela)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>¿Cómo se conecta a tu sistema?</InputLabel>
                    <Select
                      name="connection" value={printerData.connection}
                      onChange={handlePrinterDataChange} label="¿Cómo se conecta a tu sistema?"
                    >
                      <MenuItem value="usb">🔌 Cable USB (Directo a mi PC)</MenuItem>
                      <MenuItem value="network">🌐 Red Wi-Fi / Ethernet (IP)</MenuItem>
                      <MenuItem value="bluetooth">🔵 Bluetooth Libre</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {printerData.printerType === 'thermal' && (
                <Card variant="outlined" sx={{ bgcolor: 'action.hover', borderStyle: 'dashed' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>⚙️ Selecciona el ancho del ticket térmico:</Typography>
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <InputLabel>Tamaño del Papel</InputLabel>
                      <Select
                        name="paperWidth" value={printerData.paperWidth}
                        onChange={handlePrinterDataChange} label="Tamaño del Papel"
                      >
                        <MenuItem value="80">Ticket Ancho - 80mm (Estándar en comercios grandes)</MenuItem>
                        <MenuItem value="58">Ticket Angosto - 58mm (Para maquinitas portátiles o chicas)</MenuItem>
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>
              )}

              {printerData.connection === 'network' && (
                 <Card variant="outlined" sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                   <CardContent>
                     <Typography variant="subtitle2" gutterBottom>🌐 Datos de Impresión por Red</Typography>
                     <Grid container spacing={2} sx={{ mt: 0.5 }}>
                       <Grid item xs={12} sm={8}>
                         <TextField required fullWidth size="small" label="Dirección IP de tu impresora"
                           name="ipAddress" value={printerData.ipAddress} onChange={handlePrinterDataChange}
                           placeholder="Ej. 192.168.1.100" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                         />
                       </Grid>
                       <Grid item xs={12} sm={4}>
                         <TextField fullWidth size="small" label="Puerto" name="port"
                           value={printerData.port} onChange={handlePrinterDataChange}
                           placeholder="Ej. 9100" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                         />
                       </Grid>
                     </Grid>
                   </CardContent>
                 </Card>
              )}
            </Box>
          </Fade>
        );
      default:
        return 'Paso superado';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', py: 5 }}>
      <Paper elevation={12} sx={{ maxWidth: 750, width: '100%', p: { xs: 3, md: 5 }, borderRadius: 4, mx: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight={800} color="primary.main" gutterBottom>
            🌟 ¡Bienvenido a POSENT!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vamos a configurar tu entorno en 3 simples pasos.
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Fade in={true}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          </Fade>
        )}

        <Box sx={{ minHeight: 320 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            size="large"
            disabled={activeStep === 0 || isSubmitting}
            onClick={handleBack}
            sx={{ fontWeight: 600 }}
          >
            ← Volver
          </Button>
          <Button
            size="large"
            variant="contained"
            onClick={handleNext}
            disabled={isSubmitting}
            sx={{ px: 5, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: '1.05rem', boxShadow: 4 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : activeStep === steps.length - 1 ? '¡Finalizar y Empezar! 🎉' : 'Continuar →'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SetupWizard; 