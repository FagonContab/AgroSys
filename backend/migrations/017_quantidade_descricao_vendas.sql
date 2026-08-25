UPDATE lancamentos_financeiros l
JOIN (
  SELECT venda_id, COUNT(*) AS quantidade
  FROM venda_animais
  GROUP BY venda_id
) va ON va.venda_id = l.venda_id
SET l.descricao = CONCAT(
  l.descricao, ' - ', va.quantidade, ' ',
  IF(va.quantidade = 1, 'animal', 'animais')
)
WHERE l.categoria = 'Venda de animais'
  AND l.descricao NOT REGEXP ' - [0-9]+ anima(is|l)$';
