# API Contract: Admin REST Endpoints (Mutations Only)

**Auth**: `Authorization: Basic {token}` (NAuth) — Todos os endpoints requerem `[Authorize]`

> **Nota**: Todas as consultas (leitura) foram migradas para GraphQL (`/graphql/admin`). Ver `graphql-schemas.md`.
> REST mantem apenas mutations (insert, update, delete) e operacoes com side-effects.

## Campanhas — CampaignController

| Metodo | Rota | Body | Resposta |
|--------|------|------|----------|
| POST | /api/Campaign/insert | CampaignInsertInfo | CampaignGetResult |
| POST | /api/Campaign/update | CampaignUpdateInfo | CampaignGetResult |
| DELETE | /api/Campaign/delete/{id} | — | StatusResult |
| POST | /api/Campaign/duplicate/{id} | — | CampaignGetResult |
| POST | /api/Campaign/draw/{id} | DrawRequest | WinnerListResult |

## Campos — CampaignFieldController

| Metodo | Rota | Body | Resposta |
|--------|------|------|----------|
| POST | /api/CampaignField/insert | CampaignFieldInsertInfo | CampaignFieldGetResult |
| POST | /api/CampaignField/update | CampaignFieldUpdateInfo | CampaignFieldGetResult |
| DELETE | /api/CampaignField/delete/{id} | — | StatusResult |

## Metodos de Entrada — CampaignEntryController

| Metodo | Rota | Body | Resposta |
|--------|------|------|----------|
| POST | /api/CampaignEntry/insert | CampaignEntryInsertInfo | CampaignEntryGetResult |
| POST | /api/CampaignEntry/update | CampaignEntryUpdateInfo | CampaignEntryGetResult |
| POST | /api/CampaignEntry/reorder | ReorderRequest | StatusResult |
| DELETE | /api/CampaignEntry/delete/{id} | — | StatusResult |

## Premios — PrizeController

| Metodo | Rota | Body | Resposta |
|--------|------|------|----------|
| POST | /api/Prize/insert | PrizeInsertInfo | PrizeGetResult |
| POST | /api/Prize/update | PrizeUpdateInfo | PrizeGetResult |
| DELETE | /api/Prize/delete/{id} | — | StatusResult |

## Participantes — ClientController

| Metodo | Rota | Body | Resposta |
|--------|------|------|----------|
| GET | /api/Client/export/{campaignId}?format=csv | — | FileResult (CSV) |
| GET | /api/Client/export/{campaignId}?format=json | — | FileResult (JSON) |
| POST | /api/Client/disqualify/{id} | — | StatusResult |
| DELETE | /api/Client/delete/{id} | — | StatusResult |

> **Nota**: Export permanece REST porque retorna FileResult (download), nao JSON.

## Vencedores — WinnerController

| Metodo | Rota | Body | Resposta |
|--------|------|------|----------|
| POST | /api/Winner/notify/{winnerId} | — | StatusResult |
| POST | /api/Winner/notifyall/{campaignId} | — | StatusResult |

## DrawRequest

```json
{
  "winnerCount": 2,
  "selectionMethod": 1
}
```

selectionMethod: 1=Random, 2=Leaderboard, 3=Manual

## Padrao de Resposta

```json
{
  "sucesso": true,
  "mensagem": "...",
  "erros": null
}
```
