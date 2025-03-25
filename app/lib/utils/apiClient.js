import axios from 'axios';
import { handleError, ErrorTypes, AppError } from './errorHandler';
import { logApiCall } from './logger';

// Configuração do cliente Axios
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.stayfocus.app',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Função para esperar antes de tentar novamente
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Configuração de retry
const retryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000, // 1 segundo
  maxDelayMs: 10000,    // 10 segundos
  shouldRetry: (error) => {
    // Retornar true apenas para erros de rede ou 5xx
    const errorType = error.type || (error.isAxiosError ? 
      identifyErrorType(error) : ErrorTypes.UNKNOWN);
    
    return errorType === ErrorTypes.NETWORK || 
           (error.response && error.response.status >= 500);
  }
};

// Função com lógica de retry
export async function fetchWithRetry(requestFn, retryOptions = {}) {
  const options = { ...retryConfig, ...retryOptions };
  let lastError = null;
  let retryCount = 0;
  
  const startTime = Date.now();
  
  while (retryCount <= options.maxRetries) {
    try {
      const response = await requestFn();
      
      // Log de sucesso após retries
      if (retryCount > 0) {
        logApiCall({
          url: requestFn.url || 'unknown',
          success: true,
          retryCount,
          duration: Date.now() - startTime
        });
      }
      
      return response;
    } catch (error) {
      lastError = handleError(error);
      
      if (retryCount >= options.maxRetries || !options.shouldRetry(lastError)) {
        break;
      }
      
      // Exponential backoff com jitter
      const delayMs = Math.min(
        options.initialDelayMs * Math.pow(2, retryCount) * (0.9 + Math.random() * 0.2),
        options.maxDelayMs
      );
      
      console.warn(`Tentativa #${retryCount + 1} falhou. Tentando novamente em ${delayMs}ms`);
      await delay(delayMs);
      retryCount++;
    }
  }
  
  // Log de falha final
  logApiCall({
    url: requestFn.url || 'unknown',
    success: false,
    retryCount,
    duration: Date.now() - startTime,
    error: lastError
  });
  
  throw lastError;
}

// API wrapper methods com retry integrado
export default {
  async get(url, config = {}) {
    return fetchWithRetry(() => apiClient.get(url, config));
  },
  
  async post(url, data, config = {}) {
    return fetchWithRetry(() => apiClient.post(url, data, config));
  },
  
  async put(url, data, config = {}) {
    return fetchWithRetry(() => apiClient.put(url, data, config));
  },
  
  async delete(url, config = {}) {
    return fetchWithRetry(() => apiClient.delete(url, config));
  }
};
