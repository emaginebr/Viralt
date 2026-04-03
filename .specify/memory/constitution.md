<!--
  Sync Impact Report
  ===================
  Version change: 1.0.0 → 1.1.0 (MINOR - new principle added)

  Modified principles: none

  Added principles:
    - IX. Bibliotecas Externas (NAuth + zTools)

  Added sections: none

  Removed sections: none

  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ Compatible
    - .specify/templates/spec-template.md ✅ Compatible
    - .specify/templates/tasks-template.md ✅ Compatible

  Follow-up TODOs: none
-->

# Viralt Constitution

## Core Principles

### I. Skills Obrigatorias

Para implementacao de novas entidades e funcionalidades, as seguintes
skills DEVEM ser utilizadas:

- **dotnet-architecture** (`/dotnet-architecture`): Criar/modificar
  entidades, services, repositories, DTOs, migrations, DI no backend.
- **react-architecture** (`/react-architecture`): Criar Types, Service,
  Context, Hook e registrar Provider no frontend.

Estas skills cobrem: estrutura de projetos e fluxo de dependencia
(Clean Architecture backend), regras de repositorios genericos,
mapeamento manual, DI centralizado, configuracao de DbContext, Fluent
API, migracoes via `dotnet ef`, padroes de arquivos frontend (Types,
Services, Contexts, Hooks), Provider chain, tratamento de erros
frontend (handleError, clearError, loading state), convencoes de
nomeacao de DTOs (`Info`, `InsertInfo`, `Result`) e chaves portuguesas
(`sucesso`, `mensagem`, `erros`).

NAO reimplemente esses padroes manualmente — siga as skills.

### II. Stack Tecnologica

**Backend**: .NET 8.0, Entity Framework Core 9.x, PostgreSQL, NAuth
(Basic token), zTools (S3, MailerSend, slugs), Swashbuckle 8.x.

**Frontend**: React 18.x, TypeScript 5.x, React Router 6.x, Vite 6.x,
Bootstrap 5.x, i18next 25.x, Axios 1.x (legado), Fetch API (novos
servicos).

Regras inviolaveis:
- Vite e o bundler obrigatorio — NAO usar CRA, Webpack manual ou
  outros bundlers.
- NAO introduzir ORMs alternativos (Dapper, etc.) — EF Core e o unico
  ORM permitido.
- NAO adicionar bibliotecas de state management (Redux, Zustand, MobX)
  — Context API e o padrao.
- NAO executar comandos `docker` ou `docker compose` no ambiente local
  — Docker nao esta acessivel.
- Variaveis de ambiente frontend usam prefixo `VITE_` (padrao Vite).
  NAO usar `REACT_APP_`.

### III. Case Sensitivity de Diretorios

Todos os imports DEVEM corresponder exatamente ao casing no disco.
Isso e inviolavel para compatibilidade Docker/Linux.

| Diretorio | Casing | Motivo |
|-----------|--------|--------|
| `Contexts/` | Uppercase C | Compatibilidade Docker/Linux |
| `Services/` | Uppercase S | Compatibilidade Docker/Linux |
| `hooks/` | Lowercase h | Convencao React |
| `types/` | Lowercase t | Convencao TypeScript |

### IV. Convencoes de Codigo

**Backend (.NET)**:
- Namespaces: PascalCase, file-scoped (`namespace Viralt.API;`)
- Classes/Interfaces: PascalCase (`CampaignService`, `ICampaignRepository`)
- Metodos/Propriedades: PascalCase
- Campos privados: _camelCase (`_repository`, `_context`)
- Constantes: UPPER_CASE (`BUCKET_NAME`)
- DTOs DEVEM usar `[JsonPropertyName("camelCase")]` em todas as
  propriedades.

**Frontend (TypeScript/React)**:
- Componentes/Interfaces: PascalCase
- Variaveis/Funcoes: camelCase
- Constantes: UPPER_CASE
- Tipos DEVEM usar `interface` (nao `type`)
- Arrow functions preferidas
- `const` por padrao para variaveis

### V. Convencoes de Banco de Dados (PostgreSQL)

| Elemento | Convencao | Exemplo |
|----------|-----------|---------|
| Tabelas | snake_case plural | `campaigns` |
| Colunas | snake_case | `campaign_id` |
| Primary Keys | `{entidade}_id`, bigint identity | `campaign_id` |
| Constraint PK | `{tabela}_pkey` | `campaigns_pkey` |
| Foreign Keys | `fk_{pai}_{filho}` | `fk_campaign_entry` |
| Delete behavior | `ClientSetNull` | Nunca Cascade |
| Timestamps | `timestamp without time zone` | Sem timezone |
| Strings | `varchar` com MaxLength | `varchar(260)` |
| Booleans | `boolean` com default | `DEFAULT true` |
| Status/Enums | `integer` | `DEFAULT 1` |

Configuracao via Fluent API obrigatoria (nao Data Annotations para
schema). Detalhes na skill `dotnet-architecture`.

### VI. Autenticacao e Seguranca

- Esquema: Basic Authentication via NAuth.
- Header: `Authorization: Basic {token}`.
- Storage frontend: localStorage key `"login-with-metamask:auth"`.
- Handler: `NAuthHandler` registrado no DI.
- Controllers com dados sensiveis DEVEM ter `[Authorize]`.

Regras de seguranca:
- NUNCA armazenar tokens em cookies — usar localStorage.
- NUNCA expor connection strings ou secrets no frontend.
- CORS `AllowAnyOrigin` apenas em Development.

### VII. Variaveis de Ambiente

**Backend**:
- `ConnectionStrings__ViraltContext` (obrigatoria) — PostgreSQL.
- `ASPNETCORE_ENVIRONMENT` (obrigatoria) — Development, Docker,
  Production.

**Frontend**:
- `VITE_API_URL` (obrigatoria) — URL base da API backend.
- `VITE_SITE_BASENAME` (opcional) — Base path do React Router.

Prefixo obrigatorio `VITE_`. Acessar via `import.meta.env.VITE_*`.

### VIII. Tratamento de Erros

**Backend**: Try-catch com StatusCode em todos os controllers:
```csharp
try { /* logica */ }
catch (Exception ex) { return StatusCode(500, ex.Message); }
```

**Frontend**: Padroes de handleError, clearError e loading state sao
cobertos pela skill `react-architecture`.

### IX. Bibliotecas Externas

O projeto utiliza duas bibliotecas proprietarias como dependencias
centrais. NAO substituir por alternativas sem decisao explicita da
equipe.

**NAuth — Autenticacao e gerenciamento de usuarios**:
- Backend: pacote NuGet `NAuth`. Para referencia do codigo-fonte,
  consultar `C:\repos\NAuth\NAuth`.
- Frontend: pacote npm `nauth-react`. Para referencia do codigo-fonte,
  consultar `C:\repos\NAuth\nauth-react`.
- DEVE ser usado para toda logica de autenticacao, registro, login,
  gerenciamento de tokens e operacoes de usuario.
- NAO implementar autenticacao customizada — usar NAuth.

**zTools — S3, e-mail e IA**:
- Backend: pacote NuGet `zTools`. Para referencia do codigo-fonte,
  consultar `C:\repos\zTools`.
- Funcionalidades cobertas:
  - **IFileClient**: Upload e gerenciamento de arquivos no S3.
  - **IMailClient**: Envio de e-mails via MailerSend.
  - **IStringClient**: Geracao de slugs.
  - **IA**: Integracao com ChatGPT e DALL-E.
- DEVE ser usado para qualquer operacao de storage (S3), envio de
  e-mail ou funcionalidade de IA.
- NAO implementar clients HTTP diretos para S3, MailerSend ou
  OpenAI — usar zTools.

**Regra geral**: Antes de adicionar qualquer nova dependencia que
cubra autenticacao, storage, e-mail ou IA, verificar se NAuth ou
zTools ja fornecem a funcionalidade necessaria.

## Checklist para Novos Contribuidores

Antes de submeter qualquer codigo, verifique:

- Utilizou a skill `dotnet-architecture` para novas entidades backend
- Utilizou a skill `react-architecture` para novas entidades frontend
- Tabelas e colunas seguem snake_case no PostgreSQL
- Imports respeitam o casing exato dos diretorios
- Variaveis de ambiente frontend usam prefixo `VITE_`
- Controllers com dados sensiveis possuem `[Authorize]`
- Autenticacao usa NAuth (NuGet backend, npm nauth-react frontend)
- Storage/e-mail/IA usa zTools (NuGet backend)

## Governance

Esta constitution e o documento supremo do projeto Viralt. Em caso de
conflito entre esta constitution e qualquer outro documento, guia ou
pratica, esta constitution prevalece.

**Processo de emenda**:
1. Propor alteracao documentada com justificativa.
2. Revisar impacto em templates dependentes (plan, spec, tasks).
3. Atualizar constitution com novo numero de versao.
4. Propagar alteracoes para templates e documentacao afetados.

**Politica de versionamento** (SemVer):
- MAJOR: Remocao ou redefinicao incompativel de principios.
- MINOR: Novo principio adicionado ou orientacao materialmente expandida.
- PATCH: Correcoes de redacao, clarificacoes, ajustes nao-semanticos.

**Revisao de conformidade**: Todo PR DEVE ser verificado contra os
principios desta constitution antes de aprovacao. Violacoes DEVEM ser
justificadas e documentadas na secao Complexity Tracking do plano.

**Version**: 1.1.0 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-04-02
