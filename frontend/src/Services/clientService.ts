import type {
  ClientInfo, ClientListResult, ClientGetResult, StatusResult,
} from '../types/client';
import { getApiUrl, getHeaders } from './apiHelpers';
import { graphqlQuery, GRAPHQL_ADMIN } from './graphqlClient';

const API_BASE = `${getApiUrl()}/api/Client`;

interface ClientServiceConfig {
  onUnauthorized?: () => void;
}

/**
 * Client fields readable through GraphQL. ClientPublicType is the `Client` type of the single
 * schema and ignores email, phone, ipAddress, userAgent, birthday and token everywhere.
 */
const CLIENT_FIELDS = `
  clientId
  campaignId
  createdAt
  name
  status
  referralToken
  referredByClientId
  countryCode
  totalEntries
  emailVerified
  isWinner
  isDisqualified
`;

/** Fields of ClientInfo that the GraphQL schema hides. */
type HiddenClientField = 'email' | 'phone' | 'ipAddress' | 'userAgent' | 'birthday' | 'token';

/** `Client` as returned by GraphQL. */
interface ClientNode extends Omit<ClientInfo, HiddenClientField> {}

const fromNode = (node: ClientNode): ClientInfo => ({
  ...node,
  email: null,
  phone: null,
  ipAddress: null,
  userAgent: null,
  birthday: null,
  token: null,
});

/** Client Service — Manages all API operations related to clients (participants) */
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

  /**
   * List the participants of a campaign with every field (email included):
   * GET /api/Client/export/{campaignId}?format=json returns the ClientInfo DTO list.
   * (GraphQL `clientsByCampaign` would hide email/phone.)
   */
  async listByCampaign(campaignId: number): Promise<ClientListResult> {
    const response = await fetch(`${API_BASE}/export/${campaignId}?format=json`, { headers: getHeaders(true) });
    const clients = await this.handleResponse<ClientInfo[] | null>(response);
    return { sucesso: true, mensagem: null, erros: null, clients: Array.isArray(clients) ? clients : [] };
  }

  /** Get a client by ID (GraphQL `clientById` is a list: first item or null; email/phone hidden) */
  async getById(id: number): Promise<ClientGetResult> {
    const query = `
      query GetClientById($id: Long!) {
        clientById(id: $id) {
          ${CLIENT_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ clientById: ClientNode[] | null }>(GRAPHQL_ADMIN, query, { id }, true);
    const node = data?.clientById?.[0];
    return { sucesso: true, mensagem: null, erros: null, client: node ? fromNode(node) : null };
  }

  /** Disqualify a participant (REST POST /api/Client/disqualify/{id}; 404 + StatusResult when not found) */
  async disqualify(id: number): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/disqualify/${id}`, {
      method: 'POST', headers: getHeaders(true),
    });
    if (response.status === 404) {
      return response.json() as Promise<StatusResult>;
    }
    return this.handleResponse<StatusResult>(response);
  }

  /** Delete a client by ID (REST DELETE /api/Client/delete/{id}) */
  async delete(id: number): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/delete/${id}`, {
      method: 'DELETE', headers: getHeaders(true),
    });
    return this.handleResponse<StatusResult>(response);
  }
}

export const clientService = new ClientService();
export default ClientService;
