import fs from 'fs';
import path from 'path';

const LOG_DIR = process.env.LOG_DIR || './logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const COLORS = {
  error: '\x1b[31m',    // Red
  warn: '\x1b[33m',     // Yellow
  info: '\x1b[36m',     // Cyan
  debug: '\x1b[35m',    // Magenta
  reset: '\x1b[0m'
};

interface LogEntry {
  level: string;
  timestamp: string;
  message: string;
  [key: string]: any;
}

class Logger {
  private currentLevel: number;

  constructor() {
    this.currentLevel = LOG_LEVELS[LOG_LEVEL as keyof typeof LOG_LEVELS] || LOG_LEVELS.info;
  }

  private formatLog(level: string, data: any): LogEntry {
    return {
      level,
      timestamp: new Date().toISOString(),
      message: typeof data === 'string' ? data : JSON.stringify(data),
      ...typeof data === 'object' && data !== null ? data : {}
    };
  }

  private writeLog(level: string, data: any): void {
    const logEntry = this.formatLog(level, data);
    const logFile = path.join(LOG_DIR, `${level}.log`);
    const allLogsFile = path.join(LOG_DIR, 'all.log');

    // Console output with colors
    const color = COLORS[level as keyof typeof COLORS] || '';
    console.log(`${color}[${logEntry.timestamp}] ${level.toUpperCase()}:${COLORS.reset}`, logEntry);

    // File output
    try {
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
      fs.appendFileSync(allLogsFile, JSON.stringify(logEntry) + '\n');
    } catch (error) {
      console.error('Erreur lors de l\'écriture du log:', error);
    }
  }

  error(data: any): void {
    if (this.currentLevel >= LOG_LEVELS.error) {
      this.writeLog('error', data);
    }
  }

  warn(data: any): void {
    if (this.currentLevel >= LOG_LEVELS.warn) {
      this.writeLog('warn', data);
    }
  }

  info(data: any): void {
    if (this.currentLevel >= LOG_LEVELS.info) {
      this.writeLog('info', data);
    }
  }

  debug(data: any): void {
    if (this.currentLevel >= LOG_LEVELS.debug) {
      this.writeLog('debug', data);
    }
  }
}

export const logger = new Logger();
