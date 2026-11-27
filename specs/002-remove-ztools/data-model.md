# Data Model: Remover a dependência do zTools

**Feature**: `002-remove-ztools` | **Date**: 2026-11-27

Esta feature **não altera o banco de dados**: não há tabelas nem colunas novas, e nenhuma
migration. As mudanças estão em DTOs, em classes de configuração e no estado `notified` do
vencedor, que já existe.

## Entidades existentes (sem mudança de schema)

### Winner (`winners`)

| Campo | Uso nesta feature |
|---|---|
| `winner_id` | Identifica o vencedor no resumo de falhas |
| `campaign_id` | Escopo do "notificar todos" |
| `client_id` | Busca nome e e-mail do participante |
| `notified` (`boolean`) | Passa a `true` **somente** após o MailerSend aceitar o envio (status 2xx) |

**Transição de estado** (sem mudança, agora com cobertura de teste):

```text
notified = false ──(envio aceito pelo MailerSend)──▶ notified = true
       ▲                                                  │
       └──(falha de envio, sem e-mail ou erro do provedor: permanece false)
```

Um "notificar todos" só processa vencedores com `notified = false`. Rodá-lo de novo tenta
apenas os que falharam antes.

### Client (`clients`)

A feature lê `name` e `email` para montar o destinatário. Sem alterações.

## DTOs novos

### `NotifyAllResult` (`backend/Viralt.DTO/Campaign/NotifyAllResult.cs`)

Estende `StatusResult` (`Viralt.DTO.Domain`), mantendo a compatibilidade com quem só lê
`sucesso`, `mensagem` e `erros`.

| Propriedade | JSON | Tipo | Regra |
|---|---|---|---|
| `Sucesso` | `sucesso` | bool | `true` somente se `Falhas` estiver vazia |
| `Mensagem` | `mensagem` | string | Ex.: `"3 de 4 vencedores notificados"` |
| `Erros` | `erros` | string[] | Uma linha por falha: `"{nome} <{email}>: {motivo}"` |
| `Total` | `total` | int | Vencedores com `notified = false` no início do processo |
| `Notificados` | `notificados` | int | Envios aceitos pelo provedor |
| `Falhas` | `falhas` | `NotifyFailureInfo[]` | Vazia quando todos foram notificados |

### `NotifyFailureInfo` (`backend/Viralt.DTO/Campaign/NotifyFailureInfo.cs`)

| Propriedade | JSON | Tipo | Regra |
|---|---|---|---|
| `WinnerId` | `winnerId` | long | |
| `ClientName` | `clientName` | string? | Pode ser nulo |
| `Email` | `email` | string? | Nulo quando o participante não tem e-mail |
| `Motivo` | `motivo` | string | Mensagem legível, ex.: `"Participante sem e-mail"` ou a mensagem do MailerSend |

Ambos os DTOs usam `[JsonPropertyName("camelCase")]` em todas as propriedades (Princípio IV).

## Classes de configuração novas (`backend/Viralt.DTO/Settings/`)

### `MailerSendSetting` (seção `MailerSend`)

| Propriedade | Variável | Obrigatória | Padrão |
|---|---|---|---|
| `ApiToken` | `MailerSend__ApiToken` | Sim, no primeiro envio | — |
| `FromEmail` | `MailerSend__FromEmail` | Não | `noreply@viralt.com` |
| `FromName` | `MailerSend__FromName` | Não | `Viralt` |
| `ApiUrl` | `MailerSend__ApiUrl` | Não | `https://api.mailersend.com/v1/` |

### `S3Setting` (seção `S3`)

| Propriedade | Variável | Obrigatória | Padrão |
|---|---|---|---|
| `BucketName` | `S3__BucketName` | Sim, no primeiro uso | `emagine` |
| `Prefix` | `S3__Prefix` | Não | `viralt/` (normalizado para terminar com `/`) |
| `Region` | `S3__Region` | Sim, se `ServiceUrl` estiver vazio | — |
| `ServiceUrl` | `S3__ServiceUrl` | Não | — (vazio = AWS) |
| `PublicBaseUrl` | `S3__PublicBaseUrl` | Não | — (vazio = `https://{bucket}.s3.{region}.amazonaws.com`) |
| `AccessKey` | `S3__AccessKey` | Não* | — |
| `SecretKey` | `S3__SecretKey` | Não* | — |

\* Se `AccessKey` e `SecretKey` estiverem vazias, vale a cadeia padrão de credenciais do AWS
SDK. Informar só uma das duas é erro de configuração.

## Regras de validação

| Regra | Origem | Onde |
|---|---|---|
| Vencedor só é marcado como notificado após resposta 2xx do MailerSend | FR-003 | `WinnerService.NotifyWinner` |
| Falha individual não interrompe o "notificar todos" | FR-005 | `WinnerService.NotifyAll` |
| Remetente vem da configuração quando `MailerInfo.From` for nulo | FR-006 | `MailerSendAppService` |
| Nome e título passam por HTML-encode no corpo do e-mail | Edge case | `WinnerService.NotifyWinner` |
| Chave do objeto sempre começa com o prefixo configurado | FR-010 | `ImageAppService.UploadFile` |
| Nome de arquivo com `/`, `\` ou `..` é rejeitado | FR-010 | `ImageAppService.GetImageUrl` |
| Nome do objeto é `{Guid:N}{ext}` | FR-012 | `ImageAppService.UploadFile` |
| Nome vazio retorna URL vazia | US3-4 | `ImageAppService.GetImageUrl` |
