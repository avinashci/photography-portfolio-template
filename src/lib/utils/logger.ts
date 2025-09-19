/**
 * Production-ready logging utility
 * Handles different log levels and outputs based on environment
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogEntry {
  level: LogLevel
  message: string
  metadata?: Record<string, any>
  timestamp: string
  service: string
}

class Logger {
  private readonly service: string
  private readonly isDevelopment: boolean

  constructor(service: string = 'app') {
    this.service = service
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  private formatLogEntry(level: LogLevel, message: string, metadata?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      metadata,
      timestamp: new Date().toISOString(),
      service: this.service
    }
  }

  private output(entry: LogEntry): void {
    if (this.isDevelopment) {
      // Pretty print for development
      const color = this.getColorForLevel(entry.level)
      console[entry.level](
        `${color}[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.service}]:\x1b[0m ${entry.message}`,
        entry.metadata ? entry.metadata : ''
      )
    } else {
      // JSON format for production (easier for log aggregators)
      console.log(JSON.stringify(entry))
    }
  }

  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR: return '\x1b[31m' // Red
      case LogLevel.WARN: return '\x1b[33m'  // Yellow
      case LogLevel.INFO: return '\x1b[36m'  // Cyan
      case LogLevel.DEBUG: return '\x1b[90m' // Gray
      default: return '\x1b[0m'              // Reset
    }
  }

  error(message: string, metadata?: Record<string, any>): void {
    const entry = this.formatLogEntry(LogLevel.ERROR, message, metadata)
    this.output(entry)

    // In production, you might want to send to external service
    if (!this.isDevelopment && process.env.SENTRY_DSN) {
      // Send to Sentry or other error tracking service
    }
  }

  warn(message: string, metadata?: Record<string, any>): void {
    const entry = this.formatLogEntry(LogLevel.WARN, message, metadata)
    this.output(entry)
  }

  info(message: string, metadata?: Record<string, any>): void {
    const entry = this.formatLogEntry(LogLevel.INFO, message, metadata)
    this.output(entry)
  }

  debug(message: string, metadata?: Record<string, any>): void {
    // Only log debug in development
    if (this.isDevelopment) {
      const entry = this.formatLogEntry(LogLevel.DEBUG, message, metadata)
      this.output(entry)
    }
  }

  // Convenience method for API requests
  apiRequest(method: string, path: string, statusCode: number, duration?: number): void {
    this.info(`API ${method} ${path}`, {
      method,
      path,
      statusCode,
      duration: duration ? `${duration}ms` : undefined
    })
  }

  // Convenience method for database operations
  dbOperation(operation: string, collection: string, duration?: number, error?: Error): void {
    if (error) {
      this.error(`DB ${operation} failed on ${collection}`, {
        operation,
        collection,
        duration: duration ? `${duration}ms` : undefined,
        error: error.message,
        stack: error.stack
      })
    } else {
      this.debug(`DB ${operation} on ${collection}`, {
        operation,
        collection,
        duration: duration ? `${duration}ms` : undefined
      })
    }
  }
}

// Export singleton instances for different services
export const logger = new Logger('app')
export const apiLogger = new Logger('api')
export const dbLogger = new Logger('database')
export const cmsLogger = new Logger('cms')

// Export the Logger class for custom instances
export { Logger }