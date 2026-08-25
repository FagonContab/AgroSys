CREATE TABLE IF NOT EXISTS vendas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  area_id INT UNSIGNED NOT NULL,
  numero_nota_fiscal VARCHAR(60) NOT NULL,
  comprador_nome VARCHAR(150) NOT NULL,
  comprador_documento VARCHAR(30) NOT NULL,
  comprador_telefone VARCHAR(30) NULL,
  comprador_endereco VARCHAR(255) NULL,
  data_emissao DATE NOT NULL,
  valor_total DECIMAL(14,2) NULL,
  data_primeiro_vencimento DATE NULL,
  quantidade_parcelas SMALLINT UNSIGNED NULL,
  conta_bancaria_id INT UNSIGNED NULL,
  observacoes VARCHAR(1000) NULL,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_venda_area FOREIGN KEY (area_id) REFERENCES areas(id),
  CONSTRAINT fk_venda_conta FOREIGN KEY (conta_bancaria_id) REFERENCES contas_bancarias(id),
  UNIQUE KEY uq_venda_nota_inscricao (area_id, numero_nota_fiscal)
);

CREATE TABLE IF NOT EXISTS venda_animais (
  venda_id BIGINT UNSIGNED NOT NULL,
  animal_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (venda_id, animal_id),
  UNIQUE KEY uq_animal_vendido (animal_id),
  CONSTRAINT fk_venda_animal_venda FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
  CONSTRAINT fk_venda_animal_animal FOREIGN KEY (animal_id) REFERENCES animais(id)
);

ALTER TABLE lancamentos_financeiros
  ADD COLUMN venda_id BIGINT UNSIGNED NULL AFTER animal_id,
  ADD CONSTRAINT fk_lancamento_venda FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE SET NULL,
  ADD INDEX idx_lancamento_venda (venda_id);
