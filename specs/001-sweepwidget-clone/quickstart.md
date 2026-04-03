# Quickstart: SweepWidget Clone

**Branch**: `001-sweepwidget-clone` | **Date**: 2026-04-02

## Pre-requisitos

- .NET 8 SDK
- Node.js 18+
- PostgreSQL rodando e acessivel
- Configuracao de appsettings.Development.json com ConnectionStrings:ViraltContext

## Backend

```bash
# Aplicar migrations (a partir da raiz do projeto)
dotnet ef database update --project Viralt.Infra --startup-project Viralt.API

# Rodar API
dotnet run --project Viralt.API
```

API disponivel em https://localhost:5001 (ou porta configurada).

**Endpoints:**
- GraphQL Admin: https://localhost:5001/graphql/admin (Banana Cake Pop playground)
- GraphQL Public: https://localhost:5001/graphql/public
- REST Mutations: https://localhost:5001/api/*
- Swagger: https://localhost:5001/swagger (apenas mutations REST)

## Frontend

```bash
cd viralt-app
npm install --legacy-peer-deps
npm start
```

App disponivel em http://localhost:3000.

## Fluxo de Verificacao

### 1. Testar GraphQL (playground)

1. Acessar https://localhost:5001/graphql/admin
2. Executar query:
   ```graphql
   {
     campaigns(take: 5) {
       items {
         campaignId
         title
         status
         totalParticipants
       }
       totalCount
     }
   }
   ```
3. Acessar https://localhost:5001/graphql/public
4. Executar query:
   ```graphql
   {
     campaign(slug: "minha-campanha") {
       title
       description
       prizes { title image }
       entries { title entries }
     }
   }
   ```

### 2. Criar campanha (admin)

1. Fazer login como admin
2. Acessar painel de campanhas
3. Clicar "Nova Campanha"
4. Preencher: titulo, descricao, datas, pelo menos 1 premio
5. Adicionar metodos de entrada
6. Personalizar cores/logo
7. Publicar

### 3. Participar (visitante)

1. Acessar landing page via slug: `/c/{slug}`
2. Preencher formulario de inscricao (nome, e-mail)
3. Completar acoes disponiveis
4. Verificar total de entradas e posicao no leaderboard
5. Compartilhar link de indicacao

### 4. Sortear vencedores (admin)

1. Encerrar campanha
2. Acessar painel de selecao de vencedores
3. Escolher metodo (aleatorio, leaderboard, manual)
4. Confirmar vencedores
5. Notificar por e-mail

### 5. Widget (qualquer site)

```html
<div id="viralt-widget" data-campaign="{slug}"></div>
<script src="https://{domain}/widget.js"></script>
```

## Ambientes

### Development (padrao)

Os comandos acima rodam em Development. Sem configuracao adicional alem do `appsettings.Development.json`.

### Docker (local)

```bash
# Copiar .env.example para .env e preencher valores
cp .env.example .env

# Subir containers
docker compose up -d --build

# API: http://localhost:5000
# Frontend: http://localhost:3000
# GraphQL Admin: http://localhost:5000/graphql/admin
# GraphQL Public: http://localhost:5000/graphql/public
```

### Production (deploy)

```bash
# No servidor: copiar .env.prod.example e preencher secrets
cp .env.prod.example .env.prod

# Deploy via GitHub Actions (push para main)
# Ou manual:
docker compose -f docker-compose-prod.yml up -d --build

# Acesso: http://seu-servidor (porta 80, sem SSL)
```

> Sem SSL. Nginx expoe apenas porta 80. Ver `contracts/environments.md`.

## Validacao de Sucesso

- [ ] GraphQL admin retorna campanhas com paginacao e filtros
- [ ] GraphQL public retorna campanha por slug sem campos sensiveis
- [ ] Campanha criada via REST e visivel via GraphQL
- [ ] Participante inscrito com token unico
- [ ] Entradas acumuladas corretamente
- [ ] Referral link funciona e credita bonus
- [ ] Sorteio seleciona vencedores
- [ ] E-mail enviado aos vencedores
- [ ] Widget renderiza em iframe responsivo
- [ ] CSV exportado com dados corretos
- [ ] Banana Cake Pop playground funciona em Development
- [ ] Docker compose local sobe todos os servicos
- [ ] Production deploy via GitHub Actions funciona
- [ ] Producao acessivel via porta 80 (HTTP)
- [ ] `.env` e `.env.prod` NAO estao no git
