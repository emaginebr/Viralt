export interface ReferralInfo {
  referralId: number;
  campaignId: number;
  referrerClientId: number;
  referredClientId: number;
  createdAt: string;
  bonusEntriesAwarded: number;
  referrerName?: string;
  referredName?: string;
}
