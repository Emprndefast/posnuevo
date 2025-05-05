import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Modal,
  Divider,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  Fade,
  CircularProgress,
  Alert,
} from '@mui/material';
import { collection, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import RegistroMovimiento from './registro';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import PageContainer from '../../components/PageContainer';

const COLORS = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#ab47bc', '#26a69a'];

const Contabilidad = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      // Escuchar cambios en la colección 'contabilidad' (movimientos)
      const unsubMovimientos = onSnapshot(collection(db, 'contabilidad'), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMovimientos(data);
        setLoading(false);
      }, (error) => {
        console.error("Error al cargar movimientos:", error);
        setError("Error al cargar los movimientos. Por favor, intente nuevamente.");
        setLoading(false);
      });

      // Escuchar cambios en la colección 'productos' (productos)
      const unsubProductos = onSnapshot(collection(db, 'productos'), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProductos(data);
        setLoading(false);
      }, (error) => {
        console.error("Error al cargar productos:", error);
        setError("Error al cargar los productos. Por favor, intente nuevamente.");
        setLoading(false);
      });

      return () => {
        unsubMovimientos();
        unsubProductos();
      };
    } catch (error) {
      console.error("Error en la suscripción:", error);
      setError("Error al conectar con la base de datos. Por favor, intente nuevamente.");
      setLoading(false);
    }
  }, []);

  // Filtrar movimientos según los filtros aplicados
  const movimientosFiltrados = useMemo(() => {
    let resultado = [...movimientos];
    
    // Filtrar por tipo
    if (filtroTipo !== 'todos') {
      resultado = resultado.filter(m => m.tipo === filtroTipo);
    }
    
    // Filtrar por período (simplificado)
    if (filtroPeriodo !== 'todos') {
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const inicioTrimestre = new Date(hoy.getFullYear(), Math.floor(hoy.getMonth() / 3) * 3, 1);
      const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
      
      resultado = resultado.filter(m => {
        const fechaMovimiento = m.fecha ? new Date(m.fecha) : new Date();
        
        switch (filtroPeriodo) {
          case 'mes':
            return fechaMovimiento >= inicioMes;
          case 'trimestre':
            return fechaMovimiento >= inicioTrimestre;
          case 'anio':
            return fechaMovimiento >= inicioAnio;
          default:
            return true;
        }
      });
    }
    
    // Filtrar por búsqueda
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(m => 
        (m.descripcion && m.descripcion.toLowerCase().includes(busquedaLower)) ||
        (m.categoria && m.categoria.toLowerCase().includes(busquedaLower))
      );
    }
    
    return resultado;
  }, [movimientos, filtroTipo, filtroPeriodo, busqueda]);

  // Filtrar productos según la búsqueda
  const productosFiltrados = useMemo(() => {
    if (!busqueda) return productos;
    
    const busquedaLower = busqueda.toLowerCase();
    return productos.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(busquedaLower)) ||
      (p.categoria && p.categoria.toLowerCase().includes(busquedaLower))
    );
  }, [productos, busqueda]);

  // Total de ingresos, egresos y balance
  const totalIngresos = movimientosFiltrados
    .filter((m) => m.tipo === 'ingreso')
    .reduce((sum, m) => sum + (m.monto || 0), 0);
  const totalEgresos = movimientosFiltrados
    .filter((m) => m.tipo === 'egreso')
    .reduce((sum, m) => sum + (m.monto || 0), 0);
  const balance = totalIngresos - totalEgresos;

  // Sumar el total de todos los productos
  const totalProductos = productos.reduce((sum, p) => sum + (p.precio || 0), 0);

  // Resumen por categoría de productos
  const resumenCategorias = productos.reduce((acc, p) => {
    const key = p.categoria || 'Sin categoría';
    acc[key] = (acc[key] || 0) + (p.precio || 0);
    return acc;
  }, {});

  // Datos para gráficas (Ingresos vs Egresos)
  const dataLinea = useMemo(() => {
    // Agrupar movimientos por mes
    const movimientosPorMes = {};
    
    movimientosFiltrados.forEach(m => {
      const fecha = m.fecha ? new Date(m.fecha) : new Date();
      const mesKey = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
      
      if (!movimientosPorMes[mesKey]) {
        movimientosPorMes[mesKey] = { ingresos: 0, egresos: 0 };
      }
      
      if (m.tipo === 'ingreso') {
        movimientosPorMes[mesKey].ingresos += m.monto || 0;
      } else if (m.tipo === 'egreso') {
        movimientosPorMes[mesKey].egresos += m.monto || 0;
      }
    });
    
    // Convertir a formato para el gráfico
    return Object.entries(movimientosPorMes).map(([mes, datos]) => {
      const [anio, mesNum] = mes.split('-');
      const nombreMes = new Date(anio, mesNum - 1).toLocaleString('es', { month: 'short' });
      return {
        nombre: `${nombreMes} ${anio}`,
        ingresos: datos.ingresos,
        egresos: datos.egresos
      };
    }).sort((a, b) => {
      // Ordenar por fecha
      const [aAnio, aMes] = a.nombre.split(' ');
      const [bAnio, bMes] = b.nombre.split(' ');
      const meses = { 'ene': 1, 'feb': 2, 'mar': 3, 'abr': 4, 'may': 5, 'jun': 6, 'jul': 7, 'ago': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dic': 12 };
      return (aAnio - bAnio) || (meses[aMes] - meses[bMes]);
    });
  }, [movimientosFiltrados]);

  // Datos para gráfica de distribución de productos por categoría
  const dataTorta = useMemo(() => 
    Object.entries(resumenCategorias)
      .map(([nombre, valor]) => ({ nombre, valor }))
      .sort((a, b) => b.valor - a.valor),
    [resumenCategorias]
  );

  // Manejar cambio de página
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Manejar cambio de filas por página
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manejar apertura del modal de edición
  const handleEditProduct = (producto) => {
    setProductoSeleccionado(producto);
    setOpenEditModal(true);
  };

  // Manejar cierre del modal de edición
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setProductoSeleccionado(null);
  };

  // Calcular el porcentaje de cambio respecto al período anterior
  const calcularCambioPorcentual = () => {
    if (dataLinea.length < 2) return 0;
    
    const ultimoPeriodo = dataLinea[dataLinea.length - 1];
    const penultimoPeriodo = dataLinea[dataLinea.length - 2];
    
    const balanceUltimo = ultimoPeriodo.ingresos - ultimoPeriodo.egresos;
    const balancePenultimo = penultimoPeriodo.ingresos - penultimoPeriodo.egresos;
    
    if (balancePenultimo === 0) return 0;
    
    return ((balanceUltimo - balancePenultimo) / Math.abs(balancePenultimo)) * 100;
  };

  const cambioPorcentual = calcularCambioPorcentual();

  return (
    <Layout>
      <PageContainer
        title="Contabilidad"
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Recargar datos">
              <IconButton onClick={() => window.location.reload()} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenModal(true)}
              sx={{ borderRadius: 2 }}
            >
              Registrar Movimiento
            </Button>
          </Box>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Resumen de finanzas */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Fade in timeout={500}>
                  <Card 
                    sx={{ 
                      bgcolor: theme.palette.success.light,
                      color: theme.palette.success.contrastText,
                      height: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[4],
                      }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                            Ingresos
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                            ${totalIngresos.toFixed(2)}
                          </Typography>
                        </Box>
                        <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Fade in timeout={700}>
                  <Card 
                    sx={{ 
                      bgcolor: theme.palette.error.light,
                      color: theme.palette.error.contrastText,
                      height: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[4],
                      }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                            Egresos
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                            ${totalEgresos.toFixed(2)}
                          </Typography>
                        </Box>
                        <TrendingDownIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Fade in timeout={900}>
                  <Card 
                    sx={{ 
                      bgcolor: balance >= 0 ? theme.palette.info.light : theme.palette.warning.light,
                      color: balance >= 0 ? theme.palette.info.contrastText : theme.palette.warning.contrastText,
                      height: '100%',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: theme.shadows[4],
                      }
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                            Balance
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                            ${balance.toFixed(2)}
                          </Typography>
                          {cambioPorcentual !== 0 && (
                            <Chip 
                              label={`${cambioPorcentual > 0 ? '+' : ''}${cambioPorcentual.toFixed(1)}%`}
                              color={cambioPorcentual > 0 ? 'success' : 'error'}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                        <AccountBalanceIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            </Grid>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 4 }}>
              <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} alignItems="center">
                <TextField
                  label="Buscar"
                  variant="outlined"
                  size="small"
                  fullWidth={isMobile}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={filtroTipo}
                    label="Tipo"
                    onChange={(e) => setFiltroTipo(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="ingreso">Ingresos</MenuItem>
                    <MenuItem value="egreso">Egresos</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={filtroPeriodo}
                    label="Período"
                    onChange={(e) => setFiltroPeriodo(e.target.value)}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="mes">Este mes</MenuItem>
                    <MenuItem value="trimestre">Este trimestre</MenuItem>
                    <MenuItem value="anio">Este año</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setFiltroTipo('todos');
                    setFiltroPeriodo('todos');
                    setBusqueda('');
                  }}
                >
                  Limpiar filtros
                </Button>
              </Box>
            </Paper>

            {/* Gráficos */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Ingresos vs Egresos
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dataLinea}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nombre" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="ingresos" 
                        stroke={theme.palette.success.main} 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="egresos" 
                        stroke={theme.palette.error.main} 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Distribución por Categoría
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dataTorta}
                        dataKey="valor"
                        nameKey="nombre"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {dataTorta.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* Tabla de productos */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Productos
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1">
                  Total: {productosFiltrados.length} productos
                </Typography>
                <Typography variant="subtitle1" color="primary" fontWeight="bold">
                  Valor total: ${totalProductos.toFixed(2)}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {productosFiltrados.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">
                    No hay productos que coincidan con la búsqueda.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell align="right">Precio</TableCell>
                        <TableCell align="right">Stock</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productosFiltrados
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((producto) => (
                          <TableRow key={producto.id} hover>
                            <TableCell>{producto.nombre}</TableCell>
                            <TableCell>
                              <Chip 
                                label={producto.categoria || 'Sin categoría'} 
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">${producto.precio?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell align="right">{producto.quantity || 0}</TableCell>
                            <TableCell align="center">
                              <Tooltip title="Editar">
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => handleEditProduct(producto)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => {
                                    // Aquí iría la lógica para eliminar
                                    console.log('Eliminar producto:', producto.id);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={productosFiltrados.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                  />
                </TableContainer>
              )}
            </Paper>

            {/* Lista de movimientos recientes */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Movimientos Recientes
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {movimientosFiltrados.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography color="text.secondary">
                    No hay movimientos que coincidan con los filtros seleccionados.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell>Tipo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {movimientosFiltrados.slice(0, 5).map((movimiento) => (
                        <TableRow key={movimiento.id} hover>
                          <TableCell>
                            {movimiento.fecha 
                              ? new Date(movimiento.fecha).toLocaleDateString('es-ES') 
                              : 'Sin fecha'}
                          </TableCell>
                          <TableCell>{movimiento.descripcion || 'Sin descripción'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={movimiento.categoria || 'Sin categoría'} 
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">${movimiento.monto?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={movimiento.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} 
                              size="small"
                              color={movimiento.tipo === 'ingreso' ? 'success' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </>
        )}

        {/* Modal para registrar movimiento */}
        <Modal 
          open={openModal} 
          onClose={() => setOpenModal(false)}
          aria-labelledby="modal-registro-movimiento"
        >
          <Box
            sx={{
              maxWidth: 500,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              mx: 'auto',
              mt: '10%',
              borderRadius: 2,
              [theme.breakpoints.down('sm')]: {
                width: '90%',
                mt: '20%',
              }
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Registrar Movimiento
            </Typography>
            <RegistroMovimiento onClose={() => setOpenModal(false)} />
          </Box>
        </Modal>

        {/* Modal para editar producto */}
        <Modal 
          open={openEditModal} 
          onClose={handleCloseEditModal}
          aria-labelledby="modal-editar-producto"
        >
          <Box
            sx={{
              maxWidth: 500,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              mx: 'auto',
              mt: '10%',
              borderRadius: 2,
              [theme.breakpoints.down('sm')]: {
                width: '90%',
                mt: '20%',
              }
            }}
          >
            <Typography variant="h6" component="h2" gutterBottom>
              Editar Producto
            </Typography>
            {productoSeleccionado && (
              <Box>
                <Typography>
                  Editar producto: {productoSeleccionado.nombre}
                </Typography>
                {/* Aquí iría el formulario de edición */}
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" onClick={handleCloseEditModal}>
                    Cancelar
                  </Button>
                  <Button variant="contained" color="primary">
                    Guardar cambios
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Modal>
      </PageContainer>
    </Layout>
  );
};

export default Contabilidad;
