ALTER TABLE lancamentos_financeiros
  ADD COLUMN data_vencimento DATE NULL AFTER valor,
  ADD COLUMN data_efetivacao DATE NULL AFTER data_vencimento;

UPDATE lancamentos_financeiros
SET data_vencimento = data_lancamento, data_efetivacao = data_lancamento
WHERE data_vencimento IS NULL OR data_efetivacao IS NULL;
