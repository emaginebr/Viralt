# Viralt Design System: "Bilhete Premiado"

Pacote de design da feature `specs/003-frontend-vite-tailwind` (tarefas T004–T008). É o ponto único
de consumo para o `react-developer`. **Status: aguardando aprovação (T009).**

| Artefato | Propósito | Origem |
|---|---|---|
| [`tokens.md`](./tokens.md) | Direção visual, tokens semânticos, tipografia, raios, sombras, foco, movimento e tabela de contraste WCAG | T004 · `ui-ux-pro-max`, `design-system` |
| [`theme.css`](./theme.css) | `@theme` do Tailwind 4 e utilitários `ticket`, `perforation` e `focus-ring`. Copiar para `frontend/src/styles/theme.css` | T005 · `design-system` |
| [`components.md`](./components.md) | Spec dos componentes base §1–18 e dos itens do inventário T003 §19–29 (DropdownMenu, InputGroup, FileInput, ColorInput, Quill, Crop, ConfirmModal, Avatar, List, PageContainer, Header público e Home) | T006 · `ui-styling` |
| [`mockups/public-campaign.html`](./mockups/public-campaign.html) | Página pública: board com desktop 1280 e mobile 375 (erro de campo e sucesso). `?frame=1` abre a página sozinha | T007 |
| [`mockups/widget.html`](./mockups/widget.html) | Widget dentro de um site hospedeiro com CSS agressivo, e mobile 375 no estado de sucesso | T007 |
| [`mockups/admin-list.html`](./mockups/admin-list.html) | Layout do painel com sidebar, top bar, menus e drawer, mais a lista de campanhas (busca, filtros, badges, paginação, alerta e ConfirmModal via "⋮ → Excluir" ou `?modal=delete`) | T008 |
| [`mockups/admin-form.html`](./mockups/admin-form.html) | Construtor de campanha: abas verticais, validação, radio cards, ColorInput, FileInput, editor rico e modal de publicação aberto | T008 |
| [`mockups/home.html`](./mockups/home.html) | Landing (Hero, Como funciona, Recursos, Preços, CTA e Footer) com o menu móvel | Pedido extra (inventário T003) |

Os mockups abrem direto no navegador. Eles carregam Tailwind 4 (browser), Google Fonts e
FontAwesome via CDN, e o `@theme` embutido é cópia literal de `theme.css`.
