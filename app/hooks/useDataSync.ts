import { useEffect, useState, useRef, useCallback } from 'react'
import { useStore } from '../stores/store'
import { createBrowserClient } from '@supabase/ssr'
import { BaseItem } from '../types/supabase'

interface SyncConfig<T extends BaseItem> {
  table: string
  localStorageKey: string
  getLocalData: () => T[]
  setLocalData: (data: T[]) => void
}

interface PendingOperation {
  type: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
}

export function useDataSync<T extends BaseItem>(config: SyncConfig<T>) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const store = useStore()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)
  
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

  // Gerenciar estado online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Carregar dados do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(config.localStorageKey);
    if (savedData) {
      config.setLocalData(JSON.parse(savedData));
    }
  }, [config.localStorageKey]);
  
  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    const currentData = config.getLocalData();
    localStorage.setItem(config.localStorageKey, JSON.stringify(currentData));
  }, [config.getLocalData()]);
  
  // Sincronizar quando voltar online
  useEffect(() => {
    if (isOnline && !isSyncing) {
      synchronize();
    }
  }, [isOnline]);
  
  useEffect(() => {
    // Marcar componente como montado no início
    isMounted.current = true;
    
    const syncData = async () => {
      if (!isMounted.current) return;
      
      try {
        safeSetState(setSyncStatus, 'syncing' as React.SetStateAction<typeof syncStatus>);
        
        // Buscar operações pendentes
        const pendingOps = JSON.parse(localStorage.getItem(`${config.localStorageKey}_pending`) || '[]');
        
        // Processar operações pendentes
        for (const op of pendingOps) {
          try {
            switch (op.type) {
              case 'create':
                await supabase.from(config.table).insert(op.data);
                break;
              case 'update':
                await supabase.from(config.table).update(op.data).eq('id', op.data.id);
                break;
              case 'delete':
                await supabase.from(config.table).delete().eq('id', op.data.id);
                break;
            }
          } catch (error) {
            console.error(`Erro ao processar operação ${op.type}:`, error);
          }
        }
        
        // Buscar dados atualizados do servidor
        const { data, error } = await supabase
          .from(config.table)
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        // Verificar se o componente ainda está montado
        if (!isMounted.current) return;

        // Atualizar dados locais
        config.setLocalData(data);
        
        // Limpar operações pendentes
        localStorage.setItem(`${config.localStorageKey}_pending`, '[]');
        
        setLastSyncTime(Date.now());
        
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

  // Função para sincronizar dados
  const synchronize = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      // Buscar operações pendentes
      const pendingOps = JSON.parse(localStorage.getItem(`${config.localStorageKey}_pending`) || '[]');
      
      // Processar operações pendentes
      for (const op of pendingOps) {
        try {
          switch (op.type) {
            case 'create':
              await supabase.from(config.table).insert(op.data);
              break;
            case 'update':
              await supabase.from(config.table).update(op.data).eq('id', op.data.id);
              break;
            case 'delete':
              await supabase.from(config.table).delete().eq('id', op.data.id);
              break;
          }
        } catch (error) {
          console.error(`Erro ao processar operação ${op.type}:`, error);
        }
      }
      
      // Buscar dados atualizados do servidor
      const { data, error } = await supabase
        .from(config.table)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      // Atualizar dados locais
      config.setLocalData(data);
      
      // Limpar operações pendentes
      localStorage.setItem(`${config.localStorageKey}_pending`, '[]');
      
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Função para adicionar operação pendente
  const addPendingOperation = (type: 'create' | 'update' | 'delete', data: any) => {
    const pendingOps = JSON.parse(localStorage.getItem(`${config.localStorageKey}_pending`) || '[]');
    pendingOps.push({ type, data, timestamp: Date.now() });
    localStorage.setItem(`${config.localStorageKey}_pending`, JSON.stringify(pendingOps));
  };

  return {
    syncStatus,
    isOnline,
    isSyncing,
    lastSyncTime,
    synchronize,
    addPendingOperation
  }
} 