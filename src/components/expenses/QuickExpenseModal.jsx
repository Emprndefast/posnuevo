import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    InputAdornment,
    CircularProgress,
    Alert
} from '@mui/material';
import { AttachMoney, Description, Category } from '@mui/icons-material';
import expenseService from '../../services/expenseService';
import { useAuth } from '../../context/AuthContextMongo';

const QuickExpenseModal = ({ open, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        paymentMethod: 'EFECTIVO',
        notes: ''
    });

    const categories = [
        'Servicios Básicos',
        'Mantenimiento',
        'Suministros',
        'Nómina',
        'Transporte',
        'Publicidad',
        'Impuestos',
        'Otros'
    ];

    const paymentMethods = [
        'EFECTIVO',
        'TRANSFERENCIA',
        'TARJETA',
        'CHEQUE'
    ];

    useEffect(() => {
        if (open) {
            setFormData({
                description: '',
                amount: '',
                category: '',
                paymentMethod: 'EFECTIVO',
                notes: ''
            });
            setError('');
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.description || !formData.amount || !formData.category) {
            setError('Por favor complete los campos obligatorios (*)');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await expenseService.createExpense({
                ...formData,
                amount: parseFloat(formData.amount),
                date: new Date(),
                userId: user.uid || user.id
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Error creating expense:', err);
            setError('Error al registrar el gasto. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
                Registrar Gasto Rápido
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2, mt: 2 }}>{error}</Alert>}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            label="Descripción *"
                            name="description"
                            fullWidth
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Ej: Pago de luz, Compra de café..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Description />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label="Monto *"
                            name="amount"
                            type="number"
                            fullWidth
                            value={formData.amount}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AttachMoney />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            select
                            label="Categoría *"
                            name="category"
                            fullWidth
                            value={formData.category}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Category />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            {categories.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Método de Pago"
                            name="paymentMethod"
                            fullWidth
                            value={formData.paymentMethod}
                            onChange={handleChange}
                        >
                            {paymentMethods.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Notas Adicionales"
                            name="notes"
                            fullWidth
                            multiline
                            rows={2}
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
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
                    {loading ? 'Registrando...' : 'Registrar Gasto'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default QuickExpenseModal;
