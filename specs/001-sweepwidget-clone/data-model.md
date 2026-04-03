# Data Model: SweepWidget Clone

**Branch**: `001-sweepwidget-clone` | **Date**: 2026-04-02

## Entidades Existentes (Expandir)

### Campaign (tabela: `campaigns`)

Campos existentes preservados. Novos campos:

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| slug | varchar(260) | Sim | URL amigavel (unica) |
| timezone | varchar(60) | Nao | Timezone (default: UTC) |
| max_entries_per_user | integer | Nao | Limite de entradas (null = ilimitado) |
| winner_count | integer | Nao | Quantidade de vencedores (default: 1) |
| is_published | boolean | Sim | Publicada/visivel (default: false) |
| password | varchar(100) | Nao | Senha de acesso (null = publico) |
| theme_primary_color | varchar(7) | Nao | Cor primaria (#hex) |
| theme_secondary_color | varchar(7) | Nao | Cor secundaria (#hex) |
| theme_bg_color | varchar(7) | Nao | Cor de fundo (#hex) |
| theme_font | varchar(100) | Nao | Fonte Google Fonts |
| logo_image | varchar(80) | Nao | Logo (S3) |
| terms_url | varchar(500) | Nao | URL termos e condicoes |
| redirect_url | varchar(500) | Nao | URL redirect pos-participacao |
| welcome_email_enabled | boolean | Sim | Default: false |
| welcome_email_subject | varchar(260) | Nao | Assunto do e-mail |
| welcome_email_body | text | Nao | Corpo do e-mail (HTML) |
| geo_countries | text | Nao | JSON array de codigos de pais |
| block_vpn | boolean | Sim | Default: false |
| require_email_verification | boolean | Sim | Default: false |
| entry_type | integer | Sim | 1=Sorteio, 2=Leaderboard, 3=Contest, 4=Cupom |
| total_entries | bigint | Sim | Cache (default: 0) |
| total_participants | bigint | Sim | Cache (default: 0) |
| view_count | bigint | Sim | Cache (default: 0) |
| ga_tracking_id | varchar(20) | Nao | Google Analytics |
| fb_pixel_id | varchar(20) | Nao | Meta Pixel |
| tiktok_pixel_id | varchar(20) | Nao | TikTok Pixel |
| gtm_id | varchar(20) | Nao | Google Tag Manager |
| brand_id | bigint FK | Nao | Marca associada |
| language | varchar(5) | Nao | Idioma da campanha (default: "pt") |

Status: 0=Rascunho, 1=Agendada, 2=Ativa, 3=Encerrada, 4=Pausada, 5=Arquivada

### CampaignEntry (tabela: `campaign_entries`)

Novos campos:

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| sort_order | integer | Sim | Ordem de exibicao (default: 0) |
| icon | varchar(80) | Nao | Icone customizado (S3) |
| instructions | varchar(500) | Nao | Instrucoes adicionais |
| require_verification | boolean | Sim | Default: false |
| target_url | varchar(500) | Nao | URL alvo da acao |
| external_provider | varchar(50) | Nao | Provedor externo (BazzucaMedia) |
| external_entry_id | varchar(200) | Nao | ID no sistema externo |

### Client (tabela: `clients`)

Novos campos:

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| referral_token | varchar(20) | Nao | Token unico de indicacao |
| referred_by_client_id | bigint FK | Nao | Quem indicou |
| ip_address | varchar(45) | Nao | IP do participante |
| country_code | varchar(2) | Nao | Pais detectado |
| user_agent | varchar(500) | Nao | User agent |
| total_entries | integer | Sim | Cache de entradas (default: 0) |
| email_verified | boolean | Sim | Default: false |
| is_winner | boolean | Sim | Default: false |
| is_disqualified | boolean | Sim | Default: false |

### ClientEntry (tabela: `client_entries`)

Novos campos:

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| completed_at | timestamp without tz | Nao | Data/hora da conclusao |
| verified | boolean | Sim | Default: false |
| verification_data | text | Nao | Dados da verificacao (JSON) |
| entries_earned | integer | Sim | Entradas ganhas (default: 0) |

---

## Novas Entidades

### Prize (tabela: `prizes`)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| prize_id | bigint PK identity | Sim | ID |
| campaign_id | bigint FK | Sim | FK campaigns |
| title | varchar(260) | Sim | Nome do premio |
| description | text | Nao | Descricao |
| image | varchar(80) | Nao | Imagem (S3) |
| quantity | integer | Sim | Qtd disponivel (default: 1) |
| prize_type | integer | Sim | 1=Fisico, 2=Digital, 3=Cupom, 4=Credito |
| coupon_code | varchar(100) | Nao | Codigo do cupom |
| sort_order | integer | Sim | Ordem (default: 0) |
| min_entries_required | integer | Nao | Minimo entradas p/ desbloquear |

Relacionamentos: Campaign (N:1)

### Winner (tabela: `winners`)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| winner_id | bigint PK identity | Sim | ID |
| campaign_id | bigint FK | Sim | FK campaigns |
| client_id | bigint FK | Sim | FK clients |
| prize_id | bigint FK | Nao | FK prizes (nullable) |
| selected_at | timestamp without tz | Sim | Data da selecao |
| selection_method | integer | Sim | 1=Random, 2=Leaderboard, 3=Manual, 4=Voting |
| notified | boolean | Sim | Default: false |
| claimed | boolean | Sim | Default: false |
| claim_data | text | Nao | Dados do resgate (JSON) |

Relacionamentos: Campaign (N:1), Client (N:1), Prize (N:1 nullable)

### CampaignView (tabela: `campaign_views`)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| view_id | bigint PK identity | Sim | ID |
| campaign_id | bigint FK | Sim | FK campaigns |
| viewed_at | timestamp without tz | Sim | Data/hora |
| ip_address | varchar(45) | Nao | IP |
| user_agent | varchar(500) | Nao | User agent |
| referrer | varchar(500) | Nao | URL de origem |
| country_code | varchar(2) | Nao | Pais |

Relacionamentos: Campaign (N:1)

### Referral (tabela: `referrals`)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| referral_id | bigint PK identity | Sim | ID |
| campaign_id | bigint FK | Sim | FK campaigns |
| referrer_client_id | bigint FK | Sim | Quem indicou |
| referred_client_id | bigint FK | Sim | Quem foi indicado |
| created_at | timestamp without tz | Sim | Data |
| bonus_entries_awarded | integer | Sim | Entradas bonus (default: 0) |

Relacionamentos: Campaign (N:1), Client referrer (N:1), Client referred (N:1)

### UnlockReward (tabela: `unlock_rewards`)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| reward_id | bigint PK identity | Sim | ID |
| campaign_id | bigint FK | Sim | FK campaigns |
| title | varchar(260) | Sim | Nome |
| description | text | Nao | Descricao |
| entries_threshold | integer | Sim | Entradas necessarias |
| reward_type | integer | Sim | 1=Cupom, 2=Download, 3=Conteudo |
| reward_value | text | Nao | Codigo/URL/conteudo |
| image | varchar(80) | Nao | Imagem (S3) |

Relacionamentos: Campaign (N:1)

### ClientReward (tabela: `client_rewards`)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| client_reward_id | bigint PK identity | Sim | ID |
| client_id | bigint FK | Sim | FK clients |
| reward_id | bigint FK | Sim | FK unlock_rewards |
| unlocked_at | timestamp without tz | Sim | Data do desbloqueio |

Relacionamentos: Client (N:1), UnlockReward (N:1)

### Submission (tabela: `submissions`)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| submission_id | bigint PK identity | Sim | ID |
| campaign_id | bigint FK | Sim | FK campaigns |
| client_id | bigint FK | Sim | FK clients |
| file_url | varchar(200) | Sim | URL do arquivo (S3) |
| file_type | integer | Sim | 1=Imagem, 2=Video |
| caption | varchar(500) | Nao | Legenda |
| status | integer | Sim | 0=Pendente, 1=Aprovado, 2=Rejeitado |
| vote_count | integer | Sim | Default: 0 |
| judge_score | decimal(5,2) | Nao | Pontuacao do juri |
| submitted_at | timestamp without tz | Sim | Data |

Relacionamentos: Campaign (N:1), Client (N:1)

### Vote (tabela: `votes`)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| vote_id | bigint PK identity | Sim | ID |
| submission_id | bigint FK | Sim | FK submissions |
| ip_address | varchar(45) | Sim | IP do votante |
| voted_at | timestamp without tz | Sim | Data |

Relacionamentos: Submission (N:1)

### Webhook (tabela: `webhooks`)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| webhook_id | bigint PK identity | Sim | ID |
| user_id | bigint | Sim | Dono |
| url | varchar(500) | Sim | URL de destino |
| secret | varchar(100) | Sim | Secret HMAC |
| events | text | Sim | JSON array de eventos |
| is_active | boolean | Sim | Default: true |
| created_at | timestamp without tz | Sim | Data |

Relacionamentos: User (N:1 via NAuth, sem FK no banco)

### Brand (tabela: `brands`)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| brand_id | bigint PK identity | Sim | ID |
| user_id | bigint | Sim | Dono |
| name | varchar(260) | Sim | Nome da marca |
| slug | varchar(260) | Sim | URL amigavel (unica) |
| logo_image | varchar(80) | Nao | Logo (S3) |
| primary_color | varchar(7) | Nao | Cor primaria |
| custom_domain | varchar(260) | Nao | Dominio customizado |
| created_at | timestamp without tz | Sim | Data |

Relacionamentos: Campaigns (1:N)

---

## Diagrama de Relacionamentos

```
User (NAuth — externo)
 └── Brand (1:N)
      └── Campaign (1:N)
           ├── CampaignField (1:N) → CampaignFieldOption (1:N)
           ├── CampaignEntry (1:N) → CampaignEntryOption (1:N)
           ├── Prize (1:N)
           ├── UnlockReward (1:N)
           ├── CampaignView (1:N)
           ├── Submission (1:N) → Vote (1:N)
           ├── Winner (1:N)
           ├── Referral (1:N)
           └── Client (1:N)
                ├── ClientEntry (1:N)
                └── ClientReward (1:N)
Webhook (User 1:N)
```

## Regras de Validacao

- Campaign.slug: unico, gerado via zTools IStringClient
- Campaign.start_time < Campaign.end_time (quando ambos preenchidos)
- Client.email: unico por campaign_id
- Client.referral_token: unico globalmente
- CampaignEntry.entries: >= 1
- Prize.quantity: >= 1
- UnlockReward.entries_threshold: >= 1
- Winner: client_id nao pode estar em is_disqualified=true
- Vote: unico por (submission_id, ip_address)
- Webhook.url: formato URL valido
- Brand.slug: unico globalmente

## State Transitions

### Campaign.status
```
Rascunho(0) → Agendada(1) → Ativa(2) → Encerrada(3)
                              Ativa(2) → Pausada(4) → Ativa(2)
                              Encerrada(3) → Arquivada(5)
```

### Submission.status
```
Pendente(0) → Aprovado(1)
Pendente(0) → Rejeitado(2)
```

### ClientEntry.status
```
Pendente(0) → Concluido(1)
Pendente(0) → Rejeitado(2)
```
