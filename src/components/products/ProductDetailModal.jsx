import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    Divider,
    Grid,
    Avatar,
    Tooltip,
    Zoom,
    Slide,
} from '@mui/material';
import {
    Close as CloseIcon,
    ShoppingCart as CartIcon,
    Inventory as InventoryIcon,
    LocalOffer as PriceIcon,
    Category as CategoryIcon,
    QrCode as BarcodeIcon,
    Info as InfoIcon,
    OpenInNew as OpenInNewIcon,
    AddShoppingCart as AddShoppingCartIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { enqueueSnackbar } from 'notistack';
import { useCart } from '../../context/CartContext';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const StockBadge = ({ stock, minStock = 5 }) => {
    if (stock <= 0)
        return (
            <Chip
                icon={<ErrorIcon fontSize="small" />}
                label="Sin stock"
                color="error"
                size="small"
                sx={{ fontWeight: 700 }}
            />
        );
    if (stock <= minStock)
        return (
            <Chip
                icon={<WarningIcon fontSize="small" />}
                label={`Stock bajo: ${stock}`}
                color="warning"
                size="small"
                sx={{ fontWeight: 700 }}
            />
        );
    return (
        <Chip
            icon={<CheckCircleIcon fontSize="small" />}
            label={`En stock: ${stock}`}
            color="success"
            size="small"
            sx={{ fontWeight: 700 }}
        />
    );
};

const DetailRow = ({ icon: Icon, label, value, color }) => {
    const theme = useTheme();
    if (!value && value !== 0) return null;
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                py: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&:last-child': { borderBottom: 'none' },
            }}
        >
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette[color || 'primary'].main, 0.12),
                    flexShrink: 0,
                    mt: 0.3,
                }}
            >
                <Icon sx={{ fontSize: 18, color: `${color || 'primary'}.main` }} />
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, mb: 0.3 }}>
                    {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                    {value}
                </Typography>
            </Box>
        </Box>
    );
};

/**
 * ProductDetailModal — Modal de detalle de producto reutilizable.
 *
 * Props:
 *   open        {boolean}  — si está abierto
 *   onClose     {Function} — callback para cerrar
 *   product     {object}   — objeto producto (acepta campos en inglés o español)
 *   onAddToCart {Function} — opcional: callback extra tras agregar al carrito
 */
const ProductDetailModal = ({ open, onClose, product, onAddToCart }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { addProductToCart } = useCart();
    const [added, setAdded] = useState(false);

    if (!product) return null;

    // Normalizar campos: acepta tanto español como inglés
    const name = product.nombre || product.name || 'Sin nombre';
    const price = product.precio ?? product.price ?? 0;
    const stock = product.stock_actual ?? product.stock ?? 0;
    const minStock = product.stock_minimo ?? product.minStock ?? 5;
    const code = product.codigo || product.code || '';
    const description = product.descripcion || product.description || '';
    const category = product.categoria || product.category || '';
    const brand = product.brand || product.marca || '';
    const provider = product.proveedor || product.provider || '';
    const imageUrl = product.imagen || product.imageUrl || (product.images && product.images[0]) || '';
    const barcode = product.barcode || product.codigo_barras || '';
    const id = product._id || product.id || '';

    const handleAddToCart = () => {
        if (stock <= 0) {
            enqueueSnackbar('Producto sin stock disponible', { variant: 'warning' });
            return;
        }

        addProductToCart({
            id,
            name,
            price,
            stock,
            code,
        });

        setAdded(true);
        setTimeout(() => setAdded(false), 2000);

        if (onAddToCart) onAddToCart(product);
    };

    const handleGoToSale = () => {
        handleAddToCart();
        onClose();
        navigate('/quick-sale');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            TransitionComponent={Transition}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    overflow: 'hidden',
                },
            }}
        >
            {/* Header con imagen */}
            <Box
                sx={{
                    position: 'relative',
                    minHeight: 160,
                    background: imageUrl
                        ? `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0)} 60%, ${theme.palette.background.paper} 100%), url(${imageUrl}) center/cover no-repeat`
                        : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    p: 2,
                }}
            >
                {!imageUrl && (
                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.15,
                        }}
                    >
                        <InventoryIcon sx={{ fontSize: 120 }} />
                    </Box>
                )}

                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(4px)',
                        '&:hover': { bgcolor: 'background.paper' },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Chip
                        label={category || 'Sin categoría'}
                        size="small"
                        icon={<CategoryIcon fontSize="small" />}
                        sx={{
                            mb: 1,
                            bgcolor: alpha(theme.palette.background.paper, 0.85),
                            backdropFilter: 'blur(4px)',
                            fontWeight: 600,
                        }}
                    />
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            color: imageUrl ? 'text.primary' : 'white',
                            lineHeight: 1.2,
                        }}
                    >
                        {name}
                    </Typography>
                </Box>
            </Box>

            <DialogContent sx={{ pt: 2 }}>
                {/* Precio y stock */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                    }}
                >
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Precio de venta
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
                            RD$ {Number(price).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                    <StockBadge stock={stock} minStock={minStock} />
                </Box>

                {/* Descripción */}
                {description && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Descripción
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', lineHeight: 1.6 }}>
                            {description}
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ my: 1.5 }} />

                {/* Detalles */}
                <Box>
                    <DetailRow icon={BarcodeIcon} label="Código" value={code} color="secondary" />
                    {barcode && <DetailRow icon={BarcodeIcon} label="Código de barras" value={barcode} color="secondary" />}
                    <DetailRow icon={InventoryIcon} label="Stock actual" value={`${stock} unidades`} color={stock <= 0 ? 'error' : stock <= minStock ? 'warning' : 'success'} />
                    <DetailRow icon={InventoryIcon} label="Stock mínimo" value={minStock ? `${minStock} unidades` : null} />
                    {brand && <DetailRow icon={InfoIcon} label="Marca" value={brand} color="info" />}
                    {provider && <DetailRow icon={InfoIcon} label="Proveedor" value={provider} color="info" />}
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 2,
                    gap: 1,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{ flex: '1 1 80px', minWidth: 80 }}
                >
                    Cerrar
                </Button>

                <Zoom in>
                    <Button
                        variant="contained"
                        color={added ? 'success' : 'secondary'}
                        startIcon={added ? <CheckCircleIcon /> : <AddShoppingCartIcon />}
                        onClick={handleAddToCart}
                        disabled={stock <= 0}
                        sx={{
                            flex: '2 1 140px',
                            minWidth: 140,
                            fontWeight: 700,
                            transition: 'all 0.3s',
                        }}
                    >
                        {added ? '¡Agregado!' : 'Agregar al carrito'}
                    </Button>
                </Zoom>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CartIcon />}
                    onClick={handleGoToSale}
                    disabled={stock <= 0}
                    sx={{ flex: '2 1 140px', minWidth: 140, fontWeight: 700 }}
                >
                    Ir a vender
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductDetailModal;
