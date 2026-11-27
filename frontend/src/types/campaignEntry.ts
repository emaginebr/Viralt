/** Campaign entry types — entry actions ("CampaignEntry" on the backend) */

/** Entry action as shown by the public page / widget (mapped from GraphQL `campaignEntries`). */
export interface EntryMethodData {
  /** `CampaignEntry.entryId` */
  entryMethodId: number;
  title: string;
  /** `CampaignEntry.instructions`, falling back to `entryLabel` */
  description: string | null;
  /** Entries earned when completed (`CampaignEntry.entries`) */
  points: number;
  entryType: number;
  icon: string | null;
  /** `CampaignEntry.targetUrl` */
  url: string | null;
}
