import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' }
];

const TICKET_CATEGORIES = [
  { value: 'technical', label: 'Problema Técnico' },
  { value: 'billing', label: 'Facturación' },
  { value: 'feature', label: 'Solicitud de Función' },
  { value: 'bug', label: 'Reporte de Error' },
  { value: 'other', label: 'Otro' }
];

export const SupportTicket = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'technical'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const ticketData = {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'support_tickets'), ticketData);
      setSuccess(true);
      setFormData({
        subject: '',
        description: '',
        priority: 'medium',
        category: 'technical'
      });
    } catch (err) {
      setError('Error al crear el ticket. Por favor, intente nuevamente.');
      console.error('Error al crear ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Crear Ticket de Soporte
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Ticket creado exitosamente. Nos pondremos en contacto contigo pronto.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Asunto"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                label="Prioridad"
              >
                {PRIORITY_LEVELS.map(level => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Categoría"
              >
                {TICKET_CATEGORIES.map(category => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Enviar Ticket'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}; 