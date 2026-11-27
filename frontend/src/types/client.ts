/** Client Types — Types for the client/participant system */

/** Main client information */
export interface ClientInfo {
  clientId: number;
  campaignId: number;
  createdAt: string;
  token: string;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  status: number | null;
  referralToken: string | null;
  referredByClientId: number | null;
  ipAddress: string | null;
  countryCode: string | null;
  userAgent: string | null;
  totalEntries: number;
  emailVerified: boolean;
  isWinner: boolean;
  isDisqualified: boolean;
}

/** Data required to create a new client (no ID) */
export interface ClientInsertInfo {
  campaignId: number;
  name: string;
  email: string;
  phone: string;
  birthday: string | null;
  referredByClientId: number | null;
  ipAddress: string | null;
  countryCode: string | null;
  userAgent: string | null;
}

/** Data required to update an existing client (includes ID) */
export interface ClientUpdateInfo extends ClientInsertInfo {
  clientId: number;
  emailVerified: boolean;
  isWinner: boolean;
  isDisqualified: boolean;
}

/** Client list API result */
export interface ClientListResult {
  clients: ClientInfo[];
  sucesso: boolean;
  mensagem: string | null;
  erros: string[] | null;
}

/** Client get API result */
export interface ClientGetResult {
  client: ClientInfo | null;
  sucesso: boolean;
  mensagem: string | null;
  erros: string[] | null;
}

/** Status-only result */
export interface StatusResult {
  sucesso: boolean;
  mensagem: string;
  erros: string[] | null;
}
