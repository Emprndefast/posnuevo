import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Switch, FormControlLabel, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, Tabs, Tab, TextField, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { collection, setDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../context/AuthContextMongo';
// Hooks de contexto global (ajusta los imports si tus nombres son diferentes)
import { useProductos } from '../../../context/ProductosContext';
import { useClientes } from '../../../context/ClientesContext';
import { useVentas } from '../../../context/VentasContext';
import { useConfig } from '../../../context/ConfigContext';

const RespaldosConfigModal = ({ onClose }) => {
  const [form, setForm] = useState({
    autoBackup: false,
    backupFrequency: 'daily',
    cloudUser: '',
    cloudToken: '',
    interval: 5,
    batchSize: 1000,
    loading: false,
    status: '',
    error: ''
  });
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Contextos globales
  const { user } = useAuth();
  const { productos, setProductos } = useProductos();
  const { clientes, setClientes } = useClientes();
  const { ventas, setVentas } = useVentas();
  const { config, setConfig } = useConfig();

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  };

  const handleTabChange = (e, newValue) => setTab(newValue);

  // Subir todos los datos del usuario a Firebase
  const handleSyncUp = async () => {
    if (!user) return;
    setForm(f => ({ ...f, loading: true, status: '', error: '' }));
    try {
      // Subir productos
      for (const prod of productos) {
        await setDoc(doc(db, 'productos', prod.id), { ...prod, uid: user.uid });
      }
      // Subir clientes
      for (const cli of clientes) {
        await setDoc(doc(db, 'clientes', cli.id), { ...cli, uid: user.uid });
      }
      // Subir ventas
      for (const venta of ventas) {
        await setDoc(doc(db, 'ventas', venta.id), { ...venta, uid: user.uid });
      }
      // Subir configuración (solo un documento por usuario)
      await setDoc(doc(db, 'configuracion', user.uid), { ...config, uid: user.uid });
      setForm(f => ({ ...f, loading: false, status: 'Sincronización subida exitosa' }));
      setSnackbar({ open: true, message: 'Datos subidos exitosamente a la nube', severity: 'success' });
    } catch (err) {
      setForm(f => ({ ...f, loading: false, error: 'Error al subir datos' }));
      setSnackbar({ open: true, message: 'Error al subir datos', severity: 'error' });
    }
  };

  // Descargar todos los datos del usuario desde Firebase
  const handleSyncDown = async () => {
    if (!user) return;
    setForm(f => ({ ...f, loading: true, status: '', error: '' }));
    try {
      // Descargar productos
      const qProd = query(collection(db, 'productos'), where('uid', '==', user.uid));
      const prodSnap = await getDocs(qProd);
      setProductos(prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Descargar clientes
      const qCli = query(collection(db, 'clientes'), where('uid', '==', user.uid));
      const cliSnap = await getDocs(qCli);
      setClientes(cliSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Descargar ventas
      const qVen = query(collection(db, 'ventas'), where('uid', '==', user.uid));
      const venSnap = await getDocs(qVen);
      setVentas(venSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Descargar configuración
      const configSnap = await getDocs(query(collection(db, 'configuracion'), where('uid', '==', user.uid)));
      if (!configSnap.empty) {
        setConfig({ ...configSnap.docs[0].data() });
      }
      setForm(f => ({ ...f, loading: false, status: 'Sincronización descarga exitosa' }));
      setSnackbar({ open: true, message: 'Datos descargados exitosamente de la nube', severity: 'success' });
    } catch (err) {
      setForm(f => ({ ...f, loading: false, error: 'Error al descargar datos' }));
      setSnackbar({ open: true, message: 'Error al descargar datos', severity: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3, minWidth: 400 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración de Respaldos y Nube
      </Typography>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Respaldos locales" />
        <Tab label="Nube / Sincronización" />
      </Tabs>
      {tab === 0 && (
        <Stack spacing={2}>
          <FormControlLabel control={<Switch checked={form.autoBackup} onChange={handleChange('autoBackup')} />} label="Respaldo automático" />
          <FormControl fullWidth size="small" disabled={!form.autoBackup}>
            <InputLabel>Frecuencia de respaldo</InputLabel>
            <Select value={form.backupFrequency} onChange={handleChange('backupFrequency')} label="Frecuencia de respaldo">
              <MenuItem value="daily">Diario</MenuItem>
              <MenuItem value="weekly">Semanal</MenuItem>
              <MenuItem value="monthly">Mensual</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={onClose}>Guardar</Button>
            <Button variant="outlined" onClick={onClose}>Cerrar</Button>
          </Stack>
        </Stack>
      )}
      {tab === 1 && (
        <Stack spacing={2}>
          <Typography variant="subtitle1">Configuración de Nube</Typography>
          <TextField label="Usuario de nube" value={form.cloudUser} onChange={handleChange('cloudUser')} fullWidth size="small" />
          <TextField label="Token/Contraseña" value={form.cloudToken} onChange={handleChange('cloudToken')} fullWidth size="small" type="password" />
          <TextField label="Intervalo de sincronización (min)" type="number" value={form.interval} onChange={handleChange('interval')} fullWidth size="small" />
          <TextField label="Cantidad de registros por petición" type="number" value={form.batchSize} onChange={handleChange('batchSize')} fullWidth size="small" />
          <Typography variant="subtitle2" sx={{ mt: 2 }}>Sincronización manual</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary" startIcon={<CloudUploadIcon />} disabled={form.loading} onClick={handleSyncUp}>
              Subir todo
            </Button>
            <Button variant="outlined" color="primary" startIcon={<CloudDownloadIcon />} disabled={form.loading} onClick={handleSyncDown}>
              Bajar todo
            </Button>
            {form.loading && <CircularProgress size={28} sx={{ ml: 2 }} />}
          </Stack>
          {form.status && <Alert severity="success">{form.status}</Alert>}
          {form.error && <Alert severity="error">{form.error}</Alert>}
        </Stack>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default RespaldosConfigModal; 