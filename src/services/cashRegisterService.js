import api from '../api/api';

const cashRegisterService = {
    /**
     * Abrir caja
     * @param {Object} data { opening_amount, opening_notes, branch_id }
     */
    async openCashRegister(data) {
        try {
            const response = await api.post('/cash-register/open', data);
            return response.data;
        } catch (error) {
            console.error('Error opening cash register:', error);
            throw error;
        }
    },

    /**
     * Obtener caja activa
     * @param {string} branchId
     */
    async getActiveCashRegister(branchId) {
        try {
            const params = branchId ? { branch_id: branchId } : {};
            const response = await api.get('/cash-register/active', { params });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return { success: false, message: 'No hay caja abierta' };
            }
            console.error('Error getting active cash register:', error);
            throw error;
        }
    },

    /**
     * Cerrar caja
     * @param {string} id - ID de la caja
     * @param {Object} data { cash_breakdown, closing_notes }
     */
    async closeCashRegister(id, data) {
        try {
            const response = await api.post(`/cash-register/${id}/close`, data);
            return response.data;
        } catch (error) {
            console.error('Error closing cash register:', error);
            throw error;
        }
    },

    /**
     * Obtener historial de cajas
     * @param {Object} params { page, limit, status, branch_id }
     */
    async getCashRegisterHistory(params = {}) {
        try {
            const response = await api.get('/cash-register/history', { params });
            return response.data;
        } catch (error) {
            console.error('Error getting cash register history:', error);
            throw error;
        }
    },

    /**
     * Obtener reporte detallado de una caja
     * @param {string} id - ID de la caja
     */
    async getCashRegisterReport(id) {
        try {
            const response = await api.get(`/cash-register/${id}/report`);
            return response.data;
        } catch (error) {
            console.error('Error getting cash register report:', error);
            throw error;
        }
    },

    /**
     * Obtener resumen del día actual
     * @param {string} branchId
     */
    async getDailySummary(branchId) {
        try {
            const params = branchId ? { branch_id: branchId } : {};
            const response = await api.get('/cash-register/daily-summary', { params });
            return response.data;
        } catch (error) {
            console.error('Error getting daily summary:', error);
            throw error;
        }
    }
};

export default cashRegisterService;
