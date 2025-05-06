import React, { useState, useEffect } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { useBusiness } from '../../context/BusinessContext';

const steps = ['Datos del Negocio', 'Datos Adicionales', 'Configuración de Impresora'];

const SetupWizard = () => {
  const navigate = useNavigate();
  const {
    printerConfig,
    savePrinterConfig,
    isConfigComplete,
  } = useConfig();

  const {
    businessData: savedBusinessData,
    saveBusinessData,
    isBusinessConfigured,
    loading: businessLoading
  } = useBusiness();

  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para datos del negocio
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

  // Estado para datos de la impresora
  const [printerData, setPrinterData] = useState({
    printerType: printerConfig.printerType || '',
    model: printerConfig.model || '',
    connection: printerConfig.connection || '',
    ipAddress: printerConfig.ipAddress || '',
    port: printerConfig.port || '',
    paperWidth: printerConfig.paperWidth || '80',
    autocut: printerConfig.autocut ?? true,
  });

  useEffect(() => {
    // Si la configuración ya está completa, redirigir al dashboard
    if (!businessLoading && isConfigComplete() && isBusinessConfigured()) {
      console.log('SetupWizard - Verificando estado de configuración:', {
        businessLoading,
        isConfigComplete: isConfigComplete(),
        isBusinessConfigured: isBusinessConfigured(),
        businessData: savedBusinessData
      });
      navigate('/dashboard');
    }
  }, [isConfigComplete, isBusinessConfigured, businessLoading, navigate, savedBusinessData]);

  const handleBusinessDataChange = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('socialMedia.')) {
      const socialMediaField = name.split('.')[1];
      setBusinessData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialMediaField]: value
        }
      }));
    } else {
      setBusinessData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePrinterDataChange = (event) => {
    const { name, value } = event.target;
    setPrinterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateBusinessData = () => {
    if (!businessData.name || !businessData.address || !businessData.phone || !businessData.email) {
      setError('Por favor complete todos los campos obligatorios');
      return false;
    }
    return true;
  };

  const validatePrinterData = () => {
    if (!printerData.printerType || !printerData.model || !printerData.connection) {
      setError('Por favor complete todos los campos obligatorios');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    setError('');
    setIsSubmitting(true);
    
    try {
      if (activeStep === 0) {
        console.log('SetupWizard - Guardando datos del negocio:', businessData);
        if (!validateBusinessData()) {
          setIsSubmitting(false);
          return;
        }
        
        const saved = await saveBusinessData(businessData);
        if (!saved) {
          setError('Error al guardar los datos del negocio');
          setIsSubmitting(false);
          return;
        }
        console.log('SetupWizard - Datos del negocio guardados exitosamente');
      } else if (activeStep === 2) {
        console.log('SetupWizard - Guardando configuración de impresora:', printerData);
        if (!validatePrinterData()) {
          setIsSubmitting(false);
          return;
        }
        
        const saved = await savePrinterConfig(printerData);
        if (!saved) {
          setError('Error al guardar la configuración de la impresora');
          setIsSubmitting(false);
          return;
        }
        console.log('SetupWizard - Configuración de impresora guardada exitosamente');
        
        // Esperar un momento antes de redirigir
        console.log('SetupWizard - Preparando redirección al dashboard...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Aumentado a 2 segundos
        navigate('/modern-dashboard'); // Cambiado de window.location.href
        return;
      }

      setActiveStep((prevStep) => prevStep + 1);
    } catch (err) {
      setError('Error inesperado: ' + err.message);
      console.error('SetupWizard - Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              label="Nombre Comercial"
              name="name"
              value={businessData.name}
              onChange={handleBusinessDataChange}
              helperText="Nombre que aparecerá en facturas y documentos"
            />
            <TextField
              fullWidth
              label="Razón Social"
              name="legalName"
              value={businessData.legalName}
              onChange={handleBusinessDataChange}
              helperText="Nombre legal de la empresa"
            />
            <TextField
              required
              fullWidth
              label="Dirección"
              name="address"
              value={businessData.address}
              onChange={handleBusinessDataChange}
              multiline
              rows={2}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={businessData.phone}
                  onChange={handleBusinessDataChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={businessData.email}
                  onChange={handleBusinessDataChange}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="NIT/RUC/RFC"
              name="taxId"
              value={businessData.taxId}
              onChange={handleBusinessDataChange}
              helperText="Identificación fiscal de la empresa"
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Sitio Web"
              name="website"
              value={businessData.website}
              onChange={handleBusinessDataChange}
            />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Redes Sociales
            </Typography>
            <Divider />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Facebook"
                  name="socialMedia.facebook"
                  value={businessData.socialMedia.facebook}
                  onChange={handleBusinessDataChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Instagram"
                  name="socialMedia.instagram"
                  value={businessData.socialMedia.instagram}
                  onChange={handleBusinessDataChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Twitter"
                  name="socialMedia.twitter"
                  value={businessData.socialMedia.twitter}
                  onChange={handleBusinessDataChange}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Información Adicional"
              name="additionalInfo"
              value={businessData.additionalInfo}
              onChange={handleBusinessDataChange}
              multiline
              rows={3}
              helperText="Información adicional que aparecerá en facturas y documentos"
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Impresora</InputLabel>
              <Select
                name="printerType"
                value={printerData.printerType}
                onChange={handlePrinterDataChange}
                label="Tipo de Impresora"
              >
                <MenuItem value="thermal">Térmica</MenuItem>
                <MenuItem value="matrix">Matricial</MenuItem>
                <MenuItem value="laser">Láser</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              required
              fullWidth
              label="Modelo"
              name="model"
              value={printerData.model}
              onChange={handlePrinterDataChange}
            />
            
            <FormControl fullWidth required>
              <InputLabel>Tipo de Conexión</InputLabel>
              <Select
                name="connection"
                value={printerData.connection}
                onChange={handlePrinterDataChange}
                label="Tipo de Conexión"
              >
                <MenuItem value="usb">USB</MenuItem>
                <MenuItem value="network">Red</MenuItem>
                <MenuItem value="bluetooth">Bluetooth</MenuItem>
              </Select>
            </FormControl>

            {printerData.connection === 'network' && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Dirección IP"
                    name="ipAddress"
                    value={printerData.ipAddress}
                    onChange={handlePrinterDataChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Puerto"
                    name="port"
                    value={printerData.port}
                    onChange={handlePrinterDataChange}
                  />
                </Grid>
              </Grid>
            )}
            
            <FormControl fullWidth>
              <InputLabel>Ancho de Papel</InputLabel>
              <Select
                name="paperWidth"
                value={printerData.paperWidth}
                onChange={handlePrinterDataChange}
                label="Ancho de Papel"
              >
                <MenuItem value="58">58mm</MenuItem>
                <MenuItem value="80">80mm</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      default:
        return 'Paso Desconocido';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          Asistente de Configuración
        </Typography>

        <Stepper activeStep={activeStep} sx={{ py: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0 || isSubmitting}
            onClick={handleBack}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SetupWizard; 