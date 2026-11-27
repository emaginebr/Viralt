<!--
Sync Impact Report
==================
Version change: 3.0.0 → 3.0.1 (anteriores: 2.1.0 → 3.0.0, 2.0.0 → 2.1.0, 1.1.0 → 2.0.0)
Bump rationale 3.0.1: PATCH — a tabela "Variáveis de Ambiente" passa a listar duas variáveis
opcionais definidas no plano da feature 002-remove-ztools: `MailerSend__ApiUrl` e
`S3__PublicBaseUrl`. Nenhuma regra mudou.

Bump rationale 3.0.0: MAJOR — o Princípio X foi redefinido de forma incompatível: o zTools
deixa de ser obrigatório e passa a ser proibido como dependência. E-mail (MailerSend) e
storage (S3) passam a ser integrações diretas, isoladas em AppServices da Infra. Código que
seguia a regra anterior (usar zTools) agora viola a constituição. Feature relacionada:
specs/002-remove-ztools.

Princípios modificados (3.0.0):
  - II. Stack Tecnológica Fixa — linha do zTools trocada por MailerSend e AWS SDK para S3.
  - X. Bibliotecas Externas → X. Bibliotecas e Integrações Externas — NAuth mantido; zTools
    removido; novas regras para integrações diretas (MailerSend e S3, bucket `emagine`, pasta
    `viralt/`).

Seções modificadas (3.0.0):
  - Variáveis de Ambiente — `zTools__ApiURL` removida; `MailerSend__*` e `S3__*` adicionadas.
  - Checklist — "Storage, e-mail e IA usam zTools" substituído pela regra de integrações diretas.

Templates e artefatos (3.0.0):
  - ✅ .specify/templates/plan-template.md, spec-template.md, tasks-template.md — genéricos,
    sem menção ao zTools; nada a alterar.
  - ✅ README.md — sem menção ao zTools.
  - ✅ CLAUDE.md — sem menção ao zTools ("AppServices (S3, MailerSend)" continua correto).
  - ⚠ backend (código, appsettings), docker-compose*.yml, .env.example, .env.prod.example —
    ainda referenciam o zTools; a remoção é o escopo da feature 002-remove-ztools.
  - ⚠ .claude/skills/ztools-guide — skill obsoleta para o Viralt; remover ou ignorar.

Bump rationale 2.1.0: MINOR — nova seção "Estrutura do Repositório": backend .NET movido para
`backend/` e frontend React (antes `viralt-app/`) para `frontend/`; caminhos dos Princípios VI,
VIII e do checklist atualizados.

Bump rationale 2.0.0: MAJOR — a constituição foi reescrita a partir da estrutura da constituição do
projeto Pontua (v1.2.0), adaptada à realidade do Viralt. O Princípio II foi redefinido de forma
incompatível com a versão anterior: o bundler oficial passa a ser o CRA (`react-scripts`) e o
prefixo de variáveis do frontend passa a ser `REACT_APP_`, que é o que o código e o CLAUDE.md já
usam (a v1.1.0 exigia Vite e `VITE_`, o que nunca correspondeu ao código).

Princípios modificados:
  - I. Skills Obrigatorias → I. Skills de Arquitetura Obrigatórias (formato em tabela).
  - II. Stack Tecnologica → II. Stack Tecnológica Fixa — Vite/`VITE_` → CRA/`REACT_APP_`;
    Bootstrap 5 + React-Bootstrap como único framework de estilização.
  - VI. Autenticação e Segurança — tabela de padrões, regra de descarte do token em 401.
  - VIII. Tratamento de Erros → VII. Tratamento de Erros no Backend.
  - IX. Bibliotecas Externas → X. Bibliotecas Externas (conteúdo mantido).

Princípios adicionados:
  - VIII. Agentes Especializados Obrigatórios (vindo do Pontua).
  - IX. Acessibilidade (WCAG 2.1 AA) (vindo do Pontua).

Seções adicionadas:
  - "Ambientes" (Development, Docker, Production via docker compose por SSH).

Seções movidas:
  - VII. Variaveis de Ambiente → seção "Variáveis de Ambiente" (fora dos Core Principles).

Seções removidas: nenhuma.

Itens do Pontua NÃO adotados (não se aplicam ao Viralt):
  - JWT Bearer próprio, `Jwt__Secret`, login Google, `PasswordHasher` — o Viralt usa NAuth.
  - Vite, Tailwind CSS, prefixo `VITE_`.
  - Docker via WSL2 — o CLAUDE.md do Viralt mantém Docker inacessível localmente.
  - Produção em Kubernetes — o Viralt publica via `docker-compose-prod.yml` por SSH.

Templates e artefatos:
  - ✅ .specify/templates/plan-template.md — "Constitution Check" genérico; compatível.
  - ✅ .specify/templates/spec-template.md e tasks-template.md — compatíveis.
  - ✅ CLAUDE.md — já descreve CRA e `REACT_APP_*`; compatível.

Follow-up TODOs:
  - TODO(I18N-LANG): definir como o atributo `lang` do documento acompanha o idioma ativo do
    i18next (pt, en, es).
  - TODO(A11Y): as telas existentes ainda não foram auditadas contra o Princípio IX.
  - TODO(NAUTH-REACT): `nauth-react` ainda não está no `frontend/package.json`; o login atual
    usa serviços próprios com a chave `login-with-metamask:auth`.
-->

# Viralt Constitution

Padrões obrigatórios de stack tecnológica, convenções de código e arquitetura que devem ser
seguidos por todos os contribuidores do projeto Viralt.

## Core Principles

### I. Skills de Arquitetura Obrigatórias

Para implementação de novas entidades e funcionalidades, as seguintes skills **DEVEM** ser
utilizadas:

| Skill | Quando usar | Invocação |
|---|---|---|
| **dotnet-architecture** | Criar/modificar entidades, services, repositories, DTOs, migrations, DI no backend | `/dotnet-architecture` |
| **react-architecture** | Criar Types, Service, Context, Hook e registrar Provider no frontend | `/react-architecture` |

Estas skills cobrem em detalhe:

- Estrutura de projetos e fluxo de dependência (Clean Architecture backend).
- Regras de repositórios genéricos, mapeamento manual, DI centralizado.
- Configuração de DbContext, Fluent API e migrações via `dotnet ef`.
- Padrões de arquivos frontend (Types, Services, Contexts, Hooks).
- Provider chain e registro de novos providers.
- Tratamento de erros no frontend (`handleError`, `clearError`, loading state).
- Nomeação de DTOs (`Info`, `InsertInfo`, `Result`) e chaves em português
  (`sucesso`, `mensagem`, `erros`).

Esses padrões **NÃO DEVEM** ser reimplementados manualmente — siga as skills.

**Racional**: garante uniformidade estrutural entre entidades e evita divergência de padrões.

### II. Stack Tecnológica Fixa

**Backend**

| Tecnologia | Versão | Finalidade |
|---|---|---|
| .NET | 8.0 | Runtime e framework principal |
| Entity Framework Core | 9.x | ORM e migrações |
| PostgreSQL | Latest | Banco de dados relacional |
| Swashbuckle | 8.x | Swagger / OpenAPI |
| NAuth | NuGet | Autenticação (Basic token) e usuários |
| MailerSend (API REST direta) | v1 | Envio de e-mails transacionais |
| AWS SDK for .NET (`AWSSDK.S3`) | 3.x | Armazenamento de arquivos no S3 |

**Frontend**

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 18.x | Framework UI |
| TypeScript | 5.x | Tipagem estática |
| React Router | 6.x | Roteamento SPA |
| Create React App (`react-scripts`) | 5.x | Build toolchain |
| Bootstrap + React-Bootstrap | 5.x / 2.x | Estilização e componentes |
| i18next + react-i18next | 25.x / 15.x | Internacionalização (pt, en, es) |
| Axios | 1.x | HTTP client (legado) |
| Fetch API | Nativo | HTTP client (novos serviços) |

**Regras de Stack**

- CRA (`react-scripts`) é o bundler do projeto — **NÃO** introduzir Vite, Webpack manual ou
  outros bundlers sem emenda desta constituição.
- Bootstrap 5 / React-Bootstrap é o framework de estilização — **NÃO** adicionar Tailwind,
  Material UI ou outros frameworks CSS de componentes.
- EF Core é o único ORM permitido — **NÃO** introduzir ORMs alternativos (Dapper, etc.).
- Context API é o padrão de estado — **NÃO** adicionar Redux, Zustand, MobX ou similares.
- **NÃO** executar comandos `docker` ou `docker compose` no ambiente local — Docker não está
  acessível a partir do shell local (ver CLAUDE.md).
- Dependências npm **DEVEM** ser instaladas com `npm install --legacy-peer-deps` (conflito de
  peer do `react-native-svg`).
- Novos serviços HTTP no frontend **DEVEM** usar Fetch API; Axios é restrito a código legado.

**Racional**: uma stack fechada reduz custo de manutenção e mantém as skills aplicáveis.

### III. Case Sensitivity de Diretórios (Inviolável)

| Diretório | Casing | Motivo |
|---|---|---|
| `Contexts/` | Uppercase C | Compatibilidade Docker/Linux |
| `Services/` | Uppercase S | Compatibilidade Docker/Linux |
| `hooks/` | Lowercase h | Convenção React |
| `types/` | Lowercase t | Convenção TypeScript |

Todos os imports **DEVEM** corresponder exatamente ao casing no disco.

**Racional**: builds em Linux/containers falham com imports de casing divergente, mesmo que
funcionem no Windows.

### IV. Convenções de Código

**Backend (.NET)**

| Elemento | Convenção | Exemplo |
|---|---|---|
| Namespaces | PascalCase, file-scoped | `namespace Viralt.Domain.Services;` |
| Classes / Interfaces | PascalCase | `CampaignService`, `ICampaignRepository` |
| Métodos | PascalCase | `GetById()`, `MapToDto()` |
| Propriedades | PascalCase | `CampaignId`, `CreatedAt` |
| Campos privados | _camelCase | `_repository`, `_context` |
| Constantes | UPPER_CASE | `BUCKET_NAME` |

**Frontend (TypeScript/React)**

| Elemento | Convenção | Exemplo |
|---|---|---|
| Componentes | PascalCase | `LoginPage`, `CampaignCard` |
| Interfaces | PascalCase | `CampaignContextType` |
| Variáveis / Funções | camelCase | `getHeaders`, `loadCampaigns` |
| Constantes | UPPER_CASE | `AUTH_STORAGE_KEY` |
| Tipos | `interface` (não `type`) | `interface CampaignInfo {}` |
| Funções | Arrow functions | `const fn = () => {}` |
| Variáveis | `const` por padrão | `const campaigns = []` |

**JSON Property Names**

- Backend: `[JsonPropertyName("camelCase")]` **DEVE** estar em todas as propriedades de DTOs.
- Frontend: acesso direto via camelCase nos tipos TypeScript.

### V. Convenções de Banco de Dados (PostgreSQL)

| Elemento | Convenção | Exemplo |
|---|---|---|
| Tabelas | snake_case plural | `campaigns`, `client_entries` |
| Colunas | snake_case | `campaign_id`, `created_at` |
| Primary Keys | `{entidade}_id`, bigint identity | `campaign_id bigint PK` |
| Constraint PK | `{tabela}_pkey` | `campaigns_pkey` |
| Foreign Keys | `fk_{pai}_{filho}` | `fk_campaign_entry` |
| Delete behavior | `ClientSetNull` | Nunca Cascade |
| Timestamps | `timestamp without time zone` | Sem timezone |
| Strings | `varchar` com MaxLength | `varchar(260)` |
| Booleans | `boolean` com default | `DEFAULT true` |
| Status/Enums | `integer` | `DEFAULT 1` |

Configuração via Fluent API é obrigatória (não usar Data Annotations para schema). Detalhes de
DbContext e comandos de migração estão na skill `dotnet-architecture`.

**Racional**: `ClientSetNull` evita exclusões em cascata acidentais; snake_case é idiomático
no PostgreSQL.

### VI. Autenticação e Segurança

| Aspecto | Padrão |
|---|---|
| Esquema | Basic token via NAuth |
| Header | `Authorization: Basic {token}` |
| Emissão | API do NAuth (`NAuth__ApiURL`); integrações novas no frontend usam `nauth-react` |
| Handler | `NAuthHandler` registrado no DI |
| Storage (frontend) | localStorage key `"login-with-metamask:auth"` (`AUTH_STORAGE_KEY` em `frontend/src/Services/apiHelpers.ts`) |
| Proteção de rotas | Atributo `[Authorize]` nos controllers; rotas administrativas do frontend protegidas |

- Tokens **NUNCA** são armazenados em cookies — usar localStorage com a chave
  `login-with-metamask:auth`.
- O segredo do NAuth (`NAuth__JwtSecret`) **DEVE** vir de variável de ambiente e nunca ser
  versionado.
- Autenticação, registro, login e senhas **DEVEM** passar pelo NAuth (Princípio X); o Viralt
  **NÃO** guarda senhas nem hashes próprios.
- O frontend **DEVE** descartar o token expirado ou rejeitado (401) e voltar para a tela de
  login.
- Connection strings e secrets **NUNCA** são expostos no frontend.
- Controllers com dados sensíveis **DEVEM** ter `[Authorize]`; apenas endpoints públicos de
  campanha (página pública, widget, inscrição de participante) são anônimos.
- CORS `AllowAnyOrigin` é permitido **apenas** em Development.

**Racional**: centralizar a autenticação no NAuth evita duplicar lógica de usuário entre
projetos; a página pública e o widget precisam ser anônimos para o participante se inscrever.

### VII. Tratamento de Erros no Backend

Controllers **DEVEM** capturar exceções e retornar status 500 com a mensagem:

```csharp
try { /* lógica */ }
catch (Exception ex) { return StatusCode(500, ex.Message); }
```

Tratamento de erros no frontend (`handleError`, `clearError`, loading state) é coberto pela
skill `react-architecture`.

### VIII. Agentes Especializados Obrigatórios

O desenvolvimento **DEVE** ser executado pelos agentes especializados da área correspondente
(definidos em `.claude/agents/`):

| Agente | Papel | Responsável por |
|---|---|---|
| **frontend-react-developer** | Desenvolvedor frontend | Todo código React/TypeScript em `frontend/`: tipos, services, contexts, hooks, páginas, componentes, i18n, testes de frontend |
| **dotnet-senior-developer** | Desenvolvedor backend | Todo código .NET nos projetos em `backend/`: entidades, services, repositórios, migrations, controllers, DI, testes de backend |
| **ux-designer** | Designer de layout | Layout e aparência do frontend: direção visual, design tokens (cores, tipografia, espaçamento), mockups, especificação de componentes, logotipos e ícones |

- A sessão principal (agente orquestrador) **NÃO DEVE** editar arquivos em `backend/` ou
  `frontend/` nem produzir layout/aparência diretamente: toda alteração **DEVE** ser delegada
  ao agente da área (`dotnet-senior-developer` para o backend, `frontend-react-developer` para
  o frontend, `ux-designer` para layout e aparência). A sessão principal pode ler código,
  planejar, revisar e editar artefatos de especificação (`specs/`, `.specify/`, `CLAUDE.md`).
- Cada tarefa de implementação **DEVE** ser atribuída a exatamente um desses agentes, conforme
  a área do código ou artefato que ela produz.
- Funcionalidades com interface nova **DEVEM** passar primeiro pelo `ux-designer` (tokens,
  layout e especificação de componentes) antes da implementação pelo
  `frontend-react-developer`.
- O `ux-designer` **NÃO** escreve código `.tsx`; o `frontend-react-developer` **NÃO** altera
  código .NET; o `dotnet-senior-developer` **NÃO** altera código de frontend.
- Mudanças que atravessam frontend e backend (ex.: novo endpoint consumido por uma tela)
  **DEVEM** ser divididas em tarefas separadas, uma por agente, com o contrato da API
  definido antes.
- Os agentes **DEVEM** seguir as skills do Princípio I; a escolha do agente não dispensa as
  skills de arquitetura.

**Racional**: cada agente carrega as convenções e skills da sua área; separar
responsabilidades evita que padrões de uma camada vazem para outra e mantém o design
consistente entre telas.

### IX. Acessibilidade (WCAG 2.1 AA)

Toda interface **DEVE** atender ao nível AA das WCAG 2.1. Em especial:

- **Contraste**: texto normal com no mínimo 4,5:1 e texto grande/ícones com no mínimo 3:1 sobre o
  fundo; os design tokens **DEVEM** ser validados contra essas razões.
- **Alvos de toque**: no mínimo 44×44 px para todo elemento clicável.
- **Rótulos**: todo campo de formulário **DEVE** ter `<label>` associado; botões só com ícone
  **DEVEM** ter `aria-label`; imagens informativas **DEVEM** ter `alt`.
- **Teclado**: toda ação **DEVE** ser executável pelo teclado, com foco sempre visível e ordem
  de foco lógica; modais e folhas **DEVEM** prender o foco e fechar com `Esc`.
- **Semântica**: usar elementos nativos (`button`, `a`, `nav`, `main`, `h1`…`h3`) antes de
  ARIA; o documento **DEVE** declarar o atributo `lang` do idioma ativo (`pt-BR`, `en` ou `es`).
- **Cor**: informação **NÃO DEVE** depender só da cor (ex.: status de campanha leva texto ou
  ícone, além da cor).
- **Movimento**: animações **DEVEM** respeitar `prefers-reduced-motion`.
- **Feedback**: mensagens de sucesso e erro **DEVEM** ser anunciadas a leitores de tela
  (`aria-live`) e erros de campo **DEVEM** ficar ligados ao campo (`aria-describedby`).
- **Zoom**: o layout **DEVE** continuar usável com texto ampliado a 200% e **NÃO DEVE**
  bloquear o zoom do navegador.

**Racional**: as páginas públicas de campanha e o widget embarcável são abertos pelo público
em geral, incluindo pessoas com deficiência; uma inscrição inacessível exclui participantes e
pode violar regras de sorteios. Acessibilidade tratada desde o design custa menos que corrigir
depois.

### X. Bibliotecas e Integrações Externas

**NAuth — Autenticação e gerenciamento de usuários**

O NAuth é uma biblioteca proprietária compartilhada entre os projetos da equipe. **NÃO**
substituir por alternativas sem decisão explícita da equipe.

- Backend: pacote NuGet `NAuth`. Para referência do código-fonte, consultar
  `C:\repos\NAuth\NAuth`.
- Frontend: pacote npm `nauth-react`. Para referência do código-fonte, consultar
  `C:\repos\NAuth\nauth-react`.
- **DEVE** ser usado para toda lógica de autenticação, registro, login, gerenciamento de tokens
  e operações de usuário.
- **NÃO** implementar autenticação customizada — usar NAuth (skill `nauth-guide`).

**Integrações diretas — e-mail e armazenamento**

O Viralt fala diretamente com os provedores de e-mail e de armazenamento, sem serviço
intermediário. O zTools **NÃO DEVE** ser usado: nem o pacote NuGet, nem a API, nem a
configuração.

| Capacidade | Provedor | Contrato (Infra.Interfaces) | Implementação (Infra) |
|---|---|---|---|
| E-mail transacional | MailerSend (API REST) | `IMailerSendAppService` | `MailerSendAppService` |
| Armazenamento de arquivos | S3 (`AWSSDK.S3`) | `IImageAppService` | `ImageAppService` |

- Cada integração externa **DEVE** ficar atrás de um contrato em `Viralt.Infra.Interfaces`, com a
  implementação em `Viralt.Infra/AppServices`. Domain e API **NÃO** chamam o provedor
  diretamente, nem conhecem os tipos do SDK.
- Credenciais, endpoints, remetente, bucket e pasta **DEVEM** vir da configuração
  (`Secao__Chave`), nunca do código. Credenciais **NUNCA** chegam ao frontend.
- Arquivos **DEVEM** ser gravados no bucket compartilhado `emagine`, sempre sob o prefixo
  `viralt/`, com nome único por envio. As URLs são públicas e permanentes.
- Falhas do provedor **DEVEM** virar exceções com mensagem clara, que indique o problema (ex.:
  credencial inválida, remetente não verificado). Nunca devem ser ignoradas em silêncio.
- Novas integrações externas (ex.: IA) **DEVEM** seguir o mesmo padrão: contrato em
  Infra.Interfaces, implementação em Infra e configuração por ambiente. Antes de adicionar uma
  dependência, verificar se uma das integrações existentes já atende.

**Racional**: o NAuth continua centralizado porque a identidade de usuário é compartilhada
entre projetos. E-mail e storage, ao contrário, são integrações simples. Fazê-las direto tira do
caminho um serviço intermediário, que precisava estar no ar para o Viralt funcionar. O contrato
em Infra.Interfaces mantém o provedor trocável e testável.

## Variáveis de Ambiente

**Backend**

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ConnectionStrings__ViraltContext` | Sim | Connection string PostgreSQL |
| `ASPNETCORE_ENVIRONMENT` | Sim | Development, Docker, Production |
| `NAuth__ApiURL` | Sim | URL da API do NAuth |
| `NAuth__BucketName` | Sim | Bucket de usuários do NAuth (padrão `viralt`) |
| `NAuth__JwtSecret` | Sim | Segredo do NAuth; nunca versionado |
| `MailerSend__ApiToken` | Sim | Token da API do MailerSend; nunca versionado |
| `MailerSend__FromEmail` | Não | Remetente padrão (padrão `noreply@viralt.com`) |
| `MailerSend__FromName` | Não | Nome do remetente (padrão `Viralt`) |
| `MailerSend__ApiUrl` | Não | Base da API (padrão `https://api.mailersend.com/v1/`) |
| `S3__BucketName` | Sim | Bucket compartilhado (padrão `emagine`) |
| `S3__Prefix` | Não | Pasta do Viralt no bucket (padrão `viralt/`) |
| `S3__Region` | Sim | Região do bucket |
| `S3__ServiceUrl` | Não | Endpoint S3-compatível, quando não for AWS |
| `S3__PublicBaseUrl` | Não | Base pública das URLs (CDN ou provedor S3-compatível); vazio = URL padrão da AWS |
| `S3__AccessKey` / `S3__SecretKey` | Sim | Credenciais do S3; nunca versionadas |

**Frontend**

| Variável | Obrigatória | Descrição |
|---|---|---|
| `REACT_APP_API_URL` | Sim | URL base da API backend |
| `REACT_APP_SITE_BASENAME` | Não | Base path do React Router |

Variáveis de frontend **DEVEM** usar o prefixo `REACT_APP_` (padrão CRA) e ser acessadas via
`process.env.REACT_APP_*`. **NÃO** usar `VITE_` nem `import.meta.env`.

## Estrutura do Repositório

| Pasta | Conteúdo |
|---|---|
| `backend/` | Solução .NET (`Viralt.sln`), todos os projetos `Viralt.*`, `Dockerfile` e `.dockerignore` da API |
| `frontend/` | Aplicação React (CRA), com `Dockerfile` e `nginx.conf` próprios |
| raiz | `docker-compose.yml`, `docker-compose-prod.yml`, `nginx/`, `SQL/`, `docs/`, `specs/`, `.env*` |

- Código .NET **DEVE** ficar em `backend/` e código React em `frontend/`; **NÃO** criar projetos
  na raiz.

## Ambientes

| Ambiente | `ASPNETCORE_ENVIRONMENT` | Onde roda | Configuração e segredos |
|---|---|---|---|
| Dev | `Development` | Máquina local (`dotnet run`, `npm start`), contra um PostgreSQL acessível | `appsettings.Development.json` (valores locais, nunca de produção) |
| Docker | `Docker` | `docker-compose.yml` (banco, API e frontend) | `.env` (não versionado) + `.env.example` |
| Prod | `Production` | Servidor via SSH: `docker compose -f docker-compose-prod.yml up -d --build` (workflow `.github/workflows/deploy-prod.yml`) | `appsettings.Production.json` sem segredos; `.env.prod` no servidor + `.env.prod.example` |

- Arquivos `.env`, `.env.prod` e certificados **NUNCA** são versionados.
- Configuração por variáveis de ambiente usa a convenção `Secao__Chave`; **NÃO** usar
  `AddEnvironmentVariables("PREFIXO")`.

## Fluxo de Desenvolvimento e Checklist de Contribuição

Antes de submeter qualquer código, verifique:

- [ ] Utilizou a skill `dotnet-architecture` para novas entidades backend.
- [ ] Utilizou a skill `react-architecture` para novas entidades frontend.
- [ ] Tabelas e colunas seguem snake_case no PostgreSQL.
- [ ] Imports respeitam o casing exato dos diretórios.
- [ ] Variáveis de ambiente frontend usam prefixo `REACT_APP_`.
- [ ] Controllers com dados sensíveis possuem `[Authorize]`.
- [ ] Autenticação usa NAuth (NuGet no backend, `nauth-react` no frontend).
- [ ] Nenhuma referência ao zTools. E-mail e storage passam pelos AppServices da Infra
      (Princípio X).
- [ ] Nenhuma alteração em `backend/` ou `frontend/` foi feita fora dos agentes
      especializados.
- [ ] Cada tarefa foi executada pelo agente da sua área (`frontend-react-developer`,
      `dotnet-senior-developer` ou `ux-designer`), conforme o Princípio VIII.
- [ ] Telas novas atendem ao Princípio IX (contraste, rótulos, teclado, alvos de 44 px).
- [ ] Token salvo apenas em localStorage, na chave `login-with-metamask:auth`.

## Governance

- Esta constituição prevalece sobre quaisquer outras práticas do projeto. Em conflito com uma
  skill, prevalece a constituição e a skill deve ser corrigida.
- Emendas exigem: alteração documentada neste arquivo, atualização do Sync Impact Report e
  propagação para os templates em `.specify/templates/`.
- Versionamento semântico:
  - **MAJOR**: remoção ou redefinição incompatível de princípios.
  - **MINOR**: novo princípio/seção ou expansão material de regras.
  - **PATCH**: esclarecimentos, redação e correções sem efeito semântico.
- Todo plano (`/speckit.plan`) **DEVE** passar pelo "Constitution Check"; violações exigem
  justificativa explícita na seção "Complexity Tracking".
- Revisões de código **DEVEM** verificar o checklist de contribuição acima.

**Version**: 3.0.1 | **Ratified**: 2026-04-02 | **Last Amended**: 2026-11-27
