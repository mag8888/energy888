// Централизованная конфигурация приложения
const crypto = require('crypto');

class Config {
  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    // Основные настройки
    this.port = process.env.PORT || 3000;
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.isProduction = this.nodeEnv === 'production';
    
    // Telegram Bot
    this.botToken = process.env.BOT_TOKEN;
    this.webhookUrl = process.env.WEBHOOK_URL || `https://money8888-production.up.railway.app/webhook`;
    this.webhookSecret = process.env.WEBHOOK_SECRET || crypto.randomBytes(32).toString('hex');
    
    // Игра
    this.gameUrl = process.env.GAME_URL || 'https://money8888-production.up.railway.app/';
    
    // Socket.IO
    this.socketMaxClients = parseInt(process.env.SOCKET_MAX_CLIENTS) || 1000;
    this.socketPingTimeout = parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000;
    this.socketPingInterval = parseInt(process.env.SOCKET_PING_INTERVAL) || 25000;
    
    // Rate Limiting
    this.rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000; // 1 минута
    this.rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
    
    // Логирование
    this.logLevel = process.env.LOG_LEVEL || (this.isProduction ? 'warn' : 'debug');
    this.enableConsoleLog = process.env.ENABLE_CONSOLE_LOG !== 'false';
    
    // Безопасность
    this.enableCors = process.env.ENABLE_CORS !== 'false';
    this.corsOrigin = process.env.CORS_ORIGIN || '*';
    
    // Валидация
    this.validateConfig();
  }

  validateConfig() {
    const errors = [];
    
    if (!this.botToken) {
      errors.push('BOT_TOKEN is required');
    }
    
    if (this.port < 1 || this.port > 65535) {
      errors.push('PORT must be between 1 and 65535');
    }
    
    if (this.socketMaxClients < 1) {
      errors.push('SOCKET_MAX_CLIENTS must be greater than 0');
    }
    
    if (this.rateLimitMaxRequests < 1) {
      errors.push('RATE_LIMIT_MAX_REQUESTS must be greater than 0');
    }
    
    if (errors.length > 0) {
      console.error('❌ Ошибки конфигурации:');
      errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }
  }

  // Геттеры для удобства
  get isDevelopment() {
    return !this.isProduction;
  }

  get isTest() {
    return this.nodeEnv === 'test';
  }

  get shouldLog() {
    return this.enableConsoleLog && this.logLevel !== 'silent';
  }

  // Метод для получения всех настроек (без секретов)
  getPublicConfig() {
    return {
      port: this.port,
      nodeEnv: this.nodeEnv,
      isProduction: this.isProduction,
      gameUrl: this.gameUrl,
      socketMaxClients: this.socketMaxClients,
      rateLimitWindowMs: this.rateLimitWindowMs,
      rateLimitMaxRequests: this.rateLimitMaxRequests,
      logLevel: this.logLevel,
      enableCors: this.enableCors,
      corsOrigin: this.corsOrigin
    };
  }
}

// Создаем единственный экземпляр конфигурации
const config = new Config();

module.exports = config;
