import React, { useState } from 'react';
import huggingFaceService from '../services/huggingFaceService';

const HuggingFaceTest = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await huggingFaceService.generateResponse(prompt);
      setResponse(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err.message || 'Error al generar la respuesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Prueba de Hugging Face</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prompt
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Escribe tu prompt aquí"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {loading ? 'Generando...' : 'Generar Respuesta'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Respuesta:</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};

export default HuggingFaceTest; 