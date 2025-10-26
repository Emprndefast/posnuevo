import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Fab,
  Drawer,
  Chip,
  CircularProgress,
  useTheme,
  Alert,
  Button,
} from '@mui/material';
import {
  Send,
  Mic,
  Close,
  SmartToy,
  TrendingUp,
  AddCircle,
  Receipt,
  Inventory,
  Settings,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContextMongo';
import { usePermissions } from '../../context/PermissionsContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { generateResponseFromHuggingFace } from '../../huggingFaceService';

// Funciones auxiliares para obtener datos con timeout
const getDataWithTimeout = async (dataPromise, timeoutMs = 10000) => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Tiempo de espera agotado')), timeoutMs);
    });

    return await Promise.race([dataPromise, timeoutPromise]);
  } catch (error) {
    if (error.message === 'Tiempo de espera agotado') {
      console.error('La operación tardó demasiado tiempo');
    }
    throw error;
  }
};

const getInventoryData = async (userId) => {
  try {
    const inventoryPromise = new Promise(async (resolve, reject) => {
      try {
        const q = query(
          collection(db, 'products'),
          where('userId', '==', userId),
          orderBy('stock', 'asc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        resolve(products);
      } catch (error) {
        reject(error);
      }
    });

    return await getDataWithTimeout(inventoryPromise);
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    throw new Error('No se pudo obtener la información del inventario');
  }
};

const getSalesData = async (userId, days = 7) => {
  try {
    const salesPromise = new Promise(async (resolve, reject) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const q = query(
          collection(db, 'sales'),
          where('userId', '==', userId),
          where('date', '>=', startDate),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const sales = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        resolve(sales);
      } catch (error) {
        reject(error);
      }
    });

    return await getDataWithTimeout(salesPromise);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw new Error('No se pudo obtener la información de ventas');
  }
};

const getLowStockProducts = async (userId) => {
  try {
    const lowStockPromise = new Promise(async (resolve, reject) => {
      try {
        const q = query(
          collection(db, 'products'),
          where('userId', '==', userId),
          where('stock', '<=', 10),
          orderBy('stock', 'asc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        resolve(products);
      } catch (error) {
        reject(error);
      }
    });

    return await getDataWithTimeout(lowStockPromise);
  } catch (error) {
    console.error('Error al obtener productos con bajo stock:', error);
    throw new Error('No se pudo obtener la información de productos con bajo stock');
  }
};

const searchProduct = async (userId, searchTerm) => {
  try {
    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(5)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al buscar producto:', error);
    throw new Error('No se pudo buscar el producto');
  }
};

const getTopSellingProducts = async (userId, days = 7) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const q = query(
      collection(db, 'sales'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    const sales = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Agrupar productos por cantidad vendida
    const productSales = {};
    sales.forEach(sale => {
      if (sale.items) {
        sale.items.forEach(item => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              name: item.name,
              quantity: 0,
              total: 0
            };
          }
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].total += item.price * item.quantity;
        });
      }
    });

    // Convertir a array y ordenar por cantidad
    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    throw new Error('No se pudo obtener los productos más vendidos');
  }
};

// Contexto general del POS
const POS_CONTEXT = `
Este sistema POS (Punto de Venta) es una solución integral para la gestión de comercios. Permite:
- Registrar ventas y controlar caja
- Gestionar inventario y productos
- Administrar clientes y proveedores
- Generar reportes de ventas, inventario y caja
- Controlar usuarios y permisos
- Realizar cierres de turno y arqueos de caja
- Configurar impuestos, moneda y preferencias del sistema
- Exportar datos y consultar historial

Módulos principales:
1. Ventas: Registro rápido, búsqueda de productos, descuentos, tickets y facturación.
2. Inventario: Altas, bajas, ajustes, stock mínimo, alertas y valorización.
3. Productos: Catálogo, precios, códigos de barras, categorías y variantes.
4. Clientes: Registro, historial de compras, saldos y contacto.
5. Proveedores: Registro, historial de compras y cuentas por pagar.
6. Caja: Apertura, cierre, arqueo, ingresos y egresos.
7. Reportes: Ventas por fecha, producto, usuario, inventario, caja y más.
8. Usuarios: Roles, permisos y auditoría de acciones.
9. Configuración: Datos de la empresa, impuestos, moneda, impresión y más.
`;

const FAQS = [
  {
    keywords: ['cómo registro una venta', 'registrar venta', 'hacer una venta', 'nueva venta'],
    answer: 'Para registrar una venta, ve al módulo "Ventas", escanea o busca los productos, selecciona el cliente (opcional), elige el método de pago y haz clic en "Finalizar venta". El sistema generará un ticket o factura automáticamente.'
  },
  {
    keywords: ['cómo agrego un producto', 'agregar producto', 'nuevo producto'],
    answer: 'Para agregar un producto, entra al módulo "Productos" y haz clic en "+ Agregar producto". Completa los datos como nombre, precio, stock, categoría y guarda los cambios.'
  },
  {
    keywords: ['cómo consulto el inventario', 'consultar inventario', 'ver inventario'],
    answer: 'Para consultar el inventario, accede al módulo "Inventario". Allí verás la lista de productos, su stock actual, valor y alertas de bajo stock.'
  },
  {
    keywords: ['cómo modifico un precio', 'modificar precio', 'cambiar precio'],
    answer: 'Para modificar el precio de un producto, ve a "Productos", busca el producto, haz clic en "Editar" y actualiza el precio. Guarda los cambios para que se reflejen en ventas futuras.'
  },
  {
    keywords: ['cómo cierro turno', 'cierre de turno', 'cerrar caja'],
    answer: 'Para cerrar turno, ve al módulo "Caja" y selecciona "Cerrar turno". El sistema te mostrará un resumen de ventas, ingresos y egresos. Confirma para finalizar el turno y generar el reporte.'
  },
  {
    keywords: ['cómo registro un cliente', 'agregar cliente', 'nuevo cliente'],
    answer: 'Para registrar un cliente, entra al módulo "Clientes" y haz clic en "+ Agregar cliente". Completa los datos y guarda. Así podrás asociar ventas y llevar historial.'
  },
  {
    keywords: ['cómo consulto ventas por fecha', 'ventas por fecha', 'reporte de ventas'],
    answer: 'Para consultar ventas por fecha, entra al módulo "Reportes" y selecciona el filtro de fechas. El sistema mostrará el total de ventas, productos vendidos y otros detalles.'
  },
  {
    keywords: ['cómo exporto datos', 'exportar datos', 'descargar reporte'],
    answer: 'Para exportar datos, ve a "Reportes" o "Inventario" y haz clic en el botón de exportar (generalmente un ícono de descarga). Puedes elegir formato Excel o PDF.'
  },
  {
    keywords: ['qué módulos tiene el sistema', 'módulos del sistema', 'funcionalidades'],
    answer: POS_CONTEXT
  },
  {
    keywords: ['soporte', 'ayuda', 'contacto'],
    answer: 'Si necesitas soporte, puedes consultar la documentación en línea, contactar al administrador del sistema o escribir a soporte@tupos.com.'
  },
];

// Función para normalizar texto (eliminar tildes y pasar a minúsculas)
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const getLocalResponse = async (message, context, userId, followUpEntity = null) => {
  const command = normalizeText(message.trim());
  
  try {
    // Respuestas automáticas para preguntas frecuentes
    for (const faq of FAQS) {
      if (faq.keywords.some(k => command.includes(normalizeText(k)))) {
        // Mejorar formato visual de la respuesta
        let formatted = faq.answer
          .replace(/\n/g, '\n')
          .replace(/\* /g, '• ')
          .replace(/\"/g, '"')
          .replace(/\-/g, '–');
        // Agregar emoji si es una acción principal
        if (faq.keywords.some(k => k.includes('venta'))) formatted = '🛒 ' + formatted;
        if (faq.keywords.some(k => k.includes('producto'))) formatted = '📦 ' + formatted;
        if (faq.keywords.some(k => k.includes('cliente'))) formatted = '👤 ' + formatted;
        if (faq.keywords.some(k => k.includes('proveedor'))) formatted = '🏢 ' + formatted;
        if (faq.keywords.some(k => k.includes('caja') || k.includes('turno'))) formatted = '💵 ' + formatted;
        if (faq.keywords.some(k => k.includes('reporte'))) formatted = '📊 ' + formatted;
        if (faq.keywords.some(k => k.includes('soporte') || k.includes('ayuda'))) formatted = '🆘 ' + formatted;
        return {
          text: formatted,
          suggestions: [
            { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
            { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
            { text: "Ayuda", icon: <Settings />, action: "help" },
          ]
        };
      }
    }

    // Si pregunta por módulos, funcionalidades o contexto general
    if (command.includes('módulos') || command.includes('funcionalidades') || command.includes('qué puede hacer')) {
      return {
        text: POS_CONTEXT,
        suggestions: [
          { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
          { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
          { text: "Ayuda", icon: <Settings />, action: "help" },
        ]
      };
    }

    // Comandos básicos que no requieren datos
    if (command === 'hola' || command === 'hi' || command === 'buenos días' || command === 'buenas tardes') {
      return {
        text: '¡Hola! Soy tu asistente de POS. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre:\n\n' +
          '📦 Inventario:\n' +
          '- Ver inventario completo\n' +
          '- Buscar producto específico\n' +
          '- Ver stock bajo\n\n' +
          '💰 Ventas:\n' +
          '- Ver ventas recientes\n' +
          '- Ver total de ventas\n' +
          '- Ver productos más vendidos\n\n' +
          '⚙️ Sistema:\n' +
          '- Cómo registrar una venta\n' +
          '- Cómo agregar un producto\n' +
          '- Cómo modificar precios',
        suggestions: [
          { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
          { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
          { text: "Stock bajo", icon: <TrendingUp />, action: "viewLowStock" },
        ]
      };
    }

    // Comandos de inventario
    if (command.includes('inventario') || command.includes('productos')) {
      const inventory = await getInventoryData(userId);
      if (!inventory || inventory.length === 0) {
        return {
          text: 'No hay productos en el inventario actualmente. ¿Deseas agregar uno nuevo?',
          suggestions: [
            { text: "Agregar producto", icon: <AddCircle />, action: "addProduct" },
            { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
          ]
        };
      }
      
      const totalProducts = inventory.length;
      const totalStock = inventory.reduce((sum, item) => sum + (item.stock || 0), 0);
      const totalValue = inventory.reduce((sum, item) => sum + ((item.price || 0) * (item.stock || 0)), 0);
      
      return {
        text: `📊 Resumen del Inventario:\n\n` +
          `• Total de productos: ${totalProducts}\n` +
          `• Total de unidades: ${totalStock}\n` +
          `• Valor total del inventario: $${totalValue.toFixed(2)}\n\n` +
          `Productos en inventario:\n${inventory.map(item => 
            `• ${item.name}: ${item.stock} unidades (${item.price ? `$${item.price}` : 'Precio no disponible'})`
          ).join('\n')}`,
        suggestions: [
          { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
          { text: "Stock bajo", icon: <TrendingUp />, action: "viewLowStock" },
          { text: "Agregar producto", icon: <AddCircle />, action: "addProduct" },
        ]
      };
    }

    // Comandos de ventas
    if (command.includes('ventas') || command.includes('venta')) {
      const salesData = await getSalesData(userId);
      if (!salesData || salesData.length === 0) {
        return {
          text: 'No hay ventas registradas en los últimos 7 días. ¿Deseas registrar una nueva venta?',
          suggestions: [
            { text: "Nueva venta", icon: <AddCircle />, action: "newSale" },
            { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
          ]
        };
      }
      
      const total = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const averageSale = total / salesData.length;
      const todaySales = salesData.filter(sale => {
        const saleDate = new Date(sale.date);
        const today = new Date();
        return saleDate.toDateString() === today.toDateString();
      });
      const todayTotal = todaySales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      
      return {
        text: `💰 Resumen de Ventas:\n\n` +
          `• Total de ventas (7 días): $${total.toFixed(2)}\n` +
          `• Número de transacciones: ${salesData.length}\n` +
          `• Promedio por venta: $${averageSale.toFixed(2)}\n` +
          `• Ventas de hoy: $${todayTotal.toFixed(2)}\n\n` +
          `¿Necesitas información más específica?`,
        suggestions: [
          { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
          { text: "Nueva venta", icon: <AddCircle />, action: "newSale" },
          { text: "Stock bajo", icon: <TrendingUp />, action: "viewLowStock" },
        ]
      };
    }

    // Comandos de ayuda
    if (command.includes('ayuda') || command.includes('help') || command.includes('cómo')) {
      return {
        text: '📚 Guía de Comandos:\n\n' +
          '1. Inventario:\n' +
          '   - "ver inventario": Muestra todos los productos\n' +
          '   - "stock bajo": Muestra productos con poco stock\n' +
          '   - "buscar [producto]": Busca un producto específico\n\n' +
          '2. Ventas:\n' +
          '   - "ver ventas": Muestra ventas recientes\n' +
          '   - "ventas de hoy": Muestra ventas del día\n' +
          '   - "total de ventas": Muestra el total de ventas\n\n' +
          '3. Sistema:\n' +
          '   - "cómo vender": Instrucciones para registrar una venta\n' +
          '   - "cómo agregar producto": Instrucciones para agregar productos\n' +
          '   - "cómo modificar precio": Instrucciones para cambiar precios',
        suggestions: [
          { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
          { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
          { text: "Stock bajo", icon: <TrendingUp />, action: "viewLowStock" },
        ]
      };
    }

    // Búsqueda de productos
    if (command.startsWith('buscar') || command.startsWith('encontrar')) {
      const searchTerm = command.split(' ').slice(1).join(' ');
      if (!searchTerm) {
        return {
          text: 'Por favor, especifica qué producto deseas buscar. Por ejemplo: "buscar leche"',
          suggestions: [
            { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
            { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
          ]
        };
      }

      const results = await searchProduct(userId, searchTerm);
      if (!results || results.length === 0) {
        return {
          text: `No se encontraron productos que coincidan con "${searchTerm}".`,
          suggestions: [
            { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
            { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
          ]
        };
      }

      return {
        text: `🔍 Resultados de búsqueda para "${searchTerm}":\n\n${results.map(item =>
          `• ${item.name}: ${item.stock} unidades (${item.price ? `$${item.price}` : 'Precio no disponible'})`
        ).join('\n')}`,
        suggestions: [
          { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
          { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
        ]
      };
    }

    // Productos más vendidos
    if (command.includes('más vendidos') || command.includes('top ventas')) {
      const topProducts = await getTopSellingProducts(userId);
      if (!topProducts || topProducts.length === 0) {
        return {
          text: 'No hay datos de ventas suficientes para mostrar los productos más vendidos.',
          suggestions: [
            { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
            { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
          ]
        };
      }

      return {
        text: `🏆 Productos más vendidos (últimos 7 días):\n\n${topProducts.map((item, index) =>
          `${index + 1}. ${item.name}: ${item.quantity} unidades vendidas ($${item.total.toFixed(2)})`
        ).join('\n')}`,
        suggestions: [
          { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
          { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
        ]
      };
    }

    // Mensaje por defecto si no se reconoce el comando
    return {
      text: 'No entendí tu consulta. Por favor, intenta con alguno de estos comandos:\n\n' +
        '• "ver inventario"\n' +
        '• "ver ventas"\n' +
        '• "stock bajo"\n' +
        '• "ayuda" para ver todos los comandos disponibles',
      suggestions: [
        { text: "Ver inventario", icon: <Inventory />, action: "viewInventory" },
        { text: "Ver ventas", icon: <Receipt />, action: "viewSales" },
        { text: "Ayuda", icon: <Settings />, action: "help" },
      ]
    };

  } catch (error) {
    console.error('Error en respuesta local:', error);
    throw new Error(
      error.message === 'Tiempo de espera agotado' 
        ? 'La consulta está tardando demasiado. Por favor, intenta nuevamente.' 
        : 'No se pudo procesar tu consulta. Por favor, intenta con un comando más simple como "hola", "inventario" o "ventas".'
    );
  }
};

// ===================== MEJORAS AVANZADAS IA POS =====================
// 1. Función para predecir ventas de la próxima semana (simple, usando promedio)
const predictNextWeekSales = async (userId) => {
  try {
    const salesPromise = new Promise(async (resolve, reject) => {
      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // Últimos 30 días
        const q = query(
          collection(db, 'sales'),
          where('userId', '==', userId),
          where('date', '>=', startDate),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const sales = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        resolve(sales);
      } catch (error) {
        reject(error);
      }
    });
    const salesData = await getDataWithTimeout(salesPromise);
    if (!salesData || salesData.length === 0) return 0;
    // Agrupar ventas por semana
    const weeks = {};
    salesData.forEach(sale => {
      const week = format(sale.date.toDate ? sale.date.toDate() : sale.date, 'yyyy-ww');
      if (!weeks[week]) weeks[week] = 0;
      weeks[week] += sale.total || 0;
    });
    const weekTotals = Object.values(weeks);
    const avg = weekTotals.reduce((a, b) => a + b, 0) / weekTotals.length;
    return avg;
  } catch (error) {
    return 0;
  }
};

// 2. Función para predecir productos que se agotarán pronto (stock <= 10 y ventas promedio alta)
const predictLowStockSoon = async (userId) => {
  try {
    const productsPromise = new Promise(async (resolve, reject) => {
      try {
        const q = query(
          collection(db, 'products'),
          where('userId', '==', userId),
          where('stock', '<=', 20),
          orderBy('stock', 'asc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        resolve(products);
      } catch (error) {
        reject(error);
      }
    });
    const products = await getDataWithTimeout(productsPromise);
    // Aquí podrías cruzar con ventas históricas para mayor precisión
    return products;
  } catch (error) {
    return [];
  }
};

// 3. Comandos inteligentes y resúmenes automáticos por ruta
const getSmartCommandResponse = async (command, userId, location) => {
  // Comando: reporte de ventas
  if (command.includes('reporte de ventas')) {
    const salesData = await getSalesData(userId, 7);
    const total = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
    return {
      text: `📝 Reporte de ventas (últimos 7 días):\n- Total: $${total.toFixed(2)}\n- Transacciones: ${salesData.length}`,
      suggestions: [
        { text: 'Ver inventario', action: 'viewInventory' },
        { text: 'Stock bajo', action: 'viewLowStock' },
      ]
    };
  }
  // Comando: agregar producto
  if (command.includes('agrega producto') || command.includes('nuevo producto')) {
    return {
      text: 'Para agregar un producto, haz clic en el botón "+ Agregar Producto" en la pantalla principal o ve a la sección Productos.',
      suggestions: [
        { text: 'Ir a Productos', action: 'goToProducts' },
      ]
    };
  }
  // Comando: resumen de turno
  if (command.includes('resumen de turno') || command.includes('cierra turno')) {
    const salesData = await getSalesData(userId, 1);
    const total = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
    return {
      text: `🔒 Resumen de turno (hoy):\n- Total ventas: $${total.toFixed(2)}\n- Transacciones: ${salesData.length}`,
      suggestions: [
        { text: 'Ver ventas', action: 'viewSales' },
      ]
    };
  }
  // Comando: predicción de ventas
  if (command.includes('predicción de ventas') || command.includes('predecir ventas')) {
    const pred = await predictNextWeekSales(userId);
    return {
      text: `🔮 Predicción: Se estima que venderás aproximadamente $${pred.toFixed(2)} la próxima semana (basado en tu historial).`,
      suggestions: [
        { text: 'Ver ventas', action: 'viewSales' },
      ]
    };
  }
  // Comando: productos que se agotarán pronto
  if (command.includes('agotarán pronto') || command.includes('agotarse pronto')) {
    const products = await predictLowStockSoon(userId);
    if (!products.length) return { text: 'No se detectan productos en riesgo de agotarse pronto.', suggestions: [] };
    return {
      text: `⚠️ Productos en riesgo de agotarse:\n${products.map(p => `• ${p.name}: ${p.stock} unidades`).join('\n')}`,
      suggestions: [
        { text: 'Ver inventario', action: 'viewInventory' },
      ]
    };
  }
  // Comando: resumen automático por ruta
  if (location && location.includes('/ventas')) {
    const salesData = await getSalesData(userId, 1);
    const total = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
    return {
      text: `Hoy llevas $${total.toFixed(2)} en ventas. ¿Quieres ver un reporte detallado?`,
      suggestions: [
        { text: 'Reporte de ventas', action: 'reportSales' },
      ]
    };
  }
  if (location && location.includes('/inventario')) {
    const inventory = await getInventoryData(userId);
    return {
      text: `Tienes ${inventory.length} productos en inventario. ¿Deseas ver los que tienen bajo stock?`,
      suggestions: [
        { text: 'Stock bajo', action: 'viewLowStock' },
      ]
    };
  }
  return null;
};

// 4. Mejorar el prompt de OpenAI con contexto real y por ruta
// (Se agrega más información relevante y personalizada)
// ===================== FIN MEJORAS AVANZADAS IA POS =====================

// Modificar getAssistantResponse para usar las nuevas funciones inteligentes y contexto avanzado
const getAssistantResponse = async (message, context, userRole, userId, chatHistory = []) => {
  try {
    // 1. Comandos inteligentes y resúmenes automáticos
    const smartResp = await getSmartCommandResponse(message.toLowerCase(), userId, context);
    if (smartResp) return smartResp;

    // 2. Prompt mejorado para OpenAI
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return await getLocalResponse(message, context, userId);
    }

    // Recopilar contexto adicional según la ruta
    let additionalInfo = '';
    if (context && context.includes('/ventas')) {
      const salesData = await getSalesData(userId, 1);
      const total = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
      additionalInfo += `\nHoy: $${total.toFixed(2)} en ventas.`;
    }
    if (context && context.includes('/inventario')) {
      const inventory = await getInventoryData(userId);
      additionalInfo += `\nInventario actual: ${inventory.length} productos.`;
    }
    if (context && context.includes('/clientes')) {
      additionalInfo += '\nEstás en la sección de clientes.';
    }
    // Historial conversacional (últimos 3 mensajes)
    const pastMessages = (chatHistory || []).slice(-3).map(m => ({
      role: m.type === 'user' ? 'user' : 'assistant',
      content: m.text
    }));
    // Prompt mejorado con información del POS y contexto de ruta
    const systemPrompt = `Eres un asistente inteligente para un sistema POS moderno.\n` +
      `El usuario tiene el rol: ${userRole || 'usuario'}.\n` +
      `Estás ayudando al usuario en la sección: ${context}.\n` +
      `Datos adicionales: ${additionalInfo}.\n` +
      `\n**Comandos inteligentes disponibles:**\n` +
      `- "reporte de ventas"\n- "agrega producto"\n- "resumen de turno"\n- "predicción de ventas"\n- "productos que se agotarán pronto"\n` +
      `\nBrinda respuestas claras, útiles y breves. Si el usuario pregunta sobre una funcionalidad o página, explícale cómo acceder a ella y qué puede hacer allí.`;
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...pastMessages,
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Respuesta inválida del servidor');
      }
      const text = response.data.choices[0].message.content.trim();
      // Sugerencias contextuales
      const suggestions = [
        { text: "Ver inventario", value: "ver inventario" },
        { text: "Ventas recientes", value: "ver ventas" },
        { text: "Stock bajo", value: "stock bajo" },
      ];
      return {
        text,
        suggestions
      };
    } catch (axiosError) {
      if (axiosError.response?.status === 401) {
        throw new Error('La clave API de OpenAI no es válida. Por favor, verifica la configuración.');
      } else if (axiosError.response?.status === 429) {
        throw new Error('Se ha excedido el límite de solicitudes. Por favor, espera unos minutos.');
      } else if (axiosError.code === 'ECONNABORTED') {
        throw new Error('La solicitud ha tardado demasiado. Por favor, intenta nuevamente.');
      }
      throw new Error('Error al comunicarse con el servicio de IA. Por favor, intenta más tarde.');
    }
  } catch (error) {
    return await getLocalResponse(message, context, userId);
  }
};

const quickReplies = [
  "¿Cómo registro una venta?",
  "¿Cómo consulto el inventario?",
  "¿Qué productos tienen bajo stock?"
];

const AIAssistant = () => {
  const theme = useTheme();
  const location = useLocation();
  const { user } = useAuth();
  const { userRole } = usePermissions();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de POS. ¿En qué puedo ayudarte hoy? 😊',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setError(null);
    setIsLoading(true);

    try {
      // Usar solo la función local para responder
      const response = await getLocalResponse(userInput, location.pathname, user?.uid);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.text }]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ocurrió un error al generar la respuesta local. Por favor, intenta nuevamente.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="assistant"
        onClick={() => setIsOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <SmartToy />
      </Fab>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: '350px',
            maxWidth: '100%',
            borderRadius: '16px 0 0 16px',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          bgcolor: theme.palette.background.default
        }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SmartToy color="primary" />
              <Typography variant="h6">Asistente IA</Typography>
            </Box>
            <IconButton onClick={() => setIsOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {/* Sugerencias rápidas */}
          <Box sx={{ display: 'flex', gap: 1, p: 2, pt: 1 }}>
            {quickReplies.map((text, idx) => (
              <Button
                key={idx}
                variant="outlined"
                size="small"
                onClick={() => setUserInput(text)}
                disabled={isLoading}
              >
                {text}
              </Button>
            ))}
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              onClick={() => setMessages([{ role: 'assistant', content: '¡Hola! Soy tu asistente de POS. ¿En qué puedo ayudarte hoy? 😊' }])}
              disabled={isLoading}
            >
              Borrar chat
            </Button>
          </Box>

          {/* Chat Area */}
          <Box sx={{ 
            flexGrow: 1, 
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    borderRadius: 2
                  }}
                >
                  <Typography>{msg.content}</Typography>
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Escribe tu pregunta..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                error={!!error}
                multiline
                maxRows={4}
              />
              <IconButton 
                color="primary" 
                onClick={handleSend}
                disabled={!userInput.trim() || isLoading}
              >
                <Send />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default AIAssistant;
