import { useEffect, useState, useRef, useCallback } from 'react'
import { useStore } from '../stores/store'
import { createBrowserClient } from '@supabase/ssr'
import { BaseItem } from '../types/supabase'

interface SyncConfig<T extends BaseItem> {
  table: string
  localStorageKey: string
  getLocalData: () => T[]
  setLocalData: (data: T[]) => void
  enabled: boolean
  interval: number
}

interface PendingOperation {
  type: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
}

// Hook separado para gerenciar estado online/offline
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export function useDataSync<T extends BaseItem>(config: SyncConfig<T>) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const store = useStore()
  const isOnline = useOnlineStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)
  
  const isMounted = useRef(true)
  const subscriptionRef = useRef<any>(null)
  
  const safeSetState = useCallback(<S,>(setter: React.Dispatch<React.SetStateAction<S>>, value: React.SetStateAction<S>) => {
    if (isMounted.current) {
      setter(value)
    }
  }, [])

  // Função para sincronizar dados - movida para o início e memoizada com useCallback
  const synchronize = useCallback(async () => {
    if (!isOnline || isSyncing) return
    
    setIsSyncing(true)
    
    try {
      const pendingOps = JSON.parse(localStorage.getItem(`${config.localStorageKey}_pending`) || '[]')
      
      for (const op of pendingOps) {
        try {
          switch (op.type) {
            case 'create':
              await supabase.from(config.table).insert(op.data)
              break
            case 'update':
              await supabase.from(config.table).update(op.data).eq('id', op.data.id)
              break
            case 'delete':
              await supabase.from(config.table).delete().eq('id', op.data.id)
              break
          }
        } catch (error) {
          console.error(`Erro ao processar operação ${op.type}:`, error)
        }
      }
      
      const { data, error } = await supabase
        .from(config.table)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50)
        
      if (error) throw error
      
      if (isMounted.current) {
        config.setLocalData(data)
        localStorage.setItem(`${config.localStorageKey}_pending`, '[]')
        setLastSyncTime(Date.now())
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, config, supabase])

  // Carregar dados do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(config.localStorageKey)
    if (savedData) {
      config.setLocalData(JSON.parse(savedData))
    }
  }, [config.localStorageKey, config.setLocalData])
  
  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    const currentData = config.getLocalData()
    localStorage.setItem(config.localStorageKey, JSON.stringify(currentData))
  }, [config.getLocalData, config.localStorageKey])
  
  // Sincronização inicial
  useEffect(() => {
    if (config.enabled && !isSyncing) {
      synchronize()
    }
  }, [config.enabled, isSyncing, synchronize])

  // Sincronização periódica
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    
    if (config.enabled && config.interval > 0) {
      intervalId = setInterval(synchronize, config.interval)
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [config.enabled, config.interval, synchronize])
  
  // Setup e cleanup do componente
  useEffect(() => {
    isMounted.current = true
    
    const subscription = supabase
      .channel(config.table)
      .on('postgres_changes', { event: '*', schema: 'public', table: config.table }, () => {
        if (isMounted.current) {
          synchronize()
        }
      })
      .subscribe()
    
    subscriptionRef.current = subscription

    return () => {
      isMounted.current = false
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [supabase, config.table, synchronize])

  // Função para adicionar operação pendente
  const addPendingOperation = useCallback((type: 'create' | 'update' | 'delete', data: any) => {
    const pendingOps = JSON.parse(localStorage.getItem(`${config.localStorageKey}_pending`) || '[]')
    pendingOps.push({ type, data, timestamp: Date.now() })
    localStorage.setItem(`${config.localStorageKey}_pending`, JSON.stringify(pendingOps))
  }, [config.localStorageKey])

  return {
    syncStatus,
    isOnline,
    isSyncing,
    lastSyncTime,
    synchronize,
    addPendingOperation
  }
} 