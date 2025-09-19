import { NextRequest, NextResponse } from 'next/server'

interface PagePerformancePayload {
  url: string
  metrics: {
    dns: number
    tcp: number
    ttfb: number
    download: number
    dom: number
    load: number
    total: number
  }
  timestamp: number
}

let performanceData: PagePerformancePayload[] = []

export async function POST(request: NextRequest) {
  try {
    const data: PagePerformancePayload = await request.json()
    
    // Validate required fields
    if (!data.url || !data.metrics || typeof data.metrics.total !== 'number') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    // Store the data
    performanceData.push({
      ...data,
      timestamp: Date.now()
    })

    // Keep only last 500 entries
    if (performanceData.length > 500) {
      performanceData = performanceData.slice(-500)
    }

    // Log slow pages (>3s total load time)
    if (data.metrics.total > 3000) {
      console.warn(`Slow page load: ${data.url} took ${data.metrics.total}ms`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error storing page performance data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get('secret')
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hours = parseInt(request.nextUrl.searchParams.get('hours') || '24')
    const cutoff = Date.now() - (hours * 60 * 60 * 1000)
    
    const recentData = performanceData.filter(d => d.timestamp > cutoff)
    
    if (recentData.length === 0) {
      return NextResponse.json({
        summary: { total: 0, averages: {} },
        data: [],
        timestamp: new Date().toISOString()
      })
    }

    // Calculate averages
    const averages = {
      dns: recentData.reduce((acc, d) => acc + d.metrics.dns, 0) / recentData.length,
      tcp: recentData.reduce((acc, d) => acc + d.metrics.tcp, 0) / recentData.length,
      ttfb: recentData.reduce((acc, d) => acc + d.metrics.ttfb, 0) / recentData.length,
      download: recentData.reduce((acc, d) => acc + d.metrics.download, 0) / recentData.length,
      dom: recentData.reduce((acc, d) => acc + d.metrics.dom, 0) / recentData.length,
      load: recentData.reduce((acc, d) => acc + d.metrics.load, 0) / recentData.length,
      total: recentData.reduce((acc, d) => acc + d.metrics.total, 0) / recentData.length
    }

    // Find slowest pages
    const slowest = [...recentData]
      .sort((a, b) => b.metrics.total - a.metrics.total)
      .slice(0, 10)
      .map(d => ({
        url: d.url,
        total: d.metrics.total,
        timestamp: d.timestamp
      }))

    return NextResponse.json({
      summary: {
        total: recentData.length,
        averages,
        slowest
      },
      data: recentData.slice(-50), // Return last 50 data points
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error retrieving page performance data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}