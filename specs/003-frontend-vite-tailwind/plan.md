# Implementation Plan: Migrar o frontend para Vite + Tailwind

**Branch**: `003-frontend-vite-tailwind` | **Date**: 2026-11-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-frontend-vite-tailwind/spec.md`

## Summary

Resolver a pendência `TODO(FRONTEND-VITE)` da constitution v4.0.0. A entrega é única (FR-015):

1. O `ux-designer` cria um **novo design system** com tokens, componentes base e mockups. O
   usuário aprova esse pacote antes de qualquer tela ser reescrita (gate).
2. O frontend troca CRA (`react-scripts`) por **Vite 6**, `REACT_APP_*` por `VITE_*` e Jest
   (nunca configurado) por **Vitest**.
3. As 27 telas são reescritas com **Tailwind CSS 4**, usando componentes base próprios em
   `src/Components/ui/`.
4. Saem do projeto o Bootstrap e o React-Bootstrap, o CSS vendorizado do `index.html` e as
   dependências sem uso: MUI, web3, Stripe e `react-native-svg`. Esta última é a causa do
   `--legacy-peer-deps`.

O widget já é um iframe, então o isolamento de estilo vem de graça (R6). O contrato de
`postMessage` não muda.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.3, Node 22 (build e imagem)
**Primary Dependencies**:
- novas: Vite 6, `@vitejs/plugin-react`, Tailwind CSS 4 + `@tailwindcss/vite`,
  `@radix-ui/react-dialog`, `sonner`, `clsx`, Vitest, jsdom;
- mantidas: react-router-dom 6, i18next, react-i18next, FontAwesome, axios (legado), react-quill,
  react-image-crop, moment, react-loading-skeleton, Capacitor;
- removidas: react-scripts, bootstrap, react-bootstrap, @mui/\*, react-native-svg, web3,
  @stacks/connect, @stripe/\*, @craftjs/core, react-dnd\*, react-ga, react-qr-code,
  react-currency-input-field, web-vitals, aos.

**Storage**: N/A. O localStorage da sessão não muda (FR-013).
**Testing**: Vitest + Testing Library (jsdom); `@axe-core/cli` via npx para o SC-006.
**Target Platform**: navegadores, nas duas últimas versões de Chrome, Edge, Firefox e Safari;
container nginx.
**Project Type**: web application. Esta feature mexe só no `frontend/` e na infra do frontend.
**Performance Goals**:
- dev server sobe em até 5 s e o HMR responde em até 2 s (SC-004);
- o primeiro carregamento de `/c/:slug` não fica maior que o baseline do CRA (SC-005).

**Constraints**:
- entrega única;
- design aprovado antes da implementação;
- WCAG 2.1 AA;
- contrato do widget e chave de sessão inalterados;
- saída em `build/`.

**Scale/Scope**:
- 229 arquivos TS/TSX, 27 telas, 41 arquivos com react-bootstrap, ~730 `className`;
- ~15 componentes base;
- 8 arquivos de infra/config para as variáveis.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v4.0.0.

| Regra | Verificação | Status |
|---|---|---|
| I. Skills Obrigatórias | `react-architecture` continua sendo o padrão de Types, Service, Context e Hook. Esta feature não cria entidades e não altera essa estrutura | ✅ |
| II. Regras Gerais | Docker só no WSL2 (quickstart §7); sem secrets no frontend; a sessão principal não edita `frontend/` | ✅ |
| III. Estrutura | Tudo dentro de `frontend/`, e o `index.html` vai para a raiz de `frontend/` | ✅ |
| IV. Agentes | Design: `ux-designer`. Código e testes do frontend: `react-developer`. Dockerfile, compose e `.env*.example`: `devops-engineer`. README: `analyst` | ✅ |
| VI. Frontend: stack | Vite 6, Tailwind 4, `VITE_` e Fetch para serviços novos. Bootstrap e MUI removidos. Context API mantida | ✅ (é o objetivo) |
| VI. Frontend: case sensitivity | `Contexts/`, `Services/`, `hooks/` e `types/` intactos. O `Components/ui/` é novo e em minúsculas, seguindo a convenção do shadcn | ✅ |
| VI. Frontend: convenções | Componentes como arrow functions e `interface` nas props | ✅ |
| VI. Acessibilidade | Tokens validados (FR-004a), Radix Dialog, `aria-live`, alvos de 44 px e auditoria com axe | ✅ |
| VI. Autenticação no frontend | A regra de `Bearer` depende do `TODO(AUTH-JWT)`, fora do escopo. Basic token e chave de sessão mantidos como legado tolerado | ⚠ legado tolerado (seção Transição) |
| VII. Infra | Dockerfile e compose atualizados pelo `devops-engineer`. O deploy continua via SSH, que é o `TODO(DEPLOY-K8S)` | ⚠ legado tolerado |
| Transição | Ao final, remover `TODO(FRONTEND-VITE)` da constitution (PATCH 4.0.1) | tarefa |

**Resultado do gate**: aprovado. Os dois ⚠ são legados declarados na seção Transição, e a feature
não os amplia.

**Re-check pós-design**: os contratos (`widget-embed`, `frontend-build`) e o modelo de componentes
não introduzem nada proibido. ✅

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-vite-tailwind/
├── plan.md
├── research.md            # R1–R12
├── data-model.md          # tokens, componentes base, inventário de telas, variáveis
├── quickstart.md          # baseline, gate de design, build, grep, regressão, axe, container
├── baseline.md            # criado na implementação (SC-005)
├── contracts/
│   ├── widget-embed.md
│   └── frontend-build.md
├── checklists/requirements.md
└── tasks.md               # /speckit.tasks
```

### Source Code

```text
docs/design/                         # ux-designer
├── tokens.md                        # tokens + tabela de contraste
├── theme.css                        # @theme do Tailwind (fonte para src/styles/theme.css)
├── components.md                    # spec dos componentes base
└── mockups/                         # HTML/CSS: public-campaign, widget, admin-list, admin-form

frontend/
├── index.html                       # NOVO local (era public/index.html), sem CSS vendorizado
├── vite.config.ts                   # NOVO: react + tailwind, base, outDir build, port 3000, test (vitest)
├── tsconfig.json                    # estilo Vite
├── package.json                     # scripts dev/build/preview/test; dependências limpas
├── .env, .env.production            # VITE_*
├── Dockerfile                       # node:22, sem --legacy-peer-deps, ARG VITE_* (devops-engineer)
├── public/                          # sem assets/vendor/ e assets/js/main.js
└── src/
    ├── vite-env.d.ts                # NOVO: tipagem de import.meta.env
    ├── styles/
    │   ├── index.css                # @import "tailwindcss"; @import "./theme.css"
    │   └── theme.css                # tokens aprovados
    ├── Components/ui/               # NOVO: Button, Input, Select, Checkbox, Radio, Card, Table,
    │                                #   Modal, Alert, Toaster, Tabs, Navbar, Pagination, Badge,
    │                                #   Spinner, Skeleton (+ index.ts)
    ├── Components/**, Pages/**      # reescritos com ui/ e utilitários Tailwind
    ├── Infra/Impl/HttpClient.tsx    # REACT_APP_PRODUCTION → import.meta.env.PROD
    └── test/                        # setup.ts, ui.test.tsx, routes.test.tsx

(raiz)
├── docker-compose.yml, docker-compose-prod.yml   # build.args VITE_API_URL (devops-engineer)
├── .env.example, .env.prod.example               # VITE_API_URL (devops-engineer)
├── CLAUDE.md                                     # comandos e variáveis do frontend
└── .specify/memory/constitution.md               # PATCH 4.0.1: remove TODO(FRONTEND-VITE)
```

**Structure Decision**: tudo fica dentro de `frontend/`, conforme a constitution (III). O design
fica em `docs/design/`, a pasta do `ux-designer` (IV).

## Ordem de execução

1. **ux-designer**: pacote de design em `docs/design/`. **GATE: aprovação do usuário**, e nada
   abaixo começa sem ela.
2. **react-developer**:
   1. baseline CRA (`baseline.md`);
   2. base Vite (config, TS, `index.html`, variáveis, dependências, Vitest) com a estilização ainda
      quebrada (passo intermediário local, não entregue);
   3. `theme.css` e `Components/ui/` com testes;
   4. telas públicas (`/c/:slug`, `/widget/:slug`, login, cadastro e recuperação);
   5. layout administrativo (navbar e sidebar) e as demais telas;
   6. remoção do Bootstrap, dos vendors e das dependências sem uso;
   7. teste de rotas e medição pós-migração.
3. **devops-engineer**: Dockerfile, compose e `.env*.example` (pode rodar em paralelo ao passo 2.2).
4. **analyst**: README do projeto e do frontend.
5. **Sessão principal**:
   1. `CLAUDE.md`;
   2. constitution 4.0.1;
   3. verificação do quickstart §3 (grep), §5 (axe) e §6 (tamanho);
   4. o roteiro §4 é executado com o usuário.

## Riscos

| Risco | Mitigação |
|---|---|
| PR enorme (27 telas e redesign) e regressões funcionais | Teste automatizado de rotas, roteiro funcional por tela (data-model §3) e componentes `ui/` testados isoladamente |
| Design reprovado ou alterado no meio da implementação | Gate de aprovação antes do passo 2. Mudança posterior volta ao `ux-designer` |
| CSS global do template (`main.css`) usado pela HomePage | A HomePage é reescrita com o design system. O `main.css` sai junto |
| Bibliotecas que dependem do Bootstrap (react-loading-skeleton e react-quill têm CSS próprio) | Manter o CSS próprio delas, importado no componente, e ajustar as cores aos tokens |
| `CheckoutPage` e `RequestAccessPage` sem rota | Confirmar o uso. Se estiverem órfãs, migrar mesmo assim (são baratas) e registrar no relatório |

## Complexity Tracking

Nenhuma violação da constitution a justificar.
