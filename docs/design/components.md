# Viralt Design System: componentes base (T006)

> Os tokens estão em [`tokens.md`](./tokens.md) e [`theme.css`](./theme.css). Destino:
> `frontend/src/Components/ui/`, no padrão shadcn/ui (componentes próprios, variantes por props e
> `clsx` para compor classes). Os modais usam `@radix-ui/react-dialog`, os toasts usam `sonner` e os
> ícones são FontAwesome 6 Solid (`@fortawesome/react-fontawesome`).
>
> Esta é uma especificação de design, não código React. A implementação é do
> `react-developer`.

## 0. Convenções comuns

**Anel de foco** (aplicado em todo elemento interativo):

```
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
```

Sobre `bg-secondary` ou `bg-overlay`, trocar `outline-ring` por `outline-ring-inverse`.

**Alvo de toque**: todo elemento clicável tem `min-h-11` (44 px). Botões só de ícone usam `size-11`.
Quando o visual precisa ser menor (por exemplo, o X de fechar um Alert), o elemento mantém
`size-11` e o ícone fica centralizado. Nunca se reduz a área clicável.

**Desabilitado**: atributo nativo `disabled`, mais `disabled:opacity-50 disabled:pointer-events-none`.
Elementos que não são `<button>` usam `aria-disabled="true"`.

**Loading**: `aria-busy="true"` no elemento que carrega, Spinner com texto e o controle desabilitado.
O rótulo muda para o gerúndio ("Enviando…"), e a largura não pode encolher (`min-w` igual ao do
estado normal).

**Erro de campo**: `aria-invalid="true"` no controle e `aria-describedby="{id}-error"`. A mensagem
fica logo abaixo do campo, com ícone e texto. Depois de um submit inválido, o foco vai para o
primeiro campo com erro.

**Ícones**: decorativos com `aria-hidden="true"`. Botão só de ícone exige `aria-label`, e o rótulo
traduzido vem do i18n.

**Textos**: todos via i18next (pt-BR, en e es). Prever cerca de 30% a mais de largura para o
espanhol. Nenhum componente usa largura fixa para texto.

**Cursor**: `cursor-pointer` em tudo que é clicável. `cursor-not-allowed` não é usado, porque os
desabilitados têm `pointer-events-none`.

---

## 1. Button

**Base**

```
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-semibold
cursor-pointer select-none transition-colors duration-150 ease-snappy
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
disabled:pointer-events-none disabled:opacity-50 aria-busy:cursor-progress
motion-safe:active:translate-y-px
```

**Variantes** (`variant`)

| Variante | Classes | Uso |
|---|---|---|
| `primary` | `bg-primary text-primary-foreground hover:bg-primary-hover` | A ação principal da tela (**uma por tela**) |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary-hover` | Ação forte, mas não principal ("Sortear vencedores") |
| `outline` | `border border-input bg-surface text-foreground hover:bg-muted` | Ações secundárias ("Cancelar", "Anterior") |
| `ghost` | `bg-transparent text-foreground hover:bg-muted` | Ações terciárias, ícones da tabela |
| `danger` | `bg-danger text-danger-foreground hover:bg-danger-hover` | Exclusão, sempre com confirmação em Modal |
| `accent` | `bg-accent text-accent-foreground hover:bg-accent-hover` | Ações de entrada na página pública ("Seguir +5") |

**Modificador público** `pop` (booleano, só na página pública e no widget): acrescenta
`shadow-pop border-2 border-foreground motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:shadow-pop-sm`.
É usado no CTA "Participar agora".

**Tamanhos** (`size`)

| Tamanho | Classes | Observação |
|---|---|---|
| `sm` | `min-h-11 px-3 text-sm` | Visual compacto, mas o alvo continua com 44 px |
| `md` (padrão) | `min-h-11 px-4 text-base` | — |
| `lg` | `min-h-13 px-6 text-lg` | CTA público, 52 px |
| `icon` | `size-11 p-0` | Exige `aria-label` |

**Props**: `variant`, `size`, `pop`, `loading`, `leftIcon`, `rightIcon`, `fullWidth` (`w-full`) e
`asChild` (renderiza um `<a>` ou `<Link>` com as mesmas classes).

**Estados**

| Estado | Comportamento |
|---|---|
| hover | Cor `*-hover`, transição de 150 ms. No `pop`, sobe 2 px (só com `motion-safe`) |
| focus-visible | Anel `ring`, 2 px, com offset de 2 px |
| active | Desce 1 px (`motion-safe`) |
| disabled | `opacity-50`, sem ponteiro, atributo `disabled` |
| loading | Spinner `size-4` no lugar do `leftIcon`, rótulo "Enviando…", `aria-busy="true"` e `disabled` |
| error | Não se aplica. Erros aparecem no Alert ou no campo |

**Acessibilidade**

- Elemento nativo `<button type="button|submit">`. Para navegação, `<a>` via `asChild`.
- Botão só de ícone: `aria-label` obrigatório e `title` opcional.
- Ação destrutiva: sempre abre um Modal de confirmação e fica separada das ações neutras por
  `gap-2` ou mais (de preferência no fim do grupo).
- Toggle: `aria-pressed`.

---

## 2. Input

**Estrutura**: `Field` (wrapper) com `Label`, o controle, `Hint` e `ErrorMessage`.

```html
<div class="flex flex-col gap-1.5">
  <label for="email" class="text-sm font-semibold text-foreground">
    E-mail <span class="text-danger" aria-hidden="true">*</span><span class="sr-only">(obrigatório)</span>
  </label>
  <input id="email" type="email" autocomplete="email" required
         aria-invalid="true" aria-describedby="email-hint email-error" class="…">
  <p id="email-hint" class="text-sm text-muted-foreground">Vamos avisar por aqui se você ganhar.</p>
  <p id="email-error" class="flex items-start gap-1.5 text-sm font-medium text-danger">
    <i class="fa-solid fa-circle-exclamation mt-0.5" aria-hidden="true"></i>Informe um e-mail válido, como nome@exemplo.com.
  </p>
</div>
```

**Classes do controle**

```
block w-full min-h-11 rounded-md border border-input bg-surface px-3 py-2
text-base text-foreground placeholder:text-muted-foreground
transition-colors duration-150 hover:border-foreground
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:border-ring
disabled:opacity-50 disabled:pointer-events-none
read-only:bg-muted read-only:border-border
aria-[invalid=true]:border-danger aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-danger
```

**Props**: `label` (obrigatória), `hint`, `error`, `required`, `leftIcon` (por exemplo, a lupa da
busca), `rightSlot` (por exemplo, o botão "mostrar senha") e todos os atributos nativos.

**Variantes**: `default` e `search`. O `search` usa `leftIcon` `fa-magnifying-glass` com
`pl-10`, `type="search"` e o rótulo pode ficar visualmente oculto (`sr-only`), mas precisa existir.

**Tamanho**: único (44 px). No mobile, o texto é sempre 16 px.

**Estados**

| Estado | Visual |
|---|---|
| hover | Borda passa para `foreground` |
| focus-visible | Anel `ring` e borda `ring` |
| disabled | `opacity-50` |
| read-only | Fundo `muted`. É diferente de desabilitado: dá para selecionar e copiar (por exemplo, o link de indicação) |
| error | Borda e ring de 1 px em `danger` (sem mudar o tamanho da caixa), ícone, mensagem e `aria-invalid` |
| loading | Não se aplica. Validação assíncrona usa um Spinner no `rightSlot`, com `aria-busy` no campo |

**Acessibilidade**

- `<label for>` sempre visível, exceto na busca. O placeholder **não** substitui o rótulo.
- `aria-describedby` junta o hint e o erro (`"x-hint x-error"`).
- Tipos semânticos (`email`, `tel`, `url`, `number`, `datetime-local`) e `autocomplete` (`name`,
  `email` e `tel`).
- Valida no blur e no submit, nunca a cada tecla.
- Obrigatório: asterisco visual com `aria-hidden` e "(obrigatório)" em `sr-only`, mais o atributo
  `required`.

---

## 3. Textarea

As mesmas classes do Input, trocando altura e padding: `min-h-24 py-2.5 resize-y leading-6`.

**Props**: as do Input, mais `rows` e `maxLength` com contador opcional.

**Contador**: `<p id="x-count" class="text-sm text-muted-foreground tabular-nums">120/500</p>`, ligado
por `aria-describedby`. O anúncio vai num `aria-live="polite"` separado, **só** a 80% e a 100% do
limite, para não falar a cada tecla.

**Estados**: os mesmos do Input.

---

## 4. Select

**Decisão**: usar o `<select>` **nativo** estilizado. Ele é acessível sem esforço, abre o seletor do
sistema no celular e não adiciona dependência. Comboboxes com busca ficam fora desta entrega.

```html
<div class="relative">
  <select id="tz" class="… appearance-none pr-10">…</select>
  <i class="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true"></i>
</div>
```

**Classes**: as do Input, mais `appearance-none pr-10 cursor-pointer`.

**Props**: `label`, `hint`, `error`, `required`, `placeholder` (vira uma `<option value="" disabled>`)
e `options`.

**Estados**: os mesmos do Input. Com erro, o chevron fica em `text-danger`.

**Acessibilidade**: `<label for>` e `aria-describedby` como no Input. `<optgroup>` para listas
longas, como a de fusos horários por continente.

---

## 5. Checkbox

**Decisão**: `<input type="checkbox">` nativo com `accent-color`, envolvido pelo rótulo, de modo que a
área clicável inclui o texto.

```html
<label class="flex min-h-11 cursor-pointer items-start gap-3 py-2.5">
  <input type="checkbox" class="mt-0.5 size-5 shrink-0 cursor-pointer rounded-sm border-input accent-primary
         focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
  <span class="text-base text-foreground">Bloquear VPN
    <span class="block text-sm text-muted-foreground">Impede inscrições vindas de redes VPN conhecidas.</span>
  </span>
</label>
```

**Props**: `label`, `description`, `error`, `checked`, `indeterminate` e `disabled`.

**Variante `card`** (opções importantes ou pagas): o label vira
`rounded-md border border-input bg-surface p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-subtle`.
A seleção é indicada pela marca nativa do checkbox **e** pela borda. Não depende só da cor.

**Estados**

| Estado | Visual |
|---|---|
| hover | O label recebe `hover:bg-muted` na variante `card` |
| focus-visible | Anel no próprio checkbox |
| disabled | `opacity-50` no label inteiro |
| error | Mensagem abaixo, com ícone, `aria-invalid` e `aria-describedby`. Exemplo: aceitar o regulamento |

**Acessibilidade**: grupos usam `<fieldset>` com `<legend class="text-sm font-semibold">`. O link
dentro do rótulo ("regulamento") abre em nova aba, com `target="_blank" rel="noopener"` e o texto
"(abre em nova aba)" em `sr-only`.

---

## 6. Radio

Igual ao Checkbox, com `type="radio"` e `rounded-full`. O grupo sempre usa
`<fieldset><legend>`, com `role` nativo. A navegação por setas é a do navegador.

**Variante `card`**: usada no tipo de campanha (Sorteio, Ranking, Concurso e Cupom). Ícone, título e
descrição, com `has-[:checked]:border-primary has-[:checked]:bg-primary-subtle` e um ícone
`fa-circle-check` visível quando marcado.

**Estado de erro**: no `fieldset`, com `aria-describedby` apontando para a mensagem.

---

## 7. Card

```
rounded-lg border border-border bg-surface text-surface-foreground shadow-sm
```

| Parte | Classes |
|---|---|
| `CardHeader` | `flex items-start justify-between gap-4 px-5 pt-5 md:px-6 md:pt-6` |
| `CardTitle` | `font-display text-lg font-bold` (`h2` ou `h3`, conforme a hierarquia da página) |
| `CardDescription` | `text-sm text-muted-foreground` |
| `CardContent` | `p-5 md:p-6` |
| `CardFooter` | `flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-4 md:px-6` |

**Variantes**

| Variante | Classes | Uso |
|---|---|---|
| `default` | as de cima | Painel |
| `interactive` | `+ transition-shadow duration-150 hover:shadow-md` | Card inteiro clicável. O link fica no título, estendido com `after:absolute after:inset-0` |
| `ticket` | `ticket border-2 border-foreground shadow-pop rounded-lg` | Prêmio (página pública) |
| `inverted` | `bg-secondary text-secondary-foreground border-secondary` | Hero do painel, resumo de vencedores |

**Props**: `header`, `footer`, `as` (`section`, `article` ou `div`) e `variant`.

**Acessibilidade**: um card com título é uma `<section aria-labelledby>`. Card clicável não usa
`onClick` no `div`: tem um único link real e a área estendida.

---

## 8. Table

```html
<div role="region" aria-labelledby="campaigns-caption" tabindex="0"
     class="overflow-x-auto rounded-lg border border-border bg-surface shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
  <table class="w-full border-collapse text-left text-sm">
    <caption id="campaigns-caption" class="sr-only">Campanhas, página 2 de 7</caption>
    <thead class="bg-muted">
      <tr><th scope="col" class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">…</th></tr>
    </thead>
    <tbody class="divide-y divide-border">
      <tr class="transition-colors duration-150 hover:bg-muted/60"><td class="px-4 py-3 align-middle">…</td></tr>
    </tbody>
  </table>
</div>
```

**Props**: `columns` (com `header`, `accessor`, `align` e `sortable`), `rows`, `caption`, `empty`
(nó), `loading` (booleano) e `onSort`.

**Regras de layout**

- Colunas numéricas: `text-right tabular-nums`.
- Coluna de ações: `w-px whitespace-nowrap text-right`, com botões `ghost size="icon"` e
  `aria-label` que inclui o nome da linha ("Editar Sorteio de Natal").
- Abaixo de `md`: a tabela rola dentro da região, que é focável e rola pelo teclado. A primeira
  coluna fica fixa com `sticky left-0 bg-surface`. Os mockups mostram esse caso.

**Estados**

| Estado | Visual |
|---|---|
| hover de linha | `bg-muted/60` |
| focus-visible | Nos controles da linha e na região de rolagem |
| loading | 5 linhas de Skeleton e `aria-busy="true"` na `<table>` |
| empty | Uma linha com `colspan`, ícone, texto ("Nenhuma campanha encontrada para 'natal'") e ação ("Limpar filtros") |
| error | Alert `danger` acima da tabela, com a ação "Tentar de novo" |
| ordenação | `aria-sort="ascending|descending"` no `<th>`, botão dentro do `<th>` e ícone `fa-sort-up` ou `fa-sort-down` |

**Acessibilidade**: `<th scope="col">` e, se houver, `<th scope="row">` na primeira célula. Caption
(pode ser `sr-only`) com o contexto da paginação.

---

## 9. Modal (Radix Dialog)

Sobre `@radix-ui/react-dialog`, que cuida de focus trap, `Esc`, devolução do foco à origem,
`aria-modal`, `role="dialog"` e bloqueio do scroll.

| Parte | Classes |
|---|---|
| `Overlay` | `fixed inset-0 z-50 bg-overlay/60 motion-safe:data-[state=open]:animate-fade-in` |
| `Content` | `fixed inset-x-4 top-1/2 z-50 mx-auto w-auto max-w-lg -translate-y-1/2 max-h-[85dvh] overflow-y-auto rounded-lg bg-surface p-6 text-surface-foreground shadow-lg motion-safe:data-[state=open]:animate-pop-in focus-visible:outline-none` |
| `Title` | `font-display text-xl font-bold pr-12` (é o `aria-labelledby`) |
| `Description` | `mt-2 text-sm text-muted-foreground` (é o `aria-describedby`) |
| `Close` (X) | `absolute right-3 top-3` com Button `ghost size="icon"` e `aria-label="Fechar"` |
| `Footer` | `mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end` |

**Props**: `open`, `onOpenChange`, `title` (obrigatório), `description`, `footer`, `size` (`sm` =
`max-w-md`, `md` = `max-w-lg`, `lg` = `max-w-2xl`) e `initialFocus` (ref).

**Variantes de uso**

- **Confirmação**: título em forma de pergunta ("Publicar campanha?"), descrição com a
  consequência e dois botões: `outline` "Cancelar" e `primary` ou `danger` com o verbo ("Publicar",
  "Excluir").
- **Destrutiva**: o foco inicial vai para "Cancelar", não para "Excluir". O botão de confirmação usa
  `danger`.
- **Formulário**: o foco inicial vai para o primeiro campo, e o submit fica no footer.

**Estados**: loading na confirmação (o Button em `loading` mantém o modal aberto e bloqueia o
fechamento durante a requisição). Erro de requisição aparece num Alert `danger` dentro do modal,
acima do footer.

**Acessibilidade (FR-009)**

- Focus trap, `Esc` fecha e o foco volta ao gatilho. Tudo isso vem do Radix e **não pode** ser
  desligado.
- Clicar no overlay fecha, exceto em modais com formulário alterado, que pedem confirmação antes.
- O botão X sempre existe, com `aria-label`.
- No mobile, os botões ficam empilhados e com largura total, e a ação principal fica embaixo (perto
  do polegar).
- O fundo recebe `inert` (o Radix já aplica `aria-hidden` no resto).

---

## 10. Alert (inline)

```
relative flex gap-3 rounded-md border border-l-4 p-4 pr-14 text-sm text-foreground
```

| Variante | Classes | Ícone (FontAwesome) | Papel ARIA |
|---|---|---|---|
| `success` | `border-success/30 border-l-success bg-success-subtle` | `fa-circle-check text-success` | `role="status"` |
| `info` | `border-info/30 border-l-info bg-info-subtle` | `fa-circle-info text-info` | `role="status"` |
| `warning` | `border-warning/30 border-l-warning bg-warning-subtle` | `fa-triangle-exclamation text-warning` | `role="status"` |
| `danger` | `border-danger/30 border-l-danger bg-danger-subtle` | `fa-circle-exclamation text-danger` | `role="alert"` |

**Partes**: ícone `mt-0.5 text-base` com `aria-hidden`, `AlertTitle` (`font-semibold`), corpo
(`text-sm`), ações opcionais (`mt-3 flex gap-2`, com Button `sm`) e o botão de fechar
(`absolute right-1.5 top-1.5`, `ghost size="icon"`, `aria-label="Fechar aviso"`).

**Props**: `variant`, `title`, `children`, `dismissible`, `onDismiss` e `action`.

**Regras**

- A forma do ícone diferencia o tipo: círculo com check, círculo com i, triângulo e círculo com
  exclamação. O título também diz o tipo em texto ("Campanha publicada", "Não foi possível salvar").
- Alerta de resumo de validação: `danger`, com lista de links âncora para cada campo com erro
  (`<a href="#title">Título: informe um título</a>`), e recebe o foco depois do submit
  (`tabindex="-1"`).
- Para o anúncio funcionar, a região `role` precisa existir no DOM antes do conteúdo ser inserido.
  Alternativa: renderizar o Alert já com o conteúdo, junto com a mudança de rota.

---

## 11. Toast (sonner)

Feedback efêmero (salvo, copiado, removido). **Não** substitui o Alert para erros que exigem ação.

```tsx
// Especificação de configuração, não implementação:
<Toaster position="top-center" closeButton duration={5000} visibleToasts={3}
  toastOptions={{ unstyled: true, classNames: {
    toast: "flex w-full items-start gap-3 rounded-md border border-border bg-surface p-4 pr-12 text-sm text-foreground shadow-md",
    title: "font-semibold", description: "text-muted-foreground",
    success: "border-l-4 border-l-success", error: "border-l-4 border-l-danger",
    warning: "border-l-4 border-l-warning", info: "border-l-4 border-l-info",
    closeButton: "size-11 …ghost icon…", actionButton: "…Button outline sm…" } }} />
```

| Tipo | Ícone | Duração |
|---|---|---|
| `toast.success` | `fa-circle-check text-success` | 5 s |
| `toast.info` | `fa-circle-info text-info` | 5 s |
| `toast.warning` | `fa-triangle-exclamation text-warning` | 7 s |
| `toast.error` | `fa-circle-exclamation text-danger` | 8 s, ou fixo se tiver ação |

**Posição**: `top-center` no mobile e no widget (iframe), `bottom-right` no painel desktop
(`lg:`).

**Acessibilidade**: o sonner cria uma região `aria-live="polite"` e não rouba o foco. A ação do toast
("Desfazer") também precisa estar disponível por outro caminho, porque toasts somem. O tempo pausa
no hover e no foco.

---

## 12. Tabs

Padrão WAI-ARIA Tabs, com ativação automática.

| Parte | Classes |
|---|---|
| `TabList` horizontal | `flex gap-1 overflow-x-auto border-b border-border` com `role="tablist"` e `aria-label` |
| `Tab` horizontal | `inline-flex min-h-11 items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-4 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground aria-selected:border-primary aria-selected:font-semibold aria-selected:text-foreground` mais o anel de foco |
| `TabList` vertical (`lg:`) | `flex flex-col gap-1` com `aria-orientation="vertical"` |
| `Tab` vertical | `flex min-h-11 items-center gap-3 rounded-md border-l-4 border-transparent px-3 text-left text-sm font-medium text-muted-foreground hover:bg-muted aria-selected:border-primary aria-selected:bg-primary-subtle aria-selected:font-semibold aria-selected:text-foreground` |
| `TabPanel` | `pt-6 focus-visible:outline-2 …` com `role="tabpanel"`, `tabindex="0"` e `aria-labelledby` |

**Props**: `items` (com `id`, `label`, `icon`, `badge` e `status`: `complete` ou `error`), `value`,
`onValueChange` e `orientation`.

**Variante "etapas"** (construtor de campanha): cada aba mostra o número da etapa num círculo
(`size-7 rounded-full`). Etapa concluída: `fa-check` com o texto `sr-only` "concluída". Etapa com
erro: `fa-circle-exclamation text-danger` com `sr-only` "com erros" e a contagem num Badge
`danger`. Abaixo de `lg`, as abas ficam horizontais e roláveis.

**Teclado**: `←`/`→` (ou `↑`/`↓` na vertical) mudam de aba, `Home` e `End` vão para a primeira e a
última aba, e `Tab` sai da lista e entra no painel. Usa roving tabindex: a aba ativa tem
`tabindex="0"` e as outras têm `-1`.

**Não depende só da cor**: a aba ativa tem borda, peso e fundo diferentes.

---

## 13. Navbar e Sidebar

### 13.1 Painel (organizador)

- **Skip link** (primeiro elemento focável): `sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:shadow-lg`,
  com o texto "Pular para o conteúdo" e `href="#main"`.
- **Sidebar** (`lg:` e acima): `fixed inset-y-0 left-0 w-64 bg-secondary text-secondary-foreground flex flex-col`.
  - Logotipo no topo e `<nav aria-label="Principal">` com `<ul>` de itens.
  - Item: `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-secondary-muted-foreground hover:bg-secondary-hover hover:text-secondary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring-inverse`.
  - Item ativo: `aria-current="page"`, `bg-accent text-accent-foreground font-semibold` e ícone
    na cor do texto. Fundo e peso diferentes, não só a cor.
  - Grupos com `<h2 class="px-3 text-xs font-semibold uppercase tracking-wide text-secondary-muted-foreground">`:
    Campanhas, Loja (Produtos, Pedidos, Faturas) e Equipe (Redes, Perfis e Usuários).
  - Rodapé: idioma e usuário.
- **Top bar**: `sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur-sm lg:pl-72`.
  Tem o botão de menu (só abaixo de `lg`, `aria-label="Abrir menu"`, `aria-expanded` e
  `aria-controls`), o título ou breadcrumb, o seletor de idioma e o menu do usuário.
- **Drawer mobile**: Radix Dialog em forma de painel lateral, com
  `fixed inset-y-0 left-0 w-72 max-w-[85vw] motion-safe:animate-slide-in-left`. Tem focus trap e
  `Esc`, igual ao Modal.
- **Menu do usuário**: botão com avatar e nome, `aria-haspopup="menu"` e `aria-expanded`. Os itens
  são Alterar foto, Editar conta, Alterar senha e, separado por um divisor, **Sair**, com espaço
  extra porque é destrutivo.

### 13.2 Página pública e widget

- **Header público**: `flex h-16 items-center justify-between px-4`, com o logo da campanha (ou o
  do Viralt) e o seletor de idioma (`<select>` nativo com `<label class="sr-only">Idioma</label>`,
  `min-h-11`, opções "Português", "English" e "Español"). Ao trocar, o `<html lang>` muda.
- **Widget**: sem header de navegação. O idioma fica no rodapé, junto do selo "Feito com Viralt".

### 13.3 Regras do documento do widget (contrato `viralt-resize`)

- O `html` e o `body` do widget usam o fundo `background` (o contrato pede fundo definido, sem
  depender de transparência).
- **Nunca** usar `min-h-dvh`, `h-screen` ou `min-h-full` no `body` ou no contêiner raiz do widget. O
  contrato mede `document.documentElement.scrollHeight`, e uma altura mínima atrelada ao viewport
  faz o iframe nunca encolher. Isso foi constatado no mockup.
- **Limitação do contrato atual** (a decidir fora do design): `documentElement.scrollHeight` nunca
  é menor que a altura atual do iframe. Então o widget cresce, mas não encolhe, por exemplo quando o
  formulário vira o estado de sucesso, que é mais curto. Medir a raiz do widget
  (`getBoundingClientRect().height`) resolveria, mas muda o contrato `contracts/widget-embed.md`.
- Toasts dentro do widget ficam em `top-center`, dentro do iframe.

**Acessibilidade**: `<nav aria-label>` único por região, `aria-current="page"` no item ativo,
`<main id="main" tabindex="-1">` e, na troca de rota, o foco vai para o `<h1>` da página.

---

## 14. Pagination

```html
<nav aria-label="Paginação das campanhas" class="flex flex-col items-center justify-between gap-3 sm:flex-row">
  <p class="text-sm text-muted-foreground" aria-live="polite">Mostrando <b class="text-foreground">10–18</b> de <b class="text-foreground">57</b></p>
  <ul class="flex items-center gap-1">
    <li><a href="?p=1" class="…Button outline size=icon…" aria-label="Página anterior"><i class="fa-solid fa-chevron-left"></i></a></li>
    <li><a href="?p=1" class="…ghost size=icon…" aria-label="Página 1">1</a></li>
    <li><a aria-current="page" aria-label="Página 2, atual" class="… bg-secondary text-secondary-foreground font-bold">2</a></li>
    <li aria-hidden="true" class="px-1 text-muted-foreground">…</li>
    …
  </ul>
</nav>
```

**Props**: `page`, `totalPages`, `totalItems`, `pageSize`, `onChange` e `siblingCount` (padrão 1).

**Regras**

- Página atual: `aria-current="page"` e fundo `secondary` (forma e cor, não só cor).
- Anterior e Próxima: desabilitadas nas pontas, com `aria-disabled="true"` e sem `href`.
- Abaixo de `sm`, mostra só Anterior, "2 de 7" e Próxima.
- Ao mudar de página, o foco vai para o caption da tabela ou para o título da lista, e o resumo
  "Mostrando…" é anunciado por `aria-live="polite"`.
- Cada item tem `size-11`.

---

## 15. Badge

```
inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap
```

| Variante | Classes | Ícone e forma |
|---|---|---|
| `neutral` | `bg-muted text-foreground` | — |
| `primary` | `bg-primary-subtle text-primary` | — |
| `success` | `bg-success-subtle text-success` | — |
| `warning` | `bg-warning-subtle text-warning` | — |
| `danger` | `bg-danger-subtle text-danger` | — |
| `info` | `bg-info-subtle text-info` | — |
| `points` | `bg-accent text-accent-foreground border-2 border-foreground shadow-pop-sm font-display tabular-nums` | Selo "+5 pts" (público) |

**Status de campanha** (mapeamento fixo, sempre com **texto + ícone + cor**):

| Status | Variante | Ícone | Texto (pt / en / es) |
|---|---|---|---|
| 0 Rascunho | `neutral` | `fa-pen` | Rascunho / Draft / Borrador |
| 1 Ativa | `success` | `fa-circle-play` | Ativa / Active / Activa |
| 2 Pausada | `warning` | `fa-circle-pause` | Pausada / Paused / Pausada |
| 3 Encerrada | `info` | `fa-flag-checkered` | Encerrada / Ended / Finalizada |

Moderação de envios: Pendente (`warning`, `fa-hourglass-half`), Aprovado (`success`, `fa-check`) e
Rejeitado (`danger`, `fa-xmark`).

**Acessibilidade**: o badge não é interativo (sem alvo de 44 px). O texto é sempre visível e o ícone
leva `aria-hidden`. Para badge numérico em aba ou menu, o texto `sr-only` completa o sentido ("3
erros").

---

## 16. Spinner

```html
<span role="status" class="inline-flex items-center gap-2 text-muted-foreground">
  <span class="size-5 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin" aria-hidden="true"></span>
  <span>Carregando campanhas…</span>   <!-- ou class="sr-only" quando o contexto já é visual -->
</span>
```

**Tamanhos**: `sm` = `size-4 border-2` (dentro do botão), `md` = `size-5`, `lg` = `size-8 border-[3px]`
(página inteira).

**Regras**

- Com `prefers-reduced-motion`, o círculo para de girar. Por isso o texto é obrigatório, visível ou
  `sr-only`.
- Dentro do Button, o Spinner é `aria-hidden` e o anúncio vem do `aria-busy` do botão.
- Para esperas acima de 1 s com conteúdo conhecido, prefira o Skeleton.

---

## 17. Skeleton

```
rounded-md bg-muted motion-safe:animate-pulse
```

**Formas prontas**: `SkeletonText` (`h-4`, larguras 100%, 90% e 60%), `SkeletonTitle` (`h-8 w-2/3`),
`SkeletonAvatar` (`size-10 rounded-full`), `SkeletonCard` (bloco `h-40 rounded-lg`) e
`SkeletonRow` (linha de tabela).

**Regras**

- Os skeletons têm `aria-hidden="true"`. O contêiner recebe `aria-busy="true"` e um texto `sr-only`
  ("Carregando…") com `role="status"`.
- Ocupam o mesmo espaço do conteúdo final (sem layout shift, CLS < 0,1). No hero, mantêm a mesma
  proporção (`aspect-[16/9]`).
- A troca para o conteúdo usa fade de 300 ms, só com `motion-safe`.

---

## 18. Padrões compostos da página pública

Não são componentes `ui/`. Ficam em `src/Components/` e são feitos com os componentes acima.

### 18.1 `CountdownTimer`

- Quatro blocos (dias, horas, minutos e segundos). Cada um é `rounded-md bg-secondary px-3 py-2
  text-center text-secondary-foreground`, com número em `font-display text-3xl font-extrabold
  tabular-nums` e rótulo `text-xs uppercase tracking-wide text-secondary-muted-foreground`.
- Leitores de tela: a contagem viva tem `aria-hidden="true"`. Ao lado, um texto `sr-only` estático:
  "A campanha termina em 12 de dezembro de 2026, às 23h59". Não há anúncio a cada segundo.
- Com menos de 24 h, aparece um Alert `warning` "Últimas horas". Encerrada, os blocos dão lugar ao
  texto "Campanha encerrada" com ícone.
- Os dígitos trocam sem animação.

### 18.2 `PrizeCard` (bilhete)

- Card `ticket`: imagem em cima com **altura fixa** (`h-36 w-full object-cover`, `alt` com o nome do
  prêmio), linha `perforation` e base com posição ("1º prêmio"), título e quantidade ("2 unidades").
- O recorte fica na altura da linha picotada: `style="--ticket-at: 9rem"`, igual à altura da imagem.
  Por isso a imagem não pode ter altura proporcional.

### 18.3 `EntryMethodCard` (ação de entrada)

- Linha com ícone da rede (`size-11 rounded-md`, fundo `muted`, ícone `fa-brands`), título, descrição,
  selo de pontos e botão.
- Pendente: Button `accent` "Seguir" ou "Compartilhar", com `aria-label="Seguir @marca no Instagram, +5 pontos"`.
- Concluída: o botão vira o texto `fa-circle-check text-success` "Feito", sem ser botão, e o card
  fica com `bg-success-subtle`. O total de pontos é anunciado por um `aria-live="polite"` no resumo
  ("Você tem 12 pontos").
- Bloqueada (exige inscrição): `aria-disabled`, ícone `fa-lock` e o texto "Inscreva-se para liberar".

### 18.4 Formulário de inscrição

- Campos: nome, e-mail, telefone (opcional) e o checkbox do regulamento.
- CTA `primary lg pop fullWidth` com o texto "Participar agora".
- Erro de servidor: Alert `danger` acima dos campos. Erro de campo: inline.
- Sucesso: o card vira o estado "Você está participando!", com ícone grande `fa-ticket`, o número
  de pontos, a lista de ações de entrada e o link de indicação (Input `read-only`, botão "Copiar
  link" e um toast "Link copiado"). O foco vai para o título do estado de sucesso, que tem
  `tabindex="-1"`.

---

# Parte 2: componentes vindos do inventário T003

> A fonte é `specs/003-frontend-vite-tailwind/baseline.md`, seção "Uso de Bootstrap". Estes
> componentes não estavam no `data-model.md` §2, mas o código atual precisa deles.

## 19. DropdownMenu

**Onde**: o menu do usuário e o seletor de idioma no Header, e as ações de "mais opções" das linhas
de tabela. **Decisão**: `@radix-ui/react-dropdown-menu`, que traz teclado, foco, `Esc`, typeahead e
o posicionamento resolvidos. Isso é uma **dependência nova** além do Dialog (research R4), e
precisa de aprovação.

> **Filtros das 5 telas de busca** (CampaignSearch, UserSearch, OrderSearch, ProductSearch e
> ProfileList): usar o `Select` nativo (§4), **não** o DropdownMenu. O filtro é a escolha de um valor,
> não uma ação. O `<select>` também é anunciado corretamente e funciona melhor no celular.

| Parte | Classes |
|---|---|
| `Trigger` | Button `ghost` ou `outline`, com `aria-haspopup="menu"` e `aria-expanded` (o Radix aplica). Chevron `fa-chevron-down` que gira 180° em `data-[state=open]` (`motion-safe:transition-transform`) |
| `Content` | `z-50 min-w-56 rounded-md border border-border bg-surface p-1.5 text-sm text-foreground shadow-md motion-safe:data-[state=open]:animate-pop-in` |
| `Label` | `px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground` |
| `Item` | `flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-sm px-3 outline-none data-[highlighted]:bg-muted data-[disabled]:opacity-50 data-[disabled]:pointer-events-none` |
| `Item` destrutivo | `+ text-danger data-[highlighted]:bg-danger-subtle` |
| `CheckboxItem` / `RadioItem` | Item com `fa-check` à esquerda quando marcado (`data-[state=checked]`). O idioma ativo usa `RadioItem` |
| `Separator` | `my-1 h-px bg-border` |

**Props**: `trigger`, `items` (com `label`, `icon`, `onSelect`, `destructive`, `disabled` e
`shortcut`), `align` (`start` ou `end`) e `side`.

**Estados**: hover e teclado usam o mesmo realce (`data-highlighted`), que é sempre fundo mais
forma, nunca só a cor do texto. Com o foco no `Trigger`, vale o anel padrão. Um item desabilitado
continua focável pelas setas, mas não executa. O loading acontece no conteúdo da tela, não no menu.

**Acessibilidade**: `role="menu"` e `menuitem` vêm do Radix. `↑`/`↓` navegam, `Enter` e `Espaço`
ativam, `Esc` fecha e o foco volta ao trigger. Um item destrutivo ("Sair", "Excluir") fica no fim,
depois de um `Separator`, e "Excluir" abre o ConfirmModal. Ícone sempre com texto.

**Menu "mais ações" da tabela**: trigger `ghost size="icon"` com `fa-ellipsis-vertical` e
`aria-label="Mais ações para Sorteio de Natal"`.

---

## 20. InputGroup (addons do Input)

**Decisão**: as props `leftAddon` e `rightAddon` do próprio `Input` resolvem o caso, sem um componente
separado. Elas cobrem as 16 telas que usam `InputGroup`.

| Tipo de addon | Implementação | Classes |
|---|---|---|
| Ícone decorativo (à esquerda) | Ícone posicionado absolutamente dentro do wrapper `relative` | Ícone `pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground`; input com `pl-10` |
| Texto fixo (prefixo ou sufixo: `https://`, `%`, `R$`) | Bloco unido ao campo | Wrapper `flex`; addon `inline-flex min-h-11 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground`; input `rounded-l-none` |
| Botão anexado (Buscar, Copiar, Mostrar senha) | Button ao lado, no mesmo grupo | Wrapper `flex`; input `rounded-r-none`; Button `outline` com `rounded-l-none -ml-px` e `focus-visible:z-10`, para o anel não ficar escondido |

**Regras**

- O anel de foco fica no controle focado, não no wrapper.
- Com erro, o addon também ganha a borda `danger` (estado repassado ao wrapper).
- Botão anexado só com ícone exige `aria-label` ("Buscar", "Copiar link", "Mostrar senha"). O botão
  "Mostrar senha" usa `aria-pressed` e troca o ícone `fa-eye`/`fa-eye-slash`.
- O texto do prefixo deve aparecer no rótulo ou no `aria-describedby` (exemplo: "Valor em reais").
- Na busca, a lupa à esquerda é decorativa. Se o botão "Buscar" for necessário (busca no servidor),
  ele fica à direita, com texto a partir de `sm:` e só ícone com `aria-label` no mobile.

---

## 21. Tabs verticais (complemento do §12)

O §12 já define a orientação vertical. Para o **CampaignBuilder**:

- `lg:` e acima: duas colunas, `grid lg:grid-cols-[16rem_1fr] gap-8`. A lista de abas fica
  `sticky top-24` e é vertical, com número de etapa, status e `aria-orientation="vertical"`.
- Abaixo de `lg`: a mesma lista vira horizontal e rolável (`overflow-x-auto`), com indicador inferior,
  e o `aria-orientation` volta a ser `horizontal`. Trocar a orientação muda as setas do teclado.
- Abaixo do painel ficam os botões "Anterior" (`outline`) e "Próximo" (`secondary`). Na última
  etapa, "Próximo" dá lugar a "Publicar campanha" (`primary`), que abre o ConfirmModal.
- Recomendação: `@radix-ui/react-tabs`, que já traz `orientation` e o roving tabindex. Sem ele, o
  roving tabindex do §12 precisa ser implementado à mão. É outra dependência, ver as decisões.

---

## 22. Alert dispensável (complemento do §10)

- `dismissible` exibe o botão fechar: `absolute right-1.5 top-1.5`, Button `ghost size="icon"`,
  ícone `fa-xmark` e `aria-label="Fechar aviso"` (traduzido).
- Ao fechar, o foco vai para o próximo elemento lógico (o título da seção ou o primeiro controle
  abaixo), nunca para o `body`.
- Alertas `danger` com erro de requisição podem ser dispensados, mas voltam se o erro se repetir.
- Alertas de sucesso depois de uma ação (exemplo: "Campanha publicada") somem ao navegar. **Não**
  somem sozinhos por tempo, porque para isso existe o Toast.
- A saída usa fade de 150 ms (`motion-safe`), sem animar a altura.

---

## 23. FileInput (upload)

**Onde**: ImageModal (avatar, imagem de produto e da rede), ContestUpload (envio de foto do
participante) e as imagens da campanha (logo, topo e fundo).

**Estrutura**: uma zona de soltura que é um `<label>` ligado a um `<input type="file" class="sr-only">`.
O input real continua focável e acessível.

```html
<div class="flex flex-col gap-1.5">
  <span id="logo-label" class="text-sm font-semibold">Logo da campanha</span>
  <label for="logo" class="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg
         border-2 border-dashed border-input bg-surface p-6 text-center transition-colors duration-150
         hover:border-primary hover:bg-primary-subtle
         has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring">
    <i class="fa-solid fa-cloud-arrow-up text-2xl text-muted-foreground" aria-hidden="true"></i>
    <span class="text-sm font-semibold text-foreground">Escolher imagem <span class="font-normal text-muted-foreground">ou arraste aqui</span></span>
    <span id="logo-hint" class="text-xs text-muted-foreground">PNG, JPG ou WebP, até 2 MB</span>
    <input id="logo" type="file" accept="image/png,image/jpeg,image/webp" class="sr-only" aria-describedby="logo-hint logo-error">
  </label>
</div>
```

**Estados**

| Estado | Visual |
|---|---|
| vazio | Zona tracejada, como acima |
| arrastando (`dragover`) | `border-primary bg-primary-subtle` e o texto "Solte para enviar" |
| focus-visible | Anel na zona (`has-[:focus-visible]`) |
| selecionado | Prévia `size-16 rounded-md object-cover`, nome e tamanho do arquivo, e os botões "Trocar" (`outline sm`) e "Remover" (`ghost sm`, `aria-label="Remover logo.png"`) |
| enviando | Barra `h-2 rounded-full bg-muted` com preenchimento `bg-primary`, `role="progressbar"`, `aria-valuenow` e o texto "Enviando… 45%" |
| erro | Borda `danger`, mensagem com ícone ("O arquivo tem 5 MB; o limite é 2 MB"), `aria-invalid` no input e `aria-describedby` |
| desabilitado | `opacity-50 pointer-events-none` |

**Acessibilidade**: arrastar é só um atalho. Clicar, `Enter` e `Espaço` abrem o seletor do sistema.
Os limites (tipos e tamanho) ficam escritos **antes** do erro. A conclusão do envio é anunciada por
`aria-live="polite"` ("logo.png enviado").

---

## 24. ColorInput (seletor de cor)

**Onde**: CampaignBuilder, nas cores primária, secundária e de fundo.

**Estrutura**: amostra nativa mais um campo hexadecimal editável, no padrão InputGroup.

```html
<label for="primary-hex" class="text-sm font-semibold">Cor primária</label>
<div class="flex">
  <label class="relative inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-l-md border border-r-0 border-input bg-surface has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring">
    <span class="sr-only">Escolher cor primária no seletor</span>
    <input type="color" value="#C2185B" class="absolute inset-0 size-full cursor-pointer opacity-0">
    <span class="size-6 rounded-sm border border-foreground/20" style="background:#C2185B" aria-hidden="true"></span>
  </label>
  <input id="primary-hex" type="text" pattern="#[0-9A-Fa-f]{6}" value="#C2185B"
         class="… rounded-l-none font-mono uppercase" aria-describedby="primary-hex-contrast">
</div>
<p id="primary-hex-contrast" class="flex items-center gap-1.5 text-sm text-success">
  <i class="fa-solid fa-circle-check" aria-hidden="true"></i>Contraste com texto branco: 5,87:1 (aprovado)
</p>
```

**Regras**

- A amostra e o campo hex ficam sincronizados. Um hex inválido gera erro inline ("Use o formato
  #RRGGBB").
- **Feedback de contraste** em tempo real, ligado à regra de segurança de `tokens.md` §1.1. Abaixo de
  4,5:1 aparece um aviso `warning`: "Contraste baixo (3,2:1). A página pública vai usar a cor
  padrão." Sempre com ícone e razão em texto.
- O seletor nativo tem rótulo `sr-only`, e o campo hex tem `<label>` visível.

---

## 25. Contêineres de bibliotecas de terceiros

### 25.1 `RichTextEditor` (react-quill, ProductEditPage)

O `quill.snow.css` continua sendo importado, e um **bloco de sobrescrita** no CSS do componente
alinha o editor aos tokens. Esse bloco usa as variáveis do tema, não classes Tailwind, porque o
Quill gera o próprio DOM:

| Alvo | Regra |
|---|---|
| Wrapper | `rounded-md border border-input bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring` |
| `.ql-toolbar.ql-snow` | `border: 0; border-bottom: 1px solid var(--color-border); background: var(--color-muted); border-radius: var(--radius-md) var(--radius-md) 0 0; padding: .375rem` |
| Botões da toolbar | No mínimo `2.75rem` × `2.75rem`, `border-radius: var(--radius-sm)`. Hover `background: var(--color-surface)`. Ativo (`.ql-active`): `color: var(--color-primary)` sobre `var(--color-primary-subtle)` |
| Ícones SVG (`.ql-stroke`, `.ql-fill`) | `stroke`/`fill: var(--color-foreground)`. Ativo: `var(--color-primary)` |
| `.ql-container.ql-snow` | `border: 0; font-family: var(--font-sans); font-size: var(--text-base)` |
| `.ql-editor` | `min-height: 12rem; padding: 1rem; line-height: 1.6; color: var(--color-foreground)` |
| `.ql-editor.ql-blank::before` (placeholder) | `color: var(--color-muted-foreground); font-style: normal` |
| Erro | Wrapper com `border-danger ring-1 ring-danger`, mensagem abaixo e `aria-describedby` no `.ql-editor` |

**Acessibilidade**: `.ql-editor` recebe `role="textbox"`, `aria-multiline="true"` e
`aria-labelledby` (apontando para o rótulo visível). Os botões da toolbar precisam de `aria-label`
traduzido ("Negrito", "Itálico", "Lista"), injetado no `CustomToolbar`. `Tab` sai do editor (a
tecla não é capturada para indentar).

O mockup `admin-form.html` mostra o contêiner na aba Aparência (descrição rica).

### 25.2 `ImageCropper` (react-image-crop, dentro do ImageModal)

| Alvo | Regra |
|---|---|
| Área | `rounded-md bg-muted`, com fundo xadrez para transparência e altura máxima de `60dvh` |
| `.ReactCrop__crop-selection` | `border: 2px solid var(--color-surface); box-shadow: 0 0 0 9999em rgb(26 20 35 / .6)`, que é o scrim `overlay/60` |
| Alças (`.ReactCrop__drag-handle`) | Visual de 12 px em `var(--color-surface)` com borda `var(--color-foreground)`, e área de toque de 44 px via `::after` com `inset: -16px` |
| Foco | `.ReactCrop__crop-selection:focus-visible { outline: 2px solid var(--color-ring-inverse); outline-offset: 2px }` |
| Controles abaixo | Proporção (Radio `card`: 1:1, 16:9 e livre), zoom (`<input type="range" class="accent-primary">` com rótulo) e os botões "Cancelar" e "Aplicar recorte" no footer do Modal |

**Acessibilidade**: o react-image-crop aceita teclado (setas movem e `Shift` acelera). Deixe a
instrução visível abaixo da área ("Use as setas para mover o recorte"). Os botões de proporção são
uma alternativa ao arraste.

---

## 26. ConfirmModal

É uma variante do Modal (§9) que **substitui `window.confirm`** (CampaignSearch e ParticipantList,
2×) e o modo Confirmation do `MessageToast` (ProfileList).

**API (spec)**: `confirm({ title, description, confirmLabel, cancelLabel, tone: 'default' | 'danger', requireText? })`,
que retorna uma `Promise<boolean>`. Isso permite trocar `if (!window.confirm(...))` por
`if (!(await confirm(...)))` sem reestruturar a tela. Um único provider fica na raiz.

| Parte | Especificação |
|---|---|
| Ícone | Círculo `size-12 rounded-full` à esquerda do título. `danger` usa `bg-danger-subtle text-danger` com `fa-trash` (ou `fa-triangle-exclamation`). `default` usa `bg-primary-subtle text-primary` com `fa-circle-question` |
| Título | Pergunta com o objeto: "Excluir a campanha "Sorteio de Natal"?" |
| Descrição | A consequência, em linguagem direta: "Os 1.284 participantes e as inscrições serão apagados. Isso não pode ser desfeito." |
| `requireText` (opcional) | Para exclusões em massa, um Input "Digite EXCLUIR para confirmar". O botão só habilita quando o texto confere |
| Footer | `outline` "Cancelar" e `danger`/`primary` com o verbo ("Excluir", "Bloquear", "Publicar"). Nunca "OK" ou "Sim" |

**Comportamento**

- `tone="danger"`: o foco inicial vai para **Cancelar**, e `Enter` não confirma sem querer.
- Durante a ação assíncrona: botão em `loading`, Cancelar desabilitado e o modal não fecha por `Esc`
  nem pelo overlay.
- Falha: Alert `danger` dentro do modal, que continua aberto para nova tentativa.
- Sucesso: o modal fecha, o foco volta ao gatilho (ou, se a linha sumiu, ao título da lista) e um
  Toast `success` aparece, com "Desfazer" quando a API permitir.

**Acessibilidade**: tudo do §9, mais `role="alertdialog"` (Radix `AlertDialog`, de
`@radix-ui/react-alert-dialog`, ou `Dialog` com o `role` sobrescrito), para que leitores de tela
leiam a descrição ao abrir.

O mockup `admin-list.html` mostra o ConfirmModal de exclusão. O `admin-form.html` mostra a
confirmação `default` de publicação.

---

## 27. Opcionais: Avatar, List (ListGroup) e PageContainer

### 27.1 Avatar

`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-semibold text-secondary-foreground`

- Tamanhos: `sm` = `size-8 text-xs`, `md` = `size-10 text-sm` e `lg` = `size-24 text-2xl` (página da
  conta).
- A imagem usa `size-full object-cover`, com `alt=""` quando o nome aparece ao lado, ou com
  `alt="{nome}"` quando aparece sozinha. Sem imagem, mostra as iniciais (até 2 letras).
- Quando é clicável (alterar foto), o Avatar fica dentro de um `<button>` com
  `aria-label="Alterar foto"` e alvo de 44 px ou mais, e ganha um selo `fa-camera` no canto.

### 27.2 List (substitui o ListGroup)

Card com uma `<ul class="divide-y divide-border">`. Cada item é
`flex min-h-14 items-center justify-between gap-4 px-5 py-3`, com título `text-sm font-semibold`,
meta `text-sm text-muted-foreground` e valor à direita com `tabular-nums`. Um item clicável tem o
`<a>` ocupando a linha toda, com `hover:bg-muted` e o anel de foco. Usado no Dashboard.

### 27.3 PageContainer

Padroniza a largura e o espaçamento das páginas, substituindo `Container` e `Row`/`Col`.

| Variante | Classes |
|---|---|
| `default` (painel) | `mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8` |
| `narrow` (login, conta, senha) | `mx-auto w-full max-w-md px-4 py-10` |
| `public` (página da campanha) | `mx-auto w-full max-w-5xl px-4 sm:px-6` |
| `wide` (home) | `mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8` |

O `PageHeader` opcional usa `flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between`,
com breadcrumb, `h1` (`font-display text-2xl font-bold lg:text-3xl`), descrição
(`text-muted-foreground`) e um slot de ações. O grid das telas usa utilitários diretos, como
`grid gap-6 md:grid-cols-2 lg:grid-cols-3`.

---

## 28. Header público e menu móvel (substitui o JS do template iLanding)

Usado na Home, no Login, na Conta e nas páginas sem sidebar. O painel usa o layout do §13.1. O
mockup está em `mockups/home.html`.

**Desktop (`lg:` e acima)**: `sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur-sm`.

- Logo "Viralt" (`font-display text-xl font-extrabold`, link para `/`).
- `<nav aria-label="Principal">` com os links "Como funciona", "Preços" e "Minhas campanhas". O
  link é `min-h-11 px-3 text-sm font-medium hover:text-primary`. O ativo tem `aria-current="page"`,
  `font-semibold` e sublinhado de 2 px em `primary`.
- À direita: seletor de idioma (DropdownMenu com `RadioItem`) e "Entrar" (`outline`) ou o menu do
  usuário (DropdownMenu), e ainda "Criar campanha" (`primary`).

**Mobile (abaixo de `lg`)**

- O header mostra o logo, "Criar campanha" (`primary sm`, se couber) e o botão de menu
  (`ghost size="icon"`, `fa-bars`, `aria-label="Abrir menu"`, `aria-expanded` e
  `aria-controls="mobile-menu"`).
- O menu é um **Radix Dialog** em forma de painel lateral, vindo da direita:
  `fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-surface shadow-lg`, com overlay
  `bg-overlay/60`.
  - Topo: logo e botão fechar (`fa-xmark`, `aria-label="Fechar menu"`).
  - Links em lista: `min-h-12 px-4 text-base font-semibold`, com divisores.
  - Rodapé: idioma (`<select>` nativo com rótulo) e "Entrar", ou o bloco do usuário (Avatar, nome e
    "Sair", separado).
- Focus trap, `Esc` e devolução do foco ao botão de menu vêm do Radix. Nenhum JS de template.
- Ao navegar por um link, o menu fecha e o foco vai para o `<h1>` da nova página.

---

## 29. Home (landing): direções

O mockup está em [`mockups/home.html`](./mockups/home.html). A home troca o template iLanding pela
direção "Bilhete Premiado", mantendo as seções de hoje: **Hero, Features, Pricing** e Footer.

| Seção | Direção |
|---|---|
| Hero | Duas colunas no desktop. Título em `font-display text-5xl` ("Campanhas que as pessoas **querem** compartilhar"), com a palavra-chave sobre um marca-texto `bg-accent`. Subtítulo `text-lg text-muted-foreground`, CTA `primary lg pop` "Criar campanha grátis" e `outline lg` "Ver um exemplo". À direita, uma **composição de bilhetes**, que é um mini widget feito com os componentes, não um screenshot. Abaixo, prova social numérica com `tabular-nums` |
| Features | Grade (`md:grid-cols-2 lg:grid-cols-3`) com 6 cards: Sorteios, Concursos com votação, Ações de entrada, Indicação de amigos, Widget para qualquer site e Sorteio auditável. O ícone fica num quadrado `size-12 rounded-md bg-accent border-2 border-foreground shadow-pop-sm`. Sem animação de entrada (o AOS sai) |
| Como funciona | 3 passos numerados em bilhetes (`ticket`) |
| Pricing | 3 planos em cards. O recomendado tem `border-2 border-foreground shadow-pop` e o Badge `points` "Mais escolhido": o destaque vem da borda, da sombra **e** do texto. Preço em `font-display text-4xl tabular-nums`, lista com `fa-check text-success` e texto, e CTA `outline` (ou `primary` no recomendado) |
| CTA final | Faixa `rounded-xl bg-secondary text-secondary-foreground`, com título e CTA `accent lg pop` |
| Footer | `border-t border-border bg-surface`. Logo, colunas de links (Produto, Empresa e Legal), idioma e redes com `fa-brands` (os ícones `bi-*` saem). Os textos placeholder do iLanding são removidos |

Regras:

- Sem vídeo em glightbox. O vídeo, se houver, abre num Modal com `<iframe title>`.
- Sem carrossel swiper.
- Imagens `webp` com `width`, `height` e `loading="lazy"` abaixo da dobra.
