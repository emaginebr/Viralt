# Baseline e registros da migração (003)

## Desempenho: baseline do CRA (T001, 2026-11-27)

`npm run build` com `react-scripts` 5.0.1. O build é feito com um único chunk de entrada, sem
code-splitting por rota. Os tamanhos abaixo foram medidos com `gzip -c | wc -c`.

| Recurso carregado por `/c/:slug` | Bytes (gzip) |
|---|---|
| `static/js/main.*.js` | 279.140 |
| `static/css/main.*.css` | 7.320 |
| `assets/vendor/bootstrap/css/bootstrap.min.css` | 31.060 |
| `assets/vendor/bootstrap-icons/bootstrap-icons.css` | 14.547 |
| `assets/vendor/glightbox/css/glightbox.min.css` | 2.586 |
| `assets/vendor/swiper/swiper-bundle.min.css` | 4.878 |
| `assets/css/main.css` | 7.851 |
| **Total JS + CSS** | **347.382 (~339 KiB)** |

Ficam de fora:
- fontes (Google Fonts e a fonte do Bootstrap Icons);
- imagens;
- `locales/*.json`;
- o chunk `38.*.chunk.js` (3,26 kB), que é carregado sob demanda.

**Meta do SC-005**: o total de JS + CSS no primeiro carregamento de `/c/:slug` deve ficar em
**≤ 347.382 bytes gzip**.

## Inventário (T002)

Análise estática de `frontend/src` feita em 2026-11-27. Nenhum arquivo de código foi alterado.

### Telas sem rota

| Tela | Importada por | Links / `navigate` | Conclusão |
|---|---|---|---|
| `CheckoutPage` | Ninguém | Nenhum | **Órfã.** É uma cópia quase literal de `RequestAccessPage`: mesmo JSX, chaves i18n `requestAccessPage.*` e `useParams().networkSlug`. Não tem nada de checkout. |
| `RequestAccessPage` | `src/App.tsx:22` (import sem uso, porque não há `<Route>`) | Nenhum (não há `"/request-access"`, `networkSlug` em links nem `navigate` para ela) | **Órfã.** Espera o parâmetro `:networkSlug`, que nenhuma rota fornece. |

As duas pertencem ao legado "Network/MonexUp", são inalcançáveis e podem ser removidas na migração em
vez de migradas. Também não precisam entrar no roteiro de regressão (T052). Se forem removidas, o
import de `App.tsx:22` sai junto.

Também não são importados por ninguém em `src`: `Components/SkeletonPage`, `GalleryGrid`,
`ContestUpload`, `EmbedCodeSection`, `CampaignWidget`, `TrackingPixels` e `TemplateUtils`. Eles
precisam de uma decisão: migrar, porque o uso está planejado, ou remover.

### `REACT_APP_WEBSITE_NAME`

- **Não aparece em `src`.**
- Está declarada em `.env:7` e `.env.production:7`.
- É usada **só** em `public/index.html:28`: `<title>%REACT_APP_WEBSITE_NAME%</title>`.
- Para o Vite, há duas opções: manter `VITE_WEBSITE_NAME` com `%VITE_WEBSITE_NAME%` no `index.html`
  (o Vite substitui `%VITE_*%` no HTML) ou fixar o título.
- Para o T014, a condição "incluir `VITE_WEBSITE_NAME` só se T002 apontar uso" é atendida **só pelo
  `index.html`**. Como a substituição `%VITE_*%` no HTML não precisa de tipagem em `ImportMetaEnv`,
  a variável só entra no `vite-env.d.ts` se algum código TS passar a lê-la.

### Usos de `process.env.*` em `src`

| Arquivo:linha | Variável | Substituto no Vite |
|---|---|---|
| `Components/CampaignWidget/index.tsx:22` e `:23` | `REACT_APP_API_URL` | `import.meta.env.VITE_API_URL` |
| `Components/ContestUpload/index.tsx:51` | `REACT_APP_API_URL` (fallback `https://localhost:44374`) | idem |
| `Services/ServiceFactory.tsx:21` | `REACT_APP_API_URL` (`httpClientAuth.init`) | idem |
| `Services/apiHelpers.ts:5` | `REACT_APP_API_URL` (fallback `https://localhost:44374`) | idem |
| `Components/Header.tsx:69` | `REACT_APP_PROJECT_NAME` | `VITE_PROJECT_NAME` |
| `index.tsx:12` | `REACT_APP_SITE_BASENAME` (`BrowserRouter basename`) | `VITE_SITE_BASENAME` / `import.meta.env.BASE_URL` |
| `Infra/Impl/HttpClient.tsx:55`, `:74`, `:97`, `:120`, `:139`, `:164`, `:190` | `REACT_APP_PRODUCTION == "0"` (7×) | `!import.meta.env.PROD` |
| `i18n.tsx:36` | `NODE_ENV === 'development'` | `import.meta.env.DEV` |
| `Components/Functions.tsx:106` e `:115` | `PUBLIC_URL` (bandeiras `/flags/*.svg`) | `import.meta.env.BASE_URL` |
| `Components/ScriptLoader.tsx:19` a `:23` | `PUBLIC_URL` (5 scripts vendor) | idem, ou remover o `ScriptLoader` |

No total são 22 ocorrências em 10 arquivos. Nenhum `import.meta` existe hoje. As chaves declaradas em
`.env` e `.env.production` são `NODE_ENV`, `NODE_PATH`, `PUBLIC_URL`, `REACT_APP_PRODUCTION`,
`REACT_APP_SITE_BASENAME`, `REACT_APP_PROJECT_NAME`, `REACT_APP_WEBSITE_NAME`, `REACT_APP_API_URL` e
`PORT`.

### Itens do CRA que quebram ou mudam no Vite

| Item | Situação | Onde |
|---|---|---|
| `require(` | Não há | — |
| SVG como componente (`ReactComponent`) / `import x from './x.svg'` | Não há. SVGs (bandeiras) são servidos de `public/flags` por URL | `i18n.tsx:13-25`, `Functions.tsx:106,115` |
| `%PUBLIC_URL%` | **Sim**, 11 ocorrências | `public/index.html:7,8,16-19,21,26,27` (favicon, CSS vendor, manifest) |
| `%REACT_APP_*%` no HTML | **Sim** | `public/index.html:28` |
| `process.env.PUBLIC_URL` | **Sim**, 7 ocorrências | `Functions.tsx`, `ScriptLoader.tsx` |
| `process.env.*` em geral | **Sim**, 22 ocorrências | tabela acima. No Vite, `process` não existe no browser e o dev quebra com `ReferenceError` |
| `module.hot` | Não há | — |
| `serviceWorker` / `reportWebVitals` | Não há em `src`. O pacote `web-vitals` está no `package.json` sem uso | `package.json:48` |
| Imports absolutos via `baseUrl` / `NODE_PATH` | `NODE_PATH=./src` está nos dois `.env`, mas **nenhum import depende dele**: todos os imports internos são relativos. O `tsconfig.json` não tem `baseUrl` nem `paths` | `.env:2`, `.env.production:2` |
| `index.html` em `public/` | Precisa ir para a raiz do `frontend/`, com `<script type="module" src="/src/index.tsx">` | `public/index.html` |
| Testes via `react-scripts test` (Jest) | `src/setupTests.js` com `@testing-library/jest-dom`. Não existe nenhum `*.test.*`. `npm test` precisa ir para o Vitest ou ser removido | `src/setupTests.js`, `package.json:54` |
| `tsconfig.json` do CRA | `target: es5`, `moduleResolution: node`, sem `types: ["vite/client"]` e sem `vite-env.d.ts` (`import.meta.env` não teria tipo) | `tsconfig.json` |
| `eslintConfig: react-app` | Depende de `eslint-config-react-app`, que vem com o `react-scripts` | `package.json:57-62` |
| Scripts vendor injetados em runtime | `ScriptLoader` carrega `bootstrap.bundle.min.js`, `glightbox`, `swiper`, `purecounter` e `assets/js/main.js` (template iLanding) | `Components/ScriptLoader.tsx`, `App.tsx:117` |
| Caminhos relativos de assets | `<img src="assets/img/*.webp">` sem `/` inicial (quebra em rotas aninhadas e com `base`) | `Pages/HomePage/Hero.tsx:48,52-56` |
| `loadPath` absoluto do i18n | `'/locales/{{lng}}/translation.json'` ignora o basename | `i18n.tsx:42` |
| CSS de libs importado em JS | `aos/dist/aos.css`, `react-loading-skeleton/dist/skeleton.css`, `react-image-crop/dist/ReactCrop.css`, `react-quill/dist/quill.snow.css`. Funcionam no Vite sem mudança | `App.tsx:46`, `index.tsx:3`, `ImageModal.tsx:5`, `ProductEditPage/index.tsx:24` |

Dependências **sem nenhum import em `src`**, que são candidatas a sair do `package.json` antes do Vite
para evitar problemas de pre-bundling e de polyfills de Node: `web3`, `@stacks/connect`, `@mui/*`,
`@craftjs/core`, `@stripe/*`, `@capacitor/*`, `react-ga`, `react-dnd*`, `react-qr-code`,
`react-native-svg` (a causa do `--legacy-peer-deps`), `react-currency-input-field`, `quill` (usado só
via `react-quill`) e `web-vitals`. Nenhuma delas é importada em `src`.

## Uso de Bootstrap (T003)

Levantamento feito por busca de imports `react-bootstrap/*`, de tags JSX (`<Card`, `<Form.` etc.),
de `className` e de props `variant`/`bg`/`size`. "Usados" quer dizer que o componente aparece no
JSX. "Sem uso" quer dizer que é importado e nunca renderizado: esses imports somem na migração sem
nenhum trabalho. Os ícones FontAwesome listados são os importados, e parte deles também não é usada.

Observações gerais:
- Todos os imports usam o caminho por componente (`react-bootstrap/X` ou `react-bootstrap/esm/X`).
  Não há `import { … } from 'react-bootstrap'`.
- O CSS do Bootstrap **não** é importado no JS. Ele vem de `public/assets/vendor/bootstrap` pelo
  `index.html`, e o JS do Bootstrap (`bootstrap.bundle.min.js`) é injetado pelo `ScriptLoader`.
- Muitas classes vêm do **template iLanding** (`public/assets/css/main.css` + `assets/js/main.js`),
  e não do Bootstrap: `header`, `navmenu`, `sitename`, `logo`, `btn-getstarted`, `hero-content`,
  `company-badge`, `customers-badge`, `stats-row`, `footer-*`, `social-links`, `scroll-top`,
  `page-wrap`. Também há `lc-block`, um resíduo do LiveCanvas sem CSS próprio.

### Telas (`src/Pages`)

| # | Tela | react-bootstrap usados | Importados sem uso | Classes Bootstrap mais usadas | Ícones | Outras libs visuais / notas |
|---|---|---|---|---|---|---|
| 1 | HomePage (`index` + `Hero`, `Features`, `NetworkPart`, `Pricing`, `UserPart`, `Footer`) | Container, Row, Col (Features, NetworkPart, Pricing, UserPart); Card, CardHeader, CardTitle, CardBody, CardText (Pricing, NetworkPart); Button `primary lg` (Pricing) | Button (Hero) | `container`, `row`, `col-lg-6`, `col-lg-3 col-md-6`, `col-lg-4 col-md-6`, `gy-4`, `py-5`, `pt-4`, `my-3`, `mb-4`, `display-2/4`, `lead`, `text-center`, `text-dark`, `text-decoration-none`, `bg-light`, `border`, `p-4`, `shadow-lg`, `rounded-circle`, `img-fluid`, `d-grid`, `btn btn-primary`, `btn btn-link`, `btn-outline-primary`, `card*` em HTML puro (Pricing), `py-lg-6` (não existe no BS5) | `bi-gear-fill`, `bi-play-circle`, `bi-trophy`, `bi-briefcase`, `bi-graph-up`, `bi-award` (Hero). FA: faBoltLightning, faLock, faFileUpload, faCalendarAlt, faFileWord, faBoxOpen, faLockOpen, faUserDoctor, faBitcoin (4x), faBuilding, faEnvelope, faUserCircle (8x), faWhatsapp, faTextWidth, faWarning | **AOS** (`AOS.init`, `data-aos` no Hero), **glightbox** (vídeo do Hero), react-loading-skeleton (NetworkPart, UserPart), imagens `assets/img/*.webp` |
| 2 | CampaignSearchPage | Container, Row, Col, Card, Badge, Button, Form (Control), InputGroup, Dropdown (filtro de status), Pagination (First/Prev/Item/Next/Last), Spinner, Alert | — | `py-4/py-5`, `mb-2/3/4`, `h-100`, `d-flex flex-column`, `justify-content-between align-items-start`, `flex-grow-1`, `mt-auto`, `text-muted small`, `d-block`, `justify-content-center` | FA: faEdit, faEye, faPlus, faSearch, faTrash, faUsers | `window.confirm` na exclusão (→ ConfirmModal) |
| 3 | CampaignBuilderPage | Container, Row, Col, Card, Button, Form (Group, Label, Control, Select, Check, Text), **Tab.Container + Nav `variant="pills"` vertical**, Alert, Spinner | Badge | `mb-3` (dominante), `mb-2`, `me-1/2`, `ms-1/3`, `mt-3/4`, `d-flex justify-content-between align-items-center`, `flex-column`, `list-unstyled`, `text-muted`, `border`, `text-center` | FA: faInfoCircle, faPaintBrush, faTrophy, faCog, faCheckCircle, faPlus, faTrash, faArrowLeft, faArrowRight, faSave | Inputs `datetime-local`, `color` (3×), `number`, `textarea`, `checkbox`; wizard em abas |
| 4 | CampaignDetailPage | Container, Row, Col, Card, Badge, Button, Spinner, Alert | — | `text-center py-5`, `mb-0…4`, `me-1/2`, `text-muted small`, `text-primary/success/info/warning`, `bg-light p-3 rounded`, `position-relative`, `position-absolute top-0 end-0 m-2`, `d-flex justify-content-between align-items-start` | FA: faEdit, faUsers, faTrophy, faEye, faCode, faCalendar, faChartBar, faClipboard (2x) | `Badge bg="outline-secondary"` é uma variante inválida no BS5 |
| 5 | ParticipantListPage | Container, Row, Col, **Table**, Button, Form, InputGroup, Badge, Spinner, Alert, Pagination | — | `mb-3`, `me-1/2`, `text-end`, `text-center py-5`, `text-muted py-4`, `d-flex justify-content-center` | FA: faSearch, faBan, faTrash, faFileExport, faDownload | `window.confirm` (2×) |
| 6 | SubmissionModerationPage | Container, Row, Col, Card (Img `top`), Button, Badge, Form (Select), Spinner, Alert | — | `position-relative/absolute`, `top-0 start-0 end-0`, `w-100 h-100`, `bg-dark`, `d-flex flex-column`, `mt-auto`, `gap-2`, `h-100`, `text-muted small`, `text-end`, `m-2` | FA: faCheck, faTimes, faFilter, faPlay | Grade de mídia com overlay de vídeo |
| 7 | WinnerSelectionPage | **nenhum** (só HTML com classes Bootstrap) | — | `container py-4`, `card card-body card-title`, `row g-3 align-items-end`, `col-md-3/4`, `form-label`, `form-control`, `form-select`, `btn btn-primary`, `btn btn-outline-primary btn-sm`, `btn btn-sm btn-outline-success`, `alert alert-danger alert-dismissible`, `btn-close`, `spinner-border text-primary`, `table-responsive table table-striped`, `fw-semibold` | — | Alert dispensável e tabela em HTML puro |
| 8 | NetworkInsertPage | Container, Row, Col, Card, Button, Form (Check), InputGroup | — | `mb-3/5`, `text-center`, `align-items-center`, `d-none d-md-block`, `d-grid gap-2 d-md-flex justify-content-md-end` | FA: faArrowLeft, faArrowRight, faCancel, faEnvelope, faLock, faPercent, faUser | moment; wizard em passos; inputs `size="lg"` |
| 9 | NetworkListPage | Container, Row, Col, **Table**, Button, Form, InputGroup | — | `py-4`, `d-flex justify-content-center`, `spinner-border` (HTML) | FA: faCalendar, faDollar, faSearch, faTrash | `alert()` |
| 10 | LoginPage | Container, Row, Col, Card, Button, Form (Check), InputGroup | Table | `text-center`, `mb-3`, `d-grid gap-2 d-md-flex justify-content-md-end` | FA: faEnvelope, faLock, faSignInAlt, faUser… (12 importados) | — |
| 11 | UserPage | Container, Row, Col, Card, Button, Form, InputGroup | Table | `mb-2/3`, `text-center`, `rounded-circle`, `lc-block d-grid gap-3 d-md-block`, `d-grid gap-2 d-md-flex justify-content-md-end` | FA: faUser, faEnvelope, faLock, faSave, faUpload… (13 importados) | **ImageModal** (avatar), moment |
| 12 | RecoveryPage | Container, Row, Col, Card, Button, Form, InputGroup | Table | `text-center`, `mb-3`, `d-grid gap-2 d-md-flex justify-content-md-end` | FA: faEnvelope… (11 importados) | — |
| 13 | PasswordPage | Container, Row, Col, Card, Button, Form, InputGroup, Alert | Table | `text-center`, `mb-3/4`, `d-grid gap-2 d-md-flex justify-content-md-end` | FA: faLock, faSave, faWarning… (9 importados) | — |
| 14 | DashboardPage (`index` + `CountPart` + `StatementPart`) | Container, Row, Col, Card, CardHeader, CardTitle, CardBody, CardText, Button, Alert, Spinner, Badge, **ListGroup**, **Tabs/Tab**, **Table** + Pagination (StatementPart) | Table (no `index`) | `text-center mb-3`, `text-primary/success/warning`, `text-muted`, `py-3/4`, `ms-2 me-auto` (ListGroup), `fw-bold display-5`, `text-right` (classe do BS4, não existe no BS5), `row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4`, `col`, `card card-body shadow`, `d-inline-flex`, `bg-light p-3 rounded-circle`, `lead`, `spinner-border` | FA: cerca de 31 solid (faChartLine, faCoins, faUsers, faBullhorn, faTicket…) + faBitcoin, faOpencart; CountPart: faBox, faDollar, faUser (2x) | react-loading-skeleton, react-moment, MessageToast |
| 15 | NetworkEditPage | Container, Row, Col, Card, Button, Form, InputGroup | Table | `mb-2/3`, `text-center`, `lc-block d-grid gap-3 d-md-block`, `d-grid gap-2 d-md-flex justify-content-md-end` | FA: 21 importados (faSave, faUpload, faPercent…) | **ImageModal**, moment |
| 16 | UserSearchPage | Container, Row, Col, **Table**, Button, Form, InputGroup, Dropdown, Pagination | — | `py-4`, `d-flex justify-content-center`, `spinner-border`, `text-success/danger`, `text-center` | FA: faArrowUp/Down, faCheck, faCheckCircle, faClose, faEdit, faPlus, faSearch, faTrash… (14) | — |
| 17 | OrderSearchPage | Container, Row, Col, **Table**, Button, InputGroup, Dropdown, Pagination | Form | `py-4`, `d-flex justify-content-center`, `spinner-border`, `text-center` | FA: faCalendar, faCancel, faDollar, faEdit, faEnvelope, faPlus, faSearch, faTrash | react-moment |
| 18 | InvoiceSearchPage | Container, Row, Col, **Table**, Button, InputGroup, Pagination | Dropdown | `d-flex justify-content-end/center`, `py-4`, `spinner-border`, `text-center` | FA: faCancel, faSync | react-moment |
| 19 | ProductSearchPage | Container, Row, Col, **Table**, Button, Form, InputGroup, Dropdown, Pagination | Breadcrumb | `py-4`, `d-flex justify-content-center`, `spinner-border`, `text-center` | FA: faCalendar, faDollar, faEdit, faEnvelope, faPlus, faSearch, faTrash | — |
| 20 | ProductEditPage | Container, Row, Col, Card, Button, Form (Select), InputGroup | Table | `mb-2/3`, `py-3`, `text-center`, `lc-block d-grid gap-3 d-md-block`, `d-grid gap-2 d-md-flex justify-content-md-end` | FA: 21 importados | **react-quill** (+ `quill.snow.css` + `CustomToolbar`), **ImageModal** (react-image-crop), moment |
| 21 | ProfileListPage | Container, Row, Col, **Table**, Button, InputGroup, Dropdown | Form | `py-4`, `d-flex justify-content-center`, `spinner-border` | FA: faCalendar, faDollar, faEdit, faPlus, faSearch, faTrash | **Único** uso do modo `MessageToastEnum.Confirmation` (Yes/No dentro do toast → ConfirmModal) |
| 22 | ProfileEditPage | Container, Row, Col, Card, Button, Form, InputGroup | — | `text-center mb-3`, `mb-3`, `d-grid gap-2 d-md-flex justify-content-md-end` | FA: faArrowLeft, faCalendar, faDollar, faLevelUp, faPercent, faSave, faUser | moment |
| 23 | PublicCampaignPage | Container, Row, Col, Card, Form (Check), Button, Spinner, Alert; e, por componentes, Card, Badge, Table | — | `py-4/py-5`, `mb-0…4`, `text-center`, `lead`, `text-muted`, `img-fluid rounded w-100`, `d-grid`, `d-flex gap-2 flex-wrap`, `btn btn-outline-secondary btn-sm`, `btn btn-outline-success btn-sm` (compartilhar) | — (os ícones vêm de EntryMethodCard) | EntryMethodCard, PrizeCard, CountdownTimer, LeaderboardTable. É a tela da meta de desempenho SC-005 |
| 24 | WidgetPage | **nenhum** | — | `spinner-border spinner-border-sm` (o resto é `style={}`, 8×) | — | Roda em iframe e depende do `bootstrap.min.css` global só para o spinner |
| 25 | Error404Page | Container, Row, Col, Card, CardBody | — | `page-wrap d-flex flex-row align-items-center py-5`, `justify-content-center`, `display-1 d-block`, `mb-4 lead`, `btn btn-link` | — | — |
| 26 | CheckoutPage (órfã) | Container, Row, Col, Card, Button | Form, InputGroup, Table | `text-center`, `py-4`, `lc-block d-grid gap-3 d-md-block`, `d-grid gap-2 d-md-flex justify-content-md-end` | FA: faBoltLightning, faCheck, faClose… (13 importados) | react-loading-skeleton, MessageToast |
| 27 | RequestAccessPage (órfã) | idem à CheckoutPage | Form, InputGroup, Table | idem | idem | idem |

### Componentes (`src/Components`)

| Componente | Usado por | react-bootstrap usados | Classes / ícones | Outras libs / notas |
|---|---|---|---|---|
| `Header` | `App.tsx` (Layout, todas as rotas aninhadas em `/`) | Navbar (Toggle, Collapse), Nav, NavDropdown (Item, Divider), Container. Button importado sem uso | `header d-flex align-items-center fixed-top`, `container-fluid container-xl position-relative`, `justify-content-between`, `me-auto me-xl-0`, `ms-auto justify-content-end`, `btn-getstarted`, `navmenu`, `sitename` (template). FA: faCircleUser, faClose, faHome, faImage, faLock, faMap, faPencil, faPlus, faSignInAlt | Usa MessageToast, ImageModal e `MenuLanguage`; lê `REACT_APP_PROJECT_NAME`. O menu móvel depende do `assets/js/main.js` |
| `Footer` | HomePage | nenhum (Container, Row e Col importados sem uso) | `container`, `row gy-4`, `col-lg-4 col-md-6`, `col-lg-2 col-md-3`, `d-flex align-items-center`, `pt-3`, `mt-3/4`, `px-1`, `text-center`. `bi-twitter-x`, `bi-facebook`, `bi-instagram`, `bi-linkedin`, `bi-arrow-up-short`. FA brands faFacebook, faInstagram e faTwitter importados | O texto é placeholder do template ("iLanding", telefone fictício) |
| `Functions` (`MenuLanguage`) | Header | NavDropdown (+Item) | `style={}` (2×) | Bandeiras via `process.env.PUBLIC_URL/flags/*.svg` |
| `MessageToast` | 15 telas (Login, User, Recovery, Password, Dashboard, NetworkEdit/Insert, Product*, Profile*, Order, Invoice, UserSearch, Checkout, RequestAccess) e Header | Toast, ToastContainer, Button | `p-3`, `me-auto`, `text-danger/success/info`, `mt-2 pt-2 border-top`. FA: faWarning, faInfo, faQuestionCircle | Toast controlado por estado. É trocado por `sonner` (skill `react-alert`), e o modo Confirmation vira ConfirmModal (skill `react-modal`) |
| `ImageModal` | Header, UserPage, NetworkEditPage, ProductEditPage | **Modal** (Header, Title, Body, Footer), Button `secondary/primary` | `size="lg"`, `input type="file"` | **react-image-crop** (+ CSS); `alert()` 3×. É o **único Modal** do app |
| `EntryMethodCard` | PublicCampaignPage | Card (Body), Button `success`/`outline-primary sm`, Badge `primary` | `d-flex align-items-center justify-content-between`, `me-2/3`, `mb-0/2`, `text-success`, `text-muted`, `small`. FA: faCheck, faArrowRight | — |
| `PrizeCard` | PublicCampaignPage | Card (Img `top`), Badge `secondary` | `mb-3 h-100`, `d-flex justify-content-between align-items-center`, `text-muted small` | — |
| `LeaderboardTable` | PublicCampaignPage | **Table** `sm`, Badge (bg dinâmico por posição) | `text-center text-muted`, `text-end` | `style={}` (2×) |
| `CountdownTimer` | PublicCampaignPage | nenhum | `d-flex justify-content-center gap-3`, `fs-3 fw-bold`, `text-muted`, `small`, `text-center` | — |
| `CustomToolbar` | ProductEditPage | nenhum | Classes `ql-*` do Quill, `<select>`. FA: faSave | react-quill |
| `ScriptLoader` | `App.tsx` | — | — | Injeta JS do Bootstrap, glightbox, swiper, purecounter e `main.js` |
| `ScrollToTop` | `index.tsx` | — | — | Sem parte visual |
| `SkeletonPage` | **ninguém** | Container, Row, Col | `py-5`, `mb-5` | react-loading-skeleton |
| `GalleryGrid` | **ninguém** | Row, Col, Card (Img, Body, Text), Button, Badge `light` | `position-relative/absolute`, `top-0 start-0`, `w-100 h-100`, `bg-dark`, `d-flex flex-column`, `flex-grow-1`, `mt-auto`, `text-white`, `text-danger`. FA: faHeart, faPlay | — |
| `ContestUpload` | **ninguém** | Card, Form (Group, Label, Control, Text), Button, Alert, Spinner | `mb-3/4`, `me-2`, `text-muted`. FA: faUpload | `input type="file"`; `process.env.REACT_APP_API_URL` |
| `EmbedCodeSection` | **ninguém** | nenhum | `card card-body card-title`, `form-control font-monospace`, `btn`, `text-muted` | `<textarea>` |
| `CampaignWidget` | **ninguém** | nenhum | `style={}` | `process.env.REACT_APP_API_URL` |
| `TrackingPixels`, `TemplateUtils`, `StringDictionary` | — / ninguém / DTO | — | — | Sem parte visual |

### Resumo

**Contagem pelas 27 telas do inventário**:

| Recurso | Telas | Quais |
|---|---|---|
| **Modal** | **3** diretas e todas as rotas do Layout via Header | `ImageModal` em UserPage, NetworkEditPage e ProductEditPage (e no Header). Nenhuma tela importa `react-bootstrap/Modal` diretamente. Mais **3 pontos de confirmação** que pedem ConfirmModal: `window.confirm` em CampaignSearchPage e ParticipantListPage (2×) e o modo Confirmation do toast em ProfileListPage |
| **Table** | **10** | NetworkList, UserSearch, OrderSearch, InvoiceSearch, ProductSearch, ProfileList, ParticipantList, Dashboard (StatementPart), WinnerSelection (HTML) e PublicCampaign (via LeaderboardTable). Outras 8 telas importam Table sem usar |
| **Form** (controles de formulário) | **17** | CampaignBuilder, CampaignSearch, Login, User, Recovery, Password, NetworkInsert, NetworkEdit, NetworkList, ParticipantList, ProductEdit, ProductSearch, ProfileEdit, PublicCampaign, SubmissionModeration, UserSearch e WinnerSelection (HTML `form-control/form-select`) |
| InputGroup | 16 | todas as telas de formulário e busca, menos CampaignBuilder, PublicCampaign, SubmissionModeration e WinnerSelection |
| Pagination | 7 | CampaignSearch, ParticipantList, Dashboard, UserSearch, OrderSearch, InvoiceSearch, ProductSearch |
| Dropdown | 5 telas + Header | CampaignSearch, UserSearch, OrderSearch, ProductSearch, ProfileList (filtro e ordenação); `NavDropdown` no Header e no `MenuLanguage` |
| Tabs | 2 | Dashboard (`Tabs`), CampaignBuilder (`Tab.Container` + `Nav` pills **vertical**) |
| Alert | 8 | CampaignBuilder, CampaignDetail, CampaignSearch, Dashboard, ParticipantList, Password, PublicCampaign, SubmissionModeration, mais WinnerSelection (HTML, dispensável) |
| Ícones `bi bi-*` | 2 arquivos | Só Hero (6) e Footer (5): 11 ícones no total. O `bootstrap-icons.css` (14,5 kB gzip) existe só para eles |
| FontAwesome | 36 arquivos | Biblioteca de ícones predominante: solid, regular não usado, e brands em 5 arquivos. Dezenas de ícones distintos são importados, vários sem uso |

**Cobertura dos componentes base de `data-model.md` §2**: a lista cobre Button, Input/Textarea/Select,
Checkbox, Card, Table, Modal, Alert, Toast, Tabs, Navbar, Pagination, Badge e Spinner/Skeleton.
Isso basta para a maior parte das telas. **Faltam**:

1. **`DropdownMenu`** (Radix DropdownMenu). É necessário no Header (menu do usuário e idioma) e nos
   filtros de 5 telas de busca. Nos filtros, um `Select` também resolve. No Header, não.
2. **`InputGroup`** ou props `leftAddon`/`rightAddon` no `Input`. Aparece em 16 telas, quase sempre
   com um ícone ou botão de busca grudado no campo.
3. **`Tabs` com `orientation="vertical"`**, para o wizard do CampaignBuilder (o Radix Tabs já suporta;
   basta prever na spec).
4. **`Alert` com `onClose`** (dispensável), por causa do WinnerSelectionPage.
5. **`FileInput`** para upload, usado em ImageModal e ContestUpload, e **`ColorInput`**, usado 3×
   no CampaignBuilder. Os dois podem ser variantes do `Input`, mas a spec precisa defini-los.
6. **`ListGroup`**: aparece só no Dashboard e pode virar `Card` com lista. É opcional.
7. **Layout (`Container`/grid)**: Row/Col aparecem em 32 arquivos. Não precisa de componente, mas
   convém um `PageContainer` (largura máxima e padding) para não repetir utilitários.
8. **Wrappers de libs de terceiros**: `RichTextEditor` (react-quill, ProductEditPage) e `ImageCropper`
   (react-image-crop). O CSS deles (`quill.snow.css`, `ReactCrop.css`) precisa conviver com os
   tokens Tailwind.
9. **`Avatar`**: `rounded-circle` em UserPage e UserPart. É opcional.

## Aprovação do design (T009)

**Aprovado pelo usuário em 2026-11-27**: design system "Bilhete Premiado" (`docs/design/`), sem
ajustes.

Decisões registradas junto com a aprovação:

- **Paleta padrão do Tailwind desligada** (`--color-*: initial`). Só existem os tokens do design
  system (SC-008 garantido no build).
- **Telas órfãs**: `CheckoutPage` e `RequestAccessPage` são **removidas**, junto com o import em
  `App.tsx`. Os 7 componentes sem uso (`SkeletonPage`, `GalleryGrid`, `ContestUpload`,
  `EmbedCodeSection`, `CampaignWidget`, `TrackingPixels` e `TemplateUtils`) são **migrados**.
- **Dependências extras aprovadas**: `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs` e
  `@radix-ui/react-alert-dialog`, além do `@radix-ui/react-dialog`.
- **Fontes self-hosted** com `@fontsource-variable/bricolage-grotesque`,
  `@fontsource-variable/figtree` e `@fontsource-variable/jetbrains-mono`. Sem Google Fonts em
  produção.
- **Altura do widget corrigida**: o iframe também encolhe. O formato do `postMessage` não muda (ver
  `contracts/widget-embed.md`).
- Os demais padrões do `ux-designer` também ficam valendo: sem modo escuro, FontAwesome, selects e
  checkboxes nativos com `accent-color`, cor da campanha só com contraste ≥ 4,5:1.

## Acessibilidade (T033)

Auditoria com axe-core 4.x (regras `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`), via puppeteer e o
Chrome do sistema, sobre o `vite preview`, em 2026-11-27. O `@axe-core/cli` não serviu porque o
ChromeDriver dele é incompatível com o Chrome instalado.

| Rota | Largura | Violações |
|---|---|---|
| `/c/abc` | 375 px | 0 |
| `/c/abc` | 1280 px | 0 |
| `/widget/abc` | 375 px | 0 |
| `/account/login` | 375 px | 0 |
| `/` | 1280 px | 0 |
| `/campaigns` | 1280 px | 0 |
| `/campaigns/new` | 1280 px | 0 |

⚠ A API não estava rodando, então `/c/:slug` e `/widget/:slug` foram auditadas no estado de
carregamento e erro, sem a campanha preenchida. É preciso repetir com uma campanha real durante a
regressão (T052).

## Desempenho pós-migração (T046)

Medido com `vite build` em 2026-11-27, depois do code-splitting por rota (`React.lazy`) e do chunk
`vendor-react`. O total é a soma, em gzip, de tudo que `/c/:slug` carrega no primeiro acesso: a
entrada, o `vendor-react`, o CSS e o chunk da `PublicCampaignPage` com seus imports estáticos.

| Recurso | Bytes (gzip) |
|---|---|
| `index-*.js` (entrada) | 142.336 |
| `vendor-react-*.js` | 53.977 |
| `index-*.css` | 12.880 |
| `PublicCampaignPage-*.js` + 9 chunks `ui/` compartilhados | 17.193 |
| **Total** | **226.386** |

**Resultado**: 226.386 contra 347.382 do baseline, **35% menor**. O SC-005 está atendido. Antes do
code-splitting eram cerca de 363.500 bytes, acima da meta. As fontes self-hosted (woff2, de 12 a
41 kB cada, carregadas sob demanda) ficam fora da conta, assim como as do baseline.

## Instalação, build e container (T045 / T051)

- `npm ci` sem flags: OK. `npm run build` (`tsc --noEmit` + `vite build`): OK, 0 erros.
  `npm test`: 38 testes passando (7 de componentes `ui/` e 31 de rotas).
- Grep do SC-002 (`react-bootstrap`, `bootstrap`, `react-scripts`, `REACT_APP_`, `process.env`,
  `%PUBLIC_URL%`, `assets/vendor`) em `src`, `index.html`, `package.json`, compose, `.env*.example`
  e `CLAUDE.md`: **vazio**.
- Docker no WSL2: `docker build ./frontend` OK. O container responde 200 em `/`, `/c/abc`,
  `/widget/abc`, `/campaigns/1/winners` (deep link), `/locales/pt/translation.json` e
  `/assets/img/favicon.png`. O nginx precisa que o host `viralt-api` resolva: no compose ele
  existe, e no teste isolado foi usado `--add-host`. Isso já era assim antes da migração.

## Regressão (T052)

_Pendente._
