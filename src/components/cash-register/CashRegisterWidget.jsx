import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    CircularProgress,
    alpha,
    useTheme
} from '@mui/material';
import { LockOpen, Lock, AttachMoney } from '@mui/icons-material';
import cashRegisterService from '../../services/cashRegisterService';
import { useBranch } from '../../context/BranchContext';
import OpenCashRegisterModal from '../cash-register/OpenCashRegisterModal';

const CashRegisterWidget = () => {
    const theme = useTheme();
    const { activeBranch } = useBranch();
    const [loading, setLoading] = useState(true);
    const [cashRegister, setCashRegister] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (activeBranch) {
            loadCashRegister();
        }
    }, [activeBranch]);

    const loadCashRegister = async () => {
        try {
            setLoading(true);
            const response = await cashRegisterService.getActiveCashRegister(activeBranch?.id);
            setCashRegister(response.success ? response.data : null);
        } catch (error) {
            setCashRegister(null);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSuccess = () => {
        loadCashRegister();
    };

    const expectedCash = cashRegister
        ? (cashRegister.opening_amount || 0) +
        (cashRegister.summary?.cash_sales || 0) -
        (cashRegister.summary?.total_expenses || 0)
        : 0;

    if (loading) {
        return (
            <Box sx={{ textAlign: 'center', p: 2 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <>
            <Card
                sx={{
                    background: cashRegister
                        ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
                        : `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                    border: `1px solid ${cashRegister ? theme.palette.success.main : theme.palette.error.main}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                    }
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {cashRegister ? (
                                <LockOpen sx={{ color: 'success.main' }} />
                            ) : (
                                <Lock sx={{ color: 'error.main' }} />
                            )}
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                Estado de Caja
                            </Typography>
                        </Box>
                        <Chip
                            size="small"
                            label={cashRegister ? 'ABIERTA' : 'CERRADA'}
                            color={cashRegister ? 'success' : 'error'}
                            sx={{ fontWeight: 600 }}
                        />
                    </Box>

                    {cashRegister ? (
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Efectivo en Caja
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                                ${expectedCash.toFixed(2)}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, fontSize: '0.75rem' }}>
                                <Typography variant="caption" color="text.secondary">
                                    Ventas: ${cashRegister.summary?.cash_sales?.toFixed(2) || '0.00'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    •
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Gastos: ${cashRegister.summary?.total_expenses?.toFixed(2) || '0.00'}
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                No hay caja abierta. Debe abrir caja para comenzar operaciones.
                            </Typography>
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                fullWidth
                                startIcon={<LockOpen />}
                                onClick={() => setOpenModal(true)}
                            >
                                Abrir Caja
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <OpenCashRegisterModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSuccess={handleOpenSuccess}
            />
        </>
    );
};

export default CashRegisterWidget;
