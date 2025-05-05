import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from './ThemeContext';
import {
  TextField,
  Button,
  Container,
  Typography,
  Grid,
  Snackbar,
  CircularProgress,
  IconButton,
  Box,
  Card,
  Alert,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import ServiceCard from '../components/ServiceCard';
import { jsPDF } from 'jspdf';

function Reparaciones() {
  const [cliente, setCliente] = useState('');
  const [modelo, setModelo] = useState('');
  const [problema, setProblema] = useState('');
  const [precio, setPrecio] = useState('');
  const [fecha, setFecha] = useState('');
  const [loading, setLoading] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [ganancias, setGanancias] = useState({ dia: 0, semana: 0, mes: 0 });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { darkMode, toggleDarkMode } = useTheme();

  // Formato de fecha para mostrar en las tarjetas
  const formatFecha = (fecha) => {
    return fecha
      ? fecha.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Fecha no disponible';
  };

  const calcularGanancias = (datos) => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    let totalDia = 0;
    let totalSemana = 0;
    let totalMes = 0;

    datos.forEach((serv) => {
      const servFecha = serv.fecha?.toDate?.() || new Date(serv.fecha);
      if (!serv.pagado) return;

      if (esMismaFecha(servFecha, hoy)) totalDia += parseFloat(serv.precio);
      if (servFecha >= inicioSemana) totalSemana += parseFloat(serv.precio);
      if (servFecha >= inicioMes) totalMes += parseFloat(serv.precio);
    });

    setGanancias({ dia: totalDia, semana: totalSemana, mes: totalMes });
  };

  const esMismaFecha = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  useEffect(() => {
    const q = query(collection(db, 'servicios'), orderBy('fecha', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const datos = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const fechaConvertida = data.fecha ? data.fecha.toDate() : null;
          if (!data.cliente || !data.modelo || !data.precio || !fechaConvertida) {
            console.error('Datos incompletos para el servicio:', doc.id);
            return null;
          }
          return { ...data, fecha: fechaConvertida, id: doc.id };
        })
        .filter((servicio) => servicio !== null);
      setServicios(datos);
      calcularGanancias(datos);
    });

    return () => unsub();
  }, []);

  const guardarServicio = async () => {
    if (!cliente || !modelo || !problema || !precio || !fecha) {
      setSnackbarMessage('Todos los campos son obligatorios.');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'servicios'), {
        cliente,
        modelo,
        problema,
        precio,
        fecha: Timestamp.fromDate(new Date(fecha)),
        pagado: false,
        timestamp: Timestamp.now(),
      });

      setCliente('');
      setModelo('');
      setProblema('');
      setPrecio('');
      setFecha('');
      setSnackbarMessage('Servicio guardado correctamente.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error al guardar:', error);
      setSnackbarMessage('Error al guardar el servicio.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const eliminarServicio = async (id) => {
    try {
      await deleteDoc(doc(db, 'servicios', id));
      setSnackbarMessage('Servicio eliminado correctamente.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error al eliminar:', error);
      setSnackbarMessage('Error al eliminar el servicio.');
      setSnackbarOpen(true);
    }
  };

  const marcarComoPagado = async (id) => {
    try {
      await updateDoc(doc(db, 'servicios', id), { pagado: true });
      setSnackbarMessage('Servicio marcado como pagado.');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error al actualizar:', error);
      setSnackbarMessage('Error al actualizar el estado del servicio.');
      setSnackbarOpen(true);
    }
  };

  // Función de impresión de factura
  const imprimirFactura = (servicio) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Título de la factura
    doc.text('Factura de Reparación', 10, 20);
    doc.text(`Cliente: ${servicio.cliente}`, 10, 30);
    doc.text(`Modelo: ${servicio.modelo}`, 10, 40);
    doc.text(`Problema: ${servicio.problema}`, 10, 50);
    doc.text(`Precio: $${servicio.precio}`, 10, 60);
    doc.text(`Fecha: ${formatFecha(servicio.fecha)}`, 10, 70);

    // Guardar y descargar el PDF
    doc.save(`factura_${servicio.id}.pdf`);
  };

  // Función de impresión de etiqueta
  const imprimirEtiqueta = (servicio) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // Título de la etiqueta
    doc.text(`Servicio: ${servicio.id}`, 10, 10);
    doc.text(`Cliente: ${servicio.cliente}`, 10, 20);
    doc.text(`Modelo: ${servicio.modelo}`, 10, 30);
    doc.text(`Precio: $${servicio.precio}`, 10, 40);
    doc.text(`Fecha: ${formatFecha(servicio.fecha)}`, 10, 50);

    // Ajustar tamaño de la etiqueta según sea necesario

    // Guardar y descargar la etiqueta como PDF
    doc.save(`etiqueta_${servicio.id}.pdf`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: darkMode ? '#121212' : '#f5f5f5',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        sx={{
          backgroundColor: darkMode ? '#1E1E1E' : '#fff',
          boxShadow: 1,
        }}
      >
        <Typography variant="h5" color="primary" fontWeight="bold">
          Reparaciones NT
        </Typography>
        <IconButton onClick={toggleDarkMode}>
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Tarjetas de ganancias */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, backgroundColor: darkMode ? '#2D2D2D' : '#fff', borderRadius: 2 }}>
              <Typography variant="body1" color="textSecondary">
                Ganancias Hoy:
              </Typography>
              <Typography variant="h4" color="success.main">
                ${ganancias.dia.toFixed(2)}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, backgroundColor: darkMode ? '#2D2D2D' : '#fff', borderRadius: 2 }}>
              <Typography variant="body1" color="textSecondary">
                Ganancias Semana:
              </Typography>
              <Typography variant="h4" color="info.main">
                ${ganancias.semana.toFixed(2)}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ p: 2, backgroundColor: darkMode ? '#2D2D2D' : '#fff', borderRadius: 2 }}>
              <Typography variant="body1" color="textSecondary">
                Ganancias Mes:
              </Typography>
              <Typography variant="h4" color="primary">
                ${ganancias.mes.toFixed(2)}
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Formulario */}
        <Card sx={{ p: 3, mb: 4, backgroundColor: darkMode ? '#2D2D2D' : '#fff', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Nuevo Servicio
          </Typography>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              guardarServicio();
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Cliente"
                  fullWidth
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Modelo"
                  fullWidth
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Problema"
                  fullWidth
                  multiline
                  rows={3}
                  value={problema}
                  onChange={(e) => setProblema(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Precio"
                  type="number"
                  fullWidth
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha"
                  type="date"
                  fullWidth
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
            <Box mt={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ padding: '12px 0' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Guardar Servicio'}
              </Button>
            </Box>
          </form>
        </Card>

        {/* Lista de servicios */}
        <Typography variant="h6" color="primary" gutterBottom>
          Servicios Registrados
        </Typography>
        {servicios.length === 0 ? (
          <Alert severity="info">No hay servicios registrados</Alert>
        ) : (
          servicios.map((servicio) => (
            <ServiceCard
              key={servicio.id}
              servicio={servicio}
              onDelete={() => eliminarServicio(servicio.id)}
              onMarkPaid={() => marcarComoPagado(servicio.id)}
              onPrintFactura={() => imprimirFactura(servicio)}
              onPrintEtiqueta={() => imprimirEtiqueta(servicio)}
            />
          ))
        )}
      </Container>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Reparaciones;
