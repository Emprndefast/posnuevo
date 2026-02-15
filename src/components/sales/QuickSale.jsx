import React, { useState, useEffect } from 'react';
// import useScanDetection from 'use-scan-detection';

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
  Tooltip,
  Drawer,
  Fab,
  Zoom,
  useMediaQuery
} from '@mui/material';
import CartSection from './CartSection';
import SaleDetailsSection from './SaleDetailsSection';
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
  AttachMoney as MoneyIcon,
  History as HistoryIcon,
  Build as BuildIcon,
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
      if (!user?.uid && !user?._id && !user?.id) return;

      try {
        // Obtener configuración empresarial desde MongoDB
        const response = await api.get('/settings/business');
        if (response.data.success && response.data.data) {
          setBusinessInfo(response.data.data);
        } else {
          // Si no hay configuración, usar valores por defecto
          setBusinessInfo({
            name: 'POSENT PRO',
            address: 'Dirección no disponible',
            phone: 'N/A',
            ruc: 'N/A'
          });
        }
      } catch (err) {
        console.error('Error al cargar información del negocio:', err);
        setError('Error al cargar información del negocio');
        // Usar valores por defecto en caso de error
        setBusinessInfo({
          name: 'POSENT PRO',
          address: 'Dirección no disponible',
          phone: 'N/A',
          ruc: 'N/A'
        });
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

    const title = type === 'pre' ? 'PRE-FACTURA / RECIBO' : 'FACTURA FISCAL';
    const invoiceNumber = sale.id?.slice(-8).toUpperCase() || 'N/A';
    const barcodeData = generateBarcode(invoiceNumber);
    const currency = 'RD$'; // Dominican Peso

    const fiscalInfo = type === 'fiscal' ? `
      <div style="margin: 10px 0; padding: 10px; background-color: #f0f0f0; border: 1px solid #999; border-radius: 3px;">
        <p style="margin: 3px 0; font-size: 9pt; font-weight: bold;">INFORMACIÓN FISCAL</p>
        <p style="margin: 2px 0; font-size: 8pt;">
          <strong>Régimen:</strong> ${businessInfo?.taxRegime || 'N/A'}
        </p>
        <p style="margin: 2px 0; font-size: 8pt;">
          <strong>Autorización:</strong> ${businessInfo?.authNumber || 'N/A'}
        </p>
        <p style="margin: 2px 0; font-size: 8pt;">
          <strong>Autorizado:</strong> ${businessInfo?.authDate ? formatDate(businessInfo.authDate) : 'N/A'}
        </p>
      </div>
    ` : '';

    const itemsRows = (sale.items || []).map(item => {
      const isRepair = item.isRepair || item.tipo === 'repair';
      const icon = isRepair ? '🔧' : '📦';
      const itemTotal = (item.quantity || 0) * (item.price || 0);
      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 6px 5px; font-size: 9pt; text-align: left; word-break: break-word;">
            ${icon} <strong>${item.name}</strong>
            ${item.code ? `<br><span style="font-size: 7pt; color: #888;">Código: ${item.code}</span>` : ''}
          </td>
          <td style="padding: 6px 5px; font-size: 9pt; text-align: center;">${item.quantity}</td>
          <td style="padding: 6px 5px; font-size: 9pt; text-align: right;">${currency} ${(item.price || 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="padding: 6px 5px; font-size: 9pt; text-align: right; font-weight: bold;">${currency} ${itemTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const subtotal = sale.subtotal || 0;
    const discountAmount = sale.discount > 0 ? (subtotal * sale.discount / 100) : 0;
    const total = sale.total || subtotal - discountAmount;
    const tax = type === 'fiscal' ? (total * 0.18) : 0; // 18% ITBIS en RD
    const totalWithTax = total + tax;

    return `
      <div style="font-family: 'Courier New', monospace; width: 80mm; padding: 4mm; color: #000;">
        
        <!-- ENCABEZADO -->
        <div style="text-align: center; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px;">
          ${businessInfo?.logo ? `
            <img src="${businessInfo.logo}" alt="Logo" style="max-width: 120px; max-height: 40px; margin-bottom: 6px;">
          ` : ''}
          <p style="margin: 4px 0; font-size: 11pt; font-weight: bold;">${businessInfo?.name || 'POSENT POS'}</p>
          <p style="margin: 2px 0; font-size: 8pt;">${businessInfo?.address || 'Dirección no disponible'}</p>
          <p style="margin: 2px 0; font-size: 8pt;">Tel: ${businessInfo?.phone || 'N/A'} | RUC: ${businessInfo?.ruc || 'N/A'}</p>
          <p style="margin: 4px 0; font-size: 10pt; font-weight: bold; letter-spacing: 1px;">${title}</p>
        </div>

        <!-- CÓDIGO DE BARRAS Y NÚMERO -->
        <div style="text-align: center; margin: 10px 0;">
          <img src="${barcodeData}" alt="Barcode" style="max-width: 100%; height: 35px;">
          <p style="margin: 3px 0; font-size: 9pt; letter-spacing: 2px;">#${invoiceNumber}</p>
        </div>

        <!-- INFORMACIÓN DE LA VENTA -->
        <div style="margin: 10px 0; font-size: 8pt; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 5px 0;">
          <p style="margin: 2px 0;"><strong>Fecha:</strong> ${formatDate(sale.date)}</p>
          <p style="margin: 2px 0;"><strong>Vendedor:</strong> ${user?.displayName || user?.nombre || 'N/A'}</p>
          <p style="margin: 2px 0;"><strong>Cliente:</strong> ${sale.customer?.name || 'Cliente General'}</p>
          ${sale.customer?.phone ? `<p style="margin: 2px 0;"><strong>Teléfono:</strong> ${sale.customer.phone}</p>` : ''}
          ${sale.customer?.ruc ? `<p style="margin: 2px 0;"><strong>RUC/NIT:</strong> ${sale.customer.ruc}</p>` : ''}
        </div>

        ${fiscalInfo}

        <!-- TABLA DE ITEMS -->
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 8pt;">
          <thead>
            <tr style="border-top: 2px solid #000; border-bottom: 1px solid #000;">
              <th style="padding: 4px; text-align: left; width: 50%;">DESCRIPCIÓN</th>
              <th style="padding: 4px; text-align: center; width: 15%;">CANT.</th>
              <th style="padding: 4px; text-align: right; width: 17.5%;">PRECIO</th>
              <th style="padding: 4px; text-align: right; width: 17.5%;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            <tr style="border-top: 2px solid #000;">
            </tr>
          </tfoot>
        </table>

        <!-- TOTALES -->
        <div style="margin: 10px 0; font-size: 9pt; text-align: right;">
          <p style="margin: 3px 0;">
            <strong>Subtotal:</strong> ${currency} ${subtotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          ${sale.discount > 0 ? `
            <p style="margin: 3px 0; color: #e53935;">
              <strong>Descuento (${sale.discount}%):</strong> -${currency} ${discountAmount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          ` : ''}
          ${type === 'fiscal' ? `
            <p style="margin: 3px 0;">
              <strong>ITBIS (18%):</strong> ${currency} ${tax.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          ` : ''}
          <p style="margin: 5px 0; padding: 5px; background: #f0f0f0; border: 1px solid #000; font-size: 10pt; font-weight: bold;">
            TOTAL A PAGAR: ${currency} ${(type === 'fiscal' ? totalWithTax : total).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <!-- MÉTODO DE PAGO -->
        ${sale.paymentMethod ? `
          <p style="margin: 8px 0; font-size: 8pt; text-align: center;">
            <strong>Método de Pago:</strong> ${(sale.paymentMethod === 'efectivo' ? 'EFECTIVO' : sale.paymentMethod === 'tarjeta' ? 'TARJETA' : sale.paymentMethod).toUpperCase()}
          </p>
        ` : ''}

        <!-- CÓDIGO QR -->
        <div style="text-align: center; margin: 10px 0;">
          <div id="qrcode" style="margin: 10px auto; width: 80px; height: 80px;"></div>
          <p style="margin: 3px 0; font-size: 7pt; color: #666;">Escanee para verificar</p>
        </div>

        <!-- MENSAJE FINAL -->
        <div style="text-align: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid #ddd; font-size: 8pt;">
          <p style="margin: 2px 0; font-weight: bold;">¡GRACIAS POR SU COMPRA!</p>
          ${businessInfo?.website ? `<p style="margin: 2px 0;">${businessInfo.website}</p>` : ''}
          <p style="margin: 2px 0; color: #666;">Soporte: ${businessInfo?.phone || 'N/A'}</p>
          <p style="margin: 4px 0; font-size: 7pt; font-style: italic;">
            ${type === 'fiscal'
        ? 'Documento fiscal digital autorizado'
        : 'DOCUMENTO NO FISCAL - NO VÁLIDO COMO FACTURA'}
          </p>
          <p style="margin: 2px 0; font-size: 7pt; color: #666;">${formatDate(new Date())}</p>
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
  const theme = useMuiTheme();
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

  // Mobile UI States
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Estados para Reparaciones
  const [repairs, setRepairs] = useState([]);
  const [selectedRepair, setSelectedRepair] = useState(null); // Reparación activa
  const [repairDialogOpen, setRepairDialogOpen] = useState(false);
  const [repairStatus, setRepairStatus] = useState(''); // Estado editable
  const [repairPrice, setRepairPrice] = useState(''); // Precio editable

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

  // Auto-apply promotions when cart changes
  useEffect(() => {
    const applyPromotions = async () => {
      if (cart.length === 0 || promotions.length === 0) {
        setDiscount(0);
        setSelectedPromotion(null);
        return;
      }

      try {
        const subtotal = calculateSubtotal();
        const cartProducts = cart.map(item => ({
          producto_id: item.id,
          cantidad: item.quantity,
          precio: item.price
        }));

        const result = await promotionService.applyPromotionsToSale(cartProducts, subtotal);

        if (result.promocionesAplicadas && result.promocionesAplicadas.length > 0) {
          const newPromo = result.promocionesAplicadas[0];
          const discountPercentage = (result.descuentoTotal / subtotal) * 100;

          // Only show notification if promotion changed
          const promoChanged = !selectedPromotion ||
            (selectedPromotion._id !== newPromo._id && selectedPromotion.nombre !== newPromo.nombre);

          setDiscount(discountPercentage);
          setSelectedPromotion(newPromo);

          if (promoChanged) {
            enqueueSnackbar(
              `Promoción aplicada: ${newPromo.nombre}`,
              { variant: 'success' }
            );
          }
        } else {
          setDiscount(0);
          setSelectedPromotion(null);
        }
      } catch (error) {
        console.error('Error applying promotions:', error);
        // Don't show error to user, just silently fail
      }
    };

    applyPromotions();
  }, [cart, promotions]);

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
      // Load ALL promotions for the selector (not just active)
      const response = await promotionService.getPromotions(1, 100);
      console.log('Promociones cargadas en QuickSale:', response);
      setPromotions(response || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
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
      if (!selectedRepair && cart.length === 0) {
        throw new Error('El carrito está vacío');
      }

      // LOGICA DE COBRO DE REPARACION
      if (selectedRepair) {
        // 1. Actualizar estado y precio
        await axios.patch(`${process.env.REACT_APP_API_URL}/api/repairs/${selectedRepair._id}`, {
          estado: repairStatus,
          precio: Number(repairPrice)
        });

        // 2. Marcar como pagada
        await axios.post(`${process.env.REACT_APP_API_URL}/api/repairs/${selectedRepair._id}/mark-paid`);

        // 3. Crear registro de venta (Opcional, para contabilidad unificada)
        const saleData = {
          items: [{
            tipo: 'repair',
            repair_id: selectedRepair._id, // Referencia
            cantidad: 1,
            precio_unitario: Number(repairPrice),
            subtotal: Number(repairPrice),
            descuento: 0,
            nombre: `Reparación: ${selectedRepair.modelo || selectedRepair.device}`
          }],
          subtotal: Number(repairPrice),
          total: Number(repairPrice),
          cliente_id: selectedRepair.cliente_id || (selectedCustomer ? selectedCustomer._id : null),
          metodo_pago: paymentMethod,
          estado: 'completada',
          es_reparacion: true
        };

        const response = await api.post('/sales', saleData);

        setLastSale({
          ...saleData,
          _id: response.data.data?._id || 'TEMP',
          fecha: new Date(),
          items: saleData.items.map(i => ({ ...i, name: i.nombre, price: i.precio_unitario, quantity: 1 }))
        });

        enqueueSnackbar('Reparación cobrada correctamente', { variant: 'success' });
        setPreInvoiceDialog(true);
        setPaymentDialog(false);
        setProcessingPayment(false);
        handleClearRepair();
        return; // FIN DEL FLUJO DE REPARACIÓN
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

      // Notificación de venta: ahora la envia el backend después de guardar la venta para evitar duplicados
      console.log('🔔 La notificación de venta será enviada por el servidor (evitando duplicados).');

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

  // Funciones para Reparaciones
  const fetchRepairs = async () => {
    try {
      const response = await api.get('/repairs');
      if (response.data.success) {
        // Filtramos las que NO están pagadas y NO terminadas/entregadas hace mucho
        // Por ahora traemos todas las NO pagadas y NO canceladas
        const pending = response.data.data.filter(r => !r.pagado && r.status !== 'cancelled' && r.status !== 'cancelado');
        setRepairs(pending);
      }
    } catch (error) {
      console.error('Error fetching repairs:', error);
      enqueueSnackbar('Error cargando reparaciones', { variant: 'error' });
    }
  };

  const handleSelectRepair = (repair) => {
    setSelectedRepair(repair);
    setRepairStatus(repair.status || repair.estado || 'pending');
    setRepairPrice(repair.precio || repair.cost || 0);

    // Si la reparación tiene cliente, intentamos seleccionarlo también
    if (repair.cliente_id) {
      const costumerObj = customers.find(c => c._id === repair.cliente_id || c.id === repair.cliente_id);
      if (costumerObj) setSelectedCustomer(costumerObj);
    } else if (repair.cliente) {
      // Si no hay ID pero hay nombre, creamos un objeto temporal
      setSelectedCustomer({ name: repair.cliente, _id: 'temp', isTemp: true });
    }

    setRepairDialogOpen(false);
  };

  const handleClearRepair = () => {
    setSelectedRepair(null);
    setRepairStatus('');
    setRepairPrice('');
    if (selectedCustomer?.isTemp) {
      setSelectedCustomer(null);
    }
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

  // Hook de detección de escáner USB (Teclado) - TEMPORARILY DISABLED due to Webpack issues
  /*
  try {
    if (typeof useScanDetection === 'function') {
      useScanDetection({
        onComplete: (code) => {
          // Ignorar si el foco está en un input de texto para evitar conflictos
          if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
            return;
          }
          console.log('Barcode detected via USB:', code);
          handleCodeDetected(code);
        },
        minLength: 3 // Mínimo de caracteres para considerar un código válido
      });
    }
  } catch (e) {
    console.error('Scanner hook error:', e);
  }
  */

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
    <Box sx={{
      p: { xs: 1, md: 2 },
      height: { xs: 'auto', md: 'calc(100vh - 64px)' },
      minHeight: { xs: 'calc(100vh - 64px)', md: 'auto' },
      overflow: { xs: 'visible', md: 'hidden' },
      display: 'flex',
      flexDirection: 'column',
      position: 'relative' // For absolute positioning of FAB if needed
    }}>
      {/* Mobile Cart FAB */}
      <Zoom in={isMobile && cart.length > 0}>
        <Fab
          variant="extended"
          color="primary"
          aria-label="cart"
          onClick={() => setMobileDrawerOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1300,
            fontWeight: 700,
            px: 3
          }}
        >
          <Badge badgeContent={cart.length} color="error" sx={{ mr: 2 }}>
            <ShoppingCartIcon />
          </Badge>
          Total: ${calculateTotal().toFixed(2)}
        </Fab>
      </Zoom>

      {/* Mobile Drawer */}
      <Drawer
        anchor="bottom"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            height: '85vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2 }} />
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>

            {/* Sale Details in Drawer */}
            <Box sx={{ mb: 2 }}>
              <SaleDetailsSection
                selectedCustomer={selectedCustomer}
                onSelectCustomer={() => setCustomerDialogOpen(true)}
                notes={notes}
                onNotesChange={(e) => setNotes(e.target.value)}
                promotions={promotions}
                selectedPromotion={selectedPromotion}
                onPromotionChange={e => {
                  const promo = promotions.find(p => (p._id || p.id) === e.target.value);
                  setSelectedPromotion(promo || null);
                  // Logic copied from original component
                  if (promo) {
                    if (promo.tipo === 'DESCUENTO_PORCENTAJE' && promo.descuentoPorcentaje) {
                      setDiscount(Number(promo.descuentoPorcentaje));
                    } else if (promo.tipo === 'DESCUENTO_FIJO' && promo.descuentoFijo) {
                      const subtotal = calculateSubtotal();
                      setDiscount(subtotal > 0 ? (100 * Number(promo.descuentoFijo) / subtotal) : 0);
                    } else {
                      setDiscount(0);
                    }
                  } else {
                    setDiscount(0);
                  }
                }}
                isMobile={true}
              />
            </Box>

            {/* Cart Logic in Drawer */}
            <CartSection
              cart={cart}
              darkMode={darkMode}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              subtotal={calculateSubtotal()}
              total={calculateTotal()}
              discount={discount}
              discountAmount={calculateSubtotal() * discount / 100}
              onCheckout={() => setPaymentDialog(true)}
              processingPayment={processingPayment}
              isMobile={true}
            />
          </Box>
        </Box>
      </Drawer>
      {/* Título - Compacto */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Punto de Venta
        </Typography>
      </Box>

      {/* Layout Flexbox Robusto (Garantiza 3 columnas) */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        height: '100%',
        overflow: { xs: 'visible', md: 'hidden' },
        alignItems: 'stretch'
      }}>

        {/* COLUMNA 1: PRODUCTOS (Flexible, ocupa el resto) */}
        <Box sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: { xs: '500px', md: 'auto' } // Altura fija en móvil para scroll interno
        }}>
          {/* Barra de Búsqueda Integrada */}
          <Box sx={{ p: 1, pb: 0, mb: 1, display: 'flex', gap: 1 }}>
            <Autocomplete
              fullWidth
              options={products}
              getOptionLabel={(option) => option.name}
              value={selectedProduct}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleAddToCart(newValue);
                  setSelectedProduct(null);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="Buscar productos..."
                  sx={{
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#fff',
                    '& .MuiOutlinedInput-root': { borderRadius: 1.5 }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
            <Tooltip title="Escanear">
              <IconButton
                onClick={() => setScannerOpen(true)}
                sx={{
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                  borderRadius: 1.5,
                  aspectRatio: '1/1'
                }}
              >
                <CameraAltIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Grid de Productos */}
          <Paper
            elevation={0}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 1.5,
              bgcolor: 'transparent',
              borderRadius: 2
            }}
          >
            <Grid container spacing={1.5}>
              {products.map((product) => (
                <Grid item xs={6} sm={4} md={4} lg={3} xl={3} key={product.id}>
                  <Card
                    elevation={0}
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      transition: 'all 0.2s',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      },
                    }}
                    onClick={() => handleAddToCart(product)}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box
                        sx={{
                          width: '100%',
                          height: 80,
                          mb: 1,
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: darkMode ? '#333' : '#f5f5f5',
                        }}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <Box sx={{ display: product.imageUrl ? 'none' : 'flex', fontSize: '1.5rem' }}>📦</Box>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 32, mb: 0.5 }}>
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                          ${product.price}
                        </Typography>
                        <Chip
                          label={product.stock}
                          size="small"
                          color={product.stock > 0 ? 'success' : 'error'}
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

        {/* COLUMNA 2: DETALLES (Fija 300px en desktop) - SOLO VISIBLE EN DESKTOP */}
        {!isMobile && (
          <Box sx={{
            width: { xs: '100%', md: 300 },
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            order: { xs: 3, md: 2 }
          }}>
            <SaleDetailsSection
              selectedCustomer={selectedCustomer}
              onSelectCustomer={() => setCustomerDialogOpen(true)}
              notes={notes}
              onNotesChange={(e) => setNotes(e.target.value)}
              promotions={promotions}
              selectedPromotion={selectedPromotion}
              onPromotionChange={e => {
                const promo = promotions.find(p => (p._id || p.id) === e.target.value);
                setSelectedPromotion(promo || null);
                if (promo) {
                  if (promo.tipo === 'DESCUENTO_PORCENTAJE' && promo.descuentoPorcentaje) {
                    setDiscount(Number(promo.descuentoPorcentaje));
                  } else if (promo.tipo === 'DESCUENTO_FIJO' && promo.descuentoFijo) {
                    const subtotal = calculateSubtotal();
                    setDiscount(subtotal > 0 ? (100 * Number(promo.descuentoFijo) / subtotal) : 0);
                  } else {
                    setDiscount(0);
                  }
                } else {
                  setDiscount(0);
                }
              }}
              isMobile={false}
            />
          </Box>
        )}

        {/* COLUMNA 3: CARRITO (Fija 350px en desktop) - SOLO VISIBLE EN DESKTOP */}
        {!isMobile && (
          <Box sx={{
            width: { xs: '100%', md: 350 },
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            height: { xs: 'auto', md: '100%' },
            order: { xs: 2, md: 3 }
          }}>
            <CartSection
              cart={cart}
              darkMode={darkMode}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              subtotal={calculateSubtotal()}
              total={calculateTotal()}
              discount={discount}
              discountAmount={calculateSubtotal() * discount / 100}
              onCheckout={() => setPaymentDialog(true)}
              processingPayment={processingPayment}
              isMobile={false}
            />
          </Box>
        )}
      </Box>

      {/* Diálogos (sin cambios en lógica) */}
      <Dialog
        open={paymentDialog}
        onClose={() => !processingPayment && setPaymentDialog(false)}
        disableEscapeKeyDown={processingPayment}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Cobrar ${calculateTotal().toFixed(2)}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              size="large"
              variant={paymentMethod === 'efectivo' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('efectivo')}
              startIcon={<MoneyIcon />}
            >
              Efectivo
            </Button>
            <Button
              fullWidth
              size="large"
              variant={paymentMethod === 'tarjeta' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('tarjeta')}
              startIcon={<PaymentIcon />}
            >
              Tarjeta
            </Button>
            <Button
              fullWidth
              size="large"
              variant={paymentMethod === 'transferencia' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('transferencia')}
            >
              Transferencia
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)} disabled={processingPayment}>Atrás</Button>
          <LoadingButton
            variant="contained"
            color="success"
            onClick={handleCompleteSale}
            loading={processingPayment}
          >
            Confirmar Pago
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <PreInvoiceDialog
        open={preInvoiceDialog}
        onClose={() => setPreInvoiceDialog(false)}
        sale={lastSale}
      />

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

      {/* Dialog para seleccionar Reparación */}
      <Dialog
        open={repairDialogOpen}
        onClose={() => setRepairDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon /> Cargar Reparación Pendiente
        </DialogTitle>
        <DialogContent dividers>
          {repairs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3, opacity: 0.6 }}>
              <BuildIcon sx={{ fontSize: 50, mb: 1 }} />
              <Typography>No se encontraron reparaciones pendientes.</Typography>
            </Box>
          ) : (
            <List>
              {repairs.map((repair) => (
                <ListItem
                  key={repair._id}
                  button
                  divider
                  onClick={() => handleSelectRepair(repair)}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography fontWeight={600} variant="body1">
                        {repair.modelo || repair.device} ({repair.marca || repair.brand})
                      </Typography>
                      <Chip
                        label={repair.estado || repair.status}
                        size="small"
                        color={(repair.estado === 'completed' || repair.status === 'completed') ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Cliente: {repair.cliente || repair.customer_name || 'Desconocido'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                        {repair.problema || repair.problem || repair.descripcion_problema || 'Sin problema detallado'}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="primary">
                        ${repair.precio || repair.cost || 0}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRepairDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
};

export default QuickSale; 