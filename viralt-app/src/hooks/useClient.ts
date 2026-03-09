import { useContext } from 'react';
import ClientContext from '../contexts/ClientContext';

/** Custom hook to access the Client context. Throws if used outside ClientProvider. */
export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) throw new Error('useClient must be used within a ClientProvider');
  return context;
};

export default useClient;
