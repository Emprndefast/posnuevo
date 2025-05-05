import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useFirebase } from '../../hooks/useFirebase';
import { COLLECTIONS } from '../../constants';
import { format } from 'date-fns';

const StockManager = ({ product, onSave, onCancel }) => {
  const { darkMode } = useTheme();
  const { getCollection, loading, error } = useFirebase();
  const [activeTab, setActiveTab] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [operation, setOperation] = useState('add');
  const [reason, setReason] = useState('');
  const [location, setLocation] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [batch, setBatch] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockHistory, setStockHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [locations, setLocations] = useState([
    'Almacén Principal',
    'Estante A',
    'Estante B',
    'Bodega',
    'Exhibición'
  ]);

  useEffect(() => {
    loadStockHistory();
  }, [product]);

  const loadStockHistory = async () => {
    try {
      const history = await getCollection(COLLECTIONS.INVENTORY, {
        where: [['productId', '==', product.id]],
        orderBy: [['timestamp', 'desc']]
      });
      setStockHistory(history);
      setFilteredHistory(history);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
      setValidationError('');
    }
  };

  const handleOperationChange = (op) => {
    setOperation(op);
    setQuantity('');
    setValidationError('');
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    const filtered = stockHistory.filter(item => 
      item.reason.toLowerCase().includes(value) ||
      item.location?.toLowerCase().includes(value) ||
      item.batch?.toLowerCase().includes(value)
    );
    
    setFilteredHistory(filtered);
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    const sorted = [...filteredHistory].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];
      
      if (field === 'date') {
        return sortDirection === 'asc' 
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }
      
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    
    setFilteredHistory(sorted);
  };

  const validateForm = () => {
    if (!quantity || parseInt(quantity) <= 0) {
      setValidationError('La cantidad debe ser mayor a 0');
      return false;
    }
    
    if (operation === 'remove' && parseInt(quantity) > product.quantity) {
      setValidationError(`No puedes retirar más de ${product.quantity} unidades`);
      return false;
    }
    
    if (!reason.trim()) {
      setValidationError('Debes especificar un motivo');
      return false;
    }
    
    if (!location && operation === 'add') {
      setValidationError('Debes especificar una ubicación');
      return false;
    }
    
    if (operation === 'add' && !expirationDate) {
      setValidationError('Debes especificar una fecha de vencimiento');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      const qty = parseInt(quantity);
      const newQuantity = operation === 'add' 
        ? product.quantity + qty 
        : product.quantity - qty;
      
      const stockData = {
        productId: product.id,
        productName: product.name,
        operation,
        quantity: qty,
        reason,
        location: operation === 'add' ? location : undefined,
        batch: operation === 'add' ? batch : undefined,
        expirationDate: operation === 'add' ? expirationDate : undefined,
        previousStock: product.quantity,
        newStock: newQuantity,
        timestamp: new Date().toISOString(),
        user: 'admin' // TODO: Agregar usuario actual
      };
      
      await onSave(product.id, qty, operation, reason, stockData);
    } catch (err) {
      console.error('Error al actualizar el stock:', err);
      setValidationError('Error al actualizar el stock. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStockForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Stock Actual:
          </Typography>
          <Chip 
            label={`${product?.quantity} unidades`} 
            color={product?.quantity <= product?.minStock ? 'error' : 'success'}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        {product?.quantity <= product?.minStock && (
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ mb: 2 }}
          >
            Este producto tiene stock bajo. Stock mínimo: {product?.minStock}
          </Alert>
        )}
      </Grid>
      
      <Grid item xs={12}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2,
          mb: 3
        }}>
          <Button
            variant={operation === 'add' ? 'contained' : 'outlined'}
            color="success"
            startIcon={<AddIcon />}
            onClick={() => handleOperationChange('add')}
            disabled={isSubmitting}
            sx={{ 
              borderRadius: 2,
              minWidth: 120,
              fontWeight: 'bold',
            }}
          >
            Agregar
          </Button>
          <Button
            variant={operation === 'remove' ? 'contained' : 'outlined'}
            color="error"
            startIcon={<RemoveIcon />}
            onClick={() => handleOperationChange('remove')}
            disabled={isSubmitting}
            sx={{ 
              borderRadius: 2,
              minWidth: 120,
              fontWeight: 'bold',
            }}
          >
            Retirar
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Cantidad"
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          error={!!validationError && !quantity}
          helperText={validationError && !quantity ? validationError : ''}
          InputProps={{
            startAdornment: <InputAdornment position="start">#</InputAdornment>,
          }}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Motivo"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={!!validationError && !reason}
          helperText={validationError && !reason ? validationError : ''}
        />
      </Grid>
      
      {operation === 'add' && (
        <>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!validationError && !location}>
              <InputLabel>Ubicación</InputLabel>
              <Select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                label="Ubicación"
              >
                {locations.map((loc) => (
                  <MenuItem key={loc} value={loc}>
                    {loc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Lote"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="Ej: L2023001"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Fecha de Vencimiento"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              error={!!validationError && !expirationDate}
              helperText={validationError && !expirationDate ? validationError : ''}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </>
      )}
    </Grid>
  );

  const renderHistory = () => (
    <Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar en historial..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                onClick={() => handleSort('date')}
                sx={{ cursor: 'pointer' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Fecha
                  <SortIcon sx={{ 
                    ml: 1, 
                    transform: sortField === 'date' 
                      ? `rotate(${sortDirection === 'asc' ? 0 : 180}deg)` 
                      : 'none' 
                  }} />
                </Box>
              </TableCell>
              <TableCell 
                onClick={() => handleSort('operation')}
                sx={{ cursor: 'pointer' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  Operación
                  <SortIcon sx={{ 
                    ml: 1, 
                    transform: sortField === 'operation' 
                      ? `rotate(${sortDirection === 'asc' ? 0 : 180}deg)` 
                      : 'none' 
                  }} />
                </Box>
              </TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Lote</TableCell>
              <TableCell>Vencimiento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHistory.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  {format(new Date(item.timestamp), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.operation === 'add' ? 'Entrada' : 'Salida'}
                    color={item.operation === 'add' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell>{item.location || '-'}</TableCell>
                <TableCell>{item.batch || '-'}</TableCell>
                <TableCell>
                  {item.expirationDate 
                    ? format(new Date(item.expirationDate), 'dd/MM/yyyy')
                    : '-'
                  }
                </TableCell>
              </TableRow>
            ))}
            {filteredHistory.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay movimientos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {validationError}
        </Alert>
      )}
      
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab 
          label="Gestionar Stock" 
          icon={<InventoryIcon />} 
          iconPosition="start"
        />
        <Tab 
          label="Historial" 
          icon={<HistoryIcon />} 
          iconPosition="start"
        />
      </Tabs>
      
      {activeTab === 0 ? renderStockForm() : renderHistory()}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isSubmitting}
          startIcon={<CancelIcon />}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </Box>
    </Box>
  );
};

export default StockManager; 