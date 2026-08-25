UPDATE lancamentos_financeiros l
SET l.descricao = CONCAT(
  l.descricao, ' - ',
  (SELECT COUNT(*) FROM animais a
   WHERE a.brinco LIKE CONCAT(SUBSTRING_INDEX(l.descricao, ' - ', -1), '-%')),
  ' animais'
)
WHERE l.tipo = 'COMPRA_GADO'
  AND l.descricao LIKE 'Aquisição em lote - %'
  AND l.descricao NOT REGEXP ' - [0-9]+ animais$';

UPDATE lancamentos_financeiros
SET descricao = CONCAT(descricao, ' - 1 animal')
WHERE tipo = 'COMPRA_GADO'
  AND animal_id IS NOT NULL
  AND descricao NOT REGEXP ' - 1 animal$';

UPDATE lancamentos_financeiros
SET descricao = REPLACE(descricao, ' - 1 animais', ' - 1 animal')
WHERE tipo = 'COMPRA_GADO' AND descricao LIKE '% - 1 animais';
