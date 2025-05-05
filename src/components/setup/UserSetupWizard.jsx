import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const steps = [
  'Configuración Inicial',
  'Datos Personales',
  'Finalizar'
];

const UserSetupWizard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    rol: 'usuario'
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const validateForm = () => {
    const errors = [];
    if (!formData.nombre.trim()) errors.push('El nombre es requerido');
    if (!formData.apellido.trim()) errors.push('El apellido es requerido');
    if (!formData.email.trim()) errors.push('El email es requerido');
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('El email no es válido');
    }
    return errors;
  };

  const handleNext = async () => {
    setError(null);
    setLoading(true);

    try {
      if (activeStep === 1) {
        const errors = validateForm();
        if (errors.length > 0) {
          setError(errors.join(', '));
          setLoading(false);
          return;
        }
      }

      if (activeStep === steps.length - 1) {
        // Crear o actualizar el documento en Firestore
        await setDoc(doc(db, 'users', user.uid), {
          setupComplete: true,
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });
        navigate('/modern-dashboard');
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    } catch (err) {
      setError('Error al guardar la configuración: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              Bienvenido al Asistente de Configuración
            </Typography>
            <Typography>
              Este asistente te guiará a través del proceso de configuración de tu cuenta.
              Por favor, completa la siguiente información para comenzar.
            </Typography>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
              required
              error={error?.includes('nombre')}
            />
            <TextField
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              fullWidth
              required
              error={error?.includes('apellido')}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              error={error?.includes('email')}
            />
            <TextField
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de la Configuración
            </Typography>
            <Typography>
              Nombre: {formData.nombre} {formData.apellido}
            </Typography>
            <Typography>Email: {formData.email}</Typography>
            <Typography>Teléfono: {formData.telefono}</Typography>
            <Typography>Dirección: {formData.direccion}</Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Atrás
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === steps.length - 1 ? (
              'Finalizar'
            ) : (
              'Siguiente'
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default UserSetupWizard; 