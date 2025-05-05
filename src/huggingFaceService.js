import axios from 'axios';

// Usar la variable de entorno y la ruta correcta
const LOCAL_API_URL = `${process.env.REACT_APP_API_URL}/api/huggingface/generate`;

export async function generateResponseFromHuggingFace(prompt) {
  try {
    const response = await axios.post(
      LOCAL_API_URL,
      { prompt },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // Adaptar para array u objeto
    let text = '';
    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      text = response.data[0].generated_text;
    } else if (response.data?.generated_text) {
      text = response.data.generated_text;
    } else {
      console.error('❌ Respuesta inválida del modelo:', response.data);
      throw new Error('No se recibió una respuesta válida del modelo');
    }
    return text.trim();
  } catch (error) {
    console.error("❌ Error en HuggingFace (proxy backend):", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        headers: error.config?.headers,
      }
    });

    if (error.response?.status === 401) {
      return "Error de autenticación. Por favor, verifica que tu API key de Hugging Face sea válida y esté configurada correctamente en el archivo .env del backend.";
    } else if (error.response?.status === 429) {
      return "Se ha excedido el límite de solicitudes. Por favor, espera unos minutos antes de intentar nuevamente.";
    } else if (error.code === 'ECONNABORTED') {
      return "La solicitud ha tardado demasiado. Por favor, intenta nuevamente.";
    }
    return "Ocurrió un error al generar la respuesta. Por favor, verifica tu conexión a internet e intenta nuevamente.";
  }
}
