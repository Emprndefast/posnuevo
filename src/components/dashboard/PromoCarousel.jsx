/**
 * PromoCarousel.jsx
 * Carrusel de contenido multimedia para el Dashboard Pro.
 * Combina: medios subidos por el admin + fotos de productos del POS
 *
 * Características:
 * - Rotación automática cada N segundos
 * - Transición suave entre diapositivas (fade)
 * - Soporte para video / imagen / foto-de-producto
 * - Admin puede agregar / eliminar medios individualmente
 * - Indicadores de posición (dots)
 * - Badge dinámico según tipo de slide
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    IconButton,
    Typography,
    Tooltip,
    CircularProgress,
    Chip,
    alpha,
    useTheme,
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    CloudUpload,
    DeleteForever,
    Inventory as InventoryIcon,
    LocalOffer,
    PlayCircle,
    Image as ImageIcon,
    Pause,
    PlayArrow,
} from '@mui/icons-material';

const SLIDE_INTERVAL = 5000; // ms entre slides

// ────────────────────────────────────────────────────────────────────────────
// Tipos de slide
// ────────────────────────────────────────────────────────────────────────────
const BADGE = {
    promo: { label: 'PROMO LIVE', color: '#10b981' },
    product: { label: 'PRODUCTO', color: '#3b82f6' },
    ad: { label: 'ANUNCIO', color: '#f59e0b' },
};

// ────────────────────────────────────────────────────────────────────────────
// Componente principal
// ────────────────────────────────────────────────────────────────────────────
const PromoCarousel = ({
    adminMedia = [],          // [{ url, type, title, kind }] — kind: 'promo'|'ad'
    productImages = [],       // [{ url, nombre }] desde ProductosContext
    userRole = 'employee',
    onUpload,                 // fn(file) → Promise
    onRemove,                 // fn(index) → Promise
    isUploading = false,
}) => {
    const theme = useTheme();

    // ── Construir slides combinados ──────────────────────────────────────────
    const slides = React.useMemo(() => {
        const result = [];

        // 1. Medios del admin (promos / anuncios)
        adminMedia.forEach(m => {
            result.push({ url: m.url, type: m.type || 'image', kind: m.kind || 'promo', title: m.title || '', adminIndex: m._index });
        });

        // 2. Fotos de productos (máx 10 para no saturar)
        productImages.slice(0, 10).forEach(p => {
            result.push({ url: p.url, type: 'image', kind: 'product', title: p.nombre || 'Producto' });
        });

        return result;
    }, [adminMedia, productImages]);

    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const [fading, setFading] = useState(false);
    const timerRef = useRef(null);
    const fileInputRef = useRef(null);

    const total = slides.length;

    // ── Navegación con fade ──────────────────────────────────────────────────
    const goTo = useCallback((idx) => {
        if (total === 0) return;
        setFading(true);
        setTimeout(() => {
            setCurrent(((idx % total) + total) % total);
            setFading(false);
        }, 250);
    }, [total]);

    const next = useCallback(() => goTo(current + 1), [current, goTo]);
    const prev = useCallback(() => goTo(current - 1), [current, goTo]);

    // ── Auto-play ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (paused || total <= 1) return;
        timerRef.current = setInterval(next, SLIDE_INTERVAL);
        return () => clearInterval(timerRef.current);
    }, [paused, next, total]);

    // ── Reset slide cuando cambia el contenido ───────────────────────────────
    useEffect(() => {
        if (current >= total && total > 0) setCurrent(0);
    }, [total]);

    // ── Slide actual ─────────────────────────────────────────────────────────
    const slide = slides[current];
    const badge = slide ? BADGE[slide.kind] || BADGE.promo : null;
    const isAdmin = userRole === 'admin' || userRole === 'owner';

    // ── Estado vacío ─────────────────────────────────────────────────────────
    if (total === 0) {
        return (
            <Box sx={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                p: 2, textAlign: 'center', gap: 1.5,
            }}>
                <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isUploading ? <CircularProgress size={24} /> : <PlayCircle sx={{ fontSize: 28, color: 'primary.main' }} />}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>Pantalla Promocional</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1.5 }}>
                    Sube fotos o videos para mostrar tus productos y ofertas
                </Typography>
                {isAdmin && (
                    <Tooltip title="Subir imagen o video">
                        <IconButton
                            size="small"
                            component="label"
                            sx={{ bgcolor: 'primary.main', color: 'white', width: 36, height: 36, '&:hover': { bgcolor: 'primary.dark' } }}
                        >
                            <CloudUpload sx={{ fontSize: 18 }} />
                            <input type="file" hidden multiple accept="image/*,video/*" onChange={onUpload} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        );
    }

    // ── Renderizado ──────────────────────────────────────────────────────────
    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', bgcolor: '#111', borderRadius: 'inherit' }}>

            {/* ── Media actual ── */}
            <Box sx={{ position: 'absolute', inset: 0, opacity: fading ? 0 : 1, transition: 'opacity 0.25s ease' }}>
                {slide.type === 'video' ? (
                    <video
                        key={slide.url}
                        src={slide.url}
                        autoPlay loop muted playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <img
                        key={slide.url}
                        src={slide.url}
                        alt={slide.title || 'Promo'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                )}
                {/* Overlay oscuro sutil en la parte inferior */}
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }} />
            </Box>

            {/* ── Badge tipo slide ── */}
            {badge && (
                <Box sx={{
                    position: 'absolute', top: 8, left: 8, zIndex: 10,
                    bgcolor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
                    px: 1, py: 0.25, borderRadius: 1,
                    border: `1px solid rgba(255,255,255,0.15)`,
                    display: 'flex', alignItems: 'center', gap: 0.6,
                }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: badge.color, animation: 'liveDot 1.5s infinite', '@keyframes liveDot': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.3, transform: 'scale(1.5)' } } }} />
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 800, fontSize: '0.55rem', letterSpacing: 0.8 }}>
                        {badge.label}
                    </Typography>
                </Box>
            )}

            {/* ── Título del slide (producto) ── */}
            {slide.kind === 'product' && slide.title && (
                <Box sx={{ position: 'absolute', bottom: 32, left: 8, right: 8, zIndex: 10 }}>
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem', display: 'block', textShadow: '0 1px 4px rgba(0,0,0,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {slide.title}
                    </Typography>
                </Box>
            )}

            {/* ── Navegación prev/next ── */}
            {total > 1 && (
                <>
                    <IconButton onClick={prev} size="small" sx={{ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(0,0,0,0.45)', color: 'white', width: 26, height: 26, '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                        <ChevronLeft sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton onClick={next} size="small" sx={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', zIndex: 10, bgcolor: 'rgba(0,0,0,0.45)', color: 'white', width: 26, height: 26, '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}>
                        <ChevronRight sx={{ fontSize: 16 }} />
                    </IconButton>
                </>
            )}

            {/* ── Dots indicadores ── */}
            {total > 1 && (
                <Box sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    {slides.map((_, i) => (
                        <Box key={i} onClick={() => goTo(i)} sx={{
                            width: i === current ? 16 : 6, height: 6, borderRadius: 3,
                            bgcolor: i === current ? 'white' : 'rgba(255,255,255,0.4)',
                            cursor: 'pointer', transition: 'all 0.3s ease',
                            '&:hover': { bgcolor: 'white' },
                        }} />
                    ))}
                </Box>
            )}

            {/* ── Controles admin (esquina superior derecha) ── */}
            {isAdmin && (
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>
                    {/* Pause / Play */}
                    <Tooltip title={paused ? 'Reanudar' : 'Pausar'}>
                        <IconButton size="small" onClick={() => setPaused(p => !p)} sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: 'white', width: 24, height: 24, '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}>
                            {paused ? <PlayArrow sx={{ fontSize: 13 }} /> : <Pause sx={{ fontSize: 13 }} />}
                        </IconButton>
                    </Tooltip>

                    {/* Agregar media */}
                    <Tooltip title="Agregar imagen/video">
                        <IconButton size="small" component="label" sx={{ bgcolor: 'rgba(255,255,255,0.85)', color: 'primary.main', width: 24, height: 24, '&:hover': { bgcolor: 'white' } }}>
                            <CloudUpload sx={{ fontSize: 12 }} />
                            <input type="file" hidden multiple accept="image/*,video/*" onChange={onUpload} />
                        </IconButton>
                    </Tooltip>

                    {/* Eliminar slide actual (solo si es admin-media) */}
                    {slide?.adminIndex !== undefined && (
                        <Tooltip title="Eliminar este slide">
                            <IconButton size="small" onClick={() => onRemove(slide.adminIndex)} sx={{ bgcolor: 'rgba(255,255,255,0.85)', color: 'error.main', width: 24, height: 24, '&:hover': { bgcolor: 'white' } }}>
                                <DeleteForever sx={{ fontSize: 12 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )}

            {/* ── Contador slide X/N ── */}
            <Box sx={{ position: 'absolute', bottom: 8, right: 8, zIndex: 10 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.55rem', fontWeight: 700 }}>
                    {current + 1}/{total}
                </Typography>
            </Box>
        </Box>
    );
};

export default PromoCarousel;
