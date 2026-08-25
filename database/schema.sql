CREATE DATABASE IF NOT EXISTS agrosys
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE agrosys;

CREATE TABLE IF NOT EXISTS animais (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  brinco VARCHAR(30) NOT NULL,
  nome VARCHAR(100) NULL,
  especie VARCHAR(50) NOT NULL,
  raca VARCHAR(80) NULL,
  sexo ENUM('M', 'F') NOT NULL,
  data_nascimento DATE NULL,
  data_compra DATE NULL,
  valor_compra DECIMAL(12, 2) NULL,
  fornecedor VARCHAR(150) NULL,
  numero_nota_fiscal VARCHAR(60) NULL,
  peso DECIMAL(10, 2) NULL,
  status ENUM('ATIVO', 'VENDIDO', 'MORTO') NOT NULL DEFAULT 'ATIVO',
  observacoes TEXT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_animais_brinco (brinco),
  INDEX idx_animais_nome (nome),
  INDEX idx_animais_status (status)
);
