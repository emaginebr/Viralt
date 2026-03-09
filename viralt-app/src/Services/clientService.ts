import type {
  ClientInfo, ClientInsertInfo, ClientUpdateInfo,
  ClientListResult, ClientGetResult, StatusResult,
} from '../types/client';
import { getApiUrl, getHeaders } from './apiHelpers';

const API_BASE = `${getApiUrl()}/api/Client`;

interface ClientServiceConfig {
  onUnauthorized?: () => void;
}

/** Client Service — Manages all API operations related to clients */
class ClientService {
  private config: ClientServiceConfig;

  constructor(config: ClientServiceConfig = {}) {
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

  /** List clients by campaign */
  async listByCampaign(campaignId: number): Promise<ClientListResult> {
    const response = await fetch(`${API_BASE}/listbycampaign/${campaignId}`, { headers: getHeaders(true) });
    return this.handleResponse<ClientListResult>(response);
  }

  /** Get a client by ID */
  async getById(id: number): Promise<ClientGetResult> {
    const response = await fetch(`${API_BASE}/getbyid/${id}`, { headers: getHeaders(true) });
    return this.handleResponse<ClientGetResult>(response);
  }

  /** Create a new client */
  async insert(data: ClientInsertInfo): Promise<ClientGetResult> {
    const response = await fetch(`${API_BASE}/insert`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(data),
    });
    return this.handleResponse<ClientGetResult>(response);
  }

  /** Update an existing client */
  async update(data: ClientUpdateInfo): Promise<ClientGetResult> {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(data),
    });
    return this.handleResponse<ClientGetResult>(response);
  }

  /** Delete a client by ID */
  async delete(id: number): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/delete/${id}`, {
      method: 'DELETE', headers: getHeaders(true),
    });
    return this.handleResponse<StatusResult>(response);
  }
}

export const clientService = new ClientService();
export default ClientService;
