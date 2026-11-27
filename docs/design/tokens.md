# Viralt Design System: tokens (T004)

> Feature `003-frontend-vite-tailwind`. Fonte única dos tokens: [`theme.css`](./theme.css), que vira
> `frontend/src/styles/theme.css`. Os componentes estão em [`components.md`](./components.md), e os
> mockups em [`mockups/`](./mockups/).

## 1. Direção visual: "Bilhete Premiado"

**Ideia central.** O Viralt vende a emoção de concorrer a um prêmio. A metáfora visual é o **bilhete
de rifa**: recortes laterais, linha picotada, número em destaque e um carimbo amarelo de pontos. A
metáfora fica no lado **público** (página da campanha e widget), onde a conversão importa. O
**painel** usa a mesma paleta e a mesma tipografia num registro sóbrio e denso, porque é uma
ferramenta de trabalho.

| Eixo | Decisão | Por quê |
|---|---|---|
| Personalidade | Pop editorial: confiante, festivo e direto, mas não infantil | Precisa transmitir que o sorteio é legítimo (confiança) e dar vontade de participar (energia). |
| Estilo | Flat com **sombra dura "pop"** (`4px 4px 0` em tinta) só nos CTAs e nos bilhetes de prêmio. Sombras suaves no painel | A sombra dura chama atenção para a ação principal sem gradientes nem glow. O painel não precisa disso. |
| Fundo | Papel quente `#FFF8F1`, com superfícies brancas por cima | Tira a frieza do branco puro e faz os cards se destacarem sem sombra pesada. |
| Cor de marca | **Framboesa** `#C2185B` | É vibrante, lê como "prêmio e celebração" e não é o roxo genérico de SaaS. Com branco, dá 5,87:1 (AA também como texto). |
| Contraponto | **Uva escura** `#2B2250` | Dá peso e confiança: sidebar, botão secundário, página atual. |
| Destaque | **Amarelo bilhete** `#FFC738` | Pontos, carimbos e o item ativo da sidebar. **Nunca é usado como texto**, só como fundo com tinta por cima (11,54:1). |
| Tipografia | **Bricolage Grotesque** (display) e **Figtree** (texto) | A Bricolage tem personalidade de cartaz e números expressivos, ótimos para contagem regressiva e prêmios. A Figtree é geométrica, amigável e muito legível a 16 px, e cobre os acentos de pt, es e en. |
| Ícones | FontAwesome 6 Solid (já usado no projeto) | Um único estilo, com peso consistente. Ícone sempre acompanhado de texto ou de `aria-label`. |

**O que esta direção evita**: Inter com gradiente roxo, glassmorphism, emojis como ícones, cartões
sem hierarquia e cor como único portador de informação.

### 1.1 Personalização por campanha

A campanha tem `themePrimaryColor`, `themeBgColor` e `themeFont`. A página pública e o widget
aplicam a cor do organizador **sobrescrevendo o token** no contêiner da campanha:

```html
<div style="--color-primary:#0A7B83; --color-primary-hover:#08646B; --color-primary-foreground:#FFFFFF">
```

Regra de segurança (validada em runtime pelo `react-developer`):

1. `primary-foreground` passa a ser `#FFFFFF` ou `#1A1423`, o que tiver mais contraste com a cor do
   organizador.
2. Se mesmo assim o contraste ficar **abaixo de 4,5:1**, a cor do organizador é ignorada e o
   framboesa padrão fica.
3. `primary-hover` é a cor do organizador escurecida 15% (`color-mix(in oklab, X 85%, black)`).
4. A cor do organizador só é usada como **preenchimento** (botão, barra de progresso, borda ativa),
   nunca como cor de texto corrido. Links continuam sublinhados em `foreground`.
5. `themeBgColor` só é aplicado se `foreground` tiver ≥ 4,5:1 sobre ele. Caso contrário, vale
   `background`.

## 2. Fontes

| Papel | Família | Pesos | Token |
|---|---|---|---|
| Display (h1–h3, números, contagem regressiva) | Bricolage Grotesque (variável, eixo `opsz`) | 600–800 | `--font-display` → `font-display` |
| Texto e UI | Figtree (variável) | 400–700 | `--font-sans` → `font-sans` |
| Código (código de embed, slug, IDs de pixel) | JetBrains Mono | 400, 600 | `--font-mono` → `font-mono` |

Link do Google Fonts (`display=swap`, sem FOIT):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Figtree:wght@400..700&family=JetBrains+Mono:wght@400;600&display=swap">
```

Para produção, recomendo usar `@fontsource-variable/figtree` e
`@fontsource-variable/bricolage-grotesque` (self-host, sem request a terceiros). A JetBrains Mono
pode ser carregada só no painel. Essa escolha precisa de aprovação (ver §9).

## 3. Cores

### 3.1 Tokens semânticos

| Token | Hex | Utilitários | Uso |
|---|---|---|---|
| `background` | `#FFF8F1` | `bg-background` | Fundo da página |
| `foreground` | `#1A1423` | `text-foreground` | Texto principal |
| `surface` | `#FFFFFF` | `bg-surface` | Cards, inputs, tabelas, modais |
| `surface-foreground` | `#1A1423` | `text-surface-foreground` | Texto sobre surface |
| `muted` | `#F4ECE4` | `bg-muted` | Faixas, cabeçalho de tabela, hover neutro, skeleton |
| `muted-foreground` | `#5C5266` | `text-muted-foreground` | Texto secundário, placeholder, ajuda |
| `border` | `#E7DCD1` | `border-border` | Divisores e contorno de cards (decorativo) |
| `input` | `#8C8194` | `border-input` | Contorno de **controles** (input, select, checkbox, botão outline): ≥ 3:1 |
| `overlay` | `#1A1423` | `bg-overlay/60`, `bg-overlay/72` | Scrim do modal e do hero |
| `primary` | `#C2185B` | `bg-primary`, `text-primary`, `border-primary` | CTA, aba ativa, seleção |
| `primary-hover` | `#9E1049` | `hover:bg-primary-hover` | Hover e pressionado do CTA |
| `primary-foreground` | `#FFFFFF` | `text-primary-foreground` | Texto sobre primary |
| `primary-subtle` | `#FCE4EE` | `bg-primary-subtle` | Fundo de item selecionado e realce suave |
| `secondary` | `#2B2250` | `bg-secondary` | Sidebar, botão secundário, página atual da paginação |
| `secondary-hover` | `#3C3270` | `hover:bg-secondary-hover` | Hover sobre secondary |
| `secondary-foreground` | `#FFFFFF` | `text-secondary-foreground` | Texto sobre secondary |
| `secondary-muted-foreground` | `#CFC7EA` | `text-secondary-muted-foreground` | Texto secundário na sidebar |
| `accent` | `#FFC738` | `bg-accent` | Selo de pontos, item ativo da sidebar, destaque |
| `accent-hover` | `#F2B517` | `hover:bg-accent-hover` | Hover sobre accent |
| `accent-foreground` | `#1A1423` | `text-accent-foreground` | Texto sobre accent |
| `accent-subtle` | `#FFF1C7` | `bg-accent-subtle` | Fundo de aviso festivo ("faltam 2 dias") |
| `success` | `#13703A` | `bg-success`, `text-success` | Ícone e texto de sucesso, botão "Concluído" |
| `success-hover` | `#0E5A2E` | `hover:bg-success-hover` | — |
| `success-foreground` | `#FFFFFF` | `text-success-foreground` | — |
| `success-subtle` | `#E3F3E8` | `bg-success-subtle` | Fundo de Alert e Badge de sucesso |
| `warning` | `#8F5200` | `text-warning`, `bg-warning` | Ícone e texto de atenção |
| `warning-foreground` | `#FFFFFF` | — | — |
| `warning-subtle` | `#FFF0D1` | `bg-warning-subtle` | Fundo de Alert e Badge de atenção |
| `danger` | `#B42318` | `text-danger`, `bg-danger`, `border-danger` | Erro de campo, ação destrutiva |
| `danger-hover` | `#8F1B12` | `hover:bg-danger-hover` | — |
| `danger-foreground` | `#FFFFFF` | — | — |
| `danger-subtle` | `#FDE7E4` | `bg-danger-subtle` | Fundo de Alert de erro |
| `info` | `#1F57C3` | `text-info`, `bg-info` | Ícone e texto informativo |
| `info-foreground` | `#FFFFFF` | — | — |
| `info-subtle` | `#E3ECFC` | `bg-info-subtle` | Fundo de Alert informativo |
| `ring` | `#2B5BDB` | `outline-ring`, `ring-ring` | Anel de foco em fundos claros |
| `ring-inverse` | `#FFC738` | `outline-ring-inverse` | Anel de foco na sidebar e sobre o overlay |

> A paleta padrão do Tailwind é **desligada** (`--color-*: initial`). Só estes tokens geram
> utilitários. Isso garante o SC-008 no próprio build: `bg-red-500` simplesmente não existe.

### 3.2 Por que o `danger` não se confunde com o `primary`

O framboesa (`#C2185B`) puxa para o rosa e o `danger` (`#B42318`) puxa para o laranja. Mesmo assim,
erro **nunca** é comunicado só pela cor: tem sempre o ícone `fa-circle-exclamation`, texto explícito
("Informe um e-mail válido") e `aria-invalid`.

## 4. Tabela de contraste (WCAG 2.1)

Calculada com a fórmula de luminância relativa da WCAG 2.1. **Mínimos**: texto normal ≥ 4,5:1;
texto grande (≥ 24 px, ou ≥ 18,66 px em negrito), ícones e bordas de controle ≥ 3:1 (SC 1.4.11).

### 4.1 Texto sobre fundos neutros

| Texto | Fundo | Razão | Mín. | Resultado |
|---|---|---|---|---|
| `foreground` #1A1423 | `background` #FFF8F1 | 17,08:1 | 4,5 | AAA |
| `foreground` #1A1423 | `surface` #FFFFFF | 17,98:1 | 4,5 | AAA |
| `foreground` #1A1423 | `muted` #F4ECE4 | 15,38:1 | 4,5 | AAA |
| `muted-foreground` #5C5266 | `background` #FFF8F1 | 6,99:1 | 4,5 | AA |
| `muted-foreground` #5C5266 | `surface` #FFFFFF | 7,36:1 | 4,5 | AAA |
| `muted-foreground` #5C5266 | `muted` #F4ECE4 | 6,30:1 | 4,5 | AA |
| `muted-foreground` #5C5266 | `primary-subtle` #FCE4EE | 6,12:1 | 4,5 | AA |
| `muted-foreground` #5C5266 | `accent-subtle` #FFF1C7 | 6,54:1 | 4,5 | AA |
| `muted-foreground` #5C5266 | `success-subtle` #E3F3E8 | 6,40:1 | 4,5 | AA |
| `muted-foreground` #5C5266 | `danger-subtle` #FDE7E4 | 6,21:1 | 4,5 | AA |

### 4.2 Texto sobre cores de marca e de estado (botões, badges sólidos)

| Texto | Fundo | Razão | Mín. | Resultado |
|---|---|---|---|---|
| `primary-foreground` #FFFFFF | `primary` #C2185B | 5,87:1 | 4,5 | AA |
| `primary-foreground` #FFFFFF | `primary-hover` #9E1049 | 8,00:1 | 4,5 | AAA |
| `secondary-foreground` #FFFFFF | `secondary` #2B2250 | 14,51:1 | 4,5 | AAA |
| `secondary-foreground` #FFFFFF | `secondary-hover` #3C3270 | 11,16:1 | 4,5 | AAA |
| `secondary-muted-foreground` #CFC7EA | `secondary` #2B2250 | 8,99:1 | 4,5 | AAA |
| `secondary-muted-foreground` #CFC7EA | `secondary-hover` #3C3270 | 6,91:1 | 4,5 | AA |
| `accent-foreground` #1A1423 | `accent` #FFC738 | 11,54:1 | 4,5 | AAA |
| `accent-foreground` #1A1423 | `accent-hover` #F2B517 | 9,76:1 | 4,5 | AAA |
| `accent` #FFC738 (item ativo, foco) | `secondary` #2B2250 | 9,31:1 | 3 | AAA |
| `success-foreground` #FFFFFF | `success` #13703A | 6,16:1 | 4,5 | AA |
| `success-foreground` #FFFFFF | `success-hover` #0E5A2E | 8,33:1 | 4,5 | AAA |
| `warning-foreground` #FFFFFF | `warning` #8F5200 | 6,22:1 | 4,5 | AA |
| `danger-foreground` #FFFFFF | `danger` #B42318 | 6,57:1 | 4,5 | AA |
| `danger-foreground` #FFFFFF | `danger-hover` #8F1B12 | 9,00:1 | 4,5 | AAA |
| `info-foreground` #FFFFFF | `info` #1F57C3 | 6,54:1 | 4,5 | AA |

### 4.3 Cor de estado como texto (alertas, badges suaves, erro de campo)

| Texto | Fundo | Razão | Mín. | Resultado |
|---|---|---|---|---|
| `primary` #C2185B | `surface` #FFFFFF | 5,87:1 | 4,5 | AA |
| `primary` #C2185B | `background` #FFF8F1 | 5,58:1 | 4,5 | AA |
| `primary` #C2185B | `muted` #F4ECE4 | 5,02:1 | 4,5 | AA |
| `primary` #C2185B | `primary-subtle` #FCE4EE | 4,89:1 | 4,5 | AA |
| `primary` #C2185B | `accent-subtle` #FFF1C7 | 5,22:1 | 4,5 | AA |
| `success` #13703A | `success-subtle` #E3F3E8 | 5,36:1 | 4,5 | AA |
| `success` #13703A | `surface` #FFFFFF | 6,16:1 | 4,5 | AA |
| `success` #13703A | `background` #FFF8F1 | 5,86:1 | 4,5 | AA |
| `warning` #8F5200 | `warning-subtle` #FFF0D1 | 5,52:1 | 4,5 | AA |
| `warning` #8F5200 | `surface` #FFFFFF | 6,22:1 | 4,5 | AA |
| `warning` #8F5200 | `background` #FFF8F1 | 5,91:1 | 4,5 | AA |
| `danger` #B42318 | `danger-subtle` #FDE7E4 | 5,55:1 | 4,5 | AA |
| `danger` #B42318 | `surface` #FFFFFF | 6,57:1 | 4,5 | AA |
| `danger` #B42318 | `background` #FFF8F1 | 6,25:1 | 4,5 | AA |
| `danger` #B42318 | `muted` #F4ECE4 | 5,62:1 | 4,5 | AA |
| `info` #1F57C3 | `info-subtle` #E3ECFC | 5,51:1 | 4,5 | AA |
| `info` #1F57C3 | `surface` #FFFFFF | 6,54:1 | 4,5 | AA |
| `info` #1F57C3 | `background` #FFF8F1 | 6,22:1 | 4,5 | AA |
| `foreground` #1A1423 | `success-subtle` #E3F3E8 | 15,62:1 | 4,5 | AAA |
| `foreground` #1A1423 | `warning-subtle` #FFF0D1 | 15,95:1 | 4,5 | AAA |
| `foreground` #1A1423 | `danger-subtle` #FDE7E4 | 15,17:1 | 4,5 | AAA |
| `foreground` #1A1423 | `info-subtle` #E3ECFC | 15,13:1 | 4,5 | AAA |
| `foreground` #1A1423 | `primary-subtle` #FCE4EE | 14,95:1 | 4,5 | AAA |
| `foreground` #1A1423 | `accent-subtle` #FFF1C7 | 15,97:1 | 4,5 | AAA |

### 4.4 Componentes não textuais (SC 1.4.11, mínimo 3:1)

| Elemento | Contra | Razão | Resultado |
|---|---|---|---|
| Borda de controle `input` #8C8194 | `surface` #FFFFFF | 3,70:1 | OK |
| Borda de controle `input` #8C8194 | `background` #FFF8F1 | 3,51:1 | OK |
| Anel de foco `ring` #2B5BDB | `background` #FFF8F1 | 5,51:1 | OK |
| Anel de foco `ring` #2B5BDB | `surface` #FFFFFF | 5,80:1 | OK |
| Anel de foco `ring-inverse` #FFC738 | `secondary` #2B2250 | 9,31:1 | OK |
| Anel de foco `ring-inverse` #FFC738 | `foreground`/`overlay` #1A1423 | 11,54:1 | OK |
| Botão `primary` #C2185B | `surface` #FFFFFF | 5,87:1 | OK |

> O anel de foco usa `outline-offset: 2px`. Por isso ele sempre encosta no fundo da página, nunca
> no próprio botão, e a razão relevante é a do anel contra o fundo. Isso vale também sobre o botão
> framboesa.
>
> O `border` #E7DCD1 (1,35:1) é **decorativo**: só separa cards e linhas de tabela, que também têm
> espaçamento e mudança de fundo. Ele **nunca** é o único limite de um controle interativo, papel
> que é do `input`.

### 4.5 Texto sobre imagem (hero)

O título do hero fica sobre a foto da campanha, com um scrim em gradiente de `overlay/0` a
`overlay/72` (de cima para baixo). O texto fica sempre no terço inferior, onde a opacidade é ≥ 72%.

| Texto | Pior caso de fundo | Fundo efetivo | Razão |
|---|---|---|---|
| `#FFFFFF` | foto branca sob scrim 72% | #5A5661 | 7,15:1 |
| `#FFFFFF` | foto amarela sob scrim 72% | #5A4629 | 8,96:1 |

### 4.6 Estado desabilitado

Controles desabilitados usam `opacity-50` e o atributo `disabled`. A WCAG 1.4.3 isenta componentes
inativos. Mesmo assim, o rótulo continua legível (`foreground` a 50% sobre `surface` dá cerca de
3,4:1).

## 5. Tipografia

| Token | Tamanho / altura | Fonte e peso | Uso |
|---|---|---|---|
| `text-xs` | 12 / 16 px | sans 600 | Badge, cabeçalho de tabela (maiúsculas), legenda. **Nunca** para texto corrido |
| `text-sm` | 14 / 20 px | sans 400–600 | Texto de tabela, ajuda de campo, erro de campo, metadados |
| `text-base` | 16 / 24 px | sans 400 | Corpo e inputs (16 px evita o zoom automático do iOS) |
| `text-lg` | 18 / 28 px | sans 500 / display 700 | Lead, título de card, botão `lg` |
| `text-xl` | 20 / 28 px | display 700 | Título de seção no painel, título do modal |
| `text-2xl` | 24 / 32 px | display 700 | Título de página no painel, h2 público no mobile |
| `text-3xl` | 30 / 36 px | display 800 | h1 público no mobile, números da contagem regressiva |
| `text-4xl` | 36 / 40 px | display 800 | h2 público no desktop |
| `text-5xl` | 48 px / 1,05 | display 800 | Só o h1 do hero no desktop |

Regras:

- Números de contagem, pontos, preços e colunas numéricas usam `tabular-nums`.
- Corpo com 60 a 75 caracteres por linha (`max-w-prose`).
- Hierarquia por peso: título 700–800, rótulo 600, corpo 400.
- `letter-spacing` negativo só do `text-2xl` para cima, já embutido no token.
- Maiúsculas só em `text-xs` com `tracking-wide` (rótulos de tabela e eyebrows).

## 6. Espaçamento, raios e sombras

**Espaçamento**: escala padrão do Tailwind 4 (`--spacing: 0.25rem`, múltiplos de 4 px).

| Nível | Valor | Exemplo |
|---|---|---|
| Interno de controle | `px-3` a `px-6` | Input, botão |
| Entre campos | `gap-5` (20 px) | Formulário |
| Dentro do card | `p-5` (mobile) e `p-6` (desktop) | Card |
| Entre seções | `py-10` (mobile) e `py-16` (desktop) | Página pública |
| Alvo mínimo | `min-h-11` e `min-w-11` (44 px) | Tudo que é clicável |
| Entre alvos | `gap-2` (8 px) ou mais | Grupo de botões |

**Raios**

| Token | Valor | Uso |
|---|---|---|
| `rounded-sm` | 6 px | Checkbox, badge retangular |
| `rounded-md` | 10 px | Botão, input, select, alert |
| `rounded-lg` | 16 px | Card, tabela, modal |
| `rounded-xl` | 24 px | Hero, contêiner do widget |
| `rounded-full` | pílula | Badge de status, avatar, selo de pontos |

**Sombras**

| Token | Uso |
|---|---|
| `shadow-sm` | Card em repouso no painel |
| `shadow-md` | Dropdown, card em hover, toast |
| `shadow-lg` | Modal, drawer |
| `shadow-pop` | CTA principal público ("Participar agora") e bilhete de prêmio |
| `shadow-pop-sm` | Selo de pontos e ações de entrada concluídas |

**Utilitários de forma** (definidos em `theme.css`):

- `ticket`: recortes semicirculares laterais. A posição vem de `--ticket-at` e o raio de
  `--ticket-notch`.
- `perforation`: linha picotada de 2 px em `border`.
- `focus-ring`: anel de foco padrão, para elementos sem variantes próprias.

## 7. Foco

```
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
```

- 2 px sólido, com offset de 2 px, em `ring` (#2B5BDB).
- Sobre `secondary` (sidebar) e sobre o overlay, usar `focus-visible:outline-ring-inverse`.
- Use `outline` e não `box-shadow`, porque o outline continua visível no modo de alto contraste do
  Windows (`forced-colors`).
- O foco nunca é removido sem substituto (`outline-none` é proibido sem outro indicador).
- Inputs mostram o anel em qualquer foco, porque o navegador trata o foco de campo de texto como
  `:focus-visible`.

## 8. Movimento

| Token | Valor | Utilitário | Uso |
|---|---|---|---|
| `--duration-fast` | 150 ms | `duration-150` | Cor, hover, foco |
| `--duration-base` | 200 ms | `duration-200` | Modal, toast, troca de aba |
| `--duration-slow` | 300 ms | `duration-300` | Skeleton para conteúdo, confirmação de inscrição |
| `--ease-snappy` | `cubic-bezier(.2,.8,.2,1)` | `ease-snappy` | Entradas |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` | `ease-exit` | Saídas (cerca de 70% da duração da entrada) |
| `--animate-fade-in` | 200 ms | `motion-safe:animate-fade-in` | Overlay |
| `--animate-pop-in` | 200 ms | `motion-safe:animate-pop-in` | Modal, toast, selo "+5 pts" |
| `--animate-slide-in-left` | 200 ms | `motion-safe:animate-slide-in-left` | Drawer mobile |
| `--animate-spin` | 0,8 s | `motion-safe:animate-spin` | Spinner |
| `--animate-pulse` | 1,6 s | `motion-safe:animate-pulse` | Skeleton |

Regras:

- Toda animação usa o prefixo `motion-safe:`.
- O `theme.css` tem uma rede de segurança global para `prefers-reduced-motion: reduce`, que cobre
  o sonner e o Radix.
- Só se anima `opacity` e `transform`.
- Nada de parallax, scroll-jacking ou entrada animada de seções. O AOS sai (research R7).
- Os dígitos da contagem regressiva trocam sem animação.

## 9. Decisões que precisam de aprovação

1. **Paleta framboesa + uva + amarelo** e o fundo papel quente, em vez de branco puro.
2. **Sombra dura "pop"** só no lado público. O painel usa sombras suaves.
3. **Desligar a paleta padrão do Tailwind** (`--color-*: initial`). Isso é mais rígido e exige
   que toda cor venha de um token.
4. **Fontes**: Google Fonts nos mockups, e em produção self-host via `@fontsource-variable`.
5. **Tema da campanha**: a cor do organizador sobrescreve `--color-primary` só quando passa no
   contraste (§1.1). Senão, fica o framboesa.
6. **Sem modo escuro nesta entrega.** Os tokens são semânticos, então o dark mode pode entrar
   depois só redefinindo as variáveis num `[data-theme=dark]`.
