/**
 * exportService.js — POSENT PRO · Servicio de Exportación Premium
 * v3.0 — Catálogo rediseñado + Analytics estable
 */

import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── LAZY IMPORTS ──────────────────────────────────────────────────────────────
const getJsPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    return jsPDF;
};
const getXLSX = async () => await import('xlsx');

// ─── PALETA PREMIUM ────────────────────────────────────────────────────────────
const C = {
    red: [200, 0, 0],
    redDark: [140, 0, 0],
    redLight: [255, 235, 235],
    gold: [212, 175, 55],
    goldLight: [255, 248, 220],
    dark: [18, 18, 30],
    slate: [71, 85, 105],
    silver: [148, 163, 184],
    bg: [245, 247, 250],
    white: [255, 255, 255],
    green: [16, 185, 129],
    greenBg: [209, 250, 229],
    orange: [245, 158, 11],
    graySoft: [230, 232, 238],
    line: [220, 222, 228],
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const safe = (v) => parseFloat(v) || 0;
const safeInt = (v) => parseInt(v) || 0;
const fmtCur = (v) => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(safe(v));
const today = () => format(new Date(), "dd 'de' MMMM, yyyy", { locale: es });
const todayFile = () => format(new Date(), 'dd-MM-yyyy');

// ─── IMAGEN → BASE64 ──────────────────────────────────────────────────────────
const imgToB64 = (url, maxPx = 400) =>
    new Promise(resolve => {
        if (!url) return resolve(null);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * ratio);
                canvas.height = Math.round(img.height * ratio);
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            } catch { resolve(null); }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });

const batchImages = async (products, size = 8) => {
    const map = {};
    for (let i = 0; i < products.length; i += size) {
        const loaded = await Promise.all(
            products.slice(i, i + size).map(async p => ({
                id: p._id || p.id || p.codigo,
                data: await imgToB64(p.imagen || p.imageUrl || p.image),
            }))
        );
        loaded.forEach(x => { if (x.data) map[x.id] = x.data; });
    }
    return map;
};

// ─── HEADER MINIMALISTA ────────────────────────────────────────────────────────
const pdfHeader = (doc, title, sub = '', accentColor = C.red) => {
    const W = doc.internal.pageSize.getWidth();
    // Barra superior
    doc.setFillColor(...accentColor);
    doc.rect(0, 0, W, 16, 'F');
    // Texto marca
    doc.setTextColor(...C.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('POSENT PRO', 12, 10.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(today(), W - 12, 10.5, { align: 'right' });
    // Título
    doc.setTextColor(...C.dark);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 12, 32);
    if (sub) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.slate);
        doc.text(sub, 12, 40);
        return 50;
    }
    return 44;
};

const pdfFooter = (doc) => {
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const n = doc.internal.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
        doc.setPage(i);
        doc.setFillColor(...C.dark);
        doc.rect(0, H - 10, W, 10, 'F');
        doc.setTextColor(...C.silver);
        doc.setFontSize(7.5);
        doc.text('POSENT PRO — Sistema de Gestión Inteligente', 12, H - 4);
        doc.text(`${i} / ${n}`, W - 12, H - 4, { align: 'right' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
//  1. CATÁLOGO PREMIUM — PDF LISTO PARA PUBLICAR
// ═══════════════════════════════════════════════════════════════════════════════
export const exportProductsCatalogPDF = async (productsRaw, businessName = 'Mi Negocio') => {
    const jsPDF = await getJsPDF();

    // Filtrar productos activos con nombre
    const products = productsRaw.filter(p => p.nombre || p.name);

    // Agrupar por categoría
    const grouped = products.reduce((acc, p) => {
        const cat = (p.categoria || p.category || 'General').trim();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});
    const cats = Object.keys(grouped).sort();

    // Pre-cargar imágenes
    const imgMap = await batchImages(products, 8);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();   // 297
    const H = doc.internal.pageSize.getHeight();  // 210

    // ── PÁGINA DE PORTADA ─────────────────────────────────────────────────────
    // Fondo oscuro premium
    doc.setFillColor(...C.dark);
    doc.rect(0, 0, W, H, 'F');

    // Franja roja vertical izquierda
    doc.setFillColor(...C.red);
    doc.rect(0, 0, 8, H, 'F');

    // Acento dorado superior
    doc.setFillColor(...C.gold);
    doc.rect(0, 0, W, 2, 'F');

    // Logo / marca
    doc.setTextColor(...C.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('POSENT PRO', 20, 22);

    // Línea dorada decorativa
    doc.setDrawColor(...C.gold);
    doc.setLineWidth(0.5);
    doc.line(20, 26, 100, 26);

    // Título principal
    doc.setFontSize(38);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.white);
    doc.text('CATÁLOGO', 20, 70);

    doc.setFontSize(38);
    doc.setTextColor(...C.red);
    doc.text('OFICIAL', 20, 90);

    // Nombre del negocio
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.gold);
    doc.text(businessName.toUpperCase(), 20, 108);

    // Stats de portada
    const totalProds = products.length;
    const totalStock = products.reduce((s, p) => s + safeInt(p.stock_actual || p.stock), 0);
    const statsData = [
        ['PRODUCTOS', String(totalProds)],
        ['EN STOCK', String(totalStock)],
        ['CATEGORÍAS', String(cats.length)],
    ];

    const boxW = 70, boxH = 28, boxStartX = 20, boxY = 130, gap = 8;
    statsData.forEach(([label, val], i) => {
        const bx = boxStartX + i * (boxW + gap);
        // Card stat
        doc.setFillColor(30, 30, 44);
        doc.roundedRect(bx, boxY, boxW, boxH, 3, 3, 'F');
        doc.setFillColor(...C.red);
        doc.roundedRect(bx, boxY, 3, boxH, 1, 1, 'F');
        // Valor
        doc.setTextColor(...C.white);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(val, bx + 12, boxY + 17);
        // Label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...C.silver);
        doc.text(label, bx + 12, boxY + 24);
    });

    // Fecha
    doc.setFontSize(9);
    doc.setTextColor(...C.silver);
    doc.text(`Generado el ${today()}`, 20, H - 18);

    // Barra decorativa inferior
    doc.setFillColor(...C.red);
    doc.rect(0, H - 8, W, 8, 'F');

    // Imagen portada (derecha) — productos destacados grid sim
    const coverImgs = products.filter(p => (p.imagen || p.imageUrl)).slice(0, 6);
    const gridStartX = 180, gridStartY = 20, cellSz = 52, cellGap = 4;
    let gi = 0;
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
            const p = coverImgs[gi++];
            const ix = gridStartX + col * (cellSz + cellGap);
            const iy = gridStartY + row * (cellSz + cellGap);
            const pid = p?._id || p?.id || p?.codigo;
            const img = p && imgMap[pid];
            // Marco
            doc.setFillColor(30, 30, 44);
            doc.roundedRect(ix, iy, cellSz, cellSz, 2, 2, 'F');
            if (img) {
                doc.addImage(img, 'JPEG', ix + 2, iy + 2, cellSz - 4, cellSz - 4);
            } else {
                doc.setFillColor(...C.slate);
                doc.roundedRect(ix + 8, iy + 8, cellSz - 16, cellSz - 16, 1, 1, 'F');
            }
        }
        if (gi >= coverImgs.length && coverImgs.length < 6) break;
    }

    // ── PÁGINAS DE CATÁLOGO ───────────────────────────────────────────────────
    // Layout: 3 columnas × 3 filas = 9 productos/página
    const COLS = 3;
    const ROWS = 3;
    const PAD = 10;
    const CARD_W = (W - PAD * (COLS + 1)) / COLS;   // ≈ 89mm
    const CARD_H = (H - 30 - PAD * (ROWS + 1)) / ROWS; // ≈ 50mm
    const IMG_H = CARD_H * 0.52;

    cats.forEach(cat => {
        const prods = grouped[cat];
        const pages = Math.ceil(prods.length / (COLS * ROWS));

        for (let pg = 0; pg < pages; pg++) {
            doc.addPage();

            // Header compacto
            doc.setFillColor(...C.dark);
            doc.rect(0, 0, W, 14, 'F');
            doc.setFillColor(...C.red);
            doc.rect(0, 0, 4, 14, 'F');
            doc.setTextColor(...C.white);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('POSENT PRO', 10, 9);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(...C.silver);
            doc.text(businessName, W / 2, 9, { align: 'center' });
            doc.text(today(), W - 10, 9, { align: 'right' });

            // Cabecera categoría
            doc.setFillColor(...C.redLight);
            doc.rect(0, 14, W, 12, 'F');
            doc.setDrawColor(...C.red);
            doc.setLineWidth(0.5);
            doc.line(0, 26, W, 26);
            doc.setTextColor(...C.red);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(cat.toUpperCase(), PAD, 22.5);
            doc.setTextColor(...C.slate);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            const pgLabel = pages > 1 ? ` · Página ${pg + 1} de ${pages}` : '';
            doc.text(`${prods.length} producto${prods.length !== 1 ? 's' : ''}${pgLabel}`, W - PAD, 22.5, { align: 'right' });

            const pageProds = prods.slice(pg * COLS * ROWS, (pg + 1) * COLS * ROWS);
            const startY = 28;

            pageProds.forEach((p, idx) => {
                const col = idx % COLS;
                const row = Math.floor(idx / COLS);
                const cardX = PAD + col * (CARD_W + PAD);
                const cardY = startY + PAD / 2 + row * (CARD_H + PAD / 2);
                const pid = p._id || p.id || p.codigo;
                const img = imgMap[pid];
                const stock = safeInt(p.stock_actual || p.stock);
                const precio = safe(p.precio || p.price);
                const nombre = (p.nombre || p.name || '—').substring(0, 38);

                // ── Sombra simulada ──
                doc.setFillColor(200, 200, 210);
                doc.roundedRect(cardX + 1, cardY + 1, CARD_W, CARD_H, 3, 3, 'F');

                // ── Fondo card ──
                doc.setFillColor(...C.white);
                doc.setDrawColor(...C.line);
                doc.setLineWidth(0.3);
                doc.roundedRect(cardX, cardY, CARD_W, CARD_H, 3, 3, 'FD');

                // ── Zona imagen ──
                doc.setFillColor(...C.bg);
                doc.roundedRect(cardX, cardY, CARD_W, IMG_H, 3, 3, 'F');
                // cuadrar parte inferior de la zona img
                doc.setFillColor(...C.bg);
                doc.rect(cardX, cardY + IMG_H - 3, CARD_W, 4, 'F');

                if (img) {
                    const imgPad = 3;
                    doc.addImage(img, 'JPEG', cardX + imgPad, cardY + imgPad, CARD_W - imgPad * 2, IMG_H - imgPad * 2);
                } else {
                    // Placeholder con ícono
                    doc.setTextColor(...C.graySoft);
                    doc.setFontSize(20);
                    doc.text('📦', cardX + CARD_W / 2, cardY + IMG_H / 2 + 4, { align: 'center' });
                }

                // ── Badge stock ──
                const badgeColor = stock > 5 ? C.green : stock > 0 ? C.orange : C.red;
                const badgeText = stock > 0 ? `${stock} uds` : 'AGOTADO';
                doc.setFillColor(...badgeColor);
                doc.roundedRect(cardX + CARD_W - 24, cardY + 2, 22, 6, 1, 1, 'F');
                doc.setTextColor(...C.white);
                doc.setFontSize(6);
                doc.setFont('helvetica', 'bold');
                doc.text(badgeText, cardX + CARD_W - 13, cardY + 6.2, { align: 'center' });

                // ── Zona texto ──
                const textY = cardY + IMG_H + 3;

                // Divisor
                doc.setDrawColor(...C.line);
                doc.setLineWidth(0.2);
                doc.line(cardX + 3, cardY + IMG_H + 0.5, cardX + CARD_W - 3, cardY + IMG_H + 0.5);

                // Nombre
                doc.setTextColor(...C.dark);
                doc.setFontSize(8.5);
                doc.setFont('helvetica', 'bold');
                const nameLines = doc.splitTextToSize(nombre, CARD_W - 6);
                doc.text(nameLines.slice(0, 2), cardX + 3, textY + 4);

                // SKU
                doc.setFontSize(6.5);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...C.silver);
                doc.text(`SKU: ${p.codigo || '—'}`, cardX + 3, textY + 11);

                // Acento rojo inferior
                doc.setFillColor(...C.red);
                doc.rect(cardX, cardY + CARD_H - 9, CARD_W, 9, 'F');
                // cuadrar bordes inf
                doc.setFillColor(...C.red);
                doc.rect(cardX, cardY + CARD_H - 12, 3, 5, 'F');
                doc.rect(cardX + CARD_W - 3, cardY + CARD_H - 12, 3, 5, 'F');

                // Precio
                doc.setTextColor(...C.white);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(fmtCur(precio), cardX + 4, cardY + CARD_H - 3);

                // Categoría badge
                doc.setFontSize(6);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(...C.goldLight);
                doc.text(cat.toUpperCase(), cardX + CARD_W - 4, cardY + CARD_H - 3, { align: 'right' });
            });

            // Footer
            doc.setFillColor(...C.dark);
            doc.rect(0, H - 8, W, 8, 'F');
            const totalPgs = doc.internal.getNumberOfPages();
            doc.setTextColor(...C.silver);
            doc.setFontSize(7);
            doc.text('POSENT PRO — Sistema de Gestión Inteligente', 10, H - 3);
            doc.text(`Pág. ${totalPgs}`, W - 10, H - 3, { align: 'right' });
        }
    });

    saveAs(doc.output('blob'), `catalogo-posent-${todayFile()}.pdf`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  2. PRODUCTOS — EXCEL CONTABLE
// ═══════════════════════════════════════════════════════════════════════════════
export const exportProductsExcel = async (products) => {
    const XLSX = await getXLSX();
    const wb = XLSX.utils.book_new();

    const rows = products.map((p, i) => {
        const pVenta = safe(p.precio || p.price);
        const pCompra = safe(p.costo || p.costo_unitario);
        const ganancia = pVenta - pCompra;
        const margen = pVenta > 0 ? (ganancia / pVenta) * 100 : 0;
        const stock = safeInt(p.stock_actual || p.stock);
        return {
            '#': i + 1,
            'SKU': p.codigo || '',
            'Producto': p.nombre || p.name || '',
            'Categoría': p.categoria || p.category || '',
            'Stock': stock,
            'Costo Unit.': pCompra,
            'Precio Venta': pVenta,
            'Ganancia Unit.': ganancia,
            'Margen (%)': margen.toFixed(1) + '%',
            'Val. Inventario': stock * pVenta,
            'Estado': stock > 0 ? 'Disponible' : 'Sin Stock',
        };
    });

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Inventario');

    const totalV = rows.reduce((s, r) => s + r['Val. Inventario'], 0);
    const ws2 = XLSX.utils.aoa_to_sheet([
        ['RESUMEN INVENTARIO - POSENT PRO'],
        ['Fecha', today()],
        [],
        ['SKUs totales', products.length],
        ['Valor total ($)', totalV],
    ]);
    XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `POSENT-Inventario-${todayFile()}.xlsx`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  3. ANALYTICS — PDF PROFESIONAL (crash-safe)
// ═══════════════════════════════════════════════════════════════════════════════
export const exportAnalyticsPDF = async (data, rangeLabel = '') => {
    const jsPDF = await getJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    // Extraer con valores por defecto seguros
    const s = data?.summary || data || {};
    const tables = data?.tables || {};
    const period = data?.period || {};

    const totalRevenue = safe(s.totalRevenue || s.monto_total || s.facturacion_total);
    const avgTicket = safe(s.avgTicket || s.ticket_promedio || s.promedio);
    const totalOrders = safeInt(s.totalOrders || s.total_ventas || s.pedidos);
    const totalItems = safeInt(s.totalItems || s.total_items || 0);
    const revenueTrend = safe(s.revenueTrend || s.crecimiento || 0);

    const pText = period?.startDate
        ? `${format(new Date(period.startDate), 'dd/MM/yyyy')} — ${format(new Date(period.endDate), 'dd/MM/yyyy')}`
        : rangeLabel || today();

    // ── PORTADA ANALÍTICA ────────────────────────────────────────────────────
    // Gradiente simulado (barra oscura + barra roja)
    doc.setFillColor(...C.dark);
    doc.rect(0, 0, W, 55, 'F');
    doc.setFillColor(...C.red);
    doc.rect(0, 52, W, 6, 'F');

    doc.setTextColor(...C.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('POSENT PRO', 14, 14);

    doc.setFontSize(22);
    doc.text('Análisis de Rendimiento', 14, 32);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.silver);
    doc.text(pText, 14, 43);

    // ── KPI CARDS (2 × 2) ──────────────────────────────────────────────────
    const kpis = [
        { L: 'Facturación Total', V: fmtCur(totalRevenue), color: C.green, bg: C.greenBg },
        { L: 'Ticket Promedio', V: fmtCur(avgTicket), color: C.red, bg: C.redLight },
        { L: 'Pedidos', V: String(totalOrders), color: C.dark, bg: C.bg },
        {
            L: 'Crecimiento',
            V: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend.toFixed(1)}%`,
            color: revenueTrend >= 0 ? C.green : C.red,
            bg: revenueTrend >= 0 ? C.greenBg : C.redLight,
        },
    ];

    const kw = (W - 42) / 2;
    const kh = 26;
    let ky = 66;

    kpis.forEach((k, i) => {
        const kx = 14 + (i % 2) * (kw + 14);
        if (i === 2) ky += kh + 8;

        // Sombra
        doc.setFillColor(210, 213, 220);
        doc.roundedRect(kx + 1, ky + 1, kw, kh, 3, 3, 'F');
        // Card
        doc.setFillColor(...k.bg);
        doc.roundedRect(kx, ky, kw, kh, 3, 3, 'F');
        // Acento lateral
        doc.setFillColor(...k.color);
        doc.roundedRect(kx, ky, 3, kh, 1, 1, 'F');
        // Etiqueta
        doc.setTextColor(...C.slate);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.text(k.L.toUpperCase(), kx + 8, ky + 9);
        // Valor
        doc.setTextColor(...k.color);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(k.V, kx + 8, ky + 21);
    });

    ky += kh + 16;

    // ── SECCIÓN: RESUMEN EJECUTIVO ─────────────────────────────────────────
    doc.setFillColor(...C.dark);
    doc.rect(14, ky, W - 28, 8, 'F');
    doc.setTextColor(...C.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', 18, ky + 5.5);
    ky += 12;

    const exRows = [
        ['Facturación Total', fmtCur(totalRevenue)],
        ['Ticket Promedio', fmtCur(avgTicket)],
        ['Pedidos Procesados', String(totalOrders)],
        ['Unidades Vendidas', String(totalItems)],
        ['Crecimiento', `${revenueTrend >= 0 ? '+' : ''}${revenueTrend.toFixed(1)}%`],
    ];

    doc.autoTable({
        startY: ky,
        body: exRows,
        columnStyles: { 0: { fontStyle: 'bold', textColor: C.slate }, 1: { halign: 'right', textColor: C.dark } },
        styles: { fontSize: 10, cellPadding: 4, lineColor: C.line, lineWidth: 0.2 },
        alternateRowStyles: { fillColor: C.bg },
        margin: { left: 14, right: 14 },
    });

    ky = doc.lastAutoTable.finalY + 14;

    // ── TABLA TOP PRODUCTOS ────────────────────────────────────────────────
    const topProds = tables?.topProducts || data?.topProducts || data?.top_productos || [];
    if (topProds.length > 0) {
        // Header sección
        doc.setFillColor(...C.red);
        doc.rect(14, ky, W - 28, 8, 'F');
        doc.setTextColor(...C.white);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('TOP PRODUCTOS', 18, ky + 5.5);
        ky += 12;

        const prodBody = topProds.slice(0, 10).map((p, i) => {
            const rev = safe(p.revenue || p.total_vendido || p.monto);
            const qty = safeInt(p.quantity || p.cantidad_vendida || p.cantidad);
            const name = p.name || p.nombre || '—';
            const pct = totalRevenue > 0 ? ((rev / totalRevenue) * 100).toFixed(1) + '%' : '0%';
            return [`${i + 1}`, name, String(qty), fmtCur(rev), pct];
        });

        doc.autoTable({
            startY: ky,
            head: [['#', 'Producto', 'Vendidos', 'Ingresos', '% Aporte']],
            body: prodBody,
            headStyles: { fillColor: C.dark, textColor: C.white, fontSize: 8.5, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3.5, lineColor: C.line, lineWidth: 0.2 },
            columnStyles: {
                0: { halign: 'center', cellWidth: 10 },
                2: { halign: 'center' },
                3: { halign: 'right', textColor: C.red },
                4: { halign: 'center', textColor: C.slate },
            },
            alternateRowStyles: { fillColor: C.bg },
            margin: { left: 14, right: 14 },
        });
    }

    // ── FOOTER ─────────────────────────────────────────────────────────────
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFillColor(...C.dark);
        doc.rect(0, H - 10, W, 10, 'F');
        doc.setTextColor(...C.silver);
        doc.setFontSize(7.5);
        doc.text('POSENT PRO — Análisis de Rendimiento', 14, H - 4);
        doc.text(`${i} / ${pages}`, W - 14, H - 4, { align: 'right' });
    }

    saveAs(doc.output('blob'), `POSENT-Analytics-${todayFile()}.pdf`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  4. ANALYTICS — EXCEL CONTABLE
// ═══════════════════════════════════════════════════════════════════════════════
export const exportAnalyticsExcel = async (rawData, rangeLabel = '') => {
    const XLSX = await getXLSX();
    const wb = XLSX.utils.book_new();
    const s = rawData?.summary || rawData || {};
    const tables = rawData?.tables || {};

    const totalRevenue = safe(s.totalRevenue || s.monto_total);
    const avgTicket = safe(s.avgTicket || s.ticket_promedio);
    const totalOrders = safeInt(s.totalOrders || s.total_ventas);
    const totalItems = safeInt(s.totalItems || 0);
    const revenueTrend = safe(s.revenueTrend || 0);

    const summarySheet = [
        ['REPORTE DE VENTAS - POSENT PRO'],
        ['Período', rangeLabel],
        ['Generado', today()],
        [],
        ['Métrica', 'Valor'],
        ['Facturación Total', totalRevenue],
        ['Total Pedidos', totalOrders],
        ['Ticket Promedio', avgTicket],
        ['Unidades Vendidas', totalItems],
        ['Crecimiento (%)', revenueTrend],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summarySheet), 'Resumen');

    if (tables?.topProducts?.length) {
        const prodRows = tables.topProducts.map(p => ({
            'Producto': p.name || p.nombre || '',
            'Unidades': safeInt(p.quantity || p.cantidad_vendida),
            'Ingresos': safe(p.revenue || p.total_vendido),
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(prodRows), 'Top Productos');
    }

    if (rawData?.saleDetails?.length) {
        const details = rawData.saleDetails.map(d => ({
            'Referencia': d.numero || d.id,
            'Fecha': d.fecha,
            'Cliente': d.cliente,
            'Pago': d.metodo_pago,
            'Total': safe(d.total),
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(details), 'Transacciones');
    }

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Analytics-${todayFile()}.xlsx`);
};

// ═══════════════════════════════════════════════════════════════════════════════
//  5. VENTAS — EXCEL DETALLADO
// ═══════════════════════════════════════════════════════════════════════════════
export const exportSalesExcel = async (sales, label = '') => {
    const XLSX = await getXLSX();
    const rows = (Array.isArray(sales) ? sales : []).map(s => ({
        'Fecha': format(new Date(s.fecha), 'dd/MM/yyyy HH:mm'),
        'Ticket': s.numero_venta || s._id?.toString().slice(-6) || '',
        'Cliente': s.cliente_nombre || 'General',
        'Método': s.metodo_pago || '',
        'Subtotal': safe(s.subtotal),
        'Total': safe(s.total),
        'Estado': s.estado || '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Ventas-${label || todayFile()}.xlsx`);
};

// Alias de compatibilidad
export const handleExportAnalytics = exportAnalyticsPDF;
