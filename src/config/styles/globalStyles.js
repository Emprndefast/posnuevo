const globalStyles = {
  // Estilos de contenedores
  container: {
    padding: '1rem',
    margin: '0 auto',
    maxWidth: '1200px',
  },

  // Estilos de tarjetas
  card: {
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
  },

  // Estilos de formularios
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '600px',
    margin: '0 auto',
  },

  // Estilos de botones
  button: {
    primary: {
      backgroundColor: '#1976d2',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#1565c0',
      },
    },
    secondary: {
      backgroundColor: '#dc004e',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#c51162',
      },
    },
    outlined: {
      border: '1px solid #1976d2',
      color: '#1976d2',
      '&:hover': {
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
      },
    },
  },

  // Estilos de tablas
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    '& th, & td': {
      padding: '0.75rem',
      borderBottom: '1px solid #e0e0e0',
      textAlign: 'left',
    },
    '& th': {
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold',
    },
  },

  // Estilos de alertas
  alert: {
    success: {
      backgroundColor: '#4caf50',
      color: '#ffffff',
    },
    error: {
      backgroundColor: '#f44336',
      color: '#ffffff',
    },
    warning: {
      backgroundColor: '#ff9800',
      color: '#ffffff',
    },
    info: {
      backgroundColor: '#2196f3',
      color: '#ffffff',
    },
  },

  // Estilos de modales
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '600px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    padding: '2rem',
  },

  // Estilos de inputs
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
    '&:focus': {
      outline: 'none',
      borderColor: '#1976d2',
    },
  },

  // Estilos de selectores
  select: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#ffffff',
    '&:focus': {
      outline: 'none',
      borderColor: '#1976d2',
    },
  },

  // Estilos de etiquetas
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333333',
  },

  // Estilos de mensajes de error
  errorMessage: {
    color: '#f44336',
    fontSize: '0.875rem',
    marginTop: '0.25rem',
  },
};

export default globalStyles; 