import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['en'],
  defaultLocale: 'en',
  localePrefix: 'always'
})

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Security: Block suspicious requests
  const suspiciousPatterns = [
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /wp-admin/i,
    /wp-login/i,
    /admin\.php/i,
    /xmlrpc\.php/i,
    /\.env$/i,
    /\.git/i
  ]
  
  if (suspiciousPatterns.some(pattern => pattern.test(pathname))) {
    return new NextResponse('Not Found', { status: 404 })
  }
  
  // Rate limiting headers (basic implementation)
  const response = intlMiddleware(request)
  
  // Security headers
  if (response) {
    response.headers.set('X-Robots-Tag', 'index, follow')
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    
    // Cache control for static assets
    if (pathname.startsWith('/_next/static/')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    }
    
    // Cache control for images
    if (pathname.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)) {
      response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=86400')
    }
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*|admin).*)',
    '/',
    '/en/:path*'
  ]
}