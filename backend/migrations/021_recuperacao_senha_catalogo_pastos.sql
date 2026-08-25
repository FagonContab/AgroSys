ALTER TABLE usuarios ADD COLUMN email VARCHAR(254) NULL AFTER login;
ALTER TABLE pastos MODIFY COLUMN area_id INT UNSIGNED NULL;

-- Preencha o e-mail dos usuários já existentes antes de usar "Esqueci minha senha".
-- Exemplo: UPDATE usuarios SET email='usuario@exemplo.com' WHERE login='usuario';
