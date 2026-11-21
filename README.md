# ServiceFlow

**Gestão operacional de empresas de serviços técnicos.**

O ServiceFlow é uma aplicação SaaS desenvolvida para pequenas e médias empresas de manutenção, assistência técnica e prestação de serviços. Seu objetivo é centralizar a gestão de clientes, equipes e ordens de serviço em uma única plataforma, substituindo processos manuais baseados em planilhas, papel e conversas dispersas no WhatsApp.

A proposta é oferecer aos gestores uma visão organizada da operação, permitindo acompanhar serviços, distribuir tarefas entre técnicos e manter o histórico de atendimento de cada cliente.

---

## Sumário

- [Visão geral](#visão-geral)
- [Problema e proposta de valor](#problema-e-proposta-de-valor)
- [Funcionalidades](#funcionalidades)
- [Arquitetura e tecnologias](#arquitetura-e-tecnologias)
- [Arquitetura multi-tenant](#arquitetura-multi-tenant)
- [Autenticação e segurança](#autenticação-e-segurança)
- [Perfis e permissões](#perfis-e-permissões)
- [Ordens de serviço](#ordens-de-serviço)
- [Modelo de dados](#modelo-de-dados)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Executando localmente](#executando-localmente)
- [Documentação da API](#documentação-da-api)
- [Testes e qualidade](#testes-e-qualidade)
- [Roadmap](#roadmap)

---

## Visão geral

O ServiceFlow foi pensado para acompanhar o fluxo operacional de uma empresa prestadora de serviços:

1. O atendente cadastra um cliente.
2. Uma ordem de serviço é criada com as informações do atendimento.
3. O serviço é atribuído a um técnico.
4. O técnico acompanha suas tarefas e atualiza o andamento do serviço.
5. O gestor acompanha a operação e consulta o histórico dos atendimentos.

A aplicação utiliza uma arquitetura separada entre frontend e backend, permitindo que a interface web e a API evoluam de maneira independente.

O projeto está sendo desenvolvido como um SaaS multi-tenant, no qual diferentes empresas podem utilizar a mesma plataforma mantendo seus dados isolados.

## Problema e proposta de valor

Empresas de manutenção e assistência técnica frequentemente enfrentam dificuldades para organizar suas operações.

Entre os problemas mais comuns estão:

- Informações de clientes espalhadas em diferentes lugares.
- Ordens de serviço controladas manualmente.
- Falta de visibilidade sobre os serviços pendentes e em andamento.
- Dificuldade para acompanhar a produtividade dos técnicos.
- Histórico de atendimentos incompleto ou inexistente.
- Falta de informações centralizadas para acompanhar o desempenho financeiro.

O ServiceFlow busca resolver esses problemas por meio da centralização das informações e da padronização dos processos operacionais.

## Funcionalidades

O desenvolvimento segue uma abordagem incremental, priorizando os recursos essenciais para o funcionamento da plataforma.

### Aplicação web

- Cadastro de empresas e usuários proprietários.
- Autenticação e encerramento de sessão.
- Proteção de páginas que exigem autenticação.
- Gerenciamento de clientes.
- Gerenciamento de técnicos.
- Busca e paginação de registros.
- Interface responsiva para utilização em computadores e dispositivos móveis.

### API

- Cadastro de organizações e usuários.
- Autenticação baseada em JWT.
- Consulta dos dados do usuário autenticado.
- Gerenciamento de clientes e técnicos.
- Gerenciamento de ordens de serviço.
- Isolamento de dados por organização.
- Validação global dos dados de entrada.
- Documentação interativa com Swagger.
- Testes unitários e testes end-to-end.

### Em desenvolvimento

- Máquina de estados das ordens de serviço.
- Histórico de alterações e timeline de eventos.
- **Dashboard operacional e financeiro.** ✅
- Indicadores de produtividade e faturamento.

> O escopo da V1 prioriza a aplicação web. A interface deve funcionar também no navegador do celular, sem exigir a instalação de um aplicativo nativo.

## Arquitetura e tecnologias

O projeto utiliza uma arquitetura de monorepo com pnpm Workspaces. O frontend e o backend ficam no mesmo repositório, mas são aplicações independentes.

### Stack tecnológica

| Camada               | Tecnologia                     | Responsabilidade                            |
| -------------------- | ------------------------------ | ------------------------------------------- |
| Monorepo             | pnpm Workspaces                | Gerenciamento das aplicações e dependências |
| Frontend             | Next.js 16                     | Interface web e renderização                |
| Interface            | React 19                       | Construção dos componentes                  |
| Estilização          | Tailwind CSS 4                 | Estilização e responsividade                |
| Linguagem            | TypeScript                     | Tipagem estática                            |
| Backend              | NestJS 12                      | API REST e regras de negócio                |
| Banco de dados       | PostgreSQL 16                  | Persistência dos dados                      |
| ORM                  | Prisma / Prisma ORM PostgreSQL | Acesso e comunicação com o banco            |
| Autenticação         | JWT                            | Autenticação das requisições                |
| Segurança de senhas  | Argon2                         | Hash e verificação de senhas                |
| Infraestrutura local | Docker Compose                 | Ambiente de desenvolvimento                 |
| Testes               | Jest                           | Testes unitários e end-to-end               |
| Documentação         | Swagger                        | Documentação interativa da API              |

### Organização da arquitetura

**Frontend — Next.js**

Responsável pela experiência do usuário, formulários, navegação, páginas protegidas e comunicação com a API.

O projeto utiliza recursos do Next.js, como Server Components, Server Actions e gerenciamento de cookies no servidor.

**Backend — NestJS**

Responsável pelas regras de negócio, autenticação, autorização, validação das requisições e comunicação com o banco de dados.

A estrutura modular do NestJS permite separar as responsabilidades da aplicação e facilitar sua manutenção.

**Banco de dados — PostgreSQL**

Armazena as informações das organizações, usuários, clientes e ordens de serviço.

O acesso aos dados é realizado por meio do Prisma ORM.

## Arquitetura multi-tenant

Um dos principais aspectos arquiteturais do ServiceFlow é o suporte a múltiplas organizações.

Isso significa que diferentes empresas podem utilizar a mesma aplicação, compartilhando a infraestrutura sem compartilhar seus dados.

Cada registro pertencente a uma empresa possui uma referência à sua organização por meio do campo `organizationId`.

### Como funciona o isolamento

1. O usuário realiza o login e recebe um token JWT.
2. O backend valida o token nas requisições protegidas.
3. O identificador da organização é obtido a partir do contexto autenticado.
4. As consultas e operações no banco são filtradas pela organização do usuário.
5. Caso um usuário tente acessar um registro pertencente a outra empresa, a operação é bloqueada.

O `organizationId` não deve ser aceito como fonte de autoridade a partir do corpo da requisição. A organização utilizada nas operações deve ser determinada pelo contexto autenticado no servidor.

Essa abordagem reduz o risco de acesso indevido entre organizações e estabelece uma base para a evolução da plataforma.

## Autenticação e segurança

A autenticação utiliza JSON Web Tokens (JWT).

O fluxo de autenticação é dividido entre a aplicação web e a API:

- O usuário informa suas credenciais na aplicação web.
- A API valida o e-mail e a senha.
- As senhas são armazenadas utilizando hash com Argon2.
- Após a autenticação, a API emite um token JWT.
- A aplicação web armazena o token em um cookie `httpOnly`.
- As requisições realizadas pelo servidor web incluem o token no cabeçalho `Authorization`.

### Medidas de segurança

- Senhas protegidas com Argon2.
- Autenticação por JWT.
- Cookies `httpOnly` para armazenamento da sessão no navegador.
- Validação dos dados recebidos pela API.
- Proteção de rotas autenticadas.
- Controle de acesso baseado em papéis.
- Isolamento de dados por organização.
- Verificação de autorização nas operações sobre recursos.

O cookie `httpOnly` impede que scripts executados no navegador leiam diretamente o token. Isso reduz a exposição da credencial em determinados cenários de XSS, mas não elimina a necessidade de outras medidas de segurança.

## Perfis e permissões

O ServiceFlow utiliza controle de acesso baseado em papéis (RBAC — Role-Based Access Control).

Cada usuário possui um papel que determina quais operações pode realizar dentro da organização.

| Papel        | Responsabilidades                                                                       |
| ------------ | --------------------------------------------------------------------------------------- |
| `OWNER`      | Proprietário da organização. Possui acesso administrativo e controle geral da empresa.  |
| `ADMIN`      | Gerencia clientes, técnicos e operações da empresa.                                     |
| `TECHNICIAN` | Acompanha os serviços atribuídos e atualiza o andamento das próprias ordens de serviço. |

As permissões são verificadas no backend. A interface pode ocultar funcionalidades de acordo com o perfil, mas a autorização efetiva não depende apenas do frontend.

## Ordens de serviço

A ordem de serviço é a principal unidade operacional do ServiceFlow.

Cada OS representa um atendimento e reúne informações sobre o cliente, o serviço solicitado, o técnico responsável, os valores e o andamento da execução.

### Ciclo de vida

O sistema utiliza uma máquina de estados para representar as etapas de uma ordem de serviço.

| Status        | Descrição                                           |
| ------------- | --------------------------------------------------- |
| `OPEN`        | Ordem criada, aguardando agendamento ou atribuição. |
| `SCHEDULED`   | Serviço agendado e técnico atribuído.               |
| `IN_PROGRESS` | Técnico iniciou a execução do serviço.              |
| `COMPLETED`   | Serviço finalizado.                                 |
| `CANCELED`    | Ordem cancelada.                                    |

O fluxo principal é:

`OPEN` → `SCHEDULED` → `IN_PROGRESS` → `COMPLETED`

Uma ordem também pode ser cancelada, conforme as regras de negócio.

### Histórico de alterações

O modelo `WorkOrderEvent` foi planejado para registrar eventos associados às ordens de serviço.

Cada evento pode armazenar informações como:

- Ordem de serviço relacionada.
- Usuário responsável pela alteração.
- Tipo de evento.
- Descrição da ocorrência.
- Data e horário do registro.

Esses registros permitem construir uma timeline de atendimento e manter um histórico auditável das operações.

## Modelo de dados

O modelo de dados foi estruturado para representar as principais entidades do domínio.

| Entidade         | Responsabilidade                                                            |
| ---------------- | --------------------------------------------------------------------------- |
| `Organization`   | Representa uma empresa cadastrada na plataforma.                            |
| `User`           | Armazena os usuários, suas credenciais, organização e papel de acesso.      |
| `Customer`       | Armazena os clientes e suas informações de contato.                         |
| `WorkOrder`      | Representa uma ordem de serviço vinculada a uma organização e a um cliente. |
| `WorkOrderEvent` | Registra eventos e alterações associados a uma ordem de serviço.            |

### Relacionamentos principais

- Uma organização possui vários usuários.
- Uma organização possui vários clientes.
- Uma organização possui várias ordens de serviço.
- Um cliente pode possuir várias ordens de serviço.
- Uma ordem de serviço pode estar atribuída a um técnico.
- Uma ordem de serviço pode possuir vários eventos no histórico.

Os valores monetários das ordens de serviço são tratados com precisão decimal, evitando os problemas de arredondamento comuns em operações financeiras realizadas diretamente com números de ponto flutuante.

## Estrutura do repositório

```text
.
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   ├── technicians/
│   │   │   ├── work-orders/
│   │   │   └── ...
│   │   └── test/
│   │
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── lib/
│       │   └── ...
│       └── ...
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── .env.example
└── README.md
```

A estrutura interna pode evoluir conforme novos módulos e funcionalidades forem adicionados.

## Executando localmente

### Requisitos

- Node.js 22 ou versão compatível.
- pnpm 12.16.1.
- Docker.
- Docker Compose.

### 1. Clonar o repositório

```bash
git clone https://github.com/Fabrioco/serviceflow.git

cd serviceflow
```

### 2. Instalar as dependências

Na raiz do monorepo:

```bash
pnpm install
```

### 3. Configurar as variáveis de ambiente

Crie o arquivo de ambiente da raiz:

```bash
cp .env.example .env
```

Configure também as variáveis de ambiente da API em:

```text
apps/api/.env
```

Variáveis principais:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/serviceflow"
JWT_SECRET="seu-segredo-forte"
PORT=3000
WEB_URL="http://localhost:3001"
```

Os valores são exemplos e devem ser ajustados conforme o ambiente local.

Não versione arquivos `.env` nem compartilhe credenciais ou segredos.

### 4. Iniciar o banco de dados

```bash
docker compose up -d db
```

### 5. Executar as migrations

Execute o comando de migration configurado para o Prisma no projeto:

```bash
pnpm prisma migrate dev
```

### 6. Configurar o frontend

Crie o arquivo:

```text
apps/web/.env.local
```

Configure a URL da API:

```env
API_URL=http://localhost:3000/api
```

### 7. Iniciar as aplicações

Em terminais separados, execute:

**API:**

```bash
pnpm dev:api
```

**Frontend:**

```bash
pnpm dev:web
```

Após a inicialização:

| Aplicação | Endereço                       |
| --------- | ------------------------------ |
| Frontend  | http://localhost:3001          |
| API       | http://localhost:3000          |
| Swagger   | http://localhost:3000/api/docs |

## Documentação da API

A API possui documentação interativa gerada com Swagger.

Com a aplicação em execução, acesse:

`http://localhost:3000/api/docs`

### Principais endpoints

| Método | Endpoint             | Descrição                                        | Autenticação |
| ------ | -------------------- | ------------------------------------------------ | ------------ |
| `GET`  | `/api`               | Rota inicial da API.                             | Não          |
| `GET`  | `/api/health`        | Verifica se a API está respondendo.              | Não          |
| `GET`  | `/api/health/db`     | Verifica a conexão com o banco.                  | Não          |
| `POST` | `/api/auth/register` | Cadastra uma organização e seu proprietário.     | Não          |
| `POST` | `/api/auth/login`    | Autentica o usuário.                             | Não          |
| `GET`  | `/api/me`            | Retorna os dados do usuário autenticado.         | Sim          |
| `POST` | `/api/customers`     | Operações de gerenciamento de clientes.          | Sim          |
| `POST` | `/api/technicians`   | Operações de gerenciamento de técnicos.          | Sim          |
| `POST` | `/api/work-orders`   | Operações de gerenciamento de ordens de serviço. | Sim          |
| `GET`  | `/api/work-orders/dashboard/summary` | Obtém resumo do dashboard de ordens de serviço. | Sim          |

As rotas de gerenciamento utilizam o contexto da organização autenticada para aplicar as regras de isolamento e autorização.

Consulte o Swagger para verificar os métodos, parâmetros, schemas e respostas disponíveis em cada endpoint.

## Testes e qualidade

O projeto utiliza testes automatizados para aumentar a confiabilidade da aplicação.

A estratégia contempla:

- Testes unitários para regras de negócio e serviços.
- Testes end-to-end para validar os fluxos da API.
- Validação e tipagem com TypeScript.
- Lint para padronização e identificação de problemas no código.
- Build das aplicações para verificar a integridade dos projetos.

### Comandos

Execute na raiz do monorepo:

| Comando                      | Descrição                                 |
| ---------------------------- | ----------------------------------------- |
| `pnpm dev:api`               | Inicia a API em desenvolvimento.          |
| `pnpm dev:web`               | Inicia o frontend em desenvolvimento.     |
| `pnpm build`                 | Executa os builds configurados.           |
| `pnpm lint`                  | Executa os linters configurados.          |
| `pnpm test`                  | Executa os testes unitários configurados. |
| `pnpm --filter api test:e2e` | Executa os testes end-to-end da API.      |

Os testes que dependem do banco de dados precisam de uma instância PostgreSQL disponível e das variáveis de ambiente correspondentes.

## Roadmap

O desenvolvimento da V1 está organizado em etapas para manter o escopo controlado e garantir a entrega de uma aplicação funcional.

| Etapa    | Entrega                                                                           | Status             |
| -------- | --------------------------------------------------------------------------------- | ------------------ |
| Semana 1 | Monorepo, infraestrutura inicial, CI/CD, autenticação e cadastro de organizações. | Concluída          |
| Semana 2 | Gerenciamento de clientes e isolamento multi-tenant.                              | Concluída          |
| Semana 3 | Gerenciamento de ordens de serviço e atribuição de técnicos.                      | Concluída          |
| Semana 4 | Máquina de estados e histórico de eventos das ordens.                             | Em desenvolvimento |
| Semana 5 | Dashboard operacional e financeiro.                                               | Concluída          |
| Semana 6 | Revisão, testes, documentação, dados de demonstração e lançamento da V1.          | Planejada          |

### Evoluções futuras

Funcionalidades adicionais serão avaliadas somente após a conclusão e disponibilização da primeira versão.

Entre as possibilidades estão:

- Aplicativo mobile para técnicos.
- Notificações em tempo real.
- Integração com WhatsApp.
- Relatórios avançados.
- Indicadores de desempenho.
- Integrações financeiras.

Novas ideias são registradas no arquivo `IDEIAS.md`, evitando mudanças constantes de escopo durante o desenvolvimento da V1.

---

## Deploy e infraestrutura

A arquitetura foi planejada para permitir que cada aplicação seja implantada de maneira independente.

| Serviço             | Tecnologia     |
| ------------------- | -------------- |
| Frontend            | Vercel         |
| API                 | Render         |
| Banco de dados      | Neon           |
| Ambiente local      | Docker Compose |
| Integração contínua | GitHub Actions |

O pipeline de CI/CD utiliza verificações automatizadas para validar o código e reduzir problemas antes da implantação.

---

## Objetivo do projeto

O ServiceFlow também é um projeto de portfólio voltado à aplicação de conceitos de desenvolvimento Full Stack em um cenário próximo de um produto real.

Durante seu desenvolvimento, são trabalhados conceitos como:

- Arquitetura de aplicações com monorepo.
- Desenvolvimento de APIs REST com NestJS.
- Separação de responsabilidades e modularização.
- Modelagem relacional com PostgreSQL.
- Persistência de dados com Prisma.
- Autenticação e autorização com JWT e RBAC.
- Isolamento multi-tenant.
- Segurança de aplicações web.
- Testes automatizados.
- Integração contínua e deploy.

**O objetivo é construir uma aplicação funcional, segura e sustentável, priorizando decisões técnicas justificadas e funcionalidades que resolvam problemas reais de empresas prestadoras de serviços.**

---

**ServiceFlow — Organize operações. Simplifique serviços.**
