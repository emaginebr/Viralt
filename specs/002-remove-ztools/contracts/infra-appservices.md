# Contract: AppServices de integração externa (Infra.Interfaces)

As interfaces **não mudam**. Muda só a implementação em `backend/Viralt.Infra/AppServices`,
que passa a falar direto com os provedores (constituição v3.0.0, Princípio X).

## IMailerSendAppService

```csharp
namespace Viralt.Infra.Interfaces.AppServices;

public interface IMailerSendAppService
{
    Task<bool> SendMail(MailerInfo email);
}
```

| Comportamento | Regra |
|---|---|
| Requisição | `POST {ApiUrl}email`, `Authorization: Bearer {ApiToken}`, corpo JSON do `MailerInfo` |
| `email.From == null` | Preenche com `FromEmail` / `FromName` da configuração |
| Resposta 2xx (normalmente 202) | Retorna `true` |
| `ApiToken` vazio | Lança `InvalidOperationException("MailerSend__ApiToken não configurado")` sem chamar a rede |
| 401 / 403 | Lança `InvalidOperationException("MailerSend: token inválido ou sem permissão (MailerSend__ApiToken)")` |
| 422 | Lança `InvalidOperationException("MailerSend: {message}")`, com os detalhes de `errors` concatenados |
| Outro status não 2xx | Lança `InvalidOperationException("MailerSend: HTTP {status}")` |
| Timeout ou erro de rede | Lança `InvalidOperationException("MailerSend indisponível: {detalhe}")` |

O método **nunca** retorna `false` em silêncio. Falha é sempre exceção.

## IImageAppService

```csharp
namespace Viralt.Infra.Interfaces.AppServices;

public interface IImageAppService
{
    string GetImageUrl(string fileName);
    string UploadFile(Stream stream, string fileName);
}
```

| Método | Regra |
|---|---|
| `UploadFile(stream, fileName)` | Grava em `s3://{BucketName}/{Prefix}{Guid:N}{ext}`. A extensão vem de `fileName` e o `ContentType` é inferido pela extensão. Não define ACL. Retorna o nome gerado (`{Guid:N}{ext}`), sem o prefixo |
| `GetImageUrl("")` / `null` | Retorna `string.Empty` |
| `GetImageUrl(nome)` | Retorna `{PublicBaseUrl ou https://{bucket}.s3.{region}.amazonaws.com}/{Prefix}{nome}`, sem chamada de rede |
| Nome com `/`, `\` ou `..` | Lança `ArgumentException`, para nunca sair da pasta `viralt/` |
| `BucketName` vazio, ou credencial informada pela metade | Lança `InvalidOperationException` com o nome da variável que falta |
| Erro do S3 (`AmazonS3Exception`) | Lança `InvalidOperationException("S3: {ErrorCode} — {Message}")`, ex.: `AccessDenied`, `NoSuchBucket` |
