import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContextMongo';

const steps = [
  'Configuración Inicial',
  'Datos Personales',
  'Configuración de Acceso',
  'Finalizar'
];

const StaffSetupWizard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    rol: 'staff',
    departamento: '',
    permisos: []
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNext = async () => {
    setError(null);
    setLoading(true);

    try {
      if (activeStep === steps.length - 1) {
        // Guardar la configuración en Firestore
        await updateDoc(doc(db, 'users', user.uid), {
          setupComplete: true,
          ...formData
        });
        navigate('/staff-dashboard');
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
              Bienvenido al Asistente de Configuración para Personal
            </Typography>
            <Typography>
              Este asistente te guiará a través del proceso de configuración de tu cuenta de personal.
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
            />
            <TextField
              label="Apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
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
            <FormControl fullWidth>
              <InputLabel>Departamento</InputLabel>
              <Select
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                label="Departamento"
              >
                <MenuItem value="ventas">Ventas</MenuItem>
                <MenuItem value="servicio">Servicio al Cliente</MenuItem>
                <MenuItem value="soporte">Soporte Técnico</MenuItem>
                <MenuItem value="administracion">Administración</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Permisos</InputLabel>
              <Select
                name="permisos"
                multiple
                value={formData.permisos}
                onChange={handleChange}
                label="Permisos"
              >
                <MenuItem value="ver_ventas">Ver Ventas</MenuItem>
                <MenuItem value="ver_inventario">Ver Inventario</MenuItem>
                <MenuItem value="ver_clientes">Ver Clientes</MenuItem>
                <MenuItem value="ver_reportes">Ver Reportes</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 3:
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
            <Typography>Departamento: {formData.departamento}</Typography>
            <Typography>
              Permisos: {formData.permisos.join(', ')}
            </Typography>
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

export default StaffSetupWizard; 