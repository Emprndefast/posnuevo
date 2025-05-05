CREATE TABLE IF NOT EXISTS configuracion_bot (
  id INT PRIMARY KEY,
  notificar_stock_bajo BOOLEAN DEFAULT TRUE,
  notificar_stock_agotado BOOLEAN DEFAULT TRUE,
  notificar_ventas BOOLEAN DEFAULT TRUE,
  notificar_ventas_canceladas BOOLEAN DEFAULT TRUE,
  token_telegram VARCHAR(255),
  chat_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 