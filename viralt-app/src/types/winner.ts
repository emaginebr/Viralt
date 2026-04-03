/** Winner Types -- Types for the winner selection system */

/** Main winner information */
export interface WinnerInfo {
  winnerId: number;
  campaignId: number;
  clientId: number;
  prizeId: number | null;
  selectedAt: string;
  selectionMethod: number;
  notified: boolean;
  claimed: boolean;
  claimData: string | null;
}

/** Winner list API result */
export interface WinnerListResult {
  sucesso: boolean;
  mensagem: string;
  erros: string[] | null;
  winners: WinnerInfo[];
}

/** Draw request payload */
export interface DrawRequest {
  winnerCount: number;
  selectionMethod: number;
}

/** Status-only result */
export interface StatusResult {
  sucesso: boolean;
  mensagem: string;
  erros: string[] | null;
}
