import { useEffect, useState, useRef, useCallback } from 'react'
import { useStore } from '../stores/store'
import { useSupabase } from '../components/providers/supabase-provider'
import { BaseItem } from '../types/supabase'

interface SyncConfig<T extends BaseItem> {
  table: string
  localStorageKey: string
  getLocalData: () => T[]
  setLocalData: (data: T[]) => void
}

export function useDataSync<T extends BaseItem>(config: SyncConfig<T>) {
  const { supabase } = useSupabase()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const store = useStore()
  
  // Ref para controlar se o componente está montado
  const isMounted = useRef(true);
  
  // Ref para armazenar a subscription
  const subscriptionRef = useRef<any>(null);
  
  // Função segura para atualizar state
  const safeSetState = useCallback(<S,>(setter: React.Dispatch<React.SetStateAction<S>>, value: React.SetStateAction<S>) => {
    if (isMounted.current) {
      setter(value);
    }
  }, []);

  useEffect(() => {
    // Marcar componente como montado no início
    isMounted.current = true;
    
    const syncData = async () => {
      if (!isMounted.current) return;
      
      try {
        safeSetState(setSyncStatus, 'syncing' as React.SetStateAction<typeof syncStatus>);
        
        // Buscar dados do Supabase
        const { data: remoteData, error } = await supabase
          .from(config.table)
          .select('*')
          .order('updated_at', { ascending: false })

        if (error) throw error
        
        // Verificar se o componente ainda está montado
        if (!isMounted.current) return;

        // Atualizar dados locais
        config.setLocalData(remoteData)
        
        safeSetState(setSyncStatus, 'idle' as React.SetStateAction<typeof syncStatus>);
      } catch (error) {
        console.error('Erro na sincronização:', error)
        if (isMounted.current) {
          safeSetState(setSyncStatus, 'error' as React.SetStateAction<typeof syncStatus>);
        }
      }
    }

    // Sincronizar ao montar o componente
    syncData()

    // Configurar subscription para mudanças em tempo real
    const subscription = supabase
      .channel(config.table)
      .on('postgres_changes', { event: '*', schema: 'public', table: config.table }, () => {
        if (isMounted.current) {
          syncData()
        }
      })
      .subscribe()
    
    // Armazenar referência à subscription
    subscriptionRef.current = subscription;

    return () => {
      // Marcar componente como desmontado
      isMounted.current = false;
      
      // Cancelar subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    }
  }, [supabase, config, safeSetState])

  return { syncStatus }
} 