import { createContext, useState, useCallback, PropsWithChildren } from 'react';
import { prizeService } from '../Services/prizeService';
import type {
  PrizeInfo, PrizeListResult, PrizeGetResult,
  PrizeInsertInfo, PrizeUpdateInfo, PrizeStatusResult,
} from '../types/prize';

interface PrizeContextType {
  // State
  prizes: PrizeInfo[];
  selectedPrize: PrizeInfo | null;
  loading: boolean;
  error: string | null;
  // API Methods
  listByCampaign: (campaignId: number) => Promise<PrizeListResult>;
  insertPrize: (data: PrizeInsertInfo) => Promise<PrizeGetResult>;
  updatePrize: (data: PrizeUpdateInfo) => Promise<PrizeGetResult>;
  deletePrize: (id: number) => Promise<PrizeStatusResult>;
  // State Management
  loadPrizesByCampaign: (campaignId: number) => Promise<void>;
  setSelectedPrize: (item: PrizeInfo | null) => void;
  clearError: () => void;
}

export const PrizeContext = createContext<PrizeContextType | undefined>(undefined);

export const PrizeProvider = ({ children }: PropsWithChildren) => {
  const [prizes, setPrizes] = useState<PrizeInfo[]>([]);
  const [selectedPrize, setSelectedPrize] = useState<PrizeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown): never => {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    setError(errorMsg);
    throw err;
  };

  // --- API Methods ---

  const listByCampaign = useCallback(async (campaignId: number): Promise<PrizeListResult> => {
    try { setError(null); return await prizeService.listByCampaign(campaignId); }
    catch (err) { return handleError(err); }
  }, []);

  const insertPrize = useCallback(async (data: PrizeInsertInfo): Promise<PrizeGetResult> => {
    try {
      setError(null);
      const result = await prizeService.insert(data);
      if (result.sucesso && result.prize) {
        setPrizes((prev) => [...prev, result.prize]);
      }
      return result;
    } catch (err) { return handleError(err); }
  }, []);

  const updatePrize = useCallback(async (data: PrizeUpdateInfo): Promise<PrizeGetResult> => {
    try {
      setError(null);
      const result = await prizeService.update(data);
      if (result.sucesso && result.prize) {
        setPrizes((prev) => prev.map((item) =>
          item.prizeId === data.prizeId ? result.prize : item
        ));
        if (selectedPrize?.prizeId === data.prizeId) {
          setSelectedPrize(result.prize);
        }
      }
      return result;
    } catch (err) { return handleError(err); }
  }, [selectedPrize]);

  const deletePrize = useCallback(async (id: number): Promise<PrizeStatusResult> => {
    try {
      setError(null);
      const result = await prizeService.delete(id);
      if (result.sucesso) {
        setPrizes((prev) => prev.filter((item) => item.prizeId !== id));
        if (selectedPrize?.prizeId === id) setSelectedPrize(null);
      }
      return result;
    } catch (err) { return handleError(err); }
  }, [selectedPrize]);

  // --- State Management ---

  const loadPrizesByCampaign = useCallback(async (campaignId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await prizeService.listByCampaign(campaignId);
      if (result.sucesso) setPrizes(result.prizes);
      else throw new Error(result.mensagem || 'Failed to load prizes');
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, []);

  const clearError = useCallback(() => { setError(null); }, []);

  const value: PrizeContextType = {
    prizes, selectedPrize, loading, error,
    listByCampaign, insertPrize, updatePrize, deletePrize,
    loadPrizesByCampaign, setSelectedPrize, clearError,
  };

  return <PrizeContext.Provider value={value}>{children}</PrizeContext.Provider>;
};

export default PrizeContext;
