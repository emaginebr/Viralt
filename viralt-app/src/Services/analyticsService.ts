import { graphqlQuery, GRAPHQL_ADMIN } from './graphqlClient';
import type { CampaignAnalytics, DashboardAnalytics } from '../types/analytics';

/** Analytics Service — Authenticated API operations for analytics data */
class AnalyticsService {

  /** Get analytics for a specific campaign */
  async getCampaignAnalytics(campaignId: number): Promise<CampaignAnalytics> {
    const query = `
      query GetCampaignAnalytics($campaignId: Long!) {
        campaignAnalytics(campaignId: $campaignId) {
          totalParticipants
          totalEntries
          totalViews
          conversionRate
          referralCount
        }
      }
    `;
    const data = await graphqlQuery<{ campaignAnalytics: CampaignAnalytics }>(
      GRAPHQL_ADMIN, query, { campaignId }, true
    );
    return data.campaignAnalytics;
  }

  /** Get dashboard-level analytics (all campaigns) */
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const query = `
      query GetDashboardAnalytics {
        dashboardAnalytics {
          activeCampaigns
          totalParticipantsAll
          totalEntriesAll
        }
      }
    `;
    const data = await graphqlQuery<{ dashboardAnalytics: DashboardAnalytics }>(
      GRAPHQL_ADMIN, query, {}, true
    );
    return data.dashboardAnalytics;
  }
}

export const analyticsService = new AnalyticsService();
export default AnalyticsService;
