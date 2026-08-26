# Implantação do AgroSys com Docker

Esta configuração executa somente o frontend e a API em containers. O MySQL continua instalado diretamente na máquina hospedeira e deve possuir banco e usuário exclusivos do AgroSys.

## Arquitetura

- `agrosys-web`: Nginx com o build Angular e proxy de `/api`.
- `agrosys-api`: Node.js/Express conectado ao MySQL do host.
- `public-proxy`: rede Docker externa compartilhada apenas com o proxy HTTPS da máquina.
- `agrosys-internal`: comunicação privada entre frontend e API.

Nenhum serviço do AgroSys publica portas no host. O acesso externo acontece exclusivamente pelo proxy reverso já responsável pelas portas 80 e 443.

## 1. Preparar a máquina uma única vez

Crie a rede compartilhada:

```bash
docker network create public-proxy
```

Conecte o Nginx público da máquina a essa rede. No Compose do Fagon, isso significa adicionar `public-proxy` ao serviço `web`. Recomenda-se também que o Nginx carregue arquivos independentes de um diretório como `/etc/nginx/apps-enabled/*.conf`.

## 2. Preparar o MySQL do host

Crie um banco e usuário exclusivos, substituindo a senha:

```sql
CREATE DATABASE agrosys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'agrosys_app'@'%' IDENTIFIED BY 'senha-forte';
GRANT ALL PRIVILEGES ON agrosys.* TO 'agrosys_app'@'%';
FLUSH PRIVILEGES;
```

O MySQL deve aceitar conexões da rede Docker, mas a porta 3306 não deve ser liberada para a internet. Restrinja-a com firewall e, quando possível, limite o host do usuário à sub-rede Docker usada no servidor.

O banco atual exige `database/schema.sql`, as migrations numeradas de `backend/migrations/002` a `021` e `database/add-subcategoria-lancamentos.sql`. Como ainda não existe executor automático, faça backup e aplique os scripts conscientemente antes de iniciar a API. Em uma migração de dados existentes, prefira restaurar um dump consistente do banco atual.

## 3. Gerar e enviar o pacote

Em Linux, macOS ou Git Bash, na raiz do projeto:

```bash
bash build.sh
```

O script:

1. instala dependências reproduzíveis com `npm ci`;
2. compila backend e frontend;
3. reúne somente os arquivos necessários à construção das imagens;
4. cria `agrosys.zip` na raiz.

O computador que gera o pacote precisa de Bash, `zip`, Node.js e npm. No Windows, use Git Bash ou WSL. Docker é necessário apenas no servidor que construirá e executará as imagens.

Para enviar automaticamente por SCP:

```bash
DEPLOY_TARGET=usuario@servidor DEPLOY_PORT=22 bash build.sh
```

Variáveis opcionais:

- `DEPLOY_TARGET`: destino do SCP, por exemplo `marcos@servidor`;
- `DEPLOY_PORT`: porta SSH, padrão `22`;
- `DEPLOY_PATH`: destino remoto, padrão `/tmp/agrosys.zip`.

Credenciais e endereço do servidor não ficam gravados no repositório.

## 4. Primeira implantação

No servidor:

```bash
sudo mkdir -p /srv/agrosys
sudo unzip -o /tmp/agrosys.zip -d /srv/agrosys
sudo cp /srv/agrosys/docker/.env.production.example /srv/agrosys/docker/.env.production
sudo nano /srv/agrosys/docker/.env.production
```

Configure principalmente:

```dotenv
DB_HOST=host.docker.internal
DB_USER=agrosys_app
DB_PASSWORD=senha-forte
DB_NAME=agrosys
FRONTEND_URL=https://dominio-do-agrosys
```

O arquivo `.env.production` permanece somente no servidor e não é incluído nos pacotes futuros.

Suba os containers:

```bash
cd /srv/agrosys/docker
docker compose -f docker-compose-prod.yml up -d --build
```

## 5. Proxy e HTTPS

Use `docker/agrosys-proxy.conf.example` como base. Copie-o para o diretório de aplicações do proxy, substitua o domínio e emita o certificado correspondente.

O arquivo é independente: para trocar o domínio, altere apenas `server_name`, certificados, DNS e `FRONTEND_URL`. Para remover o AgroSys, remova esse arquivo e recarregue o Nginx.

Antes de recarregar:

```bash
docker exec fagon-client nginx -t
docker exec fagon-client nginx -s reload
```

Adapte o nome do container caso o proxy público tenha outro nome.

## 6. Atualizações

Após enviar um novo `agrosys.zip`, execute no servidor:

```bash
bash /srv/agrosys/docker/deploy.sh /tmp/agrosys.zip
```

O script sobrescreve os arquivos versionados, preserva `.env.production`, reconstrói as imagens e mostra o estado dos serviços.

Logs e diagnóstico:

```bash
cd /srv/agrosys/docker
docker compose -f docker-compose-prod.yml ps
docker compose -f docker-compose-prod.yml logs --tail=200 agrosys-api
docker compose -f docker-compose-prod.yml logs --tail=200 agrosys-web
```

## 7. Remoção

```bash
cd /srv/agrosys/docker
docker compose -f docker-compose-prod.yml down --remove-orphans
```

Depois, remova o arquivo do AgroSys no proxy e recarregue o Nginx. Isso não remove nem altera o MySQL. Exclua o banco e o usuário somente após backup e confirmação explícita de que os dados não serão mais necessários.
