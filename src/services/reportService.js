import axios from '../config/axios';

const getNetProfit = async (params) => {
  const response = await axios.get('/reports/net-profit', { params });
  return response.data;
};

const getSalesByBranch = async (params) => {
  const response = await axios.get('/reports/by-branch', { params });
  return response.data;
};

const getSalesByUser = async (params) => {
  const response = await axios.get('/reports/by-user', { params });
  return response.data;
};

// Función auxiliar para descargar blobs
const downloadBlob = (response, defaultFilename) => {
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const contentDisposition = response.headers['content-disposition'];
  let fileName = defaultFilename;
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
    if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
  }
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const downloadNetProfitExcel = async (params) => {
  const response = await axios.get('/reports/export/net-profit', {
    params,
    responseType: 'blob'
  });
  downloadBlob(response, 'reporte_ganancias.xlsx');
};

const downloadSalesByBranchExcel = async (params) => {
  const response = await axios.get('/reports/export/by-branch', {
    params,
    responseType: 'blob'
  });
  downloadBlob(response, 'ventas_por_sucursal.xlsx');
};

const downloadSalesByUserExcel = async (params) => {
  const response = await axios.get('/reports/export/by-user', {
    params,
    responseType: 'blob'
  });
  downloadBlob(response, 'ventas_por_usuario.xlsx');
};

const reportService = {
  getNetProfit,
  getSalesByBranch,
  getSalesByUser,
  downloadNetProfitExcel,
  downloadSalesByBranchExcel,
  downloadSalesByUserExcel
};

export default reportService;