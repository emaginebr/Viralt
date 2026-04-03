import type {
  CampaignInfo, CampaignInsertInfo, CampaignUpdateInfo,
  CampaignListResult, CampaignGetResult, StatusResult,
} from '../types/campaign';
import { getApiUrl, getHeaders } from './apiHelpers';
import { graphqlQuery, GRAPHQL_ADMIN } from './graphqlClient';

const API_BASE = `${getApiUrl()}/api/Campaign`;

interface CampaignServiceConfig {
  onUnauthorized?: () => void;
}

/** Campaign fields fragment for GraphQL queries */
const CAMPAIGN_FIELDS = `
  campaignId
  userId
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
  password
  themePrimaryColor
  themeSecondaryColor
  themeBgColor
  themeFont
  logoImage
  termsUrl
  redirectUrl
  welcomeEmailEnabled
  welcomeEmailSubject
  welcomeEmailBody
  geoCountries
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

  /** List all campaigns (GraphQL) */
  async list(take: number): Promise<CampaignListResult> {
    const query = `
      query ListCampaigns($take: Int!) {
        campaigns(take: $take) {
          ${CAMPAIGN_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ campaigns: CampaignInfo[] }>(
      GRAPHQL_ADMIN, query, { take }, true
    );
    return { sucesso: true, mensagem: null, erros: null, campaigns: data.campaigns };
  }

  /** List campaigns by user (GraphQL) */
  async listByUser(userId: number): Promise<CampaignListResult> {
    const query = `
      query ListCampaignsByUser($userId: Long!) {
        campaignsByUser(userId: $userId) {
          ${CAMPAIGN_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ campaignsByUser: CampaignInfo[] }>(
      GRAPHQL_ADMIN, query, { userId }, true
    );
    return { sucesso: true, mensagem: null, erros: null, campaigns: data.campaignsByUser };
  }

  /** Get a campaign by ID (GraphQL) */
  async getById(id: number): Promise<CampaignGetResult> {
    const query = `
      query GetCampaignById($id: Long!) {
        campaignById(id: $id) {
          ${CAMPAIGN_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ campaignById: CampaignInfo | null }>(
      GRAPHQL_ADMIN, query, { id }, true
    );
    return { sucesso: true, mensagem: null, erros: null, campaign: data.campaignById };
  }

  /** Get a campaign by slug (GraphQL) */
  async getBySlug(slug: string): Promise<CampaignGetResult> {
    const query = `
      query GetCampaignBySlug($slug: String!) {
        campaignBySlug(slug: $slug) {
          ${CAMPAIGN_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ campaignBySlug: CampaignInfo | null }>(
      GRAPHQL_ADMIN, query, { slug }, true
    );
    return { sucesso: true, mensagem: null, erros: null, campaign: data.campaignBySlug };
  }

  /** Create a new campaign (REST) */
  async insert(data: CampaignInsertInfo): Promise<CampaignGetResult> {
    const response = await fetch(`${API_BASE}/insert`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(data),
    });
    return this.handleResponse<CampaignGetResult>(response);
  }

  /** Update an existing campaign (REST) */
  async update(data: CampaignUpdateInfo): Promise<CampaignGetResult> {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(data),
    });
    return this.handleResponse<CampaignGetResult>(response);
  }

  /** Delete a campaign by ID (REST) */
  async delete(id: number): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/delete/${id}`, {
      method: 'DELETE', headers: getHeaders(true),
    });
    return this.handleResponse<StatusResult>(response);
  }
}

export const campaignService = new CampaignService();
export default CampaignService;
