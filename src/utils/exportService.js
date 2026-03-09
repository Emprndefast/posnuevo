/**
 * exportService.js — Servicio centralizado de exportación profesional POSENT PRO
 * 
 * Versión 2.0 - SaaS Premium Edit
 * Optimizaciones: Carga por lotes, Índices automáticos, Agrupación semántica y KPIs Financieros.
 */

import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── LAZY IMPORTS ─────────────────────────────────────────────────────────────
const getJsPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    return jsPDF;
};

const getXLSX = async () => {
    const XLSX = await import('xlsx');
    return XLSX;
};

// ─── CONSTANTES DE DISEÑO ──────────────────────────────────────────────────────
const BRAND = {
    primary: [200, 0, 0],      // Rojo POSENT
    dark: [120, 0, 0],
    light: [255, 245, 245],    // Fondo sutil
    gray: [100, 100, 110],
    lightGray: [248, 249, 250],
    white: [255, 255, 255],
    black: [20, 20, 25],
    success: [16, 185, 129],   // Verde SaaS
    error: [239, 68, 68],      // Rojo sutil
    warning: [245, 158, 11],
    border: [225, 226, 230],
};

// ─── HELPERS DE FORMATEO ───────────────────────────────────────────────────────
const fmtCurrency = (val) => {
    const n = parseFloat(val) || 0;
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n);
};

const today = () => format(new Date(), 'dd/MM/yyyy', { locale: es });
const todayFile = () => format(new Date(), 'dd-MM-yyyy');

/**
 * Carga una imagen y la redimensiona vía Canvas a Base64
 * Optimizada para no saturar memoria del PDF
 */
const loadImageAsBase64 = (url) =>
    new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const maxSize = 250; // Resolución ideal para impresión sutil
                const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
                canvas.width = Math.round(img.width * ratio);
                canvas.height = Math.round(img.height * ratio);
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            } catch { resolve(null); }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });

/**
 * Carga imágenes por lotes para evitar bloqueos del Main Thread
 */
const loadImagesInBatches = async (products, batchSize = 8) => {
    const results = {};
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const loaded = await Promise.all(
            batch.map(async (p) => {
                const id = p._id || p.id || p.codigo || Math.random();
                const data = await loadImageAsBase64(p.imagen || p.imageUrl || p.image);
                return { id, data };
            })
        );
        loaded.forEach(item => { if (item.data) results[item.id] = item.data; });
    }
    return results;
};

// ─── COMPONENTES PDF REUTILIZABLES ───────────────────────────────────────────
const drawPDFHeader = (doc, title, subtitle = '') => {
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(...BRAND.primary);
    doc.rect(0, 0, W, 24, 'F');
    doc.setTextColor(...BRAND.white);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('POSENT PRO', 14, 15);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Reporte Oficial · ${today()}`, W - 14, 15, { align: 'right' });

    doc.setTextColor(...BRAND.black);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 38);
    if (subtitle) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BRAND.gray);
        doc.text(subtitle, 14, 45);
    }
    return subtitle ? 55 : 50;
};

const drawPDFFooter = (doc) => {
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFillColor(...BRAND.lightGray);
        doc.rect(0, H - 12, W, 12, 'F');
        doc.setTextColor(...BRAND.gray);
        doc.setFontSize(8);
        doc.text('POSENT PRO — SaaS de Gestión Inteligente', 14, H - 5);
        doc.text(`Página ${i} de ${pages}`, W - 14, H - 5, { align: 'right' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  1. PRODUCTOS — PDF CATÁLOGO PROFESIONAL (Agrupado + Índice)
// ═══════════════════════════════════════════════════════════════════════════════
export const exportProductsCatalogPDF = async (productsRaw, businessName = 'Mi Negocio', filters = {}) => {
    const jsPDF = await getJsPDF();

    // A. APLICAR FILTROS
    let products = [...productsRaw];
    if (filters.category) {
        products = products.filter(p => (p.categoria || p.category) === filters.category);
    }
    if (filters.onlyStock) {
        products = products.filter(p => (parseInt(p.stock_actual || p.stock) || 0) > 0);
    }
    if (filters.minPrice) {
        products = products.filter(p => (parseFloat(p.precio || p.price) || 0) >= filters.minPrice);
    }

    // B. AGRUPACIÓN POR CATEGORÍA
    const grouped = products.reduce((acc, p) => {
        const cat = (p.categoria || p.category || 'Sin Categoría').trim();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});
    const categories = Object.keys(grouped).sort();

    // C. PRECARGA DE IMÁGENES (BATCH LOADING)
    const imgDataMap = await loadImagesInBatches(products, 10);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // ── PÁGINA 1: ÍNDICE AUTOMÁTICO ───────────────────────────────────────────
    drawPDFHeader(doc, 'Índice del Catálogo', businessName);
    let indexY = 65;
    doc.setFontSize(11);
    doc.setTextColor(...BRAND.black);

    const categoryPageMap = {};

    categories.forEach(cat => {
        doc.setFont('helvetica', 'bold');
        doc.text(cat.toUpperCase(), 20, indexY);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BRAND.gray);
        // Línea de puntos estética
        const lineW = W - 60;
        doc.text('. '.repeat(50), 65, indexY);
        // El número de página se calculará después, de momento espacio vacío
        categoryPageMap[cat] = { y: indexY };
        indexY += 10;
    });

    // ── GENERACIÓN DE CONTENIDO ────────────────────────────────────────────────
    const CARD_W = (W - 20) / 2;
    const CARD_H = 50;
    const MARGIN = 7;
    const IMG_SIZE = 42;

    categories.forEach((cat) => {
        doc.addPage();
        const currentPage = doc.internal.getNumberOfPages();
        categoryPageMap[cat].page = currentPage;

        let y = drawPDFHeader(doc, `Categoría: ${cat.toUpperCase()}`, businessName);
        y += 5;

        let col = 0;
        let row = 0;

        grouped[cat].forEach((p) => {
            const cx = MARGIN + col * (CARD_W + MARGIN / 2);
            const cy = y + row * (CARD_H + MARGIN);

            if (cy + CARD_H > H - 20) {
                doc.addPage();
                y = drawPDFHeader(doc, `Categoría: ${cat.toUpperCase()} (cont.)`, businessName);
                y += 5;
                col = 0; row = 0;
            }

            const drawX = MARGIN + col * (CARD_W + MARGIN / 2);
            const drawY = y + row * (CARD_H + MARGIN);

            // Card Background
            doc.setFillColor(...BRAND.white);
            doc.setDrawColor(...BRAND.border);
            doc.roundedRect(drawX, drawY, CARD_W, CARD_H, 2, 2, 'FD');

            // Image
            const pid = p._id || p.id || p.codigo;
            const img = imgDataMap[pid];
            if (img) {
                doc.addImage(img, 'JPEG', drawX + 4, drawY + 4, CARD_H - 8, CARD_H - 8);
            } else {
                doc.setFillColor(...BRAND.lightGray);
                doc.rect(drawX + 4, drawY + 4, CARD_H - 8, CARD_H - 8, 'F');
            }

            // Metadata
            const tx = drawX + CARD_H + 2;
            const tw = CARD_W - CARD_H - 8;

            doc.setTextColor(...BRAND.black);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            const nombre = (p.nombre || p.name || 'Producto').substring(0, 45);
            doc.text(doc.splitTextToSize(nombre, tw), tx, drawY + 12);

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...BRAND.gray);
            doc.text(`SKU: ${p.codigo || 'S/C'}`, tx, drawY + 22);

            // Badge Estado
            const stock = parseInt(p.stock_actual || p.stock) || 0;
            const isOk = stock > 0;
            doc.setFillColor(...(isOk ? BRAND.success : BRAND.error));
            doc.roundedRect(tx, drawY + 26, 22, 5, 1, 1, 'F');
            doc.setTextColor(...BRAND.white);
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'bold');
            doc.text(isOk ? 'DISPONIBLE' : 'AGOTADO', tx + 11, drawY + 29.5, { align: 'center' });

            // Precio Pro
            doc.setTextColor(...BRAND.primary);
            doc.setFontSize(14);
            doc.text(fmtCurrency(p.precio || p.price), tx, drawY + 42);

            col++;
            if (col >= 2) { col = 0; row++; }
        });
    });

    // ── RELLENAR NÚMEROS DE PÁGINA EN EL ÍNDICE ───────────────────────────────
    doc.setPage(1);
    doc.setTextColor(...BRAND.black);
    doc.setFont('helvetica', 'bold');
    categories.forEach(cat => {
        const info = categoryPageMap[cat];
        doc.text(info.page.toString(), W - 25, info.y, { align: 'right' });
    });

    drawPDFFooter(doc);
    saveAs(doc.output('blob'), `catalogo-profesional-${todayFile()}.pdf`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  2. PRODUCTOS — EXCEL CONTABILIDAD (Multi-hoja + Cálculos Financieros)
// ═══════════════════════════════════════════════════════════════════════════════
export const exportProductsExcel = async (products) => {
    const XLSX = await getXLSX();
    const wb = XLSX.utils.book_new();

    // Hoja 1: Inventario Completo con Cálculos
    const inventoryRows = products.map((p, i) => {
        const pVenta = parseFloat(p.precio || p.price) || 0;
        const pCompra = parseFloat(p.costo || p.precio_compra) || 0;
        const ganancia = pVenta - pCompra;
        const margen = pVenta > 0 ? (ganancia / pVenta) : 0;
        const stock = parseInt(p.stock_actual || p.stock) || 0;

        return {
            '#': i + 1,
            'SKU': p.codigo || '',
            'Producto': p.nombre || '',
            'Categoría': p.categoria || '',
            'Stock': stock,
            'Costo Unit.': pCompra,
            'Precio Venta': pVenta,
            'Ganancia Unit.': ganancia,
            'Margen (%)': (margen * 100).toFixed(1) + '%',
            'Valor Inventario (Costo)': stock * pCompra,
            'Valor Inventario (Venta)': stock * pVenta,
            'Estado': stock > 0 ? 'Disponible' : 'Sin Stock'
        };
    });
    const ws1 = XLSX.utils.json_to_sheet(inventoryRows);
    XLSX.utils.book_append_sheet(wb, ws1, 'Inventario Completo');

    // Hoja 2: Resumen Ejecutivo
    const totalCosto = inventoryRows.reduce((s, r) => s + r['Valor Inventario (Costo)'], 0);
    const totalVenta = inventoryRows.reduce((s, r) => s + r['Valor Inventario (Venta)'], 0);
    const summaryData = [
        ['RESUMEN FINANCIERO DE INVENTARIO'],
        ['Fecha de Corte', today()],
        [],
        ['Métrica', 'Valor'],
        ['Total SKUs', products.length],
        ['Valor Total (Precio Costo)', totalCosto],
        ['Valor Total (Precio Venta)', totalVenta],
        ['Plusvalía Potencial', totalVenta - totalCosto],
        ['Margen Promedio', ((totalVenta - totalCosto) / totalVenta * 100).toFixed(2) + '%'],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');

    // Hoja 3: Alertas de Stock Bajo
    const lowStock = inventoryRows.filter(r => r['Stock'] < 10);
    const ws3 = XLSX.utils.json_to_sheet(lowStock);
    XLSX.utils.book_append_sheet(wb, ws3, 'Stock Bajo');

    // Hoja 4: Valor por Categoría
    const catMap = inventoryRows.reduce((acc, r) => {
        const c = r['Categoría'] || 'General';
        if (!acc[c]) acc[c] = { items: 0, valor: 0 };
        acc[c].items++;
        acc[c].valor += r['Valor Inventario (Venta)'];
        return acc;
    }, {});
    const catRows = Object.keys(catMap).map(c => ({
        'Categoría': c,
        'Productos': catMap[c].items,
        'Valor Total': catMap[c].valor
    }));
    const ws4 = XLSX.utils.json_to_sheet(catRows);
    XLSX.utils.book_append_sheet(wb, ws4, 'Valor por Categoría');

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `POSENT-Contable-${todayFile()}.xlsx`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  3. ANALYTICS — PDF PROFESIONAL (Visual & KPIs)
// ═══════════════════════════════════════════════════════════════════════════════
export const exportAnalyticsPDF = async (data, rangeLabel = '') => {
    const jsPDF = await getJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();

    const { summary: s, tables, period } = data;
    const pText = period?.startDate ? `${format(new Date(period.startDate), 'dd/MM/yyyy')} - ${format(new Date(period.endDate), 'dd/MM/yyyy')}` : rangeLabel;

    let y = drawPDFHeader(doc, 'Análisis de Rendimiento', pText);
    y += 5;

    // KPIs Visuales
    const kpis = [
        { L: 'Ingresos Totales', V: fmtCurrency(s.totalRevenue), C: BRAND.success },
        { L: 'Promedio Ticket', V: fmtCurrency(s.avgTicket), C: BRAND.primary },
        { L: 'Pedidos', V: String(s.totalOrders), C: BRAND.black },
        { L: 'Crecimiento', V: `${s.revenueTrend > 0 ? '+' : ''}${s.revenueTrend.toFixed(1)}%`, C: s.revenueTrend >= 0 ? BRAND.success : BRAND.error }
    ];

    kpis.forEach((k, i) => {
        const kw = (W - 35) / 2;
        const kx = 14 + (i % 2) * (kw + 7);
        const ky = y + Math.floor(i / 2) * 22;

        doc.setFillColor(...BRAND.lightGray);
        doc.roundedRect(kx, ky, kw, 18, 2, 2, 'F');
        doc.setTextColor(...BRAND.gray);
        doc.setFontSize(8);
        doc.text(k.L.toUpperCase(), kx + 5, ky + 6);
        doc.setTextColor(...k.C);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(k.V, kx + 5, ky + 14);
    });

    y += 50;

    // Tabla Top Productos
    if (tables?.topProducts?.length) {
        doc.setTextColor(...BRAND.black);
        doc.setFontSize(12);
        doc.text('Productos de Mayor Impacto', 14, y);
        doc.autoTable({
            startY: y + 5,
            head: [['Producto', 'Vendidos', 'Ingresos', '% Aporte']],
            body: tables.topProducts.slice(0, 10).map(p => {
                const pct = s.totalRevenue > 0 ? ((p.revenue / s.totalRevenue) * 100).toFixed(1) + '%' : '0%';
                return [p.name, p.quantity, fmtCurrency(p.revenue), pct];
            }),
            headStyles: { fillColor: BRAND.primary },
            margin: { left: 14, right: 14 }
        });
    }

    drawPDFFooter(doc);
    saveAs(doc.output('blob'), `POSENT-Analytics-${todayFile()}.pdf`);
};

/**
 * EXCEL ANALYTICS - Datos contables
 */
export const exportAnalyticsExcel = async (rawData, rangeLabel = '') => {
    const XLSX = await getXLSX();
    const wb = XLSX.utils.book_new();
    const { summary: s, tables, saleDetails } = rawData || {};

    // Hoja 1: Resumen
    const summarySheet = [
        ['REPORTE DE VENTAS - POSENT PRO'],
        ['Período', rangeLabel],
        ['Generado', today()],
        [],
        ['Métrica', 'Valor'],
        ['Facturación Total', s.totalRevenue],
        ['Total Pedidos', s.totalOrders],
        ['Ticket Promedio', s.avgTicket],
        ['Unidades Vendidas', s.totalItems],
        ['Crecimiento (%)', s.revenueTrend]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summarySheet), 'Resumen Ejecutivo');

    // Hoja 2: Top Productos
    if (tables?.topProducts) {
        const prodRows = tables.topProducts.map(p => ({
            'Producto': p.name,
            'Unidades': p.quantity,
            'Ingresos': p.revenue
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodRows), 'Top Productos');
    }

    // Hoja 3: Detalle de Ventas
    if (saleDetails) {
        const details = saleDetails.map(d => ({
            'Referencia': d.numero || d.id,
            'Fecha': d.fecha,
            'Cliente': d.cliente,
            'Pago': d.metodo_pago,
            'Total': d.total
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(details), 'Detalle Transacciones');
    }

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Analytics-Contable-${todayFile()}.xlsx`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  4. VENTAS DETALLADAS — EXCEL
// ═══════════════════════════════════════════════════════════════════════════════
export const exportSalesExcel = async (sales, label = '') => {
    const XLSX = await getXLSX();
    const rows = (Array.isArray(sales) ? sales : []).map(s => ({
        'Fecha': format(new Date(s.fecha), 'dd/MM/yyyy HH:mm'),
        'Ticket': s.numero_venta || s._id?.toString().slice(-6),
        'Cliente': s.cliente_nombre || 'General',
        'Método': s.metodo_pago,
        'Subtotal': s.subtotal,
        'Total': s.total,
        'Estado': s.estado
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Ventas-${label || todayFile()}.xlsx`);
};

// Mantenemos compatibilidad con el nombre anterior si fuera necesario
export const handleExportAnalytics = exportAnalyticsPDF;
