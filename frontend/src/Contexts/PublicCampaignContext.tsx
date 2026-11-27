import { createContext, useState, useCallback, PropsWithChildren } from 'react';
import { publicService } from '../Services/publicService';
import type { CampaignInfo } from '../types/campaign';
import type { ClientInfo } from '../types/client';
import type {
  LeaderboardEntry, ClientEntry, RegisterData, CompleteEntryData,
  RegisterResult, CompleteEntryResult,
} from '../Services/publicService';

interface PublicCampaignContextType {
  // State
  campaign: CampaignInfo | null;
  entries: ClientEntry[];
  leaderboard: LeaderboardEntry[];
  myToken: string | null;
  myEntries: ClientEntry[];
  totalEntries: number;
  loading: boolean;
  error: string | null;
  // Methods
  loadCampaign: (slug: string) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  completeEntry: (entryMethodId: number, value: string | null) => Promise<CompleteEntryResult>;
  loadLeaderboard: (slug: string, top?: number) => Promise<void>;
  loadMyEntries: (token: string) => Promise<void>;
  clearError: () => void;
}

const PublicCampaignContext = createContext<PublicCampaignContextType | undefined>(undefined);

export const PublicCampaignProvider = ({ children }: PropsWithChildren) => {
  const [campaign, setCampaign] = useState<CampaignInfo | null>(null);
  const [entries, setEntries] = useState<ClientEntry[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myToken, setMyToken] = useState<string | null>(null);
  const [myEntries, setMyEntries] = useState<ClientEntry[]>([]);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown): never => {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    setError(errorMsg);
    throw err;
  };

  const loadCampaign = useCallback(async (slug: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await publicService.getCampaign(slug);
      setCampaign(result);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<RegisterResult> => {
    try {
      setError(null);
      setLoading(true);
      const result = await publicService.register(data);
      if (result.sucesso && result.client) {
        setMyToken(result.client.token);
        setTotalEntries(result.client.totalEntries);
      }
      return result;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const completeEntry = useCallback(async (entryMethodId: number, value: string | null): Promise<CompleteEntryResult> => {
    try {
      setError(null);
      if (!myToken) throw new Error('Not registered');
      const result = await publicService.completeEntry({
        clientToken: myToken,
        entryMethodId,
        value,
      });
      if (result.sucesso && result.clientEntry) {
        setMyEntries((prev) => [...prev, result.clientEntry as ClientEntry]);
        setTotalEntries((prev) => prev + (result.clientEntry?.points || 0));
      }
      return result;
    } catch (err) {
      return handleError(err);
    }
  }, [myToken]);

  const loadLeaderboard = useCallback(async (slug: string, top: number = 10): Promise<void> => {
    try {
      setError(null);
      const result = await publicService.getLeaderboard(slug, top);
      setLeaderboard(result);
    } catch (err) {
      handleError(err);
    }
  }, []);

  const loadMyEntries = useCallback(async (token: string): Promise<void> => {
    try {
      setError(null);
      const result = await publicService.getMyEntries(token);
      setMyEntries(result);
      const total = result.reduce((sum, e) => sum + e.points, 0);
      setTotalEntries(total);
    } catch (err) {
      handleError(err);
    }
  }, []);

  const clearError = useCallback(() => { setError(null); }, []);

  const value: PublicCampaignContextType = {
    campaign, entries, leaderboard, myToken, myEntries, totalEntries, loading, error,
    loadCampaign, register, completeEntry, loadLeaderboard, loadMyEntries, clearError,
  };

  return <PublicCampaignContext.Provider value={value}>{children}</PublicCampaignContext.Provider>;
};

export default PublicCampaignContext;
