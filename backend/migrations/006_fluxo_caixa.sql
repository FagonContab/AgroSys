CREATE TABLE IF NOT EXISTS titulos_financeiros (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('RECEBER','PAGAR') NOT NULL,
  fornecedor VARCHAR(150) NOT NULL,
  data_vencimento DATE NOT NULL,
  valor DECIMAL(14,2) NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_titulos_vencimento (data_vencimento, tipo)
);
