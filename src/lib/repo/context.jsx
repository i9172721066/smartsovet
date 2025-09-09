import { createContext, useContext, useMemo } from 'react';
import { SupabaseRepository } from './supabaseRepo.js';
// import { LocalRepository } from './localRepo.js'; // Больше не используем

const RepoContext = createContext(null);

export function RepoProvider({ children }) {
  const repo = useMemo(() => {
    const backend = (import.meta.env.VITE_BACKEND || 'supabase').toLowerCase();
    // Жёстко фиксируем supabase
    console.log('[repo] backend =', backend, '-> SupabaseRepository');
    return new SupabaseRepository();
  }, []);

  return <RepoContext.Provider value={repo}>{children}</RepoContext.Provider>;
}

export function useRepo() {
  const ctx = useContext(RepoContext);
  if (!ctx) throw new Error('useRepo must be used within RepoProvider');
  return ctx;
}
