import { useCallback, useEffect, useState, useRef } from 'react';
import { createClient } from '../lib/supabase';
import { useAuthContext } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

// Tipo genérico para itens sincronizáveis
interface SyncableItem {
  id: string;
  version: number;
  device_id?: string | null;
  last_synced_at?: string | null;
  [key: string]: any;
}

interface SyncOptions {
  table: string;
  localStorageKey: string;
  getLocalData: () => any[];
  setLocalData: (data: any[]) => void;
}

export function useBidirectionalSync<T extends SyncableItem>(options: SyncOptions) {
  const { table, localStorageKey, getLocalData, setLocalData } = options;
  const supabase = createClient();
  const { user } = useAuthContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [deviceId] = useState(() => localStorage.getItem('deviceId') || uuidv4());
  
  // Ref para controlar se o componente está montado
  const isMounted = useRef(true);
  // Ref para armazenar a subscription do canal
  const channelRef = useRef<any>(null);

  // Garantir que o deviceId seja persistido
  useEffect(() => {
    if (!localStorage.getItem('deviceId')) {
      localStorage.setItem('deviceId', deviceId);
    }
    
    // Limpeza quando o componente desmontar
    return () => {
      isMounted.current = false;
    };
  }, [deviceId]);

  // Função segura para atualizar state
  const safeSetState = useCallback((setter: Function, value: any) => {
    if (isMounted.current) {
      setter(value);
    }
  }, []);

  // Função para obter mudanças do servidor desde a última sincronização
  const getServerChanges = useCallback(async () => {
    if (!user) return [];

    try {
      const query = supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id);

      if (lastSyncTime) {
        query.gt('last_synced_at', lastSyncTime);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao obter mudanças do servidor:', error);
      return [];
    }
  }, [user, table, lastSyncTime, supabase]);

  // Função para resolver conflitos entre dados locais e do servidor
  const resolveConflicts = useCallback((localItems: T[], serverItems: T[]): T[] => {
    const mergedItems = new Map<string, T>();

    // Primeiro, adicionar todos os itens locais
    localItems.forEach(item => {
      mergedItems.set(item.id, item);
    });

    // Depois, resolver conflitos com itens do servidor
    serverItems.forEach(serverItem => {
      const localItem = mergedItems.get(serverItem.id);

      if (!localItem) {
        // Item novo do servidor
        mergedItems.set(serverItem.id, serverItem);
      } else if (serverItem.version > localItem.version) {
        // Versão do servidor é mais recente
        mergedItems.set(serverItem.id, serverItem);
      }
      // Se a versão local for maior, manter a versão local
    });

    return Array.from(mergedItems.values());
  }, []);

  // Função para sincronizar dados com o servidor
  const syncWithServer = useCallback(async () => {
    if (!user || isSyncing || !isMounted.current) return;

    try {
      safeSetState(setIsSyncing, true);

      // 1. Obter mudanças do servidor
      const serverChanges = await getServerChanges();
      
      // Verificar novamente se componente ainda está montado
      if (!isMounted.current) return;

      // 2. Obter dados locais
      const localData = getLocalData();

      // 3. Resolver conflitos
      const resolvedData = resolveConflicts(localData, serverChanges);

      // 4. Atualizar dados locais
      setLocalData(resolvedData);

      // 5. Enviar dados locais para o servidor
      const { error } = await supabase.from(table).upsert(
        resolvedData.map(item => ({
          ...item,
          user_id: user.id,
          device_id: deviceId,
          last_synced_at: new Date().toISOString()
        }))
      );

      if (error) throw error;

      // Verificar novamente se componente ainda está montado
      if (!isMounted.current) return;

      // 6. Atualizar timestamp da última sincronização
      const newSyncTime = new Date().toISOString();
      safeSetState(setLastSyncTime, newSyncTime);
      localStorage.setItem(`${localStorageKey}_lastSync`, newSyncTime);

    } catch (error) {
      console.error('Erro durante a sincronização:', error);
    } finally {
      if (isMounted.current) {
        safeSetState(setIsSyncing, false);
      }
    }
  }, [user, isSyncing, getServerChanges, getLocalData, setLocalData, resolveConflicts, table, deviceId, localStorageKey, supabase, safeSetState]);

  // Configurar sincronização automática
  useEffect(() => {
    if (!user) return;

    // Carregar último timestamp de sincronização
    const savedSyncTime = localStorage.getItem(`${localStorageKey}_lastSync`);
    if (savedSyncTime) {
      safeSetState(setLastSyncTime, savedSyncTime);
    }

    // Sincronizar imediatamente ao montar
    syncWithServer();

    // Configurar sincronização periódica
    const syncIntervalId = setInterval(() => {
      if (isMounted.current) {
        syncWithServer();
      }
    }, 30000); // 30 segundos

    // Configurar listener para mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === localStorageKey && isMounted.current) {
        syncWithServer();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Configurar Realtime subscription
    const channel = supabase
      .channel('db_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public',
          table: table,
          filter: `user_id=eq.${user.id}`
        },
        () => {
          if (isMounted.current) {
            syncWithServer();
          }
        }
      )
      .subscribe();
    
    // Armazenar referência ao canal
    channelRef.current = channel;

    // Cleanup
    return () => {
      clearInterval(syncIntervalId);
      window.removeEventListener('storage', handleStorageChange);
      
      // Garantir que a inscrição do canal seja cancelada
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      
      // Marcar componente como desmontado
      isMounted.current = false;
    };
  }, [user, localStorageKey, syncWithServer, supabase, table, safeSetState]);

  return {
    isSyncing,
    lastSyncTime,
    syncWithServer
  };
} 