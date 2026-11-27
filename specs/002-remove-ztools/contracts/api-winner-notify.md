# API Contract: Notificação de vencedores (WinnerController)

**Auth**: `Authorization: Basic {token}` (NAuth), `[Authorize]`

As rotas não mudam. Só a resposta do `notifyall` ganha campos novos, e é compatível com a
anterior porque continua sendo um `StatusResult`.

## POST /api/Winner/notify/{winnerId}

Sem mudança de contrato.

| Situação | Status | Corpo |
|---|---|---|
| E-mail aceito pelo MailerSend | 200 | `StatusResult { sucesso: true, mensagem: "Winner notified successfully" }` |
| Vencedor ou campanha inexistente | 500 | Mensagem da exceção |
| Participante sem e-mail | 500 | `"Client {id} has no email address."` |
| MailerSend recusou ou não respondeu | 500 | Mensagem clara do provedor, ex.: `"MailerSend: token inválido (MailerSend__ApiToken)"` |

Em todos os casos de erro, o vencedor continua com `notified = false`.

## POST /api/Winner/notifyall/{campaignId}

**Mudança**: a resposta passa de `StatusResult` para `NotifyAllResult`.

| Situação | Status | `sucesso` |
|---|---|---|
| Todos os pendentes foram notificados (ou não havia pendentes) | 200 | `true` |
| Um ou mais envios falharam | 200 | `false` |
| Erro inesperado antes do processamento (ex.: banco indisponível) | 500 | Mensagem da exceção |

### Exemplo: falha parcial

```json
{
  "sucesso": false,
  "mensagem": "2 de 3 vencedores notificados",
  "erros": ["Ana <ana@exemplo.com>: MailerSend: The from.email domain must be verified"],
  "total": 3,
  "notificados": 2,
  "falhas": [
    {
      "winnerId": 42,
      "clientName": "Ana",
      "email": "ana@exemplo.com",
      "motivo": "MailerSend: The from.email domain must be verified"
    }
  ]
}
```

### Exemplo: nenhum pendente

```json
{ "sucesso": true, "mensagem": "0 de 0 vencedores notificados", "erros": [], "total": 0, "notificados": 0, "falhas": [] }
```

## Tipo TypeScript (frontend)

```ts
// frontend/src/types/winner.ts
export interface NotifyFailureInfo {
  winnerId: number;
  clientName: string | null;
  email: string | null;
  motivo: string;
}

export interface NotifyAllResult extends StatusResult {
  total: number;
  notificados: number;
  falhas: NotifyFailureInfo[];
}
```
