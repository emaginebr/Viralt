import { createContext, useState, useCallback, PropsWithChildren } from 'react';
import { clientService } from '../Services/clientService';
import type {
  ClientInfo, ClientListResult, ClientGetResult,
  ClientInsertInfo, ClientUpdateInfo, StatusResult,
} from '../types/client';

interface ClientContextType {
  // State
  clients: ClientInfo[];
  selectedClient: ClientInfo | null;
  loading: boolean;
  error: string | null;
  // API Methods
  listByCampaign: (campaignId: number) => Promise<ClientListResult>;
  getClientById: (id: number) => Promise<ClientGetResult>;
  insertClient: (data: ClientInsertInfo) => Promise<ClientGetResult>;
  updateClient: (data: ClientUpdateInfo) => Promise<ClientGetResult>;
  deleteClient: (id: number) => Promise<StatusResult>;
  // State Management
  loadClients: (campaignId: number) => Promise<void>;
  setSelectedClient: (item: ClientInfo | null) => void;
  clearError: () => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider = ({ children }: PropsWithChildren) => {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown): never => {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    setError(errorMsg);
    throw err;
  };

  // --- API Methods ---

  const listByCampaign = useCallback(async (campaignId: number): Promise<ClientListResult> => {
    try { setError(null); return await clientService.listByCampaign(campaignId); }
    catch (err) { return handleError(err); }
  }, []);

  const getClientById = useCallback(async (id: number): Promise<ClientGetResult> => {
    try { setError(null); return await clientService.getById(id); }
    catch (err) { return handleError(err); }
  }, []);

  const insertClient = useCallback(async (data: ClientInsertInfo): Promise<ClientGetResult> => {
    try {
      setError(null);
      const result = await clientService.insert(data);
      if (result.sucesso && result.client) {
        setClients((prev) => [...prev, result.client as ClientInfo]);
      }
      return result;
    } catch (err) { return handleError(err); }
  }, []);

  const updateClient = useCallback(async (data: ClientUpdateInfo): Promise<ClientGetResult> => {
    try {
      setError(null);
      const result = await clientService.update(data);
      if (result.sucesso && result.client) {
        setClients((prev) => prev.map((item) =>
          item.clientId === data.clientId ? result.client as ClientInfo : item
        ));
        if (selectedClient?.clientId === data.clientId) {
          setSelectedClient(result.client);
        }
      }
      return result;
    } catch (err) { return handleError(err); }
  }, [selectedClient]);

  const deleteClient = useCallback(async (id: number): Promise<StatusResult> => {
    try {
      setError(null);
      const result = await clientService.delete(id);
      if (result.sucesso) {
        setClients((prev) => prev.filter((item) => item.clientId !== id));
        if (selectedClient?.clientId === id) setSelectedClient(null);
      }
      return result;
    } catch (err) { return handleError(err); }
  }, [selectedClient]);

  // --- State Management ---

  const loadClients = useCallback(async (campaignId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientService.listByCampaign(campaignId);
      if (result.sucesso) setClients(result.clients);
      else throw new Error(result.mensagem || 'Failed to load clients');
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, []);

  const clearError = useCallback(() => { setError(null); }, []);

  const value: ClientContextType = {
    clients, selectedClient, loading, error,
    listByCampaign, getClientById, insertClient, updateClient, deleteClient,
    loadClients, setSelectedClient, clearError,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
};

export default ClientContext;
