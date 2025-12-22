import React, { useState, useEffect, startTransition } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const Reparaciones = () => {
  const navigate = useNavigate();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [formData, setFormData] = useState({
    device: '',
    problem: '',
    status: 'pending',
    cost: '',
    notes: ''
  });

  useEffect(() => {
    fetchRepairs();
  }, []);

  const fetchRepairs = async () => {
    try {
      const response = await api.get('/repairs');
      setRepairs(response.data);
    } catch (error) {
      setError('Error al cargar las reparaciones');
      console.error('Error al cargar las reparaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (repair = null) => {
    if (repair) {
      setSelectedRepair(repair);
      setFormData({
        device: repair.device,
        problem: repair.problem,
        status: repair.status,
        cost: repair.cost,
        notes: repair.notes
      });
    } else {
      setSelectedRepair(null);
      setFormData({
        device: '',
        problem: '',
        status: 'pending',
        cost: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRepair(null);
    setFormData({
      device: '',
      problem: '',
      status: 'pending',
      cost: '',
      notes: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRepair) {
        await api.put(`/repairs/${selectedRepair.id}`, formData);
      } else {
        await api.post('/repairs', formData);
      }
      fetchRepairs();
      handleCloseDialog();
    } catch (error) {
      setError('Error al guardar la reparación');
      console.error('Error al guardar la reparación:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reparación?')) {
      try {
        await api.delete(`/repairs/${id}`);
        fetchRepairs();
      } catch (error) {
        setError('Error al eliminar la reparación');
        console.error('Error al eliminar la reparación:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Reparaciones
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => startTransition(() => navigate('/reparaciones/nuevo'))}
          >
            Nueva Reparación
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Dispositivo</TableCell>
                <TableCell>Problema</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Costo</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repairs.map((repair) => (
                <TableRow key={repair.id}>
                  <TableCell>{repair.device}</TableCell>
                  <TableCell>{repair.problem}</TableCell>
                  <TableCell>{repair.status}</TableCell>
                  <TableCell>${repair.cost}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(repair)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(repair.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedRepair ? 'Editar Reparación' : 'Nueva Reparación'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Dispositivo"
                name="device"
                value={formData.device}
                onChange={handleChange}
                margin="normal"
                required
              />

              <TextField
                fullWidth
                label="Problema"
                name="problem"
                value={formData.problem}
                onChange={handleChange}
                margin="normal"
                required
                multiline
                rows={3}
              />

              <TextField
                fullWidth
                label="Estado"
                name="status"
                value={formData.status}
                onChange={handleChange}
                margin="normal"
                select
                SelectProps={{ native: true }}
              >
                <option value="pending">Pendiente</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
              </TextField>

              <TextField
                fullWidth
                label="Costo"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                label="Notas"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Reparaciones; 