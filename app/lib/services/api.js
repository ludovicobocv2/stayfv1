import axios from 'axios';
import { supabase } from '../lib/supabase';

// Cache simplificado
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em desenvolvimento
const cache = new Map();

// Função simplificada para fazer requisições
const fetchData = async (endpoint) => {
  const cacheKey = endpoint;
  
  // Verificar cache primeiro
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const { data, error } = await supabase
      .from(endpoint.slice(1))
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20);
      
    if (error) throw error;
    
    // Armazenar no cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    return [];
  }
};

// Métodos simplificados da API
const apiService = {
  // Medications
  getMedications: () => fetchData('/medications'),
  createMedication: async (data) => {
    const { data: result } = await supabase.from('medications').insert(data);
    cache.delete('/medications');
    return result;
  },
  updateMedication: async (id, data) => {
    const { data: result } = await supabase.from('medications').update(data).eq('id', id);
    cache.delete('/medications');
    return result;
  },
  
  // Mood records
  getMoodRecords: () => fetchData('/mood_records'),
  createMoodRecord: async (data) => {
    const { data: result } = await supabase.from('mood_records').insert(data);
    cache.delete('/mood_records');
    return result;
  },
  
  // Sleep records
  getSleepRecords: () => fetchData('/sleep_records'),
  createSleepRecord: async (data) => {
    const { data: result } = await supabase.from('sleep_records').insert(data);
    cache.delete('/sleep_records');
    return result;
  },
  
  // Priorities
  getPriorities: () => fetchData('/priorities'),
  createPriority: async (data) => {
    const { data: result } = await supabase.from('priorities').insert(data);
    cache.delete('/priorities');
    return result;
  },
  updatePriority: async (id, data) => {
    const { data: result } = await supabase.from('priorities').update(data).eq('id', id);
    cache.delete('/priorities');
    return result;
  },
  
  // Limpar cache
  clearCache: () => {
    cache.clear();
    console.log('Cache limpo com sucesso');
  }
};

export default apiService;
