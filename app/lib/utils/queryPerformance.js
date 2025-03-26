import { info, warn } from './logger';

/**
 * Utilitário para monitorar a performance das queries
 */

// Limites para avisar sobre queries lentas (em ms)
const PERFORMANCE_THRESHOLDS = {
  DB_QUERY: 100,     // Query de banco de dados local
  API_REQUEST: 500,  // Requisição para a API
  RENDER: 50,        // Tempo de renderização de componente
};

// Armazena métricas de performance
const performanceMetrics = {
  queries: {},
  apiCalls: {},
  renders: {}
};

// Monitor de performance para queries de DB
export function monitorDBQuery(queryName, queryFn) {
  return async (...args) => {
    const startTime = performance.now();
    try {
      const result = await queryFn(...args);
      const duration = performance.now() - startTime;
      
      // Registrar a métrica
      trackPerformance('DB_QUERY', queryName, duration, args);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Registrar erro de query
      trackPerformance('DB_QUERY', queryName, duration, args, error);
      
      throw error;
    }
  };
}

// Monitor de performance para chamadas de API
export function monitorAPICall(apiCallName, apiFn) {
  return async (...args) => {
    const startTime = performance.now();
    try {
      const result = await apiFn(...args);
      const duration = performance.now() - startTime;
      
      // Registrar a métrica
      trackPerformance('API_REQUEST', apiCallName, duration, args);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Registrar erro de API
      trackPerformance('API_REQUEST', apiCallName, duration, args, error);
      
      throw error;
    }
  };
}

// HOC para monitorar performance de componentes React
export function withPerformanceTracking(Component, componentName) {
  return function WrappedComponent(props) {
    const startTime = performance.now();
    
    // Usar um ref para capturar o tempo após a renderização
    const ref = React.useRef(null);
    
    React.useEffect(() => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) {
        console.warn(`Query performance warning: ${componentName} took ${duration}ms`);
      }
      
      return () => {
        // Cleanup if needed
      };
    }, [startTime]);
    
    return <Component ref={ref} {...props} />;
  };
}

// Registrar métricas de performance
function trackPerformance(type, name, duration, args = [], error = null) {
  // Preparar metadados para logging
  const metadata = {
    duration,
    timestamp: new Date().toISOString(),
    args: safeStringify(args)
  };
  
  // Adicionar à coleção de métricas
  if (!performanceMetrics[type]) {
    performanceMetrics[type] = {};
  }
  
  if (!performanceMetrics[type][name]) {
    performanceMetrics[type][name] = {
      count: 0,
      totalDuration: 0,
      min: Infinity,
      max: 0,
      avg: 0,
      recentItems: []
    };
  }
  
  const metrics = performanceMetrics[type][name];
  metrics.count++;
  metrics.totalDuration += duration;
  metrics.min = Math.min(metrics.min, duration);
  metrics.max = Math.max(metrics.max, duration);
  metrics.avg = metrics.totalDuration / metrics.count;
  
  // Manter um histórico das execuções mais recentes
  metrics.recentItems.push(metadata);
  if (metrics.recentItems.length > 10) {
    metrics.recentItems.shift();
  }
  
  // Verificar o limite de performance
  const threshold = PERFORMANCE_THRESHOLDS[type];
  
  if (threshold && duration > threshold) {
    warn(`Performance lenta: ${type} "${name}" levou ${duration.toFixed(2)}ms (limite: ${threshold}ms)`, {
      type,
      name,
      duration,
      threshold,
      args: safeStringify(args)
    });
  }
  
  // Se houver erro, registrá-lo também
  if (error) {
    warn(`Erro em ${type} "${name}" após ${duration.toFixed(2)}ms`, {
      type,
      name,
      duration,
      error: error.message,
      stack: error.stack
    });
  }
  
  return metadata;
}

// Obter relatório de performance
export function getPerformanceReport() {
  return performanceMetrics;
}

// Limpar métricas de performance
export function clearPerformanceMetrics() {
  Object.keys(performanceMetrics).forEach(key => {
    performanceMetrics[key] = {};
  });
}

// Função para serializar args com segurança
function safeStringify(obj) {
  try {
    // Limitar a profundidade e tamanho
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        // Evitar objetos muito grandes/profundos
        return Object.keys(value).length > 10 ? 
          `[Objeto com ${Object.keys(value).length} propriedades]` : value;
      }
      return value;
    }).substring(0, 500);
  } catch (e) {
    return "[Não serializável]";
  }
}
