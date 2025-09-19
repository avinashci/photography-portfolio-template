import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enhanced Headers for CDN optimization
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      // Static assets optimization
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*\\.(?:ico|png|jpg|jpeg|gif|webp|avif|svg|woff2|woff|ttf|otf))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      // Font files optimization
      {
        source: '/(.*\\.(?:woff2|woff|ttf|otf|eot))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      },
      // JavaScript and CSS files
      {
        source: '/(.*\\.(?:js|mjs|jsx|ts|tsx|css))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // API routes optimization
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate'
          }
        ]
      },
      // Sitemap and robots for SEO
      {
        source: '/(sitemap\\.xml|robots\\.txt)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400'
          }
        ]
      }
    ]
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Enhanced image optimization for CDN
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 85, 90, 95], // Add quality configurations for Next.js 16
    minimumCacheTTL: 60 * 60 * 24 * 365, // Cache for 1 year
    dangerouslyAllowSVG: false, // Security: prevent SVG execution
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false,
    loader: 'default', // Use Vercel's image optimization
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://your-domain.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '*.vercel-storage.com',
      },
    ],
  },
  webpack: (webpackConfig, { isServer }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      '@payload-config': path.resolve('./src/config/payload.config.ts'),
    }

    // Exclude Node.js-only modules from client bundle
    if (!isServer) {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        worker_threads: false,
        fs: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        util: false,
        readline: false,
        child_process: false,
        net: false,
        tls: false,
        dns: false,
        http: false,
        https: false,
        zlib: false,
        querystring: false,
        url: false,
        assert: false,
        buffer: false,
        events: false,
        perf_hooks: false,
      }
    }

    return webpackConfig
  },
  
  // Production optimizations
  reactStrictMode: true,
  
  // Server external packages (moved from experimental)
  serverExternalPackages: ['sharp', 'onnxruntime-node'],
  
  // Experimental features and Vercel optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Enable additional performance optimizations
    optimizeServerReact: true,
    // Enable partial prerendering for better performance
    ppr: false, // Enable when stable
    // Enable concurrent features
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.vercel.app',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
      ].filter(Boolean),
    },
  },
  
  // Turbopack configuration (replaces experimental.turbo)
  turbopack: {
    rules: {
      '*.md': ['@mdx-js/loader'],
      '*.svg': ['@svgr/webpack'],
    },
  },
  
  // TypeScript configuration
  typescript: {
    // Only ignore build errors in development
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // ESLint configuration - skip during build for template flexibility
  eslint: {
    // Skip ESLint during production builds for template flexibility
    ignoreDuringBuilds: true,
  },
  
  // Build optimization
  env: {
    CUSTOM_KEY: 'production-value',
  },
  
  // Analytics and monitoring
  ...(process.env.SENTRY_DSN && {
    sentry: {
      hideSourceMaps: true,
    },
  }),
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
