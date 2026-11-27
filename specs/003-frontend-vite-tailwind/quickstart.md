# Quickstart: validar a migração do frontend (003)

## 0. Baseline (antes de começar)

Com o código ainda em CRA, gerar o build e registrar em `specs/003-frontend-vite-tailwind/baseline.md`
o tamanho transferido, com gzip, ao abrir `/c/:slug`: JS + CSS + CSS vendorizado.

## 1. Design aprovado (gate)

Os arquivos abaixo, em `docs/design/`, precisam estar entregues e **aprovados pelo usuário**:

- `tokens.md` e `theme.css`, com a tabela de contraste dos pares texto/fundo;
- as especificações dos componentes base;
- os mockups HTML de `/c/:slug`, `/widget/:slug`, uma lista e um formulário administrativos.

## 2. Instalação e build limpos (US4, SC-007)

```bash
cd frontend
rm -rf node_modules build
npm ci                    # sem --legacy-peer-deps
npm run build             # tsc + vite build, 0 erros
npm test                  # vitest run, verde
npm run dev               # sobe em http://localhost:3000 em até 5 s (SC-004)
```

## 3. Nenhum resquício (SC-002)

```bash
cd frontend
grep -rnE "react-bootstrap|from ['\"]bootstrap|react-scripts|REACT_APP_|process\.env|%PUBLIC_URL%" src index.html package.json
grep -rn "assets/vendor/bootstrap" index.html
# esperado: nenhuma saída
grep -rn "REACT_APP_" ../docker-compose*.yml ../.env*.example ../CLAUDE.md
# esperado: nenhuma saída
```

## 4. Roteiro de regressão funcional (SC-001)

Percorrer as 27 telas do inventário em `data-model.md`, §3, e marcar cada uma como `verificada`:

- **Públicas**: inscrição completa em `/c/:slug`, num celular (375 px) e num desktop.
- **Widget**: embutir num HTML de teste
  `<iframe src="http://localhost:3000/widget/<slug>">` e conferir que a altura se ajusta pelo
  `postMessage`.
- **Admin**: login, criar campanha, sortear e "notificar todos" (o resumo aparece), moderar envio,
  criar produto (rich text e crop), paginar usuários.
- **i18n**: trocar para en e es, e conferir que o `lang` do `<html>` acompanha a troca.
- **Deep link**: dar F5 em `/campaigns/1/winners` no `npm run preview`.
- **Sessão**: um usuário logado antes da troca continua logado.

## 5. Acessibilidade (SC-006)

```bash
npm run preview &
npx @axe-core/cli http://localhost:3000/c/<slug> http://localhost:3000/widget/<slug> --exit
```

Resultado esperado: 0 violações. Conferir também, manualmente, a navegação só por teclado e o zoom
de 200%.

## 6. Desempenho (SC-005)

Repetir a medição do passo 0 no `npm run preview` e registrar em `baseline.md`. O total não pode
ser maior que o baseline.

## 7. Container

Rodar no WSL2 (skill `wsl-docker`):

```bash
docker build -t viralt-web --build-arg VITE_API_URL= ./frontend
docker run --rm -p 8081:80 viralt-web   # abrir http://localhost:8081/c/<slug> e dar F5 numa rota interna
```
