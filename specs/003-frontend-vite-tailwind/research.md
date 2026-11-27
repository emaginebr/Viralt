# Research: Migrar o frontend para Vite + Tailwind (003)

Levantamento do código em `frontend/` feito em 2026-11-27:

- 229 arquivos `.ts`/`.tsx` e 27 telas em `src/Pages/`.
- 41 arquivos importam `react-bootstrap`, e há cerca de 730 atributos `className`, muitos com
  classes do Bootstrap.
- `public/index.html` carrega o Bootstrap, o Bootstrap Icons, o glightbox, o swiper e um
  `main.css` de template, todos vendorizados em `public/assets/vendor/`.
- Os scripts são de CRA (`react-scripts` 5.0.1) e não há nenhum teste (`*.test.*`).
- Node local: v22.19.0. A imagem do Dockerfile usa `node:18-alpine`.

## R1 — Bundler e configuração

- **Decision**: Vite 6 com `@vitejs/plugin-react`.
  - O `index.html` sai de `public/` e vai para a raiz de `frontend/`, e `%PUBLIC_URL%` é trocado
    por caminhos absolutos.
  - O `base` do Vite vem de `VITE_SITE_BASENAME`, com padrão `/`.
  - O `outDir` continua sendo `build/`, para não mexer no Dockerfile, no nginx nem no
    `capacitor.config.json` (`webDir: build`).
  - O dev server fica na porta 3000, com proxy de `/api` para `VITE_API_URL` quando houver valor.
- **Rationale**: é o que a constitution exige. Manter `build/` reduz as mudanças de infraestrutura.
- **Alternatives**: `outDir: dist`, o padrão do Vite, foi rejeitado porque exigiria mudanças em três
  arquivos de infra sem ganho nenhum.

## R2 — TypeScript

- **Decision**: `tsconfig.json` no estilo Vite:
  - `target ES2020`, `moduleResolution: bundler`, `types: ["vite/client"]` e `jsx: react-jsx`;
  - `strict` continua ligado e `strictNullChecks` continua desligado (estado atual), para não
    ampliar o escopo;
  - typecheck com `tsc --noEmit` no script de build: `tsc --noEmit && vite build`.
- **Rationale**: o Vite não faz typecheck, e o CRA fazia. Sem o `tsc` no build, erros como o
  TS7010 da feature 002 passariam despercebidos.
- **Alternatives**: `vite-plugin-checker`, rejeitado por ser uma dependência a mais.

## R3 — Variáveis de ambiente

- **Decision**: `process.env.REACT_APP_*` vira `import.meta.env.VITE_*`, com tipagem em
  `src/vite-env.d.ts`.

  | Antes | Depois |
  |---|---|
  | `REACT_APP_API_URL` | `VITE_API_URL` |
  | `REACT_APP_SITE_BASENAME` | `VITE_SITE_BASENAME` |
  | `REACT_APP_PRODUCTION` | `VITE_PRODUCTION`, ou trocar por `import.meta.env.PROD` (preferível) |
  | `REACT_APP_PROJECT_NAME` | `VITE_PROJECT_NAME` |
  | `REACT_APP_WEBSITE_NAME` | `VITE_WEBSITE_NAME`, se tiver uso. Senão, remover |

  Arquivos afetados: `frontend/.env`, `frontend/.env.production`, `frontend/Dockerfile`
  (`ARG`/`ENV`), `docker-compose.yml`, `docker-compose-prod.yml`, `.env.example`,
  `.env.prod.example` e `CLAUDE.md`.
- **Rationale**: é o que a constitution exige. Trocar a flag de produção por `import.meta.env.PROD`
  elimina uma variável manual e uma fonte de erro.
- **Alternatives**: `envPrefix: 'REACT_APP_'` no Vite, rejeitado porque viola a constitution.

## R4 — Tailwind CSS e design system

- **Decision**: Tailwind CSS 4 com `@tailwindcss/vite`.
  - Os tokens do `ux-designer` são definidos em CSS com `@theme`, em `src/styles/theme.css`, e
    viram utilitários como `bg-primary` e `text-muted`.
  - O CSS global fica em `src/styles/index.css`, com `@import "tailwindcss"` e o tema.
  - Os componentes base ficam em `src/Components/ui/`, com nomes da spec: `Button`, `Input`,
    `Select`, `Checkbox`, `Radio`, `Card`, `Table`, `Modal`, `Alert`, `Tabs`, `Navbar`,
    `Pagination`, `Badge`, `Spinner`, `Skeleton`. Variantes por props simples, com `clsx` para
    compor classes.
- **Rationale**: o Tailwind 4 configura tudo em CSS, sem `tailwind.config.js`. Componentes base
  únicos garantem o SC-008, porque as telas não usam valores avulsos.
- **Alternatives**:
  - shadcn/ui: o `ux-designer` tem a stack "React + Vite + Tailwind com shadcn/ui" como alvo.
    Adotamos os padrões, mas não o CLI nem os pacotes Radix, salvo o Dialog (ver R5). Instalar o
    shadcn inteiro traria mais dependências que o necessário para 15 componentes.
  - Tailwind 3 com config em JS: rejeitado, a constitution fixa a 4.x.

## R5 — Modais e acessibilidade

- **Decision**: o `Modal` é construído sobre `@radix-ui/react-dialog`, que cuida do focus trap, do
  `Esc`, de devolver o foco e do `aria-modal`. Os alertas de feedback usam `sonner`, como na skill
  `react-alert`, com `aria-live`.
- **Rationale**: cumpre FR-009 e a seção de acessibilidade sem reimplementar o focus trap. As skills
  `react-modal` e `react-alert` do repositório já seguem esse padrão.
- **Alternatives**: focus trap manual, rejeitado por ser propenso a erro. `Modal` do
  react-bootstrap, removido junto com o Bootstrap.

## R6 — Isolamento do widget

- **Decision**: não é preciso trabalho extra. O widget (`/widget/:slug`) já roda num **iframe**:
  `WidgetPage` envia a altura ao site pai por `postMessage({ type: 'viralt-resize', slug, height })`.
  Por isso o CSS não vaza entre o widget e o site hospedeiro, em nenhum dos dois sentidos. O
  contrato do `postMessage` é mantido, conforme `contracts/widget-embed.md`.
- **Rationale**: resolve FR-007. O ponto em aberto do spec fica resolvido.
- **Alternatives**: Shadow DOM, desnecessário.

## R7 — Ícones, assets vendorizados e template

- **Decision**:
  - Remover do `index.html` o Bootstrap, o Bootstrap Icons, o glightbox, o swiper e o `main.css`,
    e apagar `public/assets/vendor/` e `public/assets/js/main.js` quando não houver mais uso.
  - Ícones: manter o FontAwesome, que tem 36 arquivos e é independente de framework CSS. Os 2 usos
    de `bi bi-*` passam a usar FontAwesome.
  - O AOS (1 uso, animações de scroll) é removido ou trocado por transições do Tailwind com
    `motion-safe:`, para respeitar `prefers-reduced-motion`.
- **Rationale**: o FR-002 exige que nenhum CSS do Bootstrap sobre. Trocar o FontAwesome não traria
  valor e aumentaria o diff.
- **Alternatives**: trocar por Lucide, o padrão do shadcn. Fica para depois, se o `ux-designer`
  pedir.

## R8 — Dependências sem uso e o `--legacy-peer-deps`

- **Decision**: remover as dependências sem nenhum import em `src/`:
  - `@mui/material`, `@mui/icons-material`, `@mui/styles`;
  - `react-native-svg`, que causa o conflito de peers;
  - `web3`, `@stacks/connect`, `@stripe/react-stripe-js`, `@stripe/stripe-js`;
  - `@craftjs/core`, `react-dnd`, `react-dnd-html5-backend`;
  - `react-ga`, `react-qr-code`, `react-currency-input-field`, `web-vitals`;
  - `react-scripts`, `bootstrap`, `react-bootstrap`.

  `@capacitor/*` fica, porque há `capacitor.config.json`. A lista final é confirmada com Grep na
  implementação. Os pacotes de teste (`@testing-library/*`) vão para `devDependencies`.
- **Rationale**: o MUI viola a constitution e o `react-native-svg` é a causa declarada do
  `--legacy-peer-deps`. Removê-los cumpre o FR-011 e o SC-002.
- **Alternatives**: manter tudo e só trocar o build, rejeitado por violar o FR-011.

## R9 — Testes

- **Decision**: Vitest e Testing Library com ambiente `jsdom`. O script `npm test` passa a ser
  `vitest run`, e o `@testing-library/user-event` sobe para a 14.

  Testes mínimos:
  - smoke test de renderização dos componentes base: Modal (foco e `Esc`), Button e Alert;
  - teste de roteamento que renderiza cada rota de `App.tsx` com os contexts mockados e verifica
    que nenhuma lança erro, cobrindo o SC-001 de forma automatizada.

  Os testes do frontend ficam com o `react-developer`. O `qa-developer` cuida só de .NET.
- **Rationale**: o FR-012 pede que `npm test` passe, e hoje não existe nenhum teste. Vitest é o
  padrão do ecossistema Vite.
- **Alternatives**: Jest com babel, rejeitado por ter configuração duplicada.

## R10 — Container e nginx

- **Decision** (`devops-engineer`):
  - `frontend/Dockerfile` passa a usar `node:22-alpine` com `npm ci`, sem `--legacy-peer-deps`.
  - `ARG`/`ENV VITE_API_URL` e `VITE_SITE_BASENAME`.
  - `npm run build` continua gerando `build/`.
  - O `nginx.conf` não muda (`try_files … /index.html` já cobre o deep link).
  - Apagar o `Dockerfile.bak`.
- **Rationale**: o Vite 6 precisa de Node 18 ou mais, e a 22 é a LTS usada localmente. As variáveis
  `VITE_` são lidas no build, por isso precisam ser `ARG`.
- **Alternatives**: nenhuma relevante.

## R11 — Linha de base de desempenho (SC-005) e acessibilidade (SC-006)

- **Decision**:
  - **Antes de começar**: gerar o build CRA atual e registrar em `baseline.md` o tamanho
    transferido (gzip) para `/c/:slug`, somando JS, CSS e o CSS vendorizado do `index.html`.
  - **Depois**: medir de novo com `vite build` e o preview.
  - **Acessibilidade**: rodar `@axe-core/cli` (via `npx`, sem virar dependência) contra
    `/c/:slug` e `/widget/:slug` no `vite preview`.
- **Rationale**: o SC-005 precisa de baseline, e o axe automatiza o SC-006.

## R12 — Ordem de execução (entrega única)

1. **ux-designer**: o pacote de design system (tokens, especificações e mockups) em
   `docs/design/`. **Gate**: aprovação do usuário.
2. **react-developer**:
   1. baseline (R11);
   2. troca da base: Vite, TS, variáveis, `index.html`, dependências e Vitest;
   3. `theme.css` e componentes `ui/`;
   4. migração das 27 telas, primeiro as públicas e depois as administrativas;
   5. remoção do Bootstrap e dos vendors;
   6. testes.
3. **devops-engineer**: Dockerfile, compose e `.env*.example`.
4. **Sessão principal**: CLAUDE.md, README (via `analyst`), remoção do TODO(FRONTEND-VITE) na
   constitution (PATCH 4.0.1), verificações do SC-002 com `grep` e o roteiro de regressão.

Tudo vai na mesma branch e num único PR, conforme o FR-015.
