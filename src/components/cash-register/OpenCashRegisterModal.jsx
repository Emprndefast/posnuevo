import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    InputAdornment,
    Typography,
    CircularProgress,
    Alert,
    Box
} from '@mui/material';
import { AttachMoney, Description } from '@mui/icons-material';
import cashRegisterService from '../../services/cashRegisterService';

const OpenCashRegisterModal = ({ open, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        opening_amount: '',
        opening_notes: ''
    });

    useEffect(() => {
        if (open) {
            setFormData({
                opening_amount: '',
                opening_notes: ''
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
        if (!formData.opening_amount || parseFloat(formData.opening_amount) < 0) {
            setError('Por favor ingrese un monto válido');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await cashRegisterService.openCashRegister({
                opening_amount: parseFloat(formData.opening_amount),
                opening_notes: formData.opening_notes
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error('Error opening cash register:', err);
            setError(err.response?.data?.message || 'Error al abrir caja. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
                Apertura de Caja
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Ingrese el monto inicial con el que abre la caja. Este monto será la base para el cuadre al final del día.
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Monto Inicial *"
                            name="opening_amount"
                            type="number"
                            fullWidth
                            value={formData.opening_amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AttachMoney />
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                min: 0,
                                step: 0.01
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Notas / Observaciones"
                            name="opening_notes"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.opening_notes}
                            onChange={handleChange}
                            placeholder="Ej: Billetes de 1000, monedas varias..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Description />
                                    </InputAdornment>
                                ),
                            }}
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
                    color="success"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <AttachMoney />}
                >
                    {loading ? 'Abriendo...' : 'Abrir Caja'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OpenCashRegisterModal;
