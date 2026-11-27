# 🧬 Viralt

**Viralt** is a viral campaign and gamification platform, designed for brands, content creators, and companies to create high-conversion marketing experiences. Inspired by platforms like SweepWidget, Viralt makes it easy to build giveaways, contests, social actions, and reward-based engagement through a gamified system.

👉 Live at: [https://viralt.net](https://viralt.net)

---

## 🚀 Tech Stack

- 🖥️ **Frontend:** React + Bootstrap 5  
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
frontend/    → React + TypeScript app (CRA) + Dockerfile
nginx/       → Reverse proxy config used in production
SQL/         → Database backups
docs/        → Project documentation
specs/       → Feature specifications (Spec Kit)
iLanding/    → Static landing page template
```

---

## 🛠️ Running Locally

### Requirements

- Docker & Docker Compose
- Git
- .NET 8 SDK (optional, for direct backend run)
- Node.js 18+ (optional, for direct frontend run)

### Steps

```bash
# Clone the repository
git clone https://github.com/your-user/viralt.git
cd viralt

# Run the app with Docker
docker-compose up --build
