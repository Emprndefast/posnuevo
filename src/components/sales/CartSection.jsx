import React from 'react';
import {
    Box,
    Card,
    Typography,
    Chip,
    List,
    ListItem,
    IconButton,
    Divider,
    Button
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    Remove as RemoveIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Payment as PaymentIcon
} from '@mui/icons-material';

const CartSection = ({
    cart,
    darkMode,
    onUpdateQuantity,
    onRemoveFromCart,
    subtotal,
    total,
    discount,
    discountAmount,
    onCheckout,
    processingPayment,
    isMobile,
    onUpdateDiscount,
    onUpdateTotalManually
}) => {
    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: isMobile ? '16px 16px 0 0' : 2,
            bgcolor: darkMode ? '#1e1e1e' : '#FAFAFA',
            border: isMobile ? 'none' : undefined
        }}>
            <Box sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: darkMode ? '#252525' : '#fff',
                borderRadius: isMobile ? '16px 16px 0 0' : 0
            }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon color="primary" /> Carrito
                </Typography>
                <Chip label={`${cart.length} items`} color="primary" size="small" sx={{ fontWeight: 600 }} />
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 0, minHeight: isMobile ? '200px' : '0' }}>
                {cart.length === 0 ? (
                    <Box sx={{ height: '100%', minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                        <ShoppingCartIcon sx={{ fontSize: 60, mb: 1, color: 'text.disabled' }} />
                        <Typography variant="body2" color="text.secondary">Su carrito está vacío</Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {cart.map((item) => (
                            <ListItem key={item.id} divider sx={{ px: 2, py: 1.5, bgcolor: darkMode ? 'transparent' : '#fff' }}>
                                <Box sx={{ width: '100%' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>${(item.price * item.quantity).toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0', borderRadius: 1, p: 0.5 }}>
                                                <IconButton size="small" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} sx={{ width: 24, height: 24 }}>
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                                <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</Typography>
                                                <IconButton size="small" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} sx={{ width: 24, height: 24 }}>
                                                    <AddIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                            <IconButton size="small" color="error" onClick={() => onRemoveFromCart(item.id)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>

                                        {/* Input de Precio de Venta (Monto Final por Item) */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Paga este item:</Typography>
                                            <input
                                                type="number"
                                                value={((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}
                                                onChange={(e) => {
                                                    const targetFinal = parseFloat(e.target.value) || 0;
                                                    const disc = (item.price * item.quantity) - targetFinal;
                                                    onUpdateDiscount(item.id, disc);
                                                }}
                                                placeholder="0.00"
                                                style={{
                                                    width: '80px',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #ccc',
                                                    fontSize: '0.75rem',
                                                    background: darkMode ? '#333' : '#fff',
                                                    color: darkMode ? '#fff' : '#000',
                                                    outline: 'none'
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>

            <Box sx={{ p: 2, bgcolor: darkMode ? '#252525' : '#fff', borderTop: 1, borderColor: 'divider', boxShadow: '0px -4px 12px rgba(0,0,0,0.05)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</Typography>
                </Box>
                {discount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'error.main' }}>
                        <Typography variant="body2">Descuento ({discount.toFixed(0)}%)</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>-${discountAmount.toFixed(2)}</Typography>
                    </Box>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Total</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Pactado:</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>${total.toFixed(2)}</Typography>
                        <input
                            type="number"
                            placeholder="Ajustar Total..."
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (val > 0) onUpdateTotalManually(val);
                            }}
                            style={{
                                width: '100px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1.5px solid #2196f3',
                                fontSize: '0.85rem',
                                background: darkMode ? '#333' : '#fff',
                                color: darkMode ? '#fff' : '#000',
                                fontWeight: 'bold',
                                textAlign: 'right',
                                marginTop: '4px'
                            }}
                        />
                    </Box>
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<PaymentIcon />}
                    onClick={onCheckout}
                    disabled={cart.length === 0 || processingPayment}
                    sx={{
                        height: 48,
                        fontSize: '1.1rem',
                        borderRadius: 2,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                >
                    {processingPayment ? 'Procesando...' : 'Cobrar'}
                </Button>
            </Box>
        </Card>
    );
};

export default CartSection;
