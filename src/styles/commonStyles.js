export const pageStyles = {
  root: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  container: {
    flex: 1,
    py: { xs: 2, sm: 3, md: 4 },
    px: { xs: 2, sm: 3 },
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 2, sm: 3 },
    overflow: 'auto'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: { xs: 2, sm: 3 },
    flex: 1
  }
};

export const cardStyles = {
  root: {
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden'
  },
  header: {
    p: { xs: 2, sm: 3 },
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'flex-start', sm: 'center' },
    gap: { xs: 1, sm: 2 }
  },
  title: {
    fontSize: { xs: '1.1rem', sm: '1.25rem' },
    fontWeight: 600
  },
  subtitle: {
    mt: 0.5
  },
  actions: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    justifyContent: { xs: 'flex-start', sm: 'flex-end' }
  },
  content: {
    p: { xs: 2, sm: 3 }
  }
};

export const sectionStyles = {
  root: {
    width: '100%'
  },
  grid: {
    width: '100%',
    margin: 0
  },
  item: {
    p: 0
  }
};

export const tableStyles = {
  root: {
    width: '100%',
    overflowX: 'auto'
  },
  table: {
    minWidth: 650
  },
  header: {
    backgroundColor: 'background.paper'
  },
  row: {
    '&:last-child td, &:last-child th': {
      border: 0
    }
  },
  cell: {
    whiteSpace: 'nowrap'
  }
};

export const formStyles = {
  root: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  field: {
    width: '100%'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1,
    mt: 2
  }
};

export const dialogStyles = {
  paper: {
    width: '100%',
    maxWidth: { xs: '95%', sm: 600 },
    margin: { xs: 2, sm: 4 }
  },
  content: {
    p: { xs: 2, sm: 3 }
  },
  actions: {
    p: { xs: 2, sm: 3 },
    gap: 1
  }
};

// Estilos comunes para toda la aplicación
export const commonStyles = {
  // Contenedor principal
  pageContainer: {
    padding: { xs: 2, sm: 3, md: 4 },
    width: '100%',
    maxWidth: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },

  // Tarjetas
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    '& .MuiCardHeader-root': {
      padding: { xs: 2, sm: 3 },
    },
    '& .MuiCardContent-root': {
      padding: { xs: 2, sm: 3 },
      flex: 1,
    },
  },

  // Gráficos
  chartContainer: {
    width: '100%',
    height: { xs: 200, sm: 300, md: 400 },
    marginTop: 2,
    marginBottom: 2,
  },

  // Tablas
  table: {
    '& .MuiTableCell-root': {
      padding: { xs: 1, sm: 2 },
      whiteSpace: 'nowrap',
    },
    '& .MuiTableCell-head': {
      fontWeight: 'bold',
      backgroundColor: 'background.paper',
    },
  },

  // Botones
  button: {
    borderRadius: 8,
    textTransform: 'none',
    padding: '8px 16px',
    '&.MuiButton-contained': {
      boxShadow: 'none',
    },
  },

  // Campos de formulario
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 8,
    },
  },

  // Chips y badges
  chip: {
    borderRadius: 16,
    height: 24,
    fontSize: '0.75rem',
  },

  // Estadísticas
  statCard: {
    textAlign: 'center',
    padding: { xs: 2, sm: 3 },
    '& .MuiTypography-h4': {
      fontSize: { xs: '1.5rem', sm: '2rem' },
    },
  },

  // Filtros y búsqueda
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 2,
    marginBottom: 3,
    '& > *': {
      minWidth: { xs: '100%', sm: 200 },
    },
  },

  // Paginación
  pagination: {
    padding: 2,
    display: 'flex',
    justifyContent: 'center',
    '& .MuiPaginationItem-root': {
      margin: '0 4px',
    },
  },

  // Iconos
  icon: {
    fontSize: { xs: '1.5rem', sm: '2rem' },
  },

  // Responsive layout
  responsiveGrid: {
    display: 'grid',
    gap: { xs: 2, sm: 3 },
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(3, 1fr)',
      lg: 'repeat(4, 1fr)',
    },
  },
}; 