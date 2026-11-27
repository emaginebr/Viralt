# Implementation Plan: Remover a dependência do zTools

**Branch**: `002-remove-ztools` | **Date**: 2026-11-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-remove-ztools/spec.md`

## Summary

Tirar o pacote e o serviço zTools do Viralt e trocar as duas capacidades que ele fornecia por
integrações diretas, mantendo as interfaces da Infra:

- **E-mail de premiação**: o `MailerSendAppService` passa a chamar a API REST v1 do MailerSend
  via `IHttpClientFactory`. O remetente sai do código para a configuração. Falhas viram
  exceções claras e o vencedor só é marcado como notificado após resposta 2xx.
- **"Notificar todos"**: continua com os demais quando um envio falha e devolve um
  `NotifyAllResult` (extensão compatível do `StatusResult`) com total, notificados e falhas. O
  frontend mostra o resumo e recarrega a lista.
- **Armazenamento**: o `ImageAppService` passa a usar o `AWSSDK.S3` no bucket `emagine`, prefixo
  `viralt/`, com nome único por GUID e URL pública e permanente, montada sem chamada de rede.
- **Limpeza**: saem o slug e a IA (não usados), a seção e as variáveis do zTools em appsettings,
  compose e `.env*.example`, e a skill `ztools-guide`. O `services.AddHttpClient()` **fica**,
  porque o `WebhookService` depende dele.

## Technical Context

**Language/Version**: C# / .NET 8.0 (backend); TypeScript 5.3 + React 18 (frontend, CRA)
**Primary Dependencies**: ASP.NET Core 8, EF Core 9, NAuth (mantido), **AWSSDK.S3 3.7.x (novo)**,
`IHttpClientFactory` (já registrado), xUnit + Moq (novo projeto de testes)
**Storage**: PostgreSQL (sem mudança de schema); S3, bucket `emagine`, prefixo `viralt/`
**Testing**: novo `backend/Viralt.Tests` (xUnit + Moq), via `qa-developer` / skill `dotnet-test`
**Target Platform**: container Linux (`backend/Dockerfile`), produção via `docker-compose-prod.yml` por SSH
**Project Type**: web application (backend .NET + frontend React)
**Performance Goals**: notificar um vencedor não fica mais lento que hoje (SC-007). Agora há uma
chamada HTTP a menos, porque o salto Viralt → zTools → MailerSend some. `GetImageUrl` deixa de
fazer chamada de rede
**Constraints**: credenciais só por configuração (`Secao__Chave`); nada gravado fora de
`viralt/`; sem ACL por objeto (bucket com ACLs desativadas); Docker inacessível no shell local
**Scale/Scope**: ~8 arquivos de backend, 4 de configuração na raiz, 3 de frontend, 1 projeto de
testes novo; nenhuma migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constituição v3.0.0.

| Princípio | Verificação | Status |
|---|---|---|
| I. Skills de Arquitetura | AppServices e DI seguem `dotnet-architecture`; o tipo e o service do frontend seguem `react-architecture` | ✅ |
| II. Stack Tecnológica Fixa | `AWSSDK.S3` 3.x e MailerSend via REST estão na tabela da v3.0.0; nenhum ORM, bundler ou state manager novo | ✅ |
| III. Case Sensitivity | Arquivos novos em `frontend/src/types/` (minúsculo) e `Services/` / `Contexts/` (maiúsculo) | ✅ |
| IV. Convenções de Código | DTOs novos com `[JsonPropertyName]`; os DTOs `MailerSend/*` existentes usam `[JsonProperty]` (Newtonsoft) por serem o formato da API externa e continuam assim | ✅ |
| V. Banco de Dados | Sem mudança de schema | ✅ N/A |
| VI. Autenticação e Segurança | Endpoints de notificação continuam `[Authorize]`; tokens e chaves só em configuração; nada exposto ao frontend | ✅ |
| VII. Tratamento de Erros | Controllers mantêm `try/catch → 500`; falha parcial do "notificar todos" volta 200 com resumo (decisão R4) | ✅ |
| VIII. Agentes Especializados | Backend → `dotnet-developer`; testes → `qa-developer`; frontend → `react-developer`. O resumo reutiliza o alerta Bootstrap da tela, sem passar pelo `ux-designer` (R10) | ✅ |
| IX. Acessibilidade | Resumo com `role="status"` / `aria-live="polite"`, falhas em lista semântica, sem depender só de cor | ✅ |
| X. Integrações Externas | E-mail e S3 diretos, atrás de `IMailerSendAppService` / `IImageAppService`; bucket `emagine`, prefixo `viralt/`; zTools removido | ✅ |
| Variáveis de Ambiente | `MailerSend__ApiUrl` e `S3__PublicBaseUrl` (opcionais) não estão na tabela | ⚠ → emenda PATCH 3.0.1 (tarefa de documentação) |

**Resultado do gate**: aprovado. O único ponto (⚠) é documental, sem violação de regra.

**Re-check pós-design (Phase 1)**: os contratos (`contracts/`) mantêm as interfaces da Infra, e
o `NotifyAllResult` estende o `StatusResult`. Nenhuma violação nova. ✅

## Project Structure

### Documentation (this feature)

```text
specs/002-remove-ztools/
├── plan.md                       # este arquivo
├── research.md                   # decisões R1–R10
├── data-model.md                 # DTOs, settings e estado notified
├── quickstart.md                 # roteiro de validação
├── contracts/
│   ├── api-winner-notify.md      # notify / notifyall (NotifyAllResult)
│   └── infra-appservices.md      # IMailerSendAppService / IImageAppService
├── checklists/requirements.md
└── tasks.md                      # gerado por /speckit.tasks
```

### Source Code (repository root)

```text
backend/
├── Viralt.DTO/
│   ├── Campaign/NotifyAllResult.cs          # NOVO
│   ├── Campaign/NotifyFailureInfo.cs        # NOVO
│   └── Settings/                            # NOVO
│       ├── MailerSendSetting.cs
│       └── S3Setting.cs
├── Viralt.Infra/
│   ├── Viralt.Infra.csproj                  # - zTools, + AWSSDK.S3
│   └── AppServices/
│       ├── MailerSendAppService.cs          # REESCRITO: HttpClient → MailerSend v1
│       └── ImageAppService.cs               # REESCRITO: IAmazonS3, sem FormFileWrapper
├── Viralt.Domain/
│   ├── Interfaces/Services/IWinnerService.cs # NotifyAll → NotifyAllResult
│   └── Services/WinnerService.cs            # sem remetente fixo, HtmlEncode, NotifyAll tolerante
├── Viralt.Application/Startup.cs            # - região zTools, + MailerSend/S3 (mantém AddHttpClient)
├── Viralt.API/
│   ├── Controllers/WinnerController.cs      # notifyall retorna NotifyAllResult
│   ├── Controllers/ImageController.cs       # remove a injeção não usada de IImageAppService
│   └── appsettings*.json                    # - zTools, + MailerSend, + S3
└── Viralt.Tests/                            # NOVO (xUnit + Moq)
    ├── Domain/Services/WinnerServiceTests.cs
    └── Infra/AppServices/
        ├── MailerSendAppServiceTests.cs
        └── ImageAppServiceTests.cs

frontend/src/
├── types/winner.ts                          # + NotifyAllResult, NotifyFailureInfo
├── Services/winnerService.ts                # notifyAll → NotifyAllResult
├── Contexts/WinnerContext.tsx               # não marca todos; recarrega a lista
└── Pages/WinnerSelectionPage/index.tsx      # resumo + lista de falhas (aria-live)

(raiz)
├── docker-compose.yml / docker-compose-prod.yml   # - zTools__ApiURL, + MailerSend__*, S3__*
├── .env.example / .env.prod.example               # - ZTOOLS_API_URL, + MAILERSEND_*, S3_*
├── .specify/memory/constitution.md                # PATCH 3.0.1: variáveis opcionais
└── .claude/skills/ztools-guide/                   # REMOVER
```

**Structure Decision**: web application com `backend/` (.NET, Clean Architecture) e
`frontend/` (React CRA), seguindo a seção "Estrutura do Repositório" da constituição. O
projeto de testes fica em `backend/Viralt.Tests` e entra no `Viralt.sln`. O `ImageController`
perde a injeção de `IImageAppService`, que nunca é usada, mas o service continua registrado
no DI para uso futuro (US3).

## Ordem de execução sugerida (por agente)

1. **dotnet-developer**: DTOs e settings → `MailerSendAppService` → `WinnerService` e
   `IWinnerService` → `WinnerController` → `ImageAppService` → `Startup` e `csproj` →
   appsettings, compose e `.env*.example`. Build verde.
2. **qa-developer**: cria `Viralt.Tests` e os testes de R9. `dotnet test` verde.
3. **react-developer**: tipo, service, context e página. Depende do contrato
   `api-winner-notify.md`, não do backend pronto.
4. **Sessão principal**: emenda PATCH 3.0.1 da constituição, `CLAUDE.md` (Testing e Env Vars),
   remoção de `.claude/skills/ztools-guide` e verificação do `git grep -i ztools` (SC-003).

## Complexity Tracking

Nenhuma violação da constituição a justificar.
