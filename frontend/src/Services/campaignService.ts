import type {
  CampaignInfo, CampaignInsertInfo, CampaignUpdateInfo,
  CampaignListResult, CampaignGetResult, StatusResult,
} from '../types/campaign';
import { getApiUrl, getHeaders } from './apiHelpers';
import { graphqlQuery, GRAPHQL_ADMIN } from './graphqlClient';

const API_BASE = `${getApiUrl()}/api/Campaign`;

/** Page size limit configured on the GraphQL server (ModifyPagingOptions.MaxPageSize). */
const MAX_PAGE_SIZE = 50;

interface CampaignServiceConfig {
  onUnauthorized?: () => void;
}

/**
 * Campaign fields fragment for GraphQL queries.
 * The schema is single: CampaignPublicType ignores `userId`, `password`, `geoCountries`,
 * `welcomeEmailSubject` and `welcomeEmailBody` on `Campaign` for every query (admin included).
 */
const CAMPAIGN_FIELDS = `
  campaignId
  title
  description
  startTime
  endTime
  status
  nameRequired
  emailRequired
  phoneRequired
  minAge
  bgImage
  topImage
  youtubeUrl
  customCss
  minEntry
  slug
  timezone
  maxEntriesPerUser
  winnerCount
  isPublished
  themePrimaryColor
  themeSecondaryColor
  themeBgColor
  themeFont
  logoImage
  termsUrl
  redirectUrl
  welcomeEmailEnabled
  blockVpn
  requireEmailVerification
  entryType
  totalEntries
  totalParticipants
  viewCount
  gaTrackingId
  fbPixelId
  tiktokPixelId
  gtmId
  brandId
  language
`;

/** Fields of CampaignInfo that the GraphQL schema hides. */
type HiddenCampaignField = 'userId' | 'password' | 'geoCountries' | 'welcomeEmailSubject' | 'welcomeEmailBody';

/** `Campaign` as returned by GraphQL. */
interface CampaignNode extends Omit<CampaignInfo, HiddenCampaignField> {}

/**
 * Campaign DTO as returned by REST insert/update (Viralt.DTO.Campaign.CampaignInfo):
 * every field is present, but `entryType` is a string.
 */
interface CampaignDto extends Omit<CampaignInfo, 'entryType'> {
  entryType: string | number | null;
}

/** REST body (Viralt.DTO.Campaign.CampaignInfo): `entryType` must be a string. */
interface CampaignRequestBody extends Omit<CampaignInfo, 'entryType'> {
  entryType: string;
}

/** `{ sucesso: false, mensagem }` returned by the API instead of a DTO (e.g. empty body). */
interface FailureBody {
  sucesso?: boolean;
  mensagem?: string | null;
  erros?: string[] | null;
}

const toNumberOrNull = (value: string | number | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** GraphQL node → CampaignInfo (hidden fields become null: not readable through GraphQL). */
const fromNode = (node: CampaignNode): CampaignInfo => ({
  ...node,
  userId: null,
  password: null,
  geoCountries: null,
  welcomeEmailSubject: null,
  welcomeEmailBody: null,
});

/** REST DTO → CampaignInfo (`entryType` back to a number). */
const fromDto = (dto: CampaignDto): CampaignInfo => ({
  ...dto,
  entryType: toNumberOrNull(dto.entryType),
});

/** Builds the full REST body: every DTO field, with `entryType` as a string and counters preserved. */
const toRequestBody = (data: CampaignInsertInfo | CampaignUpdateInfo, campaignId: number): CampaignRequestBody => {
  const update = data as Partial<CampaignUpdateInfo>;
  return {
    ...data,
    campaignId,
    userId: data.userId ?? 0,
    entryType: String(data.entryType ?? 0),
    // CampaignService.Update maps the whole DTO onto the row: missing counters would reset them to 0.
    totalEntries: update.totalEntries ?? 0,
    totalParticipants: update.totalParticipants ?? 0,
    viewCount: update.viewCount ?? 0,
  };
};

/** Campaign Service — Manages all API operations related to campaigns */
class CampaignService {
  private config: CampaignServiceConfig;

  constructor(config: CampaignServiceConfig = {}) {
    this.config = config;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      this.config.onUnauthorized?.();
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Request failed');
    }
    return response.json();
  }

  /** Insert/update return the CampaignInfo DTO itself, or a StatusResult on failure. */
  private toGetResult(body: CampaignDto | FailureBody | null): CampaignGetResult {
    const failure = body as FailureBody | null;
    if (!body || failure.sucesso === false || !('campaignId' in body)) {
      return {
        sucesso: false,
        mensagem: failure?.mensagem ?? 'Request failed',
        erros: failure?.erros ?? null,
        campaign: null,
      };
    }
    return { sucesso: true, mensagem: null, erros: null, campaign: fromDto(body as CampaignDto) };
  }

  /** List campaigns (GraphQL `campaigns`, offset paging: `skip`/`take` → `{ items, totalCount }`) */
  async list(take: number, skip: number = 0): Promise<CampaignListResult> {
    const query = `
      query ListCampaigns($skip: Int!, $take: Int!) {
        campaigns(skip: $skip, take: $take) {
          items {
            ${CAMPAIGN_FIELDS}
          }
          totalCount
        }
      }
    `;
    const pageSize = Math.min(Math.max(Math.trunc(take) || 1, 1), MAX_PAGE_SIZE);
    const data = await graphqlQuery<{ campaigns: { items: CampaignNode[] | null; totalCount: number } | null }>(
      GRAPHQL_ADMIN, query, { skip: Math.max(0, Math.trunc(skip) || 0), take: pageSize }, true
    );
    const items = data?.campaigns?.items ?? [];
    return {
      sucesso: true, mensagem: null, erros: null,
      campaigns: items.map(fromNode),
      totalCount: data?.campaigns?.totalCount ?? items.length,
    };
  }

  /**
   * List campaigns of a user. There is no `campaignsByUser` query and `userId` is hidden from the
   * schema, so it cannot be filtered: this returns the same first page as `list` (see report).
   */
  async listByUser(_userId: number): Promise<CampaignListResult> {
    return this.list(MAX_PAGE_SIZE);
  }

  /** Get a campaign by ID (GraphQL `campaignById` is a list: first item or null) */
  async getById(id: number): Promise<CampaignGetResult> {
    const query = `
      query GetCampaignById($id: Long!) {
        campaignById(id: $id) {
          ${CAMPAIGN_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ campaignById: CampaignNode[] | null }>(
      GRAPHQL_ADMIN, query, { id }, true
    );
    const node = data?.campaignById?.[0];
    return { sucesso: true, mensagem: null, erros: null, campaign: node ? fromNode(node) : null };
  }

  /** Get a campaign by slug (GraphQL `campaignBySlug` is a list: first item or null) */
  async getBySlug(slug: string): Promise<CampaignGetResult> {
    const query = `
      query GetCampaignBySlug($slug: String!) {
        campaignBySlug(slug: $slug) {
          ${CAMPAIGN_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ campaignBySlug: CampaignNode[] | null }>(
      GRAPHQL_ADMIN, query, { slug }, true
    );
    const node = data?.campaignBySlug?.[0];
    return { sucesso: true, mensagem: null, erros: null, campaign: node ? fromNode(node) : null };
  }

  /** Create a new campaign (REST POST /api/Campaign/insert; the backend sets userId from the session) */
  async insert(data: CampaignInsertInfo): Promise<CampaignGetResult> {
    const response = await fetch(`${API_BASE}/insert`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(toRequestBody(data, 0)),
    });
    return this.toGetResult(await this.handleResponse<CampaignDto | FailureBody>(response));
  }

  /** Update an existing campaign (REST POST /api/Campaign/update; the whole row is overwritten) */
  async update(data: CampaignUpdateInfo): Promise<CampaignGetResult> {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(toRequestBody(data, data.campaignId)),
    });
    return this.toGetResult(await this.handleResponse<CampaignDto | FailureBody>(response));
  }

  /** Delete a campaign by ID (REST DELETE /api/Campaign/delete/{id}) */
  async delete(id: number): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/delete/${id}`, {
      method: 'DELETE', headers: getHeaders(true),
    });
    return this.handleResponse<StatusResult>(response);
  }
}

export const campaignService = new CampaignService();
export default CampaignService;
