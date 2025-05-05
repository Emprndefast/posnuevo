import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Print as PrintIcon,
  TrendingUp,
  Inventory,
  People,
  Receipt,
  AttachMoney,
  Category,
} from '@mui/icons-material';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionsContext';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTheme } from '../../context/ThemeContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DataExport = () => {
  const { user } = useAuth();
  const { hasPermission, userRole } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportType, setExportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedTab, setSelectedTab] = useState(0);
  const { darkMode } = useTheme();

  const verifyAndUpdateUserRole = async () => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Si el usuario no existe en la base de datos, lo creamos con rol de admin
        await setDoc(userRef, {
          email: user.email,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        });
        window.location.reload(); // Recargar para actualizar los permisos
      } else if (!userDoc.data().role) {
        // Si el usuario existe pero no tiene rol, le asignamos uno
        await updateDoc(userRef, {
          role: 'admin',
          updatedAt: new Date()
        });
        window.location.reload(); // Recargar para actualizar los permisos
      }
    } catch (err) {
      console.error('Error al verificar/actualizar el rol:', err);
      setError('Error al verificar tus permisos. Por favor, recarga la página o contacta al administrador.');
    }
  };

  useEffect(() => {
    // Verificar el rol del usuario al cargar el componente
    if (!user) {
      setError('Debes iniciar sesión para acceder a esta función');
    } else if (!userRole) {
      verifyAndUpdateUserRole();
    } else if (!hasPermission('reports', 'export')) {
      setError(`Tu rol actual (${userRole}) no tiene permisos para exportar reportes. Se requiere rol de Administrador o Propietario.`);
    }
  }, [user, userRole, hasPermission]);

  const exportTypes = {
    sales: {
      label: 'Ventas',
      collection: 'sales',
      icon: <AttachMoney />,
      fields: [
        { key: 'date', label: 'Fecha' },
        { key: 'customer', label: 'Cliente' },
        { key: 'items', label: 'Productos' },
        { key: 'subtotal', label: 'Subtotal' },
        { key: 'discount', label: 'Descuento' },
        { key: 'total', label: 'Total' },
        { key: 'paymentMethod', label: 'Método de Pago' },
        { key: 'status', label: 'Estado' }
      ],
      formatters: {
        date: (value) => value ? format(value.toDate(), 'dd/MM/yyyy HH:mm', { locale: es }) : '-',
        customer: (value) => value?.name || 'Cliente General',
        items: (value) => value?.length || 0,
        subtotal: (value) => value ? `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '$0.00',
        total: (value) => value ? `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '$0.00',
        discount: (value) => value ? `${value}%` : '0%',
        paymentMethod: (value) => {
          const methods = {
            cash: 'Efectivo',
            card: 'Tarjeta',
            transfer: 'Transferencia'
          };
          return methods[value] || value;
        },
        status: (value) => value === 'completed' ? 'Completada' : 'Pendiente'
      }
    },
    salesByProduct: {
      label: 'Ventas por Producto',
      collection: 'sales',
      icon: <Category />,
      fields: [
        { key: 'productName', label: 'Producto' },
        { key: 'code', label: 'Código' },
        { key: 'quantity', label: 'Cantidad Vendida' },
        { key: 'totalAmount', label: 'Total Vendido' },
        { key: 'averagePrice', label: 'Precio Promedio' }
      ],
      formatters: {
        totalAmount: (value) => `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`,
        averagePrice: (value) => `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
      }
    },
    dailySales: {
      label: 'Ventas Diarias',
      collection: 'sales',
      icon: <Receipt />,
      fields: [
        { key: 'date', label: 'Fecha' },
        { key: 'totalSales', label: 'Total Ventas' },
        { key: 'orderCount', label: 'Cantidad de Órdenes' },
        { key: 'averageOrder', label: 'Ticket Promedio' }
      ],
      formatters: {
        date: (value) => format(parseISO(value), 'dd/MM/yyyy', { locale: es }),
        totalSales: (value) => `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`,
        averageOrder: (value) => `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`
      }
    },
    inventory: {
      label: 'Inventario',
      collection: 'products',
      icon: <Inventory />,
      fields: [
        { key: 'name', label: 'Producto' },
        { key: 'code', label: 'Código' },
        { key: 'description', label: 'Descripción' },
        { key: 'category', label: 'Categoría' },
        { key: 'stock', label: 'Stock Actual' },
        { key: 'minStock', label: 'Stock Mínimo' },
        { key: 'price', label: 'Precio Venta' },
        { key: 'status', label: 'Estado' }
      ],
      formatters: {
        price: (value) => value ? `$${parseFloat(value).toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '$0.00',
        stock: (value) => parseInt(value) || 0,
        minStock: (value) => parseInt(value) || 0,
        status: (value) => value === 'active' ? 'Activo' : 'Inactivo',
        description: (value) => value || 'Sin descripción',
        category: (value) => value || 'Sin categoría'
      }
    },
    lowStock: {
      label: 'Productos con Stock Bajo',
      collection: 'products',
      icon: <Inventory color="error" />,
      fields: [
        { key: 'name', label: 'Producto' },
        { key: 'code', label: 'Código' },
        { key: 'stock', label: 'Stock Actual' },
        { key: 'minStock', label: 'Stock Mínimo' },
        { key: 'price', label: 'Precio Venta' },
        { key: 'category', label: 'Categoría' },
        { key: 'status', label: 'Estado' }
      ],
      formatters: {
        price: (value) => value ? `$${parseFloat(value).toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '$0.00',
        stock: (value) => parseInt(value) || 0,
        minStock: (value) => parseInt(value) || 0,
        status: (value) => value === 'active' ? 'Activo' : 'Inactivo',
        category: (value) => value || 'Sin categoría'
      }
    },
    customers: {
      label: 'Clientes',
      collection: 'customers',
      icon: <People />,
      fields: [
        { key: 'name', label: 'Nombre' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'ruc', label: 'RUC/NIT' },
        { key: 'address', label: 'Dirección' },
        { key: 'totalPurchases', label: 'Total Compras' },
        { key: 'lastPurchase', label: 'Última Compra' }
      ],
      formatters: {
        totalPurchases: (value) => value ? `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '$0.00',
        lastPurchase: (value) => value ? format(value.toDate(), 'dd/MM/yyyy', { locale: es }) : 'Sin compras',
        email: (value) => value || 'No registrado',
        phone: (value) => value || 'No registrado',
        ruc: (value) => value || 'No registrado',
        address: (value) => value || 'No registrada'
      }
    },
    topCustomers: {
      label: 'Mejores Clientes',
      collection: 'customers',
      icon: <TrendingUp />,
      fields: [
        { key: 'name', label: 'Nombre' },
        { key: 'totalPurchases', label: 'Total Compras' },
        { key: 'purchaseCount', label: 'Cantidad de Compras' },
        { key: 'averagePurchase', label: 'Compra Promedio' },
        { key: 'lastPurchase', label: 'Última Compra' }
      ],
      formatters: {
        totalPurchases: (value) => value ? `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '$0.00',
        averagePurchase: (value) => value ? `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}` : '$0.00',
        lastPurchase: (value) => value ? format(value.toDate(), 'dd/MM/yyyy', { locale: es }) : 'Sin compras'
      }
    },
    categoryAnalysis: {
      label: 'Análisis por Categoría',
      collection: 'sales',
      icon: <Category />,
      fields: [
        { key: 'category', label: 'Categoría' },
        { key: 'totalSales', label: 'Total Ventas' },
        { key: 'itemsSold', label: 'Productos Vendidos' },
        { key: 'averagePrice', label: 'Precio Promedio' },
        { key: 'percentage', label: '% del Total' }
      ],
      formatters: {
        totalSales: (value) => `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`,
        averagePrice: (value) => `$${value.toLocaleString('es-CO', { minimumFractionDigits: 2 })}`,
        percentage: (value) => `${value.toFixed(2)}%`,
        category: (value) => value || 'Sin categoría'
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const processData = async (data, config) => {
    switch (exportType) {
      case 'salesByProduct':
        return processSalesByProduct(data);
      case 'lowStock':
        return data.filter(item => (parseInt(item.stock) || 0) <= (parseInt(item.minStock) || 0));
      case 'topCustomers':
        return processTopCustomers(data);
      case 'dailySales':
        return processDailySales(data);
      case 'categoryAnalysis':
        return processCategoryAnalysis(data);
      default:
        return data;
    }
  };

  const processSalesByProduct = (sales) => {
    const productSales = {};
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productName: item.name,
            code: item.code || 'N/A',
            quantity: 0,
            totalAmount: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].totalAmount += item.price * item.quantity;
      });
    });

    return Object.values(productSales)
      .map(product => ({
      ...product,
      averagePrice: product.totalAmount / product.quantity
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const processTopCustomers = (customers) => {
    return customers
      .filter(customer => customer.totalPurchases > 0)
      .sort((a, b) => b.totalPurchases - a.totalPurchases)
      .slice(0, 20)
      .map(customer => ({
        ...customer,
        averagePurchase: customer.totalPurchases / (customer.purchaseCount || 1)
      }));
  };

  const processDailySales = (sales) => {
    const dailySales = {};
    
    sales.forEach(sale => {
      const dateKey = format(sale.date.toDate(), 'yyyy-MM-dd');
      if (!dailySales[dateKey]) {
        dailySales[dateKey] = {
          date: dateKey,
          totalSales: 0,
          orderCount: 0,
          averageOrder: 0
        };
      }
      dailySales[dateKey].totalSales += sale.total;
      dailySales[dateKey].orderCount += 1;
    });

    return Object.values(dailySales)
      .map(day => ({
        ...day,
        averageOrder: day.totalSales / day.orderCount
      }))
      .sort((a, b) => parseISO(b.date) - parseISO(a.date));
  };

  const processCategoryAnalysis = (sales) => {
    const categoryStats = {};
    let totalSalesAmount = 0;

    // Procesar ventas por categoría
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const category = item.category || 'Sin categoría';
        if (!categoryStats[category]) {
          categoryStats[category] = {
            category,
            totalSales: 0,
            itemsSold: 0,
            totalAmount: 0
          };
        }
        const itemTotal = item.price * item.quantity;
        categoryStats[category].totalSales += itemTotal;
        categoryStats[category].itemsSold += item.quantity;
        categoryStats[category].totalAmount += itemTotal;
        totalSalesAmount += itemTotal;
      });
    });

    // Calcular estadísticas finales
    return Object.values(categoryStats)
      .map(stat => ({
        ...stat,
        averagePrice: stat.totalSales / stat.itemsSold,
        percentage: (stat.totalSales / totalSalesAmount) * 100
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
  };

  const handleExport = async () => {
    if (!user) {
      setError('Debes iniciar sesión para exportar datos');
      return;
    }

    if (!hasPermission('reports', 'export')) {
      setError('No tienes permisos para exportar datos. Se requiere rol de Administrador o Propietario.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const exportConfig = exportTypes[exportType];
      let q;

      // Construir la consulta según el tipo de exportación
      if (exportType === 'inventory' || exportType === 'lowStock') {
        // Para productos, solo filtramos por userId sin filtro de fecha
        q = query(
          collection(db, exportConfig.collection),
          where('userId', '==', user.uid)
        );
      } else {
        // Para otros tipos de reportes, incluimos el filtro de fecha
        q = query(
        collection(db, exportConfig.collection),
        where('userId', '==', user.uid),
          where('date', '>=', new Date(dateRange.start)),
          where('date', '<=', new Date(dateRange.end)),
        orderBy('date', 'desc')
      );
      }

      const querySnapshot = await getDocs(q);
      let data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Procesar datos según el tipo de reporte
      data = await processData(data, exportConfig);

      // Si es reporte de inventario, ordenar por nombre
      if (exportType === 'inventory' || exportType === 'lowStock') {
        data.sort((a, b) => a.name.localeCompare(b.name));
      }

      switch (exportFormat) {
        case 'csv':
          exportToCsv(data, exportConfig);
          break;
        case 'pdf':
          await exportToPdf(data, exportConfig);
          break;
        case 'print':
          await handlePrint(data, exportConfig);
          break;
        default:
          throw new Error('Formato no soportado');
      }
    } catch (err) {
      console.error('Error al exportar:', err);
      setError('Error al exportar los datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value, field, config) => {
    if (!value) return '';
    
    const formatter = config.formatters?.[field.key];
    if (formatter) {
      return formatter(value);
    }

    if (typeof value === 'object') {
      if (value.toDate) return format(value.toDate(), 'dd/MM/yyyy HH:mm');
      return JSON.stringify(value);
    }

    return value.toString();
  };

  const calculateInventoryValue = (products) => {
    return products.reduce((total, product) => {
      const stock = parseInt(product.stock) || 0;
      const price = parseFloat(product.price) || 0;
      return total + (stock * price);
    }, 0);
  };

  const exportToCsv = (data, config) => {
    // Función auxiliar para escapar campos CSV
    const escapeCsvField = (field) => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    // Función para formatear valores
    const formatValue = (value, fieldKey) => {
      if (!value) return '';
      if (config.formatters && config.formatters[fieldKey]) {
        return config.formatters[fieldKey](value);
      }
      if (value instanceof Date || (value && value.toDate instanceof Function)) {
        return format(value instanceof Date ? value : value.toDate(), 'dd/MM/yyyy HH:mm', { locale: es });
      }
      return value;
    };

    try {
      // Preparar encabezados
      const headers = config.fields.map(field => escapeCsvField(field.label));
      
      // Preparar filas
    const rows = data.map(item => 
      config.fields.map(field => 
          escapeCsvField(formatValue(item[field.key], field.key))
      ).join(',')
      );

      // Agregar metadatos
      const metadata = [
        `"Reporte de ${config.label}"`,
        `"Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}"`,
        `"Período: ${format(parseISO(dateRange.start), 'dd/MM/yyyy')} - ${format(parseISO(dateRange.end), 'dd/MM/yyyy')}"`,
        ''  // Línea en blanco para separar
      ];

      // Agregar resumen si es reporte de inventario
      if (exportType === 'inventory') {
        const totalProducts = data.length;
        const lowStockProducts = data.filter(item => (parseInt(item.stock) || 0) <= (parseInt(item.minStock) || 0)).length;
        const totalValue = calculateInventoryValue(data);
        
        metadata.push(
          '"Resumen del Inventario"',
          `"Total de Productos","${totalProducts}"`,
          `"Productos con Stock Bajo","${lowStockProducts}"`,
          `"Valor Total del Inventario","$${totalValue.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}"`,
          ''  // Línea en blanco para separar
        );
      }

      // Combinar todo el contenido
      const csvContent = [
        ...metadata,
        headers.join(','),
        ...rows
      ].join('\n');

      // Crear y descargar el archivo
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
      const fileName = `reporte_${config.label.toLowerCase()}_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.csv`;
      
      if (window.navigator.msSaveOrOpenBlob) {
        // Soporte para IE
        window.navigator.msSaveOrOpenBlob(blob, fileName);
      } else {
        // Otros navegadores
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error al exportar a CSV:', error);
      setError('Error al generar el archivo CSV');
    }
  };

  const exportToPdf = async (data, config) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Configuración de estilos
    const styles = {
      header: { fontSize: 20, textColor: [0, 0, 0] },
      subheader: { fontSize: 12, textColor: [100, 100, 100] },
      table: { fontSize: 10, cellPadding: 3 }
    };

    // Encabezado del documento
    doc.setFontSize(styles.header.fontSize);
    doc.setTextColor(...styles.header.textColor);
    const title = `Reporte de ${config.label}`;
    const titleWidth = doc.getStringUnitWidth(title) * styles.header.fontSize / doc.internal.scaleFactor;
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    // Información del reporte
    doc.setFontSize(styles.subheader.fontSize);
    doc.setTextColor(...styles.subheader.textColor);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 30);
    doc.text(`Período: ${format(parseISO(dateRange.start), 'dd/MM/yyyy')} - ${format(parseISO(dateRange.end), 'dd/MM/yyyy')}`, 14, 37);

    // Preparar datos para la tabla
    const headers = config.fields.map(field => field.label);
    const rows = data.map(item => 
      config.fields.map(field => {
        const value = item[field.key];
        return config.formatters && config.formatters[field.key] 
          ? config.formatters[field.key](value)
          : value;
      })
    );

    // Generar tabla
    doc.autoTable({
      startY: 45,
      head: [headers],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: styles.table.fontSize,
        cellPadding: styles.table.cellPadding,
        halign: 'center'
      },
      headStyles: {
        fillColor: [51, 51, 51],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // Agregar resumen estadístico
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    
    if (exportType === 'inventory') {
      const totalProducts = data.length;
      const lowStockProducts = data.filter(item => (parseInt(item.stock) || 0) <= (parseInt(item.minStock) || 0)).length;
      const totalValue = calculateInventoryValue(data);
      
      doc.text(`Resumen del Inventario:`, 14, finalY);
      doc.text(`• Total de Productos: ${totalProducts}`, 14, finalY + 7);
      doc.text(`• Productos con Stock Bajo: ${lowStockProducts}`, 14, finalY + 14);
      doc.text(`• Valor Total del Inventario: $${totalValue.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, finalY + 21);
    }

    // Agregar pie de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 20,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }

    // Guardar el PDF
    const fileName = `reporte_${config.label.toLowerCase()}_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
    doc.save(fileName);
  };

  const handlePrint = async (data, config) => {
    // Crear una ventana temporal para la impresión
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Por favor, permite las ventanas emergentes para imprimir');
      return;
    }

    // Función para formatear valores
    const formatValue = (value, fieldKey) => {
      if (!value) return '';
      if (config.formatters && config.formatters[fieldKey]) {
        return config.formatters[fieldKey](value);
      }
      if (value instanceof Date || (value && value.toDate instanceof Function)) {
        return format(value instanceof Date ? value : value.toDate(), 'dd/MM/yyyy HH:mm', { locale: es });
      }
      return value;
    };

    // Estilos CSS para la impresión
    const styles = `
      <style>
        @media print {
          @page { margin: 2cm; }
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          margin: 0;
          color: #333;
        }
        .subtitle {
          font-size: 14px;
          color: #666;
          margin: 5px 0;
        }
        .metadata {
          margin: 20px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background-color: white;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border: 1px solid #ddd;
        }
        th {
          background-color: #333;
          color: white;
          font-weight: bold;
          white-space: nowrap;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        td {
          font-size: 14px;
        }
        .numeric {
          text-align: right;
        }
        .summary {
          margin-top: 30px;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        .summary h3 {
          margin-top: 0;
          color: #333;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        @media print {
          .no-print {
            display: none;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      </style>
    `;

    // Contenido HTML
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
        <meta charset="UTF-8">
        <title>Reporte de ${config.label}</title>
        ${styles}
        </head>
        <body>
        <div class="header">
          <h1 class="title">Reporte de ${config.label}</h1>
          <p class="subtitle">Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
          <p class="subtitle">Período: ${format(parseISO(dateRange.start), 'dd/MM/yyyy')} - ${format(parseISO(dateRange.end), 'dd/MM/yyyy')}</p>
        </div>

        <div class="metadata">
          <strong>Información del reporte:</strong><br>
          • Tipo de reporte: ${config.label}<br>
          • Total de registros: ${data.length}<br>
            ${exportType === 'inventory' ? `
              • Productos con stock bajo: ${data.filter(item => (parseInt(item.stock) || 0) <= (parseInt(item.minStock) || 0)).length}<br>
              • Valor total del inventario: $${calculateInventoryValue(data).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            ` : ''}
        </div>

          <table>
            <thead>
              <tr>
              ${config.fields.map(field => `<th>${field.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(item => `
                <tr>
                  ${config.fields.map(field => `
                  <td>${formatValue(item[field.key], field.key)}</td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

        ${exportType === 'inventory' ? `
          <div class="summary">
            <h3>Resumen del Inventario</h3>
            <p>• Total de Productos: ${data.length}</p>
              <p>• Productos con Stock Bajo: ${data.filter(item => (parseInt(item.stock) || 0) <= (parseInt(item.minStock) || 0)).length}</p>
              <p>• Valor Total del Inventario: $${calculateInventoryValue(data).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>© ${new Date().getFullYear()} - Sistema de Gestión</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Imprimir Reporte
          </button>
        </div>
        </body>
      </html>
    `;

    // Escribir el contenido en la ventana de impresión
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Exportación de Datos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab label="Ventas" icon={<AttachMoney />} />
            <Tab label="Inventario" icon={<Inventory />} />
            <Tab label="Clientes" icon={<People />} />
          </Tabs>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Reporte</InputLabel>
                <Select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                >
                  {Object.entries(exportTypes)
                    .filter(([key, value]) => {
                      if (selectedTab === 0) return key.includes('sales');
                      if (selectedTab === 1) return key.includes('inventory') || key.includes('Stock');
                      if (selectedTab === 2) return key.includes('customer');
                      return true;
                    })
                    .map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {value.icon}
                          <Typography>{value.label}</Typography>
                        </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha Inicio"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha Fin"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Formato de Exportación
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant={exportFormat === 'csv' ? 'contained' : 'outlined'}
                  startIcon={<CsvIcon />}
                  onClick={() => setExportFormat('csv')}
                >
                  CSV
                </Button>
                <Button
                  variant={exportFormat === 'pdf' ? 'contained' : 'outlined'}
                  startIcon={<PdfIcon />}
                  onClick={() => setExportFormat('pdf')}
                >
                  PDF
                </Button>
                <Button
                  variant={exportFormat === 'print' ? 'contained' : 'outlined'}
                  startIcon={<PrintIcon />}
                  onClick={() => setExportFormat('print')}
                >
                  Imprimir
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <DownloadIcon />}
                onClick={handleExport}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Generando reporte...' : `Exportar ${exportTypes[exportType].label}`}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DataExport; 