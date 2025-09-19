// Resource preloading utilities for CDN optimization
'use client'

interface PreloadResource {
  href: string
  as: 'font' | 'image' | 'script' | 'style' | 'fetch'
  type?: string
  crossOrigin?: 'anonymous' | 'use-credentials'
  media?: string
}

class ResourcePreloader {
  private preloadedResources = new Set<string>()
  private observer: IntersectionObserver | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.initIntersectionObserver()
    }
  }

  /**
   * Preload critical resources immediately
   */
  preloadCritical(resources: PreloadResource[]): void {
    resources.forEach(resource => {
      this.preloadResource(resource, true)
    })
  }

  /**
   * Preload resources with low priority
   */
  preloadLazy(resources: PreloadResource[]): void {
    resources.forEach(resource => {
      this.preloadResource(resource, false)
    })
  }

  /**
   * Preload image when it enters viewport
   */
  preloadOnVisible(imageUrl: string, element: HTMLElement): void {
    if (!this.observer || this.preloadedResources.has(imageUrl)) return

    this.observer.observe(element)
    
    // Store the image URL in the element's dataset for the observer callback
    element.dataset.preloadSrc = imageUrl
  }

  /**
   * Preload next page resources
   */
  preloadNextPage(href: string): void {
    if (this.preloadedResources.has(href)) return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
    this.preloadedResources.add(href)
  }

  /**
   * Preload critical fonts
   */
  preloadFonts(fontUrls: string[]): void {
    const resources: PreloadResource[] = fontUrls.map(url => ({
      href: url,
      as: 'font',
      type: this.getFontType(url),
      crossOrigin: 'anonymous'
    }))
    
    this.preloadCritical(resources)
  }

  /**
   * Preload above-the-fold images
   */
  preloadHeroImages(imageUrls: string[]): void {
    const resources: PreloadResource[] = imageUrls.map(url => ({
      href: url,
      as: 'image'
    }))
    
    this.preloadCritical(resources)
  }

  /**
   * Preload API responses
   */
  preloadApiData(urls: string[]): void {
    const resources: PreloadResource[] = urls.map(url => ({
      href: url,
      as: 'fetch',
      crossOrigin: 'anonymous'
    }))
    
    this.preloadLazy(resources)
  }

  private preloadResource(resource: PreloadResource, highPriority: boolean): void {
    if (this.preloadedResources.has(resource.href)) return

    const link = document.createElement('link')
    link.rel = highPriority ? 'preload' : 'prefetch'
    link.href = resource.href
    link.as = resource.as
    
    if (resource.type) link.type = resource.type
    if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin
    if (resource.media) link.media = resource.media
    
    // Add fetchpriority for critical resources
    if (highPriority && (resource.as === 'image' || resource.as === 'font')) {
      link.setAttribute('fetchpriority', 'high')
    }

    document.head.appendChild(link)
    this.preloadedResources.add(resource.href)
  }

  private initIntersectionObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const imageUrl = entry.target.getAttribute('data-preload-src')
            if (imageUrl && !this.preloadedResources.has(imageUrl)) {
              this.preloadResource({ href: imageUrl, as: 'image' }, false)
              this.observer?.unobserve(entry.target)
            }
          }
        })
      },
      {
        // Start loading when image is 50% away from viewport
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    )
  }

  private getFontType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'woff2':
        return 'font/woff2'
      case 'woff':
        return 'font/woff'
      case 'ttf':
        return 'font/truetype'
      case 'otf':
        return 'font/opentype'
      default:
        return 'font/woff2'
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// Singleton instance
export const resourcePreloader = new ResourcePreloader()

/**
 * React hook for resource preloading
 */
export function useResourcePreloader() {
  return {
    preloadCritical: resourcePreloader.preloadCritical.bind(resourcePreloader),
    preloadLazy: resourcePreloader.preloadLazy.bind(resourcePreloader),
    preloadOnVisible: resourcePreloader.preloadOnVisible.bind(resourcePreloader),
    preloadNextPage: resourcePreloader.preloadNextPage.bind(resourcePreloader),
    preloadFonts: resourcePreloader.preloadFonts.bind(resourcePreloader),
    preloadHeroImages: resourcePreloader.preloadHeroImages.bind(resourcePreloader),
    preloadApiData: resourcePreloader.preloadApiData.bind(resourcePreloader),
  }
}

/**
 * Preload critical resources for specific page types
 */
export const PAGE_PRELOAD_CONFIGS = {
  home: {
    fonts: [
      // Add your critical font URLs here
    ],
    images: [
      // Hero images that should load immediately
    ],
    api: [
      '/api/galleries?limit=6',
      '/api/blog-posts?limit=3',
    ]
  },
  gallery: {
    images: [
      // Gallery thumbnail images
    ],
    api: [
      // Gallery data endpoints
    ]
  },
  blog: {
    api: [
      '/api/blog-posts?limit=10',
    ]
  }
} as const

/**
 * Utility to generate optimized image URLs for different screen sizes
 */
export function generateResponsiveImageUrls(
  baseUrl: string, 
  sizes: number[] = [640, 828, 1080, 1200, 1920]
): string[] {
  return sizes.map(size => `${baseUrl}?w=${size}&q=85`)
}

/**
 * Critical resource hints component for head
 */
export function generateResourceHints(): string {
  return `
    <!-- DNS prefetch for external domains -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    
    <!-- Preconnect to critical external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Early hints for Vercel Analytics -->
    <link rel="dns-prefetch" href="//vercel-insights.com">
    <link rel="dns-prefetch" href="//vercel-vitals.com">
  `
}