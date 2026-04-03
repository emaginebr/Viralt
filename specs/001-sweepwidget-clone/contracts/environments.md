# Contract: Environment Configuration

**Skill**: `/dotnet-env` | **Date**: 2026-04-02

## Arquivos por Ambiente

### Development

| Arquivo | Commitado | Descricao |
|---------|-----------|-----------|
| `appsettings.Development.json` | Sim | Todos os valores hardcoded (localhost DB, dev keys) |
| `Properties/launchSettings.json` | Sim | `ASPNETCORE_ENVIRONMENT=Development` |

### Docker (local)

| Arquivo | Commitado | Descricao |
|---------|-----------|-----------|
| `appsettings.Docker.json` | Sim | Valores vazios (preenchidos via env vars) |
| `.env` | **NAO** | Todos os valores reais |
| `.env.example` | Sim | Placeholders para documentacao |
| `docker-compose.yml` | Sim | API + frontend + postgres (portas expostas) |
| `Dockerfile` | Sim | Multi-stage build |

### Production

| Arquivo | Commitado | Descricao |
|---------|-----------|-----------|
| `appsettings.Production.json` | Sim | Valores nao-sensiveis preenchidos |
| `.env.prod` | **NAO** | Apenas secrets |
| `.env.prod.example` | Sim | Placeholders para secrets |
| `docker-compose-prod.yml` | Sim | API + frontend + postgres + nginx (porta 80, sem SSL) |
| `.github/workflows/deploy-prod.yml` | Sim | Pipeline SSH deploy |

## Formato appsettings.Docker.json

```json
{
  "ConnectionStrings": {
    "ViraltContext": ""
  },
  "NAuth": {
    "BaseUrl": "",
    "AppKey": ""
  },
  "zTools": {
    "FileClient": {
      "BucketName": "",
      "AccessKey": "",
      "SecretKey": ""
    },
    "MailClient": {
      "ApiKey": ""
    }
  },
  "BazzucaMedia": {
    "ApiKey": ""
  },
  "Recaptcha": {
    "SiteKey": "",
    "SecretKey": ""
  }
}
```

> Valores vazios preenchidos via env vars usando convencao `__` do ASP.NET Core.

## Formato .env.example

```env
# Database
ConnectionStrings__ViraltContext=Host=postgres;Port=5432;Database=viralt;Username=postgres;Password=YOUR_PASSWORD

# NAuth
NAuth__BaseUrl=https://your-nauth-url
NAuth__AppKey=YOUR_APP_KEY

# zTools
zTools__FileClient__BucketName=your-bucket
zTools__FileClient__AccessKey=YOUR_ACCESS_KEY
zTools__FileClient__SecretKey=YOUR_SECRET_KEY
zTools__MailClient__ApiKey=YOUR_MAILERSEND_KEY

# BazzucaMedia
BazzucaMedia__ApiKey=YOUR_BAZZUCA_KEY

# Recaptcha
Recaptcha__SiteKey=YOUR_RECAPTCHA_SITE_KEY
Recaptcha__SecretKey=YOUR_RECAPTCHA_SECRET_KEY

# Frontend
VITE_API_URL=http://localhost:5000
VITE_GRAPHQL_ADMIN_URL=http://localhost:5000/graphql/admin
VITE_GRAPHQL_PUBLIC_URL=http://localhost:5000/graphql/public
```

## docker-compose.yml (Local)

Servicos:
- **api**: Viralt.API (.NET 8), porta 5000, env `Docker`, depende de postgres
- **frontend**: viralt-app (Vite build + serve), porta 3000
- **postgres**: PostgreSQL 16, porta 5432 exposta, volume persistente

## docker-compose-prod.yml (Production)

Servicos:
- **api**: Viralt.API, porta interna 5000 (nao exposta)
- **frontend**: viralt-app build estatico
- **postgres**: PostgreSQL 16, porta NAO exposta, volume persistente
- **nginx**: Reverse proxy, **apenas porta 80**, sem SSL, proxy_pass para api e frontend

> **Nota**: SSL nao ativado em nenhum ambiente por decisao do usuario.

## Deploy Pipeline (.github/workflows/deploy-prod.yml)

Trigger: push para `main` (ou tag)
Steps:
1. Checkout
2. SSH into server
3. Pull latest code
4. Copy `.env.prod` (pre-existente no server)
5. `docker compose -f docker-compose-prod.yml up -d --build`
6. Health check

## .gitignore Additions

```
.env
.env.prod
```
