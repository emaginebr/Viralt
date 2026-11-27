# Contrato: build e execução do frontend

Este contrato vale para a equipe, para o `devops-engineer` e para o pipeline.

## Scripts (`frontend/package.json`)

| Script | Comando | Resultado |
|---|---|---|
| `dev` | `vite` | Dev server em `http://localhost:3000` com HMR |
| `start` | `vite` | Alias de `dev`, mantido para compatibilidade com o hábito do CRA |
| `build` | `tsc --noEmit && vite build` | Typecheck mais build em `frontend/build/` |
| `preview` | `vite preview --port 3000` | Serve o `build/` localmente |
| `test` | `vitest run` | Testes unitários, sem modo watch |

- `npm ci` / `npm install` **sem** `--legacy-peer-deps`.
- Node ≥ 20 (imagem `node:22-alpine`).

## Saída

- Pasta `frontend/build/`, com `index.html` na raiz. Os assets com hash ficam em `assets/` e o
  conteúdo de `public/` é copiado como está (`locales/`, `flags/`, `assets/img`, manifest, robots).
- `capacitor.config.json` → `webDir: "build"` (inalterado).

## Variáveis no build (Docker)

```dockerfile
ARG VITE_API_URL
ARG VITE_SITE_BASENAME=/
ENV VITE_API_URL=$VITE_API_URL VITE_SITE_BASENAME=$VITE_SITE_BASENAME
```

Os serviços de frontend no `docker-compose*.yml` passam `VITE_API_URL` em `build.args`.

## Servidor

O `nginx.conf` não muda: `try_files $uri $uri/ /index.html` (deep link) e o proxy de `/api/` para
a API.
