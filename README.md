# 🧬 Viralt

**Viralt** is a viral campaign and gamification platform, designed for brands, content creators, and companies to create high-conversion marketing experiences. Inspired by platforms like SweepWidget, Viralt makes it easy to build giveaways, contests, social actions, and reward-based engagement through a gamified system.

👉 Live at: [https://viralt.net](https://viralt.net)

---

## 🚀 Tech Stack

- 🖥️ **Frontend:** React 18 + TypeScript, Vite 6, Tailwind CSS 4 ("Bilhete Premiado" design system, see [`docs/design/README.md`](docs/design/README.md))  
- ⚙️ **Backend:** .NET Core 8  
- 🗄️ **Database:** PostgreSQL  
- 📦 **Containerization:** Docker  
- 🔁 **CI/CD:** GitHub Actions  
- 📊 **Analytics:** Google Analytics  

---

## 🧩 Key Features

- Drag-and-drop campaign builder
- Points, levels, badges, and user ranking system
- Viral social actions (follow, like, share)
- Automatic prize draws and winner selection
- Integration with major social platforms and email marketing tools
- Admin dashboard with real-time metrics and reports

---

## 📁 Project Structure

```
backend/     → .NET 8 solution (Viralt.sln, Viralt.API, Viralt.Domain, Viralt.Infra, ...) + Dockerfile
frontend/    → React + TypeScript app (Vite + Tailwind CSS 4) + Dockerfile and nginx.conf
nginx/       → Reverse proxy config used in production
SQL/         → Database backups
docs/        → Project documentation (design system in docs/design/)
specs/       → Feature specifications (Spec Kit)
iLanding/    → Static landing page template
```

---

## 🛠️ Running Locally

### Requirements

- Docker & Docker Compose
- Git
- .NET 8 SDK (optional, for direct backend run)
- Node.js 20+ (optional, for direct frontend run)

### Steps

```bash
# Clone the repository
git clone https://github.com/your-user/viralt.git
cd viralt

# Run the app with Docker
docker-compose up --build
```

### Running the frontend directly

```bash
cd frontend
npm install        # no --legacy-peer-deps needed
npm run dev        # dev server at http://localhost:3000 (npm start is an alias)
npm run build      # tsc --noEmit && vite build → build/
npm run preview    # serves the production build on port 3000
npm test           # Vitest
```

Frontend environment variables (`frontend/.env`). Vite only exposes `VITE_*` variables, and `REACT_APP_*` is no longer used:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL. If empty, the app uses the same origin |
| `VITE_SITE_BASENAME` | Router base path |
| `VITE_PROJECT_NAME` | Project name shown in the UI |
| `VITE_WEBSITE_NAME` | Site name used in the page `<title>` |

See [`frontend/README.md`](frontend/README.md) for the frontend details and [`docs/design/README.md`](docs/design/README.md) for the "Bilhete Premiado" design system.
