CREATE TABLE IF NOT EXISTS historico_pastos (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  animal_id INT UNSIGNED NOT NULL,
  pasto_origem_id INT UNSIGNED NULL,
  pasto_destino_id INT UNSIGNED NULL,
  movimentado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observacao VARCHAR(255) NULL,
  CONSTRAINT fk_historico_animal FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  CONSTRAINT fk_historico_origem FOREIGN KEY (pasto_origem_id) REFERENCES pastos(id) ON DELETE SET NULL,
  CONSTRAINT fk_historico_destino FOREIGN KEY (pasto_destino_id) REFERENCES pastos(id) ON DELETE SET NULL,
  INDEX idx_historico_data (movimentado_em), INDEX idx_historico_animal (animal_id)
);

INSERT INTO historico_pastos (animal_id, pasto_destino_id, movimentado_em, observacao)
SELECT a.id, a.pasto_id, COALESCE(a.atualizado_em, a.criado_em), 'Posição inicial importada'
FROM animais a WHERE a.pasto_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM historico_pastos h WHERE h.animal_id = a.id);
