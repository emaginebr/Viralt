# Implementation Plan: Viral Giveaway & Contest Platform (SweepWidget Clone)

**Branch**: `001-sweepwidget-clone` | **Date**: 2026-04-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-sweepwidget-clone/spec.md`

## Summary

Construir uma plataforma de sorteios e concursos virais sobre a infraestrutura existente do Viralt. O core envolve expandir as entidades Campaign/Client existentes, criar novas entidades (Prize, Winner, Referral, UnlockReward, Submission, Vote, Webhook, Brand), implementar **GraphQL via HotChocolate** (skill `/dotnet-graphql`) para todas as consultas com design dual-schema (admin autenticado + publico), manter REST controllers apenas para mutations (insert, update, delete, draw, notify, etc.), construir a experiencia publica (landing page + widget embarcavel) e o painel admin (builder de campanha, gerenciamento de participantes, selecao de vencedores, analytics). Integrações sociais delegadas ao BazzucaMedia via pontos de extensão. **Ambientes** configurados via skill `/dotnet-env` com Development (local), Docker (local containers) e Production (Docker remoto, sem SSL, apenas porta 80).

## Technical Context

**Language/Version**: C# / .NET 8.0 (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: EF Core 9.x, NAuth, zTools, HotChocolate 14.3.0, React 18.x, React Router 6.x, Bootstrap 5.x, i18next 25.x
**Storage**: PostgreSQL (via EF Core com lazy loading proxies)
**Testing**: Validacao manual + FluentValidation para DTOs
**Target Platform**: Web (servidor Linux/Docker + SPA browser)
**Project Type**: Web application (GraphQL + REST API + SPA React)
**Performance Goals**: 1.000 participantes simultaneos, landing page < 3s em 4G
**Constraints**: Sem Docker local, sem integracoes sociais diretas (BazzucaMedia), npm install com --legacy-peer-deps, sem SSL (HTTP apenas)
**Scale/Scope**: ~15 entidades backend, ~20 paginas frontend, 4 fases de implementacao
**Query Layer**: GraphQL (HotChocolate) para todas as consultas; REST para mutations e callbacks
**Environments**: Development (local), Docker (local containers), Production (remote Docker, sem SSL, porta 80)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Status | Notas |
|-----------|--------|-------|
| I. Skills Obrigatorias | PASS | `/dotnet-architecture` para entidades, `/dotnet-graphql` para queries, `/react-architecture` para frontend, `/dotnet-env` para ambientes |
| II. Stack Tecnologica | PASS | .NET 8, EF Core 9, React 18, Vite, Context API. HotChocolate 14.3 autorizado |
| III. Case Sensitivity | PASS | `Contexts/`, `Services/` uppercase; `hooks/`, `types/` lowercase |
| IV. Convencoes de Codigo | PASS | PascalCase .NET, camelCase TS, `interface` nao `type`, `[JsonPropertyName]` |
| V. Convencoes de BD | PASS | snake_case, bigint PKs, ClientSetNull, Fluent API |
| VI. Autenticacao | PASS | NAuth Basic token, `[Authorize]` em controllers admin e schema admin GraphQL |
| VII. Variaveis de Ambiente | PASS | `VITE_` frontend, `ConnectionStrings__` backend |
| VIII. Tratamento de Erros | PASS | Try-catch StatusCode REST, GraphQLErrorLogger para GraphQL |
| IX. Bibliotecas Externas | PASS | NAuth para auth, zTools para S3/email/slugs |

**Result: ALL GATES PASS**

## Project Structure

### Documentation (this feature)

```text
specs/001-sweepwidget-clone/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
Backend (.NET 8 — Clean Architecture + GraphQL):

Viralt.GraphQL/                       # (NOVO PROJETO — skill /dotnet-graphql)
├── GraphQLServiceExtensions.cs       # DI: AddGraphQL, schemas, paging, filtering
├── GraphQLErrorLogger.cs             # ExecutionDiagnosticEventListener
├── Admin/                            # Schema autenticado [Authorize]
│   ├── AdminQuery.cs
│   └── Types/
│       ├── CampaignAdminType.cs
│       ├── ClientAdminType.cs
│       └── AnalyticsType.cs
├── Public/                           # Schema publico (sem auth)
│   ├── PublicQuery.cs
│   └── Types/
│       ├── CampaignPublicType.cs
│       ├── ClientPublicType.cs
│       └── PrizePublicType.cs
└── Types/                            # Types compartilhados
    ├── CampaignEntryType.cs
    ├── CampaignFieldType.cs
    ├── PrizeType.cs
    ├── WinnerType.cs
    ├── SubmissionType.cs
    └── ReferralType.cs

Viralt.API/
├── Controllers/                      # Apenas MUTATIONS (POST/DELETE)
│   ├── CampaignController.cs
│   ├── CampaignFieldController.cs
│   ├── CampaignEntryController.cs
│   ├── ClientController.cs
│   ├── PrizeController.cs
│   ├── WinnerController.cs
│   ├── PublicController.cs
│   └── ExternalController.cs
├── Startup.cs                        # Mapeamento: /graphql/admin, /graphql/public
├── appsettings.json                  # Base (nao-sensivel)
├── appsettings.Development.json      # Valores locais hardcoded
├── appsettings.Docker.json           # Valores vazios (vem de .env)
└── appsettings.Production.json       # Valores nao-sensiveis preenchidos

Viralt.Domain/Models/                 # Entidades existentes + novas
Viralt.Domain/Services/               # Services existentes + novos
Viralt.DTO/                           # DTOs existentes + novos
Viralt.Infra/                         # Context, Repositories, Migrations
Viralt.Infra.Interfaces/              # Interfaces de Repository
Viralt.BackgroundService/             # Workers (webhooks, jobs)

Raiz do repositorio — Arquivos de ambiente (skill /dotnet-env):
├── .env                              # Docker local — todos os valores
├── .env.example                      # Exemplo commitado (placeholders)
├── .env.prod                         # Producao — apenas secrets
├── .env.prod.example                 # Exemplo commitado (placeholders)
├── docker-compose.yml                # Docker local (portas expostas)
├── docker-compose-prod.yml           # Producao (porta 80, sem SSL)
├── Dockerfile                        # Multi-stage build
└── .github/workflows/
    └── deploy-prod.yml               # Pipeline SSH deploy

Frontend (React 18 + TypeScript):
viralt-app/src/
├── types/                            # (expandir + novos)
├── Services/
│   ├── graphqlClient.ts              # (NOVO — fetch wrapper GraphQL)
│   └── (demais services)
├── Contexts/                         # (expandir + novos)
├── hooks/                            # (novos hooks)
├── Pages/                            # (novas paginas)
└── Components/                       # (novos componentes)
```

**Structure Decision**: Clean Architecture + Viralt.GraphQL (dual-schema). REST para mutations. Ambientes via `/dotnet-env`: Development (hardcoded local), Docker (.env), Production (.env.prod, porta 80, sem SSL). Frontend fetch wrapper leve para GraphQL.

## Environment Configuration

### Development (local, sem Docker)

| Aspecto | Valor |
|---------|-------|
| `ASPNETCORE_ENVIRONMENT` | Development |
| appsettings | `appsettings.Development.json` (valores hardcoded) |
| Database | PostgreSQL localhost |
| Frontend | `npm start` (Vite dev server) |
| Swagger | Habilitado |
| GraphQL Playground | Banana Cake Pop habilitado |
| SSL | Nao |

### Docker (local containers)

| Aspecto | Valor |
|---------|-------|
| `ASPNETCORE_ENVIRONMENT` | Docker |
| appsettings | `appsettings.Docker.json` (valores vazios) |
| Secrets | `.env` (todos os valores, nao commitado) |
| Database | PostgreSQL em container, porta exposta |
| Frontend | Build estatico servido por container |
| Swagger | Habilitado |
| GraphQL Playground | Habilitado |
| SSL | Nao |

### Production (remote Docker, sem SSL)

| Aspecto | Valor |
|---------|-------|
| `ASPNETCORE_ENVIRONMENT` | Production |
| appsettings | `appsettings.Production.json` (valores nao-sensiveis) |
| Secrets | `.env.prod` (apenas secrets, nao commitado) |
| Database | PostgreSQL em container, porta NAO exposta |
| Frontend | Build estatico servido por Nginx |
| Swagger | Desabilitado |
| GraphQL Playground | Desabilitado |
| SSL | **Nao** |
| Porta exposta | **80 apenas** |
| Deploy | GitHub Actions via SSH |

### Variaveis de Ambiente Necessarias

| Variavel | Dev | Docker | Prod | Descricao |
|----------|-----|--------|------|-----------|
| `ConnectionStrings__ViraltContext` | Hardcoded | .env | .env.prod | PostgreSQL connection string |
| `ASPNETCORE_ENVIRONMENT` | launchSettings | docker-compose | docker-compose-prod | Ambiente ativo |
| `NAuth__BaseUrl` | Hardcoded | .env | .env.prod | URL do servico NAuth |
| `NAuth__AppKey` | Hardcoded | .env | .env.prod | Chave da aplicacao NAuth |
| `zTools__FileClient__BucketName` | Hardcoded | .env | .env.prod | Bucket S3 |
| `zTools__FileClient__AccessKey` | Hardcoded | .env | .env.prod | AWS Access Key |
| `zTools__FileClient__SecretKey` | Hardcoded | .env | .env.prod | AWS Secret Key |
| `zTools__MailClient__ApiKey` | Hardcoded | .env | .env.prod | MailerSend API Key |
| `BazzucaMedia__ApiKey` | Hardcoded | .env | .env.prod | Chave de integracao |
| `Recaptcha__SiteKey` | Hardcoded | .env | appsettings | reCAPTCHA site key |
| `Recaptcha__SecretKey` | Hardcoded | .env | .env.prod | reCAPTCHA secret key |
| `VITE_API_URL` | .env | docker-compose | docker-compose-prod | URL base da API (frontend) |
| `VITE_GRAPHQL_ADMIN_URL` | .env | docker-compose | docker-compose-prod | URL GraphQL admin |
| `VITE_GRAPHQL_PUBLIC_URL` | .env | docker-compose | docker-compose-prod | URL GraphQL public |

### Gitignore Additions

```
.env
.env.prod
```

### Arquivos Commitados (exemplos)

- `.env.example` — Placeholders para Docker local
- `.env.prod.example` — Placeholders para Production secrets

## Complexity Tracking

| Decisao | Justificativa | Alternativa rejeitada |
|---------|---------------|----------------------|
| Novo projeto Viralt.GraphQL | Skill `/dotnet-graphql` exige projeto dedicado | Queries em controllers REST |
| Dual-schema (admin + public) | Campos sensiveis invisiveis no public | Schema unico com diretivas |
| Fetch wrapper em vez de Apollo | Manter Context API (Constitution II) | Apollo Client |
| 3 ambientes via `/dotnet-env` | Padrao do projeto, separacao clara de secrets | Ambiente unico com feature flags |
| Sem SSL em todos ambientes | Decisao do usuario — SSL nao necessario neste momento | SSL via Nginx reverse proxy |
