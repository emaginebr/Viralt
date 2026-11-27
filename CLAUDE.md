# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Viralt é uma plataforma de campanhas virais (sorteios, concursos, widgets embarcáveis) com API .NET e frontend React.

## Constitution

A constitution do projeto está em [`.specify/memory/constitution.md`](.specify/memory/constitution.md)
e é **inegociável**: leia-a antes de planejar ou implementar qualquer mudança e siga suas regras de
stack, convenções, estrutura de pastas e responsabilidades dos agentes.

- Componentes: backend (`backend/`) + frontend (`frontend/`); deploy no cluster Kubernetes (`deploy/k8s/`).
- Agentes: `dotnet-developer` → `backend/`; `react-developer` → `frontend/`; `qa-developer` → testes em `backend/`; `ux-designer` → design; `devops-engineer` → infra/deploy; `analyst` → `docs/`.
- Alterações na constitution só via `/speckit.constitution` (ou `/generate-constitution`).
- Commits com prefixo `fix:` por padrão (GitVersion); outro prefixo (`feat:`, `major:`...) só quando o
  usuário pedir.
- A v4 adota padrões que o código ainda não segue (JWT via `dotnet-auth`, Kubernetes). O que está descrito abaixo é o **estado atual** do código; veja a seção "Transição" da constitution. O frontend já está em Vite + Tailwind (feature 003).

## Important Constraints

- **Docker** runs only inside WSL2 (skill `wsl-docker`); there is no `docker` binary on Windows — never run it directly from PowerShell/Git Bash.
- When database operations are needed, use `dotnet ef` commands directly against a running PostgreSQL instance configured in appsettings.

## Build & Run Commands

### Repository layout

- `backend/` — .NET solution (`Viralt.sln`, all `Viralt.*` projects, `Dockerfile`, `.dockerignore`)
- `frontend/` — React app (Vite 6 + Tailwind CSS 4), with its own `Dockerfile` and `nginx.conf`
- Root — `docker-compose.yml`, `docker-compose-prod.yml` (build contexts `./backend` and `./frontend`), `nginx/`, `SQL/`, `docs/`, `specs/`, `.env*`

### Backend (.NET 8)

Run these from `backend/` (`cd backend`):

```bash
# Build entire solution
dotnet build Viralt.sln

# Build specific project
dotnet build Viralt.API/Viralt.API.csproj

# Run API locally (uses appsettings.Development.json)
dotnet run --project Viralt.API

# EF Core migrations (project: Viralt.Infra, startup: Viralt.API)
dotnet ef migrations add <Name> --project Viralt.Infra --startup-project Viralt.API --output-dir Migrations
dotnet ef database update --project Viralt.Infra --startup-project Viralt.API

# Unit tests (xUnit + Moq); the S3Integration test is skipped unless S3__AccessKey is set
dotnet test Viralt.Tests
dotnet ef migrations script --project Viralt.Infra --startup-project Viralt.API --idempotent
```

### Frontend (Vite + TypeScript + Tailwind)

```bash
cd frontend
npm install          # Node >= 20; no --legacy-peer-deps
npm run dev          # dev server on http://localhost:3000 (npm start is an alias)
npm run build        # tsc --noEmit && vite build -> build/
npm run preview      # serve build/ locally
npm test             # vitest run (src/test/)
```

**Note:** Uses `VITE_*` env vars via `import.meta.env` (never `process.env` / `REACT_APP_*`). `index.html` lives in `frontend/` root; entry point is `src/index.tsx`.

## Architecture

### Backend — Clean Architecture (.NET 8 / EF Core 9 / PostgreSQL)

All projects live under `backend/`:

```
Viralt.API              → Controllers, Startup (CORS, Swagger, Auth middleware)
Viralt.Application      → Centralized DI via Startup.cs extension method
Viralt.Domain           → Rich models (Models/), services (Services/), interfaces (Interfaces/)
Viralt.DTO              → Data Transfer Objects, zero dependencies
Viralt.Infra            → DbContext, Repository implementations, AppServices (S3, MailerSend)
Viralt.Infra.Interfaces → Generic repository interfaces (<TModel>), AppService contracts
Viralt.BackgroundService → Worker service
Viralt.GraphQL          → HotChocolate GraphQL schemas (Admin, Public)
Viralt.Tests            → xUnit unit tests (Domain/, Infra/ mirror the source folders)
```

**Dependency flow:** API → Application → Domain + Infra. Domain depends only on Infra.Interfaces + DTO. Infra.Interfaces has no domain dependencies (uses generics).

**Key patterns:**
- Repository interfaces use single generic `<TModel> where TModel : class` — never reference domain models directly
- Domain services receive/return DTOs at public API, work with Domain Models internally
- Services contain manual `MapToDto()` / `MapToModel()` methods
- Connection string key: `ConnectionStrings:ViraltContext`
- Auth: Basic token scheme (`Authorization: Basic {token}`)
- Design-time factory: `backend/Viralt.Infra/Context/ViraltContextFactory.cs`

**Database conventions (PostgreSQL):**
- Table names: `snake_case` plural (`users`, `campaigns`, `client_entries`)
- Column names: `snake_case` (`user_id`, `created_at`)
- PKs: `bigint` with identity, named `{entity}_id`
- Timestamps: `timestamp without time zone`
- FKs: `DeleteBehavior.ClientSetNull`, named `fk_{parent}_{child}`

### Frontend — React 18 + TypeScript + Context API

```
frontend/src/
├── Contexts/        → Auth, User, Network, Profile, Product, Order, Invoice, Image, Template
│   └── Utils/ContextBuilder.tsx  → HOC that composes providers from array
├── Services/        → API services (Axios-based legacy + fetch-based new)
│   └── apiHelpers.ts             → getHeaders(auth), saveSession, loadSession, clearSession
├── Pages/           → Route page components
├── Components/      → Shared UI components
│   └── ui/          → Design system base components (Button, Input, Modal, Alert, Table, Tabs, DropdownMenu…)
├── styles/          → index.css (Tailwind) + theme.css (design tokens, copy of docs/design/theme.css)
├── test/            → Vitest setup and tests
├── Business/        → Business logic layer (legacy pattern)
├── DTO/             → Frontend data types (legacy pattern)
├── Infra/           → Axios HttpClient (legacy pattern)
├── hooks/           → Custom hooks (useAuth, useCampaign, useClient)
├── types/           → TypeScript type definitions (user.ts, campaign.ts, client.ts)
└── i18n.tsx         → i18next configuration
```

**Provider chain** (composed via `ContextBuilder` in App.tsx):
`AuthProvider → UserProvider → NetworkProvider → ProfileProvider → ProductProvider → OrderProvider → InvoiceProvider → ImageProvider → TemplateProvider → NewAuthProvider → CampaignProvider → ClientProvider`

**New architecture files** (fetch-based, following react-arch skill):
- Types in `src/types/` — include `sucesso`, `mensagem`, `erros` (Portuguese API response keys)
- Services in `src/Services/` — class-based with `handleResponse` and `getHeaders(true)`
- Contexts in `src/Contexts/` — combined Context+Provider, `useCallback` on all methods
- Hooks in `src/hooks/` — thin wrappers with null-check

**Styling:** Tailwind CSS 4 with the "Bilhete Premiado" design system (`docs/design/`). The default Tailwind palette is disabled — only theme tokens exist (`bg-primary`, `text-foreground`, `border-input`…). Build screens from `Components/ui/`; no Bootstrap, MUI or ad-hoc colors. Modals/menus/tabs use Radix, toasts use sonner, icons use FontAwesome, fonts are self-hosted (`@fontsource-variable`).

**Case sensitivity:** Directory casing matters for Docker/Linux builds. Actual casing on disk: `Contexts/` (uppercase C), `Services/` (uppercase S), `hooks/` (lowercase), `types/` (lowercase). All imports must match.

## Environment Variables

### Backend (appsettings / docker-compose)
- `ConnectionStrings__ViraltContext` — PostgreSQL connection string
- `ASPNETCORE_ENVIRONMENT` — Development | Docker | Production
- `NAuth__ApiURL`, `NAuth__BucketName`, `NAuth__JwtSecret` — NAuth authentication
- `MailerSend__ApiToken` (secret), `MailerSend__FromEmail`, `MailerSend__FromName`, `MailerSend__ApiUrl` — direct MailerSend e-mail (winner notifications)
- `S3__BucketName` (`emagine`), `S3__Prefix` (`viralt/`), `S3__Region`, `S3__ServiceUrl`, `S3__PublicBaseUrl`, `S3__AccessKey` / `S3__SecretKey` (secrets) — direct S3 storage

No intermediary service is used (constitution v3.0.0, Principle X): e-mail and storage go through `IMailerSendAppService` / `IImageAppService` in `Viralt.Infra/AppServices`. Missing MailerSend/S3 config fails on first use, not at startup.

### Frontend (.env, build-time)
- `VITE_API_URL` — Backend API base URL (e.g., `http://localhost:5000`); empty = same origin
- `VITE_SITE_BASENAME` — Vite `base` and router basename (default `/`)
- `VITE_PROJECT_NAME`, `VITE_WEBSITE_NAME` — display name / `<title>`

## Custom Skills

This repo has 38 Claude skills in `.claude/skills/` (plus agents in `.claude/agents/`). The two most critical:
- **dotnet-architecture** — Full clean architecture guide for backend entities (11-step process)
- **react-arch** — Frontend entity scaffolding guide (Types → Service → Context → Hook → Provider)

Invoke with `/dotnet-architecture` or `/react-arch` when adding new entities.
