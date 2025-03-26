import { useEffect, useState, useRef, useCallback } from 'react'
import { useStore } from '../stores/store'
import { createClient } from '../lib/supabase'
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
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    if (typeof window === 'undefined') return

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
  const supabase = createClient()
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const store = useStore()
  const isOnline = useOnlineStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)
  const lastDataRef = useRef<string>('')
  
  const isMounted = useRef(true)
  const subscriptionRef = useRef<any>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const safeSetState = useCallback(<S,>(setter: React.Dispatch<React.SetStateAction<S>>, value: React.SetStateAction<S>) => {
    if (isMounted.current) {
      setter(value)
    }
  }, [])

  // Função para sincronizar dados - movida para o início e memoizada com useCallback
  const synchronize = useCallback(async () => {
    if (!isOnline || isSyncing || !isMounted.current) return
    
    setIsSyncing(true)
    setSyncStatus('syncing')
    
    try {
      const pendingOps = JSON.parse(localStorage.getItem(`${config.localStorageKey}_pending`) || '[]')
      
      for (const op of pendingOps) {
        if (!isMounted.current) break
        
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
      
      if (!isMounted.current) return
      
      const { data, error } = await supabase
        .from(config.table)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50)
        
      if (error) throw error
      
      if (isMounted.current) {
        const dataString = JSON.stringify(data)
        if (dataString !== lastDataRef.current) {
          config.setLocalData(data)
          lastDataRef.current = dataString
          localStorage.setItem(`${config.localStorageKey}_pending`, '[]')
          setLastSyncTime(Date.now())
        }
        setSyncStatus('idle')
      }
    } catch (error) {
      console.error('Erro na sincronização:', error)
      if (isMounted.current) {
        setSyncStatus('error')
      }
    } finally {
      if (isMounted.current) {
        setIsSyncing(false)
      }
    }
  }, [isOnline, isSyncing, config, supabase])

  // Carregar dados do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(config.localStorageKey)
    if (savedData && isMounted.current) {
      const parsedData = JSON.parse(savedData)
      const dataString = JSON.stringify(parsedData)
      if (dataString !== lastDataRef.current) {
        config.setLocalData(parsedData)
        lastDataRef.current = dataString
      }
    }
<<<<<<< HEAD
  }, [config.localStorageKey])
=======
  }, [config])
>>>>>>> 5c787c3bf99b4cd6964a3f3607ec7b06944cb0a4
  
  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    const currentData = config.getLocalData()
<<<<<<< HEAD
    const dataString = JSON.stringify(currentData)
    if (dataString !== lastDataRef.current) {
      localStorage.setItem(config.localStorageKey, dataString)
      lastDataRef.current = dataString
    }
  }, [config.getLocalData, config.localStorageKey])
=======
    localStorage.setItem(config.localStorageKey, JSON.stringify(currentData))
  }, [config])
  // Sincronização inicial
  useEffect(() => {
    if (config.enabled && !isSyncing && isOnline) {
      synchronize()
    }
<<<<<<< HEAD
  }, [config.enabled, isSyncing, isOnline, synchronize])
=======
  }, [config, isSyncing, synchronize])
>>>>>>> 5c787c3bf99b4cd6964a3f3607ec7b06944cb0a4

  // Sincronização periódica
  useEffect(() => {
    if (config.enabled && config.interval > 0 && isOnline) {
      syncTimeoutRef.current = setTimeout(synchronize, config.interval)
    }
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [config.enabled, config.interval, isOnline, synchronize, lastSyncTime])
  
  // Setup e cleanup do componente
  useEffect(() => {
    isMounted.current = true
    
    if (typeof window === 'undefined') return
    
    const subscription = supabase
      .channel(config.table)
      .on('postgres_changes', { event: '*', schema: 'public', table: config.table }, () => {
        if (isMounted.current && !isSyncing) {
          synchronize()
        }
      })
      .subscribe()
    
    subscriptionRef.current = subscription

    return () => {
      isMounted.current = false
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [supabase, config.table, synchronize, isSyncing])

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