# Data Model: Migração do frontend (003)

Não há entidades de banco nem mudanças na API. Os "modelos" desta feature são artefatos de
frontend e de design.

## 1. Design tokens (entregue pelo `ux-designer`)

Os tokens são definidos em `src/styles/theme.css`, dentro de `@theme`, e cada um gera utilitários
Tailwind.

| Grupo | Tokens (nomes semânticos) | Regra |
|---|---|---|
| Cor | `primary`, `primary-foreground`, `secondary`, `accent`, `background`, `surface`, `foreground`, `muted`, `muted-foreground`, `border`, `success`, `warning`, `danger`, `info` (cada um com `-foreground`) | Todo par texto/fundo tem ≥ 4,5:1, e texto grande e ícones têm ≥ 3:1 (FR-004a) |
| Tipografia | `font-sans`, `font-display`; escala `text-xs` … `text-4xl` | Escala única, sem tamanhos avulsos (SC-008) |
| Espaçamento | escala padrão do Tailwind (múltiplos de 4 px) | Alvo clicável mínimo de 44 px (`min-h-11`, `min-w-11`) |
| Raio | `radius-sm`, `radius-md`, `radius-lg`, `radius-full` | — |
| Sombra | `shadow-sm`, `shadow-md`, `shadow-lg` | — |
| Foco | `ring` (cor e largura do anel de foco) | Foco sempre visível, com `focus-visible:` |
| Movimento | durações `fast`, `base` | Animações só com `motion-safe:` |

## 2. Componentes base (`src/Components/ui/`)

| Componente | Variantes / props principais | Requisitos de acessibilidade |
|---|---|---|
| `Button` | `variant` (primary, secondary, outline, ghost, danger), `size` (sm, md, lg), `loading`, `asChild` (link) | Altura mínima de 44 px; `aria-busy` durante o loading; botão só de ícone exige `aria-label` |
| `Input`, `Textarea`, `Select` | `label`, `error`, `hint`, `required` | `<label htmlFor>`; erro ligado por `aria-describedby` e `aria-invalid` |
| `Checkbox`, `Radio` | `label`, `error` | Área clicável de 44 px incluindo o rótulo |
| `Card` | `header`, `footer` | — |
| `Table` | colunas e linhas, `empty`, `loading` | `<th scope>` e caption opcional |
| `Modal` | `open`, `onOpenChange`, `title`, `description`, `footer` | Radix Dialog: focus trap, `Esc` e devolução do foco (FR-009) |
| `Alert` | `variant` (success, warning, danger, info), `title` | `role="status"`/`aria-live="polite"`, ou `role="alert"` para erro; ícone além da cor |
| `Toast` | (sonner) `toast.success` / `toast.error` | `aria-live` |
| `Tabs` | `items` e `value` | Navegação por setas (padrão WAI-ARIA) |
| `Navbar` / `Sidebar` | itens, item ativo e menu móvel | `<nav aria-label>` e `aria-current="page"` |
| `Pagination` | `page`, `total`, `onChange` | `aria-label` e página atual anunciada |
| `Badge` | `variant` | Texto sempre presente (não depende só da cor) |
| `Spinner`, `Skeleton` | `size` | `role="status"` com texto para leitor de tela |

## 3. Inventário de telas (unidade do roteiro de regressão)

| # | Rota | Tela | Público | Ação principal a verificar |
|---|---|---|---|---|
| 1 | `/` | HomePage | público | Landing renderiza e os CTAs navegam |
| 2 | `/campaigns` | CampaignSearchPage | organizador | Lista e busca campanhas |
| 3 | `/campaigns/new` | CampaignBuilderPage | organizador | Cria campanha |
| 4 | `/campaigns/:id` | CampaignDetailPage | organizador | Exibe e edita campanha |
| 5 | `/campaigns/:id/participants` | ParticipantListPage | organizador | Lista participantes |
| 6 | `/campaigns/:id/submissions` | SubmissionModerationPage | organizador | Aprova ou rejeita envio |
| 7 | `/campaigns/:id/winners` | WinnerSelectionPage | organizador | Sorteia e notifica (resumo do notify-all) |
| 8 | `/network` | NetworkInsertPage | organizador | Cria rede |
| 9 | `/network/search` | NetworkListPage | organizador | Lista redes |
| 10 | `/account/login` | LoginPage | público | Login com sessão salva |
| 11 | `/account/new-account`, `/account/edit-account` | UserPage | público e organizador | Cadastro e edição de conta |
| 12 | `/account/recovery-password` | RecoveryPage | público | Pede recuperação |
| 13 | `/account/change-password` | PasswordPage | organizador | Troca a senha |
| 14 | `/admin/dashboard` | DashboardPage | organizador | Painel carrega os indicadores |
| 15 | `/admin/network` | NetworkEditPage | organizador | Edita rede |
| 16 | `/admin/teams[/:pageNum]` | UserSearchPage | organizador | Lista e pagina usuários |
| 17 | `/admin/orders` | OrderSearchPage | organizador | Lista pedidos |
| 18 | `/admin/invoices` | InvoiceSearchPage | organizador | Lista faturas |
| 19 | `/admin/products` | ProductSearchPage | organizador | Lista produtos |
| 20 | `/admin/products/new`, `/:id` | ProductEditPage | organizador | Cria e edita produto (editor rich text e crop de imagem) |
| 21 | `/admin/team-structure` | ProfileListPage | organizador | Lista perfis |
| 22 | `/admin/team-structure/new`, `/:id` | ProfileEditPage | organizador | Cria e edita perfil |
| 23 | `/c/:slug` | PublicCampaignPage | participante | Inscrição completa |
| 24 | `/widget/:slug` | WidgetPage | participante | Inscrição no iframe; `postMessage` de altura |
| 25 | `*` | Error404Page | público | 404 renderiza |
| 26 | (sem rota em `App.tsx`) | CheckoutPage | — | Confirmar se é usada; se for órfã, registrar no relatório |
| 27 | (sem rota em `App.tsx`) | RequestAccessPage | — | Idem |

**Estado de migração por tela**: `pendente` → `migrada` (sem imports do react-bootstrap e só com
componentes `ui/`) → `verificada` (passou no roteiro funcional e confere com o mockup ou
especificação).

## 4. Variáveis de ambiente do frontend

| Variável | Obrigatória | Uso |
|---|---|---|
| `VITE_API_URL` | Sim, se houver API em outra origem | Base das chamadas; vazio usa a mesma origem |
| `VITE_SITE_BASENAME` | Não | `base` do Vite e `basename` do `BrowserRouter` |
| `VITE_PROJECT_NAME` | Não | Nome exibido |
| `import.meta.env.PROD` | — | Substitui `REACT_APP_PRODUCTION` |
