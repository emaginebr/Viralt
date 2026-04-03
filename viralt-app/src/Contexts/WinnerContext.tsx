import { createContext, useState, useCallback, PropsWithChildren } from 'react';
import { winnerService } from '../Services/winnerService';
import type {
  WinnerInfo, WinnerListResult, DrawRequest, StatusResult,
} from '../types/winner';

interface WinnerContextType {
  // State
  winners: WinnerInfo[];
  loading: boolean;
  error: string | null;
  // Methods
  loadWinners: (campaignId: number) => Promise<void>;
  drawWinners: (campaignId: number, request: DrawRequest) => Promise<WinnerListResult>;
  notifyWinner: (winnerId: number) => Promise<StatusResult>;
  notifyAllWinners: (campaignId: number) => Promise<StatusResult>;
  clearError: () => void;
}

const WinnerContext = createContext<WinnerContextType | undefined>(undefined);

export const WinnerProvider = ({ children }: PropsWithChildren) => {
  const [winners, setWinners] = useState<WinnerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown): never => {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    setError(errorMsg);
    throw err;
  };

  const loadWinners = useCallback(async (campaignId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await winnerService.listByCampaign(campaignId);
      if (result.sucesso) setWinners(result.winners);
      else throw new Error(result.mensagem || 'Failed to load winners');
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, []);

  const drawWinners = useCallback(async (campaignId: number, request: DrawRequest): Promise<WinnerListResult> => {
    try {
      setLoading(true);
      setError(null);
      const result = await winnerService.draw(campaignId, request);
      if (result.sucesso) {
        setWinners(result.winners);
      }
      return result;
    } catch (err) { return handleError(err); }
    finally { setLoading(false); }
  }, []);

  const notifyWinner = useCallback(async (winnerId: number): Promise<StatusResult> => {
    try {
      setError(null);
      const result = await winnerService.notify(winnerId);
      if (result.sucesso) {
        setWinners((prev) => prev.map((w) =>
          w.winnerId === winnerId ? { ...w, notified: true } : w
        ));
      }
      return result;
    } catch (err) { return handleError(err); }
  }, []);

  const notifyAllWinners = useCallback(async (campaignId: number): Promise<StatusResult> => {
    try {
      setError(null);
      const result = await winnerService.notifyAll(campaignId);
      if (result.sucesso) {
        setWinners((prev) => prev.map((w) =>
          w.campaignId === campaignId ? { ...w, notified: true } : w
        ));
      }
      return result;
    } catch (err) { return handleError(err); }
  }, []);

  const clearError = useCallback(() => { setError(null); }, []);

  const value: WinnerContextType = {
    winners, loading, error,
    loadWinners, drawWinners, notifyWinner, notifyAllWinners, clearError,
  };

  return <WinnerContext.Provider value={value}>{children}</WinnerContext.Provider>;
};

export default WinnerContext;
