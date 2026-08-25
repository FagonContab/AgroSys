CREATE TABLE IF NOT EXISTS historico_status (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  animal_id INT UNSIGNED NOT NULL,
  status_origem ENUM('ATIVO', 'VENDIDO', 'MORTO') NULL,
  status_destino ENUM('ATIVO', 'VENDIDO', 'MORTO') NOT NULL,
  alterado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historico_status_animal FOREIGN KEY (animal_id) REFERENCES animais(id) ON DELETE CASCADE,
  INDEX idx_historico_status_data (status_destino, alterado_em)
);

INSERT INTO historico_status (animal_id, status_origem, status_destino, alterado_em)
SELECT a.id, 'ATIVO', 'VENDIDO', a.atualizado_em FROM animais a
WHERE a.status = 'VENDIDO' AND NOT EXISTS (
  SELECT 1 FROM historico_status h WHERE h.animal_id = a.id AND h.status_destino = 'VENDIDO'
);
