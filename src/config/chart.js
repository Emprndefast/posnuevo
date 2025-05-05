import { Chart, registerables, Filler } from 'chart.js';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);
Chart.register(Filler);

// Configuración global de Chart.js
Chart.defaults.font.family = "'Roboto', 'Helvetica', 'Arial', sans-serif";
Chart.defaults.color = '#666';
Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.1)';
Chart.defaults.elements.line.tension = 0.4;
Chart.defaults.plugins.legend.position = 'top';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 4;

// Configuración específica para el plugin Filler
Chart.defaults.plugins.filler = {
  propagate: false,
  drawTime: 'beforeDraw'
};

export default Chart; 