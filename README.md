# AgroSys

Sistema de cadastro de animais com Angular, TypeScript, Express e MySQL.

## Preparação

1. Crie o banco executando `database/schema.sql` no MySQL.
2. Edite `backend/.env` e informe os dados do MySQL. O arquivo já vem configurado para um MySQL local, usuário `root` sem senha.
3. Instale as dependências com `npm.cmd run install:all`.

## Desenvolvimento

Para iniciar o front-end e o back-end juntos, execute:

```powershell
npm.cmd run dev
```

Abra `http://localhost:4200`. A API fica em `http://localhost:3000/api`.

## Funcionalidades

- Cadastro e edição de animais
- Listagem com busca por brinco, nome ou raça
- Exclusão com confirmação
- Validação no formulário e na API
- Indicadores de total, machos e fêmeas
# Padrão de validação ao salvar

Todo formulário novo deve impedir o envio de dados inválidos e sempre apresentar ao usuário o motivo pelo qual não foi possível salvar. A mensagem deve identificar os campos pendentes ou inválidos. Erros retornados pela API também devem ser exibidos em linguagem clara, preservando os detalhes de validação enviados pelo backend. Nenhuma ação de salvar pode falhar silenciosamente.
