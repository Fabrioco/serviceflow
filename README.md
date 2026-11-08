# ServiceFlow — V1 - Semana 1

O ServiceFlow é o início de uma aplicação para organizar clientes, equipes e ordens de serviço de empresas prestadoras de serviços. Esta documentação registra o que está implementado no projeto até a primeira semana da V1.

> **Estado atual:** a base do monorepo, o cadastro de empresa e usuário, o login e a autenticação estão implementados. O modelo de dados já prevê clientes e ordens de serviço, mas ainda não há telas nem operações de gerenciamento para esses recursos.

## O que já existe

### Aplicação web

- Páginas de login (`/login`) e cadastro de empresa (`/register`), em português e adaptadas para telas menores.
- Validação básica dos formulários, mensagens de erro e estados de carregamento.
- Cadastro conectado à API: cria uma organização e seu primeiro usuário, com papel `OWNER`.
- Login conectado à API e logout.
- Token guardado em cookie `httpOnly`, com validade de uma hora; a página protegida consulta a API para obter os dados do usuário.
- Rota `/` redireciona para `/dashboard`. O painel exige autenticação e, nesta etapa, mostra somente uma saudação, o papel do usuário e a opção de sair.
- Prévia ilustrativa de uma ordem de serviço na tela de cadastro; é conteúdo visual de demonstração, não uma ordem persistida.

### API

- API NestJS com prefixo `/api`, validação global dos dados de entrada e documentação Swagger.
- Cadastro e login com normalização do e-mail, verificação de duplicidade e senhas protegidas com Argon2.
- Autenticação por JWT Bearer, com validade de uma hora, e rota para consultar o usuário autenticado.
- Verificações de saúde da aplicação e da conexão com o banco.
- Testes unitários e testes end-to-end para a base da aplicação e o cadastro.

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api` | Rota inicial da API. |
| `GET` | `/api/health` | Verifica se a API está respondendo. |
| `GET` | `/api/health/db` | Verifica o acesso ao banco de dados. |
| `POST` | `/api/auth/register` | Cria a empresa e o usuário proprietário. |
| `POST` | `/api/auth/login` | Valida as credenciais e retorna token e usuário. |
| `GET` | `/api/me` | Retorna o usuário autenticado; requer um token JWT no cabeçalho `Authorization`. |

A documentação interativa da API fica em `http://localhost:3000/api/docs`.

### Modelo de dados

O contrato Prisma define:

- **Organization:** organização à qual pertencem os usuários, clientes e ordens.
- **User:** usuário com nome, e-mail, hash de senha e papel (`OWNER`, `ADMIN` ou `TECHNICIAN`).
- **Customer:** cliente com telefone e informações opcionais, como e-mail, endereço e observações.
- **WorkOrder:** ordem vinculada à organização e a um cliente, com serviço, descrição, preço, status, agendamento e técnico opcional.
- **WorkOrderEvent:** registro de mensagens associado ao histórico de uma ordem.

Os status previstos para uma ordem são `OPEN`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED` e `CANCELED`. Nesta versão, os modelos de cliente e ordem de serviço são apenas a estrutura de dados: a API ainda não oferece endpoints para consultá-los ou alterá-los.

## Tecnologias

- **Monorepo:** pnpm workspaces.
- **Web:** Next.js 16, React 19, TypeScript e Tailwind CSS 4.
- **API:** NestJS 12, TypeScript e Swagger.
- **Dados:** PostgreSQL 16 em ambiente local e contrato Prisma/ORM PostgreSQL.
- **Autenticação:** JWT e Argon2.

## Estrutura do repositório

```text
.
├── apps/
│   ├── api/       # API NestJS, autenticação, contrato de dados e testes
│   └── web/       # Aplicação Next.js
├── docker-compose.yml
├── package.json   # Scripts da workspace
└── pnpm-workspace.yaml
```

## Requisitos

- Node.js 22 ou compatível.
- pnpm 12.16.1, conforme declarado no `package.json` raiz.
- Docker e Docker Compose para iniciar o PostgreSQL local.

## Como executar localmente

1. Instale as dependências na raiz do repositório:

   ```bash
   pnpm install
   ```

2. Crie o arquivo de ambiente da raiz a partir do exemplo. Ele fornece as variáveis usadas pelo Docker Compose para inicializar o PostgreSQL:

   ```bash
   cp .env.example .env
   ```

   Os valores de exemplo são apenas para desenvolvimento local; substitua-os se necessário e não use credenciais de exemplo em produção.

3. Inicie o banco:

   ```bash
   docker compose up -d db
   ```

4. Configure a API em `apps/api/.env` com:

   - `DATABASE_URL`: conexão com o PostgreSQL iniciado acima.
   - `JWT_SECRET`: segredo forte e exclusivo para assinar os tokens.
   - `PORT` (opcional): porta da API; o padrão é `3000`.
   - `WEB_URL` (opcional): origem permitida pelo CORS; por padrão, o CORS aceita qualquer origem.

   O arquivo `apps/api/.env.example` serve como referência para a conexão do banco. Não versione arquivos `.env` nem compartilhe segredos.

5. Configure `apps/web/.env.local` para que as ações do servidor web encontrem a API:

   ```env
   API_URL=http://localhost:3000/api
   ```

6. Em terminais separados, inicie a API e a aplicação web:

   ```bash
   pnpm dev:api
   ```

   ```bash
   pnpm dev:web
   ```

   A web fica em `http://localhost:3001`; a API, por padrão, em `http://localhost:3000`.

## Comandos úteis

Execute na raiz do repositório:

| Comando | Ação |
| --- | --- |
| `pnpm dev:api` | Inicia a API em modo de desenvolvimento. |
| `pnpm dev:web` | Inicia a aplicação web em modo de desenvolvimento. |
| `pnpm build` | Executa os builds dos aplicativos da workspace. |
| `pnpm lint` | Executa os linters configurados para os aplicativos. |
| `pnpm test` | Executa os testes unitários configurados. |

Para executar os testes end-to-end da API:

```bash
pnpm --filter api test:e2e
```

Os testes que importam a aplicação e acessam o banco precisam de uma configuração de ambiente e de um PostgreSQL disponíveis.

## Próximos passos naturais

- Implementar cadastro, consulta e edição de clientes.
- Implementar o ciclo de vida das ordens de serviço e seu histórico.
- Construir o painel com dados reais.
- Adicionar gestão de equipe e atribuição de técnicos.
- Evoluir os testes para cobrir os fluxos completos e a integração com o banco.
