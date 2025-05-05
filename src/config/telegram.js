// Configuración de Telegram
export const TELEGRAM_CONFIG = {
  API_BASE_URL: 'https://api.telegram.org/bot',
  MESSAGE_TYPES: {
    SALE: 'sale',
    LOW_STOCK: 'lowStock',
    OUT_OF_STOCK: 'outOfStock',
    DAILY_SUMMARY: 'dailySummary'
  },
  MESSAGE_TEMPLATES: {
    sale: (data) => `
<b>💰 Nueva Venta Realizada</b>
📅 Fecha: ${new Date(data.date).toLocaleString()}
👤 Cliente: ${data.customer || 'Cliente General'}
💳 Método de Pago: ${data.paymentMethod}

<b>Productos:</b>
${data.items.map(item => `• ${item.name} x${item.quantity} - $${item.price}`).join('\n')}

<b>Total: $${data.total}</b>
    `.trim(),
    lowStock: (data) => `
<b>⚠️ Alerta de Stock Bajo</b>
Producto: ${data.name}
Stock Actual: ${data.currentStock}
Stock Mínimo: ${data.minStock}
    `.trim(),
    outOfStock: (data) => `
<b>🚨 ALERTA: Producto Agotado</b>
Producto: ${data.name}
Código: ${data.code}

Se requiere reposición inmediata.
    `.trim(),
    dailySummary: (data) => `
<b>📊 Resumen Diario de Ventas</b>
📅 Fecha: ${new Date(data.date).toLocaleDateString()}
💰 Total Ventas: $${data.totalSales}
🛒 Total Productos Vendidos: ${data.totalItems}
👤 Total Clientes: ${data.totalCustomers}
    `.trim()
  },
  ERROR_MESSAGES: {
    CONNECTION_ERROR: 'Error al conectar con Telegram',
    INVALID_CONFIG: 'La configuración de Telegram está incompleta',
    SEND_ERROR: 'Error al enviar mensaje a Telegram'
  }
};