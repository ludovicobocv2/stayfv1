'use client';

import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '@/app/hooks/useAuth';
import { useDataSync } from '@/app/hooks/useDataSync';
import { useStore } from '@/app/stores/store';
import { BaseItem } from '@/app/types/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signInWithEmail: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUpWithEmail: (email: string, password: string, userData?: { [key: string]: any }) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ success: boolean; error: any }>;
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configurações comuns para sincronização
const SYNC_CONFIG = {
  enabled: true,
  interval: 5000 // sincroniza a cada 5 segundos
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const store = useStore();

  // Configurar sincronização para cada tipo de dado
  const prioritiesSync = useDataSync({
    table: 'priorities',
    localStorageKey: 'priorities',
    getLocalData: () => store.prioridades,
    setLocalData: (data) => store.setPrioridades(data),
    ...SYNC_CONFIG
  });

  const medicationsSync = useDataSync({
    table: 'medications',
    localStorageKey: 'medications',
    getLocalData: () => store.medicamentos,
    setLocalData: (data) => store.setMedicamentos(data),
    ...SYNC_CONFIG
  });

  const moodRecordsSync = useDataSync({
    table: 'mood_records',
    localStorageKey: 'mood_records',
    getLocalData: () => store.registrosHumor,
    setLocalData: (data) => store.setRegistrosHumor(data),
    ...SYNC_CONFIG
  });

  const sleepRecordsSync = useDataSync({
    table: 'sleep_records',
    localStorageKey: 'sleep_records',
    getLocalData: () => store.registrosSono,
    setLocalData: (data) => store.setRegistrosSono(data),
    ...SYNC_CONFIG
  });

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (typeof window === 'undefined') {
    return {
      user: null,
      loading: true,
      signIn: () => Promise.resolve(),
      signOut: () => Promise.resolve(),
      signUp: () => Promise.resolve(),
      signInWithGoogle: () => Promise.resolve(),
      signUpWithEmail: () => Promise.resolve({ data: null, error: null }),
      signInWithEmail: () => Promise.resolve({ data: null, error: null }),
      error: null
    };
  }

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
} 