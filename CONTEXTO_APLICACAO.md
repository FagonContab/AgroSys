# Contexto da aplicação AgroSys

> Documento de referência para análise, manutenção e desenvolvimento. Levantamento feito a partir do código em 26/08/2026. Em caso de divergência, o código e as migrations mais recentes são a fonte de verdade.

## 1. Visão geral

O AgroSys é uma aplicação web para gestão de propriedades e rebanho bovino. Além do cadastro de animais, atualmente cobre localização do gado, compras e vendas, agenda, controle financeiro, relatórios, usuários e autenticação por produtor.

O repositório é um monorepo simples:

- `frontend/`: SPA Angular 20, TypeScript, formulários reativos e CSS próprio.
- `backend/`: API REST em Express 5 + TypeScript, acesso MySQL com `mysql2` e validação parcial com Zod.
- `database/`: schema inicial, scripts auxiliares, dump e modelo MySQL Workbench.
- `backend/migrations/`: evolução incremental do banco, atualmente até `021`.
- `scripts/`: utilitários de diagnóstico, incluindo automação com Playwright.

Não há, no estado atual, suíte automatizada de testes, framework de migrations, Docker, CI ou documentação OpenAPI.

## 2. Tecnologias e versões principais

| Camada | Tecnologia |
| --- | --- |
| Frontend | Angular 20, RxJS 7, TypeScript 5.8, Zone.js |
| Formulários | Angular Reactive Forms e alguns controles com `ngModel` |
| PDF/OCR | `pdfjs-dist` e `tesseract.js`, executados no navegador |
| Backend | Node.js, Express 5, TypeScript 5.8 |
| Banco | MySQL, driver `mysql2/promise` |
| Validação | Zod 3 em animais e localizações; validação manual nos demais módulos |
| E-mail | Nodemailer para recuperação de senha |
| Desenvolvimento | Angular CLI e `concurrently` |

O projeto não declara uma versão mínima de Node em `engines`. Deve-se usar uma versão moderna compatível com Angular 20 e TypeScript 5.8.

## 3. Como executar

### Pré-requisitos

- Node.js e npm.
- MySQL acessível localmente ou pela rede.
- Banco atualizado com o schema e todas as migrations aplicáveis.

### Instalação

Na raiz:

```powershell
npm.cmd run install:all
```

Esse comando instala separadamente as dependências de `backend/` e `frontend/`. As dependências da raiz são instaladas com `npm.cmd install` quando necessário.

### Configuração do backend

Copiar `backend/.env.example` para `backend/.env` e configurar:

```dotenv
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=agrosys
FRONTEND_URL=http://localhost:4200
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Defaults presentes no código: API em `3000`, MySQL em `localhost:3306`, usuário `root`, senha vazia e banco `agrosys`. O `.env` é carregado explicitamente de `backend/.env`, mesmo quando o processo é iniciado pela raiz.

SMTP só é necessário para “Esqueci minha senha”. Sem os quatro campos obrigatórios de SMTP, esse fluxo retorna erro de configuração.

### Desenvolvimento

```powershell
npm.cmd run dev
```

- Frontend: `http://localhost:4200`
- API: `http://localhost:3000/api`
- Saúde: `GET http://localhost:3000/api/saude`

O Angular encaminha `/api` para a porta `3000` por meio de `frontend/proxy.conf.json`. O script de desenvolvimento do backend primeiro compila com `tsc` e depois executa `dist/server.js`; ele não possui watch/hot reload, apesar de `tsx` estar instalado.

### Build

```powershell
npm.cmd run build
```

Compila primeiro o backend e depois o frontend. Artefatos gerados (`dist/`, `.angular/`) não devem ser versionados.

## 4. Banco de dados e migrations

`database/schema.sql` cria apenas o banco e a tabela inicial `animais`; ele está desatualizado em relação à aplicação completa. Para construir o banco funcional, execute o schema inicial e, em ordem, as migrations de `backend/migrations/002_...sql` até `021_...sql`. Também verifique `database/add-subcategoria-lancamentos.sql`, pois a coluna `subcategoria` é usada pela API, mas esse script está fora da sequência numerada.

Não existe executor automático nem tabela de controle de migrations. Antes de aplicar um script, confira o estado real do banco e faça backup. Algumas migrations contêm `ALTER TABLE` não idempotentes e a `020` consolida pastos duplicados, atualiza chaves e remove registros redundantes.

Principais entidades:

- `animais`: identificação por brinco, dados zootécnicos, compra, status e localização atual.
- `areas`: propriedades/inscrições rurais.
- `pastos` e `areas_pastos`: catálogo de pastos e vínculo muitos-para-muitos com áreas.
- `historico_pastos` e `historico_status`: trilha de movimentações e mudanças do animal.
- `vendas` e `venda_animais`: cabeçalho da venda e animais vendidos.
- `contas_bancarias`, `lancamentos_financeiros`, `titulos_financeiros` e `categorias_despesa`: financeiro realizado e projetado.
- `eventos_agenda`: compromissos, prioridade, recorrência e status.
- `produtores`, `usuarios`, `produtor_usuarios` e `sessoes`: identidade, perfis e sessão.
- `travas_financeiras`: data limite por produtor para impedir alterações retroativas.

Arquivos como `Dump20260805.sql`, `database/agrosys-before-pastos-compartilhados-20260824.sql` e PDFs na raiz podem conter dados reais. Trate-os como sensíveis e não os use como schema canônico nem os exponha em logs, exemplos ou commits sem revisão.

## 5. Backend

### Estrutura

- `backend/src/server.ts`: concentra rotas, regras de negócio, SQL, autenticação e tratamento de erros.
- `backend/src/database.ts`: pool MySQL (10 conexões, datas retornadas como strings).
- `backend/src/animal.schema.ts`: contratos Zod de animal, lote e transferência.
- `backend/src/localizacao.schema.ts`: contratos Zod de área e pasto.

A API usa SQL parametrizado diretamente, sem ORM ou camada de repositório. Operações que alteram múltiplas tabelas normalmente usam transações explícitas.

### Grupos de endpoints

| Grupo | Operações principais |
| --- | --- |
| Autenticação | login, sessão atual, logout e recuperação de senha |
| Usuários | listar e criar usuários do produtor (somente ADMIN) |
| Agenda | listar, criar, concluir/reabrir e excluir eventos |
| Animais | listar, detalhar, criar, criar lote, editar, excluir e transferir |
| Localizações | CRUD parcial de áreas; catálogo, vínculos e consulta de pastos |
| Vendas | listar, concluir/editar venda e registrar baixa sem financeiro |
| Financeiro | trava, contas, categorias, lançamentos, extrato, DRE, análise, demonstrativo, custos e fluxo de caixa |
| Relatórios | consolidado/histórico de pastos, aquisições/vendas e controle de animais |
| Infraestrutura | saúde da API/banco |

Consulte as declarações `app.get/post/put/patch/delete` em `backend/src/server.ts` para o contrato exato; não há especificação OpenAPI.

### Autenticação e autorização

- Login e saúde são públicos. As demais rotas `/api` exigem cookie `agrosys_session`.
- O token aleatório tem 32 bytes; somente seu SHA-256 é salvo no banco.
- A sessão dura 12 horas e o cookie é `HttpOnly`, `SameSite=Lax` e `Path=/`.
- Senhas usam `crypto.scrypt`, salt aleatório e comparação em tempo constante.
- Perfis existentes: `ADMIN` e `USUARIO`.
- Somente ADMIN pode gerenciar usuários e definir a trava financeira.
- CORS aceita `FRONTEND_URL` e credenciais.

Em produção (`NODE_ENV=production`), o cookie também recebe `Secure`. Não há proteção CSRF explícita, rate limiting ou limpeza automática visível de sessões expiradas.

### Regras de negócio críticas

- Brinco é único. Em cadastros por lote, conflitos podem gerar variações automáticas do prefixo/letra.
- Animal exige fornecedor, área/inscrição e pasto; status aceitos: `ATIVO`, `VENDIDO`, `MORTO`.
- O lote aceita até 1.000 animais e registra compra/financeiro conforme os campos enviados.
- Transferências atualizam a localização e seu histórico em transação.
- Um nome de pasto é globalmente único e pode ser associado a várias áreas por `areas_pastos`.
- Venda concluída baixa os animais e pode gerar lançamentos parcelados a receber.
- A trava financeira rejeita criação/alteração/exclusão com data menor ou igual à data travada.
- Formulários devem impedir dados inválidos e sempre mostrar ao usuário campos pendentes ou a mensagem clara devolvida pela API; falha silenciosa é proibida pela convenção registrada no README.

### Tratamento de erros

O middleware final traduz erros Zod, duplicidade/chave estrangeira do MySQL e códigos de negócio para respostas JSON com `mensagem` e, quando aplicável, detalhes. Ao criar uma regra nova, preserve mensagens em português úteis ao usuário e não dependa apenas do log do servidor.

## 6. Frontend

O frontend é uma SPA standalone sem Angular Router. A navegação é controlada pelo estado `paginaAtiva` dentro de `AppComponent`.

Quase toda a interface e sua lógica estão concentradas em:

- `frontend/src/app/app.component.ts` (estado, formulários e fluxos);
- `frontend/src/app/app.component.html` (todas as telas);
- `frontend/src/app/app.component.css` (estilos do sistema).

Serviços por domínio encapsulam chamadas HTTP: `animal`, `localizacao`, `relatorio`, `financeiro`, `agenda`, `venda` e `auth`. Os modelos ficam nos próprios serviços ou em arquivos `*.model.ts`.

Telas/áreas funcionais atuais:

- início e indicadores;
- agenda e lembretes;
- vendas e baixa de animais;
- usuários do produtor;
- cadastro individual e em lote;
- áreas/inscrições e pastos;
- transferência entre pastos;
- estoque e relatórios de animais/pastos;
- contas, lançamentos, fluxo de caixa, extrato, DRE, demonstrativo de vendas e trava financeira.

Detalhes relevantes:

- Locale global: `pt-BR`.
- `MoedaDirective` normaliza campos monetários.
- `AnoQuatroDirective` limita a entrada do ano em campos de data.
- Importação de notas fiscais usa PDF.js/OCR no navegador para preencher compra/venda.
- `localStorage` guarda o último login e rascunhos de vendas/entradas em lote. Não guardar senhas, tokens ou outros segredos ali.
- As chamadas usam URLs relativas `/api`; a autenticação depende do cookie emitido no mesmo site/proxy.

Como o componente raiz já é muito grande, funcionalidades novas relevantes devem preferencialmente ser extraídas para componentes e serviços de domínio, sem exigir uma refatoração ampla não relacionada à tarefa.

## 7. Limitações e riscos conhecidos

### Isolamento por produtor incompleto

A sessão fornece `produtorId`, mas grande parte das tabelas e consultas de animais, áreas, pastos, agenda, vendas e financeiro não possui ou não aplica filtro por produtor. Atualmente, `produtor_id` aparece sobretudo em autenticação, usuários e trava financeira. Portanto, a aplicação ainda não oferece isolamento multi-tenant completo. Não assumir isolamento de dados ao adicionar um segundo produtor; isso exige desenho e migração consistentes em todas as entidades e consultas.

### Evolução do banco manual

O schema inicial não reproduz o estado atual e não há controle automático de migrations. O risco de ambientes divergentes é alto. Sempre documentar uma mudança de banco em migration numerada, revisar ordem/dependências e validar em cópia do banco.

### Concentração de responsabilidades

`server.ts` e `AppComponent` concentram muitos domínios. Alterações pequenas devem ser localizadas e testadas contra fluxos vizinhos; alterações maiores devem extrair responsabilidades gradualmente.

### Cobertura de testes

Não há testes automatizados. A validação mínima de uma mudança deve incluir build das duas aplicações e um teste manual dos endpoints/telas afetados. Regras financeiras, transferências, vendas, autenticação e migrations merecem testes automatizados antes de refatorações maiores.

### Codificação de texto

Alguns conteúdos aparecem com mojibake (`Ã`, `Â`) quando lidos pelo console atual, possivelmente por diferença entre UTF-8 e a página de código do PowerShell. Preserve arquivos como UTF-8 e confira a renderização no navegador antes de “corrigir” texto em massa.

## 8. Convenções para desenvolvimento

- Usar português nos textos de interface e mensagens de validação, mantendo nomes técnicos coerentes com o domínio existente.
- Validar no frontend para feedback imediato e repetir validações críticas no backend.
- Nunca montar SQL com entrada do usuário; continuar usando placeholders de `mysql2`.
- Usar transação quando uma operação modifica mais de uma tabela ou combina domínio e financeiro.
- Respeitar a trava financeira em toda nova operação com efeito contábil retroativo.
- Manter datas civis no formato `YYYY-MM-DD`; o pool usa `dateStrings: true` para evitar conversões indesejadas de fuso.
- Manter valores monetários como `DECIMAL` no banco. Cuidado com arredondamento ao manipular `number` no JavaScript.
- Não registrar cookies, senhas, tokens, dados completos de notas fiscais ou conteúdo de dumps.
- Não editar dumps históricos para representar mudanças novas; criar migration incremental.
- Antes de excluir/alterar vínculos de área, pasto, animal ou venda, revisar históricos e chaves estrangeiras.

## 9. Checklist para mudanças

1. Identificar telas, serviço frontend, endpoint, tabelas e históricos afetados.
2. Conferir autenticação, perfil e necessidade de isolamento por produtor.
3. Adicionar validação de formulário e mensagem clara de erro da API.
4. Se houver banco, criar a próxima migration numerada e avaliar compatibilidade com dados existentes.
5. Usar transação para alterações compostas e verificar efeitos financeiros.
6. Executar `npm.cmd run build` na raiz.
7. Testar manualmente sucesso, validação, conflito, sessão expirada e dados vazios.
8. Para financeiro, testar datas antes, na data e depois da trava.
9. Para animais, testar histórico, localização, brinco duplicado e reflexos de compra/venda.
10. Revisar `git diff` para impedir inclusão de `.env`, dumps, PDFs, logs ou artefatos de build.

## 10. Arquivos de referência rápida

| Necessidade | Arquivo |
| --- | --- |
| Scripts gerais | `package.json` |
| Instruções existentes | `README.md` |
| Inicialização da API e rotas | `backend/src/server.ts` |
| Conexão MySQL | `backend/src/database.ts` |
| Configuração de ambiente | `backend/.env.example` |
| Validação de animais | `backend/src/animal.schema.ts` |
| Validação de localizações | `backend/src/localizacao.schema.ts` |
| Histórico do banco | `backend/migrations/` |
| Schema inicial | `database/schema.sql` |
| Bootstrap Angular | `frontend/src/main.ts` |
| Estado e regras da UI | `frontend/src/app/app.component.ts` |
| Template principal | `frontend/src/app/app.component.html` |
| Estilos principais | `frontend/src/app/app.component.css` |
| Proxy local | `frontend/proxy.conf.json` |

## 11. Próximas melhorias estruturais recomendadas

Sem impedir correções funcionais imediatas, as prioridades técnicas mais valiosas são:

1. consolidar um processo reproduzível de migrations e gerar um schema atual completo;
2. definir e implementar isolamento de dados por produtor em todas as entidades;
3. separar `server.ts` por domínio (rotas, serviços e repositórios);
4. separar `AppComponent` em componentes por tela/fluxo;
5. criar testes de integração da API para autenticação, animais, vendas, transferências e financeiro;
6. documentar contratos com OpenAPI e padronizar respostas de erro;
7. reforçar a configuração de produção: HTTPS/cookie `Secure`, CSRF, rate limiting, logs seguros e política de sessões.
