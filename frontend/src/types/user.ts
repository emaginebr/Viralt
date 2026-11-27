/** User Types — Types for the user system */

/** Main user information */
export interface UserInfo {
  userId: number;
  slug: string;
  imageUrl: string;
  name: string;
  email: string;
  hash: string;
  password: string;
  createAt: string;
  updateAt: string;
}

/** Login credentials */
export interface LoginParam {
  email: string;
  password: string;
}

/** Change password parameters */
export interface ChangePasswordParam {
  oldPassword: string;
  newPassword: string;
}

/** Change password using recovery hash */
export interface ChangePasswordUsingHashParam {
  recoveryHash: string;
  newPassword: string;
}

/** Auth session stored in localStorage */
export interface AuthSession {
  userId: number;
  email: string;
  name: string;
  hash: string;
  token: string;
}

/** Base API response */
export interface StatusResult {
  sucesso: boolean;
  mensagem: string;
  erros: string[] | null;
}

/** User API result */
export interface UserResult extends StatusResult {
  user: UserInfo | null;
}

/** User token API result */
export interface UserTokenResult extends StatusResult {
  token: string | null;
}

/** User list API result */
export interface UserListResult extends StatusResult {
  users: UserInfo[];
}
