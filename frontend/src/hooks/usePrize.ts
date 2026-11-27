import { useContext } from 'react';
import { PrizeContext } from '../Contexts/PrizeContext';

/** Custom hook to access the Prize context. Throws if used outside PrizeProvider. */
export const usePrize = () => {
  const context = useContext(PrizeContext);
  if (!context) throw new Error('usePrize must be used within a PrizeProvider');
  return context;
};

export default usePrize;
