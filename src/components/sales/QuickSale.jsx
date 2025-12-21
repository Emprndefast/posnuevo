import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Paper,
  InputAdornment,
  Badge,
  CircularProgress,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocalOffer as DiscountIcon,
  Payment as PaymentIcon,
  Person as CustomerIcon,
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  FileCopy as FileCopyIcon,
  CameraAlt as CameraAltIcon,
  QrCode as QrCodeIcon,
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  increment,
  serverTimestamp,
  orderBy,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContextMongo';
import { useTheme } from '../../context/ThemeContext';
import { enqueueSnackbar } from 'notistack';
import { usePrinter } from '../../context/PrinterContext';
import { usePrint } from '../../context/PrintContext';
import saleService from '../../services/saleService';
import printService from '../../services/printService';
import { generatePreInvoice, generateFiscalInvoice } from '../../services/documentGenerators';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import QRCode from 'qrcode';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import JsBarcode from 'jsbarcode';
import promotionService from '../../services/promotionService';
import { useTelegram } from '../../context/TelegramContext';
import { telegramService } from '../../services/telegramService';
import BarcodeScanner from '../products/BarcodeScanner';
import api from '../../api/api';
import { useCart } from '../../context/CartContext';

const PreInvoiceDialog = ({ open, onClose, sale }) => {
  const { isConnected } = usePrinter();
  const { print, isPrinting } = usePrint();
  const { user } = useAuth();
  const theme = useMuiTheme();
  const [businessInfo, setBusinessInfo] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [copies, setCopies] = useState(1);
  const [error, setError] = useState(null);
  const [invoiceType, setInvoiceType] = useState('pre'); // 'pre' o 'fiscal'

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      if (!user?.uid) return;
      
      try {
        const businessRef = doc(db, 'business', user.uid);
        const businessDoc = await getDoc(businessRef);
        if (businessDoc.exists()) {
          setBusinessInfo(businessDoc.data());
        }
      } catch (err) {
        console.error('Error al cargar información del negocio:', err);
        setError('Error al cargar información del negocio');
      }
    };

    fetchBusinessInfo();
  }, [user]);

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: es });
      
      let date;
      if (timestamp?.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        date = new Date(timestamp);
      } else {
        return format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: es });
      }
      
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: es });
    } catch (err) {
      console.error('Error al formatear fecha:', err);
      return format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: es });
    }
  };

  const generateQRContent = (sale) => {
    if (!sale) return '';
    
    return JSON.stringify({
      id: sale.id || 'N/A',
      date: formatDate(sale.date),
      total: sale.total || 0,
      items: sale.items?.length || 0,
      business: businessInfo?.name || 'N/A',
      customer: sale.customer || 'N/A',
      seller: user?.displayName || 'N/A'
    });
  };

  const generateBarcode = (text) => {
    try {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, text, {
        format: "CODE128",
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 12,
        margin: 10
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Error generando código de barras:', err);
      return '';
    }
  };

  const generateReceiptContent = (type = 'pre') => {
    if (!sale) return '';

    const title = type === 'pre' ? 'PRE-FACTURA' : 'FACTURA FISCAL';
    const invoiceNumber = sale.id?.slice(-8).toUpperCase() || 'N/A';
    const barcodeData = generateBarcode(invoiceNumber);
    const currentDate = new Date();

    const fiscalInfo = type === 'fiscal' ? `
      <div style="margin: 10px 0; padding: 10px; background-color: #f8f8f8; border-radius: 4px;">
        <div style="font-size: 10pt; margin-bottom: 5px;">
          <strong>Régimen Fiscal:</strong> ${businessInfo?.taxRegime || 'N/A'}
        </div>
        <div style="font-size: 10pt; margin-bottom: 5px;">
          <strong>No. Autorización:</strong> ${businessInfo?.authNumber || 'N/A'}
        </div>
        <div style="font-size: 10pt;">
          <strong>Fecha de Autorización:</strong> ${businessInfo?.authDate ? formatDate(businessInfo.authDate) : 'N/A'}
        </div>
      </div>
    ` : '';

    return `
      <div style="font-family: 'Arial', sans-serif; width: 80mm; padding: 5mm;">
        <!-- Encabezado -->
        <div style="text-align: center; margin-bottom: 15px;">
          ${businessInfo?.logo ? `
            <img src="${businessInfo.logo}" alt="Logo" style="max-width: 150px; margin-bottom: 10px;">
          ` : ''}
          <h2 style="margin: 5px 0; font-size: 14pt;">${title}</h2>
          <h3 style="margin: 5px 0; font-size: 12pt;">${businessInfo?.name || 'N/A'}</h3>
          <p style="margin: 2px 0; font-size: 10pt;">${businessInfo?.address || 'N/A'}</p>
          <p style="margin: 2px 0; font-size: 10pt;">Tel: ${businessInfo?.phone || 'N/A'}</p>
          <p style="margin: 2px 0; font-size: 10pt;">RUC/NIT: ${businessInfo?.ruc || 'N/A'}</p>
        </div>

        <!-- Código de Barras -->
        <div style="text-align: center; margin: 15px 0;">
          <img src="${barcodeData}" alt="Barcode" style="max-width: 100%;">
          <p style="margin: 5px 0; font-size: 10pt;">No. ${invoiceNumber}</p>
        </div>

        <!-- Información de la venta -->
        <div style="margin: 15px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
          <p style="margin: 2px 0; font-size: 10pt;">
            <strong>Fecha:</strong> ${formatDate(sale.date)}
          </p>
          <p style="margin: 2px 0; font-size: 10pt;">
            <strong>Vendedor:</strong> ${user?.displayName || 'N/A'}
          </p>
          <p style="margin: 2px 0; font-size: 10pt;">
            <strong>Cliente:</strong> ${sale.customer?.name || 'Cliente General'}
          </p>
          ${sale.customer ? `
            ${sale.customer.ruc ? `
              <p style="margin: 2px 0; font-size: 10pt;">
                <strong>RUC/NIT:</strong> ${sale.customer.ruc}
              </p>
            ` : ''}
            ${sale.customer.address ? `
              <p style="margin: 2px 0; font-size: 10pt;">
                <strong>Dirección:</strong> ${sale.customer.address}
              </p>
            ` : ''}
            ${sale.customer.phone ? `
              <p style="margin: 2px 0; font-size: 10pt;">
                <strong>Teléfono:</strong> ${sale.customer.phone}
              </p>
            ` : ''}
            ${sale.customer.email ? `
              <p style="margin: 2px 0; font-size: 10pt;">
                <strong>Email:</strong> ${sale.customer.email}
              </p>
            ` : ''}
          ` : ''}
        </div>

        ${fiscalInfo}

        <!-- Detalle de productos -->
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background-color: #f8f8f8;">
              <th style="padding: 5px; font-size: 10pt; text-align: left;">Producto / Servicio</th>
              <th style="padding: 5px; font-size: 10pt; text-align: center;">Cant.</th>
              <th style="padding: 5px; font-size: 10pt; text-align: right;">Precio</th>
              <th style="padding: 5px; font-size: 10pt; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items?.map(item => {
              const isRepair = item.isRepair;
              const icon = isRepair ? '🔧' : '📦';
              return `
              <tr style="background-color: ${isRepair ? '#fff3e0' : 'transparent'};">
                <td style="padding: 5px; font-size: 9pt; border-left: ${isRepair ? '3px solid #ff9800' : 'none'};">
                  ${icon} ${item.name}
                  <br>
                  <span style="font-size: 8pt; color: #666;">Cod: ${item.code || 'N/A'}</span>
                </td>
                <td style="padding: 5px; font-size: 9pt; text-align: center;">${item.quantity}</td>
                <td style="padding: 5px; font-size: 9pt; text-align: right;">$${(item.price || 0).toFixed(2)}</td>
                <td style="padding: 5px; font-size: 9pt; text-align: right;">$${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>

        <!-- Totales -->
        <div style="margin: 15px 0; text-align: right;">
          <p style="margin: 2px 0; font-size: 10pt;">
            <strong>Subtotal:</strong> $${sale.subtotal?.toFixed(2) || '0.00'}
          </p>
          ${sale.discount > 0 ? `
            <p style="margin: 2px 0; font-size: 10pt; color: #e53935;">
              <strong>Descuento (${sale.discount}%):</strong> -$${((sale.subtotal * sale.discount) / 100).toFixed(2)}
            </p>
          ` : ''}
          ${type === 'fiscal' ? `
            <p style="margin: 2px 0; font-size: 10pt;">
              <strong>IVA (19%):</strong> $${(sale.total * 0.19).toFixed(2)}
            </p>
          ` : ''}
          <p style="margin: 5px 0; font-size: 12pt;">
            <strong>Total:</strong> $${sale.total?.toFixed(2) || '0.00'}
          </p>
        </div>

        <!-- Código QR -->
        <div style="text-align: center; margin: 15px 0;">
          <div id="qrcode" style="margin: 10px auto; width: 100px; height: 100px;"></div>
          <p style="margin: 5px 0; font-size: 8pt; color: #666;">
            Escanee para verificar la autenticidad
          </p>
        </div>

        <!-- Pie de página -->
        <div style="text-align: center; margin-top: 20px;">
          <p style="margin: 2px 0; font-size: 10pt;">¡Gracias por su compra!</p>
          ${businessInfo?.website ? `
            <p style="margin: 2px 0; font-size: 9pt;">${businessInfo.website}</p>
          ` : ''}
          ${type === 'fiscal' ? `
            <p style="margin: 10px 0; font-size: 8pt; font-style: italic;">
              Este documento es una representación impresa de un Comprobante Fiscal Digital
            </p>
          ` : `
            <p style="margin: 10px 0; font-size: 8pt; font-style: italic;">
              DOCUMENTO NO FISCAL.
              <br>
              NO VÁLIDO COMO FACTURA
            </p>
          `}
        </div>
      </div>
    `;
  };

  const handlePrint = async (type = 'pre') => {
    try {
      setPrinting(true);
      setError(null);

      if (!isConnected) {
        throw new Error('La impresora no está conectada. Por favor, verifique la conexión.');
      }

      if (!businessInfo) {
        throw new Error('No se ha podido cargar la información del negocio.');
      }

      // Generar el contenido del recibo
      const content = generateReceiptContent(type);
      
      // Generar el código QR
      const qrContent = generateQRContent(sale);
      const qrDataUrl = await QRCode.toDataURL(qrContent, {
        width: 100,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Reemplazar el placeholder del QR con la imagen generada
      const contentWithQR = content.replace(
        '<div id="qrcode" style="margin: 10px auto; width: 100px; height: 100px;"></div>',
        `<img src="${qrDataUrl}" style="width: 100px; height: 100px; margin: 10px auto;" />`
      );

      // Imprimir el número de copias especificado
      for (let i = 0; i < copies; i++) {
        await printService.print(contentWithQR);
        if (i < copies - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      enqueueSnackbar('Documento impreso correctamente', { variant: 'success' });
      onClose();
    } catch (err) {
      console.error('Error al imprimir:', err);
      setError(err.message || 'Error al imprimir el documento');
      enqueueSnackbar(
        'Error al imprimir. Verifique la conexión de la impresora.',
        { variant: 'error' }
      );
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: '#e0e0e0' }}>
        Vista Previa del Documento
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2, mb: 3 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo de Documento</InputLabel>
            <Select
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value)}
              label="Tipo de Documento"
            >
              <MenuItem value="pre">Pre-Factura</MenuItem>
              <MenuItem value="fiscal">Factura Fiscal</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 2 
        }}>
          {/* Vista previa del recibo */}
          <Paper 
            elevation={0} 
            sx={{ 
              width: '80mm',
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              bgcolor: 'background.paper',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: generateReceiptContent(invoiceType) }} />
          </Paper>

          {/* Control de copias */}
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel>Número de copias</InputLabel>
            <Select
              value={copies}
              onChange={(e) => setCopies(e.target.value)}
              label="Número de copias"
              startAdornment={
                <InputAdornment position="start">
                  <FileCopyIcon fontSize="small" />
                </InputAdornment>
              }
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <MenuItem key={num} value={num}>{num}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {error && (
            <Alert 
              severity="error" 
              sx={{ width: '100%' }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => setError(null)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: 1, borderColor: '#e0e0e0', p: 2 }}>
        <Button onClick={onClose}>
          Cancelar
        </Button>
        <LoadingButton
          variant="contained"
          startIcon={<PrintIcon />}
          loading={printing}
          onClick={() => handlePrint(invoiceType)}
          disabled={!isConnected}
        >
          Imprimir
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

// Componente para el diálogo de selección de cliente
const CustomerDialog = ({ open, onClose, customers, onSelect, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleSelect = () => {
    if (selectedCustomer) {
      onSelect(selectedCustomer);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Seleccionar Cliente</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
          <Autocomplete
            options={customers}
            getOptionLabel={(option) => `${option.name} - ${option.phone || 'Sin teléfono'}`}
            value={selectedCustomer}
            onChange={(event, newValue) => setSelectedCustomer(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar cliente"
                variant="outlined"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
          
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onCreateNew}
            fullWidth
          >
            Crear Nuevo Cliente
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button 
          variant="contained" 
          onClick={handleSelect}
          disabled={!selectedCustomer}
        >
          Seleccionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const QuickSale = () => {
  const { darkMode } = useTheme();
  const { user, loading: userLoading } = useAuth();
  const { cart, setCart, addProductToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preInvoiceDialog, setPreInvoiceDialog] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const { notifySale, notifyLowStock, notifyOutOfStock } = useTelegram();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [scannerOpen, setScannerOpen] = useState(false);

  // Log para depuración
  console.log('Usuario en QuickSale:', user);

  if (userLoading) {
    return <div>Cargando usuario...</div>;
  }

  if (!user) {
    return <div>No hay usuario autenticado</div>;
  }

  useEffect(() => {
    const userId = user?.uid || user?._id || user?.id;
    if (userId) {
      loadData();
      loadPromotions();
    } else {
      setLoading(false);
      setError('Usuario no autenticado');
    }
  }, [user]);

  useEffect(() => {
    // Agregar log para verificar la configuración de Telegram
    console.log('Configuración de Telegram:', notifySale);
  }, [notifySale]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchProducts(), fetchCustomers()]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos');
      enqueueSnackbar('Error al cargar los datos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadPromotions = async () => {
    try {
      const promos = await promotionService.getActivePromotions();
      setPromotions(promos);
    } catch (error) {
      setPromotions([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const userId = user?.uid || user?._id || user?.id;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      // Usar MongoDB API en lugar de Firebase
      const response = await api.get('/products');
      console.log('Response de productos:', response.data);
      
      if (!response.data.success) {
        throw new Error('Error al cargar productos');
      }

      // Log para ver el primer producto
      if (response.data.data && response.data.data.length > 0) {
        console.log('Primer producto raw completo:', JSON.stringify(response.data.data[0], null, 2));
      }

      // El backend devuelve productos con estructura: { _id, nombre, precio, stock, ... }
      const productsData = response.data.data
        .map(product => {
          // Calcular stock - el campo correcto es stock_actual
          const stockValue = parseInt(product.stock_actual || product.stock || 0);
          
          const mappedProduct = {
            ...product, // Mantener todos los campos originales primero
            id: product._id || product.id,
            name: product.nombre || product.name || 'Producto sin nombre',
            price: parseFloat(product.precio) || parseFloat(product.price) || 0,
            stock: stockValue,
            code: product.codigo || product.code || product.barcode || product.codigo_barras || '',
            description: product.descripcion || product.description || '',
            brand: product.brand || '',
            images: product.images || product.imagenes || [],
            imageUrl: product.imagen || product.imageUrl || '',
            category: product.categoria || product.category || {}
          };
          console.log('Producto raw stock_actual:', product.stock_actual, 'stock field:', product.stock, 'Mapped stock:', stockValue);
          console.log('Producto raw imagen:', product.imagen, 'imagenes:', product.imagenes, 'images:', product.images);
          console.log('Producto mapeado completo:', mappedProduct);
          return mappedProduct;
        })
        .filter(p => p.stock >= 0); // Productos con stock >= 0

      console.log('Productos procesados:', productsData);

      // Ordenar productos por nombre
      productsData.sort((a, b) => a.name.localeCompare(b.name));

      setProducts(productsData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      throw error;
    }
  };

  const fetchCustomers = async () => {
    try {
      const userId = user?.uid || user?._id || user?.id;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }

      // Usar MongoDB API en lugar de Firebase
      const response = await api.get('/customers');
      
      if (!response.data.success) {
        setCustomers([]);
        return;
      }

      const customersData = response.data.data.map(customer => ({
        id: customer._id || customer.id,
        ...customer,
        name: customer.nombre || customer.name || ''
      }));

      // Ordenar por nombre
      customersData.sort((a, b) => a.name.localeCompare(b.name));

      setCustomers(customersData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      throw error;
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      enqueueSnackbar('Producto sin stock disponible', { variant: 'warning' });
      return;
    }

    // Usar el método del contexto (que maneja duplicados)
    addProductToCart({
      id: product._id || product.id,
      name: product.nombre || product.name,
      price: product.precio || product.price,
      stock: product.stock_actual || product.stock,
      code: product.codigo || product.code
    });
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    // Verificar stock solo para items de producto (no reparaciones)
    const item = cart.find(i => i.id === itemId);
    if (item?.meta?.type === 'product') {
      const product = products.find(p => p._id === itemId || p.id === itemId);
      const maxStock = product?.stock_actual || product?.stock || 0;
      if (newQuantity > maxStock) {
        enqueueSnackbar('Stock insuficiente', { variant: 'warning' });
        return;
      }
    }

    updateQuantity(itemId, newQuantity);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = item.discount || 0;
      return total + (itemTotal - itemDiscount);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (subtotal * discount / 100);
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.price * item.quantity;
    const itemDiscount = item.discount || 0;
    return subtotal - itemDiscount;
  };

  const handleCompleteSale = async () => {
    // Si ya está procesando, no hacer nada
    if (processingPayment) return;

    try {
      setProcessingPayment(true);
      setError(null);

      // Validaciones adicionales
      if (cart.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // Verificar stock actual antes de procesar usando API de MongoDB
      const stockChecks = [];
      
      // Verificar el stock actual de cada producto
      for (const item of cart) {
        // Si el item es una reparación, no verificar stock
        if (item.meta?.type === 'repair' || item.meta?.repair === true) continue;

        // Buscar el producto en la lista de productos cargados
        const product = products.find(p => p.id === item.id);
        
        if (!product) {
          throw new Error(`El producto ${item.name} ya no existe`);
        }

        const currentStock = product.stock;
        if (currentStock < item.quantity) {
          throw new Error(`Stock insuficiente para ${item.name}. Stock actual: ${currentStock}`);
        }

        stockChecks.push({
          productId: product.id,
          currentStock,
          newStock: currentStock - item.quantity,
          productData: product
        });
      }
      
      // Las notificaciones de WhatsApp son opcionales, no bloquean la venta
      // Preparar datos de la venta para el backend MongoDB
      const saleData = {
        items: cart.map(item => {
          if (item.meta?.type === 'repair' || item.meta?.repair === true) {
            return {
              tipo: 'repair',
              repair: item.meta?.repairData || item.meta,
              cantidad: item.quantity,
              precio_unitario: item.price,
              subtotal: item.price * item.quantity,
              descuento: item.discount || 0
            };
          }

          return {
            tipo: 'product',
            producto_id: item.id,
            cantidad: item.quantity,
            precio_unitario: item.price,
            subtotal: item.price * item.quantity,
            descuento: item.discount || 0
          };
        }),
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        cliente_id: selectedCustomer?.id || null,
        metodo_pago: paymentMethod,
        estado: 'completada'
      };

      console.log('📦 Preparando venta para backend:', saleData);

      // Guardar la venta en el backend MongoDB
      const response = await api.post('/sales', saleData);
      const saleId = response.data.data?._id || response.data.data?.numero_venta || 'N/A';

      console.log('✅ Venta creada exitosamente:', response.data);

      // Actualizar el estado local de productos con el nuevo stock
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const update = stockChecks.find(u => u.productId === product.id);
          if (update) {
            return {
              ...product,
              stock: update.newStock
            };
          }
          return product;
        })
      );

      // Enviar notificaciones de stock bajo/agotado
      for (const check of stockChecks) {
        const productData = check.productData;

        if (check.newStock <= productData.minStock) {
          if (notifyLowStock) {
            try {
              await notifyLowStock({
                name: productData.name,
                currentStock: check.newStock,
                minStock: productData.minStock
              });
            } catch (error) {
              console.error('Error al enviar notificación de stock bajo:', error);
            }
          }
        }

        if (check.newStock <= 0) {
          if (notifyOutOfStock && typeof notifyOutOfStock === 'function') {
            try {
              await notifyOutOfStock({
                name: productData.name,
                code: productData.code || 'N/A'
              });
            } catch (error) {
              console.error('Error al enviar notificación de stock agotado:', error);
            }
          }
        }
      }

      // Enviar notificación de venta
      try {
        console.log('🔔 Intentando enviar notificación de venta...');
        await notifySale({
          ticketNumber: saleId,
          total: saleData.total,
          customer: selectedCustomer?.name || 'Cliente General',
          date: new Date().toISOString(),
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        });
        console.log('✅ Notificación de venta enviada');
      } catch (error) {
        console.error('❌ Error al enviar notificación:', error);
      }

      // Limpiar el carrito y mostrar mensaje de éxito
      setPaymentDialog(false);
      
      // Preparar datos del recibo con formato correcto
      const receiptSale = {
        items: cart.map(item => ({
          name: item.name,
          code: item.code || 'N/A',
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          discount: item.discount || 0,
          total: calculateItemTotal(item),
          isRepair: item.meta?.type === 'repair' || item.meta?.repair
        })),
        subtotal: calculateSubtotal(),
        discount: discount,
        total: calculateTotal(),
        date: new Date().toISOString(),
        customer: selectedCustomer?.name || 'Cliente General'
      };
      
      clearCart();
      setSelectedCustomer(null);
      setLastSale(receiptSale);
      setPreInvoiceDialog(true);
      
      enqueueSnackbar('Venta completada correctamente', {
        variant: 'success'
      });
    } catch (error) {
      console.error('Error al completar la venta:', error);
      setError(error.message);
      enqueueSnackbar(error.message || 'Error al completar la venta', {
        variant: 'error'
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCreateNewCustomer = () => {
    // Cerrar el diálogo de selección
    setCustomerDialogOpen(false);
    // Emitir evento o llamar callback para abrir el modal de creación de cliente
    if (typeof window.openCustomerModal === 'function') {
      setTimeout(() => window.openCustomerModal(), 300);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    enqueueSnackbar(`Cliente seleccionado: ${customer.name}`, { variant: 'success' });
  };

  // Manejar el código detectado por el escáner
  const handleCodeDetected = (code) => {
    setScannerOpen(false);
    // Buscar el producto por código y agregarlo al carrito automáticamente
    const found = products.find(p => p.code === code);
    if (found) {
      handleAddToCart(found);
    } else {
      enqueueSnackbar('Producto no encontrado', { variant: 'warning' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadData}>
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Título */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
          Nueva Venta
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Registra una nueva venta de manera rápida y sencilla
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* COLUMNA IZQUIERDA - Búsqueda y Grid de Productos */}
        <Grid item xs={12} md={4}>
          {/* Búsqueda y escaneo */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Autocomplete
                  options={products}
                  getOptionLabel={(option) => option.name}
                  value={selectedProduct}
                  onChange={(event, newValue) => {
                    setSelectedProduct(newValue);
                    if (newValue) {
                      handleAddToCart(newValue);
                      setSelectedProduct(null);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      placeholder="Buscar producto..."
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  startIcon={<CameraAltIcon />}
                  endIcon={<QrCodeIcon />}
                  onClick={() => setScannerOpen(true)}
                  sx={{
                    borderRadius: 1,
                    fontWeight: 600,
                  }}
                >
                  Escanear
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Grid de productos */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Productos Disponibles
              </Typography>
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid item xs={6} sm={6} md={12} lg={6} key={product.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        height: '100%',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3,
                          backgroundColor: darkMode ? '#333' : '#f5f5f5',
                        },
                      }}
                      onClick={() => handleAddToCart(product)}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        {/* Imagen del producto */}
                        {product.imageUrl ? (
                          <Box
                            sx={{
                              width: '100%',
                              height: 80,
                              mb: 1,
                              borderRadius: 1,
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: darkMode ? '#333' : '#f5f5f5',
                            }}
                          >
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <Box
                              sx={{
                                display: 'none',
                                width: '100%',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: darkMode ? '#fff' : '#666',
                                fontSize: '1.5rem',
                              }}
                            >
                              📦
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: 80,
                              mb: 1,
                              borderRadius: 1,
                              bgcolor: darkMode ? '#333' : '#f5f5f5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: darkMode ? '#fff' : '#666',
                              fontSize: '1.5rem',
                            }}
                          >
                            📦
                          </Box>
                        )}
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color={darkMode ? 'textSecondary' : 'primary'} sx={{ fontWeight: 700, my: 0.5 }}>
                          RD${product.price.toLocaleString()}
                        </Typography>
                        <Chip
                          size="small"
                          label={`Stock: ${product.stock}`}
                          color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                          variant="outlined"
                          sx={{ height: 24 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* COLUMNA CENTRAL - Detalles del Pedido */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Detalles del Pedido
              </Typography>

              {/* Selección de Cliente */}
              <Box sx={{ mb: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CustomerIcon />}
                  onClick={() => setCustomerDialogOpen(true)}
                  sx={{ mb: 1 }}
                >
                  {selectedCustomer ? selectedCustomer.name : 'Seleccionar Cliente'}
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Notas del Pedido */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Notas del Pedido
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Agregar notas al pedido..."
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Promociones */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  <DiscountIcon sx={{ fontSize: '1.2rem', mr: 1, verticalAlign: 'middle' }} />
                  Promoción
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedPromotion ? selectedPromotion.id : ''}
                    onChange={e => {
                      const promo = promotions.find(p => p.id === e.target.value);
                      setSelectedPromotion(promo || null);
                      if (promo) {
                        if (promo.type === 'percentage') {
                          setDiscount(Number(promo.value));
                        } else if (promo.type === 'fixed') {
                          const subtotal = calculateSubtotal();
                          setDiscount(subtotal > 0 ? (100 * Number(promo.value) / subtotal) : 0);
                        } else {
                          setDiscount(0);
                        }
                      } else {
                        setDiscount(0);
                      }
                    }}
                  >
                    <MenuItem value="">Sin promoción</MenuItem>
                    {promotions.map(promo => (
                      <MenuItem key={promo.id} value={promo.id}>
                        {promo.name} ({promo.type === 'percentage' ? `${promo.value}%` : `RD$${promo.value}`})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedPromotion && (
                  <Alert severity="success" sx={{ mt: 1 }}>
                    {selectedPromotion.name} - {selectedPromotion.type === 'percentage' ? `${selectedPromotion.value}% de descuento` : `RD$${selectedPromotion.value} de descuento`}
                  </Alert>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Resumen de Totales */}
              <Box sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', p: 2, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    RD${calculateSubtotal().toFixed(2)}
                  </Typography>
                </Box>
                {discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#e53935' }}>
                    <Typography variant="body2">Descuento:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      -RD${(calculateSubtotal() * discount / 100).toFixed(2)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    RD${calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* COLUMNA DERECHA - Carrito y Pago */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon />
                Carrito
                <Badge badgeContent={cart.length} color="primary">
                  <Box />
                </Badge>
              </Typography>

              {cart.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  color: 'text.secondary',
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <ShoppingCartIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography>El carrito está vacío</Typography>
                  <Typography variant="caption">Agrega productos para comenzar</Typography>
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: '400px', mb: 2 }}>
                  <List sx={{ p: 0 }}>
                    {cart.map((item) => {
                      const isRepair = item.meta?.type === 'repair' || item.meta?.repair;
                      const itemTotal = calculateItemTotal(item);
                      const hasDiscount = item.discount && item.discount > 0;
                      const { updateDiscount } = useCart();
                      
                      return (
                        <React.Fragment key={item.id}>
                          <ListItem sx={{ 
                            backgroundColor: isRepair ? 'rgba(255, 152, 0, 0.1)' : 'transparent',
                            borderLeft: isRepair ? '4px solid #ff9800' : 'none',
                            py: 1.5,
                            px: 1
                          }}>
                            <Box sx={{ width: '100%' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {isRepair ? <span>🔧</span> : <span>📦</span>}
                                    {item.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    RD${item.price.toFixed(2)} x {item.quantity}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    sx={{ p: 0.5 }}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                  <Typography sx={{ mx: 0.5, minWidth: '25px', textAlign: 'center', fontSize: '0.85rem' }}>
                                    {item.quantity}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    sx={{ p: 0.5 }}
                                  >
                                    <AddIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveFromCart(item.id)}
                                    sx={{ p: 0.5, ml: 0.5 }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                  {hasDiscount ? `RD$${itemTotal.toFixed(2)}` : `RD$${(item.price * item.quantity).toFixed(2)}`}
                                </Typography>
                                {hasDiscount && (
                                  <Chip 
                                    label={`-RD$${item.discount.toFixed(2)}`}
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                  />
                                )}
                              </Box>

                              {!hasDiscount && (
                                <Button
                                  size="small"
                                  variant="text"
                                  color="secondary"
                                  sx={{ fontSize: '0.7rem', mt: 0.5 }}
                                  onClick={() => {
                                    const discountStr = window.prompt('Descuento en RD$:', '0');
                                    if (discountStr !== null) {
                                      const discountVal = Math.max(0, parseFloat(discountStr) || 0);
                                      if (discountVal > 0 && discountVal <= (item.price * item.quantity)) {
                                        updateDiscount(item.id, discountVal);
                                        enqueueSnackbar(`Descuento de RD$${discountVal.toFixed(2)} aplicado`, { variant: 'success' });
                                      } else if (discountVal > (item.price * item.quantity)) {
                                        enqueueSnackbar('El descuento no puede ser mayor al total', { variant: 'warning' });
                                      }
                                    }
                                  }}
                                >
                                  + Descuento
                                </Button>
                              )}
                              {hasDiscount && (
                                <Button
                                  size="small"
                                  variant="text"
                                  color="error"
                                  sx={{ fontSize: '0.7rem', mt: 0.5 }}
                                  onClick={() => {
                                    updateDiscount(item.id, 0);
                                    enqueueSnackbar('Descuento removido', { variant: 'info' });
                                  }}
                                >
                                  ✕ Quitar Descuento
                                </Button>
                              )}
                            </Box>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Box>
              )}

              {/* Totales y Botón de Pago */}
              {cart.length > 0 && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', p: 2, borderRadius: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">RD${calculateSubtotal().toFixed(2)}</Typography>
                    </Box>
                    {discount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#e53935' }}>
                        <Typography variant="body2">Descuento:</Typography>
                        <Typography variant="body2">-RD${(calculateSubtotal() * discount / 100).toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total:</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.25rem' }}>
                        RD${calculateTotal().toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<PaymentIcon />}
                    onClick={() => setPaymentDialog(true)}
                    disabled={cart.length === 0 || processingPayment}
                    sx={{ fontWeight: 700 }}
                  >
                    {processingPayment ? 'Procesando...' : 'Cobrar Ahora'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de pago */}
      <Dialog 
        open={paymentDialog} 
        onClose={() => !processingPayment && setPaymentDialog(false)}
        disableEscapeKeyDown={processingPayment}
      >
        <DialogTitle>Método de Pago</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant={paymentMethod === 'efectivo' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('efectivo')}
              sx={{ mb: 1 }}
              disabled={processingPayment}
            >
              Efectivo
            </Button>
            <Button
              fullWidth
              variant={paymentMethod === 'tarjeta' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('tarjeta')}
              sx={{ mb: 1 }}
              disabled={processingPayment}
            >
              Tarjeta
            </Button>
            <Button
              fullWidth
              variant={paymentMethod === 'transferencia' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('transferencia')}
              disabled={processingPayment}
            >
              Transferencia
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPaymentDialog(false)}
            disabled={processingPayment}
          >
            Cancelar
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleCompleteSale}
            loading={processingPayment}
            disabled={processingPayment}
          >
            Confirmar Pago
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {/* Diálogo de pre-factura */}
      <PreInvoiceDialog
        open={preInvoiceDialog}
        onClose={() => setPreInvoiceDialog(false)}
        sale={lastSale}
      />

      {/* Diálogo de selección de cliente */}
      <CustomerDialog
        open={customerDialogOpen}
        onClose={() => setCustomerDialogOpen(false)}
        customers={customers}
        onSelect={handleSelectCustomer}
        onCreateNew={handleCreateNewCustomer}
      />

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleCodeDetected}
      />
    </Box>
  );
};

export default QuickSale; 