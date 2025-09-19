// Generate a blur data URL for placeholder images
export function generateBlurDataURL(
  width = 4,
  height = 3,
  color = '#f3f4f6'
): string {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null
  
  if (!canvas) {
    // Fallback base64 blur for SSR
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/></svg>`
    ).toString('base64')}`
  }

  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Create gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, color)
  gradient.addColorStop(0.5, '#e5e7eb')
  gradient.addColorStop(1, color)
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL('image/webp', 0.1) // Low quality for small size
}

// Generate a shimmer effect placeholder
export function generateShimmerDataURL(
  width = 400,
  height = 300
): string {
  if (typeof window === 'undefined') {
    // SSR fallback
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
            <animateTransform attributeName="gradientTransform" type="translate" values="-${width} 0;${width} 0;-${width} 0" dur="2s" repeatCount="indefinite"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#shimmer)"/>
      </svg>`
    ).toString('base64')}`
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  // Create animated shimmer effect
  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  gradient.addColorStop(0, '#f3f4f6')
  gradient.addColorStop(0.5, '#e5e7eb')
  gradient.addColorStop(1, '#f3f4f6')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL('image/webp', 0.15)
}

// Create low-quality image placeholder (LQIP)
export async function createLQIP(
  imageUrl: string,
  quality = 0.1,
  maxWidth = 40
): Promise<string> {
  if (typeof window === 'undefined') {
    return generateBlurDataURL()
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(generateBlurDataURL())
          return
        }

        // Calculate dimensions maintaining aspect ratio
        const aspectRatio = img.height / img.width
        canvas.width = maxWidth
        canvas.height = maxWidth * aspectRatio

        // Draw blurred, low-quality version
        ctx.filter = 'blur(2px)'
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const blurDataURL = canvas.toDataURL('image/webp', quality)
        resolve(blurDataURL)
      } catch (error) {
        resolve(generateBlurDataURL())
      }
    }

    img.onerror = () => {
      resolve(generateBlurDataURL())
    }

    img.src = imageUrl
  })
}

// Extract dominant color from image for better placeholders
export async function extractDominantColor(imageUrl: string): Promise<string> {
  if (typeof window === 'undefined') {
    return '#f3f4f6'
  }

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve('#f3f4f6')
          return
        }

        canvas.width = 1
        canvas.height = 1
        ctx.drawImage(img, 0, 0, 1, 1)
        
        const imageData = ctx.getImageData(0, 0, 1, 1).data
        const rgb = `rgb(${imageData[0]}, ${imageData[1]}, ${imageData[2]})`
        
        // Convert to hex
        const hex = '#' + ((1 << 24) + (imageData[0] << 16) + (imageData[1] << 8) + imageData[2]).toString(16).slice(1)
        resolve(hex)
      } catch (error) {
        resolve('#f3f4f6')
      }
    }

    img.onerror = () => resolve('#f3f4f6')
    img.src = imageUrl
  })
}

// Cache blur data URLs to avoid regeneration
const blurCache = new Map<string, string>()

export async function getCachedBlurDataURL(
  imageUrl: string,
  options: { width?: number; height?: number; quality?: number } = {}
): Promise<string> {
  const cacheKey = `${imageUrl}-${options.width}-${options.height}-${options.quality}`
  
  if (blurCache.has(cacheKey)) {
    return blurCache.get(cacheKey)!
  }

  const blurDataURL = await createLQIP(imageUrl, options.quality, options.width)
  blurCache.set(cacheKey, blurDataURL)
  
  return blurDataURL
}