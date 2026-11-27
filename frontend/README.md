# Viralt Frontend

Web client for **Viralt**: the admin dashboard (campaign builder, participants, winners, moderation), the public campaign page and the embeddable widget.

---

## Tech Stack

- **React 18** + **TypeScript 5**
- **Vite 6** (dev server, build, preview) with `@vitejs/plugin-react`
- **Tailwind CSS 4** through `@tailwindcss/vite`, with tokens from the "Bilhete Premiado" design system
- **Radix UI** for modals, alert dialogs, dropdown menus and tabs
- **sonner** for toasts
- **FontAwesome** for icons
- **@fontsource-variable** for self-hosted fonts (Bricolage Grotesque, Figtree, JetBrains Mono)
- **react-router-dom 6** for routing
- **i18next** / **react-i18next** for i18n (pt, en, es)
- **Vitest** + **Testing Library** + **jsdom** for tests

---

## Requirements

- **Node.js 20 or newer.** The Docker image uses `node:22-alpine`.
- npm (ships with Node)

---

## Getting Started

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

`npm install` no longer needs `--legacy-peer-deps`.

---

## Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Starts the dev server on port 3000 |
| `npm start` | `vite` | Alias of `npm run dev` |
| `npm run build` | `tsc --noEmit && vite build` | Type-checks, then builds for production into `build/` |
| `npm run preview` | `vite preview --port 3000` | Serves the production build locally on port 3000 |
| `npm test` | `vitest run` | Runs the test suite once |

---

## Environment Variables

Vite only exposes variables with the `VITE_` prefix. They are read from `.env`, `.env.[mode]` and `.env.local` in the `frontend/` folder. `REACT_APP_*` variables are **no longer used**.

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL. If empty, the app calls the API on the same origin. In dev, when it is set, the Vite server also proxies `/api` to it | `https://localhost:44374` |
| `VITE_SITE_BASENAME` | Router base path, also used as the Vite `base` | `/` |
| `VITE_PROJECT_NAME` | Project name shown in the header and footer | `Viralt` |
| `VITE_WEBSITE_NAME` | Site name used in the `<title>` of `index.html` | `Viralt - Viral Digital Marketing` |

Example `.env`:

```env
VITE_SITE_BASENAME=/
VITE_PROJECT_NAME=Viralt
VITE_WEBSITE_NAME=Viralt - Viral Digital Marketing
VITE_API_URL=https://localhost:44374
```

> `VITE_*` values are embedded at build time. Changing them requires a new build.

---

## Project Structure

```
frontend/
├── index.html              → Vite entry HTML (<title> uses %VITE_WEBSITE_NAME%)
├── vite.config.ts          → Vite, Tailwind, dev proxy and Vitest config
├── nginx.conf              → nginx config used by the Docker image
├── public/
│   └── locales/            → i18n files (pt, en, es)/translation.json
└── src/
    ├── index.tsx           → App entry point
    ├── App.tsx             → Routes and provider chain
    ├── i18n.tsx            → i18next configuration
    ├── styles/
    │   ├── index.css       → Global styles (imports Tailwind and the theme)
    │   └── theme.css       → Design tokens (copy of docs/design/theme.css)
    ├── Components/
    │   ├── ui/             → Base components (Button, Input, Field, Modal, ConfirmModal,
    │   │                     DropdownMenu, Tabs, Table, Pagination, Toaster, ...)
    │   └── ...             → Shared app components (Header, Footer, CampaignWidget, ...)
    ├── Pages/              → Route pages (one folder per page with index.tsx)
    ├── Contexts/           → Context + Provider per entity
    ├── Services/           → API services (fetch-based) and apiHelpers.ts
    ├── hooks/              → Custom hooks (useAuth, useCampaign, useClient, ...)
    ├── types/              → TypeScript types for the new architecture
    ├── Business/, DTO/, Infra/ → Legacy layers
    └── test/               → Vitest setup and tests
```

New entities follow the `react-arch` skill: **Types → Service → Context → Hook → Provider**.

---

## Design System

The UI follows the **"Bilhete Premiado"** design system. Its documentation lives in [`docs/design/README.md`](../docs/design/README.md): tokens, component specs and HTML mockups.

- **Tokens:** `src/styles/theme.css` is a copy of [`docs/design/theme.css`](../docs/design/theme.css). If the tokens change, update the file in `docs/design/` and copy it again. Do not edit only the frontend copy.
- **Palette:** the default Tailwind palette is **disabled**. Use only the semantic tokens defined in the theme, not classes like `bg-blue-500`.
- **Base components:** import them from `src/Components/ui/` and do not restyle them in each page.
- **Fonts:** self-hosted through `@fontsource-variable`. No CDN is used.
- **Modals and menus:** Radix UI, wrapped by `Modal`, `ConfirmModal` and `DropdownMenu`.
- **Toasts:** sonner, through `Toaster`.
- **Icons:** FontAwesome (`@fortawesome/react-fontawesome`).

---

## Tests

```bash
npm test
```

Vitest runs in a `jsdom` environment with global APIs enabled. The setup file is `src/test/setup.ts`, and tests live in `src/test/`.

---

## Docker Build

The `Dockerfile` has two stages:

1. **build** (`node:22-alpine`): runs `npm ci` and `npm run build`.
2. **final** (`nginx:alpine`): serves `build/` with `nginx.conf` on port 80.

`VITE_API_URL` and `VITE_SITE_BASENAME` are passed as build args because they are embedded at build time:

```bash
docker build \
  --build-arg VITE_API_URL= \
  --build-arg VITE_SITE_BASENAME=/ \
  -t viralt-frontend ./frontend
```

Leave `VITE_API_URL` empty when the API is served on the same origin, for example behind the reverse proxy in `nginx/`. In the full stack, the image is built by `docker-compose.yml` / `docker-compose-prod.yml` at the repository root.

---

## Case Sensitivity

Folder casing matters in Docker and Linux builds. Imports must match the casing on disk exactly:

| Folder | Casing |
|---|---|
| `src/Contexts/` | uppercase **C** |
| `src/Services/` | uppercase **S** |
| `src/hooks/` | lowercase |
| `src/types/` | lowercase |

An import like `../contexts/AuthContext` works on Windows but fails in the Linux build.
