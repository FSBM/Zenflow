import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Spinner } from './ui/shadcn-io/spinner';

type LoadingContextValue = {
  showLoading: () => void;
  hideLoading: () => void;
  isLoading: boolean;
};

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use a counter so nested calls to show/hide don't prematurely hide the overlay
  const [count, setCount] = useState(0);

  const showLoading = useCallback(() => setCount((c) => c + 1), []);
  const hideLoading = useCallback(() => setCount((c) => Math.max(0, c - 1)), []);

  const value = useMemo(() => ({ showLoading, hideLoading, isLoading: count > 0 }), [showLoading, hideLoading, count]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {value.isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="rounded-md bg-card/80 p-4">
            <Spinner size={48} />
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within a LoadingProvider');
  return ctx;
}

export default LoadingProvider;
