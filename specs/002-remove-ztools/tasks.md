---

description: "Task list for feature 002-remove-ztools"
---

# Tasks: Remover a dependência do zTools

**Input**: Design documents from `/specs/002-remove-ztools/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: incluídos. O plano (research R9) pede testes unitários para as regras críticas
FR-003, FR-005, FR-010 e FR-012. Eles são escritos antes da implementação e devem falhar
primeiro.

**Organization**: tarefas agrupadas por user story. Cada tarefa indica o **agente responsável**
(constituição, Princípio VIII):

- `[backend]` → `dotnet-developer`
- `[qa]` → `qa-developer`
- `[frontend]` → `react-developer`
- `[main]` → sessão principal, só para artefatos em `specs/`, `.specify/`, `CLAUDE.md`, `.claude/` e verificações

**Ordem das fases**: US1 (P1) → US3 (P3) → US2 (P1). A US2, "sobe sem o zTools", só pode ser
concluída depois que **as duas** capacidades (e-mail e S3) deixarem de usar o pacote. Por isso
ela é a fase de remoção final, mesmo sendo P1. Veja "Dependencies".

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: user story da spec (US1, US2, US3)
- Caminhos relativos à raiz do repositório `C:\repos\Viralt`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: dependências e projeto de testes

- [X] T001 [backend] Adicionar `<PackageReference Include="AWSSDK.S3" Version="3.7.*" />` em `backend/Viralt.Infra/Viralt.Infra.csproj`. **Não** remover o `zTools` ainda, porque ele sai em T022
- [X] T002 [P] [qa] Criar o projeto xUnit `backend/Viralt.Tests/Viralt.Tests.csproj` (net8.0, `xunit`, `xunit.runner.visualstudio`, `Microsoft.NET.Test.Sdk`, `Moq`), com `ProjectReference` para `Viralt.Domain`, `Viralt.Infra`, `Viralt.Infra.Interfaces` e `Viralt.DTO`, pastas `Domain/Services/` e `Infra/AppServices/`, e adicioná-lo em `backend/Viralt.sln` (`dotnet sln add`), seguindo a skill `dotnet-test`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: configurações e registro no DI, usados por US1 e US3

**⚠️ CRITICAL**: nenhuma user story começa antes desta fase

- [X] T003 [P] [backend] Criar `backend/Viralt.DTO/Settings/MailerSendSetting.cs` (namespace `Viralt.DTO.Settings`) com `ApiToken`, `FromEmail` (padrão `noreply@viralt.com`), `FromName` (padrão `Viralt`) e `ApiUrl` (padrão `https://api.mailersend.com/v1/`), conforme `data-model.md`
- [X] T004 [P] [backend] Criar `backend/Viralt.DTO/Settings/S3Setting.cs` com `BucketName` (padrão `emagine`), `Prefix` (padrão `viralt/`), `Region`, `ServiceUrl`, `PublicBaseUrl`, `AccessKey` e `SecretKey`, conforme `data-model.md`
- [X] T005 [backend] Em `backend/Viralt.Application/Startup.cs`, numa nova região `#region External integrations`, fazer o seguinte. A região `zTools` continua por enquanto:
  - registrar `services.Configure<MailerSendSetting>(configuration.GetSection("MailerSend"))`;
  - registrar `services.Configure<S3Setting>(configuration.GetSection("S3"))`;
  - registrar o `HttpClient` nomeado `"MailerSend"` (`BaseAddress` = `ApiUrl`, `Timeout` = 30 s);
  - registrar `IAmazonS3` singleton, montado a partir de `S3Setting`. Se `ServiceUrl` vier preenchido, usar `AmazonS3Config { ServiceURL, ForcePathStyle = true }`; caso contrário, `RegionEndpoint.GetBySystemName(Region)`. Usar `BasicAWSCredentials` quando `AccessKey` e `SecretKey` estiverem preenchidas, e a cadeia padrão de credenciais quando ambas estiverem vazias (research R5 e R8).
- [X] T006 [P] [backend] Adicionar as seções `"MailerSend": { "ApiToken": "", "FromEmail": "noreply@viralt.com", "FromName": "Viralt" }` e `"S3": { "BucketName": "emagine", "Prefix": "viralt/", "Region": "", "ServiceUrl": "", "PublicBaseUrl": "", "AccessKey": "", "SecretKey": "" }` em `backend/Viralt.API/appsettings.json`, `appsettings.Docker.json` e `appsettings.Production.json`, sem segredos

**Checkpoint**: `dotnet build backend/Viralt.sln` verde; o comportamento ainda não mudou

---

## Phase 3: User Story 1 - Vencedor continua recebendo o e-mail de premiação (Priority: P1) 🎯 MVP

**Goal**: e-mail de premiação enviado direto pelo MailerSend, com o mesmo conteúdo de hoje. O
"notificar todos" fica tolerante a falhas, com resumo, e o vencedor só é marcado após envio
aceito.

**Independent Test**: quickstart, passo 5. Notificar um vencedor e usar "notificar todos" numa
campanha com um participante sem e-mail. Espere o e-mail recebido, o resumo com 1 falha e
`notified` correto.

### Tests for User Story 1 ⚠️

> Escrever primeiro. Devem FALHAR antes da implementação.

- [X] T007 [P] [US1] [qa] Criar `backend/Viralt.Tests/Infra/AppServices/MailerSendAppServiceTests.cs`, com `HttpMessageHandler` falso e `IHttpClientFactory` mockado, testando:
  - 202 → `true`;
  - `From` nulo → preenchido com `FromEmail`/`FromName` da configuração;
  - `ApiToken` vazio → `InvalidOperationException` sem chamar o handler;
  - 401 → mensagem cita `MailerSend__ApiToken`;
  - 422 com corpo `{ "message": "...", "errors": {...} }` → mensagem contém o `message`;
  - timeout (`TaskCanceledException`) → `InvalidOperationException("MailerSend indisponível...")`.

  Contrato em `contracts/infra-appservices.md`.
- [X] T008 [P] [US1] [qa] Criar `backend/Viralt.Tests/Domain/Services/WinnerServiceTests.cs`, com repositórios e `IMailerSendAppService` mockados, testando:
  - `NotifyWinner` com sucesso → `Notified = true` e `Update` chamado uma vez;
  - `NotifyWinner` com `SendMail` lançando exceção → exceção propagada e `Update` **nunca** chamado (FR-003, SC-004);
  - `NotifyWinner` com `MailerInfo.From` nulo (remetente vem da Infra);
  - título `"<b>Promo & Cia</b>"` → `Html` contém `&lt;b&gt;Promo &amp; Cia&lt;/b&gt;`;
  - `NotifyAll` com 3 pendentes, sendo um sem e-mail e um com falha do provedor → `Total = 3`, `Notificados = 1`, `Falhas.Count = 2`, `Sucesso = false`, motivos `"Participante sem e-mail"` e a mensagem do provedor, e `Erros` com 2 linhas;
  - `NotifyAll` sem pendentes → `Sucesso = true`, `Total = 0`;
  - `NotifyAll` ignora vencedores já notificados.

### Implementation for User Story 1

- [X] T009 [P] [US1] [backend] Criar `backend/Viralt.DTO/Campaign/NotifyFailureInfo.cs` (`WinnerId`, `ClientName`, `Email`, `Motivo`) e `backend/Viralt.DTO/Campaign/NotifyAllResult.cs`. O `NotifyAllResult` estende `Viralt.DTO.Domain.StatusResult` com `Total`, `Notificados` e `Falhas` (`List<NotifyFailureInfo>`, iniciada vazia). Usar `[JsonPropertyName("camelCase")]` em todas as propriedades novas, conforme `data-model.md`
- [X] T010 [US1] [backend] Reescrever `backend/Viralt.Infra/AppServices/MailerSendAppService.cs`:
  - injetar `IHttpClientFactory` e `IOptions<MailerSendSetting>`;
  - validar `ApiToken`;
  - preencher `From` quando vier nulo;
  - fazer `POST "email"` com `Authorization: Bearer`, serializando o `MailerInfo` com Newtonsoft (os DTOs usam `[JsonProperty]`);
  - 2xx → `true`. Erros mapeados como em `contracts/infra-appservices.md`, desserializando `MailerErrorInfo` no 422;
  - remover todo `using zTools`.
- [X] T011 [US1] [backend] Em `backend/Viralt.Domain/Interfaces/Services/IWinnerService.cs`, mudar a assinatura para `NotifyAllResult NotifyAll(long campaignId)`
- [X] T012 [US1] [backend] Em `backend/Viralt.Domain/Services/WinnerService.cs`:
  - remover o `From` fixo do `MailerInfo` (deixar `null`);
  - aplicar `System.Net.WebUtility.HtmlEncode` ao nome do participante e ao título da campanha no `Html`, mantendo o mesmo texto;
  - marcar `Notified = true` e chamar `Update` somente após `SendMail` retornar sem exceção;
  - reescrever `NotifyAll`: lista os pendentes, chama `NotifyWinner` em `try/catch` individual e acumula o `NotifyFailureInfo` (participante sem e-mail → motivo `"Participante sem e-mail"`; outras exceções → `ex.Message`);
  - devolver um `NotifyAllResult` com `Mensagem = $"{notificados} de {total} vencedores notificados"`, `Erros` = `"{nome} <{email}>: {motivo}"` e `Sucesso = falhas.Count == 0`.

  Decisão R4. Faz T008 passar.
- [X] T013 [US1] [backend] Em `backend/Viralt.API/Controllers/WinnerController.cs`, fazer o `NotifyAll` retornar `Ok(_winnerService.NotifyAll(campaignId))` (`ActionResult<NotifyAllResult>`), mantendo o `try/catch → 500` para erros inesperados (`contracts/api-winner-notify.md`)
- [X] T014 [P] [US1] [frontend] Em `frontend/src/types/winner.ts`, adicionar `NotifyFailureInfo` e `NotifyAllResult extends StatusResult` (`total`, `notificados`, `falhas`), exatamente como em `contracts/api-winner-notify.md`. Importar `StatusResult` do mesmo arquivo de tipos que o `winnerService.ts` já usa
- [X] T015 [US1] [frontend] Em `frontend/src/Services/winnerService.ts`, fazer o `notifyAll` retornar `Promise<NotifyAllResult>` e usar `this.handleResponse<NotifyAllResult>`
- [X] T016 [US1] [frontend] Em `frontend/src/Contexts/WinnerContext.tsx`:
  - `notifyAllWinners` passa a retornar `Promise<NotifyAllResult>`;
  - remover o `setWinners` que marca todos como notificados quando `sucesso` é verdadeiro;
  - após a chamada, recarregar a lista com `loadWinners(campaignId)`;
  - atualizar o tipo no `WinnerContextType`.
- [X] T017 [US1] [frontend] Em `frontend/src/Pages/WinnerSelectionPage/index.tsx`:
  - guardar o `NotifyAllResult` retornado por `handleNotifyAll` num estado `notifyResult`;
  - renderizar, abaixo do título, um alerta Bootstrap (`div.alert`, no mesmo padrão do alerta de erro já existente), `alert-success` sem falhas e `alert-warning` com falhas, com `role="status"`, `aria-live="polite"` e botão de fechar com `aria-label`;
  - mostrar no alerta a `mensagem` e, se houver falhas, um `<ul>` com `{clientName ?? 'Sem nome'} ({email ?? 'sem e-mail'}): {motivo}`;
  - não depender só da cor: incluir o texto "Falhas:" antes da lista (Princípio IX).

**Checkpoint**: T007 e T008 verdes; quickstart, passo 5, ok com o zTools ainda instalado e sem uso pelo e-mail

---

## Phase 4: User Story 3 - Armazenamento de arquivos direto no S3 (Priority: P3)

**Goal**: o `ImageAppService` grava no bucket `emagine`, sempre sob `viralt/`, com nome único e
URL pública e permanente, sem o zTools.

**Independent Test**: os testes de T018 com `IAmazonS3` mockado e, opcionalmente, o teste de
integração `Category=S3Integration` com credenciais reais (quickstart, passo 6).

### Tests for User Story 3 ⚠️

- [X] T018 [P] [US3] [qa] Criar `backend/Viralt.Tests/Infra/AppServices/ImageAppServiceTests.cs`, com `Mock<IAmazonS3>` capturando o `PutObjectRequest`, testando:
  - `BucketName == "emagine"`;
  - `Key` começa com `viralt/` e termina com a extensão em minúsculas;
  - dois uploads de `foto.PNG` geram chaves diferentes;
  - `ContentType == "image/png"`;
  - nenhum `CannedACL` definido;
  - o retorno é o nome sem o prefixo;
  - `GetImageUrl("")` → `""`;
  - `GetImageUrl("a.png")` sem `PublicBaseUrl` → `https://emagine.s3.{region}.amazonaws.com/viralt/a.png`;
  - com `PublicBaseUrl = "https://cdn.x.com/"` → `https://cdn.x.com/viralt/a.png`;
  - `GetImageUrl("../x.png")` → `ArgumentException`;
  - `Prefix = "/viralt"` normalizado para `viralt/`;
  - `AmazonS3Exception("AccessDenied")` → `InvalidOperationException` com `"S3: AccessDenied"`.

  Incluir também um teste `[Trait("Category","S3Integration")]`, ignorado (`Skip`) quando `S3__AccessKey` não estiver no ambiente, que faz um upload real e um `GET` da URL.

### Implementation for User Story 3

- [X] T019 [US3] [backend] Reescrever `backend/Viralt.Infra/AppServices/ImageAppService.cs`:
  - injetar `IAmazonS3` e `IOptions<S3Setting>`;
  - normalizar o prefixo;
  - no `UploadFile`, gerar `{Guid:N}{ext}`, inferir o `ContentType` com `FileExtensionContentTypeProvider` e chamar `PutObjectAsync` (sem ACL) com `.GetAwaiter().GetResult()`, para manter a interface síncrona;
  - no `GetImageUrl`, montar a URL de forma determinística (research R6 e R7), rejeitando `/`, `\` e `..`;
  - mapear `AmazonS3Exception` e configuração faltando como em `contracts/infra-appservices.md`;
  - remover a classe `FormFileWrapper` e todo `using zTools`.
- [X] T020 [US3] [backend] Em `backend/Viralt.API/Controllers/ImageController.cs`, remover a injeção e o campo `_imageAppService`, que não são usados. O `IImageAppService` continua registrado no DI

**Checkpoint**: T018 verde; nenhum AppService usa tipos do zTools

---

## Phase 5: User Story 2 - Viralt sobe e opera sem o zTools (Priority: P1)

**Goal**: remover o pacote, o DI, a configuração e as variáveis do zTools de todos os ambientes.

**Independent Test**: quickstart, passos 3 e 4. O `git grep -i ztools` fica vazio (fora de
specs e do histórico da constituição) e a API sobe sem o zTools.

**Depende de**: Phase 3 (T010) e Phase 4 (T019)

### Implementation for User Story 2

- [X] T021 [US2] [backend] Em `backend/Viralt.Application/Startup.cs`, remover a região `#region zTools` inteira, junto com os `using zTools.*`, os registros de `IFileClient`, `IMailClient` e `IStringClient` e o `Configure<zToolsetting>`. **Manter `services.AddHttpClient()`**, movendo-o para a região `External integrations`, porque o `WebhookService` depende do `IHttpClientFactory`
- [X] T022 [US2] [backend] Remover `<PackageReference Include="zTools" Version="0.3.6" />` de `backend/Viralt.Infra/Viralt.Infra.csproj` e rodar `dotnet build backend/Viralt.sln` (0 erros)
- [X] T023 [P] [US2] [backend] Remover a seção `"zTools"` de `backend/Viralt.API/appsettings.json`, `appsettings.Docker.json` e `appsettings.Production.json`
- [X] T024 [P] [US2] [backend] Em `docker-compose.yml` e `docker-compose-prod.yml`, no serviço `viralt-api`:
  - remover `zTools__ApiURL`;
  - adicionar `MailerSend__ApiToken: ${MAILERSEND_API_TOKEN}`, `MailerSend__FromEmail: ${MAILERSEND_FROM_EMAIL:-noreply@viralt.com}` e `MailerSend__FromName: ${MAILERSEND_FROM_NAME:-Viralt}`;
  - adicionar `S3__BucketName: ${S3_BUCKET_NAME:-emagine}`, `S3__Prefix: ${S3_PREFIX:-viralt/}`, `S3__Region: ${S3_REGION}`, `S3__ServiceUrl: ${S3_SERVICE_URL:-}`, `S3__PublicBaseUrl: ${S3_PUBLIC_BASE_URL:-}`, `S3__AccessKey: ${S3_ACCESS_KEY}` e `S3__SecretKey: ${S3_SECRET_KEY}`.
- [X] T025 [P] [US2] [backend] Em `.env.example` e `.env.prod.example`, remover o bloco `# zTools` / `ZTOOLS_API_URL` e adicionar os blocos `# MailerSend` (`MAILERSEND_API_TOKEN=`, `MAILERSEND_FROM_EMAIL=noreply@viralt.com`, `MAILERSEND_FROM_NAME=Viralt`) e `# S3` (`S3_BUCKET_NAME=emagine`, `S3_PREFIX=viralt/`, `S3_REGION=`, `S3_SERVICE_URL=`, `S3_PUBLIC_BASE_URL=`, `S3_ACCESS_KEY=`, `S3_SECRET_KEY=`), sem valores secretos. **Não** editar o `.env` real

**Checkpoint**: build verde; a API sobe com `dotnet run` sem zTools

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T026 [P] [main] Emendar `.specify/memory/constitution.md` para a 3.0.1 (PATCH): incluir `MailerSend__ApiUrl` e `S3__PublicBaseUrl` (opcionais) na tabela "Variáveis de Ambiente", atualizar o Sync Impact Report e a linha de versão
- [X] T027 [P] [main] Atualizar `CLAUDE.md`:
  - na seção "Environment Variables → Backend", incluir `MailerSend__*` e `S3__*`;
  - em "Build & Run Commands → Backend", incluir `dotnet test Viralt.Tests`;
  - na árvore de arquitetura, incluir `Viralt.Tests`.
- [X] T028 [P] [main] Remover a skill obsoleta `.claude/skills/ztools-guide/`
- [X] T029 [main] Verificar o SC-003: `git grep -n -i "ztools" -- . ':!specs/' ':!.specify/memory/constitution.md'` não deve retornar nada. Corrigir, pelo agente da área, o que sobrar
- [X] T030 [main] Rodar `dotnet build backend/Viralt.sln` e `dotnet test backend/Viralt.Tests` (tudo verde) e `npm run build` em `frontend/` (exige `npm install --legacy-peer-deps`). Registrar o resultado
  - **Resultado (2026-11-27)**: `dotnet build` com 0 avisos e 0 erros. `dotnet test` com 32 aprovados, 0 falhas e 1 ignorado (S3Integration, sem credenciais). `tsc --noEmit` no frontend acusa só 1 erro (TS7010 em `src/Components/TrackingPixels/index.tsx`), que já existia na `main` e está fora do escopo. Por causa dele, o `npm run build` falha. Os arquivos desta feature não têm erros de tipo
- [ ] T031 [main] **PENDENTE: requer credenciais reais de MailerSend e S3.** Executar o `quickstart.md`, passos 4 a 6, com credenciais reais (MailerSend e S3) e marcar o resultado de cada passo. O passo 7 (Docker) fica registrado como pendente para um ambiente com Docker

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende da Phase 1 (T001 para os tipos do AWS SDK em T005). Bloqueia todas as stories
- **US1 (Phase 3)**: depende da Phase 2
- **US3 (Phase 4)**: depende da Phase 2. Independente da US1 e pode rodar em paralelo a ela
- **US2 (Phase 5)**: depende de **T010 (US1)** e **T019 (US3)**, porque só dá para tirar o pacote quando nenhum AppService o usa
- **Polish (Phase 6)**: depende das Phases 3 a 5

### Within Each User Story

- Testes (T007, T008, T018) antes da implementação, e devem falhar primeiro
- US1: T009 → T010 → T011 → T012 → T013 no backend. O frontend (T014 → T015 → T016 → T017) depende só do contrato e pode começar junto com o T009
- US3: T018 → T019 → T020
- US2: T021 → T022; T023, T024 e T025 em paralelo a qualquer momento após T021

### Parallel Opportunities

- T002 em paralelo a T001
- T003, T004 e T006 em paralelo; T005 depois de T003 e T004
- Phase 3 e Phase 4 inteiras em paralelo (agentes `backend` e `qa` em arquivos diferentes)
- Na US1, a trilha frontend (T014 a T017) em paralelo à trilha backend (T009 a T013)
- T023, T024 e T025 em paralelo
- T026, T027 e T028 em paralelo

---

## Parallel Example: User Story 1

```text
# Testes primeiro (qa-developer), em paralelo:
T007 MailerSendAppServiceTests.cs
T008 WinnerServiceTests.cs

# Em paralelo, duas trilhas:
backend  (dotnet-developer): T009 → T010 → T011 → T012 → T013
frontend (react-developer): T014 → T015 → T016 → T017
```

## Parallel Example: US1 × US3

```text
dotnet-developer: T010 (MailerSend)  ...  depois T019 (S3)
qa-developer:            T007, T008          e    T018
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup) + Phase 2 (Foundational)
2. Phase 3 (US1): o e-mail já sai direto pelo MailerSend, e o "notificar todos" fica tolerante a falhas
3. **Parar e validar**: quickstart, passo 5. Este incremento já pode ir para produção (o zTools continua instalado, mas sem uso pelo e-mail)

### Incremental Delivery

1. Setup + Foundational
2. US1 → validar → deploy (MVP)
3. US3 → validar com testes → deploy (o S3 fica pronto, sem impacto para o usuário)
4. US2 → remover o zTools → validar a subida sem ele → deploy
5. Polish → constituição, CLAUDE.md, limpeza da skill e quickstart completo

### Notas

- Cada tarefa é executada **somente** pelo agente indicado (Princípio VIII). A sessão principal não edita `backend/` nem `frontend/`
- Commit após cada tarefa ou grupo lógico
- Docker não está acessível na máquina local. A validação em compose (quickstart, passo 7) é feita em outro ambiente
