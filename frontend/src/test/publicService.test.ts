// publicService.getCampaign: anonymous query against the public `campaign(slug)` field.
import { publicService } from '../Services/publicService';

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

const campaignNode = (campaignId: number, slug: string) => ({
  campaignId,
  title: `Campaign ${campaignId}`,
  description: '',
  slug,
  status: 2,
  isPublished: true,
  totalParticipants: 0,
  prizes: [
    { prizeId: 2, campaignId, title: 'Second', sortOrder: 2, quantity: 1 },
    { prizeId: 1, campaignId, title: 'First', sortOrder: 1, quantity: 1 },
  ],
  campaignEntries: [
    { entryId: 20, campaignId, title: 'Share', entries: 3, sortOrder: 5, entryType: 1, icon: null, instructions: null, entryLabel: null, targetUrl: null },
    { entryId: 10, campaignId, title: 'Follow', entries: 1, sortOrder: 1, entryType: 2, icon: 'instagram', instructions: 'Follow us', entryLabel: null as string | null, targetUrl: 'https://example.com' },
  ],
});

describe('publicService.getCampaign', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const lastBody = (): GraphQLBody => {
    const [, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit];
    return JSON.parse(init.body as string) as GraphQLBody;
  };

  it('queries the public campaign(slug) field without hidden fields or auth', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { campaign: [] } }));

    await publicService.getCampaign('my-slug');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/graphql$/);
    expect((init.headers as Record<string, string>).Authorization).toBeUndefined();

    const body = lastBody();
    expect(body.variables).toEqual({ slug: 'my-slug' });
    expect(body.query).toMatch(/\bcampaign\(/);
    expect(body.query).not.toMatch(/campaignBySlug/);
    expect(body.query).not.toMatch(/\buserId\b/);
    expect(body.query).not.toMatch(/\bpassword\b/);
    expect(body.query).not.toMatch(/\bgeoCountries\b/);
    expect(body.query).not.toMatch(/\bcouponCode\b/);
  });

  it('returns the first item of the list', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ data: { campaign: [campaignNode(7, 'first'), campaignNode(8, 'second')] } }),
    );

    const campaign = await publicService.getCampaign('first');

    expect(campaign).not.toBeNull();
    expect(campaign.campaignId).toBe(7);
    expect(campaign.slug).toBe('first');
    expect(campaign).not.toHaveProperty('prizes');
    expect(campaign).not.toHaveProperty('campaignEntries');
  });

  it('returns null when the list is empty', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { campaign: [] } }));

    await expect(publicService.getCampaign('missing')).resolves.toBeNull();
  });

  it('returns prizes and entry actions sorted by sortOrder (getCampaignDetails)', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: { campaign: [campaignNode(7, 'first')] } }));

    const details = await publicService.getCampaignDetails('first');

    expect(details.prizes.map((p) => p.prizeId)).toEqual([1, 2]);
    expect(details.prizes.every((p) => p.couponCode === null)).toBe(true);
    expect(details.entryMethods.map((e) => e.entryMethodId)).toEqual([10, 20]);
    expect(details.entryMethods[0]).toEqual({
      entryMethodId: 10,
      title: 'Follow',
      description: 'Follow us',
      points: 1,
      entryType: 2,
      icon: 'instagram',
      url: 'https://example.com',
    });
  });
});

describe('publicService REST (PublicController)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const lastCall = (): { url: string; init: RequestInit; body: Record<string, unknown> } => {
    const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1] as [string, RequestInit];
    return { url, init, body: JSON.parse(init.body as string) as Record<string, unknown> };
  };

  it('register sends RegisterRequest (campaignSlug, no campaignId) and returns the token', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ sucesso: true, token: 'tok-123', referralLink: 'REF1', totalEntries: 0 }),
    );

    const result = await publicService.register({
      campaignSlug: 'summer',
      name: 'Ana',
      email: 'ana@example.com',
      phone: '',
      birthday: null,
      referralToken: 'friend-token',
    });

    const { url, init, body } = lastCall();
    expect(url).toMatch(/\/api\/Public\/register$/);
    expect(init.method).toBe('POST');
    expect(body).toEqual({
      campaignSlug: 'summer',
      name: 'Ana',
      email: 'ana@example.com',
      phone: '',
      birthday: null,
      referralToken: 'friend-token',
    });
    expect(body).not.toHaveProperty('campaignId');
    expect(result.sucesso).toBe(true);
    expect(result.token).toBe('tok-123');
    expect(result.totalEntries).toBe(0);
  });

  it('register surfaces { sucesso: false, mensagem }', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ sucesso: false, mensagem: 'Campaign is not active' }));

    const result = await publicService.register({
      campaignSlug: 'closed', name: 'Ana', email: 'ana@example.com', phone: '', birthday: null, referralToken: null,
    });

    expect(result.sucesso).toBe(false);
    expect(result.mensagem).toBe('Campaign is not active');
    expect(result.token).toBeUndefined();
  });

  it('completeEntry sends CompleteEntryRequest (token, entryId, entryValue) and reads entriesEarned/totalEntries', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ sucesso: true, entriesEarned: 3, totalEntries: 7 }));

    const result = await publicService.completeEntry({ token: 'tok-123', entryId: 42, entryValue: null });

    const { url, init, body } = lastCall();
    expect(url).toMatch(/\/api\/Public\/complete-entry$/);
    expect(init.method).toBe('POST');
    expect(body).toEqual({ token: 'tok-123', entryId: 42, entryValue: null });
    expect(body).not.toHaveProperty('clientToken');
    expect(body).not.toHaveProperty('entryMethodId');
    expect(result).toEqual({ sucesso: true, entriesEarned: 3, totalEntries: 7 });
  });

  it('trackView sends TrackViewRequest (campaignSlug, referrer)', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ sucesso: true, mensagem: 'View tracked' }));

    await publicService.trackView({ campaignSlug: 'summer', referrer: null });

    const { url, body } = lastCall();
    expect(url).toMatch(/\/api\/Public\/track-view$/);
    expect(body).toEqual({ campaignSlug: 'summer', referrer: null });
  });
});
