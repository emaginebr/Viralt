import { createContext, useState, useCallback, PropsWithChildren } from 'react';
import { userService } from '../Services/userService';
import { saveSession, loadSession, clearSession } from '../Services/apiHelpers';
import type { AuthSession, UserInfo, LoginParam, StatusResult } from '../types/user';

interface AuthContextType {
  // State
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  // Methods
  loginWithEmail: (email: string, password: string) => Promise<StatusResult>;
  logout: () => void;
  loadUserSession: () => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<AuthSession | null>(loadSession<AuthSession>());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithEmail = useCallback(async (email: string, password: string): Promise<StatusResult> => {
    try {
      setLoading(true);
      setError(null);
      const param: LoginParam = { email, password };

      const loginResult = await userService.loginWithEmail(param);
      if (!loginResult.sucesso) {
        return { sucesso: false, mensagem: loginResult.mensagem || 'Login failed', erros: loginResult.erros || null };
      }

      const tokenResult = await userService.getTokenAuthorized(param);
      if (!tokenResult.sucesso || !tokenResult.token) {
        return { sucesso: false, mensagem: tokenResult.mensagem || 'Token failed', erros: tokenResult.erros || null };
      }

      const user = loginResult.user as UserInfo;
      const authSession: AuthSession = {
        userId: user.userId,
        email: user.email,
        name: user.name,
        hash: user.hash,
        token: tokenResult.token,
      };

      saveSession(authSession);
      setSession(authSession);
      return { sucesso: true, mensagem: 'User Logged', erros: null };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      return { sucesso: false, mensagem: msg, erros: null };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const loadUserSession = useCallback(async (): Promise<boolean> => {
    const stored = loadSession<AuthSession>();
    if (stored) {
      setSession(stored);
      return true;
    }
    return false;
  }, []);

  const clearErrorFn = useCallback(() => { setError(null); }, []);

  const value: AuthContextType = {
    session, loading, error,
    loginWithEmail, logout, loadUserSession,
    clearError: clearErrorFn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
