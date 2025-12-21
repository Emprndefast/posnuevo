import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const huggingFaceService = {
  generateResponse: async (prompt) => {
    try {
      const response = await api.post('/huggingface/generate', { prompt });
      return response.data;
    } catch (error) {
      console.error('Error en Hugging Face Service:', error);
      throw error;
    }
  }
};

export default huggingFaceService; 