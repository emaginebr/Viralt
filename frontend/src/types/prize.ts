/** Prize Types — Types for the prize system */

/** Main prize information */
export interface PrizeInfo {
  prizeId: number;
  campaignId: number;
  title: string;
  description: string | null;
  image: string | null;
  quantity: number;
  prizeType: number;
  couponCode: string | null;
  sortOrder: number;
  minEntriesRequired: number | null;
}

/** Data required to create a new prize (no ID) */
export interface PrizeInsertInfo {
  campaignId: number;
  title: string;
  description: string | null;
  image: string | null;
  quantity: number;
  prizeType: number;
  couponCode: string | null;
  sortOrder: number;
  minEntriesRequired: number | null;
}

/** Data required to update an existing prize (includes ID) */
export interface PrizeUpdateInfo extends PrizeInsertInfo {
  prizeId: number;
}

/** Prize list API result */
export interface PrizeListResult {
  sucesso: boolean;
  mensagem: string;
  erros: string[] | null;
  prizes: PrizeInfo[];
}

/** Prize get API result */
export interface PrizeGetResult {
  sucesso: boolean;
  mensagem: string;
  erros: string[] | null;
  prize: PrizeInfo;
}

/** Status-only result */
export interface PrizeStatusResult {
  sucesso: boolean;
  mensagem: string;
  erros: string[] | null;
}
