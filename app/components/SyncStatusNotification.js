import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { getUserFriendlyMessage, categorizeError } from '../lib/utils/errorHandler';
import { logError, logPerformance } from '../lib/utils/logger';

// Contexto para gerenciar o estado de sincronização global
export const SyncContext = React.createContext({
  syncStatus: 'idle', // 'idle', 'syncing', 'error', 'success', 'retrying'
  syncError: null,
  errorType: null, // 'network', 'server', 'auth', 'unknown'
  pendingSyncCount: 0,
  retryCount: 0,
  retryAttempts: 0,
  maxRetries: 5,
  lastErrorTime: null,
  queryPerformance: {},
  setSyncStatus: () => {},
  setSyncError: () => {},
  setPendingSyncCount: () => {},
  retrySync: () => {},
  resetRetry: () => {},
  logQueryPerformance: () => {}
});

export const SyncProvider = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [syncError, setSyncError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [maxRetries] = useState(5);
  const [lastErrorTime, setLastErrorTime] = useState(null);
  const [queryPerformance, setQueryPerformance] = useState({});

  // Função para manipular erros com mais detalhes
  const handleSyncError = (error) => {
    const errorInfo = categorizeError(error);
    setSyncError(error);
    setErrorType(errorInfo.type);
    setSyncStatus('error');
    setLastErrorTime(new Date());
    logError('Sync Error', { error, type: errorInfo.type, details: errorInfo.details });
    
    // Iniciar retentativas automáticas apenas para erros de rede
    if (errorInfo.type === 'network' && retryAttempts < maxRetries) {
      scheduleRetry();
    }
  };

  // Função para retentativa com backoff exponencial
  const scheduleRetry = () => {
    setRetryAttempts(prev => prev + 1);
    setSyncStatus('retrying');
    
    // Cálculo do tempo de backoff exponencial (1s, 2s, 4s, 8s, 16s)
    const backoffTime = Math.min(1000 * Math.pow(2, retryAttempts), 30000);
    
    logError('Scheduling retry', {
      attempt: retryAttempts + 1, 
      maxRetries, 
      backoffTime
    });
    
    const timerId = setTimeout(() => {
      setRetryCount(prev => prev + 1);
      // Dispara evento para retry
      window.dispatchEvent(new CustomEvent('sync:retry'));
    }, backoffTime);
    
    return () => clearTimeout(timerId);
  };

  // Reset das tentativas de retry
  const resetRetry = () => {
    setRetryAttempts(0);
  };

  // Registrar dados de performance das queries
  const logQueryPerformance = (queryName, duration, success, dataSize) => {
    const perfData = {
      timestamp: new Date(),
      duration,
      success,
      dataSize
    };
    
    setQueryPerformance(prev => ({
      ...prev,
      [queryName]: [...(prev[queryName] || []), perfData]
    }));
    
    logPerformance('Query Performance', {
      query: queryName,
      duration,
      success,
      dataSize
    });
  };

  return (
    <SyncContext.Provider value={{
      syncStatus, 
      syncError, 
      errorType,
      pendingSyncCount,
      retryCount,
      retryAttempts,
      maxRetries,
      lastErrorTime,
      queryPerformance,
      setSyncStatus,
      setSyncError: handleSyncError,
      setPendingSyncCount,
      retrySync: scheduleRetry,
      resetRetry,
      logQueryPerformance
    }}>
      {children}
      <SyncStatusNotification />
    </SyncContext.Provider>
  );
};

// Hook para usar o contexto de sincronização
export const useSyncStatus = () => useContext(SyncContext);

// Componente de notificação
const SyncStatusNotification = () => {
  const { 
    syncStatus, 
    syncError, 
    errorType, 
    pendingSyncCount,
    retryAttempts,
    maxRetries
  } = useSyncStatus();
  const [visible, setVisible] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  
  useEffect(() => {
    // Verificar status de conexão
    const checkConnection = () => {
      setIsOffline(!navigator.onLine);
    };
    
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    checkConnection();
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);
  
  useEffect(() => {
    if (syncStatus === 'idle' && !isOffline) {
      setVisible(false);
      return;
    }
    
    setVisible(true);
    
    // Esconder automaticamente após sucesso
    if (syncStatus === 'success' && !isOffline) {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus, isOffline]);

  if (!visible) return null;

  // Estilos e conteúdo baseados no status
  let icon, message, backgroundColor;
  
  if (isOffline) {
    icon = '📱';
    message = 'Modo offline - Seus dados estão salvos localmente';
    backgroundColor = '#f39c12';
  } else {
    switch (syncStatus) {
      case 'syncing':
        icon = '🔄';
        message = 'Sincronizando dados...';
        backgroundColor = '#3498db';
        break;
      case 'retrying':
        icon = '🔄';
        message = `Reconectando (${retryAttempts}/${maxRetries})...`;
        backgroundColor = '#f39c12';
        break;
      case 'error':
        icon = '❌';
        message = syncError ? getUserFriendlyMessage(syncError, errorType) : 
                  'Erro ao sincronizar. Seus dados estão salvos localmente.';
        backgroundColor = '#e74c3c';
        break;
      case 'success':
        icon = '✅';
        message = 'Sincronização concluída com sucesso!';
        backgroundColor = '#2ecc71';
        break;
      default:
        return null;
    }
  }

  // Adicionar badge para itens pendentes
  const pendingBadge = pendingSyncCount > 0 ? (
    <span className="pending-badge" style={{
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: '#e74c3c',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '12px',
      fontWeight: 'bold'
    }}>{pendingSyncCount}</span>
  ) : null;

  return createPortal(
    <div 
      className="sync-notification"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 16px',
        borderRadius: '4px',
        backgroundColor,
        color: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 9999,
        maxWidth: '300px',
        position: 'relative'
      }}
    >
      <div className="icon" style={{ marginRight: '10px' }}>{icon}</div>
      <div className="message">{message}</div>
      {pendingBadge}
      {(syncStatus === 'error' && errorType !== 'network') && (
        <button 
          className="retry-button"
          style={{
            marginLeft: '10px',
            background: 'transparent',
            border: '1px solid white',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
          onClick={() => {
            // Trigger retry logic
            window.dispatchEvent(new CustomEvent('sync:retry'));
          }}
        >
          Tentar novamente
        </button>
      )}
      {(syncStatus === 'retrying') && (
        <div className="retry-progress" style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          height: '3px',
          backgroundColor: 'rgba(255,255,255,0.5)',
          width: `${(retryAttempts / maxRetries) * 100}%`
        }}></div>
      )}
    </div>,
    document.body
  );
};

export default SyncStatusNotification;
