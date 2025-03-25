import { useState, useEffect, useCallback } from 'react';
import apiService from '../lib/services/api';

// Adicionar suporte para armazenamento local
const getLocalData = (endpoint) => {
  try {
    const data = localStorage.getItem(`offline_${endpoint}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn(`Erro ao ler dados offline para ${endpoint}:`, error);
    return null;
  }
};

const setLocalData = (endpoint, data) => {
  try {
    localStorage.setItem(`offline_${endpoint}`, JSON.stringify(data));
  } catch (error) {
    console.warn(`Erro ao salvar dados offline para ${endpoint}:`, error);
  }
};

const useFetch = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shouldRefresh, setShouldRefresh] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let methodName;
      
      // Mapear endpoints para métodos da API
      switch (endpoint) {
        case '/medications':
          methodName = 'getMedications';
          break;
        case '/mood_records':
          methodName = 'getMoodRecords';
          break;
        case '/sleep_records':
          methodName = 'getSleepRecords';
          break;
        case '/priorities':
          methodName = 'getPriorities';
          break;
        default:
          throw new Error(`Endpoint não suportado: ${endpoint}`);
      }
      
      if (!apiService[methodName]) {
        throw new Error(`Método não encontrado para endpoint: ${endpoint}`);
      }
      
      // Tentar buscar dados da API
      try {
        const result = await apiService[methodName]();
        
        // Se o resultado contiver um erro, verificamos dados offline
        if (result && result.error) {
          console.warn(`Aviso ao buscar ${endpoint}: ${result.message}`);
          const offlineData = getLocalData(endpoint);
          if (offlineData) {
            setData(offlineData);
            setIsOffline(true);
          } else {
            setData([]);
          }
        } else {
          setData(result);
          setLocalData(endpoint, result); // Salvar para uso offline
          setIsOffline(false);
        }
      } catch (apiError) {
        // Em caso de erro na API, tentar usar dados offline
        const offlineData = getLocalData(endpoint);
        if (offlineData) {
          setData(offlineData);
          setIsOffline(true);
        } else {
          setData([]);
        }
        throw apiError;
      }
      
    } catch (err) {
      console.error(`Erro ao buscar dados de ${endpoint}:`, err);
      setError(err.message || 'Ocorreu um erro ao buscar os dados');
      setData([]); // Sempre definir como array vazio em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]); // Removida dependência shouldRefresh pois não é usada dentro do callback

  // Função para forçar atualização
  const refresh = useCallback(() => {
    setShouldRefresh(prev => prev + 1);
    fetchData(); // Adicionado chamada direta ao fetchData
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, shouldRefresh]); // Adicionado shouldRefresh como dependência

  return { data, isLoading, error, refresh, isOffline };
};

export default useFetch;
