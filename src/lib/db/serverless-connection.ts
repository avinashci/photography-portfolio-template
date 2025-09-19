// Database connection optimization for serverless environments (Vercel)
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import mongoose from 'mongoose'

interface ConnectionConfig {
  uri: string
  options?: mongoose.ConnectOptions
}

interface CachedConnection {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  lastUsed: number
  isHealthy: boolean
}

class ServerlessConnectionManager {
  private static instance: ServerlessConnectionManager
  private connections: Map<string, CachedConnection> = new Map()
  private readonly CONNECTION_TTL = 10 * 60 * 1000 // 10 minutes
  private readonly MAX_CONNECTIONS = 3
  private readonly CONNECTION_TIMEOUT = 10000 // 10 seconds

  private constructor() {}

  public static getInstance(): ServerlessConnectionManager {
    if (!ServerlessConnectionManager.instance) {
      ServerlessConnectionManager.instance = new ServerlessConnectionManager()
    }
    return ServerlessConnectionManager.instance
  }

  /**
   * Get or create an optimized database connection for serverless
   */
  async getConnection(config: ConnectionConfig): Promise<typeof mongoose> {
    const connectionKey = this.getConnectionKey(config)
    const cached = this.connections.get(connectionKey)

    // Check if we have a healthy, recent connection
    if (cached && cached.conn && this.isConnectionValid(cached)) {
      cached.lastUsed = Date.now()
      return cached.conn
    }

    // If we have a pending connection, await it
    if (cached && cached.promise) {
      try {
        const conn = await cached.promise
        if (conn && mongoose.connection.readyState === 1) {
          cached.conn = conn
          cached.lastUsed = Date.now()
          cached.isHealthy = true
          return conn
        }
      } catch (error) {
        console.warn('Pending connection failed:', error)
        this.connections.delete(connectionKey)
      }
    }

    // Create new connection with serverless optimizations
    const promise = this.createOptimizedConnection(config)
    
    this.connections.set(connectionKey, {
      conn: null,
      promise,
      lastUsed: Date.now(),
      isHealthy: false
    })

    try {
      const conn = await promise
      const cached = this.connections.get(connectionKey)
      if (cached) {
        cached.conn = conn
        cached.promise = null
        cached.isHealthy = true
      }
      
      // Cleanup old connections
      this.cleanupConnections()
      
      return conn
    } catch (error) {
      this.connections.delete(connectionKey)
      throw error
    }
  }

  /**
   * Create an optimized connection for serverless functions
   */
  private async createOptimizedConnection(config: ConnectionConfig): Promise<typeof mongoose> {
    const optimizedOptions: mongoose.ConnectOptions = {
      // Serverless-optimized settings
      maxPoolSize: 1, // Serverless functions should use minimal connections
      minPoolSize: 0,
      maxIdleTimeMS: 30000, // 30 seconds
      serverSelectionTimeoutMS: this.CONNECTION_TIMEOUT,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      
      // Performance optimizations
      bufferCommands: false,
      
      // Connection efficiency
      connectTimeoutMS: this.CONNECTION_TIMEOUT,
      retryWrites: true,
      retryReads: true,
      readPreference: 'primary',
      
      // Merge with provided options
      ...config.options,
    }

    // Close any existing connections to prevent connection leaks
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect()
    }

    return mongoose.connect(config.uri, optimizedOptions)
  }

  /**
   * Check if connection is valid and healthy
   */
  private isConnectionValid(cached: CachedConnection): boolean {
    const now = Date.now()
    
    // Check TTL
    if (now - cached.lastUsed > this.CONNECTION_TTL) {
      return false
    }

    // Check connection state
    if (!cached.conn || mongoose.connection.readyState !== 1) {
      return false
    }

    return cached.isHealthy
  }

  /**
   * Cleanup old or unhealthy connections
   */
  private cleanupConnections(): void {
    const now = Date.now()
    const connectionsToDelete: string[] = []

    for (const [key, cached] of Array.from(this.connections.entries())) {
      if (now - cached.lastUsed > this.CONNECTION_TTL || !cached.isHealthy) {
        connectionsToDelete.push(key)
      }
    }

    // Keep only the most recent connections
    if (this.connections.size > this.MAX_CONNECTIONS) {
      const sortedConnections = Array.from(this.connections.entries())
        .sort((a, b) => b[1].lastUsed - a[1].lastUsed)
      
      for (let i = this.MAX_CONNECTIONS; i < sortedConnections.length; i++) {
        connectionsToDelete.push(sortedConnections[i][0])
      }
    }

    for (const key of connectionsToDelete) {
      this.connections.delete(key)
    }
  }

  /**
   * Generate connection key for caching
   */
  private getConnectionKey(config: ConnectionConfig): string {
    // Use URI as base key (without sensitive info)
    const uri = new URL(config.uri)
    return `${uri.host}${uri.pathname}${uri.search}`
  }

  /**
   * Gracefully close all connections
   */
  async closeAllConnections(): Promise<void> {
    try {
      await mongoose.disconnect()
      this.connections.clear()
    } catch (error) {
      console.warn('Error closing database connections:', error)
    }
  }

  /**
   * Get connection health status
   */
  getHealthStatus(): {
    activeConnections: number
    healthyConnections: number
    connectionStates: Record<string, any>
  } {
    const activeConnections = this.connections.size
    const healthyConnections = Array.from(this.connections.values())
      .filter(conn => this.isConnectionValid(conn)).length

    const connectionStates = {
      mongoose: {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      }
    }

    return {
      activeConnections,
      healthyConnections,
      connectionStates
    }
  }
}

/**
 * Get singleton connection manager
 */
export const connectionManager = ServerlessConnectionManager.getInstance()

/**
 * Create optimized MongooseAdapter for Payload
 */
export function createOptimizedMongooseAdapter(uri: string) {
  return mongooseAdapter({
    url: uri,
    connectOptions: {
      // Serverless optimizations
      maxPoolSize: 1,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      
      // Performance settings
      bufferCommands: false,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
      readPreference: 'primary',
    }
  })
}

/**
 * Ensure graceful shutdown of database connections
 */
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing database connections...')
    await connectionManager.closeAllConnections()
  })

  process.on('SIGINT', async () => {
    console.log('SIGINT received, closing database connections...')
    await connectionManager.closeAllConnections()
  })
}

/**
 * Helper function to execute database operations with connection management
 */
export async function withDatabaseConnection<T>(
  operation: () => Promise<T>,
  config?: ConnectionConfig
): Promise<T> {
  const dbConfig = config || {
    uri: process.env.DATABASE_URI || process.env.MONGODB_URI || '',
  }

  if (!dbConfig.uri) {
    throw new Error('Database URI is required')
  }

  try {
    await connectionManager.getConnection(dbConfig)
    return await operation()
  } catch (error) {
    console.error('Database operation failed:', error)
    throw error
  }
}