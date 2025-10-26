import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Fade,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Avatar,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText as MuiListItemText,
  Stepper,
  Step,
  StepLabel,
  Skeleton,
  Stack,
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
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  LocalOffer as PriceIcon,
  Category as CategoryIcon,
  QrCode as BarcodeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  NewReleases as NewReleasesIcon,
  CloudUpload as CloudUploadIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Event as EventIcon,
  Update as UpdateIcon,
  Image as ImageIcon,
  QrCode as QrCodeIcon,
  QrCode2 as QrCode2Icon,
  ImageNotSupported as ImageNotSupportedIcon,
  FileCopy as FileCopyIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  CameraAlt as CameraAltIcon,
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, limit, startAfter, Timestamp, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContextMongo';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import BarcodeScanner from './BarcodeScanner';
import { alpha } from '@mui/material/styles';
import { enqueueSnackbar } from 'notistack';
import { LoadingButton } from '@mui/lab';
import printService from '../../services/printService';
import { formatCurrency } from '../../utils/format';
import { generateBarcode } from '../../utils/barcodeGenerator';
import EnhancedTable from '../common/EnhancedTable';
import ProductsList from './ProductsList';
import axios from 'axios';
import LabelPreview from './LabelPreview';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

// Componente de tarjeta de estadísticas
const StatCard = ({ title, data, icon: Icon, color = 'primary', subtitle, onClick }) => {
  const theme = useTheme();
  
  return (
    <Fade in={true} timeout={800}>
      <Card 
        onClick={onClick}
        sx={{ 
          height: '100%', 
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          },
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette[color].dark} 0%, ${theme.palette[color].main} 100%)`,
          color: 'white',
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        {Icon && (
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              opacity: 0.1,
              transform: 'rotate(-15deg)'
            }}
          >
            {typeof Icon === 'function' ? <Icon sx={{ fontSize: 140 }} /> : Icon}
          </Box>
        )}
        
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography 
              variant="subtitle2"
              sx={{ 
                mb: 2,
                opacity: 0.8,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 1,
                fontWeight: 700,
                letterSpacing: -0.5
              }}
            >
              {data}
            </Typography>
            {subtitle && (
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );
};

// Componente de formulario de producto
const ProductForm = ({ open, onClose, product, onSave, categories = [], onAddCategory }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: '',
    currentStock: '',
    minStock: '',
    maxStock: '', // Nuevo campo
    category: '',
    description: '',
    imageUrl: '',
    unitKey: '', // Clave Unidad
    unitType: '', // Tipo de unidad (PIEZA, KG, etc)
    provider: '', // Proveedor
    loyaltyPoints: 0, // Puntos de lealtad
    taxes: {
      ieps: 0, // IEPS
      iva: 0, // IVA
      includesTaxes: true // Si los precios incluyen impuestos
    },
    profitMargin: 40, // Porcentaje de ganancia por defecto
    purchasePrice: 0, // Precio de compra
    department: '', // Departamento
    ...product
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const steps = ['Información básica', 'Inventario', 'Imagen y detalles', 'Vista previa'];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        code: product.code || '',
        price: product.price || '',
        currentStock: product.currentStock || '',
        minStock: product.minStock || '',
        maxStock: product.maxStock || '',
        category: product.category || '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        unitKey: product.unitKey || '',
        unitType: product.unitType || '',
        provider: product.provider || '',
        loyaltyPoints: product.loyaltyPoints || 0,
        taxes: {
          ieps: product.taxes?.ieps || 0,
          iva: product.taxes?.iva || 0,
          includesTaxes: product.taxes?.includesTaxes || true
        },
        profitMargin: product.profitMargin || 40,
        purchasePrice: product.purchasePrice || 0,
        department: product.department || '',
        ...product
      });
    } else {
      setFormData({
        name: '',
        code: '',
        price: '',
        currentStock: '',
        minStock: '',
        maxStock: '',
        category: '',
        description: '',
        imageUrl: '',
        unitKey: '',
        unitType: '',
        provider: '',
        loyaltyPoints: 0,
        taxes: {
          ieps: 0,
          iva: 0,
          includesTaxes: true
        },
        profitMargin: 40,
        purchasePrice: 0,
        department: '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        imageUrl: data.secure_url
      }));
    } catch (err) {
      setError('Error al cargar la imagen: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleNewCategory = async () => {
    if (!user?.uid) {
      setError('Debes estar autenticado para crear una categoría');
      return;
    }

    if (!newCategory.trim()) {
      setError('El nombre de la categoría no puede estar vacío');
      return;
    }

    try {
      const categoryData = {
        name: newCategory.trim(),
        userId: user.uid,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'categories'), categoryData);
      const newCategoryObj = {
        id: docRef.id,
        ...categoryData
      };

      // Actualizar el estado local de categorías en el componente padre
      onAddCategory(newCategoryObj);

      // Actualizar el formData con la nueva categoría
      setFormData(prev => ({
        ...prev,
        category: newCategory.trim()
      }));

      setNewCategory('');
      setNewCategoryDialog(false);
      
      setSnackbar({
        open: true,
        message: 'Categoría creada correctamente',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error al crear categoría:', err);
      setError('Error al crear la categoría: ' + err.message);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del producto"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InventoryIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BarcodeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Clave Unidad"
                name="unitKey"
                value={formData.unitKey}
                onChange={handleChange}
                variant="outlined"
                placeholder="Ej: H87"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tipo de Unidad"
                name="unitType"
                value={formData.unitType}
                onChange={handleChange}
                variant="outlined"
                placeholder="Ej: PIEZA"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Departamento"
                name="department"
                value={formData.department}
                onChange={handleChange}
                variant="outlined"
                select
              >
                <MenuItem value="DPTO. GENERAL">DPTO. GENERAL</MenuItem>
                {/* Agregar más departamentos según necesites */}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Categoría"
                >
                  <MenuItem value="">
                    <em>Seleccionar categoría</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                  <Divider />
                  <MenuItem 
                    onClick={(e) => {
                      e.preventDefault();
                      setNewCategoryDialog(true);
                    }}
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <ListItemIcon>
                      <AddIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Crear nueva categoría" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock actual"
                name="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock mínimo"
                name="minStock"
                type="number"
                value={formData.minStock}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stock máximo"
                name="maxStock"
                type="number"
                value={formData.maxStock}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Proveedor"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Puntos de lealtad"
                name="loyaltyPoints"
                type="number"
                value={formData.loyaltyPoints}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio de compra"
                name="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="% de Ganancia"
                name="profitMargin"
                type="number"
                value={formData.profitMargin}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio de venta"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IEPS %"
                name="taxes.ieps"
                type="number"
                value={formData.taxes.ieps}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="IVA %"
                name="taxes.iva"
                type="number"
                value={formData.taxes.iva}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.taxes.includesTaxes}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      taxes: { ...prev.taxes, includesTaxes: e.target.checked }
                    }))}
                    name="taxes.includesTaxes"
                  />
                }
                label="Precios con impuestos incluidos"
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: theme.palette.primary.main,
                  },
                }}
                onClick={() => document.getElementById('product-image').click()}
              >
                <input
                  type="file"
                  id="product-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                {isUploading ? (
                  <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
                    <CircularProgress size={40} />
                    <Typography sx={{ mt: 2 }}>Subiendo imagen...</Typography>
                  </Box>
                ) : formData.imageUrl ? (
                  <Box>
                    <img
                      src={formData.imageUrl}
                      alt="Vista previa"
                      style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
                        }}
                        startIcon={<DeleteIcon />}
                      >
                        Eliminar imagen
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 3 }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Arrastra una imagen aquí
                    </Typography>
                    <Typography color="textSecondary">
                      o haz clic para seleccionar
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                variant="outlined"
                placeholder="Describe las características del producto..."
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 1, 
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: theme.palette.background.default
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ width: '100%' }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{ 
                pt: 3, 
                pb: 2,
                px: 2,
                bgcolor: theme.palette.background.default
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert 
                severity="error" 
                sx={{ mx: 3, mb: 2 }}
                onClose={() => setError(null)}
              >
                {error}
              </Alert>
            )}

            <Box sx={{ p: 3 }}>
              <form onSubmit={handleSubmit}>
                {getStepContent(activeStep)}
              </form>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions 
          sx={{ 
            p: 2, 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: theme.palette.background.default
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            startIcon={<CloseIcon />}
          >
            Cancelar
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep > 0 && (
            <Button
              onClick={handleBack}
              sx={{ mr: 1 }}
              startIcon={<ArrowBackIcon />}
            >
              Atrás
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Siguiente
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Diálogo para nueva categoría */}
      <Dialog
        open={newCategoryDialog}
        onClose={() => setNewCategoryDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6">Nueva Categoría</Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la categoría"
            fullWidth
            variant="outlined"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Button onClick={() => setNewCategoryDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleNewCategory}
            disabled={!newCategory.trim()}
          >
            Crear Categoría
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Componente de confirmación de eliminación
const DeleteConfirmation = ({ open, onClose, onConfirm, productName }) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    PaperProps={{
      sx: {
        borderRadius: 2,
        maxWidth: 400,
      }
    }}
  >
    <DialogTitle sx={{ pb: 1 }}>
      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
        Confirmar eliminación
      </Typography>
    </DialogTitle>
    
    <DialogContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ErrorIcon color="error" sx={{ mr: 1, fontSize: 28 }} />
        <Typography variant="subtitle1">
          ¿Estás seguro de que deseas eliminar este producto?
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary">
        El producto <strong>{productName}</strong> será eliminado permanentemente.
        Esta acción no se puede deshacer.
      </Typography>
    </DialogContent>
    
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose} color="inherit">
        Cancelar
      </Button>
      <Button 
        onClick={onConfirm} 
        variant="contained" 
        color="error"
        startIcon={<DeleteIcon />}
      >
        Eliminar
      </Button>
    </DialogActions>
  </Dialog>
);

// Componente de gráfico de análisis
const AnalyticsChart = ({ data, type = 'line', title }) => {
  const theme = useTheme();
  
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title,
        data: data.values,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ height: 300, p: 2 }}>
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </Box>
  );
};

// Componente para exportar análisis
const ExportAnalysis = ({ data, onClose }) => {
  const theme = useTheme();
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setGenerating(true);
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4
      
      // Agregar título
      page.drawText('Análisis de Productos', {
        x: 50,
        y: 800,
        size: 20,
        color: rgb(0, 0, 0),
      });

      // Agregar fecha
      page.drawText(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, {
        x: 50,
        y: 770,
        size: 12,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Agregar estadísticas
      let yPosition = 720;
      Object.entries(data.stats).forEach(([key, value]) => {
        page.drawText(`${key}: ${value}`, {
          x: 50,
          y: yPosition,
          size: 12,
          color: rgb(0, 0, 0),
        });
        yPosition -= 30;
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `analisis-productos-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      setGenerating(false);
      onClose();
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Exportar Análisis</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Se generará un PDF con el análisis detallado de productos incluyendo:
        </Typography>
        <Box component="ul" sx={{ mt: 2 }}>
          <Typography component="li">Estadísticas generales</Typography>
          <Typography component="li">Gráficos de tendencias</Typography>
          <Typography component="li">Productos más vendidos</Typography>
          <Typography component="li">Alertas de stock</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={generatePDF}
          variant="contained"
          disabled={generating}
          startIcon={generating ? <CircularProgress size={20} /> : <DownloadIcon />}
        >
          {generating ? 'Generando...' : 'Generar PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Modificar la definición del componente ProductDetails
const ProductDetails = ({ product, open, onClose, onEdit }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Si no hay producto, no renderizar nada
  if (!product) {
    return null;
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      let date;
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return 'N/A';
      }
      return format(date, 'dd/MM/yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const getStockColor = (stock) => {
    if (!stock && stock !== 0) return theme.palette.text.secondary;
    if (stock <= 0) return theme.palette.error.main;
    if (stock <= 10) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const StyledSection = ({ icon: Icon, title, children }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" color="primary">
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );

  const InfoItem = ({ label, value, color }) => (
    <Box sx={{ mb: 1 }}>
      <Typography variant="subtitle2" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body1" color={color || 'textPrimary'}>
        {value || 'N/A'}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              mr: 2,
              bgcolor: 'primary.main',
              width: 40,
              height: 40
            }}
          >
            <InfoIcon />
          </Avatar>
          <Typography variant="h6">
            Detalles del Producto
          </Typography>
        </Box>
        <Box>
          <IconButton
            onClick={onEdit}
            sx={{
              mr: 1,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={onClose}
            sx={{
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.1),
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledSection icon={ImageIcon} title="Imágenes">
              <Box
                sx={{ 
                  width: '100%',
                  aspectRatio: '1/1',
                  borderRadius: 1,
                  overflow: 'hidden',
                  bgcolor: 'background.default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                {product?.imageUrl ? (
                  <Box 
                    component="img"
                    src={product.imageUrl}
                    alt={product.name || 'Producto'}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = ''; // URL de imagen por defecto si lo tienes
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : (
                  <ImageNotSupportedIcon
                    sx={{
                      fontSize: 64,
                      color: 'text.disabled',
                    }}
                  />
                )}
              </Box>
            </StyledSection>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledSection icon={InfoIcon} title="Información Básica">
              <InfoItem label="Nombre" value={product.name} />
              <InfoItem label="Código" value={product.code} />
              <InfoItem 
                label="Precio" 
                value={formatCurrency(product.price)} 
              />
              <InfoItem label="Categoría" value={product.category || 'Sin categoría'} />
            </StyledSection>

            <StyledSection icon={InventoryIcon} title="Inventario">
              <Box sx={{ mb: 2 }}>
                <InfoItem 
                  label="Stock Actual" 
                  value={product.stock}
                  color={getStockColor(product.stock)}
                />
                {typeof product.stock === 'number' && product.stock <= 10 && (
                  <Alert severity={product.stock <= 0 ? "error" : "warning"} sx={{ mt: 1 }}>
                    {product.stock <= 0 
                      ? "Producto sin stock"
                      : "Stock bajo"}
                  </Alert>
                )}
              </Box>
            </StyledSection>

            <StyledSection icon={DescriptionIcon} title="Descripción">
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {product.description || 'Sin descripción'}
              </Typography>
            </StyledSection>

            <StyledSection icon={HistoryIcon} title="Información Adicional">
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <InfoItem 
                      label="Creado" 
                      value={formatDate(product.createdAt)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <UpdateIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <InfoItem 
                      label="Actualizado" 
                      value={formatDate(product.updatedAt)}
                    />
                  </Box>
                </Grid>
              </Grid>
            </StyledSection>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          variant="contained" 
          color="primary"
          startIcon={<CloseIcon />}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    categories: 0
  });
  const [showExport, setShowExport] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    daily: {
      labels: [],
      values: [],
    },
    stats: {
      'Total de productos': 0,
      'Valor del inventario': '$0',
      'Productos con bajo stock': 0,
      'Productos más vendidos': [],
    },
  });
  const [showDetails, setShowDetails] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchByCode, setSearchByCode] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  
  const { darkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Función para determinar el estado del producto
  const getProductStatus = (product) => {
    return product.stock > 0 ? 'active' : 'inactive';
  };

  // Función para notificar al bot
  const notifyBot = async (type, product) => {
    try {
      await axios.post('http://localhost:3000/api/notifications', {
        type,
        product: {
          id: product.id,
          name: product.name,
          stock: product.stock,
          price: product.price,
          code: product.code
        }
      });
    } catch (error) {
      console.error('Error al notificar al bot:', error);
    }
  };

  // Función para obtener productos desde la API de MongoDB
  const fetchProducts = async () => {
    console.log('🔄 fetchProducts called, user:', user);
    const userId = user?.id || user?._id;
    if (!userId) {
      console.log('⚠️ No user id, returning');
      return;
    }

    try {
      setLoading(true);
      
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      console.log('🔑 Token from localStorage:', token ? 'exists' : 'not found');
      if (!token) {
        console.error('❌ No hay token de autenticación');
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      // Llamar a la API de MongoDB usando la instancia configurada
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';
      console.log('📡 Llamando a la API de productos...', API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Respuesta de la API:', response.data);
      console.log('📊 Status de respuesta:', response.status);
      console.log('📦 Datos recibidos:', response.data.data);

      if (response.data.success && response.data.data) {
        // Mapear los datos de MongoDB al formato esperado por el frontend
        const productsData = response.data.data.map(product => ({
          id: product._id,
          name: product.nombre,
          description: product.descripcion || '',
          price: product.precio,
          stock: product.stock_actual || 0,
          minStock: product.stock_minimo || 0,
          category: product.categoria || '',
          code: product.codigo || '',
          barcode: product.barcode || '',
          imageUrl: product.imagen || '',
          status: 'active',
          ...product
        }));

        console.log('🛍️ Productos procesados:', productsData);
        console.log('🔢 Total de productos:', productsData.length);

        // Verificar que los productos tienen los campos necesarios
        productsData.forEach((product, index) => {
          console.log(`Producto ${index + 1}:`, {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock
          });
        });

        setProducts(productsData);
        
        // Calcular estadísticas
        const totalValue = productsData.reduce((sum, product) => 
          sum + (product.price * (product.stock || 0)), 0);
        const lowStock = productsData.filter(product => 
          (product.stock || 0) <= (product.minStock || 5)).length;
        
        setStats({
          totalProducts: productsData.length,
          totalValue,
          lowStock,
          categories: productsData.filter(p => p.category).length
        });

        console.log('✅ Productos establecidos en el estado correctamente');
      } else {
        console.error('❌ Formato de respuesta inesperado:', response.data);
        setError('Error al cargar los productos');
      }

    } catch (err) {
      console.error('❌ Error al cargar productos:', err);
      console.error('❌ Detalles del error:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente');
      } else {
        setError('Error al cargar los productos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect - user changed:', user);
    const userId = user?.id || user?._id;
    if (userId) {
      console.log('Usuario autenticado, cargando productos...');
      fetchProducts();
      fetchCategories();
    } else {
      console.log('No hay usuario, esperando autenticación...');
    }
  }, [user]);

  // Debug: Log cuando cambia el estado de productos
  useEffect(() => {
    console.log('Estado de productos actualizado:', {
      total: products.length,
      loading,
      products: products
    });
  }, [products, loading]);

  const fetchCategories = async () => {
    const userId = user?.id || user?._id;
    if (!userId) return;
    
    try {
      const q = query(collection(db, 'categories'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteDoc(doc(db, 'products', selectedProduct.id));
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setSnackbar({
        open: true,
        message: 'Producto eliminado correctamente',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error al eliminar el producto',
        severity: 'error'
      });
    } finally {
      setDeleteOpen(false);
      setSelectedProduct(null);
    }
  };

  // Modificar la función handleSaveProduct para notificar nuevos productos
  const handleSaveProduct = async (formData) => {
    const userId = user?.id || user?._id;
    if (!userId) {
      setError('Debes estar autenticado para guardar productos');
      return;
    }

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.currentStock) || 0, // Cambiado de formData.stock a formData.currentStock
        category: formData.category,
        code: formData.code,
        imageUrl: formData.imageUrl,
        minStock: parseInt(formData.minStock) || 0,
        maxStock: parseInt(formData.maxStock) || 0,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: parseInt(formData.currentStock) > 0 ? 'active' : 'inactive', // Cambiado para usar currentStock
        unitKey: formData.unitKey,
        unitType: formData.unitType,
        provider: formData.provider,
        loyaltyPoints: parseInt(formData.loyaltyPoints) || 0,
        taxes: {
          ieps: parseFloat(formData.taxes.ieps) || 0,
          iva: parseFloat(formData.taxes.iva) || 0,
          includesTaxes: formData.taxes.includesTaxes
        },
        profitMargin: parseInt(formData.profitMargin) || 0,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        department: formData.department,
      };

      if (selectedProduct) {
        // Actualizar producto existente
        const productRef = doc(db, 'products', selectedProduct.id);
        await updateDoc(productRef, productData);
        
        // Actualizar el estado local
        setProducts(prevProducts => 
          prevProducts.map(p => p.id === selectedProduct.id ? { ...p, ...productData } : p)
        );
        
        setSnackbar({
          open: true,
          message: 'Producto actualizado correctamente',
          severity: 'success'
        });
      } else {
        // Crear nuevo producto
        const productsRef = collection(db, 'products');
        const docRef = await addDoc(productsRef, productData);
        
        // Actualizar el estado local
        const newProduct = {
          id: docRef.id,
          ...productData
        };
        setProducts(prevProducts => [...prevProducts, newProduct]);
        
        setSnackbar({
          open: true,
          message: 'Producto creado correctamente',
          severity: 'success'
        });
      }

      // Recargar la lista de productos para asegurar sincronización
      await fetchProducts();
      
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Error al guardar el producto',
        severity: 'error'
      });
      throw err;
    }
  };

  const handleMenuOpen = (event, product) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(term) || 
        p.code?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    return result;
  }, [products, searchTerm, categoryFilter]);

  // Paginación
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredProducts.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredProducts, page, rowsPerPage]);

  const pageCount = Math.ceil(filteredProducts.length / rowsPerPage);

  // Función para obtener datos de análisis
  const fetchAnalyticsData = async () => {
    try {
      // Simulación de datos - reemplazar con datos reales de Firestore
      const today = new Date();
      const labels = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (6 - i));
        return format(date, 'dd/MM', { locale: es });
      });

      setAnalyticsData({
        daily: {
          labels,
          values: [65, 59, 80, 81, 56, 55, 40],
        },
        stats: {
          'Total de productos': products.length,
          'Valor del inventario': `$${products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}`,
          'Productos con bajo stock': products.filter(p => p.stock < p.minStock).length,
          'Productos más vendidos': ['Producto 1', 'Producto 2', 'Producto 3'],
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [products]);

  // Calcular el valor total del inventario real
  const calculateTotalValue = () => {
    return products.reduce((sum, product) => sum + (product.price * product.stock), 0).toFixed(2);
  };

  // Estado para controlar la ventana emergente de productos recientes
  const [recentProductsOpen, setRecentProductsOpen] = useState(false);

  // Función para abrir la ventana emergente
  const handleRecentProductsOpen = () => {
    setRecentProductsOpen(true);
  };

  // Función para cerrar la ventana emergente
  const handleRecentProductsClose = () => {
    setRecentProductsOpen(false);
  };

  // Modificar en el componente Products, agregar antes del return final:
  const [showLabelPreview, setShowLabelPreview] = useState(false);

  const handleAddCategory = (newCategory) => {
    setCategories(prev => [...prev, newCategory]);
  };

  // Añadir la función para manejar el código detectado
  const handleCodeDetected = (code) => {
    setScannerOpen(false);
    setSearchTerm(code);
    setSearchByCode(true);
  };

  // Modificar useEffect para la búsqueda por código
  useEffect(() => {
    if (searchByCode && searchTerm) {
      const product = products.find(p => p.code === searchTerm);
      if (product) {
        setSelectedProduct(product);
        setShowDetails(true);
      } else {
        setSnackbar({
          open: true,
          message: 'Producto no encontrado',
          severity: 'warning'
        });
      }
      setSearchByCode(false);
    }
  }, [searchByCode, searchTerm, products]);

  const columns = [
    {
      id: 'name',
      label: 'Nombre',
      sortable: true,
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {row.imageUrl ? (
            <Avatar
              src={row.imageUrl}
              variant="rounded"
              sx={{ 
                width: 40, 
                height: 40,
                borderRadius: 1
              }}
            />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <InventoryIcon color="primary" />
            </Box>
          )}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
            {row.category && (
              <Typography variant="caption" color="text.secondary">
                {row.category}
              </Typography>
            )}
          </Box>
        </Box>
      )
    },
    {
      id: 'code',
      label: 'Código',
      sortable: true,
      render: (value) => (
        <Chip
          label={value}
          size="small"
          variant="outlined"
          sx={{ 
            borderRadius: 1,
            '& .MuiChip-label': {
              px: 1
            }
          }}
        />
      )
    },
    {
      id: 'price',
      label: 'Precio',
      align: 'right',
      sortable: true,
      render: (value) => (
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 600,
            color: 'success.main'
          }}
        >
          {formatCurrency(value)}
        </Typography>
      )
    },
    {
      id: 'stock',
      label: 'Stock',
      align: 'right',
      sortable: true,
      render: (value, row) => {
        const stockValue = parseInt(row.stock) || 0;
        const isLow = stockValue <= (parseInt(row.minStock) || 0);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Chip
              label={stockValue}
              size="small"
              color={isLow ? 'error' : 'default'}
              sx={{ 
                minWidth: 60,
                borderRadius: 1
              }}
            />
          </Box>
        );
      }
    },
    {
      id: 'status',
      label: 'Estado',
      render: (value) => (
        <Chip
          label={value ? 'Activo' : 'Inactivo'}
          color={value ? 'success' : 'error'}
          size="small"
          sx={{ 
            minWidth: 80,
            borderRadius: 1
          }}
        />
      )
    }
  ];

  // Manejador para abrir/cerrar la lista
  const handleOpenList = () => setIsListOpen(true);
  const handleCloseList = () => setIsListOpen(false);

  // Función para exportar productos
  const handleExportProducts = async () => {
    try {
      // Definir la estructura de las columnas
      const headers = [
        'code',
        'name',
        'description',
        'category',
        'price',
        'currentStock',
        'minStock',
        'maxStock',
        'unitKey',
        'unitType',
        'provider',
        'loyaltyPoints',
        'taxes.ieps',
        'taxes.iva',
        'taxes.includesTaxes',
        'profitMargin',
        'purchasePrice',
        'department',
        'imageUrl'
      ];

      let csvContent;

      if (products.length === 0) {
        // Si no hay productos, incluir ejemplo
        const templateProduct = {
          code: 'ABC123',
          name: 'Ejemplo Producto',
          description: 'Descripción del producto',
          category: 'Categoría',
          price: 1000,
          currentStock: 10,
          minStock: 5,
          maxStock: 15,
          unitKey: 'H87',
          unitType: 'PIEZA',
          provider: 'Proveedor',
          loyaltyPoints: 100,
          taxes: {
            ieps: 16,
            iva: 16,
            includesTaxes: true
          },
          profitMargin: 40,
          purchasePrice: 800,
          department: 'DPTO. GENERAL',
          imageUrl: 'https://ejemplo.com/imagen.jpg'
        };

        csvContent = [
          headers.join(','),
          '### EJEMPLO - NO MODIFICAR ESTA LÍNEA ###',
          headers.map(header => templateProduct[header]).join(',')
        ].join('\n');
      } else {
        // Si hay productos, solo exportar los productos existentes
        const exportData = products.map(product => ({
          code: product.code || '',
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          price: product.price || 0,
          currentStock: product.stock || 0,
          minStock: product.minStock || 0,
          maxStock: product.maxStock || 0,
          unitKey: product.unitKey || '',
          unitType: product.unitType || '',
          provider: product.provider || '',
          loyaltyPoints: product.loyaltyPoints || 0,
          taxes: {
            ieps: product.taxes?.ieps || 0,
            iva: product.taxes?.iva || 0,
            includesTaxes: product.taxes?.includesTaxes || true
          },
          profitMargin: product.profitMargin || 0,
          purchasePrice: product.purchasePrice || 0,
          department: product.department || '',
          imageUrl: product.imageUrl || ''
        }));

        csvContent = [
          headers.join(','),
          ...exportData.map(row => 
            headers.map(header => {
              const value = row[header];
              // Manejar valores que puedan contener comas
              return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value;
            }).join(',')
          )
        ].join('\n');
      }

      // Crear y descargar el archivo
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `productos_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.csv`;
      link.click();
      
      setSnackbar({
        open: true,
        message: 'Productos exportados correctamente',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error al exportar productos:', err);
      setSnackbar({
        open: true,
        message: 'Error al exportar los productos',
        severity: 'error'
      });
    }
  };

  // Función para activar/desactivar productos en masa
  const handleBulkStatusUpdate = async (productsToUpdate, newStatus) => {
    try {
      setLoading(true);
      let updatedCount = 0;
      const batch = writeBatch(db);

      // Usar batch para actualizar múltiples documentos
      productsToUpdate.forEach(product => {
        const productRef = doc(db, 'products', product.id);
        batch.update(productRef, {
          status: newStatus,
          updatedAt: serverTimestamp()
        });
        updatedCount++;
      });

      // Commit del batch
      await batch.commit();

      // Actualizar el estado local
      setProducts(prevProducts => 
        prevProducts.map(product => 
          productsToUpdate.some(p => p.id === product.id)
            ? { ...product, status: newStatus }
            : product
        )
      );
      
      setSnackbar({
        open: true,
        message: `${updatedCount} productos ${newStatus === 'active' ? 'activados' : 'desactivados'} correctamente`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error al actualizar productos:', err);
      setSnackbar({
        open: true,
        message: 'Error al actualizar el estado de los productos',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Modificar la función de importación
  const handleImportProducts = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const rows = text.split('\n');
          const headers = rows[0].split(',');
          
          // Validar estructura del archivo
          const requiredFields = ['code', 'name', 'price', 'currentStock'];
          const missingFields = requiredFields.filter(field => !headers.includes(field));
          
          if (missingFields.length > 0) {
            throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
          }

          // Obtener productos existentes para verificar duplicados
          const existingProductsSnapshot = await getDocs(
            query(collection(db, 'products'), where('userId', '==', user.uid))
          );
          const existingProducts = new Map(
            existingProductsSnapshot.docs.map(doc => [doc.data().code, { id: doc.id, ...doc.data() }])
          );

          // Procesar productos (ignorar la primera fila de ejemplo)
          const productsToImport = rows.slice(2)
            .filter(row => row.trim()) // Ignorar líneas vacías
            .map(row => {
              const values = row.split(',');
              const product = {};
              
              headers.forEach((header, index) => {
                let value = values[index]?.trim();
                
                // Convertir valores según el tipo de campo
                switch (header) {
                  case 'price':
                    value = parseFloat(value) || 0;
                    break;
                  case 'currentStock':
                  case 'minStock':
                    value = parseInt(value) || 0;
                    break;
                  case 'imageUrl':
                    value = value || '';
                    break;
                  default:
                    value = value || '';
                }
                
                product[header] = value;
              });

              return {
                ...product,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: 'active',
                stock: parseInt(product.currentStock) || 0
              };
            });

          // Usar batch para importar/actualizar productos
          const batch = writeBatch(db);
          const savedProducts = [];
          const updatedProducts = [];

          for (const product of productsToImport) {
            if (!product.code || !product.name) continue;

            const existingProduct = existingProducts.get(product.code);
            
            if (existingProduct) {
              // Actualizar producto existente
              const productRef = doc(db, 'products', existingProduct.id);
              batch.update(productRef, {
                ...product,
                updatedAt: serverTimestamp(),
                stock: parseInt(product.currentStock) || 0
              });
              updatedProducts.push({ id: existingProduct.id, ...product });
            } else {
              // Crear nuevo producto
              const newProductRef = doc(collection(db, 'products'));
              batch.set(newProductRef, product);
              savedProducts.push({ id: newProductRef.id, ...product });
            }
          }

          // Commit del batch
          await batch.commit();

          // Actualizar el estado local
          setProducts(prevProducts => {
            const updatedProductMap = new Map(updatedProducts.map(p => [p.id, p]));
            return [
              ...prevProducts.map(p => updatedProductMap.has(p.id) ? updatedProductMap.get(p.id) : p),
              ...savedProducts
            ];
          });
          
          setSnackbar({
            open: true,
            message: `${savedProducts.length} productos nuevos importados y ${updatedProducts.length} actualizados correctamente`,
            severity: 'success'
          });

        } catch (err) {
          throw new Error(`Error al procesar el archivo: ${err.message}`);
        } finally {
          setLoading(false);
        }
      };

      reader.readAsText(file);
    } catch (err) {
      console.error('Error al importar productos:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Error al importar los productos',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      width: '100%',
      margin: 0,
      padding: 0,
      background: theme => theme.palette.background.default,
      minHeight: '100vh'
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, sm: 4 },
          borderRadius: 0,
          backgroundColor: theme => theme.palette.background.paper,
          mb: 0,
          minHeight: '100vh'
        }}
      >
        {/* Header */}
        <Box sx={{ 
          mb: 4,
          textAlign: 'center'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 1, 
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'primary.main'
            }}
          >
            Gestión de Productos
        </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Administra y monitorea tu inventario en tiempo real
          </Typography>
        </Box>

        {/* Botones de acción */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          maxWidth: '600px',
          mx: 'auto'
        }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              height: 48,
              borderRadius: 2
            }}
          >
            Nuevo Producto
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<RefreshIcon />}
            onClick={() => fetchProducts()}
            sx={{ 
              height: 48,
              borderRadius: 2
            }}
          >
            Actualizar
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<DownloadIcon />}
            onClick={handleExportProducts}
            sx={{ 
              height: 48,
              borderRadius: 2
            }}
          >
            Exportar
          </Button>
          <Button
            variant="outlined"
            fullWidth
            component="label"
            startIcon={<UploadIcon />}
            sx={{ 
              height: 48,
              borderRadius: 2
            }}
          >
            Importar
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleImportProducts}
            />
          </Button>
        </Box>

        {/* Filtros y botón para escanear */}
        <Box sx={{ 
          mb: 3,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ 
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            flex: 1
          }}>
            <TextField
              placeholder="Buscar por nombre o código"
              size="small"
              disabled={loading}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ 
                flexGrow: 1,
                maxWidth: 300,
                backgroundColor: theme => theme.palette.background.paper,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              size="small"
              disabled={loading}
              sx={{ 
                minWidth: 150,
                backgroundColor: theme => theme.palette.background.paper,
                borderRadius: 1.5
              }}
            >
              <MenuItem value="all">Todas las categorías</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {/* Botón de escanear */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<CameraAltIcon />}
                endIcon={<QrCodeIcon />}
                onClick={() => setScannerOpen(true)}
                sx={{
                  minWidth: 120,
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: 'secondary.main',
                  color: 'white',
                  boxShadow: 2,
                  mb: 0.5
                }}
              >
                Escanear
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0, fontSize: '0.75rem' }}>
                Cámara o lector
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleOpenList}
            startIcon={<FilterIcon />}
            sx={{
              height: 40,
              bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              '&:hover': {
                bgcolor: theme => alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            Ver Lista Completa
          </Button>
        </Box>

        {/* Botón Activar Todos debajo de los filtros y encima de la lista */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            color="success"
            onClick={() => handleBulkStatusUpdate(products.filter(p => p.status === 'inactive'), 'active')}
            disabled={!products.some(p => p.status === 'inactive')}
            sx={{
              height: 48,
              borderRadius: 2,
              bgcolor: theme => theme.palette.background.paper,
              color: theme => theme.palette.mode === 'dark' ? theme.palette.text.primary : 'inherit',
              '&.Mui-disabled': {
                bgcolor: theme => theme.palette.action.disabledBackground,
                color: theme => theme.palette.action.disabled,
              },
              fontWeight: 600,
              minWidth: 160
            }}
          >
            Activar Todos
          </Button>
        </Box>

        {/* Resumen de productos recientes */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Productos Recientes (Total: {products.length}, Loading: {loading ? 'Sí' : 'No'})
          </Typography>
          {console.log('Render - Total productos:', products.length, 'Loading:', loading)}
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              maxHeight: 400,
              overflow: 'auto'
            }}
          >
            <Table size="small">
          <TableHead>
            <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Stock</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                      <TableCell><Skeleton width={150} /></TableCell>
                      <TableCell align="right"><Skeleton width={80} /></TableCell>
                      <TableCell align="right"><Skeleton width={60} /></TableCell>
                      <TableCell><Skeleton width={90} /></TableCell>
                </TableRow>
              ))
                        ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">No hay productos disponibles</Typography>
                </TableCell>
              </TableRow>
            ) : (
                  products.slice(0, 5).map((product) => (
                     <TableRow key={product.id} hover>
                  <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {product.imageUrl ? (
                            <Avatar
                              src={product.imageUrl}
                              variant="rounded"
                              sx={{ width: 32, height: 32 }}
                            />
                          ) : (
                            <Avatar
                              variant="rounded"
                              sx={{ 
                                width: 32, 
                                height: 32,
                                bgcolor: theme => alpha(theme.palette.primary.main, 0.1)
                              }}
                            >
                              <InventoryIcon color="primary" sx={{ fontSize: 20 }} />
                            </Avatar>
                          )}
                          <Box>
                            <Typography variant="subtitle2">{product.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.code}
                            </Typography>
                          </Box>
                        </Box>
                  </TableCell>
                      <TableCell align="right">{formatCurrency(product.price)}</TableCell>
                      <TableCell align="right">
                    <Chip
                      label={product.stock}
                      size="small"
                          color={product.stock <= (product.minStock || 5) ? 'error' : 'default'}
                          sx={{ minWidth: 60 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                          label={product.status === 'active' ? 'Activo' : 'Inactivo'}
                      size="small"
                          color={product.status === 'active' ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
                  ))
                )}
          </TableBody>
        </Table>
      </TableContainer>
        </Box>
      </Paper>

      {/* Modal de lista completa */}
      <ProductsList
        open={isListOpen}
        onClose={handleCloseList}
        products={filteredProducts}
        loading={loading}
        onEdit={(product) => {
          setSelectedProduct(product);
          setFormOpen(true);
          handleCloseList();
        }}
        onDelete={(product) => {
          setSelectedProduct(product);
          setDeleteOpen(true);
          handleCloseList();
        }}
        onPrintLabel={(product) => {
          setSelectedProduct(product);
          // Asumiendo que tienes un estado para controlar el modal de etiquetas
          setLabelOpen(true);
          handleCloseList();
        }}
      />

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Renderizar el formulario de producto cuando formOpen sea true */}
      {formOpen && (
        <ProductForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          product={selectedProduct}
          onSave={handleSaveProduct}
          categories={categories}
          onAddCategory={handleAddCategory}
        />
      )}

      {/* Modal de impresión de etiquetas */}
      {labelOpen && selectedProduct && (
        <LabelPreview
          open={labelOpen}
          onClose={() => setLabelOpen(false)}
          product={selectedProduct}
        />
      )}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleCodeDetected}
      />
    </Box>
  );
}; 

export default Products; 