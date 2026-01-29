import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem
} from '@mui/material';
import { Person as CustomerIcon } from '@mui/icons-material';

const SaleDetailsSection = ({
    selectedCustomer,
    onSelectCustomer,
    notes,
    onNotesChange,
    promotions,
    selectedPromotion,
    onPromotionChange,
    isMobile
}) => {
    return (
        <Card sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            border: isMobile ? 'none' : undefined,
            boxShadow: isMobile ? 'none' : undefined
        }}>
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                {!isMobile && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Datos de Venta
                    </Typography>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>Cliente</Typography>
                        <Button
                            fullWidth
                            variant="outlined"
                            color={selectedCustomer ? 'primary' : 'inherit'}
                            startIcon={<CustomerIcon />}
                            onClick={onSelectCustomer}
                            sx={{ justifyContent: 'flex-start', textAlign: 'left', borderRadius: 1.5, textTransform: 'none', py: 1 }}
                        >
                            <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {selectedCustomer ? selectedCustomer.name : 'Seleccionar Cliente'}
                            </Box>
                        </Button>
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>Notas</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Notas de la venta..."
                            variant="outlined"
                            size="small"
                            value={notes || ''}
                            onChange={onNotesChange}
                            InputProps={{ sx: { borderRadius: 1.5 } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>Promoción</Typography>
                        <Select
                            fullWidth
                            size="small"
                            value={selectedPromotion ? (selectedPromotion._id || selectedPromotion.id) : ''}
                            displayEmpty
                            onChange={onPromotionChange}
                            sx={{ borderRadius: 1.5 }}
                        >
                            <MenuItem value="">Sin promoción</MenuItem>
                            {promotions.map(promo => (
                                <MenuItem key={promo._id || promo.id} value={promo._id || promo.id}>
                                    {promo.nombre || promo.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SaleDetailsSection;
