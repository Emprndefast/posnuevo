import { formatCurrency } from '../utils/format';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PAPER_WIDTH = 40; // Ancho del papel en caracteres

const center = (text, width = PAPER_WIDTH) => {
  const spaces = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(spaces) + text;
};

const right = (text, width = PAPER_WIDTH) => {
  const spaces = Math.max(0, width - text.length);
  return ' '.repeat(spaces) + text;
};

const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
};

const line = '-'.repeat(PAPER_WIDTH);
const doubleLine = '='.repeat(PAPER_WIDTH);

export const generateFiscalInvoice = (sale, businessInfo) => {
  let output = [];

  // Encabezado
  output.push(doubleLine);
  output.push(center(businessInfo.name.toUpperCase()));
  output.push(center(businessInfo.address));
  output.push(center(`Tel: ${businessInfo.phone}`));
  output.push(center(`RUC/NIT: ${businessInfo.ruc}`));
  output.push(doubleLine);

  // Información de la factura
  output.push(`FACTURA FISCAL #: ${sale.id?.slice(-8)}`);
  output.push(`FECHA: ${formatDate(sale.date)}`);
  output.push(`CAJERO: ${sale.sellerName}`);
  output.push(line);

  // Información del cliente
  output.push('CLIENTE:');
  output.push(`Nombre: ${sale.customerName || 'Cliente General'}`);
  if (sale.customerRuc) output.push(`RUC/NIT: ${sale.customerRuc}`);
  if (sale.customerAddress) output.push(`Dirección: ${sale.customerAddress}`);
  if (sale.customerPhone) output.push(`Tel: ${sale.customerPhone}`);
  output.push(line);

  // Detalle de productos
  output.push('CANT  DESCRIPCION           PRECIO   TOTAL');
  output.push(line);

  sale.items.forEach(item => {
    const quantity = item.quantity.toString().padStart(4);
    const name = item.name.substring(0, 20).padEnd(20);
    const price = formatCurrency(item.price).padStart(8);
    const total = formatCurrency(item.quantity * item.price).padStart(8);
    output.push(`${quantity} ${name} ${price} ${total}`);
  });

  output.push(line);

  // Totales
  output.push(right(`SUBTOTAL: ${formatCurrency(sale.subtotal)}`));
  if (sale.discount > 0) {
    const discountAmount = sale.subtotal * (sale.discount / 100);
    output.push(right(`DESCUENTO (${sale.discount}%): -${formatCurrency(discountAmount)}`));
  }
  
  // Impuestos
  const iva = sale.total * 0.19;
  output.push(right(`IVA (19%): ${formatCurrency(iva)}`));
  output.push(doubleLine);
  output.push(right(`TOTAL: ${formatCurrency(sale.total)}`));
  
  // Método de pago
  output.push(line);
  output.push(`MÉTODO DE PAGO: ${sale.paymentMethod.toUpperCase()}`);
  if (sale.paymentMethod === 'cash') {
    output.push(`EFECTIVO RECIBIDO: ${formatCurrency(sale.cashReceived)}`);
    output.push(`CAMBIO: ${formatCurrency(sale.cashReceived - sale.total)}`);
  }

  // Pie de página
  output.push(doubleLine);
  output.push(center('¡GRACIAS POR SU COMPRA!'));
  if (businessInfo.website) output.push(center(businessInfo.website));
  
  // Información fiscal
  output.push(line);
  output.push(center('FACTURA AUTORIZADA POR SUNAT'));
  output.push(center(`Autorización N° ${businessInfo.fiscalAuthorization}`));
  output.push(center('ORIGINAL: CLIENTE'));
  output.push(center(`Fecha/Hora: ${formatDate(new Date())}`));

  if (sale.fiscalCode) {
    output.push(center('*' + sale.fiscalCode + '*'));
  }

  return output.join('\n');
};

export const generatePreInvoice = (sale, businessInfo) => {
  let output = [];

  // Encabezado
  output.push(doubleLine);
  output.push(center('PRE-FACTURA'));
  output.push(center(businessInfo.name.toUpperCase()));
  output.push(center(businessInfo.address));
  output.push(center(`Tel: ${businessInfo.phone}`));
  output.push(doubleLine);

  // Información del documento
  output.push(`PRE-FACTURA #: ${sale.id?.slice(-6)}`);
  output.push(`FECHA: ${formatDate(sale.date)}`);
  output.push(`VENDEDOR: ${sale.sellerName}`);
  output.push(line);

  // Información del cliente
  if (sale.customerName) {
    output.push(`CLIENTE: ${sale.customerName}`);
    if (sale.customerPhone) output.push(`Tel: ${sale.customerPhone}`);
    output.push(line);
  }

  // Detalle de productos
  output.push('CANT  DESCRIPCION           PRECIO   TOTAL');
  output.push(line);

  sale.items.forEach(item => {
    const quantity = item.quantity.toString().padStart(4);
    const name = item.name.substring(0, 20).padEnd(20);
    const price = formatCurrency(item.price).padStart(8);
    const total = formatCurrency(item.quantity * item.price).padStart(8);
    output.push(`${quantity} ${name} ${price} ${total}`);
  });

  output.push(line);

  // Totales
  output.push(right(`SUBTOTAL: ${formatCurrency(sale.subtotal)}`));
  if (sale.discount > 0) {
    const discountAmount = sale.subtotal * (sale.discount / 100);
    output.push(right(`DESCUENTO (${sale.discount}%): -${formatCurrency(discountAmount)}`));
  }
  output.push(doubleLine);
  output.push(right(`TOTAL: ${formatCurrency(sale.total)}`));

  // Pie de página
  output.push(doubleLine);
  output.push(center('¡GRACIAS POR SU COMPRA!'));
  if (businessInfo.website) output.push(center(businessInfo.website));
  output.push(center('DOCUMENTO NO FISCAL'));
  output.push(center('NO VÁLIDO COMO FACTURA'));
  output.push(center(`Fecha/Hora: ${formatDate(new Date())}`));

  return output.join('\n');
};

export const generateProductLabel = (product, businessInfo) => {
  let output = [];

  // Encabezado
  output.push(center(businessInfo.name.substring(0, 20)));
  output.push(line);

  // Información del producto
  output.push(center(product.name.substring(0, 30)));
  output.push(center(`Código: ${product.code}`));
  output.push(center(`Precio: ${formatCurrency(product.price)}`));
  
  // Categoría si existe
  if (product.category) {
    output.push(center(product.category));
  }

  // Código de barras (simulado)
  if (product.barcode) {
    output.push(center('*' + product.barcode + '*'));
  }

  // Fecha de impresión
  output.push(center(formatDate(new Date())));

  return output.join('\n');
}; 