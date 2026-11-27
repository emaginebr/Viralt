# Research: Remover a dependência do zTools

**Feature**: `002-remove-ztools` | **Date**: 2026-11-27

## Levantamento do uso atual

| Item | Onde | Situação |
|---|---|---|
| `PackageReference zTools 0.3.6` | `backend/Viralt.Infra/Viralt.Infra.csproj` | Única referência ao pacote. Nenhum outro pacote depende dele (conferido em `project.assets.json`) |
| `services.Configure<zToolsetting>` e `IFileClient`, `IMailClient`, `IStringClient` | `backend/Viralt.Application/Startup.cs` (região `zTools`) | `IStringClient` nunca é injetado |
| `services.AddHttpClient()` | Mesma região `zTools` | **Precisa ficar**: o `WebhookService` (Domain) usa `IHttpClientFactory` |
| `MailerSendAppService` → `IMailClient.SendmailAsync` | `backend/Viralt.Infra/AppServices` | Usado por `WinnerService.NotifyWinner` |
| `ImageAppService` → `IFileClient` (bucket `monexup`) | `backend/Viralt.Infra/AppServices` | Injetado no `ImageController`, mas nunca chamado. O upload de imagem de usuário vai pelo NAuth |
| Seção `zTools` | `appsettings.json`, `appsettings.Docker.json`, `appsettings.Production.json` | Só `ApiURL` |
| `zTools__ApiURL` / `ZTOOLS_API_URL` | `docker-compose.yml`, `docker-compose-prod.yml`, `.env.example`, `.env.prod.example` | |
| Skill `ztools-guide` | `.claude/skills/ztools-guide/` | Obsoleta para o Viralt |

## Decisões

### R1. Como chamar o MailerSend

- **Decision**: chamar a API REST v1 do MailerSend diretamente (`POST https://api.mailersend.com/v1/email`, header `Authorization: Bearer {token}`), por um `HttpClient` nomeado (`"MailerSend"`) criado pelo `IHttpClientFactory`. O corpo é o `MailerInfo` atual (DTO `Viralt.DTO.MailerSend`), que já está no formato JSON da API (`from`, `to`, `subject`, `text`, `html`).
- **Rationale**: é uma única chamada HTTP e os DTOs já existem com os nomes de campo da API. O `MailerErrorInfo` (`message`, `errors`) já corresponde ao corpo de erro 422 do MailerSend. Não é preciso adicionar pacote nenhum, e o `IHttpClientFactory` já está registrado.
- **Alternatives considered**: o SDK comunitário `MailerSend.AspNetCore`, rejeitado por ser uma dependência a mais, não oficial, para uma única chamada. SMTP via MailerSend, rejeitado porque perde os códigos de erro estruturados.
- **Sucesso/falha**: o MailerSend responde `202 Accepted` quando aceita o envio. Qualquer status fora de 2xx vira `InvalidOperationException`, com a mensagem montada a partir do `MailerErrorInfo` (ou do status, se o corpo não puder ser lido). Exemplos: 401 → "MailerSend: token inválido (MailerSend__ApiToken)"; 422 → mensagem e erros do provedor, como remetente não verificado. Timeout do `HttpClient` de 30 s.

### R2. Remetente do e-mail

- **Decision**: o remetente sai do `WinnerService` (Domain) e vai para a configuração `MailerSend__FromEmail` / `MailerSend__FromName`, com padrão `noreply@viralt.com` / `Viralt`. O `MailerSendAppService` preenche o `From` quando o `MailerInfo.From` vier nulo.
- **Rationale**: atende o FR-007 (remetente vem da configuração) e mantém o mesmo valor de hoje (FR-002). O Domain deixa de conhecer um detalhe de infraestrutura.
- **Alternatives considered**: manter o valor fixo no Domain, rejeitado porque viola o FR-007.

### R3. Escape de HTML no e-mail

- **Decision**: aplicar `System.Net.WebUtility.HtmlEncode` ao nome do participante e ao título da campanha antes de montar o `Html` em `WinnerService`.
- **Rationale**: é o caso de borda "caracteres especiais ou HTML" da spec. O texto visível continua igual (FR-002), mas o layout do e-mail não quebra.

### R4. "Notificar todos" com falhas parciais

- **Decision**: `NotifyAll` percorre os vencedores ainda não notificados e chama, para cada um, a mesma rotina do `NotifyWinner`, dentro de um `try/catch` individual. Os sucessos são contados e as falhas acumuladas (`winnerId`, nome, e-mail, motivo). O retorno passa a ser um `NotifyAllResult`, que estende `StatusResult` com `notificados`, `falhas` e `total`. `sucesso` é `true` só se não houver falhas, e `erros` traz as mensagens das falhas, para compatibilidade com quem só lê `StatusResult`. A resposta HTTP é 200 sempre que o processo rodar. 500 fica só para erro inesperado antes do laço, como campanha inexistente ou banco fora.
- **Rationale**: é a decisão da sessão de clarificação (Q2 → A). Continuar estendendo `StatusResult` mantém o contrato atual compatível.
- **Alternatives considered**: devolver 207 Multi-Status, rejeitado porque o frontend trata tudo que não é 2xx como erro e o 207 não é padrão no projeto. Devolver 500 em falha parcial, rejeitado porque esconde os sucessos.
- **Marcação**: `winner.Notified = true` e `Update` continuam acontecendo só depois do envio bem-sucedido (FR-003). Isso já é o comportamento atual e passa a ter cobertura explícita.

### R5. Biblioteca do S3

- **Decision**: `AWSSDK.S3` (família 3.7.x, como prevê a constituição v3.0.0, Princípio II), com um `IAmazonS3` singleton criado a partir das opções `S3`. Quando `S3__ServiceUrl` vier preenchido, usar `AmazonS3Config { ServiceURL = ..., ForcePathStyle = true }`, para provedores S3-compatíveis como DigitalOcean Spaces e MinIO. Caso contrário, `RegionEndpoint.GetBySystemName(S3__Region)`.
- **Rationale**: é o SDK oficial e cobre AWS e provedores compatíveis sem mudar código.
- **Alternatives considered**: `Minio` SDK, rejeitado por não ser oficial para AWS. Assinatura SigV4 manual via `HttpClient`, rejeitada porque é complexa e propensa a erro. A migração para o AWSSDK v4 fica fora do escopo e exigiria emenda (PATCH) da constituição.

### R6. Chave do objeto, nome único e prefixo

- **Decision**: chave `{S3__Prefix}{Guid:N}{extensão-original-em-minúsculas}`, por exemplo `viralt/3f2a...9c.png`. O `UploadFile` devolve o **nome do arquivo** sem o prefixo (`3f2a...9c.png`), igual ao contrato atual de `IImageAppService`, e o `GetImageUrl(nome)` monta a URL. O prefixo é normalizado para sempre terminar em `/` e nunca começar com `/`. Um nome que chegue com `/` ou `..` é rejeitado, para que nada seja gravado fora de `viralt/` (FR-010).
- **Rationale**: o GUID garante unicidade (FR-012). Guardar só o nome mantém o contrato da interface e permite trocar o domínio público sem migrar dados.
- **Alternatives considered**: manter o nome original com sufixo de data, rejeitado por risco de colisão e de caracteres inválidos. Subpastas por data (`viralt/2026/11/`), rejeitadas por não terem benefício com o volume atual.
- **Content-Type**: inferido pela extensão com `FileExtensionContentTypeProvider` (do `Microsoft.AspNetCore.App`, que a Infra já referencia), com `application/octet-stream` quando não houver correspondência. Assim o navegador exibe a imagem em vez de baixá-la.

### R7. URL pública e permanente

- **Decision**: `GetImageUrl(nome)` é determinístico e não chama a rede. Se `S3__PublicBaseUrl` estiver configurada (ex.: CDN ou Spaces), a URL é `{PublicBaseUrl}/{prefix}{nome}`. Caso contrário, é `https://{bucket}.s3.{region}.amazonaws.com/{prefix}{nome}`. Nome vazio retorna `string.Empty`, como hoje.
- **Rationale**: é a decisão da clarificação Q1 → A (leitura pública, URL permanente). Uma URL determinística pode ser guardada e não custa uma chamada de rede. A implementação atual chamava a rede de forma síncrona a cada URL.
- **Alternatives considered**: `GetPreSignedURL`, rejeitado porque gera URL temporária e contraria a Q1.
- **ACL**: o upload **não** define ACL por objeto. A leitura pública vem da política do bucket para `viralt/*`. Buckets AWS novos têm ACLs desativadas ("Bucket owner enforced"), e um `PutObject` com `CannedACL.PublicRead` falharia. A política do bucket é responsabilidade de quem administra o `emagine` (premissa da spec).
- **Nova variável**: `S3__PublicBaseUrl` (opcional) não está na tabela da constituição v3.0.0. Por isso entra uma emenda PATCH (3.0.1) da tabela de variáveis.

### R8. Validação de configuração

- **Decision**: classes de opções `MailerSendSetting` (`ApiToken`, `FromEmail`, `FromName`) e `S3Setting` (`BucketName`, `Prefix`, `Region`, `ServiceUrl`, `PublicBaseUrl`, `AccessKey`, `SecretKey`) em `Viralt.DTO/Settings`, registradas com `services.Configure<T>(configuration.GetSection(...))`. A validação acontece **no primeiro uso**: o AppService verifica os campos obrigatórios e lança `InvalidOperationException("MailerSend__ApiToken não configurado")` ou equivalente. Não há `ValidateOnStart`.
- **Rationale**: a spec (US2-3) aceita a falha "na inicialização ou na primeira tentativa". Validar no uso deixa desenvolvedores rodarem a API localmente sem credenciais de e-mail e S3 para trabalhar em outras áreas.
- **Alternatives considered**: `ValidateOnStart`, rejeitado porque impediria o `dotnet run` local sem credenciais.
- **Credenciais do S3**: quando `AccessKey`/`SecretKey` vierem vazias, usar a cadeia padrão de credenciais do SDK (variáveis `AWS_*`, perfil, IAM role). Com isso, a produção pode usar papel de instância sem segredo em arquivo.

### R9. Testes

- **Decision**: não há projeto de testes na solução hoje. Esta feature cria `backend/Viralt.Tests` (xUnit + Moq), com testes unitários de:
  - `WinnerService.NotifyAll` (falha parcial, sem e-mail, todos ok);
  - `MailerSendAppService`, com `HttpMessageHandler` falso: 202, 401, 422 e preenchimento do remetente;
  - `ImageAppService`, com `IAmazonS3` mockado: chave com prefixo, unicidade, rejeição de `..`, URL pública com e sem `PublicBaseUrl`.

  Os testes são feitos pelo agente `qa-developer` (skill `dotnet-test`).
- **Rationale**: as regras FR-003, FR-005, FR-010 e FR-012 são lógicas puras e baratas de testar. Um teste de integração real com MailerSend e S3 fica no quickstart, como verificação manual.
- **Alternatives considered**: só verificação manual, rejeitada porque a regra "nunca marcar notificado sem envio" é crítica (SC-004).

### R10. Frontend do "notificar todos"

- **Decision**: o tipo `NotifyAllResult` (estende `StatusResult`) entra em `frontend/src/types/`. O `winnerService.notifyAll` passa a retornar esse tipo. O `WinnerContext.notifyAllWinners` deixa de marcar todos como notificados quando `sucesso` é `true` e recarrega a lista de vencedores (`loadWinners`) após a chamada. A `WinnerSelectionPage` mostra o resumo ("N de M notificados") e, se houver falhas, a lista com o motivo de cada uma, usando o mesmo padrão de alerta Bootstrap (`div.alert`) já usado na página para erros, com `aria-live` (Princípio IX).
- **Rationale**: hoje o context marca todos como notificados sempre que `sucesso` é `true`. Com falhas parciais isso mostraria um estado errado. Recarregar a lista garante fidelidade ao banco.
- **Constituição (Princípio VIII)**: o resumo reutiliza o padrão de alerta Bootstrap que a tela já usa e não é uma "interface nova". Por isso dispensa a passagem pelo `ux-designer`. A tarefa vai para o `frontend-react-developer`.
