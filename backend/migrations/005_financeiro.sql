CREATE TABLE IF NOT EXISTS contas_bancarias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  banco VARCHAR(100) NOT NULL,
  agencia VARCHAR(20) NULL,
  conta VARCHAR(30) NULL,
  saldo_inicial DECIMAL(14,2) NOT NULL DEFAULT 0,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lancamentos_financeiros (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conta_bancaria_id INT UNSIGNED NOT NULL,
  animal_id INT UNSIGNED NULL,
  area_id INT UNSIGNED NULL,
  pasto_id INT UNSIGNED NULL,
  tipo ENUM('ENTRADA','SAIDA') NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor DECIMAL(14,2) NOT NULL,
  data_lancamento DATE NOT NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lancamento_conta FOREIGN KEY (conta_bancaria_id) REFERENCES contas_bancarias(id),
  CONSTRAINT fk_lancamento_animal FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE SET NULL,
  CONSTRAINT fk_lancamento_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
  CONSTRAINT fk_lancamento_pasto FOREIGN KEY (pasto_id) REFERENCES pastos(id) ON DELETE SET NULL,
  UNIQUE KEY uq_venda_animal (animal_id, categoria),
  INDEX idx_lancamento_data (data_lancamento)
);
