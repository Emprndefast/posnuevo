import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const generateSetupMessage = async (context, userInput) => {
  try {
    const response = await axios.post(`${API_URL}/api/setup/chat`, {
      context,
      userInput
    });
    return response.data.message;
  } catch (error) {
    console.error('Error al generar mensaje:', error);
    throw new Error('No se pudo generar la respuesta. Por favor, intenta nuevamente.');
  }
}; 