import api from '../api/api';

const branchService = {
    /**
     * Obtener todas las sucursales del tenant
     */
    async getAll() {
        try {
            const response = await api.get('/branches');
            return response.data;
        } catch (error) {
            console.error('Error getting branches:', error);
            throw error;
        }
    },

    /**
     * Obtener una sucursal por ID
     * @param {string} id
     */
    async getById(id) {
        try {
            const response = await api.get(`/branches/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error getting branch ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crear nueva sucursal
     * @param {Object} data
     */
    async create(data) {
        try {
            const response = await api.post('/branches', data);
            return response.data;
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error;
        }
    },

    /**
     * Actualizar sucursal existente
     * @param {string} id
     * @param {Object} data
     */
    async update(id, data) {
        try {
            const response = await api.put(`/branches/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating branch ${id}:`, error);
            throw error;
        }
    },

    /**
     * Eliminar/Desactivar sucursal
     * @param {string} id
     */
    async delete(id) {
        try {
            const response = await api.delete(`/branches/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting branch ${id}:`, error);
            throw error;
        }
    }
};

export default branchService;
