import api from '../config/api';

/**
 * Servicio para gestión de gastos/consumos
 */
const expenseService = {
    /**
     * Obtener lista de gastos con filtros
     * @param {Object} filters - Filtros de búsqueda
     * @param {number} page - Página actual
     * @param {number} limit - Límite por página
     */
    async getExpenses(filters = {}, page = 1, limit = 50) {
        try {
            const params = new URLSearchParams({
                page,
                limit,
                ...filters
            });

            const response = await api.get(`/expenses?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener gastos:', error);
            throw error;
        }
    },

    /**
     * Obtener un gasto por ID
     * @param {string} id - ID del gasto
     */
    async getExpenseById(id) {
        try {
            const response = await api.get(`/expenses/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error al obtener gasto:', error);
            throw error;
        }
    },

    /**
     * Crear un nuevo gasto
     * @param {Object} expenseData - Datos del gasto
     */
    async createExpense(expenseData) {
        try {
            const response = await api.post('/expenses', expenseData);
            return response.data;
        } catch (error) {
            console.error('Error al crear gasto:', error);
            throw error;
        }
    },

    /**
     * Actualizar un gasto existente
     * @param {string} id - ID del gasto
     * @param {Object} expenseData - Datos actualizados
     */
    async updateExpense(id, expenseData) {
        try {
            const response = await api.put(`/expenses/${id}`, expenseData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar gasto:', error);
            throw error;
        }
    },

    /**
     * Eliminar un gasto
     * @param {string} id - ID del gasto
     */
    async deleteExpense(id) {
        try {
            const response = await api.delete(`/expenses/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
            throw error;
        }
    },

    /**
     * Obtener estadísticas de gastos
     * @param {Object} filters - Filtros de fecha
     */
    async getExpenseStats(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const response = await api.get(`/expenses/stats/summary?${params}`);
            return response.data.data;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            throw error;
        }
    },

    /**
     * Aprobar un gasto pendiente
     * @param {string} id - ID del gasto
     * @param {string} comentarios - Comentarios de aprobación
     */
    async approveExpense(id, comentarios = '') {
        try {
            const response = await api.post(`/expenses/${id}/approve`, { comentarios });
            return response.data;
        } catch (error) {
            console.error('Error al aprobar gasto:', error);
            throw error;
        }
    },

    /**
     * Rechazar un gasto pendiente
     * @param {string} id - ID del gasto
     * @param {string} comentarios - Comentarios de rechazo
     */
    async rejectExpense(id, comentarios = '') {
        try {
            const response = await api.post(`/expenses/${id}/reject`, { comentarios });
            return response.data;
        } catch (error) {
            console.error('Error al rechazar gasto:', error);
            throw error;
        }
    },

    /**
     * Categorías de gastos disponibles
     */
    getCategories() {
        return [
            { value: 'mantenimiento', label: 'Mantenimiento', icon: '🔧' },
            { value: 'servicios', label: 'Servicios', icon: '💡' },
            { value: 'compras', label: 'Compras', icon: '🛒' },
            { value: 'nomina', label: 'Nómina', icon: '👥' },
            { value: 'impuestos', label: 'Impuestos', icon: '📋' },
            { value: 'transporte', label: 'Transporte', icon: '🚗' },
            { value: 'marketing', label: 'Marketing', icon: '📢' },
            { value: 'alquiler', label: 'Alquiler', icon: '🏢' },
            { value: 'otros', label: 'Otros', icon: '📦' }
        ];
    },

    /**
     * Métodos de pago disponibles
     */
    getPaymentMethods() {
        return [
            { value: 'efectivo', label: 'Efectivo' },
            { value: 'tarjeta', label: 'Tarjeta' },
            { value: 'transferencia', label: 'Transferencia' },
            { value: 'cheque', label: 'Cheque' },
            { value: 'otro', label: 'Otro' }
        ];
    }
};

export default expenseService;
