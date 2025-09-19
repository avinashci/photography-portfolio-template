/**
 * Health check endpoint for production monitoring
 * Returns application status, dependencies, and system metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      api: 'healthy',
      database: 'unknown',
      cms: 'unknown'
    },
    metrics: {
      responseTime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    }
  }

  // Check database connectivity
  try {
    const payload = await getPayload({ config })
    
    // Simple database ping by attempting to get collections
    await payload.find({
      collection: 'users',
      limit: 1,
      depth: 0
    })
    
    health.checks.database = 'healthy'
    health.checks.cms = 'healthy'
  } catch (error) {
    health.status = 'degraded'
    health.checks.database = 'unhealthy'
    health.checks.cms = 'unhealthy'
    
    console.error('Health check - Database/CMS error:', error)
  }

  // Check critical environment variables
  const requiredEnvVars = [
    'MONGODB_URI',
    'PAYLOAD_SECRET',
    'NEXT_PUBLIC_SERVER_URL'
  ]
  
  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
  if (missingEnvVars.length > 0) {
    health.status = 'unhealthy'
    health.checks.api = 'unhealthy'
  }

  // Calculate response time
  health.metrics.responseTime = Date.now() - startTime

  // Determine HTTP status code based on health
  let statusCode = 200
  if (health.status === 'unhealthy') {
    statusCode = 503 // Service Unavailable
  } else if (health.status === 'degraded') {
    statusCode = 200 // Still OK, but with warnings
  }

  // Add basic request info for debugging
  const clientInfo = {
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || 
        request.headers.get('x-real-ip') ||
        'unknown',
    timestamp: new Date().toISOString()
  }

  return NextResponse.json({
    ...health,
    request: process.env.NODE_ENV === 'development' ? clientInfo : undefined
  }, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

// Also support HEAD requests for simple uptime checks
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}