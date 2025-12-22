import api from '../api/api';

export const generateSetupMessage = async (context, userInput) => {
  try {
    const response = await api.post('/setup/chat', {
      context,
      userInput
    });
    return response.data.message;
  } catch (error) {
    console.error('Error al generar mensaje:', error);
    throw new Error('No se pudo generar la respuesta. Por favor, intenta nuevamente.');
  }
}; 