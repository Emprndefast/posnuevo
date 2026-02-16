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
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { AttachMoney, Description, Calculate } from '@mui/icons-material';

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

    const handleBreakdownChange = (denomination, value) => {
        setBreakdown(prev => ({
            ...prev,
            [denomination]: parseInt(value) || 0
        }));
    };

    const calculateTotal = () => {
        return (
            breakdown.bills_2000 * 2000 +
            breakdown.bills_1000 * 1000 +
            breakdown.bills_500 * 500 +
            breakdown.bills_200 * 200 +
            breakdown.bills_100 * 100 +
            breakdown.bills_50 * 50 +
            breakdown.bills_20 * 20 +
            breakdown.coins_25 * 25 +
            breakdown.coins_10 * 10 +
            breakdown.coins_5 * 5 +
            breakdown.coins_1 * 1
        );
    };

    const calculateExpected = () => {
        if (!cashRegister) return 0;
        return (
            (cashRegister.opening_amount || 0) +
            (cashRegister.summary?.cash_sales || 0) -
            (cashRegister.summary?.total_expenses || 0)
        );
    };

    const countedTotal = calculateTotal();
    const expectedTotal = calculateExpected();
    const difference = countedTotal - expectedTotal;

    const handleSubmit = async () => {
        if (!cashRegister) {
            setError('No hay caja para cerrar');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const { closeCashRegister } = await import('../../services/cashRegisterService');
            await closeCashRegister.default.closeCashRegister(cashRegister._id || cashRegister.id, {
                cash_breakdown: breakdown,
                closing_notes: closingNotes
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Error closing cash register:', err);
            setError(err.response?.data?.message || 'Error al cerrar caja. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const denominations = [
        { key: 'bills_2000', label: 'Billetes de $2,000', value: 2000 },
        { key: 'bills_1000', label: 'Billetes de $1,000', value: 1000 },
        { key: 'bills_500', label: 'Billetes de $500', value: 500 },
        { key: 'bills_200', label: 'Billetes de $200', value: 200 },
        { key: 'bills_100', label: 'Billetes de $100', value: 100 },
        { key: 'bills_50', label: 'Billetes de $50', value: 50 },
        { key: 'bills_20', label: 'Billetes de $20', value: 20 },
        { key: 'coins_25', label: 'Monedas de $25', value: 25 },
        { key: 'coins_10', label: 'Monedas de $10', value: 10 },
        { key: 'coins_5', label: 'Monedas de $5', value: 5 },
        { key: 'coins_1', label: 'Monedas de $1', value: 1 }
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
                Cierre de Caja
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Resumen de la caja */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                    <Typography variant="h6" gutterBottom>Resumen del Día</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Monto Inicial</Typography>
                            <Typography variant="h6">${cashRegister?.opening_amount?.toFixed(2) || '0.00'}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Ventas en Efectivo</Typography>
                            <Typography variant="h6" color="success.main">
                                +${cashRegister?.summary?.cash_sales?.toFixed(2) || '0.00'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Gastos</Typography>
                            <Typography variant="h6" color="error.main">
                                -${cashRegister?.summary?.total_expenses?.toFixed(2) || '0.00'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Typography variant="caption" color="text.secondary">Esperado en Caja</Typography>
                            <Typography variant="h6" color="primary.main">
                                ${expectedTotal.toFixed(2)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                <Divider sx={{ my: 2 }} />

                {/* Desglose de efectivo */}
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Calculate /> Desglose de Efectivo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Cuente el efectivo en caja e ingrese la cantidad de cada denominación:
                </Typography>

                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Denominación</TableCell>
                                <TableCell align="center">Cantidad</TableCell>
                                <TableCell align="right">Subtotal</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {denominations.map((denom) => (
                                <TableRow key={denom.key}>
                                    <TableCell>{denom.label}</TableCell>
                                    <TableCell align="center">
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={breakdown[denom.key]}
                                            onChange={(e) => handleBreakdownChange(denom.key, e.target.value)}
                                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                                            sx={{ width: 80 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        ${(breakdown[denom.key] * denom.value).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow>
                                <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                                    Total Contado:
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    ${countedTotal.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Diferencia */}
                <Paper
                    sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: difference === 0 ? 'success.light' : difference > 0 ? 'info.light' : 'warning.light',
                        color: 'text.primary'
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                            <Typography variant="caption">Esperado</Typography>
                            <Typography variant="h6">${expectedTotal.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption">Contado</Typography>
                            <Typography variant="h6">${countedTotal.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="caption">Diferencia</Typography>
                            <Typography variant="h6" color={difference === 0 ? 'success.main' : difference > 0 ? 'info.main' : 'error.main'}>
                                {difference >= 0 ? '+' : ''}{difference.toFixed(2)}
                            </Typography>
                            <Typography variant="caption">
                                {difference === 0 ? 'Cuadrada ✓' : difference > 0 ? 'Sobrante' : 'Faltante'}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Notas */}
                <TextField
                    label="Notas / Observaciones"
                    fullWidth
                    multiline
                    rows={3}
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    placeholder={difference !== 0 ? "Explique la razón de la diferencia..." : "Observaciones opcionales..."}
                    InputProps={{
                        startAdornment: <Description sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit" disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="error"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <AttachMoney />}
                >
                    {loading ? 'Cerrando...' : 'Cerrar Caja'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CloseCashRegisterModal;
