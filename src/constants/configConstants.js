// Constantes para la configuración del sistema

// Idiomas disponibles
export const IDIOMAS = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
  { value: 'pt', label: 'Português' },
];

// Zonas horarias
export const ZONAS_HORARIAS = [
  { value: 'America/Lima', label: 'Lima (GMT-5)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
  { value: 'America/New_York', label: 'Nueva York (GMT-4)' },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+2)' },
  { value: 'Europe/London', label: 'Londres (GMT+1)' },
];

// Formatos de fecha
export const FORMATOS_FECHA = [
  { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
  { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
];

// Formatos de hora
export const FORMATOS_HORA = [
  { value: '24h', label: '24 horas (14:30)' },
  { value: '12h', label: '12 horas (2:30 PM)' },
];

// Temas disponibles
export const TEMAS = [
  { value: 'claro', label: 'Claro' },
  { value: 'oscuro', label: 'Oscuro' },
  { value: 'sistema', label: 'Sistema' },
];

// Monedas disponibles
export const MONEDAS = [
  { value: 'PEN', label: 'Soles (PEN)', symbol: 'S/' },
  { value: 'USD', label: 'Dólares (USD)', symbol: '$' },
  { value: 'EUR', label: 'Euros (EUR)', symbol: '€' },
  { value: 'MXN', label: 'Pesos Mexicanos (MXN)', symbol: '$' },
];

// Tamaños de etiqueta
export const TAMANOS_ETIQUETA = [
  { value: 'pequeno', label: 'Pequeño' },
  { value: 'mediano', label: 'Mediano' },
  { value: 'grande', label: 'Grande' },
];

// Tipos de papel
export const TIPOS_PAPEL = [
  { value: 'termico', label: 'Térmico' },
  { value: 'normal', label: 'Normal' },
];

// Impresoras disponibles
export const IMPRESORAS = [
  { value: 'impresora1', label: 'Impresora 1' },
  { value: 'impresora2', label: 'Impresora 2' },
  { value: 'impresora3', label: 'Impresora 3' },
];

// Configuración por defecto
export const CONFIG_DEFAULT = {
  inventario: {
    mostrarAlertasStock: true,
    nivelAlertaStock: 5,
    mostrarHistorialMovimientos: true,
    permitirStockNegativo: false
  },
  respaldo: {
    respaldoAutomatico: true,
    frecuenciaRespaldo: 'diario', // 'diario', 'semanal', 'mensual'
    ultimoRespaldo: null,
    rutaRespaldo: null
  },
  interfaz: {
    temaOscuro: false,
    mostrarNotificaciones: true,
    idioma: 'es'
  },
  ventas: {
    mostrarConfirmacionVenta: true,
    permitirDescuentos: true,
    maximoDescuento: 20,
    redondearTotal: true
  },
  impresion: {
    impresoraPredeterminada: null,
    formatoTicket: 'A4',
    mostrarLogo: true,
    mostrarCodigoBarras: true
  }
};

export const FRECUENCIAS_RESPALDO = [
  { value: 'diario', label: 'Diario' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' }
];

export const FORMATOS_IMPRESION = [
  { value: 'A4', label: 'A4' },
  { value: 'ticket', label: 'Ticket' },
  { value: 'etiqueta', label: 'Etiqueta' }
]; 