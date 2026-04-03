# Tasks: Viral Giveaway & Contest Platform (SweepWidget Clone)

**Input**: Design documents from `/specs/001-sweepwidget-clone/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: Nao solicitados na especificacao. Tarefas de teste nao incluidas.

**Organization**: Tasks agrupadas por user story para implementacao e teste independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependencias)
- **[Story]**: User story associada (US1, US2, US3, etc.)
- File paths incluidos em todas as descricoes

---

## Phase 1: Setup

**Purpose**: Inicializacao do projeto e infraestrutura base

- [x] T001 Criar projeto Viralt.GraphQL via `dotnet new classlib` e adicionar ao Viralt.sln — usar skill `/dotnet-graphql`
- [x] T002 [P] Adicionar pacotes HotChocolate 14.3.0 ao Viralt.GraphQL (HotChocolate.AspNetCore, HotChocolate.Data.EntityFramework, HotChocolate.Authorization)
- [x] T003 [P] Adicionar referencia Viralt.GraphQL no Viralt.API/Viralt.API.csproj e Viralt.Application/Viralt.Application.csproj
- [x] T004 [P] Configurar ambientes via skill `/dotnet-env`: criar appsettings.Development.json, appsettings.Docker.json, appsettings.Production.json em Viralt.API/
- [x] T005 [P] Criar .env.example e .env.prod.example na raiz do repositorio com placeholders (conforme contracts/environments.md)
- [x] T006 [P] Criar Dockerfile multi-stage para Viralt.API na raiz do repositorio
- [x] T007 [P] Criar docker-compose.yml (local: api + frontend + postgres, portas expostas) na raiz
- [x] T008 [P] Criar docker-compose-prod.yml (prod: api + frontend + postgres + nginx, porta 80, sem SSL) na raiz
- [x] T009 [P] Criar .github/workflows/deploy-prod.yml (pipeline SSH deploy) 
- [x] T010 [P] Atualizar .gitignore com .env, .env.prod
- [x] T011 Implementar GraphQLErrorLogger.cs em Viralt.GraphQL/GraphQLErrorLogger.cs — usar skill `/dotnet-graphql`
- [x] T012 Implementar GraphQLServiceExtensions.cs em Viralt.GraphQL/GraphQLServiceExtensions.cs com dual-schema (admin + public) — usar skill `/dotnet-graphql`
- [x] T013 Registrar GraphQL no Viralt.Application/Startup.cs e mapear endpoints /graphql/admin e /graphql/public no Viralt.API/Startup.cs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entidades, DTOs, repositories e services que TODAS as user stories precisam

**CRITICAL**: Nenhuma user story pode comecar ate esta fase estar completa

- [x] T014 Expandir modelo Campaign com novos campos (slug, timezone, theme_*, entry_type, contadores, etc.) em Viralt.Domain/Models/Campaign.cs — usar skill `/dotnet-architecture`
- [x] T015 [P] Expandir modelo CampaignEntry com novos campos (sort_order, icon, instructions, require_verification, target_url, external_provider, external_entry_id) em Viralt.Domain/Models/CampaignEntry.cs
- [x] T016 [P] Expandir modelo Client com novos campos (referral_token, referred_by_client_id, ip_address, country_code, total_entries, email_verified, is_winner, is_disqualified) em Viralt.Domain/Models/Client.cs
- [x] T017 [P] Expandir modelo ClientEntry com novos campos (completed_at, verified, verification_data, entries_earned) em Viralt.Domain/Models/ClientEntry.cs
- [x] T018 [P] Criar modelo Prize em Viralt.Domain/Models/Prize.cs — usar skill `/dotnet-architecture`
- [x] T019 [P] Criar modelo Winner em Viralt.Domain/Models/Winner.cs — usar skill `/dotnet-architecture`
- [x] T020 [P] Criar modelo CampaignView em Viralt.Domain/Models/CampaignView.cs — usar skill `/dotnet-architecture`
- [x] T021 [P] Criar modelo Brand em Viralt.Domain/Models/Brand.cs — usar skill `/dotnet-architecture`
- [x] T022 Expandir ViraltContext com novos DbSets e Fluent API para todas as entidades novas em Viralt.Infra/Context/ViraltContext.cs
- [x] T023 Criar migration EF Core para todos os novos campos e entidades via `dotnet ef migrations add SweepWidgetCore --project Viralt.Infra --startup-project Viralt.API`
- [ ] T024 Aplicar migration via `dotnet ef database update --project Viralt.Infra --startup-project Viralt.API` — PENDENTE: requer database acessivel
- [x] T025 [P] Expandir CampaignInfo DTO com novos campos em Viralt.DTO/CampaignInfo.cs
- [x] T026 [P] Expandir ClientInfo DTO com novos campos em Viralt.DTO/ClientInfo.cs
- [x] T027 [P] Expandir ClientEntryInfo DTO com novos campos em Viralt.DTO/ClientEntryInfo.cs
- [x] T028 [P] Criar PrizeInfo, PrizeInsertInfo, PrizeUpdateInfo, PrizeListResult, PrizeGetResult em Viralt.DTO/PrizeInfo.cs
- [x] T029 [P] Criar WinnerInfo, WinnerListResult em Viralt.DTO/WinnerInfo.cs
- [x] T030 [P] Criar BrandInfo, BrandInsertInfo, BrandUpdateInfo, BrandListResult em Viralt.DTO/BrandInfo.cs
- [x] T031 [P] Criar interfaces IPrizeRepository, IWinnerRepository, ICampaignViewRepository, IBrandRepository em Viralt.Infra.Interfaces/
- [x] T032 [P] Implementar PrizeRepository, WinnerRepository, CampaignViewRepository, BrandRepository em Viralt.Infra/Repository/
- [x] T033 Registrar novos repositories e services no DI em Viralt.Application/Startup.cs
- [ ] T034 [P] Criar FluentValidation validators para CampaignInsertInfo, PrizeInsertInfo, ClientInsertInfo em Viralt.DTO/ — adiado para Phase Polish
- [x] T035 [P] Criar PrizeService em Viralt.Domain/Services/PrizeService.cs com CRUD + MapToDto/MapToModel — usar skill `/dotnet-architecture`

**Checkpoint**: Foundation ready — user stories podem comecar

---

## Phase 3: User Story 1 — Admin cria e publica campanha (Priority: P1) MVP

**Goal**: Admin cria campanha completa com campos, metodos de entrada, premios e publica

**Independent Test**: Criar campanha com 3 metodos de entrada e 1 premio, publicar, acessar landing page

### Backend

- [x] T036 [US1] Expandir CampaignService com Insert/Update incluindo slug generation e novos campos em Viralt.Domain/Services/CampaignService.cs
- [x] T037 [US1] Criar CampaignController (mutations: insert, update, delete, duplicate) em Viralt.API/Controllers/CampaignController.cs
- [x] T038 [P] [US1] Criar CampaignFieldController (mutations: insert, update, delete) em Viralt.API/Controllers/CampaignFieldController.cs
- [x] T039 [P] [US1] Criar CampaignEntryController (mutations: insert, update, reorder, delete) em Viralt.API/Controllers/CampaignEntryController.cs
- [x] T040 [P] [US1] Criar PrizeController (mutations: insert, update, delete) em Viralt.API/Controllers/PrizeController.cs
- [x] T041 [US1] Criar AdminQuery com queries campaigns, campaignById, campaignBySlug, prizesByCampaign em Viralt.GraphQL/Admin/AdminQuery.cs
- [x] T042 [P] [US1] Criar CampaignAdminType (expoe todos os campos) em Viralt.GraphQL/Admin/Types/CampaignAdminType.cs
- [x] T043 [P] [US1] Criar CampaignEntryType, CampaignFieldType, PrizeType em Viralt.GraphQL/Types/

### Frontend

- [x] T044 [US1] Expandir types campaign.ts com novos campos (slug, theme_*, entry_type, contadores) em viralt-app/src/types/campaign.ts — usar skill `/react-architecture`
- [x] T045 [P] [US1] Criar types prize.ts (PrizeInfo, PrizeInsertInfo, PrizeListResult) em viralt-app/src/types/prize.ts
- [x] T046 [US1] Criar graphqlClient.ts (fetch wrapper para GraphQL com tipagem) em viralt-app/src/Services/graphqlClient.ts
- [x] T047 [US1] Expandir campaignService.ts: queries via GraphQL, mutations via REST em viralt-app/src/Services/campaignService.ts
- [x] T048 [P] [US1] Criar prizeService.ts (mutations REST) em viralt-app/src/Services/prizeService.ts — usar skill `/react-architecture`
- [x] T049 [P] [US1] Criar PrizeContext.tsx em viralt-app/src/Contexts/PrizeContext.tsx — usar skill `/react-architecture`
- [x] T050 [P] [US1] Criar usePrize.ts hook em viralt-app/src/hooks/usePrize.ts
- [x] T051 [US1] Criar CampaignBuilderPage (form multi-step: info basica, aparencia, campos, entradas, premios, config, preview) em viralt-app/src/Pages/CampaignBuilderPage/
- [x] T052 [US1] Expandir CampaignSearchPage com listagem via GraphQL e link para builder em viralt-app/src/Pages/CampaignSearchPage/

**Checkpoint**: US1 funcional — admin cria e publica campanhas

---

## Phase 4: User Story 2 — Participante se inscreve e completa acoes (Priority: P1)

**Goal**: Visitante se inscreve, completa acoes, acumula entradas

**Independent Test**: Inscrever com email, completar 3 acoes, verificar total de entradas

### Backend

- [x] T053 [US2] Expandir ClientService com Insert (deduplicacao email, gerar token, gerar referral_token) em Viralt.Domain/Services/ClientService.cs
- [x] T054 [US2] Criar PublicController com register, complete-entry, track-view em Viralt.API/Controllers/PublicController.cs
- [x] T055 [US2] Criar PublicQuery com campaign(slug), leaderboard, myEntries em Viralt.GraphQL/Public/PublicQuery.cs
- [x] T056 [P] [US2] Criar CampaignPublicType (esconde campos sensiveis) em Viralt.GraphQL/Public/Types/CampaignPublicType.cs
- [x] T057 [P] [US2] Criar ClientPublicType (esconde email, IP, phone) em Viralt.GraphQL/Public/Types/ClientPublicType.cs
- [x] T058 [P] [US2] Criar PrizePublicType (esconde coupon_code) em Viralt.GraphQL/Public/Types/PrizePublicType.cs
- [x] T059 [P] [US2] Criar ExternalController com verify-entry e bulk-verify (callback BazzucaMedia) em Viralt.API/Controllers/ExternalController.cs

### Frontend

- [x] T060 [US2] Expandir types client.ts com novos campos em viralt-app/src/types/client.ts
- [x] T061 [US2] Criar publicService.ts (queries GraphQL public + mutations REST register/complete-entry) em viralt-app/src/Services/publicService.ts
- [x] T062 [US2] Criar PublicCampaignContext.tsx em viralt-app/src/Contexts/PublicCampaignContext.tsx
- [x] T063 [P] [US2] Criar usePublicCampaign.ts hook em viralt-app/src/hooks/usePublicCampaign.ts
- [x] T064 [US2] Criar PublicCampaignPage (landing page: header, premios, formulario, metodos de entrada, countdown, leaderboard) em viralt-app/src/Pages/PublicCampaignPage/
- [x] T065 [P] [US2] Criar componentes EntryMethodCard, PrizeCard, CountdownTimer, LeaderboardTable em viralt-app/src/Components/
- [x] T066 [US2] Registrar rota /c/:slug no React Router para PublicCampaignPage

**Checkpoint**: US2 funcional — participantes se inscrevem e completam acoes

---

## Phase 5: User Story 3 — Admin sorteia vencedores (Priority: P1)

**Goal**: Admin encerra campanha, sorteia vencedores, notifica por e-mail

**Independent Test**: Encerrar campanha com 10 participantes, sortear 2 vencedores, verificar e-mail

### Backend

- [x] T067 [US3] Criar WinnerService com logica de sorteio (weighted random, leaderboard, manual) e notificacao por e-mail (zTools IMailClient) em Viralt.Domain/Services/WinnerService.cs
- [x] T068 [US3] Criar WinnerController (mutations: draw em CampaignController, notify, notifyall) em Viralt.API/Controllers/WinnerController.cs e adicionar draw ao CampaignController
- [x] T069 [US3] Adicionar queries winnersByCampaign ao AdminQuery em Viralt.GraphQL/Admin/AdminQuery.cs
- [x] T070 [P] [US3] Criar WinnerType em Viralt.GraphQL/Types/WinnerType.cs
- [x] T071 [P] [US3] Adicionar query winners(slug) ao PublicQuery em Viralt.GraphQL/Public/PublicQuery.cs

### Frontend

- [x] T072 [US3] Criar types winner.ts em viralt-app/src/types/winner.ts
- [x] T073 [US3] Criar winnerService.ts (queries GraphQL + mutations REST notify) em viralt-app/src/Services/winnerService.ts
- [x] T074 [US3] Criar WinnerContext.tsx em viralt-app/src/Contexts/WinnerContext.tsx
- [x] T075 [US3] Criar WinnerSelectionPage (selecao de metodo, execucao, confirmacao, notificacao) em viralt-app/src/Pages/WinnerSelectionPage/

**Checkpoint**: US3 funcional — sorteio e notificacao de vencedores

---

## Phase 6: User Story 4 — Referral e indicacao (Priority: P2)

**Goal**: Participante indica amigos via link unico e ganha entradas bonus

**Independent Test**: Participante A indica B, B se inscreve, A recebe bonus

### Backend

- [x] T076 [US4] Criar modelo Referral em Viralt.Domain/Models/Referral.cs
- [x] T077 [P] [US4] Criar ReferralInfo DTO em Viralt.DTO/ReferralInfo.cs
- [x] T078 [P] [US4] Criar IReferralRepository e ReferralRepository em Viralt.Infra.Interfaces/ e Viralt.Infra/Repository/
- [x] T079 [US4] Criar ReferralService (logica de indicacao e bonus) em Viralt.Domain/Services/ReferralService.cs
- [x] T080 [US4] Integrar referral no PublicController register (detectar referralToken, criar Referral, creditar bonus) em Viralt.API/Controllers/PublicController.cs
- [x] T081 [US4] Adicionar referral data ao PublicQuery myEntries em Viralt.GraphQL/Public/PublicQuery.cs
- [x] T082 Expandir ViraltContext com DbSet Referral e migration em Viralt.Infra/Context/ViraltContext.cs
- [x] T083 Registrar ReferralRepository e ReferralService no DI em Viralt.Application/Startup.cs

### Frontend

- [x] T084 [US4] Criar types referral.ts em viralt-app/src/types/referral.ts
- [x] T085 [US4] Adicionar secao "Indique um Amigo" com link, share (email, WhatsApp, copy) no PublicCampaignPage em viralt-app/src/Pages/PublicCampaignPage/
- [x] T086 [US4] Tratar query param ?ref={token} no PublicCampaignPage para passar no register

**Checkpoint**: US4 funcional — referral gera bonus

---

## Phase 7: User Story 5 — Widget embarcavel e landing page (Priority: P2)

**Goal**: Campanha acessivel via widget iframe e landing page customizada com tema

**Independent Test**: Embed widget em HTML, verificar renderizacao responsiva

### Frontend

- [x] T087 [US5] Criar componente CampaignWidget (iframe container com postMessage para auto-resize) em viralt-app/src/Components/CampaignWidget/
- [x] T088 [US5] Criar rota /widget/:slug que renderiza PublicCampaignPage sem header/footer em viralt-app/src/Pages/
- [x] T089 [US5] Criar script widget.js (cria iframe apontando para /widget/{slug}) servido como asset estatico
- [x] T090 [US5] Aplicar tema dinamico na PublicCampaignPage (cores, fonte, logo, CSS customizado) baseado nos dados da campanha
- [x] T091 [US5] Adicionar Open Graph meta tags na landing page para SEO/share
- [x] T092 [US5] Adicionar secao "Embed Code" no CampaignDetailPage (admin) com codigo copiavel

**Checkpoint**: US5 funcional — widget embarcavel e landing page tematizada

---

## Phase 8: User Story 6 — Gerenciamento de participantes e exportacao (Priority: P3)

**Goal**: Admin visualiza, desqualifica e exporta participantes

**Independent Test**: Listar 20 participantes, desqualificar 1, exportar CSV

### Backend

- [x] T093 [US6] Adicionar queries clientsByCampaign (com paginacao, filtros, sorting) ao AdminQuery em Viralt.GraphQL/Admin/AdminQuery.cs
- [x] T094 [P] [US6] Criar ClientAdminType (expoe email, IP, status) em Viralt.GraphQL/Admin/Types/ClientAdminType.cs
- [x] T095 [US6] Criar ClientController (mutations: disqualify, delete, export CSV/JSON) em Viralt.API/Controllers/ClientController.cs

### Frontend

- [x] T096 [US6] Criar ParticipantListPage (tabela com paginacao, filtros, busca, acoes: desqualificar, deletar) em viralt-app/src/Pages/ParticipantListPage/
- [x] T097 [US6] Adicionar botao "Exportar CSV" e "Exportar JSON" na ParticipantListPage
- [x] T098 [US6] Criar CampaignDetailPage (dashboard admin: info, analytics basico, links para participantes, vencedores, builder) em viralt-app/src/Pages/CampaignDetailPage/

**Checkpoint**: US6 funcional — gerenciamento e exportacao

---

## Phase 9: User Story 7 — Concurso de foto/video (Priority: P3)

**Goal**: Participante submete foto/video, admin aprova, visitantes votam

**Independent Test**: Submeter 3 fotos, aprovar 2, votar em 1, verificar contagem

### Backend

- [x] T099 [US7] Criar modelos Submission e Vote em Viralt.Domain/Models/Submission.cs e Viralt.Domain/Models/Vote.cs
- [x] T100 [P] [US7] Criar SubmissionInfo DTO em Viralt.DTO/SubmissionInfo.cs
- [x] T101 [P] [US7] Criar ISubmissionRepository, IVoteRepository e implementacoes em Viralt.Infra.Interfaces/ e Viralt.Infra/Repository/
- [x] T102 [US7] Criar SubmissionService (submit, approve, reject, vote com dedup por IP) em Viralt.Domain/Services/SubmissionService.cs
- [x] T103 [US7] Adicionar endpoints submit e vote ao PublicController em Viralt.API/Controllers/PublicController.cs
- [x] T104 [US7] Adicionar query gallery(slug) ao PublicQuery em Viralt.GraphQL/Public/PublicQuery.cs
- [x] T105 [P] [US7] Criar SubmissionType em Viralt.GraphQL/Types/SubmissionType.cs
- [x] T106 [US7] Expandir ViraltContext com DbSets Submission e Vote, criar migration
- [x] T107 Registrar novos repositories e services no DI em Viralt.Application/Startup.cs

### Frontend

- [x] T108 [US7] Criar types submission.ts em viralt-app/src/types/submission.ts
- [x] T109 [US7] Adicionar secao de upload e galeria no PublicCampaignPage para campanhas tipo Contest
- [x] T110 [US7] Criar componente GalleryGrid com votacao (1 voto por sessao) em viralt-app/src/Components/GalleryGrid/
- [x] T111 [US7] Criar pagina admin de moderacao de submissoes (aprovar/rejeitar) em viralt-app/src/Pages/SubmissionModerationPage/

**Checkpoint**: US7 funcional — contest de foto/video com votacao

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Melhorias que afetam multiplas user stories

- [x] T112 Adicionar queries dashboardAnalytics e campaignAnalytics ao AdminQuery em Viralt.GraphQL/Admin/AdminQuery.cs
- [x] T113 [P] Criar AnalyticsType em Viralt.GraphQL/Admin/Types/AnalyticsType.cs
- [x] T114 [P] Criar types analytics.ts e analyticsService.ts em viralt-app/src/types/analytics.ts e viralt-app/src/Services/analyticsService.ts
- [x] T115 Expandir DashboardPage com metricas gerais (campanhas ativas, total participantes, total entradas) via GraphQL em viralt-app/src/Pages/DashboardPage/
- [ ] T116 [P] Adicionar suporte a i18n nas novas paginas (campaign builder, public page, winner selection) — expandir translation.json em pt, en, es — ADIADO
- [x] T117 [P] Implementar componente de injecao de pixels (GA, FB, TikTok, GTM) na PublicCampaignPage em viralt-app/src/Components/TrackingPixels/
- [x] T118 [P] Criar modelo Webhook e WebhookService com dispatch via BackgroundService em Viralt.Domain/Models/Webhook.cs e Viralt.Domain/Services/WebhookService.cs
- [x] T119 [P] Criar modelo UnlockReward e ClientReward em Viralt.Domain/Models/UnlockReward.cs e Viralt.Domain/Models/ClientReward.cs
- [x] T120 [P] Criar modelos Brand e BrandService completo em Viralt.Domain/Services/BrandService.cs
- [x] T121 Expandir ViraltContext com DbSets Webhook, UnlockReward, ClientReward, criar migration
- [x] T122 Registrar novos repositories e services no DI em Viralt.Application/Startup.cs
- [x] T123 Registrar novos Providers (PrizeProvider, WinnerProvider, PublicCampaignProvider) no ContextBuilder em viralt-app/src/App.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependencias — comecar imediatamente
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEIA todas as user stories
- **US1 (Phase 3)**: Depende de Foundational — MVP core
- **US2 (Phase 4)**: Depende de US1 (precisa de campanhas para inscrever participantes)
- **US3 (Phase 5)**: Depende de US2 (precisa de participantes para sortear)
- **US4 (Phase 6)**: Depende de US2 (precisa de registro de participantes)
- **US5 (Phase 7)**: Depende de US2 (precisa de landing page funcional)
- **US6 (Phase 8)**: Depende de US2 (precisa de participantes para gerenciar)
- **US7 (Phase 9)**: Depende de US2 (precisa de participantes para submeter)
- **Polish (Phase 10)**: Depende de todas as user stories desejadas estarem completas

### User Story Dependencies

```
US1 (P1) ─── obrigatorio ──→ US2 (P1) ─── obrigatorio ──→ US3 (P1)
                                │
                                ├──→ US4 (P2) [paralelo com US3]
                                ├──→ US5 (P2) [paralelo com US3]
                                ├──→ US6 (P3) [paralelo com US3]
                                └──→ US7 (P3) [paralelo com US3]
```

### Parallel Opportunities

Apos US2 completa, as seguintes podem rodar em paralelo:
- US3 + US4 + US5 + US6 + US7 (se equipe disponivel)

Dentro de cada fase, tarefas marcadas [P] podem rodar em paralelo.

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Setup (Phase 1)
2. Foundational (Phase 2)
3. US1: Admin cria campanha
4. US2: Participante se inscreve
5. US3: Sorteio de vencedores
6. **STOP AND VALIDATE**: Campanha completa end-to-end

### Incremental Delivery

1. MVP (US1+US2+US3) → Deploy/Demo
2. + US4 (Referral) + US5 (Widget) → Deploy/Demo
3. + US6 (Gerenciamento) + US7 (Contest) → Deploy/Demo
4. + Polish (Analytics, i18n, Pixels, Webhooks, Brands) → Deploy/Demo
