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

/** Prize fields fragment for GraphQL queries (PrizeType ignores `couponCode` in the whole schema). */
const PRIZE_FIELDS = `
  prizeId
  campaignId
  title
  description
  image
  quantity
  prizeType
  sortOrder
  minEntriesRequired
`;

/** `Prize` as returned by GraphQL (no `couponCode`). */
interface PrizeNode extends Omit<PrizeInfo, 'couponCode'> {}

/** Prize DTO as returned by REST (Viralt.DTO.Campaign.PrizeInfo): `prizeType` is a string. */
interface PrizeDto extends Omit<PrizeInfo, 'prizeType'> {
  prizeType: string | number | null;
}

/** REST body (PrizeInsertInfo/PrizeUpdateInfo DTO): `prizeType` string, `minEntriesRequired` non-null int. */
interface PrizeRequestBody extends Omit<PrizeInsertInfo, 'prizeType' | 'minEntriesRequired'> {
  prizeId?: number;
  prizeType: string;
  minEntriesRequired: number;
}

/** `{ sucesso: false, mensagem }` returned instead of a DTO (e.g. empty body). */
interface FailureBody {
  sucesso?: boolean;
  mensagem?: string | null;
  erros?: string[] | null;
}

const fromNode = (node: PrizeNode): PrizeInfo => ({ ...node, couponCode: null });

const fromDto = (dto: PrizeDto): PrizeInfo => {
  const prizeType = Number(dto.prizeType);
  return { ...dto, prizeType: Number.isFinite(prizeType) ? prizeType : 0 };
};

const toRequestBody = (data: PrizeInsertInfo | PrizeUpdateInfo): PrizeRequestBody => ({
  ...data,
  prizeType: String(data.prizeType ?? 0),
  minEntriesRequired: data.minEntriesRequired ?? 0,
});

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

  /** Insert/update return the PrizeInfo DTO itself, or a StatusResult on failure. */
  private toGetResult(body: PrizeDto | FailureBody | null): PrizeGetResult {
    const failure = body as FailureBody | null;
    if (!body || failure.sucesso === false || !('prizeId' in body)) {
      return { sucesso: false, mensagem: failure?.mensagem ?? 'Request failed', erros: failure?.erros ?? null, prize: null };
    }
    return { sucesso: true, mensagem: '', erros: null, prize: fromDto(body as PrizeDto) };
  }

  /** List prizes by campaign (GraphQL `prizesByCampaign`, already ordered by sortOrder) */
  async listByCampaign(campaignId: number): Promise<PrizeListResult> {
    const query = `
      query ListPrizesByCampaign($campaignId: Long!) {
        prizesByCampaign(campaignId: $campaignId) {
          ${PRIZE_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ prizesByCampaign: PrizeNode[] | null }>(
      GRAPHQL_ADMIN, query, { campaignId }, true
    );
    return { sucesso: true, mensagem: '', erros: null, prizes: (data?.prizesByCampaign ?? []).map(fromNode) };
  }

  /** Create a new prize (REST POST /api/Prize/insert) */
  async insert(data: PrizeInsertInfo): Promise<PrizeGetResult> {
    const response = await fetch(`${API_BASE}/insert`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(toRequestBody(data)),
    });
    return this.toGetResult(await this.handleResponse<PrizeDto | FailureBody>(response));
  }

  /** Update an existing prize (REST POST /api/Prize/update) */
  async update(data: PrizeUpdateInfo): Promise<PrizeGetResult> {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(toRequestBody(data)),
    });
    return this.toGetResult(await this.handleResponse<PrizeDto | FailureBody>(response));
  }

  /** Delete a prize by ID (REST DELETE /api/Prize/delete/{id}) */
  async delete(id: number): Promise<PrizeStatusResult> {
    const response = await fetch(`${API_BASE}/delete/${id}`, {
      method: 'DELETE', headers: getHeaders(true),
    });
    return this.handleResponse<PrizeStatusResult>(response);
  }
}

export const prizeService = new PrizeService();
export default PrizeService;
