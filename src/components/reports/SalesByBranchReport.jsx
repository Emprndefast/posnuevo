```
import React, { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import reportService from '../../services/reportService';
import { formatCurrency } from '../../utils/formatCurrency';
import { es } from 'date-fns/locale';

const SalesByBranchReport = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date());

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await reportService.getSalesByBranch({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching sales by branch:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            await reportService.downloadSalesByBranchExcel({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
        } catch (error) {
            console.error('Error exportando:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <DatePicker label="Desde" value={startDate} onChange={setStartDate} slotProps={{ textField: { size: 'small' } }} />
                    <DatePicker label="Hasta" value={endDate} onChange={setEndDate} slotProps={{ textField: { size: 'small' } }} />
                </LocalizationProvider>
                <Box sx={{ flexGrow: 1 }} />
                <Button variant="outlined" color="primary" onClick={handleExport}>
                    Exportar Excel
                </Button>
            </Box>

            {loading ? <CircularProgress /> : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Sucursal</TableCell>
                                <TableCell align="right">Cantidad Ventas</TableCell>
                                <TableCell align="right">Ticket Promedio</TableCell>
                                <TableCell align="right">Total Vendido</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>{row.branch_name}</TableCell>
                                    <TableCell align="right">{row.cantidad_ventas}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.ticket_promedio)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.total_venta)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default SalesByBranchReport;
