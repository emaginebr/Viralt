import type {
  PrizeInfo, PrizeInsertInfo, PrizeUpdateInfo,
  PrizeListResult, PrizeGetResult, PrizeStatusResult,
} from '../types/prize';
import { getApiUrl, getHeaders } from './apiHelpers';
import { graphqlQuery, GRAPHQL_ADMIN } from './graphqlClient';

const API_BASE = `${getApiUrl()}/api/Prize`;

interface PrizeServiceConfig {
  onUnauthorized?: () => void;
}

/** Prize fields fragment for GraphQL queries */
const PRIZE_FIELDS = `
  prizeId
  campaignId
  title
  description
  image
  quantity
  prizeType
  couponCode
  sortOrder
  minEntriesRequired
`;

/** Prize Service — Manages all API operations related to prizes */
class PrizeService {
  private config: PrizeServiceConfig;

  constructor(config: PrizeServiceConfig = {}) {
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

  /** List prizes by campaign (GraphQL) */
  async listByCampaign(campaignId: number): Promise<PrizeListResult> {
    const query = `
      query ListPrizesByCampaign($campaignId: Long!) {
        prizesByCampaign(campaignId: $campaignId) {
          ${PRIZE_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ prizesByCampaign: PrizeInfo[] }>(
      GRAPHQL_ADMIN, query, { campaignId }, true
    );
    return { sucesso: true, mensagem: '', erros: null, prizes: data.prizesByCampaign };
  }

  /** Create a new prize (REST) */
  async insert(data: PrizeInsertInfo): Promise<PrizeGetResult> {
    const response = await fetch(`${API_BASE}/insert`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(data),
    });
    return this.handleResponse<PrizeGetResult>(response);
  }

  /** Update an existing prize (REST) */
  async update(data: PrizeUpdateInfo): Promise<PrizeGetResult> {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(data),
    });
    return this.handleResponse<PrizeGetResult>(response);
  }

  /** Delete a prize by ID (REST) */
  async delete(id: number): Promise<PrizeStatusResult> {
    const response = await fetch(`${API_BASE}/delete/${id}`, {
      method: 'DELETE', headers: getHeaders(true),
    });
    return this.handleResponse<PrizeStatusResult>(response);
  }
}

export const prizeService = new PrizeService();
export default PrizeService;
