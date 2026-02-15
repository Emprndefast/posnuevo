import React, { useState, useEffect } from 'react';
import React, { useState, useEffect } from 'react';
import { Box, Paper, Grid, Typography, CircularProgress, Card, CardContent, Divider, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import reportService from '../../services/reportService';
import { formatCurrency } from '../../utils/formatCurrency';
import { es } from 'date-fns/locale';

const NetProfitReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date());

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportService.getNetProfit({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching net profit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            // Podríamos usar un servicio dedicado, pero axios directo funciona para blobs
            // const axios = require('axios').default; // O usar instancia configurada
            // Importar instancia global si es posible: import axios from '../../config/axios';
            // Asumiendo que reportService lo expone o lo hacemos vía window.open (menos seguro)
            // Mejor opción: Método en reportService
            await reportService.downloadNetProfitExcel({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
        } catch (error) {
            console.error('Error descargando Excel:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    if (loading && !data) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker label="Desde" value={startDate} onChange={setStartDate} slotProps={{ textField: { size: 'small' } }} />
                    <DatePicker label="Hasta" value={endDate} onChange={setEndDate} slotProps={{ textField: { size: 'small' } }} />
                </LocalizationProvider>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="outlined" color="success" onClick={handleExport}>
                    Exportar Excel
                </Button>
            </Box>

            {data && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
                            <CardContent>
                                <Typography variant="h6">Ganancia Neta</Typography>
                                <Typography variant="h4" fontWeight="bold">
                                    {formatCurrency(data.ganancia_neta)}
                                </Typography>
                                <Typography variant="body2">Margen Neto: {data.margenes.neto}%</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="text.secondary">Ventas Totales</Typography>
                                <Typography variant="h4">
                                    {formatCurrency(data.ventas_netas)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="text.secondary">Gastos Operativos</Typography>
                                <Typography variant="h4" color="error.main">
                                    {formatCurrency(data.gastos_operativos)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Detalle Financiero</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography>Ventas Brutas</Typography>
                                <Typography>{formatCurrency(data.ventas_netas)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'error.main' }}>
                                <Typography>Costo de Ventas (COGS)</Typography>
                                <Typography>- {formatCurrency(data.costo_ventas)}</Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontWeight: 'bold' }}>
                                <Typography>Ganancia Bruta</Typography>
                                <Typography>{formatCurrency(data.ganancia_bruta)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'error.main' }}>
                                <Typography>Gastos Operativos</Typography>
                                <Typography>- {formatCurrency(data.gastos_operativos)}</Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontWeight: 'bold', color: 'success.main', fontSize: '1.2rem' }}>
                                <Typography>Ganancia Neta</Typography>
                                <Typography>{formatCurrency(data.ganancia_neta)}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default NetProfitReport;
