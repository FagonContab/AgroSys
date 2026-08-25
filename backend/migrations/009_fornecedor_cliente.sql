ALTER TABLE lancamentos_financeiros
  ADD COLUMN fornecedor_cliente VARCHAR(150) NULL AFTER descricao;

UPDATE lancamentos_financeiros SET fornecedor_cliente = descricao
WHERE fornecedor_cliente IS NULL;
