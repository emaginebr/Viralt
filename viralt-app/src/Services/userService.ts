import type {
  LoginParam, ChangePasswordParam, ChangePasswordUsingHashParam,
  StatusResult, UserResult, UserTokenResult, UserListResult,
} from '../types/user';
import type { UserInfo } from '../types/user';
import { getApiUrl, getHeaders } from './apiHelpers';

const API_BASE = `${getApiUrl()}/api/User`;

interface UserServiceConfig {
  onUnauthorized?: () => void;
}

/** User Service — Manages all API operations related to users */
class UserService {
  private config: UserServiceConfig;

  constructor(config: UserServiceConfig = {}) {
    this.config = config;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      this.config.onUnauthorized?.();
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Request failed');
    }
    return response.json();
  }

  /** Login with email and password */
  async loginWithEmail(param: LoginParam): Promise<UserResult> {
    const response = await fetch(`${API_BASE}/loginwithemail`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(param),
    });
    return this.handleResponse<UserResult>(response);
  }

  /** Get auth token with credentials */
  async getTokenAuthorized(param: LoginParam): Promise<UserTokenResult> {
    const response = await fetch(`${API_BASE}/gettokenauthorized`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(param),
    });
    return this.handleResponse<UserTokenResult>(response);
  }

  /** Get current authenticated user */
  async getMe(): Promise<UserResult> {
    const response = await fetch(`${API_BASE}/getme`, { headers: getHeaders(true) });
    return this.handleResponse<UserResult>(response);
  }

  /** Get user by email */
  async getByEmail(email: string): Promise<UserResult> {
    const response = await fetch(`${API_BASE}/getbyemail/${email}`, { headers: getHeaders() });
    return this.handleResponse<UserResult>(response);
  }

  /** Get user by slug */
  async getBySlug(slug: string): Promise<UserResult> {
    const response = await fetch(`${API_BASE}/getBySlug/${slug}`, { headers: getHeaders() });
    return this.handleResponse<UserResult>(response);
  }

  /** Create a new user */
  async insert(user: UserInfo): Promise<UserResult> {
    const response = await fetch(`${API_BASE}/insert`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(user),
    });
    return this.handleResponse<UserResult>(response);
  }

  /** Update an existing user */
  async update(user: UserInfo): Promise<UserResult> {
    const response = await fetch(`${API_BASE}/update`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(user),
    });
    return this.handleResponse<UserResult>(response);
  }

  /** Check if user has a password */
  async hasPassword(): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/haspassword`, { headers: getHeaders(true) });
    return this.handleResponse<StatusResult>(response);
  }

  /** Change password */
  async changePassword(param: ChangePasswordParam): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/changepassword`, {
      method: 'POST', headers: getHeaders(true), body: JSON.stringify(param),
    });
    return this.handleResponse<StatusResult>(response);
  }

  /** Send password recovery email */
  async sendRecoveryEmail(email: string): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/sendrecoverymail/${email}`, { headers: getHeaders() });
    return this.handleResponse<StatusResult>(response);
  }

  /** Change password using recovery hash */
  async changePasswordUsingHash(param: ChangePasswordUsingHashParam): Promise<StatusResult> {
    const response = await fetch(`${API_BASE}/changepasswordusinghash`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(param),
    });
    return this.handleResponse<StatusResult>(response);
  }

  /** List users with pagination */
  async list(take: number): Promise<UserListResult> {
    const response = await fetch(`${API_BASE}/list/${take}`, { headers: getHeaders() });
    return this.handleResponse<UserListResult>(response);
  }
}

export const userService = new UserService();
export default UserService;
