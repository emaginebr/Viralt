import { useContext } from 'react';
import WinnerContext from '../Contexts/WinnerContext';

/** Custom hook to access the Winner context. Throws if used outside WinnerProvider. */
export const useWinner = () => {
  const context = useContext(WinnerContext);
  if (!context) throw new Error('useWinner must be used within a WinnerProvider');
  return context;
};

export default useWinner;
