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
    Typography,
    Alert
} from '@mui/material';
import { useBranch } from '../../context/BranchContext';
import inventoryService from '../../services/inventoryService';

const TransferStockModal = ({ open, onClose, product, onSuccess }) => {
    const { branches, activeBranch } = useBranch();
    const [destinationBranch, setDestinationBranch] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setDestinationBranch('');
            setQuantity('');
            setReason('');
            setError('');
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!destinationBranch || !quantity || parseInt(quantity) <= 0) {
            setError('Por favor complete todos los campos correctamente');
            return;
        }

        if (parseInt(quantity) > product.quantity) {
            setError('No hay suficiente stock para transferir');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await inventoryService.transferStock({
                product_id: product._id || product.id,
                origin_branch_id: activeBranch.id,
                destination_branch_id: destinationBranch,
                cantidad: parseInt(quantity),
                motivo: reason
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al realizar la transferencia');
        } finally {
            setLoading(false);
        }
    };

    if (!product) return null;

    // Filtrar sucursal actual de las opciones de destino
    const availableBranches = branches.filter(b => b.id !== activeBranch?.id);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Transferir Stock - {product.name}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                            Stock actual en {activeBranch?.nombre || 'esta sucursal'}: <strong>{product.quantity}</strong>
                        </Typography>
                    </Grid>
                    {error && (
                        <Grid item xs={12}>
                            <Alert severity="error">{error}</Alert>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Sucursal Destino"
                            fullWidth
                            value={destinationBranch}
                            onChange={(e) => setDestinationBranch(e.target.value)}
                        >
                            {availableBranches.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.nombre}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Cantidad a transferir"
                            type="number"
                            fullWidth
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            inputProps={{ min: 1, max: product.quantity }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Motivo / Nota"
                            fullWidth
                            multiline
                            rows={2}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? 'Transfiriendo...' : 'Transferir'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TransferStockModal;
