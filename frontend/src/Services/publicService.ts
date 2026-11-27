import { graphqlQuery, GRAPHQL_PUBLIC } from './graphqlClient';
import { getApiUrl } from './apiHelpers';
import type { CampaignInfo } from '../types/campaign';
import type { EntryMethodData } from '../types/campaignEntry';
import type { PrizeInfo } from '../types/prize';
import type { SubmissionInfo } from '../types/submission';

const API_BASE = `${getApiUrl()}/api/Public`;

/** Page size limit configured on the GraphQL server (ModifyPagingOptions.MaxPageSize). */
const MAX_PAGE_SIZE = 50;

/**
 * Campaign fields fragment for public GraphQL queries.
 * `userId`, `password`, `geoCountries`, `welcomeEmailSubject` and `welcomeEmailBody` are ignored by
 * CampaignPublicType; the schema is single, so they do not exist on `Campaign` and must not be asked.
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

/** Prize fields (PrizeType hides `couponCode`, so it is never asked). */
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

/** CampaignEntry (entry action) fields. */
const CAMPAIGN_ENTRY_FIELDS = `
  entryId
  campaignId
  entryType
  title
  entries
  daily
  mandatory
  entryLabel
  sortOrder
  icon
  instructions
  targetUrl
`;

/** Leaderboard entry */
export interface LeaderboardEntry {
  clientId: number;
  name: string;
  totalEntries: number;
  /** 1-based rank, derived from the order returned by the API. */
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

/** Public campaign with its prizes and entry actions, both sorted by `sortOrder`. */
export interface PublicCampaignDetails {
  campaign: CampaignInfo;
  prizes: PrizeInfo[];
  entryMethods: EntryMethodData[];
}

// ---------------------------------------------------------------------------------------------
// REST contract of backend/Viralt.API/Controllers/PublicController.cs (camelCase JSON)
// ---------------------------------------------------------------------------------------------

/** POST /api/Public/register body (RegisterRequest) */
export interface RegisterData {
  campaignSlug: string;
  name: string;
  email: string;
  phone: string;
  /** ISO date (DateTime?) */
  birthday: string | null;
  /** Referrer's participant token (the backend resolves it with GetByToken) */
  referralToken: string | null;
  customFields?: Record<string, string> | null;
}

/** POST /api/Public/register response: `{ sucesso, token, referralLink, totalEntries }` or `{ sucesso: false, mensagem }` */
export interface RegisterResult {
  sucesso: boolean;
  mensagem?: string | null;
  /** Participant token: identifies the participant in complete-entry, submit and myEntries */
  token?: string | null;
  /** The participant's `referralToken` (not resolved by register: the referral uses `token`) */
  referralLink?: string | null;
  totalEntries?: number;
}

/** POST /api/Public/complete-entry body (CompleteEntryRequest) */
export interface CompleteEntryData {
  token: string;
  /** CampaignEntry.entryId */
  entryId: number;
  entryValue: string | null;
}

/** POST /api/Public/complete-entry response: `{ sucesso, entriesEarned, totalEntries }` or `{ sucesso: false, mensagem }` */
export interface CompleteEntryResult {
  sucesso: boolean;
  mensagem?: string | null;
  entriesEarned?: number;
  /** Participant's new total (includes referral bonuses) */
  totalEntries?: number;
}

/** POST /api/Public/track-view body (TrackViewRequest) */
export interface TrackViewData {
  campaignSlug: string;
  referrer: string | null;
}

/** POST /api/Public/submit body (SubmitRequest); the file must already be uploaded (`fileUrl`) */
export interface SubmitData {
  token: string;
  fileUrl: string;
  /** 0 = image, 1 = video */
  fileType: number;
  caption: string | null;
}

/** POST /api/Public/submit response: `{ sucesso, submission }` or `{ sucesso: false, mensagem }` */
export interface SubmitResult {
  sucesso: boolean;
  mensagem?: string | null;
  submission?: SubmissionInfo | null;
}

/** POST /api/Public/vote/{id} response: `{ sucesso, voteCount }` or `{ sucesso: false, mensagem }` */
export interface VoteResult {
  sucesso: boolean;
  mensagem?: string | null;
  voteCount?: number;
}

/** Status-only result (StatusResult DTO: track-view) */
export interface PublicStatusResult {
  sucesso: boolean;
  mensagem: string | null;
  erros?: string[] | null;
}

// ---------------------------------------------------------------------------------------------
// Raw GraphQL shapes (HotChocolate camelCase of backend/Viralt.Domain/Models)
// ---------------------------------------------------------------------------------------------

/** `Prize` as returned by the public schema (no `couponCode`). */
interface PrizeNode extends Omit<PrizeInfo, 'couponCode'> {}

/** `CampaignEntry` as returned by the public schema. */
interface CampaignEntryNode {
  entryId: number;
  campaignId: number;
  entryType: number;
  title: string | null;
  entries: number;
  daily: boolean;
  mandatory: boolean;
  entryLabel: string | null;
  sortOrder: number;
  icon: string | null;
  instructions: string | null;
  targetUrl: string | null;
}

/** Fields of CampaignInfo that the public schema hides. */
type HiddenCampaignField = 'userId' | 'password' | 'geoCountries' | 'welcomeEmailSubject' | 'welcomeEmailBody';

/** `Campaign` as returned by `campaign(slug)` (with navigations). */
interface CampaignNode extends Omit<CampaignInfo, HiddenCampaignField> {
  prizes?: PrizeNode[] | null;
  campaignEntries?: CampaignEntryNode[] | null;
}

/** `Client` row of the paged `leaderboard` (ClientPublicType). */
interface LeaderboardNode {
  clientId: number;
  name: string | null;
  totalEntries: number;
}

/** `ClientEntry` as returned by `myEntries`. */
interface ClientEntryNode {
  clientEntryId: number;
  clientId: number;
  entryId: number;
  status: number;
  entryValue: string | null;
  completedAt: string | null;
  entriesEarned: number;
  entry?: { campaignId: number } | null;
}

/** `Winner` as returned by `winners`. */
interface WinnerNode {
  clientId: number;
  client?: { name: string | null } | null;
  prize?: { title: string | null } | null;
}

const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T): number => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

const toPrizeInfo = (node: PrizeNode): PrizeInfo => ({ ...node, couponCode: null });

const toEntryMethod = (node: CampaignEntryNode): EntryMethodData => ({
  entryMethodId: node.entryId,
  title: node.title || node.entryLabel || '',
  description: node.instructions || node.entryLabel || null,
  points: node.entries ?? 0,
  entryType: node.entryType,
  icon: node.icon ?? null,
  url: node.targetUrl ?? null,
});

const toCampaignInfo = (node: CampaignNode): CampaignInfo => {
  const fields: CampaignNode = { ...node };
  delete fields.prizes;
  delete fields.campaignEntries;
  return {
    ...fields,
    // Hidden from the public schema: not available to anonymous visitors.
    userId: null,
    password: null,
    geoCountries: null,
    welcomeEmailSubject: null,
    welcomeEmailBody: null,
  };
};

/**
 * Local ClientEntry for an entry action just completed: complete-entry only returns
 * `entriesEarned`/`totalEntries`, so the row is built here until myEntries is reloaded.
 */
export const toLocalClientEntry = (entryId: number, entriesEarned: number): ClientEntry => ({
  clientEntryId: 0,
  clientId: 0,
  campaignId: 0,
  entryMethodId: entryId,
  value: null,
  points: entriesEarned,
  createdAt: new Date().toISOString(),
  status: 1,
});

/** Public Service — Unauthenticated API operations for campaign participants */
class PublicService {

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Request failed');
    }
    return response.json();
  }

  /**
   * Get a published campaign by slug, with its prizes and entry actions (GraphQL, no auth).
   * `campaign(slug)` is a list (IQueryable + UseProjection): the first item is used.
   */
  async getCampaignDetails(slug: string): Promise<PublicCampaignDetails | null> {
    const query = `
      query GetPublicCampaign($slug: String!) {
        campaign(slug: $slug) {
          ${CAMPAIGN_FIELDS}
          prizes {
            ${PRIZE_FIELDS}
          }
          campaignEntries {
            ${CAMPAIGN_ENTRY_FIELDS}
          }
        }
      }
    `;
    const data = await graphqlQuery<{ campaign: CampaignNode[] | null }>(
      GRAPHQL_PUBLIC, query, { slug }, false
    );
    const node = data?.campaign?.[0];
    if (!node) return null;

    return {
      campaign: toCampaignInfo(node),
      prizes: [...(node.prizes ?? [])].sort(bySortOrder).map(toPrizeInfo),
      entryMethods: [...(node.campaignEntries ?? [])].sort(bySortOrder).map(toEntryMethod),
    };
  }

  /** Get public campaign by slug (GraphQL, no auth). Returns the first match or null. */
  async getCampaign(slug: string): Promise<CampaignInfo | null> {
    const details = await this.getCampaignDetails(slug);
    return details ? details.campaign : null;
  }

  /**
   * Get leaderboard for a campaign (GraphQL, no auth).
   * `leaderboard` uses offset paging (`skip`/`take`, `{ items, totalCount }`) and is already ordered by
   * total entries; the position is derived from the index.
   */
  async getLeaderboard(slug: string, top: number = 10): Promise<LeaderboardEntry[]> {
    const take = Math.min(Math.max(Math.trunc(top) || 1, 1), MAX_PAGE_SIZE);
    const query = `
      query GetLeaderboard($slug: String!, $skip: Int!, $take: Int!) {
        leaderboard(slug: $slug, skip: $skip, take: $take) {
          items {
            clientId
            name
            totalEntries
          }
          totalCount
        }
      }
    `;
    const data = await graphqlQuery<{ leaderboard: { items: LeaderboardNode[] | null; totalCount: number } | null }>(
      GRAPHQL_PUBLIC, query, { slug, skip: 0, take }, false
    );
    return (data?.leaderboard?.items ?? []).map((item, index) => ({
      clientId: item.clientId,
      name: item.name ?? '',
      totalEntries: item.totalEntries,
      position: index + 1,
    }));
  }

  /** Get entries for a participant by token (GraphQL, no auth) */
  async getMyEntries(token: string): Promise<ClientEntry[]> {
    const query = `
      query GetMyEntries($token: String!) {
        myEntries(token: $token) {
          clientEntryId
          clientId
          entryId
          status
          entryValue
          completedAt
          entriesEarned
          entry {
            campaignId
          }
        }
      }
    `;
    const data = await graphqlQuery<{ myEntries: ClientEntryNode[] | null }>(
      GRAPHQL_PUBLIC, query, { token }, false
    );
    return (data?.myEntries ?? []).map((node) => ({
      clientEntryId: node.clientEntryId,
      clientId: node.clientId,
      campaignId: node.entry?.campaignId ?? null,
      entryMethodId: node.entryId,
      value: node.entryValue ?? null,
      points: node.entriesEarned ?? 0,
      createdAt: node.completedAt ?? null,
      status: node.status,
    }));
  }

  /** Get winners for a campaign (GraphQL, no auth) */
  async getWinners(slug: string): Promise<WinnerInfo[]> {
    const query = `
      query GetWinners($slug: String!) {
        winners(slug: $slug) {
          clientId
          client {
            name
          }
          prize {
            title
          }
        }
      }
    `;
    const data = await graphqlQuery<{ winners: WinnerNode[] | null }>(
      GRAPHQL_PUBLIC, query, { slug }, false
    );
    return (data?.winners ?? []).map((node) => ({
      clientId: node.clientId,
      name: node.client?.name ?? '',
      prizeTitle: node.prize?.title ?? '',
    }));
  }

  private async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  /** Register a new participant (REST, no auth). The campaign must be active (status 2). */
  async register(data: RegisterData): Promise<RegisterResult> {
    const body: RegisterData = {
      campaignSlug: data.campaignSlug,
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthday: data.birthday,
      referralToken: data.referralToken,
    };
    if (data.customFields) body.customFields = data.customFields;
    return this.post<RegisterResult>('/register', body);
  }

  /** Complete an entry action (REST, no auth) */
  async completeEntry(data: CompleteEntryData): Promise<CompleteEntryResult> {
    const body: CompleteEntryData = { token: data.token, entryId: data.entryId, entryValue: data.entryValue };
    return this.post<CompleteEntryResult>('/complete-entry', body);
  }

  /** Track a campaign page view (REST, no auth) */
  async trackView(data: TrackViewData): Promise<PublicStatusResult> {
    const body: TrackViewData = { campaignSlug: data.campaignSlug, referrer: data.referrer };
    return this.post<PublicStatusResult>('/track-view', body);
  }

  /** Send a contest submission for an already uploaded file (REST, no auth) */
  async submit(data: SubmitData): Promise<SubmitResult> {
    const body: SubmitData = { token: data.token, fileUrl: data.fileUrl, fileType: data.fileType, caption: data.caption };
    return this.post<SubmitResult>('/submit', body);
  }

  /** Vote for a submission (REST, no auth; one vote per IP) */
  async vote(submissionId: number): Promise<VoteResult> {
    return this.post<VoteResult>(`/vote/${submissionId}`);
  }
}

export const publicService = new PublicService();
export default PublicService;
