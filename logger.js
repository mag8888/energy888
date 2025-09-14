// Централизованный логгер
const config = require('./config');

class Logger {
  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    
    this.currentLevel = this.levels[config.logLevel] || this.levels.info;
  }

  shouldLog(level) {
    return this.levels[level] <= this.currentLevel && config.shouldLog;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  error(message, meta = {}) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }

  // Специальные методы для разных типов событий
  http(method, url, statusCode, duration) {
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    this[level](`${method} ${url} ${statusCode} ${duration}ms`, {
      type: 'http',
      method,
      url,
      statusCode,
      duration
    });
  }

  socket(event, clientId, data = {}) {
    this.debug(`Socket.IO ${event}`, {
      type: 'socket',
      event,
      clientId,
      data: typeof data === 'object' ? data : { value: data }
    });
  }

  webhook(type, data = {}) {
    this.info(`Webhook ${type}`, {
      type: 'webhook',
      webhookType: type,
      data: typeof data === 'object' ? data : { value: data }
    });
  }

  security(event, details = {}) {
    this.warn(`Security: ${event}`, {
      type: 'security',
      event,
      details
    });
  }

  performance(operation, duration, details = {}) {
    const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
    this[level](`Performance: ${operation} took ${duration}ms`, {
      type: 'performance',
      operation,
      duration,
      details
    });
  }
}

// Создаем единственный экземпляр логгера
const logger = new Logger();

module.exports = logger;
