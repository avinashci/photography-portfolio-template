import type { PayloadImage } from '../api/payload-client'

// Generate responsive srcSet from PayloadCMS image URLs
export function getResponsiveImageSrcSet(image: PayloadImage): string | undefined {
  const urls = image.imageUrls
  if (!urls) return undefined

  const srcSetArray: string[] = []
  
  if (urls.thumbnail) {
    srcSetArray.push(`${urls.thumbnail} 400w`)
  }
  if (urls.medium) {
    srcSetArray.push(`${urls.medium} 800w`)
  }
  if (urls.full) {
    srcSetArray.push(`${urls.full} 1200w`)
  }
  
  return srcSetArray.length > 0 ? srcSetArray.join(', ') : undefined
}

// Generate WebP srcSet by replacing extensions
// NOTE: Disabled because WebP versions don't exist on S3 bucket
//
// To re-enable WebP support:
// 1. Upload WebP versions of all images to S3 bucket
// 2. Uncomment the implementation below
// 3. Test that WebP URLs are accessible
//
export function getWebPSrcSet(image: PayloadImage): string | undefined {
  // Return undefined to disable WebP srcSet generation
  // WebP files don't exist in the S3 bucket, so we shouldn't generate URLs for them
  return undefined

  /* Original implementation (disabled):
  const urls = image.imageUrls
  if (!urls) return undefined

  const srcSetArray: string[] = []

  if (urls.thumbnail) {
    const webpUrl = urls.thumbnail.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    srcSetArray.push(`${webpUrl} 400w`)
  }
  if (urls.medium) {
    const webpUrl = urls.medium.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    srcSetArray.push(`${webpUrl} 800w`)
  }
  if (urls.full) {
    const webpUrl = urls.full.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    srcSetArray.push(`${webpUrl} 1200w`)
  }

  return srcSetArray.length > 0 ? srcSetArray.join(', ') : undefined
  */
}

// Generate optimized sizes attribute based on usage context
export function getImageSizes(context: 'gallery-card' | 'gallery-grid' | 'detail-main' | 'detail-thumb' | 'gallery-thumb') {
  switch (context) {
    case 'gallery-card':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    case 'gallery-grid':
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
    case 'detail-main':
      return '(max-width: 1024px) 100vw, 66vw'
    case 'detail-thumb':
      return '100px'
    case 'gallery-thumb':
      return '150px'
    default:
      return '100vw'
  }
}

// Generate a simple blur data URL for placeholder effect
export function generateBlurDataURL(width = 10, height = 10) {
  // Create a simple gradient blur placeholder
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = width
  canvas.height = height
  
  if (ctx) {
    // Create a subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f0f0f0')
    gradient.addColorStop(0.5, '#e0e0e0')
    gradient.addColorStop(1, '#d0d0d0')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    return canvas.toDataURL('image/jpeg', 0.1)
  }
  
  return ''
}

// Generate blur data URL from image URL (simplified version)
export function createBlurDataURL(imageUrl: string): string {
  // In a real implementation, you'd use a service to generate tiny, blurred versions
  // For now, we'll use a simple gradient
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHZpZXdCb3g9IjAgMCAxMCAxMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjBmMGYwIiBzdG9wLW9wYWNpdHk9IjAuOCIvPgo8c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2UwZTBlMCIgc3RvcC1vcGFjaXR5PSIwLjYiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZDBkMGQwIiBzdG9wLW9wYWNpdHk9IjAuNCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KPC9zdmc+'
}

// Preload critical images
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`))
    img.src = src
  })
}

// Preload multiple images
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.allSettled(srcs.map(preloadImage))
}

// Check if WebP is supported
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}

// Check if AVIF is supported
export function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image()
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 1)
    }
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
  })
}

// Get optimal image format based on browser support
export async function getOptimalImageFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
  const [avifSupported, webpSupported] = await Promise.all([
    supportsAVIF(),
    supportsWebP()
  ])
  
  if (avifSupported) return 'avif'
  if (webpSupported) return 'webp'
  return 'jpeg'
}

// Calculate image aspect ratio
export function getImageAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(width, height)
  const aspectWidth = width / divisor
  const aspectHeight = height / divisor
  
  return `${aspectWidth}/${aspectHeight}`
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Get the best available image URL starting from smallest to largest
export function getProgressiveImageSrc(image: PayloadImage): string {
  const urls = image.imageUrls
  if (!urls) return ''

  // Priority order: smallest to largest, with null checks
  return urls.thumbnail || urls.medium || (urls as any).large || urls.full || ''
}

// Get image for cards using progressive size order
export function getCardImageSrc(image: PayloadImage): string {
  const urls = image.imageUrls
  if (!urls) return ''

  // Priority: thumbnail → medium → large → full (smallest to largest)
  return urls.thumbnail || urls.medium || (urls as any).large || urls.full || ''
}


// Server-side/static version - get hero image source based on assumed screen size
export function getResponsiveHeroImageSrc(image: any, assumedScreenSize: 'mobile' | 'tablet' | 'desktop' | 'large' = 'desktop'): string {
  if (!image?.imageUrls) {
    return image?.url || ''
  }

  const urls = image.imageUrls

  switch (assumedScreenSize) {
    case 'mobile':
      // Mobile - medium is good quality for smaller screens
      return urls.medium || urls.thumbnail || (urls as any).large || urls.full || image.url || ''

    case 'tablet':
      // Tablet - medium or large
      return urls.medium || (urls as any).large || urls.full || urls.thumbnail || image.url || ''

    case 'desktop':
      // Desktop - large or full for good quality
      return (urls as any).large || urls.full || urls.medium || urls.thumbnail || image.url || ''

    case 'large':
      // Large displays/4K - full size
      return urls.full || (urls as any).large || urls.medium || urls.thumbnail || image.url || ''

    default:
      return urls.full || (urls as any).large || urls.medium || urls.thumbnail || image.url || ''
  }
}

// Get fallback image URL (next size up from the primary)
export function getFallbackImageSrc(image: PayloadImage, primarySrc?: string): string {
  const urls = image.imageUrls
  if (!urls) return ''

  // If no primary src provided, get the progressive src
  if (!primarySrc) {
    primarySrc = getProgressiveImageSrc(image)
  }

  // If primary is thumbnail, fallback to medium/large/full
  if (primarySrc === urls.thumbnail) {
    return urls.medium || (urls as any).large || urls.full || ''
  }

  // If primary is medium, fallback to large/full
  if (primarySrc === urls.medium) {
    return (urls as any).large || urls.full || ''
  }

  // If primary is large, fallback to full
  if (primarySrc === (urls as any).large) {
    return urls.full || ''
  }

  // If all else fails, return any available URL
  return urls.full || (urls as any).large || urls.medium || urls.thumbnail || ''
}

// Generate responsive image attributes with progressive loading
export function getResponsiveImageProps(
  image: PayloadImage,
  context: 'gallery-card' | 'gallery-grid' | 'detail-main' | 'detail-thumb' | 'gallery-thumb'
) {
  const srcSet = getResponsiveImageSrcSet(image)
  const webpSrcSet = getWebPSrcSet(image)
  const sizes = getImageSizes(context)
  const blurDataURL = createBlurDataURL(image.imageUrls?.thumbnail || image.imageUrls?.full || '')

  // Use progressive image loading
  const progressiveSrc = getProgressiveImageSrc(image)
  const fallbackSrc = getFallbackImageSrc(image, progressiveSrc)

  return {
    src: progressiveSrc,
    fallbackSrc: fallbackSrc !== progressiveSrc ? fallbackSrc : undefined,
    width: image.fileInfo?.dimensions?.width || (image as any).width || 2400, // Default fallback for modern images
    height: image.fileInfo?.dimensions?.height || (image as any).height || 1600, // Default fallback for modern images
    srcSet,
    webpSrcSet,
    sizes,
    blurDataURL,
    alt: '', // Will be filled by component
    loading: context === 'detail-main' ? 'eager' as const : 'lazy' as const
  }
}

// Safe wrapper for handling different image types in journal content
export function getSafeImageProps(
  image: any,
  context: 'gallery-card' | 'gallery-grid' | 'detail-main' | 'detail-thumb' | 'gallery-thumb'
) {
  // Handle different image structures
  if (!image) {
    return {
      src: '',
      fallbackSrc: undefined,
      width: 2400,
      height: 1600,
      srcSet: undefined,
      webpSrcSet: undefined,
      sizes: getImageSizes(context),
      blurDataURL: '',
      alt: '',
      loading: context === 'detail-main' ? 'eager' as const : 'lazy' as const
    }
  }

  // If it has imageUrls structure (PayloadImage)
  if (image.imageUrls) {
    try {
      return getResponsiveImageProps(image as PayloadImage, context)
    } catch (error) {
      // Fallback to manual handling if PayloadImage structure fails
      console.warn('Failed to process PayloadImage, falling back to manual handling:', error)
    }
  }

  // Manual handling for other image structures
  const sizes = getImageSizes(context)
  const getSrc = () => {
    if (image.imageUrls) {
      return image.imageUrls.medium || image.imageUrls.full || image.imageUrls.thumbnail || image.url || ''
    }
    return image.url || image.src || ''
  }

  return {
    src: getSrc(),
    fallbackSrc: undefined,
    width: (image as any).width || 2400,
    height: (image as any).height || 1600,
    srcSet: undefined,
    webpSrcSet: undefined,
    sizes,
    blurDataURL: '',
    alt: '',
    loading: context === 'detail-main' ? 'eager' as const : 'lazy' as const
  }
}