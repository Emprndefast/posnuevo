/**
 * useAnalytics — Hook centralizado para el sistema de métricas y análisis de POSENT
 *
 * Gestiona:
 * - Filtros globales (timeRange + fechas personalizadas)
 * - Carga de datos de analytics desde el backend
 * - Estado de loading/error
 * - Exportación con filtros activos
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    startOfDay, endOfDay, startOfWeek, endOfWeek,
    startOfMonth, endOfMonth, startOfYear, endOfYear,
    subDays, subMonths, format,
} from 'date-fns';
import api from '../api/api';

// ─── Definiciones de rangos de tiempo ────────────────────────────────────────
export const TIME_RANGES = [
    { value: 'today', label: 'Hoy' },
    { value: 'yesterday', label: 'Ayer' },
    { value: 'last7', label: 'Últimos 7 días' },
    { value: 'last30', label: 'Últimos 30 días' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mes' },
    { value: 'lastMonth', label: 'Mes pasado' },
    { value: 'year', label: 'Este año' },
    { value: 'custom', label: 'Rango personalizado' },
];

// ─── Calcular rango de fechas en el cliente (mirrors backend logic) ───────────
export const calcClientDateRange = (timeRange, customStart, customEnd) => {
    const now = new Date();
    if (timeRange === 'custom' && customStart && customEnd) {
        return { startDate: new Date(customStart), endDate: new Date(customEnd) };
    }
    switch (timeRange) {
        case 'today': return { startDate: startOfDay(now), endDate: endOfDay(now) };
        case 'yesterday': { const y = subDays(now, 1); return { startDate: startOfDay(y), endDate: endOfDay(y) }; }
        case 'last7': return { startDate: startOfDay(subDays(now, 6)), endDate: endOfDay(now) };
        case 'last30': return { startDate: startOfDay(subDays(now, 29)), endDate: endOfDay(now) };
        case 'week': return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfWeek(now, { weekStartsOn: 1 }) };
        case 'month': return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
        case 'lastMonth': { const lm = subMonths(now, 1); return { startDate: startOfMonth(lm), endDate: endOfMonth(lm) }; }
        case 'year': return { startDate: startOfYear(now), endDate: endOfYear(now) };
        default: return { startDate: startOfWeek(now, { weekStartsOn: 1 }), endDate: endOfDay(now) };
    }
};

// ─── Determinar groupBy óptimo según el rango ────────────────────────────────
export const getOptimalGroupBy = (timeRange) => {
    switch (timeRange) {
        case 'today':
        case 'yesterday': return 'hour';
        case 'last7':
        case 'week': return 'day';
        case 'last30':
        case 'month':
        case 'lastMonth': return 'day';
        case 'year': return 'month';
        default: return 'day';
    }
};

// ─── Estado inicial de analytics ─────────────────────────────────────────────
const INITIAL_DATA = {
    summary: {
        totalRevenue: 0, totalOrders: 0, avgTicket: 0,
        totalItems: 0, uniqueCustomers: 0,
        revenueTrend: 0, ordersTrend: 0, ticketTrend: 0,
    },
    charts: {
        salesByTime: [],
        salesByCategory: [],
        revenueByPayment: [],
    },
    tables: {
        topProducts: [],
        topCustomers: [],
    },
    comparison: {
        current: { revenue: 0, orders: 0 },
        previous: { revenue: 0, orders: 0 },
    },
    period: {},
};

// ─── Hook principal ───────────────────────────────────────────────────────────
export const useAnalytics = (autoFetch = true) => {
    const [timeRange, setTimeRange] = useState('week');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [groupBy, setGroupBy] = useState('day');
    const [data, setData] = useState(INITIAL_DATA);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);

    // El label descriptivo del rango activo
    const rangeLabel = TIME_RANGES.find(r => r.value === timeRange)?.label ?? 'Personalizado';
    const { startDate, endDate } = calcClientDateRange(timeRange, customStart, customEnd);

    // ── Fetch analytics ─────────────────────────────────────────────────────────
    const fetchAnalytics = useCallback(async (overrideRange, overrideGroupBy) => {
        // Cancelar petición anterior si existe
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const activeRange = overrideRange ?? timeRange;
        const activeGroupBy = overrideGroupBy ?? groupBy;
        const params = {
            timeRange: activeRange,
            groupBy: activeGroupBy,
        };
        if (activeRange === 'custom') {
            params.customStart = customStart;
            params.customEnd = customEnd;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await api.get('/analytics/sales', {
                params,
                signal: abortRef.current.signal,
            });

            if (response.data?.success) {
                setData(prev => ({ ...INITIAL_DATA, ...response.data.data }));
            }
        } catch (err) {
            if (err.name === 'CanceledError' || err.name === 'AbortError') return; // ignorar si cancelado
            console.error('useAnalytics error:', err);
            setError(err.response?.data?.message || 'Error al cargar análisis');
        } finally {
            setLoading(false);
        }
    }, [timeRange, groupBy, customStart, customEnd]);

    // ── Cambiar rango de tiempo ──────────────────────────────────────────────────
    const changeTimeRange = useCallback((newRange) => {
        setTimeRange(newRange);
        const optimalGroup = getOptimalGroupBy(newRange);
        setGroupBy(optimalGroup);
        // Fetch inmediato con los nuevos valores
        setTimeout(() => fetchAnalytics(newRange, optimalGroup), 0);
    }, [fetchAnalytics]);

    // ── Cambiar groupBy ──────────────────────────────────────────────────────────
    const changeGroupBy = useCallback((newGroupBy) => {
        setGroupBy(newGroupBy);
        fetchAnalytics(timeRange, newGroupBy);
    }, [fetchAnalytics, timeRange]);

    // ── Fetch inicial y cuando cambien time/group ─────────────────────────────────
    useEffect(() => {
        if (autoFetch) fetchAnalytics();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, []); // eslint-disable-line

    // ── Exportar datos con los filtros activos ────────────────────────────────────
    const getExportParams = useCallback(() => {
        const params = { timeRange };
        if (timeRange === 'custom') {
            params.customStart = customStart;
            params.customEnd = customEnd;
        }
        return params;
    }, [timeRange, customStart, customEnd]);

    const fetchExportData = useCallback(async (type) => {
        const params = { type, ...getExportParams() };
        const response = await api.get('/analytics/export', { params });
        return response.data?.data;
    }, [getExportParams]);

    return {
        // Estado de filtros
        timeRange, setTimeRange: changeTimeRange,
        customStart, setCustomStart,
        customEnd, setCustomEnd,
        groupBy, setGroupBy: changeGroupBy,
        rangeLabel,
        startDate, endDate,
        // Datos
        data,
        summary: data.summary,
        charts: data.charts,
        tables: data.tables,
        comparison: data.comparison,
        // Estado
        loading, error,
        // Acciones
        refresh: fetchAnalytics,
        fetchExportData,
        getExportParams,
    };
};

export default useAnalytics;
