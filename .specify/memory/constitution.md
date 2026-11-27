<!--
Sync Impact Report
==================
Version change: 4.0.0 → 4.0.1
Bump rationale 4.0.1: PATCH — atualização da seção "Transição", sem mudança de regra.
  - TODO(FRONTEND-VITE) resolvido pela feature 003-frontend-vite-tailwind (Vite 6 + Tailwind 4 +
    `VITE_*`, Bootstrap/MUI removidos, design system "Bilhete Premiado" em `docs/design/`).
  - TODO(GITVERSION) resolvido (`GitVersion.yml` criado).
  - TODO(A11Y) restrito às telas administrativas.
Templates: ✅ sem impacto. ✅ CLAUDE.md e README.md atualizados para a nova stack do frontend.

Histórico 3.0.1 → 4.0.0
Bump rationale: MAJOR — constitution remontada com a skill `generate-constitution` (templates
base/structure/agents/backend/frontend + módulo k8s-deploy). Redefinições incompatíveis:
  - Frontend: CRA + Bootstrap + `REACT_APP_` → Vite 6 + Tailwind CSS 4 + `VITE_`.
  - Autenticação: NAuth (Basic token) → JWT Bearer próprio via skill `dotnet-auth`; NAuth proibido.
  - Deploy: servidor via SSH + docker compose → cluster Kubernetes emagine (`k8s-deploy`).
  - Docker: "inacessível localmente" → roda no WSL2 (skill `wsl-docker`).
  - Agentes: novo `devops-engineer` (infra, ambientes, deploy); `analyst` e `qa-developer`
    passam a ter responsabilidade explícita.
  - Commits: prefixo `fix:` por padrão (GitVersion).

Princípios (antigos → novos):
  - I. Skills de Arquitetura Obrigatórias → I. Skills Obrigatórias (+ dotnet-auth, k8s-deploy).
  - II. Stack Tecnológica Fixa → dividido em V (Backend) e VI (Frontend).
  - III. Case Sensitivity → VI. Frontend / Case Sensitivity de Diretórios.
  - IV. Convenções de Código → V e VI (por componente).
  - V. Banco de Dados → V. Backend / Banco de Dados.
  - VI. Autenticação e Segurança → V e VI (JWT via dotnet-auth).
  - VII. Tratamento de Erros → V. Backend / Tratamento de Erros.
  - VIII. Agentes Especializados → IV. Responsabilidades dos Agentes (+ II. Regras Gerais para a
    regra da sessão principal).
  - IX. Acessibilidade → VI. Frontend / Acessibilidade (regras mantidas).
  - X. Bibliotecas e Integrações Externas → V. Backend / Integrações Externas (NAuth removido;
    MailerSend/S3 e proibição do zTools mantidos).

Seções adicionadas: II. Regras Gerais; VII. Infraestrutura e Deploy; Transição.
Seções removidas: Ambientes (substituída por VII e pela skill `dotnet-env`); checklist geral
(substituído pelos checklists por componente).

Templates e artefatos:
  - ✅ .specify/templates/plan-template.md, spec-template.md, tasks-template.md,
    checklist-template.md — genéricos; sem referências a NAuth/CRA/Vite. Nada a alterar.
  - ✅ CLAUDE.md — seção "Constitution" adicionada; restrição de Docker atualizada para WSL2.
  - ⚠ README.md — descreve o estado atual (CRA + Bootstrap, NAuth); atualizar após as migrações.
  - ⚠ frontend/, backend/ (NAuth), docker-compose-prod.yml, .env.prod.example,
    .github/workflows/deploy-prod.yml — legado tolerado, ver seção Transição.
  - ⚠ specs/002-remove-ztools/plan.md — Constitution Check referencia a v3.0.0 (histórico).

Follow-up TODOs: FRONTEND-VITE, AUTH-JWT, DEPLOY-K8S, GITVERSION, A11Y (seção Transição).
-->

# Viralt Constitution

Padrões obrigatórios de stack tecnológica, convenções de código, arquitetura, estrutura de pastas e
responsabilidades dos agentes que devem ser seguidos por todos os contribuidores (pessoas e agentes)
do projeto Viralt.

## Core Principles

### I. Skills Obrigatórias

Para implementação de novas entidades e funcionalidades, as seguintes skills **DEVEM** ser utilizadas:

| Skill | Quando usar | Invocação |
|---|---|---|
| **dotnet-architecture** | Criar/modificar entidades, services, repositories, DTOs, migrations, DI no backend | `/dotnet-architecture` |
| **dotnet-auth** | Criar/alterar autenticação de usuários (JWT Bearer, cadastro, login, `me`, hash de senha, roles) no backend | `/dotnet-auth` |
| **react-architecture** | Criar Types, Service, Context, Hook e registrar Provider no frontend | `/react-architecture` |
| **k8s-deploy** | Configurar e operar o deploy no cluster Kubernetes | `/k8s-deploy` |

**NÃO** reimplemente esses padrões manualmente — siga as skills.

### II. Regras Gerais

- **Docker** roda apenas dentro do WSL2 (skill `wsl-docker`) — **NÃO** existe `docker` no Windows;
  não tente executá-lo diretamente no PowerShell/Git Bash.
- **Secrets** (connection strings, tokens, chaves) **NUNCA** entram no Git, em logs ou no código
  cliente (frontend).
- **Versionamento** com GitVersion (`GitVersion.yml` + workflows `version-tag.yml` e
  `create-release.yml`, gerados pela skill `gitversion`).
- **Commits** usam o prefixo **`fix:`** (patch) por padrão. Outro prefixo — `feat:` (minor),
  `major:`/`breaking:`/`!` (major) — **somente** quando o usuário pedir explicitamente. Escopo
  opcional: `fix(api): ...`. Só commitar/push quando solicitado.
- **Documentação** em `docs/` (pt-BR por padrão, sufixo `.pt-BR.md` em documentos novos), mantida
  pelo agente `analyst`.
- Cada agente só altera as pastas sob sua responsabilidade (seção **Responsabilidades dos Agentes**).
- A sessão principal (orquestradora) **NÃO** edita código em `backend/`, `frontend/` nem arquivos de
  infraestrutura: delega ao agente responsável. Ela pode ler código, planejar, revisar e editar
  artefatos de especificação (`specs/`, `.specify/`, `CLAUDE.md`).

### III. Estrutura do Repositório

O projeto é dividido em componentes, **cada um na sua pasta**. Nenhum código de um componente pode
ficar fora da sua pasta, e a raiz contém só arquivos de repositório, documentação e infraestrutura.

```text
/
├── backend/              # API .NET — Viralt.sln, projetos Viralt.*, Viralt.Tests (dotnet-developer)
├── frontend/             # aplicação web React (react-developer)
├── docs/                 # documentação (analyst)
├── specs/                # especificações do Spec Kit
├── deploy/k8s/           # manifestos Kubernetes (devops-engineer)
└── .github/workflows/    # pipelines (devops-engineer)
```

- Os contratos entre componentes (DTOs ↔ types TypeScript) DEVEM usar os mesmos nomes de
  propriedades em camelCase no JSON.
- Cada componente tem build, testes e Dockerfile próprios dentro da sua pasta.
- `docker-compose.yml` na raiz continua sendo o ambiente local "Docker" (banco, API e frontend).

### IV. Responsabilidades dos Agentes

Toda tarefa DEVE ser executada pelo agente responsável. Um agente que receber uma tarefa fora do seu
escopo DEVE declarar que ela está fora do escopo, indicar o agente responsável e parar.

| Agente | Responsabilidade | Pastas |
|---|---|---|
| `analyst` | Documentação, README, diagramas Mermaid; especificações e análise de requisitos | `docs/`, `README.md` |
| `ux-designer` | Direção visual, design tokens, mockups HTML/CSS, specs de componentes, ícones/banners — **nunca** código `.tsx` | `docs/design/` |
| `dotnet-developer` | API .NET: Clean Architecture, EF Core, migrations, validação, autenticação JWT (`dotnet-auth`), integrações externas (MailerSend, S3), classes `IOptions` | `backend/` |
| `react-developer` | Frontend React + TypeScript: types, services, contexts, hooks, páginas, i18n, implementação dos designs do `ux-designer` | `frontend/` |
| `qa-developer` | Testes unitários (`Viralt.Tests`) e testes de API (`Viralt.ApiTests`) — só testes | projetos de teste em `backend/` |
| `devops-engineer` | Infraestrutura: Dockerfiles, ambientes .NET (`dotnet-env`: `appsettings.{Ambiente}.json`, `docker-compose`, `.env`), deploy no cluster Kubernetes (`k8s-deploy`), operação do cluster, DNS/Cloudflare | `deploy/`, `.github/workflows/`, `Dockerfile`s, `docker-compose*.yml`, `appsettings.*.json`, `.env.example`, `.env.prod.example` |

#### Regras de colaboração

- **Fluxo de uma funcionalidade**: `analyst` (especificação) → `ux-designer` (design, se houver UI)
  → desenvolvedor(es) do componente → `qa-developer` (testes) → `devops-engineer` (deploy).
- Mudança que atravessa componentes (ex.: novo endpoint + tela) é dividida por agente; nenhum agente
  implementa a parte do outro, e o contrato da API é definido antes.
- Ajustes de aplicação exigidos pelo deploy (endpoint `/health`, forwarded headers, variáveis de
  ambiente) são feitos pelo desenvolvedor do componente, a pedido do `devops-engineer`.
- O `ux-designer` entrega especificações; quem converte em código é o `react-developer`.
- Os agentes DEVEM seguir as Skills Obrigatórias; a escolha do agente não dispensa as skills.

### V. Backend (`backend/`)

Responsável: `dotnet-developer` (testes: `qa-developer`).

#### Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| .NET | 8.0 | Runtime e framework principal |
| Entity Framework Core | 9.x | ORM e migrações |
| PostgreSQL | Latest | Banco de dados relacional |
| Swashbuckle | 8.x | Swagger / OpenAPI |
| MailerSend (API REST direta) | v1 | Envio de e-mails transacionais |
| AWS SDK for .NET (`AWSSDK.S3`) | 3.x | Armazenamento de arquivos no S3 |

- **NÃO** introduzir ORMs alternativos (Dapper, etc.) — EF Core é o único ORM permitido.
- Skills de apoio: `dotnet-env` (ambientes Development/Docker/Production — arquivos de ambiente
  pelo `devops-engineer`, classes `IOptions` pelo `dotnet-developer`),
  `dotnet-fluent-validation` (validação),
  `dotnet-test` / `dotnet-test-api` (testes, via `qa-developer`).

#### Convenções de Código (.NET)

| Elemento | Convenção | Exemplo |
|---|---|---|
| Namespaces | PascalCase, file-scoped | `namespace Viralt.Domain.Services;` |
| Classes / Interfaces | PascalCase | `CampaignService`, `ICampaignRepository` |
| Métodos | PascalCase | `GetById()`, `MapToDto()` |
| Propriedades | PascalCase | `CampaignId`, `CreatedAt` |
| Campos privados | _camelCase | `_repository`, `_context` |
| Constantes | UPPER_CASE | `BUCKET_NAME` |

- `[JsonPropertyName("camelCase")]` em todas as propriedades de DTOs.
- DTOs seguem `Info`, `InsertInfo`, `Result` e as chaves `sucesso`, `mensagem`, `erros`
  (detalhes na skill `dotnet-architecture`).

#### Banco de Dados (PostgreSQL)

| Elemento | Convenção | Exemplo |
|---|---|---|
| Tabelas | snake_case plural | `campaigns`, `campaign_entries` |
| Colunas | snake_case | `campaign_id`, `created_at` |
| Primary Keys | `{entidade}_id`, bigint identity | `campaign_id bigint PK` |
| Constraint PK | `{tabela}_pkey` | `campaigns_pkey` |
| Foreign Keys | `fk_{pai}_{filho}` | `fk_campaign_entry` |
| Delete behavior | `ClientSetNull` | Nunca Cascade |
| Timestamps | `timestamp without time zone` | Sem timezone |
| Strings | `varchar` com MaxLength | `varchar(260)` |
| Booleans | `boolean` com default | `DEFAULT true` |
| Status/Enums | `integer` | `DEFAULT 1` |

> Configuração via Fluent API (sem Data Annotations para schema). DbContext, Fluent API e migrações
> (`dotnet ef`) são detalhados na skill `dotnet-architecture`.

#### Autenticação e Segurança

Autenticação de usuários **sempre** pela skill `dotnet-auth` — **NÃO** criar esquemas próprios e
**NÃO** usar NAuth (legado).

| Aspecto | Padrão |
|---|---|
| Esquema | JWT Bearer (`JwtBearerDefaults.AuthenticationScheme`), HS256 |
| Header | `Authorization: Bearer {token}` |
| Expiração | **90 dias** por padrão (`Jwt:ExpirationDays`), configurável por ambiente |
| Secret | `Jwt:Secret` com ≥ 32 bytes; a API não sobe sem ele |
| Claims | `sub` (userId), `email`, `name`, `jti`, `role` |
| Senha | `PasswordHasher` do ASP.NET Core Identity (PBKDF2 com salt) |
| Endpoints | `POST api/auth/register`, `POST api/auth/login`, `GET api/auth/me` |
| Usuário logado | `User.GetUserId()` (claim `sub`) — nunca do body/query |
| Proteção de rotas | `[Authorize]` na classe do controller, `[AllowAnonymous]` explícito nos públicos |

- **NUNCA** logar senha, hash ou token, nem expor connection strings ou secrets em respostas da API.
- Login inválido devolve sempre a mesma mensagem genérica (não revelar se o email existe).
- Controllers com dados sensíveis DEVEM ter `[Authorize]`; apenas os endpoints públicos de campanha
  (página pública, widget, inscrição de participante) são anônimos.
- CORS `AllowAnyOrigin` apenas em Development.
- A API confia em forwarded headers (`X-Forwarded-For`/`X-Forwarded-Proto`) e expõe `/health`.

#### Integrações Externas (e-mail e armazenamento)

O Viralt fala diretamente com os provedores, sem serviço intermediário. O **zTools NÃO DEVE** ser
usado (nem o pacote NuGet, nem a API, nem a configuração).

| Capacidade | Provedor | Contrato (Infra.Interfaces) | Implementação (Infra) |
|---|---|---|---|
| E-mail transacional | MailerSend (API REST) | `IMailerSendAppService` | `MailerSendAppService` |
| Armazenamento de arquivos | S3 (`AWSSDK.S3`) | `IImageAppService` | `ImageAppService` |

- Cada integração externa DEVE ficar atrás de um contrato em `Viralt.Infra.Interfaces`, com a
  implementação em `Viralt.Infra/AppServices`. Domain e API **NÃO** chamam o provedor diretamente
  nem conhecem os tipos do SDK.
- Credenciais, endpoints, remetente, bucket e pasta DEVEM vir da configuração (`Secao__Chave`),
  nunca do código. Credenciais **NUNCA** chegam ao frontend.
- Arquivos DEVEM ser gravados no bucket compartilhado `emagine`, sempre sob o prefixo `viralt/`,
  com nome único por envio. As URLs são públicas e permanentes.
- Falhas do provedor DEVEM virar exceções com mensagem clara (ex.: credencial inválida, remetente
  não verificado); nunca ignoradas em silêncio.
- Novas integrações (ex.: IA) seguem o mesmo padrão: contrato em Infra.Interfaces, implementação em
  Infra e configuração por ambiente.

#### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ConnectionStrings__ViraltContext` | Sim | Connection string PostgreSQL do Viralt |
| `ASPNETCORE_ENVIRONMENT` | Sim | Development, Docker, Production |
| `Jwt__Secret` | Sim | Secret de assinatura do JWT (≥ 32 bytes; só em secrets, nunca no Git) |
| `Jwt__Issuer` / `Jwt__Audience` | Não | Padrão: `viralt` |
| `Jwt__ExpirationDays` | Não | Expiração do token em dias (padrão `90`) |
| `MailerSend__ApiToken` | Sim | Token da API do MailerSend; nunca versionado |
| `MailerSend__FromEmail` | Não | Remetente padrão (padrão `noreply@viralt.com`) |
| `MailerSend__FromName` | Não | Nome do remetente (padrão `Viralt`) |
| `MailerSend__ApiUrl` | Não | Base da API (padrão `https://api.mailersend.com/v1/`) |
| `S3__BucketName` | Sim | Bucket compartilhado (padrão `emagine`) |
| `S3__Prefix` | Não | Pasta do Viralt no bucket (padrão `viralt/`) |
| `S3__Region` | Sim | Região do bucket |
| `S3__ServiceUrl` | Não | Endpoint S3-compatível, quando não for AWS |
| `S3__PublicBaseUrl` | Não | Base pública das URLs (CDN); vazio = URL padrão da AWS |
| `S3__AccessKey` / `S3__SecretKey` | Sim | Credenciais do S3; nunca versionadas |

- Configuração por variáveis de ambiente usa a convenção `Secao__Chave`; **NÃO** usar
  `AddEnvironmentVariables("PREFIXO")`.

#### Tratamento de Erros

```csharp
try { /* lógica */ }
catch (Exception ex) { return StatusCode(500, ex.Message); }
```

#### Checklist do Backend

- [ ] Utilizou a skill `dotnet-architecture` para novas entidades
- [ ] Tabelas e colunas seguem snake_case no PostgreSQL
- [ ] Autenticação feita com a skill `dotnet-auth` (sem NAuth)
- [ ] Controllers com dados sensíveis possuem `[Authorize]`
- [ ] Nenhuma referência ao zTools; e-mail e storage passam pelos AppServices da Infra
- [ ] Testes criados/atualizados pelo `qa-developer`

### VI. Frontend (`frontend/`)

Responsável: `react-developer` (design: `ux-designer`).

#### Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 18.x | Framework UI |
| TypeScript | 5.x | Tipagem estática |
| React Router | 6.x | Roteamento SPA |
| Vite | 6.x | Build toolchain |
| Tailwind CSS | 4.x | Estilização utility-first (layout, grid e componentes) |
| i18next | 25.x | Internacionalização (pt, en, es) |
| Fetch API | Nativo | HTTP client (novos serviços; Axios 1.x só em código legado) |

- **Vite é o bundler obrigatório** — NÃO usar CRA, Webpack manual ou outros bundlers.
- **Tailwind CSS é obrigatório** — NÃO usar Bootstrap, React-Bootstrap, Material UI ou outros
  frameworks CSS de componentes.
- **NÃO** adicionar state management (Redux, Zustand, MobX) — Context API é o padrão.
- Skills de apoio: `add-react-i18n` (i18n), `react-modal`, `react-alert`, `frontend-design`.

#### Case Sensitivity de Diretórios (Inviolável)

| Diretório | Casing | Motivo |
|---|---|---|
| `Contexts/` | Uppercase C | Compatibilidade Docker/Linux |
| `Services/` | Uppercase S | Compatibilidade Docker/Linux |
| `hooks/` | Lowercase h | Convenção React |
| `types/` | Lowercase t | Convenção TypeScript |

**Todos os imports DEVEM corresponder exatamente ao casing no disco.**

#### Convenções de Código (TypeScript/React)

| Elemento | Convenção | Exemplo |
|---|---|---|
| Componentes | PascalCase | `LoginPage`, `CampaignCard` |
| Interfaces | PascalCase | `CampaignContextType` |
| Variáveis / Funções | camelCase | `getHeaders`, `loadCampaigns` |
| Constantes | UPPER_CASE | `AUTH_STORAGE_KEY` |
| Tipos | `interface` (não `type`) | `interface CampaignInfo {}` |
| Funções | Arrow functions | `const fn = () => {}` |
| Variáveis | `const` por padrão | `const campaigns = []` |

#### Autenticação e Segurança

- Header `Authorization: Bearer {token}` em toda chamada autenticada (JWT do backend, skill `dotnet-auth`).
- Guardar o `expiresAt` do login; ao receber **401**, limpar a sessão e redirecionar para o login.
- **NUNCA** armazenar tokens em cookies — usar localStorage.
- **NUNCA** expor connection strings ou secrets no frontend.

#### Acessibilidade (WCAG 2.1 AA)

Toda interface DEVE atender ao nível AA das WCAG 2.1 — as páginas públicas de campanha e o widget
embarcável são abertos pelo público em geral:

- **Contraste**: texto normal ≥ 4,5:1; texto grande/ícones ≥ 3:1; design tokens validados contra
  essas razões.
- **Alvos de toque**: no mínimo 44×44 px para todo elemento clicável.
- **Rótulos**: todo campo com `<label>` associado; botões só com ícone com `aria-label`; imagens
  informativas com `alt`.
- **Teclado**: toda ação executável pelo teclado, foco visível e ordem lógica; modais prendem o foco
  e fecham com `Esc`.
- **Semântica**: elementos nativos (`button`, `a`, `nav`, `main`, `h1`…`h3`) antes de ARIA; o
  documento declara o `lang` do idioma ativo (`pt-BR`, `en` ou `es`).
- **Cor**: informação NÃO depende só da cor.
- **Movimento**: animações respeitam `prefers-reduced-motion`.
- **Feedback**: mensagens de sucesso/erro anunciadas com `aria-live`; erros de campo ligados ao
  campo (`aria-describedby`).
- **Zoom**: layout usável com texto a 200%, sem bloquear o zoom do navegador.

#### Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | Sim | URL base da API (vazio = mesma origem, atrás do mesmo Ingress) |
| `VITE_SITE_BASENAME` | Não | Base path do React Router |

**Prefixo obrigatório `VITE_`** — acessar via `import.meta.env.VITE_*`. **NÃO** usar `REACT_APP_`.

#### Checklist do Frontend

- [ ] Utilizou a skill `react-architecture` para novas entidades
- [ ] Imports respeitam o casing exato dos diretórios
- [ ] Variáveis de ambiente usam prefixo `VITE_`
- [ ] Telas novas seguem a especificação do `ux-designer` e a seção de Acessibilidade

### VII. Infraestrutura e Deploy

Responsável: `devops-engineer` (skill `k8s-deploy`).

- Produção roda no cluster Kubernetes compartilhado da emagine (`do-nyc2-emagine-k8s`), atrás do
  Cloudflare Tunnel `emagine-k8s` e do `ingress-nginx`. Namespace do projeto: `viralt`.
- Manifestos em `deploy/k8s/` (Kustomize), gerados a partir dos templates da skill `k8s-deploy`;
  pipeline em `.github/workflows/deploy-prod.yml` (imagens no GHCR + `kubectl apply -k`).
- Imagens: `viralt-api` (backend) e `viralt-web` (frontend).
- Secrets exclusivos do projeto no GitHub com prefixo `VIRALT` (ex.: `VIRALT_CONNECTION_STRING` →
  `ConnectionStrings__ViraltContext`, `VIRALT_JWT_SECRET` → `Jwt__Secret`,
  `VIRALT_MAILERSEND_API_TOKEN`, `VIRALT_S3_ACCESS_KEY`, `VIRALT_S3_SECRET_KEY`); a pipeline usa só o
  kubeconfig da ServiceAccount do projeto, **nunca** o kubeconfig de admin.
- Sem TLS no Ingress (HTTPS termina na Cloudflare); a aplicação confia em forwarded headers.
- Toda alteração no cluster ou nos secrets exige confirmação explícita do usuário.

## Transição (código legado a migrar)

Esta versão adota padrões que o código atual ainda não segue. Até cada migração ser entregue (como
feature própria via Spec Kit), o código legado é tolerado, mas **todo código novo segue a
constitution** e nenhuma mudança pode ampliar o legado:

- TODO(AUTH-JWT): substituir o NAuth (Basic token, `NAuth__*`, chave `login-with-metamask:auth`) por
  JWT Bearer próprio via `dotnet-auth`, incluindo a migração de usuários.
- TODO(DEPLOY-K8S): substituir o deploy via SSH (`docker-compose-prod.yml`, `.env.prod.example`,
  `deploy-prod.yml` atual) pelo deploy no cluster Kubernetes.
- TODO(A11Y): as telas reescritas na feature 003 seguem a seção de Acessibilidade. As telas
  públicas passam por auditoria automática (axe), mas o painel ainda não foi auditado.

## Governance

- Esta constitution prevalece sobre qualquer outra prática ou preferência individual. Em conflito com
  uma skill, prevalece a constitution e a skill deve ser corrigida.
- Emendas só via `/speckit.constitution` (ou `/generate-constitution`), com incremento de versão
  semântico: MAJOR (remoção/redefinição de princípio), MINOR (princípio ou seção nova), PATCH
  (clarificação/redação).
- Todo plano (`/speckit.plan`) e toda revisão de código DEVEM verificar conformidade com estes
  princípios; desvios precisam de justificativa explícita no plano ("Complexity Tracking").

**Version**: 4.0.1 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-11-27
