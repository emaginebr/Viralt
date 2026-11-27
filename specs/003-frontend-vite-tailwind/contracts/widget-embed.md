# Contrato: embed do widget (inalterado)

Sites de terceiros incorporam o widget por iframe. A migração **NÃO** pode alterar este contrato.

## URL

```
{origem-do-frontend}{VITE_SITE_BASENAME}/widget/{slug}
```

## Mensagem para o site pai

O `WidgetPage` envia a mensagem abaixo ao carregar, ao redimensionar e quando o conteúdo muda:

```json
{ "type": "viralt-resize", "slug": "<slug>", "height": <number> }
```

- Destino: `window.parent.postMessage(msg, '*')`.
- `height` é a altura real do **conteúdo** do widget em px, medida no elemento raiz do widget, por
  exemplo `rootEl.getBoundingClientRect().height` arredondado para cima, e não pelo
  `document.documentElement.scrollHeight`. O valor antigo nunca ficava menor que a altura do
  iframe, então o widget não encolhia. A medição é refeita via `ResizeObserver` sempre que o
  conteúdo muda, como na troca do formulário pela tela de sucesso.
- O widget **NÃO** usa `min-h-screen`/`min-h-dvh` nem altura de viewport no contêiner raiz.
- O formato da mensagem é o mesmo, então sites que já embutem o widget continuam funcionando.

## Garantias

- A estilização do widget fica dentro do documento do iframe, então não vaza para o site
  hospedeiro e não sofre com o CSS dele.
- O fundo do `html` e do `body` do widget é definido pelo design system. O iframe não depende de
  transparência.
- Falhas ao carregar a campanha continuam silenciosas: o widget não envia nenhuma mensagem de erro
  ao site pai.
