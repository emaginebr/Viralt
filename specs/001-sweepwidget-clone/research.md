# Research: SweepWidget Clone

**Branch**: `001-sweepwidget-clone` | **Date**: 2026-04-02

## R1: GraphQL com HotChocolate — Design Dual-Schema

**Decision**: Usar HotChocolate 14.3.0 com design dual-schema: schema "admin" (autenticado via `[Authorize]`) e schema "public" (sem auth). Endpoints: `/graphql/admin` e `/graphql/public`. Queries retornam `IQueryable<T>` para otimizacao EF Core (projecao automatica, sem over-fetching). Decorar com `[UseOffsetPaging]`, `[UseFiltering]`, `[UseSorting]`, `[UseProjection]`.

**Rationale**: Dual-schema impede vazamento de dados sensiveis (IP, email, coupon_code) no schema publico via types dedicados (CampaignPublicType esconde campos vs CampaignAdminType expoe tudo). IQueryable permite que HotChocolate gere SQL otimizado via EF Core.

**Alternatives considered**: Schema unico com diretivas `@authorize` por campo (risco de esquecer diretiva = vazamento), REST puro (N+1 em listagens aninhadas, frontend nao pode escolher campos).

## R2: Frontend GraphQL Client

**Decision**: Criar `graphqlClient.ts` — um fetch wrapper leve que faz POST para os endpoints GraphQL com query/variables e retorna dados tipados. NAO usar Apollo Client, urql ou Relay.

**Rationale**: Constitution II proibe bibliotecas de state management adicionais. Apollo/urql introduzem cache e state management paralelo ao Context API. Um fetch wrapper simples mantem o padrao existente (Services fazem fetch, Contexts gerenciam state).

**Alternatives considered**: Apollo Client (viola Constitution II — introduz cache/state paralelo), urql (mesma razao), graphql-request (dependencia adicional desnecessaria — fetch nativo basta).

## R3: Algoritmo de Sorteio Aleatorio Ponderado

**Decision**: Weighted random selection usando entradas como peso. Para cada participante, seu peso = total_entries. Algoritmo: somar todos os pesos, gerar numero aleatorio entre 0 e soma total, iterar participantes subtraindo pesos ate encontrar o selecionado. Repetir sem repeticao para multiplos vencedores.

**Rationale**: Abordagem simples, justa e transparente. Sem necessidade de bibliotecas externas.

**Alternatives considered**: Reservoir sampling (complexo demais), lottery ticket system (duplica dados).

## R4: Widget Embarcavel — Abordagem de Iframe

**Decision**: Usar iframe com postMessage para comunicacao pai-filho. O widget.js cria um iframe apontando para `/widget/{slug}`, que renderiza a campanha em modo embarcavel (sem header/footer). postMessage comunica altura do conteudo para auto-resize.

**Rationale**: Iframe e a abordagem mais segura e isolada. Nao requer CORS especial, funciona em qualquer site.

**Alternatives considered**: Web Components (complexidade desnecessaria), render direto no DOM (conflitos CSS).

## R5: Slug Generation

**Decision**: Usar zTools IStringClient para gerar slugs. Verificar unicidade no banco. Colisao: sufixo numerico incremental.

**Rationale**: zTools ja e dependencia (Constitution IX).

**Alternatives considered**: Slugify manual (violaria Constitution IX).

## R6: Verificacao de E-mail

**Decision**: Codigo de 6 digitos via zTools IMailClient. Expiracao 15 minutos. Max 3 tentativas.

**Rationale**: Padrao da industria, infraestrutura existente.

**Alternatives considered**: Link magico (mais complexo), JWT por email (overkill).

## R7: Geo-blocking e Detecao de VPN

**Decision**: CF-IPCountry (Cloudflare) ou servico externo de IP geolocation. VPN detection via servico como ipinfo.io.

**Rationale**: Pragmatico, sem dependencias pesadas.

**Alternatives considered**: MaxMind GeoIP2 (licenca), servicos pagos (custo MVP).

## R8: CAPTCHA

**Decision**: reCAPTCHA v3. Score-based, sem interacao do usuario.

**Rationale**: Padrao industria, gratis, sem impacto UX.

**Alternatives considered**: hCaptcha (menos adotado), Turnstile (Cloudflare-dependente).

## R9: Exportacao CSV/JSON

**Decision**: Server-side no controller com streaming. StringBuilder para CSV, serializar DTOs para JSON.

**Rationale**: Sem bibliotecas extras para volumes <10k.

**Alternatives considered**: CsvHelper (dependencia desnecessaria).

## R10: Sistema de Webhooks

**Decision**: BackgroundService existente como fila in-process. Retry: 1s, 5s, 30s. HMAC-SHA256 no header X-Viralt-Signature.

**Rationale**: Reativa infraestrutura existente sem message broker.

**Alternatives considered**: RabbitMQ (overkill MVP), fire-and-forget (sem retry).

## R11: Pixels de Rastreamento

**Decision**: Campos texto na Campaign. Frontend injeta scripts condicionalmente.

**Rationale**: Nao requer backend.

**Alternatives considered**: GTM universal (limita controle por campanha).

## R12: Pontos de Extensao BazzucaMedia

**Decision**: ExternalController REST (POST) com header X-BazzucaMedia-Key. CampaignEntry com campos external_provider e external_entry_id.

**Rationale**: Contrato simples, desacoplado. Callbacks sao mutations (REST), nao queries (GraphQL).

**Alternatives considered**: gRPC (complexidade), message broker (infraestrutura adicional).

## R13: Separacao GraphQL vs REST

**Decision**: GraphQL para TODAS as consultas (leitura). REST para TODAS as mutations (escrita), exportacoes (file download) e callbacks (BazzucaMedia). Razao: HotChocolate excele em consultas flexiveis com EF Core (projecao, paginacao, filtros). Mutations em REST mantem compatibilidade com o padrao existente dos controllers e validacao via FluentValidation.

**Rationale**: Hybrid approach — aproveita o melhor de cada: GraphQL para leitura flexivel, REST para operacoes com side-effects claros.

**Alternatives considered**: GraphQL puro (mutations mais complexas, perda de compatibilidade com padrao existente), REST puro (N+1, over-fetching, frontend rigido).

## R14: Configuracao de Ambientes (skill /dotnet-env)

**Decision**: Tres ambientes distintos: Development (local, hardcoded), Docker (local containers, `.env`), Production (remote Docker, `.env.prod` + SSL via reverse proxy). Cada ambiente tem seu `appsettings.{Environment}.json`. Secrets nunca commitados. `.env.example` e `.env.prod.example` commitados com placeholders. Deploy via GitHub Actions com SSH.

**Rationale**: Skill `/dotnet-env` define o padrao do projeto. Separacao clara: Development nao depende de Docker (Constitution: Docker nao acessivel localmente). Docker para staging/testes integrados. Production com SSL e secrets isolados.

**Alternatives considered**: Ambiente unico com feature flags (mistura concerns de config e logica), Kubernetes (overkill para escala atual), manual deploy (sem reproducibilidade).

## R15: Variaveis de Ambiente — Frontend GraphQL

**Decision**: Adicionar `VITE_GRAPHQL_ADMIN_URL` e `VITE_GRAPHQL_PUBLIC_URL` como variaveis de ambiente frontend. O `graphqlClient.ts` usa essas URLs para direcionar queries ao endpoint correto.

**Rationale**: Permite que o frontend aponte para diferentes backends por ambiente sem hardcode. Segue Constitution VII (prefixo `VITE_`).

**Alternatives considered**: URL relativa (nao funciona em widget embarcavel em dominio diferente), URL hardcoded (inflexivel entre ambientes).

## R16: Docker Compose — Servicos

**Decision**: `docker-compose.yml` (local) inclui: api (.NET), frontend (Vite build + serve), postgres. Todos com portas expostas. `docker-compose-prod.yml` inclui: api, frontend, postgres (porta NAO exposta), nginx (reverse proxy sem SSL, apenas porta 80).

**Rationale**: Docker local expoe tudo para debug. Producao isola banco e expoe apenas porta 80 via Nginx. SSL nao ativado em nenhum ambiente por decisao do usuario.

**Alternatives considered**: SSL via Let's Encrypt (descartado — nao necessario neste momento), Caddy com auto-SSL (descartado — mesma razao).
