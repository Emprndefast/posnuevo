import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Print as PrintIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { SaleDetails } from '../components/sales/SalesList';
import saleService from '../services/saleService';
import { useSnackbar } from '../hooks/useSnackbar';

const Ventas = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await saleService.getAll();
      setSales(data);
    } catch (error) {
      showSnackbar('Error al cargar las ventas: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetails(true);
  };

  const handlePrintTicket = async (sale) => {
    try {
      await saleService.printTicket(sale);
      showSnackbar('Ticket impreso correctamente', 'success');
    } catch (error) {
      showSnackbar('Error al imprimir el ticket: ' + error.message, 'error');
    }
  };

  const handleNewSale = () => {
    navigate('/nueva-venta');
  };

  const handleUpdateSale = async (updatedSale) => {
    try {
      await saleService.update(updatedSale.id, updatedSale);
      setSales(sales.map(sale => 
        sale.id === updatedSale.id ? updatedSale : sale
      ));
      showSnackbar('Venta actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error al actualizar la venta:', error);
      showSnackbar('Error al actualizar la venta', 'error');
      throw error;
    }
  };

  // Estadísticas rápidas
  const totalSales = sales.length;
  const totalIncome = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const averagePerSale = totalSales > 0 ? totalIncome / totalSales : 0;
  const uniqueCustomers = new Set(sales.map(sale => sale.customerId)).size;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Gestión de Ventas</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNewSale}
            sx={{ mr: 1 }}
          >
            Nueva Venta
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSales}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">{totalSales}</Typography>
              <Typography variant="subtitle2">TOTAL VENTAS</Typography>
              <Typography variant="caption">Hoy</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">${totalIncome.toFixed(2)}</Typography>
              <Typography variant="subtitle2">INGRESOS</Typography>
              <Typography variant="caption">Total ingresado</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">${averagePerSale.toFixed(2)}</Typography>
              <Typography variant="subtitle2">PROMEDIO</Typography>
              <Typography variant="caption">Por venta</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">{uniqueCustomers}</Typography>
              <Typography variant="subtitle2">CLIENTES</Typography>
              <Typography variant="caption">Únicos</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar ventas..."
          variant="outlined"
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Sales Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{sale.id.slice(-6)}</TableCell>
                <TableCell>{new Date(sale.date).toLocaleString()}</TableCell>
                <TableCell>{sale.customerName || 'Cliente General'}</TableCell>
                <TableCell>${sale.total?.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    label={sale.status === 'completed' ? 'Completada' : 'Cancelada'}
                    color={sale.status === 'completed' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver detalles">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(sale)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Imprimir ticket">
                    <IconButton
                      size="small"
                      onClick={() => handlePrintTicket(sale)}
                    >
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Sale Details Dialog */}
      {showDetails && selectedSale && (
        <SaleDetails
          open={showDetails}
          sale={selectedSale}
          onClose={() => setShowDetails(false)}
          onPrint={handlePrintTicket}
          onUpdate={handleUpdateSale}
        />
      )}
    </Box>
  );
};

export default Ventas; 