import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardHeader,
  Divider, IconButton, Chip, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, Snackbar, Alert, Fade, useMediaQuery, Tooltip as MuiTooltip, CircularProgress, List, ListItem, ListItemText, ListItemAvatar, Avatar, FormControl, InputLabel, Select, MenuItem, InputAdornment,
  TableContainer, Table, TableBody, TableCell, TableHead, TableRow, TablePagination
} from '@mui/material';
import { useTheme } from './ThemeContext';
import { 
  People, 
  Phone, 
  AssignmentInd, 
  Add, 
  Edit, 
  WhatsApp as WhatsAppIcon, 
  Person, 
  Search,
  Email as EmailIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContextMongo';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import ContentCard from '../components/layout/ContentCard';
import ContentSection from '../components/layout/ContentSection';
import { pageStyles, cardStyles, tableStyles } from '../styles/commonStyles';

const Clientes = () => {
  const { darkMode } = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const { user } = useAuth();

  // Nuevo: Estado para usuarios en línea
  const [usuarios, setUsuarios] = useState(location.state?.usuarios || []);
  const usuariosEnLinea = useMemo(
    () => usuarios.filter(u => u.online),
    [usuarios]
  );

  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    rol: '',
    history: [],
  });
  const [clients, setClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [search, setSearch] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Si no hay usuarios en el state, cárgalos desde Firestore
  useEffect(() => {
    if (!location.state?.usuarios) {
      getDocs(collection(db, 'usuarios')).then(snapshot => {
        setUsuarios(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, [location.state]);

  // Indicador de conexión offline
  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Leer los clientes desde Firestore en tiempo real
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "clients"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterClients();
  }, [search, clients]);

  // Buscar clientes
  const filterClients = () => {
    if (!search) {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(c =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.phone || '').includes(search) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  };

  // Encontrar el cliente actual (por email)
  const currentClient = useMemo(() => {
    if (!user) return null;
    return clients.find(c => c.email === user.email);
  }, [clients, user]);

  const handleDialogOpen = () => {
    setClientData({ name: '', phone: '', email: '', rol: '', history: [] });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleEditDialogOpen = (client) => {
    setEditingClient(client);
    setClientData({ ...client });
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setEditingClient(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientData({ ...clientData, [name]: value });
  };

  const handleAddClient = async () => {
    if (!clientData.name || !clientData.phone || !clientData.email || !clientData.rol) {
      setSnackbar({ open: true, message: 'Completa todos los campos', severity: 'warning' });
      return;
    }
    try {
      await addDoc(collection(db, "clients"), clientData);
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Cliente añadido', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Error al añadir cliente', severity: 'error' });
    }
  };

  const handleUpdateClient = async () => {
    if (!clientData.name || !clientData.phone || !clientData.email || !clientData.rol) {
      setSnackbar({ open: true, message: 'Completa todos los campos', severity: 'warning' });
      return;
    }
    try {
      const clientRef = doc(db, "clients", editingClient.id);
      await updateDoc(clientRef, clientData);
      setOpenEditDialog(false);
      setEditingClient(null);
      setSnackbar({ open: true, message: 'Cliente actualizado', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Error al actualizar cliente', severity: 'error' });
    }
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleWhatsApp = (phone) => {
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  // Mostrar historial de reparaciones si existe
  const renderHistory = (history) => (
    <List dense>
      {history && history.length > 0 ? (
        history.slice(0, 3).map((h, idx) => (
          <ListItem key={idx}>
            <ListItemAvatar>
              <Avatar>
                <AssignmentInd />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={h.descripcion || 'Reparación'}
              secondary={h.fecha || ''}
            />
          </ListItem>
        ))
      ) : (
        <ListItem>
          <ListItemText primary="Sin historial" />
        </ListItem>
      )}
    </List>
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <ResponsiveLayout>
      <ContentSection>
        <ContentCard
          title="Clientes"
          subtitle="Gestiona tu base de clientes"
          actions={
            <Button
              variant="contained"
              startIcon={<Add />}
              size="small"
              onClick={handleDialogOpen}
            >
              Nuevo Cliente
            </Button>
          }
        >
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <TableContainer sx={tableStyles.root}>
            <Table sx={tableStyles.table}>
              <TableHead sx={tableStyles.header}>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>WhatsApp</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <TableRow key={client.id} sx={tableStyles.row}>
                      <TableCell sx={tableStyles.cell}>
                        {client.name}
                      </TableCell>
                      <TableCell sx={tableStyles.cell}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Phone fontSize="small" color="action" />
                          {client.phone}
                        </Box>
                      </TableCell>
                      <TableCell sx={tableStyles.cell}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          {client.email}
                        </Box>
                      </TableCell>
                      <TableCell sx={tableStyles.cell}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WhatsAppIcon fontSize="small" color="action" />
                          {client.whatsapp}
                        </Box>
                      </TableCell>
                      <TableCell sx={tableStyles.cell}>
                        <Chip
                          label={client.status === 'active' ? 'Activo' : 'Inactivo'}
                          color={getStatusColor(client.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center" sx={tableStyles.cell}>
                        <MuiTooltip title="Editar">
                          <IconButton size="small" color="primary" onClick={() => handleEditDialogOpen(client)}>
                            <Edit />
                          </IconButton>
                        </MuiTooltip>
                        <MuiTooltip title="Eliminar">
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </MuiTooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredClients.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Clientes por página"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count}`
            }
          />
        </ContentCard>
      </ContentSection>

      {/* Diálogo para añadir cliente */}
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Añadir Cliente</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nombre"
            type="text"
            fullWidth
            variant="outlined"
            value={clientData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="phone"
            label="Teléfono"
            type="tel"
            fullWidth
            variant="outlined"
            value={clientData.phone}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Correo Electrónico"
            type="email"
            fullWidth
            variant="outlined"
            value={clientData.email}
            onChange={handleInputChange}
            required
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="rol-label">Rol</InputLabel>
            <Select
              labelId="rol-label"
              name="rol"
              value={clientData.rol || ''}
              label="Rol"
              onChange={handleInputChange}
              required
            >
              <MenuItem value="propietario">Propietario</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="usuario">Usuario</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleAddClient} color="primary" variant="contained">
            Añadir Cliente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar cliente */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose} fullWidth maxWidth="sm">
        <DialogTitle>Editar Cliente</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Nombre"
            type="text"
            fullWidth
            variant="outlined"
            value={clientData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="phone"
            label="Teléfono"
            type="tel"
            fullWidth
            variant="outlined"
            value={clientData.phone}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="email"
            label="Correo Electrónico"
            type="email"
            fullWidth
            variant="outlined"
            value={clientData.email}
            onChange={handleInputChange}
            required
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="rol-label-edit">Rol</InputLabel>
            <Select
              labelId="rol-label-edit"
              name="rol"
              value={clientData.rol || ''}
              label="Rol"
              onChange={handleInputChange}
              required
            >
              <MenuItem value="propietario">Propietario</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="usuario">Usuario</MenuItem>
              <MenuItem value="staff">Staff</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleUpdateClient} color="primary" variant="contained">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '', severity: snackbar.severity })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ open: false, message: '', severity: snackbar.severity })}
          sx={{ fontWeight: 'bold', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ResponsiveLayout>
  );
};

export default Clientes;