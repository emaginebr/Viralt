# Quickstart: validar a remoção do zTools

**Feature**: `002-remove-ztools`

## Pré-requisitos

- PostgreSQL acessível, conforme `backend/Viralt.API/appsettings.Development.json`.
- Um token de API do MailerSend com domínio de remetente verificado.
- Credenciais com permissão de `s3:PutObject` em `emagine/viralt/*`, e a política do bucket
  liberando leitura pública de `viralt/*`.
- **Não** subir o serviço zTools.

## 1. Configurar (Development)

Use `dotnet user-secrets` ou variáveis de ambiente. Nunca versione segredos.

```bash
cd backend
dotnet user-secrets --project Viralt.API set "MailerSend:ApiToken" "<token>"
dotnet user-secrets --project Viralt.API set "S3:Region" "us-east-1"
dotnet user-secrets --project Viralt.API set "S3:AccessKey" "<access-key>"
dotnet user-secrets --project Viralt.API set "S3:SecretKey" "<secret-key>"
# opcionais: S3:ServiceUrl e S3:PublicBaseUrl (provedor S3-compatível ou CDN)
```

Se o `Viralt.API` ainda não tiver `UserSecretsId`, use variáveis de ambiente:
`MailerSend__ApiToken`, `S3__Region`, `S3__AccessKey` e `S3__SecretKey`.

## 2. Build e testes

```bash
cd backend
dotnet build Viralt.sln          # 0 erros
dotnet test Viralt.Tests         # testes de NotifyAll, MailerSend e S3
```

## 3. Nenhuma referência ao zTools (SC-003)

```bash
git grep -n -i "ztools" -- . ':!specs/' ':!.specify/memory/constitution.md'
# esperado: nenhuma saída
```

## 4. Subir sem zTools (US2)

```bash
cd backend && dotnet run --project Viralt.API
```

A API sobe normalmente, sem erro de conexão com o zTools.

## 5. E-mail de premiação (US1)

1. Crie uma campanha de teste, inscreva 3 participantes (um deles **sem e-mail**) e sorteie 3
   vencedores.
2. `POST /api/Winner/notify/{winnerId}` para o vencedor com e-mail. Espere 200, o e-mail na
   caixa de entrada e `notified = true`.
3. `POST /api/Winner/notifyall/{campaignId}`. Espere 200 com `sucesso: false`, `notificados: 1`
   e uma falha `"Participante sem e-mail"`. Os outros vencedores com e-mail devem receber a
   mensagem.
4. Troque `MailerSend__ApiToken` por um valor inválido, reinicie a API e notifique outro
   vencedor. Espere 500 com uma mensagem que cite `MailerSend__ApiToken`, e o vencedor continua
   com `notified = false` (SC-004).
5. Na tela **Winner Selection**, clique em "Notify all". O resumo "N de M notificados" aparece,
   com a lista de falhas, e a tabela mostra o status real de cada vencedor.

## 6. Armazenamento S3 (US3)

Nenhum endpoint usa o `IImageAppService` hoje. A validação é feita pelos testes unitários do
passo 2 e, opcionalmente, por um teste manual com credenciais reais:

```bash
dotnet test Viralt.Tests --filter "Category=S3Integration"   # ignorado sem credenciais
```

Espere o objeto em `s3://emagine/viralt/{guid}.png`, e a URL retornada deve abrir a imagem no
navegador sem autenticação.

## 7. Docker (homologação)

Com `.env` contendo `MAILERSEND_API_TOKEN`, `S3_REGION`, `S3_ACCESS_KEY` e `S3_SECRET_KEY`, e
**sem** `ZTOOLS_API_URL`, `docker compose up --build` sobe banco, API e frontend. Esse passo é
feito fora desta máquina, porque o Docker não está acessível no shell local.
