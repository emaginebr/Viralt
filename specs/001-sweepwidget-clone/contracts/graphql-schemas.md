# API Contract: GraphQL Schemas

**Technology**: HotChocolate 14.3.0 | **Skill**: `/dotnet-graphql`

## Endpoints

| Schema | Endpoint | Auth | Playground |
|--------|----------|------|------------|
| Admin | `/graphql/admin` | `Authorization: Basic {token}` (NAuth) | Banana Cake Pop |
| Public | `/graphql/public` | Nenhuma | Banana Cake Pop |

## Schema Admin — Queries (autenticadas)

### Campanhas

```graphql
type AdminQuery {
  campaigns(
    skip: Int
    take: Int
    where: CampaignFilterInput
    order: [CampaignSortInput!]
  ): CampaignCollectionSegment

  campaignById(id: Long!): Campaign
  campaignBySlug(slug: String!): Campaign
}
```

Tipo `Campaign` (admin) — expoe todos os campos:

```graphql
type Campaign {
  campaignId: Long!
  userId: Long!
  title: String!
  description: String
  startTime: DateTime
  endTime: DateTime
  status: Int!
  slug: String!
  entryType: Int!
  isPublished: Boolean!
  totalEntries: Long!
  totalParticipants: Long!
  viewCount: Long!
  # ... todos os campos incluindo sensiveis
  
  # Relacionamentos (resolvidos via IQueryable + projection)
  campaignFields: [CampaignField!]!
  campaignEntries: [CampaignEntry!]!
  clients: [Client!]!         # Admin ve todos os dados
  prizes: [Prize!]!
  winners: [Winner!]!
  unlockRewards: [UnlockReward!]!
  submissions: [Submission!]!
  referrals: [Referral!]!
  campaignViews: [CampaignView!]!
}
```

### Participantes

```graphql
extend type AdminQuery {
  clientsByCampaign(
    campaignId: Long!
    skip: Int
    take: Int
    where: ClientFilterInput
    order: [ClientSortInput!]
  ): ClientCollectionSegment

  clientById(id: Long!): Client
}
```

Tipo `Client` (admin) — expoe email, IP, user_agent:

```graphql
type Client {
  clientId: Long!
  campaignId: Long!
  name: String
  email: String!          # Visivel no admin
  phone: String
  birthday: DateTime
  ipAddress: String       # Visivel no admin
  countryCode: String
  totalEntries: Int!
  emailVerified: Boolean!
  isWinner: Boolean!
  isDisqualified: Boolean!
  createdAt: DateTime!
  
  clientEntries: [ClientEntry!]!
  referralToken: String
}
```

### Premios, Vencedores, Analytics

```graphql
extend type AdminQuery {
  prizesByCampaign(campaignId: Long!): [Prize!]!
  winnersByCampaign(campaignId: Long!): [Winner!]!
  
  campaignAnalytics(campaignId: Long!): CampaignAnalytics!
  dashboardAnalytics: DashboardAnalytics!
}

type CampaignAnalytics {
  totalParticipants: Int!
  totalEntries: Int!
  totalViews: Int!
  conversionRate: Float!
  entriesByMethod: [EntryMethodCount!]!
  participantsByDay: [DayCount!]!
  countriesDistribution: [CountryCount!]!
  referralCount: Int!
  topParticipants: [LeaderboardEntry!]!
}

type DashboardAnalytics {
  activeCampaigns: Int!
  totalParticipantsAll: Int!
  totalEntriesAll: Int!
  recentCampaigns: [Campaign!]!
}
```

### Webhooks, Brands

```graphql
extend type AdminQuery {
  webhooks: [Webhook!]!
  brands: [Brand!]!
  brandById(id: Long!): Brand
}
```

---

## Schema Public — Queries (sem auth)

### Campanha Publica

```graphql
type PublicQuery {
  campaign(slug: String!): PublicCampaign
  leaderboard(slug: String!, top: Int = 10): [LeaderboardEntry!]!
  winners(slug: String!): [PublicWinner!]!
  gallery(slug: String!, skip: Int, take: Int): SubmissionCollectionSegment
  myEntries(token: String!): MyEntriesResult
}
```

Tipo `PublicCampaign` — esconde campos sensiveis:

```graphql
type PublicCampaign {
  title: String!
  description: String
  startTime: DateTime
  endTime: DateTime
  status: Int!
  entryType: Int!
  themePrimaryColor: String
  themeSecondaryColor: String
  themeBgColor: String
  themeFont: String
  logoImage: String
  bgImage: String
  topImage: String
  youtubeUrl: String
  customCss: String
  totalParticipants: Long!
  totalEntries: Long!
  language: String
  
  # Relacionamentos (sem dados sensiveis)
  prizes: [PublicPrize!]!           # Sem coupon_code
  entries: [CampaignEntry!]!
  fields: [CampaignField!]!
  unlockRewards: [UnlockReward!]!
}

type PublicPrize {
  title: String!
  description: String
  image: String
  quantity: Int!
  sortOrder: Int!
  # coupon_code OMITIDO
}

type LeaderboardEntry {
  position: Int!
  name: String!          # Iniciais se privacidade
  totalEntries: Int!
}

type PublicWinner {
  name: String!           # Iniciais
  prizeTitle: String
  selectedAt: DateTime!
}

type MyEntriesResult {
  totalEntries: Int!
  completedEntries: [CompletedEntry!]!
  referralToken: String!
  referralLink: String!
  referralCount: Int!
  unlockedRewards: [UnlockReward!]!
}

type CompletedEntry {
  entryId: Long!
  title: String!
  entriesEarned: Int!
  completedAt: DateTime!
}
```

---

## Configuracao HotChocolate

```
MaxPageSize: 50
DefaultPageSize: 10
IncludeTotalCount: true
MaxFieldCost: 8000
Playground: Banana Cake Pop (apenas Development)
```

## Campos Ocultos por Schema

| Campo | Admin | Public |
|-------|-------|--------|
| Client.email | Visivel | Oculto |
| Client.phone | Visivel | Oculto |
| Client.ipAddress | Visivel | Oculto |
| Client.userAgent | Visivel | Oculto |
| Client.birthday | Visivel | Oculto |
| Prize.couponCode | Visivel | Oculto |
| Campaign.password | Visivel | Oculto |
| Campaign.geoCountries | Visivel | Oculto |
| Campaign.welcomeEmailBody | Visivel | Oculto |
