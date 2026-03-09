import { createContext, useState, useCallback, ReactNode } from 'react';
import { campaignService } from '../services/campaignService';
import type {
  CampaignInfo, CampaignListResult, CampaignGetResult,
  CampaignInsertInfo, CampaignUpdateInfo, StatusResult,
} from '../types/campaign';

interface CampaignContextType {
  // State
  campaigns: CampaignInfo[];
  selectedCampaign: CampaignInfo | null;
  loading: boolean;
  error: string | null;
  // API Methods
  listCampaigns: (take: number) => Promise<CampaignListResult>;
  listByUser: (userId: number) => Promise<CampaignListResult>;
  getCampaignById: (id: number) => Promise<CampaignGetResult>;
  insertCampaign: (data: CampaignInsertInfo) => Promise<CampaignGetResult>;
  updateCampaign: (data: CampaignUpdateInfo) => Promise<CampaignGetResult>;
  deleteCampaign: (id: number) => Promise<StatusResult>;
  // State Management
  loadCampaigns: (take: number) => Promise<void>;
  loadCampaignsByUser: (userId: number) => Promise<void>;
  setSelectedCampaign: (item: CampaignInfo | null) => void;
  clearError: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider = ({ children }: { children: ReactNode }) => {
  const [campaigns, setCampaigns] = useState<CampaignInfo[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown): never => {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    setError(errorMsg);
    throw err;
  };

  // --- API Methods ---

  const listCampaigns = useCallback(async (take: number): Promise<CampaignListResult> => {
    try { setError(null); return await campaignService.list(take); }
    catch (err) { return handleError(err); }
  }, []);

  const listByUser = useCallback(async (userId: number): Promise<CampaignListResult> => {
    try { setError(null); return await campaignService.listByUser(userId); }
    catch (err) { return handleError(err); }
  }, []);

  const getCampaignById = useCallback(async (id: number): Promise<CampaignGetResult> => {
    try { setError(null); return await campaignService.getById(id); }
    catch (err) { return handleError(err); }
  }, []);

  const insertCampaign = useCallback(async (data: CampaignInsertInfo): Promise<CampaignGetResult> => {
    try {
      setError(null);
      const result = await campaignService.insert(data);
      if (result.sucesso && result.campaign) {
        setCampaigns((prev) => [...prev, result.campaign as CampaignInfo]);
      }
      return result;
    } catch (err) { return handleError(err); }
  }, []);

  const updateCampaign = useCallback(async (data: CampaignUpdateInfo): Promise<CampaignGetResult> => {
    try {
      setError(null);
      const result = await campaignService.update(data);
      if (result.sucesso && result.campaign) {
        setCampaigns((prev) => prev.map((item) =>
          item.campaignId === data.campaignId ? result.campaign as CampaignInfo : item
        ));
        if (selectedCampaign?.campaignId === data.campaignId) {
          setSelectedCampaign(result.campaign);
        }
      }
      return result;
    } catch (err) { return handleError(err); }
  }, [selectedCampaign]);

  const deleteCampaign = useCallback(async (id: number): Promise<StatusResult> => {
    try {
      setError(null);
      const result = await campaignService.delete(id);
      if (result.sucesso) {
        setCampaigns((prev) => prev.filter((item) => item.campaignId !== id));
        if (selectedCampaign?.campaignId === id) setSelectedCampaign(null);
      }
      return result;
    } catch (err) { return handleError(err); }
  }, [selectedCampaign]);

  // --- State Management ---

  const loadCampaigns = useCallback(async (take: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await campaignService.list(take);
      if (result.sucesso) setCampaigns(result.campaigns);
      else throw new Error(result.mensagem || 'Failed to load campaigns');
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, []);

  const loadCampaignsByUser = useCallback(async (userId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await campaignService.listByUser(userId);
      if (result.sucesso) setCampaigns(result.campaigns);
      else throw new Error(result.mensagem || 'Failed to load campaigns');
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, []);

  const clearError = useCallback(() => { setError(null); }, []);

  const value: CampaignContextType = {
    campaigns, selectedCampaign, loading, error,
    listCampaigns, listByUser, getCampaignById, insertCampaign, updateCampaign, deleteCampaign,
    loadCampaigns, loadCampaignsByUser, setSelectedCampaign, clearError,
  };

  return <CampaignContext.Provider value={value}>{children}</CampaignContext.Provider>;
};

export default CampaignContext;
