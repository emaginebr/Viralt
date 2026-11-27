# Tasks: Migrar o frontend para Vite + Tailwind

**Input**: Design documents from `/specs/003-frontend-vite-tailwind/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: a spec pede testes nos itens FR-012, SC-001 e SC-006. Por isso entram testes Vitest
dos componentes base, um teste de rotas e a auditoria com axe.

**Agentes** (constitution IV):

| Sigla | Agente | Responsável por |
|---|---|---|
| UX | `ux-designer` | `docs/design/` |
| FE | `react-developer` | `frontend/`, incluindo os testes do frontend |
| OPS | `devops-engineer` | Dockerfile, compose e `.env*.example` |
| AN | `analyst` | README |
| MAIN | sessão principal | `specs/`, `.specify/` e `CLAUDE.md` |

Todos os caminhos de código são relativos à raiz do repositório.

**Ordem das fases**: a US3 (aprovação do design) é um **gate bloqueante** da entrega única. Por
isso vem logo após o Setup e antes da fundação técnica. As US1 e US2, que são P1 funcionais,
dependem dela.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (baseline do estado atual)

**Purpose**: registrar o estado do CRA antes de qualquer mudança (SC-005) e confirmar o inventário
de telas.

- [X] T001 [FE] Gerar o build CRA atual (`cd frontend && npm run build`). Medir o tamanho gzip do
  JS e do CSS em `frontend/build/static/` e do CSS vendorizado que o `public/index.html` carrega
  (`public/assets/vendor/bootstrap`, `bootstrap-icons`, `glightbox`, `swiper` e
  `public/assets/css/main.css`). Registrar o total transferido por `/c/:slug` em
  `specs/003-frontend-vite-tailwind/baseline.md`.
- [X] T002 [P] [FE] Confirmar se `CheckoutPage` e `RequestAccessPage` são usadas (procurar imports
  e links em `frontend/src`) e se `REACT_APP_WEBSITE_NAME` tem uso. Registrar o resultado em
  `specs/003-frontend-vite-tailwind/baseline.md`, na seção "Inventário".
- [X] T003 [P] [FE] Listar, para cada uma das 27 telas e para os componentes em
  `frontend/src/Components/`, os componentes react-bootstrap, as classes Bootstrap e os ícones
  `bi bi-*` usados. Registrar em `specs/003-frontend-vite-tailwind/baseline.md`, na seção "Uso de
  Bootstrap", para orientar o `ux-designer` e a migração.

---

## Phase 2: User Story 3 - Organizador aprova o novo design system (Priority: P1) 🚧 GATE

**Goal**: entregar tokens, especificação dos componentes base e mockups, e obter a aprovação do
usuário antes de reescrever qualquer tela (FR-004 e FR-004a).

**Independent Test**: revisar `docs/design/`. Todos os pares texto/fundo da tabela de contraste
devem estar ≥ 4,5:1 (texto grande e ícones ≥ 3:1), e os mockups devem estar aprovados.

- [X] T004 [US3] [UX] Definir a direção visual do Viralt (plataforma de campanhas virais com
  página pública e widget) e os tokens semânticos do `data-model.md` §1: cores com `-foreground`,
  tipografia, raios, sombras, anel de foco e durações. Gravar em `docs/design/tokens.md`, com a
  tabela de contraste de cada par texto/fundo.
- [X] T005 [US3] [UX] Escrever o `@theme` do Tailwind 4 com os tokens de T004 em
  `docs/design/theme.css`, usando os mesmos nomes de token que vão para
  `frontend/src/styles/theme.css`.
- [X] T006 [P] [US3] [UX] Especificar os componentes base do `data-model.md` §2 (Button, Input,
  Textarea, Select, Checkbox, Radio, Card, Table, Modal, Alert, Toast, Tabs, Navbar/Sidebar,
  Pagination, Badge, Spinner e Skeleton), com variantes, estados (hover, focus-visible, disabled,
  loading, error) e regras de acessibilidade, em `docs/design/components.md`.
- [X] T007 [P] [US3] [UX] Criar os mockups HTML/CSS mobile (375 px) e desktop da página pública da
  campanha e do widget em `docs/design/mockups/public-campaign.html` e
  `docs/design/mockups/widget.html`.
- [X] T008 [P] [US3] [UX] Criar os mockups HTML/CSS do layout administrativo (navbar e sidebar),
  de uma lista (campanhas) e de um formulário (construtor de campanha), em
  `docs/design/mockups/admin-list.html` e `docs/design/mockups/admin-form.html`.
- [X] T009 [US3] [MAIN] Apresentar o pacote `docs/design/` ao usuário e registrar a aprovação, ou
  os ajustes pedidos, em `specs/003-frontend-vite-tailwind/baseline.md`, na seção "Aprovação do
  design". Se houver ajustes, voltar a T004–T008. **Nenhuma tarefa da Phase 3 em diante começa
  antes da aprovação.**

**Checkpoint**: design aprovado.

---

## Phase 3: Foundational (base Vite, Tailwind e componentes `ui/`)

**Purpose**: trocar a base técnica e criar os componentes do design system. Bloqueia US1, US2 e
US4.

⚠️ Durante esta fase as telas ficam visualmente quebradas na branch. É um estado intermediário
local, não entregue (FR-015).

- [X] T010 [FE] Limpar as dependências em `frontend/package.json`:
  - remover `react-scripts`, `@mui/material`, `@mui/icons-material`, `@mui/styles`,
    `react-native-svg`, `web3`, `@stacks/connect`, `@stripe/react-stripe-js`, `@stripe/stripe-js`,
    `@craftjs/core`, `react-dnd`, `react-dnd-html5-backend`, `react-ga`, `react-qr-code`,
    `react-currency-input-field` e `web-vitals`, confirmando com Grep que não há nenhum import em
    `frontend/src` (research R8);
  - adicionar `vite@6`, `@vitejs/plugin-react`, `tailwindcss@4`, `@tailwindcss/vite`,
    `@radix-ui/react-dialog`, `sonner`, `clsx`, `vitest`, `jsdom` e `@testing-library/user-event@14`
    (dev);
  - mover os `@testing-library/*` para `devDependencies`;
  - remover o bloco `browserslist` e o `eslintConfig`, se houver;
  - **manter** `bootstrap` e `react-bootstrap` por enquanto, porque saem em T040;
  - trocar os scripts conforme `contracts/frontend-build.md`: `dev`, `start`,
    `build = tsc --noEmit && vite build`, `preview` e `test = vitest run`;
  - rodar `npm install` **sem** `--legacy-peer-deps` e atualizar o `frontend/package-lock.json`.
- [X] T011 [FE] Criar `frontend/vite.config.ts` com:
  - os plugins `react()` e `tailwindcss()`;
  - `base` a partir de `VITE_SITE_BASENAME` (via `loadEnv`, padrão `/`);
  - `build.outDir = 'build'`;
  - `server.port = 3000` e `preview.port = 3000`;
  - proxy de `/api` para `VITE_API_URL` quando houver valor;
  - um bloco `test` (`environment: 'jsdom'`, `setupFiles: './src/test/setup.ts'`, `globals: true`).
- [X] T012 [FE] Atualizar `frontend/tsconfig.json` para o padrão Vite (research R2):
  - `target ES2020`, `lib [ES2020, DOM, DOM.Iterable]`, `module ESNext`,
    `moduleResolution bundler` e `jsx react-jsx`;
  - `types ["vite/client", "vitest/globals"]`;
  - manter `strict: true`, `strictNullChecks: false` e `forceConsistentCasingInFileNames`;
  - `include ["src", "vite.config.ts"]`.
- [X] T013 [FE] Mover `frontend/public/index.html` para `frontend/index.html`:
  - remover `%PUBLIC_URL%` (caminhos absolutos `/…`);
  - remover os `<link>` de `assets/vendor/*` e de `assets/css/main.css`, e qualquer `<script>` de
    `assets/js/main.js`;
  - adicionar `<script type="module" src="/src/index.tsx">`;
  - manter `lang`, favicon, manifest e preconnect de fontes conforme os tokens de T004;
  - trocar a meta description padrão do CRA.
- [X] T014 [FE] Criar `frontend/src/vite-env.d.ts` com `/// <reference types="vite/client" />` e
  uma `interface ImportMetaEnv` com `VITE_API_URL`, `VITE_SITE_BASENAME` e `VITE_PROJECT_NAME`.
  Incluir `VITE_WEBSITE_NAME` só se T002 apontar uso.
- [X] T015 [FE] Substituir todas as ocorrências de `process.env.REACT_APP_*` em `frontend/src`:
  - `REACT_APP_PRODUCTION == "0"` passa a `!import.meta.env.PROD`, em
    `frontend/src/Infra/Impl/HttpClient.tsx` e nos demais arquivos;
  - `REACT_APP_API_URL`, `REACT_APP_SITE_BASENAME` e `REACT_APP_PROJECT_NAME` passam a
    `import.meta.env.VITE_*`, incluindo `frontend/src/index.tsx` (`basename`);
  - remover `process.env.NODE_ENV`/`PUBLIC_URL`, se houver.
- [X] T016 [FE] Renomear as variáveis em `frontend/.env` e `frontend/.env.production`:
  `REACT_APP_*` passa a `VITE_*`, e `REACT_APP_PRODUCTION` é removida. Trocar só os nomes, sem
  imprimir nem alterar valores.
- [X] T017 [FE] Criar `frontend/src/styles/theme.css`, copiando o `@theme` aprovado de
  `docs/design/theme.css`, e `frontend/src/styles/index.css` com `@import "tailwindcss";`,
  `@import "./theme.css";` e a base:
  - `html`/`body` com `bg-background` e `text-foreground`;
  - `:focus-visible` com o anel de foco;
  - `@media (prefers-reduced-motion)`.

  Importar `index.css` em `frontend/src/index.tsx` e remover desse arquivo, e do
  `frontend/src/App.tsx`, os imports de CSS do Bootstrap.
- [X] T018 [FE] Validar a base: `npm run dev` sobe em http://localhost:3000, e `npm run build`
  executa o `tsc` e gera `frontend/build/`. Corrigir os erros de tipo e de import (por exemplo,
  `require`, importação de SVG como componente e `process`) até os dois comandos passarem.
- [X] T019 [P] [FE] Criar `frontend/src/Components/ui/Button.tsx` conforme
  `docs/design/components.md`: variantes, tamanhos, `loading` com `aria-busy`, altura ≥ 44 px e
  `focus-visible`.
- [X] T020 [P] [FE] Criar `frontend/src/Components/ui/Input.tsx`, `Textarea.tsx` e `Select.tsx`,
  com `label`, `hint` e `error` ligados por `aria-describedby`/`aria-invalid`.
- [X] T021 [P] [FE] Criar `frontend/src/Components/ui/Checkbox.tsx` e `Radio.tsx`, com área
  clicável de 44 px incluindo o rótulo.
- [X] T022 [P] [FE] Criar `frontend/src/Components/ui/Card.tsx`, `Badge.tsx`, `Spinner.tsx` e
  `Skeleton.tsx`:
  - `Spinner` com `role="status"` e texto oculto;
  - `Badge` sempre com texto.
- [X] T023 [P] [FE] Criar `frontend/src/Components/ui/Modal.tsx` sobre `@radix-ui/react-dialog`,
  com `open`, `onOpenChange`, `title`, `description` e `footer`. Focus trap, `Esc` e devolução do
  foco (FR-009).
- [X] T024 [P] [FE] Criar `frontend/src/Components/ui/Alert.tsx`:
  - `role="status"`/`aria-live="polite"`, ou `role="alert"` em danger;
  - ícone FontAwesome além da cor.

  Criar também `frontend/src/Components/ui/Toaster.tsx` (sonner) e montá-lo em
  `frontend/src/App.tsx`.
- [X] T025 [P] [FE] Criar `frontend/src/Components/ui/Table.tsx` (`th scope`, estados `empty` e
  `loading`), `Pagination.tsx` (`aria-label` e página atual anunciada) e `Tabs.tsx` (setas
  WAI-ARIA).
- [X] T026 [FE] Criar `frontend/src/Components/ui/index.ts`, exportando todos os componentes base.
- [X] T027 [P] [FE] Criar `frontend/src/test/setup.ts` (jest-dom) e
  `frontend/src/test/ui.test.tsx`, cobrindo:
  - o `Modal` prende o foco, fecha com `Esc` e devolve o foco;
  - o `Button` com `loading` tem `aria-busy`;
  - o `Input` com `error` tem `aria-invalid` e `aria-describedby`;
  - o `Alert` danger tem `role="alert"`.

  `npm test` deve passar.

**Checkpoint**: base Vite funcionando, componentes `ui/` testados e telas prontas para migrar.

---

## Phase 4: User Story 1 - Participante se inscreve com o novo visual (Priority: P1) 🎯 MVP

**Goal**: página pública, widget e as telas de conta usadas pelo público no novo design system,
com o comportamento atual.

**Independent Test**:
- concluir uma inscrição em `/c/:slug` e em `/widget/:slug`, este embutido num iframe, nas
  larguras 375 px e 1280 px;
- o `postMessage` de altura continua funcionando (`contracts/widget-embed.md`);
- o axe não aponta violações nas duas rotas.

- [X] T028 [P] [US1] [FE] Reescrever os componentes usados pela página pública com `ui/` e
  utilitários Tailwind, removendo os imports de react-bootstrap e as classes Bootstrap:
  - `frontend/src/Components/EntryMethodCard/index.tsx`;
  - `frontend/src/Components/PrizeCard/index.tsx`;
  - `frontend/src/Components/CountdownTimer/`;
  - `frontend/src/Components/LeaderboardTable/index.tsx`;
  - `frontend/src/Components/GalleryGrid/index.tsx`;
  - `frontend/src/Components/ContestUpload/index.tsx`;
  - `frontend/src/Components/CampaignWidget/`.
- [X] T029 [US1] [FE] Reescrever `frontend/src/Pages/PublicCampaignPage/index.tsx` conforme
  `docs/design/mockups/public-campaign.html`. Manter o fluxo de inscrição, as ações de entrada e
  as validações, com erros por campo usando `aria-describedby` e feedback com `aria-live`.
- [X] T030 [US1] [FE] Reescrever `frontend/src/Pages/WidgetPage/index.tsx` conforme
  `docs/design/mockups/widget.html`, mantendo intacto o `postMessage`
  `{type:'viralt-resize', slug, height}` e o fundo definido pelo design system.
- [X] T031 [P] [US1] [FE] Reescrever as telas de conta usadas pelo público:
  - `frontend/src/Pages/LoginPage/index.tsx`;
  - `frontend/src/Pages/UserPage/index.tsx`, cadastro e edição;
  - `frontend/src/Pages/RecoveryPage/index.tsx`;
  - `frontend/src/Pages/PasswordPage/index.tsx`.

  Manter a chave de sessão `login-with-metamask:auth` (FR-013).
- [X] T032 [P] [US1] [FE] Reescrever `frontend/src/Pages/Error404Page/index.tsx` e
  `frontend/src/Pages/RequestAccessPage/index.tsx`.
- [X] T033 [US1] [FE] Rodar `npx @axe-core/cli` contra `/c/<slug>` e `/widget/<slug>` no
  `npm run preview` e corrigir até zerar as violações (SC-006). Registrar o resultado em
  `specs/003-frontend-vite-tailwind/baseline.md`, na seção "Acessibilidade".

**Checkpoint**: o fluxo do participante funciona inteiro no novo visual.

---

## Phase 5: User Story 2 - Organizador usa o painel administrativo (Priority: P1)

**Goal**: layout administrativo e todas as telas de organizador no novo design system, com o
comportamento atual.

**Independent Test**: logado como organizador, executar a ação principal de cada tela do
inventário (`data-model.md` §3, itens 2–9 e 13–22). Com troca de idioma, o `lang` do `<html>`
acompanha a escolha.

- [X] T034 [US2] [FE] Reescrever o layout compartilhado conforme `docs/design/mockups/admin-list.html`:
  - `frontend/src/Components/Header.tsx`, com Navbar, `<nav aria-label>`, `aria-current` e menu
    móvel;
  - `frontend/src/Components/Footer.tsx`;
  - o `Layout` em `frontend/src/App.tsx`.

  Trocar os 2 ícones `bi bi-*` por FontAwesome. Fazer o `frontend/src/i18n.tsx` atualizar
  `document.documentElement.lang` no evento `languageChanged`.
- [X] T035 [P] [US2] [FE] Reescrever os componentes compartilhados restantes com `ui/`:
  - `frontend/src/Components/MessageToast.tsx`, para usar sonner via `ui/Toaster`;
  - `frontend/src/Components/ImageModal.tsx`, para usar `ui/Modal` e manter o
    `react-image-crop` com seu CSS;
  - `frontend/src/Components/SkeletonPage.tsx`;
  - `frontend/src/Components/Functions.tsx`;
  - `frontend/src/Components/EmbedCodeSection/`;
  - `frontend/src/Components/CustomToolbar.tsx`.
- [X] T036 [P] [US2] [FE] Reescrever as telas de campanha:
  - `frontend/src/Pages/CampaignSearchPage/index.tsx`;
  - `frontend/src/Pages/CampaignBuilderPage/index.tsx`, conforme
    `docs/design/mockups/admin-form.html`;
  - `frontend/src/Pages/CampaignDetailPage/index.tsx`.
- [X] T037 [P] [US2] [FE] Reescrever as telas de operação da campanha:
  - `frontend/src/Pages/ParticipantListPage/index.tsx`;
  - `frontend/src/Pages/SubmissionModerationPage/index.tsx`;
  - `frontend/src/Pages/WinnerSelectionPage/index.tsx`, mantendo o resumo do "notificar todos"
    com `ui/Alert` e `aria-live`, e a lista de falhas.
- [X] T038 [P] [US2] [FE] Reescrever as telas do painel:
  - `frontend/src/Pages/DashboardPage/index.tsx` e `StatementPart.tsx`;
  - `frontend/src/Pages/NetworkInsertPage/index.tsx`, `NetworkListPage/index.tsx` e
    `NetworkEditPage/index.tsx`;
  - `frontend/src/Pages/UserSearchPage/index.tsx`, com `ui/Pagination`.
- [X] T039 [P] [US2] [FE] Reescrever as telas comerciais:
  - `frontend/src/Pages/ProductSearchPage/index.tsx`;
  - `frontend/src/Pages/ProductEditPage/index.tsx`, mantendo o react-quill e seu CSS com as cores
    ajustadas aos tokens;
  - `frontend/src/Pages/OrderSearchPage/index.tsx`, `InvoiceSearchPage/index.tsx` e
    `CheckoutPage/index.tsx`;
  - `frontend/src/Pages/ProfileListPage/index.tsx` e `ProfileEditPage/index.tsx`.
- [X] T040 [US2] [FE] Reescrever a landing `frontend/src/Pages/HomePage/` (`index.tsx`,
  `Hero.tsx`, `Features.tsx`, `NetworkPart.tsx`, `Pricing.tsx` e `UserPart.tsx`) com o design
  system. Remover o uso de AOS, ou trocar por transições `motion-safe:`, e retirar `aos` e
  `@types/aos` do `frontend/package.json`.
- [X] T041 [US2] [FE] Remover o Bootstrap de vez:
  - tirar `bootstrap` e `react-bootstrap` do `frontend/package.json`;
  - apagar `frontend/public/assets/vendor/` e `frontend/public/assets/js/main.js`, e também
    `frontend/public/assets/css/main.css` se não tiver mais uso;
  - confirmar com Grep que não há `react-bootstrap`, `from 'bootstrap'` nem classes `btn`, `row`,
    `col-`, `form-control`, `card` ou `container` em `frontend/src`.
- [X] T042 [US2] [FE] Criar `frontend/src/test/routes.test.tsx`, que renderiza cada rota de
  `frontend/src/App.tsx` com `MemoryRouter` e os providers mockados, e verifica que nenhuma lança
  erro (SC-001 automatizado). `npm test` deve passar.

**Checkpoint**: as 27 telas estão migradas, o Bootstrap foi removido e os testes passam.

---

## Phase 6: User Story 4 - Equipe constrói, executa e publica (Priority: P2)

**Goal**: instalação limpa, build e container funcionando com Vite e as variáveis `VITE_*`.

**Independent Test**: num clone limpo, `npm ci`, `npm run build`, `npm test` e `docker build` (no
WSL2) passam, e o container serve um deep link.

- [X] T043 [P] [US4] [OPS] Atualizar `frontend/Dockerfile`:
  - imagem `node:22-alpine`;
  - `npm ci`, sem `--legacy-peer-deps`;
  - `ARG`/`ENV VITE_API_URL` e `VITE_SITE_BASENAME=/`;
  - `COPY --from=build /app/build`.

  O `frontend/nginx.conf` não muda. Apagar o `frontend/Dockerfile.bak`.
- [X] T044 [P] [US4] [OPS] Trocar `REACT_APP_API_URL` por `VITE_API_URL` em `build.args` no
  `docker-compose.yml` e no `docker-compose-prod.yml`, e nas linhas de `.env.example` e
  `.env.prod.example`. A pipeline `.github/workflows/deploy-prod.yml` também precisa ser
  atualizada se repassar a variável.
- [X] T045 [US4] [OPS] No WSL2 (skill `wsl-docker`), executar `docker build -t viralt-web
  --build-arg VITE_API_URL= ./frontend` e `docker run`. Confirmar que `/c/<slug>` e um F5 em
  `/campaigns/1/winners` respondem (quickstart §7).

**Checkpoint**: build e container validados.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T046 [FE] Medir de novo o tamanho transferido por `/c/:slug` no `npm run preview` e
  registrar a comparação com o T001 em `specs/003-frontend-vite-tailwind/baseline.md`. O total
  precisa ser ≤ ao baseline (SC-005). Se não for, otimizar com code-splitting por rota usando
  `React.lazy` em `frontend/src/App.tsx`.
- [X] T047 [P] [FE] Varredura do SC-008: procurar em `frontend/src` cores hex/rgb, `style={{…}}`
  com cores e tamanhos, e classes arbitrárias do Tailwind (`[…]`). Trocar o que estiver fora da
  escala por tokens ou pelos componentes `ui/`.
- [X] T048 [P] [AN] Atualizar o `README.md` (raiz) para Vite, Tailwind, `npm run dev` e as
  variáveis `VITE_*`. Remover a menção a Bootstrap e CRA e reescrever o `frontend/README.md`, que
  ainda é o padrão do CRA.
- [X] T049 [P] [MAIN] Atualizar o `CLAUDE.md`:
  - seção Frontend: `npm install` sem flag, `npm run dev`, `npm run build`, `npm test` (Vitest) e
    a nota "Uses `VITE_*` env vars";
  - variáveis `VITE_API_URL` e `VITE_SITE_BASENAME`;
  - pasta `Components/ui/`;
  - remover a frase sobre CRA e `REACT_APP_` da seção "Constitution".
- [X] T050 [MAIN] Emendar a constitution para 4.0.1 (PATCH) via `/speckit.constitution`: remover
  o `TODO(FRONTEND-VITE)` da seção "Transição" de `.specify/memory/constitution.md` e atualizar o
  Sync Impact Report.
- [X] T051 [MAIN] Executar o quickstart §2 e §3. O grep do SC-002 precisa voltar vazio, e
  instalação, build e testes precisam passar sem flags.
- [ ] T052 [MAIN] Conduzir com o usuário o roteiro funcional do quickstart §4 e marcar as 27
  telas como `verificada` em `specs/003-frontend-vite-tailwind/baseline.md`, na seção "Regressão".

---

## Dependencies & Execution Order

```text
Phase 1 (T001–T003)
  └─> Phase 2 US3 design (T004–T008) ─> T009 GATE (aprovação)
        └─> Phase 3 Foundational (T010–T027)
              ├─> Phase 4 US1 (T028–T033)  ─┐
              ├─> Phase 5 US2 (T034–T042)  ─┤  (T041 depende de T028–T040)
              └─> Phase 6 US4 (T043–T045)  ─┤  (T043/T044 podem começar após T010–T016)
                                             └─> Phase 7 Polish (T046–T052)
```

- **T009 bloqueia tudo** a partir da Phase 3.
- Dentro da Phase 3: T010 → T011–T016 → T017 → T018 → T019–T025 [P] → T026 → T027.
- T041 (remover o Bootstrap) só depois de **todas** as telas e componentes migrados (T028–T040).
- A US1 e a US2 podem avançar em paralelo, porque mexem em arquivos diferentes. O T034 (layout)
  deve vir antes de T036–T039.
- A entrega é única: o PR só sai depois da Phase 7 completa.

## Parallel Examples

```text
# Phase 2, depois de T004/T005:
T006 components.md  |  T007 mockups públicos  |  T008 mockups admin

# Phase 3, componentes ui/:
T019 Button | T020 Input/Select | T021 Checkbox/Radio | T022 Card/Badge/... | T023 Modal | T024 Alert | T025 Table/Pagination/Tabs

# Phase 5, depois de T034:
T036 campanha | T037 operação | T038 painel | T039 comercial

# Infra em paralelo ao frontend (após T016):
T043 Dockerfile | T044 compose/.env*.example
```

## Implementation Strategy

- **"MVP" interno**: Phases 1–4, ou seja, o design aprovado mais o fluxo do participante
  funcionando no novo visual. Serve para validar o design system em produção simulada (preview)
  antes de migrar as 20 telas administrativas.
- **Entrega**: única (FR-015). Nada vai para a `main` antes da Phase 7, e o PR inclui design,
  migração, infra e docs.
- **Commits**: na branch, um commit por fase, com prefixo `fix:` conforme a constitution, salvo se
  o usuário pedir outro.
