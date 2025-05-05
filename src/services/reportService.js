import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

class ReportService {
  constructor() {
    this.salesCollection = collection(db, 'sales');
    this.productsCollection = collection(db, 'products');
  }

  async generateSalesReport(startDate, endDate) {
    try {
      const q = query(
        this.salesCollection,
        where('date', '>=', Timestamp.fromDate(new Date(startDate))),
        where('date', '<=', Timestamp.fromDate(new Date(endDate))),
        where('status', '==', 'completed'),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const sales = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const totalSales = sales.reduce((total, sale) => total + sale.total, 0);
      const totalItems = sales.reduce((total, sale) => 
        total + sale.items.reduce((sum, item) => sum + item.quantity, 0), 0
      );

      return {
        sales,
        totalSales,
        totalItems,
        startDate: format(new Date(startDate), 'dd/MM/yyyy', { locale: es }),
        endDate: format(new Date(endDate), 'dd/MM/yyyy', { locale: es })
      };
    } catch (error) {
      throw new Error('Error al generar el reporte de ventas: ' + error.message);
    }
  }

  async generateDailyReport() {
    try {
      const today = new Date();
      const start = startOfDay(today);
      const end = endOfDay(today);

      const q = query(
        this.salesCollection,
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end)),
        where('status', '==', 'completed'),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const sales = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const totalSales = sales.reduce((total, sale) => total + sale.total, 0);
      const totalItems = sales.reduce((total, sale) => 
        total + sale.items.reduce((sum, item) => sum + item.quantity, 0), 0
      );

      return {
        sales,
        totalSales,
        totalItems,
        date: format(today, 'dd/MM/yyyy', { locale: es })
      };
    } catch (error) {
      throw new Error('Error al generar el reporte diario: ' + error.message);
    }
  }

  async generateInventoryReport() {
    try {
      const q = query(
        this.productsCollection,
        orderBy('stock', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lowStock = products.filter(product => product.stock <= 10);
      const outOfStock = products.filter(product => product.stock === 0);

      return {
        products,
        lowStock,
        outOfStock,
        totalProducts: products.length,
        totalLowStock: lowStock.length,
        totalOutOfStock: outOfStock.length
      };
    } catch (error) {
      throw new Error('Error al generar el reporte de inventario: ' + error.message);
    }
  }

  async generateTopProductsReport(days = 30) {
    try {
      const startDate = subDays(new Date(), days);
      const q = query(
        this.salesCollection,
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('status', '==', 'completed'),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const sales = querySnapshot.docs.map(doc => doc.data());

      const productSales = {};
      sales.forEach(sale => {
        sale.items.forEach(item => {
          if (productSales[item.productId]) {
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].total += item.price * item.quantity;
          } else {
            productSales[item.productId] = {
              quantity: item.quantity,
              total: item.price * item.quantity
            };
          }
        });
      });

      const topProducts = Object.entries(productSales)
        .sort(([, a], [, b]) => b.quantity - a.quantity)
        .slice(0, 10);

      return {
        topProducts,
        period: `${days} días`,
        startDate: format(startDate, 'dd/MM/yyyy', { locale: es }),
        endDate: format(new Date(), 'dd/MM/yyyy', { locale: es })
      };
    } catch (error) {
      throw new Error('Error al generar el reporte de productos más vendidos: ' + error.message);
    }
  }

  generatePDFReport(data, title) {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text(title, 14, 15);
    
    // Fecha
    doc.setFontSize(10);
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 25);

    // Tabla
    if (data.sales) {
      const tableData = data.sales.map(sale => [
        format(sale.date.toDate(), 'dd/MM/yyyy HH:mm', { locale: es }),
        sale.items.reduce((sum, item) => sum + item.quantity, 0),
        `$${sale.total.toFixed(2)}`
      ]);

      doc.autoTable({
        startY: 35,
        head: [['Fecha', 'Items', 'Total']],
        body: tableData
      });
    }

    // Totales
    if (data.totalSales) {
      const finalY = doc.lastAutoTable.finalY || 35;
      doc.setFontSize(12);
      doc.text(`Total Ventas: $${data.totalSales.toFixed(2)}`, 14, finalY + 10);
      doc.text(`Total Items: ${data.totalItems}`, 14, finalY + 20);
    }

    return doc;
  }
}

export default new ReportService(); 