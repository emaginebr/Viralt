# Feature Specification: Viral Giveaway & Contest Platform (SweepWidget Clone)

**Feature Branch**: `001-sweepwidget-clone`
**Created**: 2026-04-02
**Status**: Draft
**Input**: User description: Plataforma de sorteios e concursos virais baseada no SweepWidget, com campanhas interativas, sistema de entradas, prêmios, referral, leaderboard, widget embarcável e landing pages. Integrações sociais delegadas ao projeto externo BazzucaMedia.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin cria e publica uma campanha de sorteio (Priority: P1)

O administrador acessa o painel, cria uma nova campanha com título, descrição, datas, prêmios e métodos de entrada (visitar URL, formulário, bônus diário). Personaliza cores, logo e configura campos obrigatórios (nome, e-mail). Publica a campanha e obtém um link público e um código de embed.

**Why this priority**: É a funcionalidade core sem a qual nenhuma outra feature tem valor. Sem criar campanhas, não há participantes, não há sorteio, não há plataforma.

**Independent Test**: Criar uma campanha completa com pelo menos 3 métodos de entrada e 1 prêmio, publicá-la e acessar a landing page pública.

**Acceptance Scenarios**:

1. **Given** o admin está logado, **When** preenche todos os campos obrigatórios e clica "Publicar", **Then** a campanha fica visível na landing page pública via slug.
2. **Given** uma campanha publicada, **When** o admin acessa a listagem de campanhas, **Then** vê a campanha com status "Ativa" e contadores zerados.
3. **Given** o admin cria uma campanha sem título, **When** tenta salvar, **Then** o sistema exibe erro de validação e não salva.

---

### User Story 2 - Participante se inscreve e completa ações em uma campanha (Priority: P1)

Um visitante acessa a landing page ou widget de uma campanha ativa. Preenche o formulário de inscrição (nome, e-mail, campos customizados). Após inscrição, vê a lista de métodos de entrada disponíveis. Completa ações (visitar URL, responder pesquisa, bônus diário) e acumula entradas. Visualiza seu total de entradas e posição no leaderboard.

**Why this priority**: Sem participantes completando ações, não há dados para sorteio. É o fluxo principal do produto do ponto de vista do usuário final.

**Independent Test**: Acessar uma campanha pública, inscrever-se com e-mail, completar 3 ações diferentes e verificar que o total de entradas acumuladas é correto.

**Acceptance Scenarios**:

1. **Given** uma campanha ativa com 3 métodos de entrada, **When** o participante se inscreve com e-mail válido, **Then** recebe um token de acesso e vê os métodos de entrada disponíveis.
2. **Given** um participante inscrito, **When** completa a ação "Visitar URL" e confirma, **Then** suas entradas aumentam conforme configurado naquele método.
3. **Given** um participante inscrito, **When** tenta se inscrever novamente com o mesmo e-mail na mesma campanha, **Then** o sistema recusa e informa que já está inscrito.
4. **Given** um método de entrada com "bônus diário" habilitado, **When** o participante completa a ação, **Then** pode repeti-la novamente após 24 horas, mas não antes.

---

### User Story 3 - Admin sorteia vencedores e notifica por e-mail (Priority: P1)

Após o encerramento de uma campanha (automático por data ou manual), o admin acessa o painel de seleção de vencedores. Escolhe o método de seleção (aleatório ponderado, leaderboard ou manual). O sistema seleciona os vencedores. O admin confirma e o sistema envia notificação por e-mail aos vencedores.

**Why this priority**: É o objetivo final de toda campanha — selecionar e comunicar vencedores. Sem esta funcionalidade, campanhas não têm conclusão.

**Independent Test**: Encerrar uma campanha com pelo menos 10 participantes, executar sorteio aleatório para 2 vencedores e verificar que e-mails foram enviados.

**Acceptance Scenarios**:

1. **Given** uma campanha encerrada com participantes, **When** o admin escolhe "Sorteio Aleatório" com 2 vencedores, **Then** o sistema seleciona 2 participantes distintos, ponderando por entradas.
2. **Given** vencedores selecionados, **When** o admin clica "Notificar Todos", **Then** cada vencedor recebe um e-mail com informações do prêmio.
3. **Given** um participante desqualificado, **When** o sorteio é executado, **Then** esse participante não é elegível.

---

### User Story 4 - Participante indica amigos e ganha entradas bônus (Priority: P2)

Após se inscrever, o participante recebe um link de indicação único. Compartilha via e-mail, WhatsApp ou copiando o link. Quando um novo participante se inscreve via esse link, o indicador recebe entradas bônus. O participante acompanha suas indicações e posição no leaderboard.

**Why this priority**: O sistema de referral é o principal mecanismo de viralização, mas depende do fluxo básico de inscrição e entradas (US1 e US2) estar funcional.

**Independent Test**: Inscrever participante A, obter link de referral, inscrever participante B via link, e verificar que A recebeu entradas bônus.

**Acceptance Scenarios**:

1. **Given** um participante inscrito, **When** acessa a seção "Indique um amigo", **Then** vê seu link de indicação único e opções de compartilhamento (e-mail, WhatsApp, copiar link).
2. **Given** participante B acessa o link de referral de A, **When** se inscreve com sucesso, **Then** participante A recebe as entradas bônus configuradas.
3. **Given** participante B já inscrito na campanha, **When** tenta acessar via link de referral, **Then** o sistema não concede bônus duplicado a A.

---

### User Story 5 - Widget embarcável e landing page customizada (Priority: P2)

O admin obtém o código de embed do widget para inserir em seu site. O widget carrega a campanha dentro de um iframe responsivo. Alternativamente, a campanha é acessível via landing page hospedada com URL amigável. Ambos respeitam a personalização visual (cores, logo, fonte).

**Why this priority**: A distribuição da campanha via widget e landing page é essencial para alcance, mas depende da campanha estar funcional primeiro.

**Independent Test**: Incorporar o widget em uma página HTML simples e verificar que exibe a campanha corretamente em desktop e mobile.

**Acceptance Scenarios**:

1. **Given** uma campanha publicada, **When** o admin copia o código de embed e insere em uma página HTML, **Then** o widget renderiza a campanha com tema correto.
2. **Given** uma campanha com slug "promo-verao", **When** um visitante acessa `/c/promo-verao`, **Then** vê a landing page completa com prêmios, formulário e métodos de entrada.
3. **Given** a campanha tem cores customizadas, **When** a landing page é carregada, **Then** as cores primária, secundária e de fundo são aplicadas corretamente.

---

### User Story 6 - Admin gerencia participantes e exporta dados (Priority: P3)

O admin visualiza a lista de participantes de uma campanha com nome, e-mail, total de entradas, data de inscrição e status. Pode desqualificar participantes. Pode exportar a lista completa em CSV ou JSON com filtros (data, status).

**Why this priority**: Gerenciamento e exportação são funcionalidades de suporte que melhoram a operação, mas não são bloqueantes para o fluxo principal.

**Independent Test**: Acessar a lista de participantes de uma campanha com 20 inscritos, desqualificar 1, exportar CSV e verificar que o desqualificado está marcado.

**Acceptance Scenarios**:

1. **Given** uma campanha com participantes, **When** o admin acessa a lista, **Then** vê todos os participantes com nome, e-mail, entradas e status.
2. **Given** um participante ativo, **When** o admin clica "Desqualificar", **Then** o participante é marcado como desqualificado e não é elegível para sorteio.
3. **Given** a lista de participantes, **When** o admin exporta como CSV, **Then** baixa um arquivo com todos os campos incluindo dados de indicação.

---

### User Story 7 - Concurso de foto/vídeo com galeria e votação (Priority: P3)

O admin cria uma campanha do tipo "Contest Foto/Vídeo". Participantes submetem fotos ou vídeos. O admin aprova ou rejeita submissões. Submissões aprovadas aparecem em galeria pública. Visitantes votam (1 voto por IP/sessão). O vencedor é quem tem mais votos.

**Why this priority**: Concursos de mídia são uma funcionalidade avançada que agrega valor diferencial, mas exige os módulos core e de apresentação prontos.

**Independent Test**: Criar concurso, submeter 3 fotos, aprovar 2, votar em 1, e verificar que a contagem de votos está correta na galeria.

**Acceptance Scenarios**:

1. **Given** uma campanha tipo "Contest", **When** participante faz upload de foto com legenda, **Then** a submissão fica com status "Pendente".
2. **Given** submissões pendentes, **When** admin aprova uma, **Then** ela aparece na galeria pública.
3. **Given** uma galeria com submissões, **When** visitante vota em uma foto, **Then** a contagem de votos incrementa e o visitante não pode votar novamente naquela submissão.

---

### Edge Cases

- O que acontece quando a campanha expira durante a participação de um usuário? O formulário de inscrição é bloqueado, mas entradas já iniciadas podem ser concluídas.
- Como lidar com tentativas de inscrição com e-mails temporários/descartáveis? Aceitar por padrão; admin pode habilitar verificação de e-mail para mitigar.
- O que acontece se todos os cupons instantâneos acabarem? Participantes continuam acumulando entradas normalmente, mas não recebem cupons. Admin é notificado.
- O que acontece com empate no leaderboard? Desempate por data de inscrição — quem se inscreveu primeiro fica em posição superior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE permitir que admins criem campanhas com título, descrição, datas de início/fim, prêmios e métodos de entrada.
- **FR-002**: O sistema DEVE gerar URLs amigáveis (slugs) automaticamente para cada campanha.
- **FR-003**: O sistema DEVE permitir personalização visual por campanha (cores, logo, fonte, CSS customizado).
- **FR-004**: O sistema DEVE suportar 4 tipos de campanha: Sorteio, Leaderboard, Contest Foto/Vídeo, Cupom Instantâneo.
- **FR-005**: O sistema DEVE permitir que participantes se inscrevam via formulário com campos obrigatórios (nome, e-mail) e campos customizáveis.
- **FR-006**: O sistema DEVE suportar campos de formulário dos tipos: texto, textarea, select, radio, checkbox, múltipla escolha, data, número, e-mail, telefone, URL, upload de arquivo, código secreto.
- **FR-007**: O sistema DEVE suportar métodos de entrada das categorias: conteúdo, newsletter, referral, formulário, bônus, crypto/web3, e-commerce.
- **FR-008**: O sistema DEVE garantir deduplicação de e-mail por campanha (um e-mail = uma inscrição por campanha).
- **FR-009**: O sistema DEVE permitir métodos de entrada com repetição diária (bônus diário).
- **FR-010**: O sistema DEVE gerar token único por participante para acesso às suas entradas.
- **FR-011**: O sistema DEVE suportar seleção de vencedores por sorteio aleatório ponderado, leaderboard, seleção manual e votação.
- **FR-012**: O sistema DEVE notificar vencedores por e-mail.
- **FR-013**: O sistema DEVE gerar links de indicação únicos por participante e conceder entradas bônus ao indicador.
- **FR-014**: O sistema DEVE renderizar campanhas em widget embarcável (iframe responsivo) e landing page hospedada.
- **FR-015**: O sistema DEVE suportar exportação de participantes em CSV e JSON.
- **FR-016**: O sistema DEVE permitir que admins desqualifiquem participantes.
- **FR-017**: O sistema DEVE suportar concurso de foto/vídeo com submissão, aprovação, galeria e votação pública.
- **FR-018**: O sistema DEVE suportar recompensas desbloqueáveis por milestone (ao atingir X entradas).
- **FR-019**: O sistema DEVE suportar cupons instantâneos distribuídos ao atingir marcos de entradas.
- **FR-020**: O sistema DEVE suportar geo-blocking (restrição por país), bloqueio de VPN e verificação de e-mail.
- **FR-021**: O sistema DEVE suportar webhooks configuráveis com eventos (inscrição, ação completada, vencedor selecionado).
- **FR-022**: O sistema DEVE expor pontos de extensão para integração com o BazzucaMedia (métodos de entrada com referência a provedor externo e endpoint de callback para verificação).
- **FR-023**: O sistema DEVE suportar multi-marca (Brand) com branding independente por marca.
- **FR-024**: O sistema DEVE exibir dashboard analytics com métricas de participantes, entradas, visualizações, conversão, referrals e leaderboard.
- **FR-025**: O sistema DEVE suportar internacionalização com no mínimo 3 idiomas (pt, en, es) configuráveis por campanha.
- **FR-026**: O sistema DEVE suportar CAPTCHA no formulário de inscrição.
- **FR-027**: O sistema DEVE suportar configuração de pixels de rastreamento (Google Analytics, Meta Pixel, TikTok Pixel, GTM) por campanha.
- **FR-028**: O sistema DEVE enviar e-mail de boas-vindas configurável por campanha (assunto e corpo customizáveis).
- **FR-029**: O sistema NÃO DEVE implementar integrações diretas com redes sociais — essas são responsabilidade exclusiva do projeto BazzucaMedia.

### Key Entities

- **Campaign**: Entidade central. Contém configurações, personalização visual, restrições, contadores e tipo de campanha.
- **CampaignField / CampaignFieldOption**: Campos customizáveis do formulário de inscrição.
- **CampaignEntry / CampaignEntryOption**: Métodos de entrada configuráveis com pontos, repetição e verificação.
- **Client**: Participante inscrito em uma campanha, com token, dados pessoais e flags de status.
- **ClientEntry**: Registro de cada ação completada por um participante.
- **Prize**: Prêmios associados a uma campanha com tipo, quantidade e ordem.
- **Winner**: Registro de vencedores com método de seleção e status de notificação/resgate.
- **Referral**: Relação de indicação entre participantes com entradas bônus.
- **UnlockReward / ClientReward**: Recompensas por milestone e registro de desbloqueio.
- **CampaignView**: Rastreamento de visualizações da campanha.
- **Submission / Vote**: Submissões de foto/vídeo e votos para contests.
- **Webhook**: Configuração de webhooks por admin.
- **Brand**: Marca com branding independente vinculada ao usuário.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins conseguem criar e publicar uma campanha completa (com prêmios, campos e métodos de entrada) em menos de 10 minutos.
- **SC-002**: Participantes conseguem se inscrever e completar sua primeira ação em menos de 2 minutos.
- **SC-003**: A landing page de uma campanha carrega em menos de 3 segundos em conexão 4G.
- **SC-004**: O widget embarcável é responsivo e funciona corretamente em viewports de 320px a 1920px.
- **SC-005**: O sistema suporta pelo menos 1.000 participantes simultâneos em uma mesma campanha sem degradação perceptível.
- **SC-006**: A taxa de conversão de visitantes para participantes inscritos é rastreável e exibida no dashboard.
- **SC-007**: O sistema de referral gera pelo menos 15% de novas inscrições via indicação em campanhas que habilitam o recurso.
- **SC-008**: 100% dos vencedores selecionados recebem notificação por e-mail em até 5 minutos após confirmação do admin.
- **SC-009**: Exportação de CSV com até 10.000 participantes é gerada em menos de 10 segundos.
- **SC-010**: O sistema bloqueia 100% das tentativas de inscrição duplicada (mesmo e-mail, mesma campanha).

## Assumptions

- Admins possuem conexão estável de internet para acessar o painel de gerenciamento.
- Participantes utilizam navegadores modernos (Chrome, Firefox, Safari, Edge — últimas 2 versões).
- O sistema de autenticação existente (NAuth) será reutilizado para o login de admins.
- O envio de e-mails transacionais será feito via zTools/MailerSend existente.
- O upload de imagens (prêmios, logos, submissões) será via zTools/S3 existente.
- O widget embarcável opera via iframe — sem requisito de shadow DOM ou web components.
- Geo-blocking utiliza geolocalização por IP — não requer GPS ou localização do navegador.
- Detecção de VPN é implementada via serviço externo de consulta de IP.
- O suporte a multi-marca (Brand) não inclui domínios customizados com certificado SSL gerenciado — domínios customizados usam CNAME apontando para o domínio principal.
- Integrações CRM (Mailchimp, SendGrid, etc.) estão fora do escopo do MVP — planejadas para Fase 4.
- API pública para integração com sistemas externos está fora do escopo do MVP — planejada para Fase 4.
- Integrações com redes sociais são responsabilidade exclusiva do projeto BazzucaMedia — fora do escopo Viralt.
