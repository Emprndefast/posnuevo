import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, TextField, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';

// Simulación de datos de reportes
const mockReportes = [
  { fecha: '2025-04-01', cliente: 'Juan Pérez', producto: 'Pantalla', total: 1200 },
  { fecha: '2025-04-02', cliente: 'Ana López', producto: 'Batería', total: 800 },
  { fecha: '2025-04-03', cliente: 'Carlos Ruiz', producto: 'Teclado', total: 500 },
  { fecha: '2025-04-03', cliente: 'Juan Pérez', producto: 'Cargador', total: 300 },
];

const clientes = [
  { value: '', label: 'Todos' },
  { value: 'Juan Pérez', label: 'Juan Pérez' },
  { value: 'Ana López', label: 'Ana López' },
  { value: 'Carlos Ruiz', label: 'Carlos Ruiz' },
];

const productos = [
  { value: '', label: 'Todos' },
  { value: 'Pantalla', label: 'Pantalla' },
  { value: 'Batería', label: 'Batería' },
  { value: 'Teclado', label: 'Teclado' },
  { value: 'Cargador', label: 'Cargador' },
];

const Reportes = () => {
  const [fechaInicio, setFechaInicio] = useState(dayjs().startOf('month'));
  const [fechaFin, setFechaFin] = useState(dayjs());
  const [cliente, setCliente] = useState('');
  const [producto, setProducto] = useState('');

  // Filtrado de datos
  const reportesFiltrados = mockReportes.filter(r => {
    const fecha = dayjs(r.fecha);
    return (
      fecha.isAfter(fechaInicio.subtract(1, 'day')) &&
      fecha.isBefore(fechaFin.add(1, 'day')) &&
      (cliente === '' || r.cliente === cliente) &&
      (producto === '' || r.producto === producto)
    );
  });

  // Exportar a CSV
  const exportarCSV = () => {
    const encabezado = 'Fecha,Cliente,Producto,Total\n';
    const filas = reportesFiltrados.map(r =>
      `${r.fecha},${r.cliente},${r.producto},${r.total}`
    ).join('\n');
    const csv = encabezado + filas;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reporte.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={20} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Reportes
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Genera y descarga reportes filtrados por fechas, clientes y productos.
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <DatePicker
                label="Fecha inicio"
                value={fechaInicio}
                onChange={setFechaInicio}
                format="YYYY-MM-DD"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <DatePicker
                label="Fecha fin"
                value={fechaFin}
                onChange={setFechaFin}
                format="YYYY-MM-DD"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Cliente"
                value={cliente}
                onChange={e => setCliente(e.target.value)}
                fullWidth
                size="small"
              >
                {clientes.map(op => (
                  <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                label="Producto"
                value={producto}
                onChange={e => setProducto(e.target.value)}
                fullWidth
                size="small"
              >
                {productos.map(op => (
                  <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </LocalizationProvider>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={exportarCSV}
            disabled={reportesFiltrados.length === 0}
          >
            Exportar CSV
          </Button>
        </Box>
      </Paper>
      <Paper elevation={20} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Resultados
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportesFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay resultados para los filtros seleccionados.
                  </TableCell>
                </TableRow>
              ) : (
                reportesFiltrados.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{r.fecha}</TableCell>
                    <TableCell>{r.cliente}</TableCell>
                    <TableCell>{r.producto}</TableCell>
                    <TableCell align="right">${r.total}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Reportes;