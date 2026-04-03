# API Contract: Public Endpoints

> **Consultas publicas**: Migradas para GraphQL (`/graphql/public`). Ver `graphql-schemas.md`.
> REST mantem apenas mutations (register, complete-entry, vote, verify-email, track-view) e callbacks.

## PublicController (REST — Mutations)

**Auth**: Nenhuma

| Metodo | Rota | Body | Resposta |
|--------|------|------|----------|
| POST | /api/Public/register | RegisterRequest | RegisterResult |
| POST | /api/Public/complete-entry | CompleteEntryRequest | CompleteEntryResult |
| POST | /api/Public/vote/{submissionId} | — | StatusResult |
| POST | /api/Public/verify-email | VerifyEmailRequest | StatusResult |
| POST | /api/Public/track-view | TrackViewRequest | StatusResult |

## ExternalController (BazzucaMedia callback)

**Auth**: Header `X-BazzucaMedia-Key: {api_key}`

| Metodo | Rota | Body | Resposta |
|--------|------|------|----------|
| POST | /api/External/verify-entry | VerifyEntryRequest | StatusResult |
| POST | /api/External/bulk-verify | VerifyEntryRequest[] | StatusResult |

## Request/Response Schemas

### RegisterRequest
```json
{
  "campaignSlug": "promo-verao",
  "name": "Joao Silva",
  "email": "joao@email.com",
  "phone": "+5511999999999",
  "birthday": "1990-05-15",
  "referralToken": "abc123",
  "customFields": [
    { "fieldId": 1, "value": "Resposta" }
  ]
}
```

### RegisterResult
```json
{
  "sucesso": true,
  "mensagem": "Inscricao realizada",
  "token": "unique-participant-token",
  "referralLink": "https://domain/c/promo-verao?ref=xyz789",
  "totalEntries": 0
}
```

### CompleteEntryRequest
```json
{
  "token": "unique-participant-token",
  "entryId": 42,
  "entryValue": "https://visited-url.com"
}
```

### CompleteEntryResult
```json
{
  "sucesso": true,
  "mensagem": "Acao completada",
  "entriesEarned": 5,
  "totalEntries": 15
}
```

### VerifyEntryRequest (BazzucaMedia)
```json
{
  "campaignId": 123,
  "clientId": 456,
  "entryId": 789,
  "verified": true,
  "verificationData": { "platformUserId": "...", "actionTimestamp": "..." }
}
```

### VerifyEmailRequest
```json
{
  "token": "unique-participant-token",
  "code": "123456"
}
```

### TrackViewRequest
```json
{
  "campaignSlug": "promo-verao",
  "referrer": "https://external-site.com"
}
```

## Resumo: O que esta onde

| Operacao | Protocolo | Endpoint |
|----------|-----------|----------|
| Consultar campanha publica | GraphQL | `/graphql/public` |
| Leaderboard | GraphQL | `/graphql/public` |
| Galeria de submissoes | GraphQL | `/graphql/public` |
| Minhas entradas | GraphQL | `/graphql/public` |
| Vencedores publicos | GraphQL | `/graphql/public` |
| Registrar participante | REST | `POST /api/Public/register` |
| Completar acao | REST | `POST /api/Public/complete-entry` |
| Votar | REST | `POST /api/Public/vote/{id}` |
| Verificar e-mail | REST | `POST /api/Public/verify-email` |
| Rastrear visualizacao | REST | `POST /api/Public/track-view` |
| Callback BazzucaMedia | REST | `POST /api/External/verify-entry` |
