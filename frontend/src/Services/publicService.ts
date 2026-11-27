import { graphqlQuery, GRAPHQL_PUBLIC } from './graphqlClient';
import { getApiUrl, getHeaders } from './apiHelpers';
import type { CampaignInfo } from '../types/campaign';
import type { ClientInfo } from '../types/client';

const API_BASE = `${getApiUrl()}/api/Public`;

/** Campaign fields fragment for public GraphQL queries */
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
  geoCountries
  blockVpn
  requireEmailVerification
  entryType
  totalEntries
  totalParticipants
  viewCount
  brandId
  language
`;

/** Leaderboard entry */
export interface LeaderboardEntry {
  clientId: number;
  name: string;
  totalEntries: number;
  position: number;
}

/** Client entry (action completed by participant) */
export interface ClientEntry {
  clientEntryId: number;
  clientId: number;
  campaignId: number;
  entryMethodId: number;
  value: string | null;
  points: number;
  createdAt: string;
  status: number;
}

/** Winner info */
export interface WinnerInfo {
  clientId: number;
  name: string;
  prizeTitle: string;
}

/** Registration data sent to the API */
export interface RegisterData {
  campaignId: number;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  referralToken: string | null;
}

/** Complete entry data */
export interface CompleteEntryData {
  clientToken: string;
  entryMethodId: number;
  value: string | null;
}

/** Track view data */
export interface TrackViewData {
  campaignId: number;
  ipAddress: string | null;
  userAgent: string | null;
}

/** Register result */
export interface RegisterResult {
  sucesso: boolean;
  mensagem: string | null;
  erros: string[] | null;
  client: ClientInfo | null;
}

/** Complete entry result */
export interface CompleteEntryResult {
  sucesso: boolean;
  mensagem: string | null;
  erros: string[] | null;
  clientEntry: ClientEntry | null;
}

/** Status-only result */
export interface PublicStatusResult {
  sucesso: boolean;
  mensagem: string | null;
  erros: string[] | null;
}

/** Public Service — Unauthenticated API operations for campaign participants */
class PublicService {

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Request failed');
    }
    return response.json();
  }

  /** Get public campaign by slug (GraphQL, no auth) */
  async getCampaign(slug: string): Promise<CampaignInfo | null> {
    const query = `
      query GetPublicCampaign($slug: String!) {
        campaignBySlug(slug: $slug) {
          ${CAMPAIGN_FIELDS}
        }
      }
    `;
    const data = await graphqlQuery<{ campaignBySlug: CampaignInfo | null }>(
      GRAPHQL_PUBLIC, query, { slug }, false
    );
    return data.campaignBySlug;
  }

  /** Get leaderboard for a campaign (GraphQL, no auth) */
  async getLeaderboard(slug: string, top: number = 10): Promise<LeaderboardEntry[]> {
    const query = `
      query GetLeaderboard($slug: String!, $top: Int!) {
        leaderboard(slug: $slug, top: $top) {
          clientId
          name
          totalEntries
          position
        }
      }
    `;
    const data = await graphqlQuery<{ leaderboard: LeaderboardEntry[] }>(
      GRAPHQL_PUBLIC, query, { slug, top }, false
    );
    return data.leaderboard;
  }

  /** Get entries for a participant by token (GraphQL, no auth) */
  async getMyEntries(token: string): Promise<ClientEntry[]> {
    const query = `
      query GetMyEntries($token: String!) {
        myEntries(token: $token) {
          clientEntryId
          clientId
          campaignId
          entryMethodId
          value
          points
          createdAt
          status
        }
      }
    `;
    const data = await graphqlQuery<{ myEntries: ClientEntry[] }>(
      GRAPHQL_PUBLIC, query, { token }, false
    );
    return data.myEntries;
  }

  /** Get winners for a campaign (GraphQL, no auth) */
  async getWinners(slug: string): Promise<WinnerInfo[]> {
    const query = `
      query GetWinners($slug: String!) {
        winners(slug: $slug) {
          clientId
          name
          prizeTitle
        }
      }
    `;
    const data = await graphqlQuery<{ winners: WinnerInfo[] }>(
      GRAPHQL_PUBLIC, query, { slug }, false
    );
    return data.winners;
  }

  /** Register a new participant (REST, no auth) */
  async register(data: RegisterData): Promise<RegisterResult> {
    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<RegisterResult>(response);
  }

  /** Complete an entry method (REST, no auth) */
  async completeEntry(data: CompleteEntryData): Promise<CompleteEntryResult> {
    const response = await fetch(`${API_BASE}/complete-entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<CompleteEntryResult>(response);
  }

  /** Track a campaign page view (REST, no auth) */
  async trackView(data: TrackViewData): Promise<PublicStatusResult> {
    const response = await fetch(`${API_BASE}/track-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse<PublicStatusResult>(response);
  }

  /** Vote for a submission (REST, no auth) */
  async vote(submissionId: number): Promise<PublicStatusResult> {
    const response = await fetch(`${API_BASE}/vote/${submissionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return this.handleResponse<PublicStatusResult>(response);
  }
}

export const publicService = new PublicService();
export default PublicService;
