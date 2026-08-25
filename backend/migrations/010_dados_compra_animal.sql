ALTER TABLE animais
  ADD COLUMN data_compra DATE NULL AFTER data_nascimento,
  ADD COLUMN valor_compra DECIMAL(12, 2) NULL AFTER data_compra,
  ADD COLUMN fornecedor VARCHAR(150) NULL AFTER valor_compra,
  ADD COLUMN numero_nota_fiscal VARCHAR(60) NULL AFTER fornecedor;
