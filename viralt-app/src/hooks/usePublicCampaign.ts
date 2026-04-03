import { useContext } from 'react';
import PublicCampaignContext from '../Contexts/PublicCampaignContext';

/** Custom hook to access the PublicCampaign context. Throws if used outside PublicCampaignProvider. */
export const usePublicCampaign = () => {
  const context = useContext(PublicCampaignContext);
  if (!context) throw new Error('usePublicCampaign must be used within a PublicCampaignProvider');
  return context;
};

export default usePublicCampaign;
