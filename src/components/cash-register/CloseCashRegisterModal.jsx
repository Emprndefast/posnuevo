import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Box,
    Divider,
    InputAdornment,
    IconButton,
    Paper,
    Stack
} from '@mui/material';
import {
    AttachMoney,
    Description,
    RemoveCircleOutline,
    AddCircleOutline,
    AccountBalanceWallet,
    AssignmentInd,
    Lock
} from '@mui/icons-material';
import cashRegisterService from '../../services/cashRegisterService';
import { formatCurrency } from '../../utils/formatters';

const CloseCashRegisterModal = ({ open, onClose, onSuccess, cashRegister }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [breakdown, setBreakdown] = useState({
        bills_2000: 0,
        bills_1000: 0,
        bills_500: 0,
        bills_200: 0,
        bills_100: 0,
        bills_50: 0,
        bills_20: 0,
        coins_25: 0,
        coins_10: 0,
        coins_5: 0,
        coins_1: 0
    });
    const [closingNotes, setClosingNotes] = useState('');

    useEffect(() => {
        if (open) {
            setBreakdown({
                bills_2000: 0,
                bills_1000: 0,
                bills_500: 0,
                bills_200: 0,
                bills_100: 0,
                bills_50: 0,
                bills_20: 0,
                coins_25: 0,
                coins_10: 0,
                coins_5: 0,
                coins_1: 0
            });
            setClosingNotes('');
            setError('');
        }
    }, [open]);

    const handleBreakdownChange = (field, value) => {
        const numValue = parseInt(value) || 0;
        if (numValue < 0) return;
        setBreakdown(prev => ({
            ...prev,
            [field]: numValue
        }));
    };

    const calculateTotal = () => {
        return (breakdown.bills_2000 * 2000) +
            (breakdown.bills_1000 * 1000) +
            (breakdown.bills_500 * 500) +
            (breakdown.bills_200 * 200) +
            (breakdown.bills_100 * 100) +
            (breakdown.bills_50 * 50) +
            (breakdown.bills_20 * 20) +
            (breakdown.coins_25 * 25) +
            (breakdown.coins_10 * 10) +
            (breakdown.coins_5 * 5) +
            (breakdown.coins_1 * 1);
    };

    const expectedAmount = cashRegister
        ? (cashRegister.opening_amount || 0) +
        (cashRegister.summary?.cash_sales || 0) -
        (cashRegister.summary?.total_expenses || 0)
        : 0;

    const totalCounted = calculateTotal();
    const difference = totalCounted - expectedAmount;

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');

            await cashRegisterService.closeCashRegister(cashRegister._id || cashRegister.id, {
                cash_breakdown: breakdown,
                closing_notes: closingNotes
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Error closing cash register:', err);
            setError(err.response?.data?.message || 'Error al cerrar caja');
        } finally {
            setLoading(false);
        }
    };

    const denominations = [
        { label: 'RD$ 2,000', field: 'bills_2000', value: 2000 },
        { label: 'RD$ 1,000', field: 'bills_1000', value: 1000 },
        { label: 'RD$ 500', field: 'bills_500', value: 500 },
        { label: 'RD$ 200', field: 'bills_200', value: 200 },
        { label: 'RD$ 100', field: 'bills_100', value: 100 },
        { label: 'RD$ 50', field: 'bills_50', value: 50 },
        { label: 'RD$ 20', field: 'bills_20', value: 20 },
        { label: 'RD$ 25', field: 'coins_25', value: 25 },
        { label: 'RD$ 10', field: 'coins_10', value: 10 },
        { label: 'RD$ 5', field: 'coins_5', value: 5 },
        { label: 'RD$ 1', field: 'coins_1', value: 1 },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: 'error.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceWallet /> Cierre de Caja y Arqueo
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {/* Resumen Informativo */}
                    <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                Resumen del Turno
                            </Typography>
                            <Stack spacing={1}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">Apertura:</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {formatCurrency(cashRegister?.opening_amount || 0)}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">Ventas en Efectivo:</Typography>
                                    <Typography variant="body2" color="success.main" fontWeight="bold">
                                        + {formatCurrency(cashRegister?.summary?.cash_sales || 0)}
                                    </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">Gastos Registrados:</Typography>
                                    <Typography variant="body2" color="error.main" fontWeight="bold">
                                        - {formatCurrency(cashRegister?.summary?.total_expenses || 0)}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box display="flex" justifyContent="space-between" sx={{ pt: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">Efectivo Esperado:</Typography>
                                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                                        {formatCurrency(expectedAmount)}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>

                        <Box sx={{ mt: 3 }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    bgcolor: difference === 0 ? 'success.light' : difference > 0 ? 'info.light' : 'error.light',
                                    color: 'white',
                                    textAlign: 'center'
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold">
                                    Contado: {formatCurrency(totalCounted)}
                                </Typography>
                                <Typography variant="subtitle2">
                                    Diferencia: {formatCurrency(difference)}
                                </Typography>
                                {difference === 0 ? (
                                    <Typography variant="caption">Caja Cuadrada Perfectamente</Typography>
                                ) : difference > 0 ? (
                                    <Typography variant="caption">Sobrante en Caja</Typography>
                                ) : (
                                    <Typography variant="caption">Faltante en Caja</Typography>
                                )}
                            </Paper>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <TextField
                                label="Notas de Cierre"
                                fullWidth
                                multiline
                                rows={4}
                                value={closingNotes}
                                onChange={(e) => setClosingNotes(e.target.value)}
                                placeholder="Indique cualquier novedad en el cuadre..."
                            />
                        </Box>
                    </Grid>

                    {/* Desglose de Monedas/Billetes */}
                    <Grid item xs={12} md={7}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Desglose de Efectivo
                        </Typography>
                        <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 1 }}>
                            <Grid container spacing={1}>
                                {denominations.map((denom) => (
                                    <Grid item xs={12} key={denom.field}>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <TextField
                                                size="small"
                                                label={denom.label}
                                                type="number"
                                                value={breakdown[denom.field]}
                                                onChange={(e) => handleBreakdownChange(denom.field, e.target.value)}
                                                sx={{ flex: 1 }}
                                                inputProps={{ min: 0 }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            x {denom.value}
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                            <Typography variant="body2" sx={{ minWidth: 100, textAlign: 'right', fontWeight: 'bold' }}>
                                                {formatCurrency(breakdown[denom.field] * denom.value)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit" disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="error"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Lock />}
                >
                    {loading ? 'Cerrando...' : 'Finalizar y Cerrar Caja'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CloseCashRegisterModal;
