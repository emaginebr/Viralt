# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Constraints

- **Docker is NOT accessible** from the local machine shell. Never attempt to run `docker`, `docker.exe`, or `docker compose` commands.
- When database operations are needed, use `dotnet ef` commands directly against a running PostgreSQL instance configured in appsettings.

## Build & Run Commands

### Backend (.NET 8)

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
dotnet ef migrations script --project Viralt.Infra --startup-project Viralt.API --idempotent
```

### Frontend (CRA + TypeScript)

```bash
cd viralt-app
npm install --legacy-peer-deps   # required due to react-native-svg peer conflict
npm start                         # dev server
npm run build                     # production build
npm test                          # jest tests
```

**Note:** Uses `REACT_APP_*` env vars (CRA pattern, not Vite). Entry point is `src/index.tsx`.

## Architecture

### Backend — Clean Architecture (.NET 8 / EF Core 9 / PostgreSQL)

```
Viralt.API              → Controllers, Startup (CORS, Swagger, Auth middleware)
Viralt.Application      → Centralized DI via Startup.cs extension method
Viralt.Domain           → Rich models (Models/), services (Services/), interfaces (Interfaces/)
Viralt.DTO              → Data Transfer Objects, zero dependencies
Viralt.Infra            → DbContext, Repository implementations, AppServices (S3, MailerSend)
Viralt.Infra.Interfaces → Generic repository interfaces (<TModel>), AppService contracts
Viralt.BackgroundService → Worker service
```

**Dependency flow:** API → Application → Domain + Infra. Domain depends only on Infra.Interfaces + DTO. Infra.Interfaces has no domain dependencies (uses generics).

**Key patterns:**
- Repository interfaces use single generic `<TModel> where TModel : class` — never reference domain models directly
- Domain services receive/return DTOs at public API, work with Domain Models internally
- Services contain manual `MapToDto()` / `MapToModel()` methods
- Connection string key: `ConnectionStrings:ViraltContext`
- Auth: Basic token scheme (`Authorization: Basic {token}`)
- Design-time factory: `Viralt.Infra/Context/ViraltContextFactory.cs`

**Database conventions (PostgreSQL):**
- Table names: `snake_case` plural (`users`, `campaigns`, `client_entries`)
- Column names: `snake_case` (`user_id`, `created_at`)
- PKs: `bigint` with identity, named `{entity}_id`
- Timestamps: `timestamp without time zone`
- FKs: `DeleteBehavior.ClientSetNull`, named `fk_{parent}_{child}`

### Frontend — React 18 + TypeScript + Context API

```
src/
├── Contexts/        → Auth, User, Network, Profile, Product, Order, Invoice, Image, Template
│   └── Utils/ContextBuilder.tsx  → HOC that composes providers from array
├── Services/        → API services (Axios-based legacy + fetch-based new)
│   └── apiHelpers.ts             → getHeaders(auth), saveSession, loadSession, clearSession
├── Pages/           → Route page components
├── Components/      → Shared UI components
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

**Case sensitivity:** Directory casing matters for Docker/Linux builds. Actual casing on disk: `Contexts/` (uppercase C), `Services/` (uppercase S), `hooks/` (lowercase), `types/` (lowercase). All imports must match.

## Environment Variables

### Backend (appsettings / docker-compose)
- `ConnectionStrings__ViraltContext` — PostgreSQL connection string
- `ASPNETCORE_ENVIRONMENT` — Development | Docker | Production

### Frontend (.env)
- `REACT_APP_API_URL` — Backend API base URL (e.g., `http://localhost:5000`)
- `REACT_APP_SITE_BASENAME` — Router base path

## Custom Skills

This repo has 12 Claude skills in `.claude/skills/`. The two most critical:
- **dotnet-architecture** — Full clean architecture guide for backend entities (11-step process)
- **react-arch** — Frontend entity scaffolding guide (Types → Service → Context → Hook → Provider)

Invoke with `/dotnet-architecture` or `/react-arch` when adding new entities.
