ALTER TABLE lancamentos_financeiros
  MODIFY COLUMN conta_bancaria_id INT UNSIGNED NULL;

INSERT INTO lancamentos_financeiros
  (conta_bancaria_id, venda_id, area_id, tipo, categoria, descricao,
   fornecedor_cliente, valor, data_vencimento, data_efetivacao, data_lancamento)
SELECT v.conta_bancaria_id, v.id, v.area_id, 'ENTRADA', 'Venda de animais',
       CONCAT('Venda NF ', v.numero_nota_fiscal, ' (1/1)'), v.comprador_nome,
       v.valor_total, COALESCE(v.data_primeiro_vencimento, v.data_emissao), NULL, v.data_emissao
FROM vendas v
WHERE v.status = 'CONCLUIDA'
  AND v.valor_total IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM lancamentos_financeiros l WHERE l.venda_id = v.id);
