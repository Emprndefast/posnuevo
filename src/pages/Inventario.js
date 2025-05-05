import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  useTheme as useMuiTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  LinearProgress,
  Badge,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Print as PrintIcon,
  LocalOffer as LabelIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useFirebase } from '../hooks/useFirebase';
import { COLLECTIONS, ERROR_MESSAGES } from '../constants';
import ProductForm from '../components/inventory/ProductForm';
import StockManager from '../components/inventory/StockManager';
import ProductLabel from '../components/inventory/ProductLabel';
import { useTheme } from '../context/ThemeContext';
import { ResponsiveChart } from '../components/charts/ResponsiveChart';
import { debounce } from 'lodash';
import * as XLSX from 'xlsx';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import ContentCard from '../components/layout/ContentCard';
import ContentSection from '../components/layout/ContentSection';
import { pageStyles, cardStyles, tableStyles } from '../styles/commonStyles';

const Inventory = () => {
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const { darkMode } = useTheme();
  const { loading: firebaseLoading, error, getCollection, addDocument, updateDocument, deleteDocument, uploadFile } = useFirebase();
  
  // Estados
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openProductForm, setOpenProductForm] = useState(false);
  const [openStockManager, setOpenStockManager] = useState(false);
  const [openProductLabel, setOpenProductLabel] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    category: '',
    lowStock: false,
    outOfStock: false
  });
  const [categories, setCategories] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0
  });
  const [lastOperation, setLastOperation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para determinar el estado del stock
  const getStockStatus = (quantity, minStock = 5) => {
    if (quantity === 0) {
      return { label: 'Sin Stock', color: 'error' };
    } else if (quantity <= minStock) {
      return { label: 'Stock Bajo', color: 'warning' };
    } else {
      return { label: 'En Stock', color: 'success' };
    }
  };

  // Cargar productos
  const loadProducts = useCallback(async (showMessage = false) => {
    try {
      if (!isInitialLoading) {
        setIsRefreshing(true);
      }
      
      console.log("Cargando productos de la colección:", COLLECTIONS.PRODUCTS);
      const data = await getCollection(COLLECTIONS.PRODUCTS);
      
      if (!data) {
        throw new Error('No se pudo obtener datos de la colección');
      }

      // Procesar datos para asegurar que todos los campos necesarios estén presentes
      const processedData = data.map(product => ({
        id: product.id,
        name: product.name || 'Producto sin nombre',
        code: product.code || product.id.substring(0, 6),
        price: parseFloat(product.price) || 0,
        cost: parseFloat(product.cost) || 0,
        quantity: parseInt(product.quantity) || 0,
        minStock: parseInt(product.minStock) || 5,
        category: product.category || 'Otros',
        tags: product.tags || [],
        photo: product.photo || '',
        description: product.description || '',
        location: product.location || '',
        barcode: product.barcode || '',
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString()
      }));

      console.log("Productos procesados:", processedData);
      setProducts(processedData);
      
      // Calcular estadísticas
      const stats = processedData.reduce((acc, product) => {
        acc.totalProducts++;
        acc.totalStock += product.quantity;
        acc.totalValue += product.price * product.quantity;
        
        if (product.quantity === 0) {
          acc.outOfStockCount++;
        } else if (product.quantity <= product.minStock) {
          acc.lowStockCount++;
        }
        
        return acc;
      }, {
        totalProducts: 0,
        totalStock: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalValue: 0
      });
      
      setStats(stats);
      
      // Extraer categorías únicas
      const uniqueCategories = [...new Set(processedData.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);

      if (showMessage) {
        setSnackbar({
          open: true,
          message: 'Productos actualizados exitosamente',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setSnackbar({
        open: true,
        message: err.message || 'Error al cargar los productos',
        severity: 'error'
      });
      setProducts([]);
      setStats({
        totalProducts: 0,
        totalStock: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalValue: 0
      });
      setCategories([]);
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [getCollection, isInitialLoading]);

  useEffect(() => {
    const loadInitialData = async () => {
      await loadProducts(false);
    };
    loadInitialData();
  }, [loadProducts]);

  // Filtrar y ordenar productos
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    
    // Aplicar búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name?.toLowerCase().includes(searchLower) ||
        product.code?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar filtros
    if (activeFilters.category) {
      result = result.filter(product => product.category === activeFilters.category);
    }
    if (activeFilters.lowStock) {
      result = result.filter(product => 
        product.quantity > 0 && product.quantity <= (product.minStock || 5)
      );
    }
    if (activeFilters.outOfStock) {
      result = result.filter(product => product.quantity === 0);
    }
    
    // Aplicar ordenamiento
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });
    
    return result;
  }, [products, searchTerm, activeFilters, sortField, sortDirection]);

  // Actualizar productos filtrados cuando cambia la paginación
  useEffect(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    setFilteredProducts(filteredAndSortedProducts.slice(start, end));
  }, [filteredAndSortedProducts, page, rowsPerPage]);

  // Manejadores de eventos
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = debounce((event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  }, 300);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
    setPage(0);
  };

  const handleCategoryFilter = (category) => {
    setActiveFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
    setPage(0);
    setFilterAnchorEl(null);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const exportData = products.map(product => ({
        Código: product.code,
        Nombre: product.name,
        Categoría: product.category,
        Precio: product.price,
        Stock: product.quantity,
        'Stock Mínimo': product.minStock,
        Ubicación: product.location,
        Descripción: product.description
      }));
      
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
      
      XLSX.writeFile(wb, 'inventario.xlsx');
      
      setSnackbar({
        open: true,
        message: 'Inventario exportado exitosamente',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error al exportar el inventario',
        severity: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event) => {
    try {
      setIsImporting(true);
      setImportProgress(0);
      
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const total = jsonData.length;
        let processed = 0;
        
        for (const row of jsonData) {
          const productData = {
            code: row.Código?.toString(),
            name: row.Nombre,
            category: row.Categoría,
            price: parseFloat(row.Precio) || 0,
            quantity: parseInt(row.Stock) || 0,
            minStock: parseInt(row['Stock Mínimo']) || 5,
            location: row.Ubicación,
            description: row.Descripción,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          await addDocument(COLLECTIONS.PRODUCTS, productData);
          
          processed++;
          setImportProgress((processed / total) * 100);
        }
        
        await loadProducts(false);
        
        setSnackbar({
          open: true,
          message: 'Inventario importado exitosamente',
          severity: 'success'
        });
      };
      
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error al importar el inventario',
        severity: 'error'
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?`)) {
      try {
        await deleteDocument(COLLECTIONS.PRODUCTS, product.id);
        await loadProducts(false);
        
        setSnackbar({
          open: true,
          message: 'Producto eliminado exitosamente',
          severity: 'success'
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Error al eliminar el producto',
          severity: 'error'
        });
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      // Validar datos antes de guardar
      if (!productData.name || !productData.code || !productData.price || !productData.quantity || !productData.category) {
        setSnackbar({
          open: true,
          message: 'Por favor, complete todos los campos requeridos',
          severity: 'error'
        });
        return;
      }

      // Convertir valores numéricos y asegurar que sean válidos
      const processedData = {
        ...productData,
        price: Math.max(0, parseFloat(productData.price) || 0),
        cost: Math.max(0, parseFloat(productData.cost) || 0),
        quantity: Math.max(0, parseInt(productData.quantity) || 0),
        minStock: Math.max(0, parseInt(productData.minStock) || 5),
        taxRate: Math.min(100, Math.max(0, parseFloat(productData.taxRate) || 0)),
        dimensions: {
          length: Math.max(0, parseFloat(productData.dimensions?.length) || 0),
          width: Math.max(0, parseFloat(productData.dimensions?.width) || 0),
          height: Math.max(0, parseFloat(productData.dimensions?.height) || 0),
          weight: Math.max(0, parseFloat(productData.dimensions?.weight) || 0)
        },
        updatedAt: new Date().toISOString()
      };

      // Cerrar formulario primero para evitar problemas de estado
      setIsSubmitting(true);
      setOpenProductForm(false);
      setSelectedProduct(null);
      
      if (selectedProduct) {
        // Actualizar producto existente
        await updateDocument(COLLECTIONS.PRODUCTS, selectedProduct.id, processedData);
        console.log(`Producto actualizado: ${selectedProduct.id}`);
        setLastOperation('update');
        setSnackbar({
          open: true,
          message: 'Producto actualizado exitosamente',
          severity: 'success'
        });
      } else {
        // Crear nuevo producto
        processedData.createdAt = new Date().toISOString();
        const newProductId = await addDocument(COLLECTIONS.PRODUCTS, processedData);
        console.log(`Nuevo producto creado: ${newProductId}`);
        setLastOperation('add');
        setSnackbar({
          open: true,
          message: 'Producto agregado exitosamente',
          severity: 'success'
        });
      }
      
      // Recargar productos después de cerrar el formulario
      await loadProducts(false);
    } catch (err) {
      console.error("Error al guardar el producto:", err);
      setSnackbar({
        open: true,
        message: `Error al ${selectedProduct ? 'actualizar' : 'agregar'} el producto: ${err.message}`,
        severity: 'error'
      });
      // Reabrir el formulario si hubo un error
      setOpenProductForm(true);
      setSelectedProduct(selectedProduct);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveStock = async (productId, quantity, operation, reason) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      const newQuantity = operation === 'add' 
        ? product.quantity + quantity
        : product.quantity - quantity;
      
      if (newQuantity < 0) {
        throw new Error('No hay suficiente stock disponible');
      }
      
      // Cerrar diálogo primero
      setOpenStockManager(false);
      
      await updateDocument(COLLECTIONS.PRODUCTS, productId, {
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      });
      
      // Registrar movimiento de stock
      await addDocument(COLLECTIONS.INVENTORY, {
        productId,
        productName: product.name,
        quantity,
        operation,
        reason,
        previousStock: product.quantity,
        newStock: newQuantity,
        timestamp: new Date().toISOString()
      });
      
      setSnackbar({
        open: true,
        message: 'Stock actualizado exitosamente',
        severity: 'success'
      });
      
      // Recargar productos sin mostrar mensaje
      await loadProducts(false);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Error al actualizar el stock',
        severity: 'error'
      });
    }
  };

  // Renderizado de componentes
  const renderTableHeader = () => (
    <TableHead>
      <TableRow>
        <TableCell 
          onClick={() => handleSort('name')}
          sx={{ 
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            minWidth: isMobile ? '120px' : '200px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            Nombre
            <SortIcon sx={{ ml: 1, transform: sortField === 'name' ? `rotate(${sortDirection === 'asc' ? 0 : 180}deg)` : 'none' }} />
          </Box>
        </TableCell>
        <TableCell 
          onClick={() => handleSort('code')}
          sx={{ 
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: isMobile ? 'none' : 'table-cell'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            Código
            <SortIcon sx={{ ml: 1, transform: sortField === 'code' ? `rotate(${sortDirection === 'asc' ? 0 : 180}deg)` : 'none' }} />
          </Box>
        </TableCell>
        <TableCell 
          onClick={() => handleSort('category')}
          sx={{ 
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: isMobile ? 'none' : 'table-cell'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            Categoría
            <SortIcon sx={{ ml: 1, transform: sortField === 'category' ? `rotate(${sortDirection === 'asc' ? 0 : 180}deg)` : 'none' }} />
          </Box>
        </TableCell>
        <TableCell 
          onClick={() => handleSort('price')}
          sx={{ 
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            Precio
            <SortIcon sx={{ ml: 1, transform: sortField === 'price' ? `rotate(${sortDirection === 'asc' ? 0 : 180}deg)` : 'none' }} />
          </Box>
        </TableCell>
        <TableCell 
          onClick={() => handleSort('quantity')}
          sx={{ 
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            Stock
            <SortIcon sx={{ ml: 1, transform: sortField === 'quantity' ? `rotate(${sortDirection === 'asc' ? 0 : 180}deg)` : 'none' }} />
          </Box>
        </TableCell>
        <TableCell align="right" sx={{ minWidth: isMobile ? '100px' : '150px' }}>
          Acciones
        </TableCell>
      </TableRow>
    </TableHead>
  );

  const renderTableRow = (product) => (
    <TableRow key={product.id} hover>
      <TableCell sx={{ 
        maxWidth: isMobile ? '120px' : '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {product.name}
      </TableCell>
      <TableCell sx={{ display: isMobile ? 'none' : 'table-cell' }}>
        {product.code}
      </TableCell>
      <TableCell sx={{ display: isMobile ? 'none' : 'table-cell' }}>
        {product.category}
      </TableCell>
      <TableCell>
        ${product.price?.toFixed(2) || '0.00'}
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography>{product.quantity}</Typography>
          {product.quantity <= (product.minStock || 5) && (
            <Tooltip title="Stock bajo">
              <WarningIcon color="warning" fontSize="small" />
            </Tooltip>
          )}
        </Box>
      </TableCell>
      <TableCell align="right">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              onClick={() => {
                setSelectedProduct(product);
                setOpenProductForm(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Gestionar Stock">
            <IconButton 
              size="small"
              onClick={() => {
                setSelectedProduct(product);
                setOpenStockManager(true);
              }}
            >
              <InventoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir Etiqueta">
            <IconButton 
              size="small"
              onClick={() => {
                setSelectedProduct(product);
                setOpenProductLabel(true);
              }}
            >
              <LabelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton 
              size="small"
              onClick={() => handleDelete(product)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <ResponsiveLayout>
      <ContentSection>
        <ContentCard
          title="Inventario"
          subtitle="Gestiona tu inventario de productos"
          actions={
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isRefreshing && <CircularProgress size={24} />}
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
                onClick={() => {
                  setSelectedProduct(null);
                  setOpenProductForm(true);
                }}
              >
                Nuevo Producto
              </Button>
            </Box>
          }
        >
          {isInitialLoading ? (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Cargando productos...</Typography>
            </Box>
          ) : products.length === 0 ? (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay productos en el inventario
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                Agrega productos para comenzar a gestionar tu inventario
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedProduct(null);
                  setOpenProductForm(true);
                }}
              >
                Agregar Producto
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Box>

              <TableContainer sx={tableStyles.root}>
                <Table sx={tableStyles.table}>
                  {renderTableHeader()}
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => renderTableRow(product))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            No se encontraron productos
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredAndSortedProducts.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Productos por página"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count}`
                }
              />
            </>
          )}
        </ContentCard>
      </ContentSection>

      {/* Diálogos */}
      <Dialog 
        open={openProductForm} 
        onClose={() => {
          if (isSubmitting) return; // Prevenir cierre durante el envío
          setOpenProductForm(false);
          setSelectedProduct(null);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedProduct ? (
              <>
                <EditIcon color="primary" />
                <Typography variant="h6">Editar Producto</Typography>
              </>
            ) : (
              <>
                <AddIcon color="primary" />
                <Typography variant="h6">Nuevo Producto</Typography>
              </>
            )}
          </Box>
          <IconButton
            onClick={() => {
              if (isSubmitting) return;
              setOpenProductForm(false);
              setSelectedProduct(null);
            }}
            disabled={isSubmitting}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ 
          flex: 1,
          overflow: 'auto',
          p: 0 // El padding lo maneja el ProductForm
        }}>
          <ProductForm 
            product={selectedProduct} 
            onSave={handleSaveProduct} 
            onCancel={() => {
              if (isSubmitting) return;
              setOpenProductForm(false);
              setSelectedProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={openStockManager} 
        onClose={() => setOpenStockManager(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Gestionar Stock: {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <StockManager 
            product={selectedProduct} 
            onSave={handleSaveStock} 
            onCancel={() => setOpenStockManager(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={openProductLabel} 
        onClose={() => setOpenProductLabel(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Imprimir Etiqueta: {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <ProductLabel 
            product={selectedProduct} 
            onClose={() => setOpenProductLabel(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ResponsiveLayout>
  );
};

export default Inventory;
