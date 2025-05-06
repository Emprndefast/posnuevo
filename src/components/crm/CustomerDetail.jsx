import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [followUps, setFollowUps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newFollowUp, setNewFollowUp] = useState({ content: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [newNote, setNewNote] = useState({ content: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const [customerRes, followUpsRes, tasksRes, notesRes] = await Promise.all([
          api.get(`/api/crm/customers/${id}`),
          api.get(`/api/crm/customers/${id}/followups`),
          api.get(`/api/crm/customers/${id}/tasks`),
          api.get(`/api/crm/customers/${id}/notes`)
        ]);

        setCustomer(customerRes.data);
        setFollowUps(followUpsRes.data);
        setTasks(tasksRes.data);
        setNotes(notesRes.data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos del cliente:', err);
        setError('Error al cargar los datos del cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDialogOpen = (type) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialogType('');
  };

  const handleSubmit = async () => {
    try {
      switch (dialogType) {
        case 'followup':
          await api.post(`/api/crm/customers/${id}/followups`, newFollowUp);
          const followUpsRes = await api.get(`/api/crm/customers/${id}/followups`);
          setFollowUps(followUpsRes.data);
          setNewFollowUp({ content: '' });
          break;
        case 'task':
          await api.post(`/api/crm/customers/${id}/tasks`, newTask);
          const tasksRes = await api.get(`/api/crm/customers/${id}/tasks`);
          setTasks(tasksRes.data);
          setNewTask({ title: '', description: '' });
          break;
        case 'note':
          await api.post(`/api/crm/customers/${id}/notes`, newNote);
          const notesRes = await api.get(`/api/crm/customers/${id}/notes`);
          setNotes(notesRes.data);
          setNewNote({ content: '' });
          break;
      }
      handleDialogClose();
    } catch (err) {
      console.error('Error al agregar elemento:', err);
      setError('Error al agregar el elemento');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/crm/customers')}
        sx={{ mb: 3 }}
      >
        Volver
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {customer.name}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">
                Email: {customer.email}
              </Typography>
              <Typography color="textSecondary">
                Teléfono: {customer.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography color="textSecondary">
                Dirección: {customer.address}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Seguimientos" />
          <Tab label="Tareas" />
          <Tab label="Notas" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Box>
          <Button
            variant="contained"
            onClick={() => handleDialogOpen('followup')}
            sx={{ mb: 2 }}
          >
            Nuevo Seguimiento
          </Button>
          {followUps.map((followUp) => (
            <Card key={followUp.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography>{followUp.content}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(followUp.createdAt.toDate()).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Button
            variant="contained"
            onClick={() => handleDialogOpen('task')}
            sx={{ mb: 2 }}
          >
            Nueva Tarea
          </Button>
          {tasks.map((task) => (
            <Card key={task.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{task.title}</Typography>
                <Typography>{task.description}</Typography>
                <Typography variant="caption" color="textSecondary">
                  Estado: {task.status}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Button
            variant="contained"
            onClick={() => handleDialogOpen('note')}
            sx={{ mb: 2 }}
          >
            Nueva Nota
          </Button>
          {notes.map((note) => (
            <Card key={note.id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography>{note.content}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(note.createdAt.toDate()).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {dialogType === 'followup' && 'Nuevo Seguimiento'}
          {dialogType === 'task' && 'Nueva Tarea'}
          {dialogType === 'note' && 'Nueva Nota'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'followup' && (
            <TextField
              autoFocus
              margin="dense"
              label="Contenido"
              fullWidth
              multiline
              rows={4}
              value={newFollowUp.content}
              onChange={(e) => setNewFollowUp({ content: e.target.value })}
            />
          )}
          {dialogType === 'task' && (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Título"
                fullWidth
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />
              <TextField
                margin="dense"
                label="Descripción"
                fullWidth
                multiline
                rows={4}
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              />
            </>
          )}
          {dialogType === 'note' && (
            <TextField
              autoFocus
              margin="dense"
              label="Contenido"
              fullWidth
              multiline
              rows={4}
              value={newNote.content}
              onChange={(e) => setNewNote({ content: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDetail; 