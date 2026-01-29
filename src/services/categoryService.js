import api from '../config/api';

class CategoryService {
    // Obtener todas las categorías
    async getCategories(activeOnly = true) {
        try {
            const response = await api.get('/categories', {
                params: { activo: activeOnly }
            });
            return response.data.data;
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            throw error;
        }
    }

    // Crear nueva categoría
    async createCategory(categoryData) {
        try {
            const response = await api.post('/categories', categoryData);
            return response.data.data;
        } catch (error) {
            console.error('Error al crear categoría:', error);
            throw error;
        }
    }

    // Eliminar categoría (Soft delete)
    async deleteCategory(id) {
        try {
            await api.delete(`/categories/${id}`);
            return true;
        } catch (error) {
            console.error('Error al eliminar categoría:', error);
            throw error;
        }
    }
}

export default new CategoryService();
