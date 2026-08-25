CREATE TABLE IF NOT EXISTS travas_financeiras (
  produtor_id INT UNSIGNED PRIMARY KEY,
  data_trava DATE NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_trava_produtor FOREIGN KEY (produtor_id) REFERENCES produtores(id) ON DELETE CASCADE,
  CONSTRAINT fk_trava_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
