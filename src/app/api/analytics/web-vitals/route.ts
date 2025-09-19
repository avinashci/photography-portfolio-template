import { NextRequest, NextResponse } from 'next/server'
import { edgeCache, CACHE_CONFIGS } from '@/lib/cache/edge-cache'

interface WebVitalsPayload {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  timestamp: number
  url: string
  userAgent: string
  connectionType?: string
  deviceMemory?: number
}

// In-memory storage for demo purposes
// In production, you would use a proper database or analytics service
let vitalsData: WebVitalsPayload[] = []

export async function POST(request: NextRequest) {
  try {
    const data: WebVitalsPayload = await request.json()
    
    // Validate required fields
    if (!data.name || typeof data.value !== 'number' || !data.id) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    // Store the data (in production, send to your analytics service)
    vitalsData.push({
      ...data,
      timestamp: Date.now() // Override with server timestamp
    })

    // Keep only last 1000 entries in memory
    if (vitalsData.length > 1000) {
      vitalsData = vitalsData.slice(-1000)
    }

    // Log important metrics
    if (data.rating === 'poor') {
      console.warn(`Poor Web Vital: ${data.name} = ${data.value} (${data.url})`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing Web Vitals data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for auth (simple secret check for demo)
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hours = parseInt(request.nextUrl.searchParams.get('hours') || '24')
    const cutoff = Date.now() - (hours * 60 * 60 * 1000)
    
    const recentData = vitalsData.filter(d => d.timestamp > cutoff)
    
    // Generate summary statistics
    const summary = {
      total: recentData.length,
      byMetric: {} as Record<string, any>,
      byRating: {
        good: recentData.filter(d => d.rating === 'good').length,
        'needs-improvement': recentData.filter(d => d.rating === 'needs-improvement').length,
        poor: recentData.filter(d => d.rating === 'poor').length
      },
      averageValues: {} as Record<string, number>
    }

    // Calculate averages by metric
    const metrics = ['CLS', 'INP', 'FCP', 'LCP', 'TTFB']
    metrics.forEach(metric => {
      const metricData = recentData.filter(d => d.name === metric)
      if (metricData.length > 0) {
        summary.byMetric[metric] = {
          count: metricData.length,
          good: metricData.filter(d => d.rating === 'good').length,
          'needs-improvement': metricData.filter(d => d.rating === 'needs-improvement').length,
          poor: metricData.filter(d => d.rating === 'poor').length,
          average: metricData.reduce((acc, d) => acc + d.value, 0) / metricData.length,
          p75: calculatePercentile(metricData.map(d => d.value), 75),
          p95: calculatePercentile(metricData.map(d => d.value), 95)
        }
        summary.averageValues[metric] = summary.byMetric[metric].average
      }
    })

    const responseData = {
      summary,
      data: recentData.slice(-100), // Return last 100 data points
      timestamp: new Date().toISOString()
    }

    // Use edge caching for analytics data (short-lived cache)
    return edgeCache.cacheApiResponse(responseData, 'API_DYNAMIC')
  } catch (error) {
    console.error('Error retrieving Web Vitals data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}