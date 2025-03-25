/**
 * Sistema de logging para a aplicação StayFocus
 */

// Níveis de log
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  PERFORMANCE: 4
};

// Configuração atual
const config = {
  currentLevel: process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG,
  sendToServer: process.env.NODE_ENV === 'production',
  serverEndpoint: '/api/logs',
  maxQueueSize: 50,
  batchSendInterval: 60000, // 1 minuto
};

// Fila de logs para envio em batch
let logQueue = [];
let sendInterval = null;

// Formatar log para exibição/armazenamento
function formatLog(level, message, data = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId: localStorage.getItem('sessionId') || 'unknown'
  };
}

// Enviar logs para o servidor
async function sendLogsToServer() {
  if (!logQueue.length) return;
  
  const logsToSend = [...logQueue];
  logQueue = [];
  
  if (config.sendToServer) {
    try {
      await fetch(config.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs: logsToSend }),
        // Não queremos que falhas de log causem retries
        keepalive: true
      });
    } catch (error) {
      console.error('Falha ao enviar logs para o servidor:', error);
    }
  }
}

// Iniciar intervalo de envio
function startSendInterval() {
  if (!sendInterval) {
    sendInterval = setInterval(sendLogsToServer, config.batchSendInterval);
  }
}

// Adicionar log à fila
function queueLog(level, message, data) {
  const logEntry = formatLog(level, message, data);
  logQueue.push(logEntry);
  
  if (logQueue.length >= config.maxQueueSize) {
    sendLogsToServer();
  }
  
  startSendInterval();
  return logEntry;
}

// Funções exportadas
export function logDebug(message, data) {
  if (config.currentLevel <= LOG_LEVELS.DEBUG) {
    console.debug(`[DEBUG] ${message}`, data);
    return queueLog('debug', message, data);
  }
}

export function logInfo(message, data) {
  if (config.currentLevel <= LOG_LEVELS.INFO) {
    console.info(`[INFO] ${message}`, data);
    return queueLog('info', message, data);
  }
}

export function logWarning(message, data) {
  if (config.currentLevel <= LOG_LEVELS.WARN) {
    console.warn(`[WARN] ${message}`, data);
    return queueLog('warn', message, data);
  }
}

export function logError(message, data) {
  if (config.currentLevel <= LOG_LEVELS.ERROR) {
    console.error(`[ERROR] ${message}`, data);
    return queueLog('error', message, data);
  }
}

export function logPerformance(message, metrics) {
  if (config.currentLevel <= LOG_LEVELS.PERFORMANCE) {
    console.info(`[PERF] ${message}`, metrics);
    return queueLog('performance', message, metrics);
  }
}

// Configuração
export function configureLogger(options = {}) {
  Object.assign(config, options);
}

// Inicializar
startSendInterval();

// Limpar intervalo quando a página for fechada
window.addEventListener('beforeunload', () => {
  if (sendInterval) {
    clearInterval(sendInterval);
    sendLogsToServer();
  }
});

export default {
  logDebug,
  logInfo,
  logWarning,
  logError,
  logPerformance,
  configureLogger
};
