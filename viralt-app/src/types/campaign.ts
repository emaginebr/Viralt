/** Campaign Types — Types for the campaign system */

/** Main campaign information */
export interface CampaignInfo {
  campaignId: number;
  userId: number;
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  status: number;
  nameRequired: boolean;
  emailRequired: boolean;
  phoneRequired: boolean;
  minAge: number | null;
  bgImage: string;
  topImage: string;
  youtubeUrl: string;
  customCss: string;
  minEntry: number | null;
}

/** Data required to create a new campaign (no ID) */
export interface CampaignInsertInfo {
  userId: number;
  title: string;
  description: string;
  startTime: string | null;
  endTime: string | null;
  status: number;
  nameRequired: boolean;
  emailRequired: boolean;
  phoneRequired: boolean;
  minAge: number | null;
  bgImage: string;
  topImage: string;
  youtubeUrl: string;
  customCss: string;
  minEntry: number | null;
}

/** Data required to update an existing campaign (includes ID) */
export interface CampaignUpdateInfo extends CampaignInsertInfo {
  campaignId: number;
}

/** Campaign list API result */
export interface CampaignListResult {
  campaigns: CampaignInfo[];
  sucesso: boolean;
  mensagem: string | null;
  erros: string[] | null;
}

/** Campaign get API result */
export interface CampaignGetResult {
  campaign: CampaignInfo | null;
  sucesso: boolean;
  mensagem: string | null;
  erros: string[] | null;
}

/** Status-only result (reuse from user types if preferred) */
export interface StatusResult {
  sucesso: boolean;
  mensagem: string;
  erros: string[] | null;
}
