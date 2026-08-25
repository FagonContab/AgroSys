-- Permite que um mesmo pasto seja utilizado por mais de uma inscrição.
-- A collation do banco é case/accent insensitive; portanto nomes equivalentes
-- (inclusive com diferença apenas de caixa ou acento) são consolidados.

CREATE TABLE areas_pastos (
  area_id INT UNSIGNED NOT NULL,
  pasto_id INT UNSIGNED NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (area_id, pasto_id),
  CONSTRAINT fk_areas_pastos_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE,
  CONSTRAINT fk_areas_pastos_pasto FOREIGN KEY (pasto_id) REFERENCES pastos(id) ON DELETE CASCADE
);

ALTER TABLE animais ADD COLUMN area_id INT UNSIGNED NULL AFTER pasto_id;
UPDATE animais a JOIN pastos p ON p.id = a.pasto_id SET a.area_id = p.area_id;
ALTER TABLE animais ADD CONSTRAINT fk_animais_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL;

ALTER TABLE historico_pastos
  ADD COLUMN area_origem_id INT UNSIGNED NULL AFTER pasto_origem_id,
  ADD COLUMN area_destino_id INT UNSIGNED NULL AFTER pasto_destino_id;
UPDATE historico_pastos h LEFT JOIN pastos po ON po.id=h.pasto_origem_id LEFT JOIN pastos pd ON pd.id=h.pasto_destino_id
SET h.area_origem_id=po.area_id,h.area_destino_id=pd.area_id;
ALTER TABLE historico_pastos
  ADD CONSTRAINT fk_historico_area_origem FOREIGN KEY (area_origem_id) REFERENCES areas(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_historico_area_destino FOREIGN KEY (area_destino_id) REFERENCES areas(id) ON DELETE SET NULL;

-- Registra os vínculos atuais antes da consolidação.
INSERT IGNORE INTO areas_pastos(area_id,pasto_id) SELECT area_id,id FROM pastos;

CREATE TEMPORARY TABLE mapa_pastos AS
SELECT p.id AS antigo_id, canonico.id AS canonico_id
FROM pastos p
JOIN (
  SELECT MIN(id) id, LOWER(TRIM(nome)) nome_normalizado
  FROM pastos GROUP BY LOWER(TRIM(nome))
) canonico ON canonico.nome_normalizado=LOWER(TRIM(p.nome));

INSERT IGNORE INTO areas_pastos(area_id,pasto_id)
SELECT ap.area_id,m.canonico_id FROM areas_pastos ap JOIN mapa_pastos m ON m.antigo_id=ap.pasto_id;
UPDATE animais a JOIN mapa_pastos m ON m.antigo_id=a.pasto_id SET a.pasto_id=m.canonico_id;
UPDATE historico_pastos h JOIN mapa_pastos m ON m.antigo_id=h.pasto_origem_id SET h.pasto_origem_id=m.canonico_id;
UPDATE historico_pastos h JOIN mapa_pastos m ON m.antigo_id=h.pasto_destino_id SET h.pasto_destino_id=m.canonico_id;
UPDATE lancamentos_financeiros l JOIN mapa_pastos m ON m.antigo_id=l.pasto_id SET l.pasto_id=m.canonico_id;
DELETE ap FROM areas_pastos ap JOIN mapa_pastos m ON m.antigo_id=ap.pasto_id WHERE m.antigo_id<>m.canonico_id;
DELETE p FROM pastos p JOIN mapa_pastos m ON m.antigo_id=p.id WHERE m.antigo_id<>m.canonico_id;
DROP TEMPORARY TABLE mapa_pastos;

-- O campo legado permanece preenchido para compatibilidade, mas a relação válida
-- passa a ser areas_pastos. A unicidade global impede novos pastos duplicados.
ALTER TABLE pastos ADD INDEX idx_pastos_area_legado (area_id);
ALTER TABLE pastos DROP INDEX uq_pasto_area;
ALTER TABLE pastos ADD CONSTRAINT uq_pasto_nome UNIQUE (nome);
