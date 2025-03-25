import axios from 'axios';

// Cache para armazenar respostas recentes
const cache = new Map();
const CACHE_DURATION = 300000; // Aumentado para 5 minutos

// Configuração do cliente axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.exemplo.com',
  timeout: 10000,
});

// Fila de requisições para implementar rate limiting
const requestQueue = [];
let isProcessingQueue = false;
const MAX_CONCURRENT_REQUESTS = 2; // Reduzido para 2 requisições simultâneas
const RETRY_DELAY = 2000; // Aumentado para 2 segundos
const MAX_RETRIES = 5; // Aumentado para 5 tentativas

// Processador da fila de requisições
const processQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  const batch = requestQueue.splice(0, MAX_CONCURRENT_REQUESTS);
  await Promise.allSettled(batch.map(req => req.execute()));
  
  isProcessingQueue = false;
  if (requestQueue.length > 0) {
    setTimeout(processQueue, 300); // Intervalo entre lotes de requisições
  }
};

// Função para fazer requisições com cache, limitação de taxa e retentativas
const fetchWithRetry = async (endpoint, options = {}, retryCount = 0) => {
  const cacheKey = `${options.method || 'GET'}_${endpoint}_${JSON.stringify(options.data || {})}`;
  
  // Verificar se existe no cache e se ainda é válido
  const cachedResponse = cache.get(cacheKey);
  if (cachedResponse && cachedResponse.timestamp > Date.now() - CACHE_DURATION) {
    console.log(`Usando resposta em cache para: ${endpoint}`);
    return cachedResponse.data;
  }
  
  try {
    const response = await api(endpoint, options);
    
    // Armazenar resposta no cache
    cache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  } catch (error) {
    // Verificar se devemos tentar novamente
    if (retryCount < MAX_RETRIES) {
      console.log(`Tentativa ${retryCount + 1} falhou para ${endpoint}. Tentando novamente...`);
      
      // Atraso exponencial entre tentativas
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return fetchWithRetry(endpoint, options, retryCount + 1);
    }
    
    // Se for um erro 404, podemos retornar um objeto vazio em vez de falhar
    if (error.response && error.response.status === 404) {
      console.warn(`Recurso não encontrado (404): ${endpoint}. Retornando objeto vazio.`);
      return { error: 'not_found', message: 'Recurso não encontrado' };
    }
    
    // Para o erro de recursos insuficientes, também retornamos dados vazios
    if (error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
      console.warn(`Recursos insuficientes para: ${endpoint}. Retornando objeto vazio.`);
      return { error: 'insufficient_resources', message: 'Navegador sem recursos disponíveis' };
    }
    
    throw error;
  }
};

// Função para adicionar requisição à fila
const queueRequest = (endpoint, options = {}) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      execute: async () => {
        try {
          const result = await fetchWithRetry(endpoint, options);
          resolve(result);
        } catch (error) {
          console.error(`Erro na sincronização: ${error.message || 'Erro desconhecido'}`);
          reject(error);
        }
      }
    });
    
    // Iniciar processamento da fila se ainda não estiver em andamento
    if (!isProcessingQueue) {
      processQueue();
    }
  });
};

// Métodos da API
const apiService = {
  // Medications
  getMedications: () => queueRequest('/medications'),
  createMedication: (data) => queueRequest('/medications', { method: 'POST', data }),
  updateMedication: (id, data) => queueRequest(`/medications/${id}`, { method: 'PUT', data }),
  
  // Mood records
  getMoodRecords: () => queueRequest('/mood_records'),
  createMoodRecord: (data) => queueRequest('/mood_records', { method: 'POST', data }),
  
  // Sleep records
  getSleepRecords: () => queueRequest('/sleep_records'),
  createSleepRecord: (data) => queueRequest('/sleep_records', { method: 'POST', data }),
  
  // Priorities
  getPriorities: () => queueRequest('/priorities'),
  createPriority: (data) => queueRequest('/priorities', { method: 'POST', data }),
  updatePriority: (id, data) => queueRequest(`/priorities/${id}`, { method: 'PUT', data }),
  
  // Limpar cache
  clearCache: () => {
    cache.clear();
    console.log('Cache limpo com sucesso');
  }
};

export default apiService;
