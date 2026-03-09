import type {
  CampaignInfo, CampaignInsertInfo, CampaignUpdateInfo,
  CampaignListResult, CampaignGetResult, StatusResult,
} from '../types/campaign';
import { getApiUrl, getHeaders } from './apiHelpers';

const API_BASE = `${getApiUrl()}/api/Campaign`;

interface CampaignServiceConfig {
  onUnauthorized?: () => void;
}

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

  /** List all campaigns */
  async list(take: number): Promise<CampaignListResult> {
    const response = await fetch(`${API_BASE}/list/${take}`, { headers: getHeaders(true) });
    return this.handleResponse<CampaignListResult>(response);
  }

  /** List campaigns by user */
  async listByUser(userId: number): Promise<CampaignListResult> {
    const response = await fetch(`${API_BASE}/listbyuser/${userId}`, { headers: getHeaders(true) });
    return this.handleResponse<CampaignListResult>(response);
  }

  /** Get a campaign by ID */
  async getById(id: number): Promise<CampaignGetResult> {
    const response = await fetch(`${API_BASE}/getbyid/${id}`, { headers: getHeaders(true) });
    return this.handleResponse<CampaignGetResult>(response);
  }

  /** Create a new campaign */
  async insert(data: CampaignInsertInfo): Promise<CampaignGetResult> {
    const response = await fetch(`${API_BASE}/insert`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(data),
    });
    return this.handleResponse<CampaignGetResult>(response);
  }

  /** Update an existing campaign */
  async update(data: CampaignUpdateInfo): Promise<CampaignGetResult> {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(data),
    });
    return this.handleResponse<CampaignGetResult>(response);
  }

  /** Delete a campaign by ID */
  async delete(id: number): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/delete/${id}`, {
      method: 'DELETE', headers: getHeaders(true),
    });
    return this.handleResponse<StatusResult>(response);
  }
}

export const campaignService = new CampaignService();
export default CampaignService;
