/**
 * exportService.js — Servicio centralizado de exportación profesional POSENT
 *
 * Módulos:
 *  - exportProductsCatalogPDF   → PDF catálogo visual con imágenes (para publicidad/socios)
 *  - exportProductsExcel        → Excel con todos los campos de inventario (contabilidad)
 *  - exportAnalyticsPDF         → PDF reporte de ventas por período (para socios / prueba)
 *  - exportAnalyticsExcel       → Excel con ventas por período (contabilidad)
 *  - exportSalesExcel           → Excel detallado de ventas
 *
 * Dependencias ya instaladas:
 *  - jspdf + jspdf-autotable   → PDF profesional
 *  - xlsx                       → Excel
 *  - file-saver                 → Descarga
 */

import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Lazy imports para reducir bundle inicial ─────────────────────────────────
const getJsPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    return jsPDF;
};

const getXLSX = async () => {
    const XLSX = await import('xlsx');
    return XLSX;
};

// ─── Estilos corporativos ──────────────────────────────────────────────────────
const BRAND = {
    primary: [200, 0, 0],      // Rojo POSENT
    dark: [140, 0, 0],
    light: [255, 235, 235],
    gray: [100, 100, 100],
    lightGray: [245, 245, 245],
    white: [255, 255, 255],
    black: [30, 30, 30],
    success: [16, 185, 129],
    warning: [245, 158, 11],
    text: [50, 50, 50],
};

const fmt = (val) => {
    if (val === undefined || val === null) return '—';
    if (typeof val === 'number') return val.toLocaleString('es-DO', { minimumFractionDigits: 2 });
    return String(val);
};

const fmtCurrency = (val) => {
    const n = parseFloat(val) || 0;
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(n);
};

const today = () => format(new Date(), 'dd/MM/yyyy', { locale: es });
const todayFile = () => format(new Date(), 'dd-MM-yyyy');

// ─── Helper: Encabezado corporativo PDF ───────────────────────────────────────
const drawPDFHeader = (doc, title, subtitle = '') => {
    const W = doc.internal.pageSize.getWidth();

    // Barra superior roja
    doc.setFillColor(...BRAND.primary);
    doc.rect(0, 0, W, 22, 'F');

    // Logo / nombre empresa
    doc.setTextColor(...BRAND.white);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('POSENT PRO', 12, 14);

    // Fecha en la derecha
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${today()}`, W - 12, 14, { align: 'right' });

    // Título del reporte
    doc.setTextColor(...BRAND.black);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 12, 34);

    if (subtitle) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BRAND.gray);
        doc.text(subtitle, 12, 41);
    }

    return subtitle ? 48 : 42; // Y cursor
};

// ─── Helper: Pie de página PDF ─────────────────────────────────────────────────
const drawPDFFooter = (doc) => {
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const pages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFillColor(...BRAND.lightGray);
        doc.rect(0, H - 12, W, 12, 'F');
        doc.setTextColor(...BRAND.gray);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('POSENT PRO — Sistema de Punto de Venta', 12, H - 4);
        doc.text(`Pág. ${i} de ${pages}`, W - 12, H - 4, { align: 'right' });
    }
};

// ─── Helper: cargar imagen desde URL → base64 via canvas ─────────────────────
const loadImageAsBase64 = (url) =>
    new Promise((resolve) => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                // Máx 200×200 px para no inflar el PDF
                const maxSize = 200;
                const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
                canvas.width = Math.round(img.width * ratio);
                canvas.height = Math.round(img.height * ratio);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.75));
            } catch { resolve(null); }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });

// ═══════════════════════════════════════════════════════════════════════════════
//  PRODUCTOS — PDF CATÁLOGO CON FOTOS (para publicidad / socios)
// ═══════════════════════════════════════════════════════════════════════════════
export const exportProductsCatalogPDF = async (products, businessName = 'Mi Negocio') => {
    const jsPDF = await getJsPDF();

    // Layout: 2 tarjetas por fila en A4 horizontal
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();   // 297mm
    const H = doc.internal.pageSize.getHeight();  // 210mm

    // Pre-cargar todas las imágenes en paralelo
    const imgDataMap = {};
    await Promise.all(
        products.map(async (p) => {
            const url = p.imagen || p.imageUrl || p.image || '';
            imgDataMap[p._id || p.id || p.codigo || p.code || Math.random()] = await loadImageAsBase64(url);
        })
    );

    // ── Portada ────────────────────────────────────────────────────────────────
    let y = drawPDFHeader(doc, `Catálogo de Productos`, `${businessName} · ${today()}`);

    // Banda de resumen (Sin emojis)
    const totalValue = products.reduce((s, p) => s + ((parseFloat(p.precio || p.price) || 0) * (parseInt(p.stock_actual || p.stock) || 0)), 0);
    doc.setFillColor(...BRAND.lightGray);
    doc.rect(0, y + 2, W, 14, 'F');
    doc.setTextColor(...BRAND.black);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total productos: ${products.length}`, 14, y + 11);
    doc.text(`Valor de inventario: ${fmtCurrency(totalValue)}`, 80, y + 11);
    doc.text(`Fecha: ${today()}`, W - 14, y + 11, { align: 'right' });
    y += 22;

    // Layout: 2 cols × N rows de tarjetas
    const COLS = 2;
    const CARD_W = (W - 18) / COLS;   // ~139mm
    const CARD_H = 46;                 // altura por tarjeta
    const IMG_SIZE = 40;               // mm de imagen cuadrada (más grande y PRO)
    const MARGIN = 6;

    let col = 0;
    let row = 0;

    for (let idx = 0; idx < products.length; idx++) {
        const p = products[idx];

        // Calcular posición
        const cx = MARGIN + col * (CARD_W + MARGIN / 2);
        const cy = y + row * (CARD_H + 5);

        // Si ya no cabe en la página, nueva página
        if (cy + CARD_H > H - 16) {
            doc.addPage();
            y = drawPDFHeader(doc, `Catálogo de Productos`, `${businessName} · ${today()}`);
            y += 6;
            col = 0; row = 0;
        }

        const cardY = y + row * (CARD_H + 5);
        const cardX = MARGIN + col * (CARD_W + MARGIN / 2);

        // Fondo tarjeta (Plano y Minimalista)
        const available = (parseInt(p.stock_actual || p.stock) || 0) > 0;
        doc.setFillColor(...BRAND.white);
        doc.setDrawColor(220, 220, 225); // Borde gris sutil
        doc.setLineWidth(0.3);
        doc.roundedRect(cardX, cardY, CARD_W, CARD_H, 2, 2, 'FD');

        // Línea sutil superior para color acento
        doc.setFillColor(...(available ? [16, 185, 129] : [220, 220, 225]));
        doc.rect(cardX, cardY, CARD_W, 1.5, 'F');

        // Imagen
        const pid = p._id || p.id || p.codigo || p.code;
        const imgData = imgDataMap[pid];
        const imgX = cardX + 4;
        const imgY = cardY + (CARD_H - IMG_SIZE) / 2 + 1; // Centrada verticalmente

        if (imgData) {
            doc.addImage(imgData, 'JPEG', imgX, imgY, IMG_SIZE, IMG_SIZE, '', 'FAST');
        } else {
            // Placeholder muy suave
            doc.setFillColor(245, 245, 248);
            doc.roundedRect(imgX, imgY, IMG_SIZE, IMG_SIZE, 1, 1, 'F');
            doc.setTextColor(200, 200, 200);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'normal');
            const initial = (p.nombre || p.name || '?')[0].toUpperCase();
            doc.text(initial, imgX + IMG_SIZE / 2, imgY + IMG_SIZE / 2 + 4, { align: 'center' });
        }

        // TEXTOS AL LADO DE LA IMAGEN
        const textX = imgX + IMG_SIZE + 6;
        const textW = CARD_W - IMG_SIZE - 14;

        // Categoría (Arriba)
        if (p.categoria || p.category) {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(140, 140, 150); // Gris claro legible
            doc.text((p.categoria || p.category).toUpperCase(), textX, cardY + 10);
        }

        // Título del producto
        doc.setTextColor(...BRAND.black);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const nombre = (p.nombre || p.name || '—').trim();
        const splitNombre = doc.splitTextToSize(nombre, textW);
        doc.text(splitNombre[0], textX, cardY + 16);
        if (splitNombre.length > 1) {
            doc.text(splitNombre[1], textX, cardY + 21);
        }

        // Código / SKU
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BRAND.gray);
        doc.text(`Cod: ${p.codigo || p.code || '—'}`, textX, cardY + 27);

        // Precio (Grande, limpio)
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        // Usar un azul/gris oscuro elegante o rojo oscuro
        doc.setTextColor(20, 20, 20);
        doc.text(fmtCurrency(p.precio || p.price || 0), textX, cardY + 37);

        // Stock y Estado (Esquina inferior derecha)
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        if (available) {
            doc.setTextColor(16, 185, 129); // Verde éxito
            doc.text(`Disponible (${parseInt(p.stock_actual || p.stock) || 0})`, cardX + CARD_W - 4, cardY + 41, { align: 'right' });
        } else {
            doc.setTextColor(220, 50, 50); // Rojo suave
            doc.text(`Agotado`, cardX + CARD_W - 4, cardY + 41, { align: 'right' });
        }

        // Siguiente columna / fila
        col++;
        if (col >= COLS) { col = 0; row++; }
    }

    drawPDFFooter(doc);
    saveAs(doc.output('blob'), `catalogo-productos-${todayFile()}.pdf`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PRODUCTOS — EXCEL CONTABILIDAD (con costos, márgenes, stock mínimo)
// ═══════════════════════════════════════════════════════════════════════════════
export const exportProductsExcel = async (products) => {
    const XLSX = await getXLSX();

    const rows = products.map((p, i) => ({
        '#': i + 1,
        'Código': p.codigo || p.code || '',
        'Nombre': p.nombre || p.name || '',
        'Descripción': p.descripcion || p.description || '',
        'Categoría': p.categoria || p.category || '',
        'Precio Venta': parseFloat(p.precio || p.price) || 0,
        'Precio Compra': parseFloat(p.costo || p.purchasePrice || p.precio_compra) || 0,
        '% Margen': parseFloat(p.margen || p.profitMargin) || 0,
        'Stock Actual': parseInt(p.stock_actual || p.stock) || 0,
        'Stock Mínimo': parseInt(p.stock_minimo || p.minStock) || 0,
        'Valor en Inventario': (parseFloat(p.precio || p.price) || 0) * (parseInt(p.stock_actual || p.stock) || 0),
        'Valor Costo Total': (parseFloat(p.costo || p.purchasePrice || 0)) * (parseInt(p.stock_actual || p.stock) || 0),
        'Proveedor': p.proveedor || p.provider || '',
        'Unidad': p.unidad_medida || p.unitType || '',
        'Estado': (parseInt(p.stock_actual || p.stock) || 0) > 0 ? 'Disponible' : 'Agotado',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Ancho de columnas
    ws['!cols'] = [
        { wch: 5 }, { wch: 14 }, { wch: 35 }, { wch: 30 },
        { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 },
        { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 16 },
        { wch: 18 }, { wch: 12 }, { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

    // Hoja de resumen
    const totalVenta = rows.reduce((s, r) => s + (r['Valor en Inventario'] || 0), 0);
    const totalCosto = rows.reduce((s, r) => s + (r['Valor Costo Total'] || 0), 0);
    const lowStockItems = rows.filter(r => r['Stock Actual'] < 10);

    const summary = [
        ['RESUMEN DE INVENTARIO', ''],
        ['Fecha', today()],
        ['', ''],
        ['Total de productos', rows.length],
        ['Valor en inventario (precio venta)', totalVenta],
        ['Valor en inventario (precio costo)', totalCosto],
        ['Ganancia potencial', totalVenta - totalCosto],
        ['Productos con stock bajo (<10)', lowStockItems.length],
        ['', ''],
        ['PRODUCTOS CON STOCK BAJO', ''],
        ...lowStockItems.map(r => [r['Nombre'], `Stock: ${r['Stock Actual']}`]),
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    wsSummary['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `inventario-contabilidad-${todayFile()}.xlsx`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ANALYTICS — PDF REPORTE (para socios / prueba de ventas)
// ═══════════════════════════════════════════════════════════════════════════════
export const exportAnalyticsPDF = async (analyticsData, rangeLabel = '') => {
    const jsPDF = await getJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();

    const { summary, charts, tables, period } = analyticsData;
    const periodText = period?.startDate && period?.endDate
        ? `${format(new Date(period.startDate), 'dd/MM/yyyy')} – ${format(new Date(period.endDate), 'dd/MM/yyyy')}`
        : rangeLabel;

    let y = drawPDFHeader(doc, 'Reporte de Análisis de Ventas', `Período: ${periodText}`);
    y += 6;

    // ── KPIs principales ──────────────────────────────────────────────────────────
    const kpis = [
        ['Facturación Total', fmtCurrency(summary?.totalRevenue || 0)],
        ['Total de Pedidos', (summary?.totalOrders || 0).toString()],
        ['Ticket Promedio', fmtCurrency(summary?.avgTicket || 0)],
        ['Unidades Vendidas', (summary?.totalItems || 0).toString()],
        ['Clientes Únicos', (summary?.uniqueCustomers || 0).toString()],
        ['Crecimiento vs. anterior', `${(summary?.revenueTrend || 0) >= 0 ? '+' : ''}${(summary?.revenueTrend || 0).toFixed(1)}%`],
    ];

    // Cuadrículas de KPI (2 columnas)
    const kpiW = (W - 24) / 2;
    kpis.forEach(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 12 + col * (kpiW + 4);
        const ky = y + row * 20;

        doc.setFillColor(...BRAND.light);
        doc.roundedRect(x, ky, kpiW, 16, 2, 2, 'F');
        doc.setDrawColor(...BRAND.primary);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, ky, kpiW, 16, 2, 2, 'S');

        doc.setTextColor(...BRAND.gray);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(label.toUpperCase(), x + 4, ky + 5);

        doc.setTextColor(...BRAND.primary);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(value, x + 4, ky + 12);
    });

    y += Math.ceil(kpis.length / 2) * 20 + 8;

    // ── Tabla: Top Productos ────────────────────────────────────────────────────
    if (tables?.topProducts?.length) {
        doc.setTextColor(...BRAND.black);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Productos Más Vendidos', 12, y);
        y += 4;

        doc.autoTable({
            startY: y,
            head: [['#', 'Producto', 'Unidades', 'Ingresos']],
            body: tables.topProducts.slice(0, 10).map((p, i) => [
                i + 1,
                p.name || p.nombre || '—',
                (p.quantity || p.cantidad || 0).toString(),
                fmtCurrency(p.revenue || p.ventas || 0),
            ]),
            styles: { fontSize: 8, cellPadding: 2.5 },
            headStyles: { fillColor: BRAND.primary, textColor: BRAND.white, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: BRAND.lightGray },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 90 },
                2: { cellWidth: 30, halign: 'center' },
                3: { cellWidth: 40, halign: 'right' },
            },
            margin: { left: 12, right: 12 },
        });
        y = doc.lastAutoTable.finalY + 8;
    }

    // ── Tabla: Métodos de pago ────────────────────────────────────────────────────
    if (charts?.revenueByPayment?.length) {
        const totalPay = charts.revenueByPayment.reduce((s, p) => s + (p.amount || 0), 0);

        if (y > 240) { doc.addPage(); y = 30; }
        doc.setTextColor(...BRAND.black);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Ingresos por Método de Pago', 12, y);
        y += 4;

        doc.autoTable({
            startY: y,
            head: [['Método', 'Monto', '% del total']],
            body: charts.revenueByPayment.map(p => [
                p.method,
                fmtCurrency(p.amount),
                `${totalPay > 0 ? ((p.amount / totalPay) * 100).toFixed(1) : 0}%`,
            ]),
            styles: { fontSize: 8, cellPadding: 2.5 },
            headStyles: { fillColor: BRAND.dark, textColor: BRAND.white, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: BRAND.lightGray },
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 60, halign: 'right' },
                2: { cellWidth: 40, halign: 'center' },
            },
            margin: { left: 12, right: 12 },
        });
        y = doc.lastAutoTable.finalY + 8;
    }

    // ── Tabla: Top Clientes ──────────────────────────────────────────────────────
    if (tables?.topCustomers?.length) {
        if (y > 220) { doc.addPage(); y = 30; }
        doc.setTextColor(...BRAND.black);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Clientes Destacados', 12, y);
        y += 4;

        doc.autoTable({
            startY: y,
            head: [['#', 'Cliente', 'Compras', 'Total']],
            body: tables.topCustomers.slice(0, 8).map((c, i) => [
                i + 1,
                c.name || c.nombre,
                (c.orders || c.compras || 0).toString(),
                fmtCurrency(c.total),
            ]),
            styles: { fontSize: 8, cellPadding: 2.5 },
            headStyles: { fillColor: [16, 185, 129], textColor: BRAND.white, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: BRAND.lightGray },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { cellWidth: 90 },
                2: { cellWidth: 30, halign: 'center' },
                3: { cellWidth: 40, halign: 'right' },
            },
            margin: { left: 12, right: 12 },
        });
    }

    drawPDFFooter(doc);
    const rangeSlug = rangeLabel.replace(/\s+/g, '-').toLowerCase();
    saveAs(doc.output('blob'), `reporte-ventas-${rangeSlug}-${todayFile()}.pdf`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ANALYTICS — EXCEL CONTABILIDAD (datos raw para análisis contable)
// ═══════════════════════════════════════════════════════════════════════════════
export const exportAnalyticsExcel = async (rawData, rangeLabel = '') => {
    const XLSX = await getXLSX();
    const wb = XLSX.utils.book_new();

    const { summary, charts, tables, saleDetails, period } = rawData || {};
    const periodText = period?.startDate && period?.endDate
        ? `${format(new Date(period.startDate), 'dd/MM/yyyy')} al ${format(new Date(period.endDate), 'dd/MM/yyyy')}`
        : rangeLabel;

    // ─── Hoja 1: Resumen ejecutivo ──────────────────────────────────────────────
    const s = summary || {};
    const summarySheet = [
        ['REPORTE DE ANÁLISIS DE VENTAS'],
        [`Período: ${periodText}`],
        [`Generado: ${today()}`],
        [],
        ['MÉTRICAS PRINCIPALES', 'Valor'],
        ['Facturación Total', parseFloat(s.totalRevenue || 0)],
        ['Total de Pedidos', parseInt(s.totalOrders || 0)],
        ['Ticket Promedio', parseFloat(s.avgTicket || 0)],
        ['Unidades Vendidas', parseInt(s.totalItems || 0)],
        ['Clientes Únicos', parseInt(s.uniqueCustomers || 0)],
        [],
        ['COMPARACIÓN VS. PERÍODO ANTERIOR', ''],
        ['Tendencia Ingresos (%)', parseFloat(s.revenueTrend || 0)],
        ['Tendencia Pedidos (%)', parseFloat(s.ordersTrend || 0)],
        ['Tendencia Ticket (%)', parseFloat(s.ticketTrend || 0)],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summarySheet);
    wsSummary['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

    // ─── Hoja 2: Ventas por tiempo ──────────────────────────────────────────────
    if (charts?.salesByTime?.length) {
        const timeRows = charts.salesByTime.map(d => ({
            Período: d.label,
            Ingresos: parseFloat(d.revenue || 0),
            Pedidos: parseInt(d.orders || 0),
            'Ticket Promedio': d.orders > 0 ? parseFloat(d.revenue / d.orders) : 0,
        }));
        const wsTime = XLSX.utils.json_to_sheet(timeRows);
        wsTime['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 16 }];
        XLSX.utils.book_append_sheet(wb, wsTime, 'Ventas por Tiempo');
    }

    // ─── Hoja 3: Top Productos ───────────────────────────────────────────────────
    if (tables?.topProducts?.length) {
        const prodRows = tables.topProducts.map((p, i) => ({
            Rank: i + 1,
            Producto: p.name || p.nombre || '',
            Unidades: parseInt(p.quantity || p.cantidad || 0),
            Ingresos: parseFloat(p.revenue || p.ventas || 0),
        }));
        const wsProd = XLSX.utils.json_to_sheet(prodRows);
        wsProd['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 12 }, { wch: 16 }];
        XLSX.utils.book_append_sheet(wb, wsProd, 'Top Productos');
    }

    // ─── Hoja 4: Métodos de pago ─────────────────────────────────────────────────
    if (charts?.revenueByPayment?.length) {
        const total = charts.revenueByPayment.reduce((s, p) => s + (p.amount || 0), 0);
        const payRows = charts.revenueByPayment.map(p => ({
            'Método de Pago': p.method,
            'Monto': parseFloat(p.amount || 0),
            '% del Total': total > 0 ? parseFloat(((p.amount / total) * 100).toFixed(2)) : 0,
        }));
        const wsPay = XLSX.utils.json_to_sheet(payRows);
        wsPay['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, wsPay, 'Métodos de Pago');
    }

    // ─── Hoja 5: Ventas detalladas ──────────────────────────────────────────────
    if (saleDetails?.length) {
        const detRows = saleDetails.map(s => ({
            'N° Venta': s.numero || '',
            'Fecha': s.fecha || '',
            'Cliente': s.cliente || 'General',
            'Método Pago': s.metodo_pago || 'N/A',
            'Total': parseFloat(s.total || 0),
        }));
        const wsDetail = XLSX.utils.json_to_sheet(detRows);
        wsDetail['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 25 }, { wch: 16 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalle Ventas');
    }

    // ─── Hoja 6: Categorías ──────────────────────────────────────────────────────
    if (charts?.salesByCategory?.length) {
        const catRows = charts.salesByCategory.map((c, i) => ({
            Rank: i + 1,
            Categoría: c.category,
            'Ingresos': parseFloat(c.amount || 0),
        }));
        const wsCat = XLSX.utils.json_to_sheet(catRows);
        wsCat['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 16 }];
        XLSX.utils.book_append_sheet(wb, wsCat, 'Categorías');
    }

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const rangeSlug = rangeLabel.replace(/\s+/g, '-').toLowerCase();
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `analisis-contable-${rangeSlug}-${todayFile()}.xlsx`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  VENTAS — EXCEL detallado simple (raw de la API /sales)
// ═══════════════════════════════════════════════════════════════════════════════
export const exportSalesExcel = async (sales, rangeLabel = '') => {
    const XLSX = await getXLSX();

    const rows = (Array.isArray(sales) ? sales : []).map(s => ({
        'N° Venta': s.numero_venta || s._id?.toString().slice(-6).toUpperCase() || '',
        'Fecha': s.fecha ? format(new Date(s.fecha), 'dd/MM/yyyy HH:mm') : '',
        'Cliente': s.cliente_nombre || 'General',
        'Método Pago': s.metodo_pago || 'N/A',
        'Subtotal': parseFloat(s.subtotal || 0),
        'Descuento': parseFloat(s.descuento_total || 0),
        'Impuesto': parseFloat(s.impuestos || 0),
        'Total': parseFloat(s.total || 0),
        'Estado': s.estado || '',
        'Productos': (s.items || []).map(i => `${i.nombre} (x${i.cantidad})`).join('; '),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
        { wch: 12 }, { wch: 18 }, { wch: 25 }, { wch: 16 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 12 }, { wch: 50 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const rangeSlug = rangeLabel.replace(/\s+/g, '-').toLowerCase();
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `ventas-${rangeSlug}-${todayFile()}.xlsx`);
};
