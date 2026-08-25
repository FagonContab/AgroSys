CREATE TABLE IF NOT EXISTS categorias_despesa (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(60) NOT NULL UNIQUE,
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO categorias_despesa (nome) VALUES ('Vacina'), ('Aquisição de animais'), ('Poste');
