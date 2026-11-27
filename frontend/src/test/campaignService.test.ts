// campaignService: admin GraphQL queries and REST bodies against the current backend.
import { campaignService } from '../Services/campaignService';
import type { CampaignInsertInfo } from '../types/campaign';

interface GraphQLBody {
  query: string;
  variables: Record<string, unknown>;
}

const jsonResponse = (payload: unknown): Response =>
  ({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    json: async () => payload,
    text: async () => JSON.stringify(payload),
  }) as unknown as Response;

const HIDDEN_FIELDS = ['userId', 'password', 'geoCountries', 'welcomeEmailSubject', 'welcomeEmailBody'];

const insertData = (): CampaignInsertInfo => ({
  userId: 0,
  title: 'Summer',
  description: '',
  startTime: null as string | null,
  endTime: null as string | null,
  status: 1,
  nameRequired: true,
  emailRequired: true,
  phoneRequired: false,
  minAge: null as number | null,
  bgImage: '',
  topImage: '',
  youtubeUrl: '',
  customCss: '',
  minEntry: null as number | null,
  slug: null as string | null,
  timezone: null as string | null,
  maxEntriesPerUser: null as number | null,
  winnerCount: 1,
  isPublished: true,
  password: null as string | null,
  themePrimaryColor: null as string | null,
  themeSecondaryColor: null as string | null,
  themeBgColor: null as string | null,
  themeFont: null as string | null,
  logoImage: null as string | null,
  termsUrl: null as string | null,
  redirectUrl: null as string | null,
  welcomeEmailEnabled: false,
  welcomeEmailSubject: null as string | null,
  welcomeEmailBody: null as string | null,
  geoCountries: null as string | null,
  blockVpn: false,
  requireEmailVerification: false,
  entryType: 2,
  gaTrackingId: null as string | null,
  fbPixelId: null as string | null,
  tiktokPixelId: null as string | null,
  gtmId: null as string | null,
  brandId: null as number | null,
  language: null as string | null,
});

describe('campaignService', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const lastCall = (): { url: string; init: RequestInit } => {
    const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit];
    return { url, init };
  };

  it('getById returns the first item of the campaignById list', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      data: { campaignById: [{ campaignId: 5, title: 'First', entryType: 1 }, { campaignId: 6, title: 'Second', entryType: 1 }] },
    }));

    const result = await campaignService.getById(5);

    const body = JSON.parse(lastCall().init.body as string) as GraphQLBody;
    expect(body.query).toMatch(/\bcampaignById\(/);
    expect(body.variables).toEqual({ id: 5 });
    for (const field of HIDDEN_FIELDS) expect(body.query).not.toMatch(new RegExp(`\\b${field}\\b`));

    expect(result.sucesso).toBe(true);
    expect(result.campaign.campaignId).toBe(5);
    expect(result.campaign.title).toBe('First');
  });

  it('getById returns null when the list is empty', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { campaignById: [] } }));

    const result = await campaignService.getById(99);

    expect(result.campaign).toBeNull();
  });

  it('list uses offset paging (skip/take, items/totalCount) and caps take at 50', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      data: { campaigns: { items: [{ campaignId: 1, title: 'A' }], totalCount: 12 } },
    }));

    const result = await campaignService.list(100);

    const body = JSON.parse(lastCall().init.body as string) as GraphQLBody;
    expect(body.query).toMatch(/campaigns\(skip: \$skip, take: \$take\)/);
    expect(body.query).toMatch(/\bitems\b/);
    expect(body.variables).toEqual({ skip: 0, take: 50 });
    expect(result.campaigns.map((c) => c.campaignId)).toEqual([1]);
    expect(result.totalCount).toBe(12);
  });

  it('insert sends entryType as a string and unwraps the CampaignInfo DTO', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ...insertData(), campaignId: 10, entryType: '2', slug: 'summer' }));

    const result = await campaignService.insert(insertData());

    const { url, init } = lastCall();
    expect(url).toMatch(/\/api\/Campaign\/insert$/);
    expect(init.method).toBe('POST');
    const sent = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(sent.entryType).toBe('2');
    expect(sent.totalEntries).toBe(0);

    expect(result.sucesso).toBe(true);
    expect(result.campaign.campaignId).toBe(10);
    expect(result.campaign.entryType).toBe(2);
  });

  it('insert maps { sucesso: false, mensagem } to a failed result', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ sucesso: false, mensagem: 'Campaign is empty' }));

    const result = await campaignService.insert(insertData());

    expect(result.sucesso).toBe(false);
    expect(result.mensagem).toBe('Campaign is empty');
    expect(result.campaign).toBeNull();
  });
});
