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
import { useAuth } from '../../context/AuthContext';
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
import axios from 'axios';

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
              <th style="padding: 5px; font-size: 10pt; text-align: left;">Producto</th>
              <th style="padding: 5px; font-size: 10pt; text-align: center;">Cant.</th>
              <th style="padding: 5px; font-size: 10pt; text-align: right;">Precio</th>
              <th style="padding: 5px; font-size: 10pt; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items?.map(item => `
              <tr>
                <td style="padding: 5px; font-size: 9pt;">
                  ${item.name}
                  <br>
                  <span style="font-size: 8pt; color: #666;">Cod: ${item.code || 'N/A'}</span>
                </td>
                <td style="padding: 5px; font-size: 9pt; text-align: center;">${item.quantity}</td>
                <td style="padding: 5px; font-size: 9pt; text-align: right;">$${item.price.toFixed(2)}</td>
                <td style="padding: 5px; font-size: 9pt; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('')}
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
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
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
    if (user?.uid) {
      loadData();
      loadPromotions();
    } else {
      setLoading(false);
      setError('Usuario no autenticado');
    }
  }, [user?.uid]);

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
      if (!user?.uid) {
        throw new Error('Usuario no autenticado');
      }

      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('userId', '==', user.uid),
        where('stock', '>', 0)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setProducts([]);
        return;
      }

      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        stock: parseInt(doc.data().stock) || 0,
        price: parseFloat(doc.data().price) || 0,
        name: doc.data().name || 'Producto sin nombre',
        code: doc.data().code || ''
      }));

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
      if (!user?.uid) {
        throw new Error('Usuario no autenticado');
      }

      const customersRef = collection(db, 'customers');
      const q = query(
        customersRef,
        where('userId', '==', user.uid),
        orderBy('name', 'asc')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setCustomers([]);
        return;
      }

      const customersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

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

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        enqueueSnackbar('Stock insuficiente', { variant: 'warning' });
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      enqueueSnackbar('Stock insuficiente', { variant: 'warning' });
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - (subtotal * discount / 100);
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

      // Verificar stock actual antes de procesar
      const batch = writeBatch(db);
      const stockUpdates = [];
      const productsToUpdate = [];

      // Verificar el stock actual de cada producto
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        const productDoc = await getDoc(productRef);
        
        if (!productDoc.exists()) {
          throw new Error(`El producto ${item.name} ya no existe`);
        }

        const currentStock = productDoc.data().stock;
        if (currentStock < item.quantity) {
          throw new Error(`Stock insuficiente para ${item.name}. Stock actual: ${currentStock}`);
        }

        stockUpdates.push({
          ref: productRef,
          currentStock,
          newStock: currentStock - item.quantity
        });
        productsToUpdate.push(productDoc.data());
      }
      
      // Obtener el número de WhatsApp del usuario (quien hace la venta)
      const userWhatsApp = user?.whatsapp?.number;
      if (!userWhatsApp) {
        setError('Debes configurar tu número de WhatsApp en tu perfil para recibir notificaciones.');
        setProcessingPayment(false);
        enqueueSnackbar('Debes configurar tu número de WhatsApp en tu perfil para recibir notificaciones.', { variant: 'error' });
        return;
      }
      // Obtener el número del cliente si existe
      const customerPhone = selectedCustomer?.phone;
      const saleData = {
        userId: user.uid,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        customer: selectedCustomer ? {
          ...selectedCustomer,
          phone: customerPhone
        } : null,
        paymentMethod: paymentMethod,
        status: 'completed',
        whatsappNumbers: [userWhatsApp, customerPhone].filter(Boolean) // Prioridad: usuario, luego cliente si existe
      };

      // Guardar la venta
      const saleRef = await addDoc(collection(db, 'sales'), saleData);
      const saleId = saleRef.id;

      // Crear notificación en Firestore
      if (user && user.uid) {
        await addDoc(collection(db, 'notificaciones'), {
          uid: user.uid,
          mensaje: `Venta realizada: $${saleData.total} | Cliente: ${saleData.customer?.name || 'General'} | Productos: ${saleData.items.length} | Fecha: ${new Date().toLocaleString()}`,
          leida: false,
          fecha: new Date().toISOString()
        });
      }

      // Agregar logs detallados
      console.log('📦 Datos de la venta:', {
        ticketNumber: saleId,
        total: saleData.total,
        customer: saleData.customer?.name || 'Cliente General',
        date: new Date().toISOString(),
        items: saleData.items
      });

      // Actualizar el stock de los productos
      stockUpdates.forEach(update => {
        batch.update(update.ref, {
          stock: update.newStock,
          lastUpdated: new Date().toISOString()
        });
      });

      // Ejecutar todas las actualizaciones en lote
      await batch.commit();

      // Actualizar el estado local de productos
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const update = stockUpdates.find(u => u.ref.id === product.id);
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
      for (let i = 0; i < stockUpdates.length; i++) {
        const update = stockUpdates[i];
        const productData = productsToUpdate[i];

        if (update.newStock <= productData.minStock) {
          if (notifyLowStock) {
            try {
              await notifyLowStock({
                name: productData.name,
                currentStock: update.newStock,
                minStock: productData.minStock
              });
            } catch (error) {
              console.error('Error al enviar notificación de stock bajo:', error);
            }
          }
        }

        if (update.newStock <= 0) {
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
          customer: saleData.customer?.name || 'Cliente General',
          date: new Date().toISOString(),
          items: saleData.items
        });
        console.log('✅ Notificación de venta enviada');
      } catch (error) {
        console.error('❌ Error al enviar notificación:', error);
      }

      // Limpiar el carrito y mostrar mensaje de éxito
      setPaymentDialog(false);
      setCart([]);
      setLastSale(saleData);
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
    
    // Navegar a la página de crear cliente usando el servicio de navegación
    window.location.href = '/customers/new';
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
        {/* Panel izquierdo - Búsqueda y productos */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
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
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Productos Disponibles
              </Typography>
              <Grid container spacing={2}>
                {products.map((product) => (
                  <Grid item xs={6} sm={4} md={3} key={product.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: darkMode ? '#333' : '#f0f0f0',
                        },
                      }}
                      onClick={() => handleAddToCart(product)}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" noWrap>
                          {product.name}
                        </Typography>
                        <Typography variant="h6" color={darkMode ? 'textSecondary' : 'primary'}>
                          ${product.price}
                        </Typography>
                        <Chip
                          size="small"
                          label={`Stock: ${product.stock}`}
                          color={product.stock > 10 ? 'success' : product.stock > 0 ? 'warning' : 'error'}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel derecho - Carrito */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Carrito
                  <Badge badgeContent={cart.length} color="primary" sx={{ ml: 2 }}>
                    <ShoppingCartIcon />
                  </Badge>
                </Typography>
                <Button
                  startIcon={<CustomerIcon />}
                  onClick={() => setCustomerDialogOpen(true)}
                  variant="outlined"
                  size="small"
                >
                  {selectedCustomer ? selectedCustomer.name : 'Seleccionar Cliente'}
                </Button>
              </Box>

              <List>
                {cart.map((item) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={item.name}
                        secondary={`$${item.price} x ${item.quantity}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography component="span" sx={{ mx: 1 }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          edge="end"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>

              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="promotion-label">Promoción</InputLabel>
                  <Select
                    labelId="promotion-label"
                    value={selectedPromotion ? selectedPromotion.id : ''}
                    label="Promoción"
                    onChange={e => {
                      const promo = promotions.find(p => p.id === e.target.value);
                      setSelectedPromotion(promo || null);
                      if (promo) {
                        if (promo.type === 'percentage') {
                          setDiscount(Number(promo.value));
                        } else if (promo.type === 'fixed') {
                          // Calcular el porcentaje equivalente para mostrar el descuento en el resumen
                          const subtotal = calculateSubtotal();
                          setDiscount(subtotal > 0 ? (100 * Number(promo.value) / subtotal) : 0);
                        } else {
                          setDiscount(0);
                        }
                      } else {
                        setDiscount(0);
                      }
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <DiscountIcon />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">Sin promoción</MenuItem>
                    {promotions.map(promo => (
                      <MenuItem key={promo.id} value={promo.id}>
                        {promo.name} ({promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {selectedPromotion && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    {selectedPromotion.name} - {selectedPromotion.type === 'percentage' ? `${selectedPromotion.value}% de descuento` : `$${selectedPromotion.value} de descuento`}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">
                  Subtotal: ${calculateSubtotal().toFixed(2)}
                </Typography>
                <Typography variant="h5" sx={{ mt: 1 }}>
                  Total: ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PaymentIcon />}
                onClick={() => setPaymentDialog(true)}
                disabled={cart.length === 0 || loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Procesando...' : 'Proceder al Pago'}
              </Button>
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
              variant={paymentMethod === 'cash' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('cash')}
              sx={{ mb: 1 }}
              disabled={processingPayment}
            >
              Efectivo
            </Button>
            <Button
              fullWidth
              variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('card')}
              sx={{ mb: 1 }}
              disabled={processingPayment}
            >
              Tarjeta
            </Button>
            <Button
              fullWidth
              variant={paymentMethod === 'transfer' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('transfer')}
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