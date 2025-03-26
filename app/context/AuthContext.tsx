'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth } from '@/app/hooks/useAuth';
import { useDataSync } from '@/app/hooks/useDataSync';
import { useStore } from '@/app/stores/store';
import { BaseItem } from '@/app/types/supabase';
import { supabase } from '@/app/lib/supabase';

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
  interval: 30000 // aumentado para 30 segundos para reduzir a frequência
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const store = useStore();

  // Configurar sincronização para cada tipo de dado
  const prioritiesSync = useDataSync({
    table: 'priorities',
    localStorageKey: 'priorities',
    getLocalData: () => store.prioridades,
    setLocalData: (data) => {
      if (JSON.stringify(data) !== JSON.stringify(store.prioridades)) {
        store.setPrioridades(data);
      }
    },
    ...SYNC_CONFIG
  });

  const medicationsSync = useDataSync({
    table: 'medications',
    localStorageKey: 'medications',
    getLocalData: () => store.medicamentos,
    setLocalData: (data) => {
      if (JSON.stringify(data) !== JSON.stringify(store.medicamentos)) {
        store.setMedicamentos(data);
      }
    },
    ...SYNC_CONFIG
  });

  const moodRecordsSync = useDataSync({
    table: 'mood_records',
    localStorageKey: 'mood_records',
    getLocalData: () => store.registrosHumor,
    setLocalData: (data) => {
      if (JSON.stringify(data) !== JSON.stringify(store.registrosHumor)) {
        store.setRegistrosHumor(data);
      }
    },
    ...SYNC_CONFIG
  });

  const sleepRecordsSync = useDataSync({
    table: 'sleep_records',
    localStorageKey: 'sleep_records',
    getLocalData: () => store.registrosSono,
    setLocalData: (data) => {
      if (JSON.stringify(data) !== JSON.stringify(store.registrosSono)) {
        store.setRegistrosSono(data);
      }
    },
    ...SYNC_CONFIG
  });

  // Remover a sincronização inicial duplicada
  useEffect(() => {
    if (auth.user && !auth.loading) {
      // Apenas verificar o status de sincronização em ambiente de teste
      if (process.env.NODE_ENV === 'test') {
        testSyncStatus().catch(console.error);
      }
    }
  }, [auth.user, auth.loading]);

  const testSyncStatus = async () => {
    if (process.env.NODE_ENV === 'test' && auth.user?.id) {
      try {
        await supabase.rpc('test_sync_status', { test_user_id: auth.user.id });
      } catch (error) {
        console.error('Erro no teste de sincronização:', error);
      }
    }
  };

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
      session: null,
      loading: true,
      error: null,
      signInWithEmail: () => Promise.resolve({ data: null, error: null }),
      signUpWithEmail: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ success: false, error: null }),
      signInWithGoogle: () => Promise.resolve({ data: null, error: null })
    };
  }

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
} 