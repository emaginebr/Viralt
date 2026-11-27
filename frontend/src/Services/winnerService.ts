import type {
  WinnerInfo, WinnerListResult, DrawRequest, StatusResult, NotifyAllResult,
} from '../types/winner';
import { getApiUrl, getHeaders } from './apiHelpers';
import { graphqlQuery, GRAPHQL_ADMIN } from './graphqlClient';

const API_BASE = `${getApiUrl()}/api/Winner`;
/** The draw lives on CampaignController: POST /api/Campaign/draw/{id} */
const CAMPAIGN_API_BASE = `${getApiUrl()}/api/Campaign`;

/** Winner as returned by REST (WinnerInfo DTO: `selectionMethod` is a string) or GraphQL (int). */
interface WinnerDto extends Omit<WinnerInfo, 'selectionMethod'> {
  selectionMethod: string | number | null;
}

const normalizeWinner = (dto: WinnerDto): WinnerInfo => {
  const method = Number(dto.selectionMethod);
  return { ...dto, selectionMethod: Number.isFinite(method) ? method : 0 };
};

interface WinnerServiceConfig {
  onUnauthorized?: () => void;
}

/** Winner fields fragment for GraphQL queries */
const WINNER_FIELDS = `
  winnerId
  campaignId
  clientId
  prizeId
  selectedAt
  selectionMethod
  notified
  claimed
  claimData
`;

/** Winner Service — Manages all API operations related to winners */
class WinnerService {
  private config: WinnerServiceConfig;

  constructor(config: WinnerServiceConfig = {}) {
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

  /** List winners by campaign (GraphQL) */
  async listByCampaign(campaignId: number): Promise<WinnerListResult> {
    const query = `
      query ListWinnersByCampaign($campaignId: Long!) {
        winnersByCampaign(campaignId: $campaignId) {
          ${WINNER_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ winnersByCampaign: WinnerDto[] | null }>(
      GRAPHQL_ADMIN, query, { campaignId }, true
    );
    return { sucesso: true, mensagem: '', erros: null, winners: (data?.winnersByCampaign ?? []).map(normalizeWinner) };
  }

  /** Draw winners for a campaign (REST POST /api/Campaign/draw/{campaignId}, body DrawRequest) */
  async draw(campaignId: number, request: DrawRequest): Promise<WinnerListResult> {
    const body: DrawRequest = { winnerCount: request.winnerCount, selectionMethod: request.selectionMethod };
    const response = await fetch(`${CAMPAIGN_API_BASE}/draw/${campaignId}`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(body),
    });
    const result = await this.handleResponse<Omit<WinnerListResult, 'winners'> & { winners: WinnerDto[] | null }>(response);
    return { ...result, winners: (result.winners ?? []).map(normalizeWinner) };
  }

  /** Notify a single winner (REST) */
  async notify(winnerId: number): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/notify/${winnerId}`, {
      method: 'POST', headers: getHeaders(true),
    });
    return this.handleResponse<StatusResult>(response);
  }

  /** Notify all winners of a campaign (REST) */
  async notifyAll(campaignId: number): Promise<NotifyAllResult> {
    const response = await fetch(`${API_BASE}/notifyall/${campaignId}`, {
      method: 'POST', headers: getHeaders(true),
    });
    return this.handleResponse<NotifyAllResult>(response);
  }
}

export const winnerService = new WinnerService();
export default WinnerService;
