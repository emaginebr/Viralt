# Especificação: Clone do SweepWidget

> Especificação funcional para construção de uma plataforma de sorteios e concursos virais, baseada no modelo do SweepWidget, utilizando a infraestrutura existente do projeto Viralt.

**Created:** 2026-04-02
**Last Updated:** 2026-04-02

> **IMPORTANTE — Escopo de Integrações Sociais:**
> Toda e qualquer integração com redes sociais, chats ou serviços externos (Twitter, Instagram, YouTube, Discord, Telegram, TikTok, Facebook, LinkedIn, etc.) **NÃO** faz parte deste projeto. Essas integrações serão implementadas em fase posterior no projeto externo **BazzucaMedia**. O Viralt deve expor pontos de extensão para que o BazzucaMedia se conecte, mas **não deve** conter integração direta com plataformas sociais.

---

## 1. Visão Geral do Produto

### O que é

Uma plataforma de sorteios, concursos e campanhas virais que permite a marcas, influenciadores e empresas crescerem suas audiências e engajamento através de campanhas interativas. Os participantes completam ações (visitar sites, inscrever-se em newsletters, indicar amigos, preencher formulários, etc.) para ganhar entradas em sorteios de prêmios.

### Proposta de Valor

- Geração de leads via formulários customizáveis e integrações com CRMs
- Viralização orgânica via sistema de indicação (refer-a-friend)
- Engajamento via concursos de foto/vídeo, leaderboards e cupons instantâneos
- Widget embarcável em qualquer site + landing pages hospedadas
- Extensível para integrações sociais via projeto externo BazzucaMedia (fase futura)

---

## 2. O Que Já Existe

### Funcionalidades Implementadas

- **Campanhas**: Criação e gerenciamento com título, descrição, datas, status, imagens, vídeo YouTube, CSS customizado e configurações de campos obrigatórios (nome, e-mail, telefone, idade mínima)
- **Campos customizáveis**: Campos de formulário configuráveis por campanha com opções para dropdowns, radios e checkboxes
- **Métodos de entrada**: Ações configuráveis com tipo, título, pontos, repetição diária e obrigatoriedade
- **Participantes**: Cadastro de participantes com nome, e-mail, telefone, data de nascimento e token de acesso
- **Entradas dos participantes**: Registro das ações completadas por cada participante
- **Autenticação**: Login, registro, recuperação de senha (via NAuth)
- **Upload de imagens**: Armazenamento em S3 (via zTools)
- **Envio de e-mails**: Via MailerSend (via zTools)
- **Interface**: Dashboard, login, recuperação de senha, perfil, homepage com features e pricing
- **Internacionalização**: 4 idiomas (pt, en, es, fr)

### Lacunas Identificadas

- Não há endpoints de API para campanhas, participantes, campos ou entradas
- Não há validação de dados nos formulários
- Serviço de background está desabilitado

---

## 3. Módulos do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        MÓDULO CORE                          │
│  Campanhas · Campos · Métodos de Entrada · Participantes    │
├─────────────────────────────────────────────────────────────┤
│                    MÓDULO VIRAL                              │
│  Referral · Compartilhamento · Leaderboard                  │
├─────────────────────────────────────────────────────────────┤
│                  MÓDULO APRESENTAÇÃO                         │
│  Widget Embarcável · Landing Pages · Builder Visual          │
├─────────────────────────────────────────────────────────────┤
│                   MÓDULO SORTEIO                             │
│  Seleção de Vencedores · Prêmios · Cupons · Milestones      │
├─────────────────────────────────────────────────────────────┤
│                  MÓDULO ANALYTICS                            │
│  Dashboard · Métricas · Exportação · Pixels                 │
├─────────────────────────────────────────────────────────────┤
│                  MÓDULO AVANÇADO                             │
│  Foto/Vídeo Contest · Webhooks · API Pública · Multi-marca  │
├─────────────────────────────────────────────────────────────┤
│              MÓDULO DE EXTENSÃO (Contratos)                  │
│  Interfaces para integrações externas (BazzucaMedia)        │
└─────────────────────────────────────────────────────────────┘

                    ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
                      PROJETO EXTERNO: BazzucaMedia
                    │ (Fase Futura — Fora do escopo Viralt) │
                      Integrações Sociais · OAuth · APIs
                    │ Verificação de Ações · Chats          │
                    └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

---

## 4. Módulo Core — Campanhas e Participantes

### 4.1 Campanha

A campanha é a entidade central do sistema. Já possui campos básicos (título, descrição, datas, imagens, status). Necessita ser expandida com:

**Configurações gerais:**
- URL amigável (slug) gerada automaticamente
- Timezone da campanha
- Limite de entradas por participante
- Quantidade de vencedores a sortear
- Status de publicação (rascunho, agendada, ativa, encerrada, pausada, arquivada)
- Senha de acesso (campanhas privadas)
- URL dos termos e condições
- URL de redirecionamento pós-participação
- Tipo de campanha: Sorteio, Leaderboard, Contest Foto/Vídeo ou Cupom Instantâneo

**Personalização visual:**
- Cor primária, secundária e de fundo
- Fonte customizada (Google Fonts)
- Logo da campanha
- CSS customizado (já existente)

**E-mail de boas-vindas:**
- Habilitar/desabilitar envio automático
- Assunto e corpo do e-mail configuráveis

**Restrições:**
- Lista de países permitidos (geo-blocking)
- Bloqueio de VPN
- Verificação de e-mail obrigatória

**Contadores (para performance):**
- Total de entradas, total de participantes, total de visualizações

### 4.2 Métodos de Entrada

Os métodos de entrada definem as ações que participantes podem completar para ganhar pontos. Já existe a estrutura base. Necessita ser expandida com:

- Ordem de exibição configurável
- Ícone customizado
- Instruções adicionais
- Exigência de verificação (manual)
- URL alvo da ação
- Referência a provedor externo (para integração futura com BazzucaMedia)

**Categorias de métodos de entrada (escopo Viralt):**

| Categoria | Exemplos |
|---|---|
| **Conteúdo** | Visitar URL, comentar em blog, baixar app, upload de arquivo |
| **Newsletter/CRM** | Assinar newsletter, RSS feed |
| **Referral** | Indicar um amigo (link único por participante) |
| **Formulário** | Campo de texto, select, radio, checkbox, código secreto |
| **Bônus** | Entrada bônus (claim), bônus diário |
| **Crypto/Web3** | Carteira Bitcoin, Ethereum, Solana |
| **E-commerce** | Compra via Shopify, WooCommerce |
| **Externo (BazzucaMedia)** | Reservado para ações de redes sociais — fora do escopo Viralt |

### 4.3 Campos Customizáveis do Formulário

Já existe. Tipos de campo suportados:

- Texto curto e longo
- Dropdown (select)
- Seleção única (radio)
- Checkbox único e múltipla escolha
- Data, número, e-mail, telefone, URL
- Upload de arquivo
- Código secreto (deve corresponder a valor predefinido)

### 4.4 Participante

O participante é quem se inscreve em uma campanha. Já existe com dados básicos. Necessita ser expandido com:

- Token de indicação (referral) único
- Referência de quem o indicou
- IP, país e user agent (para detecção de fraude)
- Total de entradas acumuladas
- Status de verificação de e-mail
- Flags de vencedor e desqualificação

### 4.5 Entrada do Participante

Registra cada ação completada por um participante. Necessita ser expandida com:

- Data/hora da conclusão
- Status de verificação
- Dados da verificação
- Quantidade de entradas ganhas nesta ação

---

## 5. Novas Entidades

### 5.1 Prêmio

Prêmios associados a uma campanha com:
- Título, descrição e imagem
- Quantidade disponível
- Tipo: físico, digital, cupom ou crédito
- Código do cupom (quando aplicável)
- Ordem de exibição
- Mínimo de entradas para desbloquear (milestone)

### 5.2 Vencedor

Registro de vencedores com:
- Campanha e participante associados
- Prêmio ganho
- Data da seleção
- Método de seleção (random, leaderboard, manual, votação)
- Status de notificação e resgate

### 5.3 Visualização de Campanha

Rastreia cada visita à página da campanha:
- IP, user agent, URL de origem e país do visitante

### 5.4 Indicação (Referral)

Registra relações de indicação entre participantes:
- Quem indicou, quem foi indicado
- Entradas bônus concedidas ao indicador

### 5.5 Recompensa por Milestone

Recompensas desbloqueáveis ao atingir X entradas:
- Título, descrição e imagem
- Quantidade de entradas necessárias para desbloquear
- Tipo: cupom, download ou conteúdo exclusivo
- Valor da recompensa (código, URL, etc.)

### 5.6 Recompensa Resgatada

Registra quando um participante desbloqueia uma recompensa.

### 5.7 Webhook

Webhooks configuráveis pelo admin:
- URL de destino e secret para validação
- Eventos assinados: inscrição na campanha, ação completada, todas as ações completadas, vencedor selecionado
- Status ativo/inativo

### 5.8 Marca (Brand)

Para suporte multi-marca:
- Nome, slug e logo
- Cor primária
- Domínio customizado
- Cada campanha pertence a uma marca

---

## 6. Módulo de Extensão — Contrato com BazzucaMedia

> **Fora do escopo de implementação do Viralt.** Define apenas os pontos de extensão.

### 6.1 Responsabilidades do BazzucaMedia

- Integrações com redes sociais (Twitter, Instagram, YouTube, TikTok, Discord, Telegram, Facebook, LinkedIn, Twitch, Pinterest, Reddit, Spotify, etc.)
- Conexão OAuth com plataformas sociais
- Verificação automatizada de ações sociais (follow, like, retweet, subscribe, join, etc.)
- Integrações com chats e outros serviços externos

### 6.2 Comunicação entre os Sistemas

**Viralt notifica BazzucaMedia** quando um participante deve completar uma ação social.

**BazzucaMedia responde ao Viralt** confirmando que a ação foi completada, incluindo dados de verificação.

A autenticação entre os sistemas é feita via chave de API compartilhada.

### 6.3 Verificação de Ações (Escopo Viralt)

O Viralt implementa apenas dois tipos de verificação:

1. **Por honra (Honor System)**: Participante clica no link, executa a ação externamente, volta e confirma. Usado para: visitar URL, comentar em blog, baixar app.

2. **Manual pelo admin**: Admin revisa e aprova/rejeita entradas. Usado para: uploads de conteúdo, concursos de foto/vídeo.

> Verificação automatizada via API social será implementada exclusivamente no BazzucaMedia.

### 6.4 O que NÃO implementar no Viralt

- OAuth com plataformas sociais
- Chamadas às APIs de redes sociais
- Armazenamento de tokens de acesso de plataformas sociais
- Qualquer pacote ou SDK de redes sociais

---

## 7. Módulo Viral — Referral e Compartilhamento

### 7.1 Sistema de Indicação (Refer-a-Friend)

1. Participante se inscreve na campanha.
2. Sistema gera um link de indicação único.
3. Quando um novo participante entra via link de indicação:
   - A relação de indicação é registrada.
   - O indicador recebe entradas bônus configuráveis.
4. Opções de compartilhamento: e-mail, WhatsApp (link direto), copiar link. Integrações de share via redes sociais serão adicionadas via BazzucaMedia em fase futura.

### 7.2 Leaderboard

- Ranking de participantes por total de entradas acumuladas.
- Atualização em tempo real.
- Exibe posição, nome (ou iniciais para privacidade) e total de entradas.
- Prêmios podem ser atribuídos por posição no ranking (1º, 2º, 3º, etc.).
- Configurável: mostrar top N participantes.

---

## 8. Módulo Apresentação — Widget e Landing Pages

### 8.1 Widget Embarcável

- Widget que pode ser inserido em qualquer site via código embed.
- Renderiza a campanha dentro de um iframe responsivo.
- Carrega a campanha sem necessidade de autenticação.
- Respeita o tema e cores configurados na campanha.

### 8.2 Landing Page Hospedada

- URL amigável por campanha.
- Página completa com header, campanha e footer.
- SEO: Open Graph tags para compartilhamento.
- Responsiva (mobile-first).
- Customização: cores, fontes, logo, CSS customizado.

### 8.3 Estrutura Visual da Campanha (Participante)

```
┌─────────────────────────────────────────┐
│  [Logo]     Título da Campanha          │
│  Descrição / Regras                     │
├─────────────────────────────────────────┤
│  [Imagem de Destaque / Vídeo YouTube]   │
├─────────────────────────────────────────┤
│  PRÊMIOS                                │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ 1º   │ │ 2º   │ │ 3º   │            │
│  └──────┘ └──────┘ └──────┘            │
├─────────────────────────────────────────┤
│  FORMULÁRIO DE INSCRIÇÃO                │
│  Nome: [__________]                     │
│  E-mail: [__________]                   │
│  [Campos customizados...]               │
│  [PARTICIPAR]                           │
├─────────────────────────────────────────┤
│  GANHE MAIS ENTRADAS (pós-inscrição)    │
│  ┌────────────────────────────┐         │
│  │ ★ Visite nosso site        │ +1 pt   │
│  │ ★ Responda a pesquisa      │ +3 pts  │
│  │ ★ Indique um amigo         │ +10 pts │
│  │ ★ Bônus diário             │ +1 pt   │
│  │ ★ [Ação social via         │ +5 pts  │
│  │    BazzucaMedia - futuro]  │         │
│  └────────────────────────────┘         │
├─────────────────────────────────────────┤
│  SUAS ENTRADAS: 22 │ LEADERBOARD: #5    │
├─────────────────────────────────────────┤
│  ⏱ Termina em: 5d 12h 30m 15s          │
├─────────────────────────────────────────┤
│  RECOMPENSAS DESBLOQUEÁVEIS             │
│  [████████░░] 22/30 — Cupom 10% OFF     │
│  [████░░░░░░] 22/50 — E-book Grátis     │
└─────────────────────────────────────────┘
```

### 8.4 Builder Visual (Painel Admin)

Seções configuráveis:
1. **Informações Básicas** — Título, descrição, datas, timezone
2. **Aparência** — Cores, fontes, logo, imagens, CSS customizado
3. **Campos do Formulário** — Arrastar e soltar campos
4. **Métodos de Entrada** — Adicionar/ordenar ações de entrada. Ações sociais disponíveis via BazzucaMedia (fase futura)
5. **Prêmios** — Cadastrar prêmios e quantidades
6. **Recompensas** — Configurar milestones
7. **E-mail** — E-mail de boas-vindas e notificação de vencedores
8. **Configurações** — Geo-blocking, VPN, verificação, senha, termos
9. **Preview** — Visualização ao vivo da campanha

---

## 9. Módulo Sorteio — Seleção de Vencedores

### 9.1 Métodos de Seleção

**Random (Sorteio):**
- Seleção aleatória ponderada pelo número de entradas.
- Mais entradas = maior probabilidade.
- Excluir desqualificados.

**Leaderboard:**
- Vencedores = top N participantes por entradas acumuladas.
- Empate: desempatar por data de inscrição (quem entrou primeiro).

**Manual:**
- Admin seleciona vencedores manualmente a partir da lista de participantes.

**Votação (Photo/Video Contest):**
- Participantes submetem conteúdo (foto/vídeo).
- Público ou júri vota.
- Mais votos = vencedor.

### 9.2 Fluxo de Seleção de Vencedores

1. Campanha encerra ou admin encerra manualmente.
2. Admin acessa painel de seleção de vencedores.
3. Escolhe método de seleção.
4. Sistema apresenta os vencedores selecionados.
5. Admin confirma ou re-sorteia.
6. Sistema notifica vencedores por e-mail.
7. Vencedores resgatam prêmios (link no e-mail ou painel).

### 9.3 Cupons Instantâneos

- Configurável por campanha: a cada N entradas, participante ganha um cupom.
- Cupons pré-cadastrados pelo admin.
- Distribuídos em ordem (FIFO) ou aleatoriamente.
- Entregues via e-mail e exibidos na interface.

---

## 10. Módulo Analytics

### 10.1 Dashboard da Campanha

| Métrica | Descrição |
|---|---|
| Total de participantes | Inscritos na campanha |
| Total de entradas | Ações completadas |
| Total de visualizações | Visitas à página da campanha |
| Taxa de conversão | Participantes / Visualizações |
| Entradas por método | Breakdown por tipo de ação |
| Participantes por dia | Gráfico temporal |
| Países | Distribuição geográfica |
| Referrals | Indicações e entradas bônus |
| Leaderboard | Top 10 participantes |

### 10.2 Dashboard Geral

| Métrica | Descrição |
|---|---|
| Campanhas ativas | Total em andamento |
| Total de participantes | Soma de todas as campanhas |
| Total de entradas | Soma de todas as campanhas |
| Campanhas recentes | Últimas campanhas criadas |

### 10.3 Exportação de Dados

- **CSV e JSON** — Lista de participantes com nome, e-mail, telefone, data de nascimento, total de entradas, ações completadas, data de inscrição e dados de indicação.
- Filtros: por campanha, por data, por status.

### 10.4 Pixels de Rastreamento

A campanha pode ser configurada com:
- Google Analytics
- Meta/Facebook Pixel
- TikTok Pixel
- Google Tag Manager

Injetados automaticamente no widget e landing page.

---

## 11. Módulo Avançado

### 11.1 Photo/Video Contest

1. Participante submete foto ou vídeo.
2. Admin aprova ou rejeita a submissão.
3. Submissões aprovadas aparecem na galeria pública.
4. Votação:
   - **Pública**: qualquer visitante vota (1 voto por IP/sessão).
   - **Júri**: admin/jurados atribuem pontuação.
5. Vencedor = mais votos ou maior pontuação.

### 11.2 API Pública

API para integração com sistemas externos:

**Leitura:**
- Listar campanhas (ativas, agendadas, encerradas)
- Detalhes de uma campanha
- Lista de participantes e entradas
- Vencedores e leaderboard

**Escrita:**
- Criar, atualizar e excluir campanhas
- Adicionar métodos de entrada e prêmios
- Inserir participante manualmente
- Executar sorteio

### 11.3 Webhooks

1. Admin cadastra URL, secret e eventos no painel.
2. Quando um evento ocorre, sistema envia notificação para a URL.
3. Assinatura para validação de origem.
4. Retry: 3 tentativas com backoff exponencial.

**Eventos disponíveis:**
- Participante se cadastrou na campanha
- Participante completou uma ação
- Participante completou todas as ações
- Vencedor selecionado

### 11.4 Multi-marca

- Cada usuário pode gerenciar múltiplas marcas.
- Cada campanha pertence a uma marca.
- Branding independente: logo, cores, domínio customizado.
- Limite de marcas por plano de assinatura.

---

## 12. Integrações com E-mail/CRM

> **Nota:** Integrações com redes sociais e chats não estão nesta seção — serão tratadas pelo BazzucaMedia.

### Fase 1 — E-mails Transacionais

- Boas-vindas, notificação de vencedor, verificação de e-mail.
- Templates configuráveis por campanha.

### Fase 2 — Integrações com CRMs

Quando participante se inscreve em campanha com integração CRM ativa, seus dados são enviados automaticamente para a lista/tag configurada.

| Prioridade | Serviço |
|---|---|
| P1 | Mailchimp, SendGrid |
| P2 | HubSpot, ActiveCampaign |
| P3 | ConvertKit, Klaviyo |
| P4 | Demais (Brevo, MailerLite, etc.) |

---

## 13. Segurança e Anti-fraude

### Proteções

| Proteção | Descrição |
|---|---|
| Rate limiting | Limite de requisições por IP/minuto |
| Deduplicação de e-mail | Um e-mail por campanha |
| Deduplicação de IP | Alerta ao admin se múltiplos participantes do mesmo IP |
| VPN detection | Detecção de VPN (opcional) |
| Geo-blocking | Bloquear participações de países não permitidos |
| CAPTCHA | No formulário de inscrição |
| Verificação de e-mail | Código enviado por e-mail para confirmação |
| Token por participante | Token único para acessar suas entradas |
| Assinatura em webhooks | Para validar origem das notificações |

### LGPD/GDPR

- Consentimento explícito no formulário de inscrição
- Opção de exportar e excluir dados do participante
- Termos e condições obrigatórios (link configurável)
- Retenção de dados configurável por campanha

---

## 14. Internacionalização

O sistema já suporta 4 idiomas (pt, en, es, fr) e deve ser expandido com novas categorias:

| Categoria | Exemplos |
|---|---|
| Builder de campanha | Títulos, labels e placeholders |
| Métodos de entrada | Nomes das ações (Visitar URL, Indicar Amigo, Bônus, etc.) |
| Widget público | Participar, Suas Entradas, Termina em, etc. |
| Vencedores | Parabéns, Resgatar Prêmio, etc. |
| Analytics | Participantes, Entradas, Visualizações, Taxa de Conversão |
| Erros | Campanha encerrada, já participou, etc. |

O admin configura o idioma da campanha independentemente do idioma do painel. Suporte mínimo MVP: pt, en, es.

---

## 15. Fases de Implementação

### Fase 1 — Core MVP

**Objetivo:** Criar e gerenciar campanhas básicas com métodos de entrada nativos.

- CRUD completo de campanhas, campos, métodos de entrada, prêmios e participantes
- Página pública da campanha (landing page)
- Widget embarcável básico
- Builder de campanha (formulário multi-step)
- Gerenciamento de participantes
- Seleção de vencedores (sorteio aleatório)
- Validação de dados
- Pontos de extensão para BazzucaMedia

### Fase 2 — Viral e Engajamento

**Objetivo:** Sistema de indicação viral e funcionalidades de engajamento.

- Sistema de referral (link único, tracking, entradas bônus)
- Leaderboard
- Cupons instantâneos
- Recompensas por milestone

### Fase 3 — Avançado

**Objetivo:** Funcionalidades premium.

- Concurso de foto/vídeo (submissão, galeria, votação)
- Webhooks
- Exportação CSV/JSON
- Pixels de rastreamento (Google Analytics, Facebook, TikTok)
- Dashboard analytics avançado

### Fase 4 — Escala

**Objetivo:** Multi-marca, API pública, integrações CRM.

- Multi-brand
- API pública
- Integrações CRM (Mailchimp, SendGrid, HubSpot)
- Domínios customizados

### Fase Futura — BazzucaMedia (FORA DO ESCOPO VIRALT)

**Objetivo:** Integrações com redes sociais, chats e serviços externos.

> Implementado no projeto externo **BazzucaMedia**, que se conecta ao Viralt via pontos de extensão.

- OAuth com Twitter, Discord, YouTube, Instagram, TikTok, Facebook, etc.
- Verificação automática de ações sociais
- Integrações com chats (Telegram, WhatsApp, etc.)
- Integrações com outros serviços externos

---

## 16. Diagrama de Entidades

```
User
 └── Brand (1:N)
      └── Campaign (1:N)
           ├── CampaignField (1:N)
           │    └── CampaignFieldOption (1:N)
           ├── CampaignEntry (1:N)
           │    └── CampaignEntryOption (1:N)
           ├── Prize (1:N)
           ├── UnlockReward (1:N)
           ├── CampaignView (1:N)
           ├── Submission (1:N)
           │    └── Vote (1:N)
           ├── Winner (1:N)
           ├── Referral (1:N)
           └── Client (1:N)
                ├── ClientEntry (1:N)
                └── ClientReward (1:N)

Webhook (User 1:N)

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  EXTERNO (BazzucaMedia — fase futura)
  SocialAccount (Client 1:N)
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
```
