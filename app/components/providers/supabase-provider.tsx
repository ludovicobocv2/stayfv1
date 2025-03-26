import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/app/lib/supabase'
import { Database } from '@/app/types/supabase'

interface SupabaseContextType {
  supabase: SupabaseClient<Database>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())
  
  // Ref para armazenar a subscription
  const authSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    // Verificar e limpar subscription anterior se existir
    if (authSubscriptionRef.current) {
      authSubscriptionRef.current.unsubscribe();
    }
    
    // Criar nova subscription e armazenar referência
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Delete all data from local storage
        for (const key in localStorage) {
          if (key.startsWith('app-storage')) {
            localStorage.removeItem(key)
          }
        }
      }
    })
    
    // Armazenar referência para limpeza posterior
    authSubscriptionRef.current = subscription;

    return () => {
      // Garantir que a subscription seja cancelada na desmontagem
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
        authSubscriptionRef.current = null;
      }
    }
  }, [supabase])

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
} 