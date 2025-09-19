import { NextRequest, NextResponse } from 'next/server'
import { connectionManager } from '@/lib/db/serverless-connection'
import { edgeCache, CACHE_CONFIGS } from '@/lib/cache/edge-cache'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    // Check for secret to confirm this is a valid request
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    // Get connection health status
    const healthStatus = connectionManager.getHealthStatus()
    
    // Get mongoose connection details
    const mongooseStatus = {
      readyState: mongoose.connection.readyState,
      readyStateText: getReadyStateText(mongoose.connection.readyState),
      host: mongoose.connection.host || 'Not connected',
      name: mongoose.connection.name || 'Unknown',
      collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections) : [],
    }

    // Perform a simple database ping if connected
    let pingResult = null
    if (mongoose.connection.readyState === 1) {
      try {
        const startTime = Date.now()
        if (mongoose.connection.db) {
          await mongoose.connection.db.admin().ping()
          pingResult = {
            success: true,
            responseTime: Date.now() - startTime,
          }
        } else {
          pingResult = {
            success: false,
            error: 'Database connection not available',
          }
        }
      } catch (error) {
        pingResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }

    const healthData = {
      timestamp: new Date().toISOString(),
      status: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
      connectionManager: healthStatus,
      mongoose: mongooseStatus,
      ping: pingResult,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        platform: process.platform,
        nodeVersion: process.version,
      },
      serverless: {
        runtime: 'vercel',
        region: process.env.VERCEL_REGION || 'unknown',
        function: process.env.AWS_LAMBDA_FUNCTION_NAME || 'vercel-function',
      }
    }

    // Use short-lived cache for health status
    return edgeCache.cacheApiResponse(healthData, 'API_DYNAMIC')

  } catch (error) {
    console.error('Database health check error:', error)
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

function getReadyStateText(state: number): string {
  switch (state) {
    case 0:
      return 'disconnected'
    case 1:
      return 'connected'
    case 2:
      return 'connecting'
    case 3:
      return 'disconnecting'
    default:
      return 'unknown'
  }
}

/**
 * Force reconnect endpoint for debugging
 */
export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'reconnect') {
      // Force close and reconnect
      await connectionManager.closeAllConnections()
      
      // Wait a bit before reconnecting
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get fresh connection
      await connectionManager.getConnection({
        uri: process.env.MONGODB_URI || process.env.DATABASE_URI || '',
      })
      
      return NextResponse.json({
        message: 'Reconnection initiated',
        timestamp: new Date().toISOString(),
        status: 'success'
      })
    }

    if (action === 'cleanup') {
      // Cleanup old connections
      await connectionManager.closeAllConnections()
      
      return NextResponse.json({
        message: 'Connection cleanup completed',
        timestamp: new Date().toISOString(),
        status: 'success'
      })
    }

    return NextResponse.json(
      { message: 'Invalid action. Use "reconnect" or "cleanup"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Database action error:', error)
    return NextResponse.json({
      message: 'Database action failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}