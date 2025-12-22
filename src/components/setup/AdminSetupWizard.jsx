import React, { useState, startTransition } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextMongo';
import { useValidation } from '../../context/ValidationContext';
import { useSetupValidation } from '../../hooks/useSetupValidation';
import { db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

const steps = [
  'Configuración Inicial',
  'Datos de la Empresa',
  'Configuración de Impresoras',
  'Configuración de Usuarios',
  'Finalizar'
];

const AdminSetupWizard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { validateBusinessData, validatePrinterData } = useValidation();
  const { validationErrors, isValidating } = useSetupValidation('admin');

  const handleNext = async () => {
    setError('');
    
    try {
      if (activeStep === 1) {
        const validation = validateBusinessData({
          name: user?.businessData?.name,
          address: user?.businessData?.address,
          phone: user?.businessData?.phone,
          email: user?.businessData?.email
        });

        if (!validation.isValid) {
          setError(validation.errors.join(', '));
          return;
        }
      } else if (activeStep === 2) {
        const validation = validatePrinterData({
          printerType: user?.printerConfig?.printerType,
          model: user?.printerConfig?.model,
          connection: user?.printerConfig?.connection,
          ipAddress: user?.printerConfig?.ipAddress,
          port: user?.printerConfig?.port
        });

        if (!validation.isValid) {
          setError(validation.errors.join(', '));
          return;
        }
      }

      if (activeStep === steps.length - 1) {
        try {
          await updateDoc(doc(db, 'usuarios', user.uid), {
            setupCompleted: true,
            setupType: 'admin'
          });
          navigate('/modern-dashboard');
        } catch (error) {
          console.error('Error al guardar la configuración:', error);
          setError('Error al guardar la configuración');
        }
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    } catch (err) {
      setError('Error inesperado: ' + err.message);
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
          <Box>
            <Typography variant="h6" gutterBottom>
              Bienvenido al Asistente de Configuración de Administrador
            </Typography>
            <Typography>
              Este asistente te guiará a través de la configuración inicial del sistema.
              Configurarás los datos de la empresa, usuarios, impresoras y más.
            </Typography>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Datos de la Empresa
            </Typography>
            {/* Formulario de datos de empresa */}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuración de Impresoras
            </Typography>
            {/* Configuración de impresoras */}
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuración de Usuarios
            </Typography>
            {/* Configuración de usuarios */}
          </Box>
        );
      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configuración Completada
            </Typography>
            <Typography>
              ¡Felicidades! Has completado la configuración inicial del sistema.
              Ahora puedes comenzar a usar todas las funcionalidades disponibles.
            </Typography>
          </Box>
        );
      default:
        return 'Paso desconocido';
    }
  };

  if (isValidating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (validationErrors.length > 0) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 3, mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationErrors.join(', ')}
          </Alert>
          <Button
            variant="contained"
            onClick={() => startTransition(() => navigate('/modern-dashboard'))}
          >
            Ir al Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={completed[index]}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 4 }}>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
            >
              {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminSetupWizard; 