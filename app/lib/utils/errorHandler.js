/**
 * Manipulador centralizado de erros para a aplicação StayFocus
 */

// Tipos de erros comuns
export const ErrorTypes = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  AUTH: 'AUTH_ERROR',
  SYNC: 'SYNC_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Classe para padronizar os erros da aplicação
export class AppError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Categoriza um erro e retorna informações úteis
 */
export function categorizeError(error) {
  // Erros de rede
  if (!navigator.onLine || error.name === 'NetworkError' || 
      error.message?.includes('network') || 
      error.message?.includes('Failed to fetch') ||
      error.code === 'ERR_NETWORK') {
    return {
      type: 'network',
      details: 'Problema de conexão com a internet',
      retryable: true
    };
  }

  // Erros de servidor
  if (error.status >= 500 || 
      error.message?.includes('server') || 
      error.message?.includes('timeout')) {
    return {
      type: 'server',
      details: 'Problema com o servidor',
      retryable: true
    };
  }

  // Erros de autenticação
  if (error.status === 401 || error.status === 403 || 
      error.message?.includes('unauthorized') || 
      error.message?.includes('forbidden')) {
    return {
      type: 'auth',
      details: 'Problema de autenticação',
      retryable: false
    };
  }

  // Erro desconhecido
  return {
    type: 'unknown',
    details: 'Erro desconhecido',
    retryable: false
  };
}

/**
 * Retorna uma mensagem amigável para o usuário com base no erro
 */
export function getUserFriendlyMessage(error, errorType) {
  if (!errorType) {
    const errorInfo = categorizeError(error);
    errorType = errorInfo.type;
  }

  switch (errorType) {
    case 'network':
      return 'Problemas na conexão de internet. Tentando reconectar automaticamente...';
    case 'server':
      return 'Nosso servidor está com problemas. Tente novamente em alguns instantes.';
    case 'auth':
      return 'Sua sessão expirou. Por favor, faça login novamente.';
    default:
      return error.message || 'Ocorreu um erro inesperado. Seus dados estão salvos localmente.';
  }
}

/**
 * Lida com erros de forma global
 */
export function handleError(error, context = {}) {
  const errorInfo = categorizeError(error);
  
  console.error(`[Erro: ${errorInfo.type}]`, error, context);
  
  return {
    ...errorInfo,
    originalError: error,
    context
  };
}
