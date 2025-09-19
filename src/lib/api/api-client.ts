// Hybrid API client that uses server-side calls during build/SSR and REST API for client-side
import { unstable_cache } from 'next/cache'
import { getPayloadClient } from './payload-client'
import { restApiClient } from './rest-api-client'

// Re-export types
export type { 
  PayloadGallery, 
  PayloadImage, 
  PayloadBlogPost, 
  PayloadAbout, 
  PayloadGear,
  PayloadSiteMetadata
} from './payload-client'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Optimized cached gallery fetcher for server-side with selective field loading
const getCachedGalleries = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    
    // Fetch galleries with only required fields for list view
    const galleries = await payload.find({
      collection: 'galleries',
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        excerpt: true,
        featured: true,
        coverImage: true,
        photographyStyle: true,
        createdAt: true,
        updatedAt: true,
        _status: true
      },
      sort: '-createdAt',
      depth: 0, // No relations, we'll fetch images separately
      where: {
        _status: { equals: 'published' }
      }
    })
    
    // Add image count and latest 3 images for each gallery using optimized queries
    const galleriesWithImageCount = await Promise.all(
      galleries.docs.map(async (gallery) => {
        // Get total count (very fast, no data transfer)
        const totalImages = await payload.find({
          collection: 'images',
          where: { 
            gallery: { equals: gallery.id },
            _status: { equals: 'published' }
          },
          limit: 0, // Count only
        })
        
        // Get latest 3 images with minimal fields for thumbnails
        const latestImages = await payload.find({
          collection: 'images',
          where: { 
            gallery: { equals: gallery.id },
            _status: { equals: 'published' }
          },
          select: {
            id: true,
            slug: true,
            title: true,
            alt: true,
            imageUrls: true,
            createdAt: true
          },
          sort: '-createdAt',
          limit: 3,
          depth: 0,
        })
        
        return {
          ...gallery,
          imageCount: totalImages.totalDocs,
          images: latestImages.docs,
        }
      })
    )
    
    return galleriesWithImageCount
  },
  ['galleries-list-optimized'], // Updated cache key
  {
    tags: ['galleries', 'images'], // More granular tags
    revalidate: 3600, // 1 hour cache
  }
)

// For SSG/SSR, use server-side PayloadCMS client
// For client-side, use REST API
export async function getGalleries() {
  if (isBrowser) {
    return restApiClient.getGalleries('en')
  } else {
    // Server-side during build/SSR with caching
    return await getCachedGalleries()
  }
}

// New paginated galleries function for performance
const getCachedGalleriesPaginated = unstable_cache(
  async (page = 1, limit = 12) => {
    const payload = await getPayloadClient()
    
    const galleries = await payload.find({
      collection: 'galleries',
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        excerpt: true,
        featured: true,
        coverImage: true,
        photographyStyle: true,
        createdAt: true,
        _status: true
      },
      where: {
        _status: { equals: 'published' }
      },
      sort: '-createdAt',
      page,
      limit,
      depth: 0,
    })
    
    // For paginated requests, we don't fetch individual image counts to improve performance
    // This data can be fetched on-demand when needed
    return {
      docs: galleries.docs,
      totalDocs: galleries.totalDocs,
      totalPages: galleries.totalPages,
      page: galleries.page,
      pagingCounter: galleries.pagingCounter,
      hasPrevPage: galleries.hasPrevPage,
      hasNextPage: galleries.hasNextPage,
      prevPage: galleries.prevPage,
      nextPage: galleries.nextPage
    }
  },
  ['galleries-paginated'],
  {
    tags: ['galleries'],
    revalidate: 1800, // 30 minutes for paginated results
  }
)

export async function getGalleriesPaginated(page = 1, limit = 12) {
  if (isBrowser) {
    return restApiClient.getGalleries('en') // Fallback to full list for client
  } else {
    return getCachedGalleriesPaginated(page, limit)
  }
}

// Optimized cached individual gallery fetcher with pagination support
const getCachedGalleryBySlug = unstable_cache(
  async (slug: string, page = 1, limit = 20) => {
    const payload = await getPayloadClient()
    
    // Fetch gallery with selective fields
    const galleries = await payload.find({
      collection: 'galleries',
      where: { 
        slug: { equals: slug },
        _status: { equals: 'published' }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        excerpt: true,
        coverImage: true,
        featured: true,
        photographyStyle: true,
        tags: true,
        seo: true,
        createdAt: true,
        updatedAt: true
      },
      limit: 1,
      depth: 0,
    })
    
    if (galleries.docs.length === 0) {
      return null
    }
    
    const gallery = galleries.docs[0]
    
    // Get paginated images for this gallery (only published) with selective fields
    const images = await payload.find({
      collection: 'images',
      where: { 
        gallery: { equals: gallery.id },
        _status: { equals: 'published' }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        alt: true,
        imageUrls: true,
        featured: true,
        tags: true,
        keywords: true,
        photographyMetadata: true,
        createdAt: true
      },
      sort: '-createdAt', // Sort by newest first
      limit: 100, // Reasonable limit for gallery images
      depth: 0,
    })
    
    const extendedGallery = gallery as any
    extendedGallery.images = images.docs
    extendedGallery.imageCount = images.totalDocs
    
    return extendedGallery
  },
  ['gallery-by-slug'], // Cache key
  {
    tags: ['galleries', 'images'], // Both tags since it depends on both
    revalidate: 3600, // 1 hour cache
  }
)

export async function getGalleryBySlug(slug: string) {
  if (isBrowser) {
    return restApiClient.getGalleryBySlug(slug, 'en')
  } else {
    return getCachedGalleryBySlug(slug)
  }
}

export async function getImageById(id: string) {
  if (isBrowser) {
    return restApiClient.getImageById(id, 'en')
  } else {
    const payload = await getPayloadClient()
    try {
      const image = await payload.findByID({
        collection: 'images',
        id,
          depth: 2,
      })
      // Check if image is published (for non-authenticated users)
      if (image && image._status !== 'published') {
        return null
      }
      return image
    } catch (error) {
      return null
    }
  }
}

export async function getImageBySlug(slug: string) {
  if (isBrowser) {
    return restApiClient.getImageBySlug(slug, 'en')
  } else {
    const payload = await getPayloadClient()
    try {
      const images = await payload.find({
        collection: 'images',
        where: { slug: { equals: slug } },
          limit: 1,
        depth: 2,
      })
      
      if (images.docs.length === 0) {
        return null
      }
      
      const image = images.docs[0]
      // Check if image is published (for non-authenticated users)
      if (image && image._status !== 'published') {
        return null
      }
      return image
    } catch (error) {
      return null
    }
  }
}

// Optimized cached blog posts fetcher
const getCachedBlogPosts = unstable_cache(
  async (limit = 10) => {
    const payload = await getPayloadClient()
    const posts = await payload.find({
      collection: 'blog-posts',
      where: {
        _status: { equals: 'published' }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        featuredImage: true,
        category: true,
        tags: true,
        publishDate: true,
        author: true,
        createdAt: true
      },
      sort: '-publishDate',
      limit,
      depth: 1, // Include one level of relationships to populate featuredImage
    })
    return posts.docs
  },
  ['blog-posts-list'],
  {
    tags: ['blog-posts'],
    revalidate: 3600,
  }
)

export async function getBlogPosts(limit = 10) {
  if (isBrowser) {
    return restApiClient.getBlogPosts('en', limit)
  } else {
    return getCachedBlogPosts(limit)
  }
}

export async function getBlogPostBySlug(slug: string) {
  if (isBrowser) {
    return restApiClient.getBlogPostBySlug(slug, 'en')
  } else {
    const payload = await getPayloadClient()
    const posts = await payload.find({
      collection: 'blog-posts',
      where: { 
        slug: { equals: slug },
        _status: { equals: 'published' }
      },
      limit: 1,
      depth: 3,
    })
    
    if (posts.docs.length === 0) {
      return null
    }
    
    return posts.docs[0]
  }
}

export async function getAboutPage() {
  if (isBrowser) {
    return restApiClient.getAboutPage('en')
  } else {
    const payload = await getPayloadClient()
    const about = await payload.findGlobal({
      slug: 'about',
      depth: 3,
      locale: 'en',
    })
    
    return about
  }
}

export async function getHomePage() {
  if (isBrowser) {
    return restApiClient.getHomePage('en')
  } else {
    const payload = await getPayloadClient()
    const home = await payload.findGlobal({
      slug: 'home',
      depth: 3,
    })
    
    return home
  }
}

export async function getFeaturedGear(limit = 6) {
  if (isBrowser) {
    return restApiClient.getFeaturedGear('en', limit)
  } else {
    const payload = await getPayloadClient()
    const gear = await payload.find({
      collection: 'gear',
      where: {
        featured: { equals: true },
        status: { equals: 'current' }
      },
      sort: '-rating',
      limit,
      depth: 2,
    })
    return gear.docs
  }
}

export async function getCurrentGear(limit = 12) {
  if (isBrowser) {
    // For browser, we can use REST API (would need to implement in rest-api-client)
    // For now, fallback to getFeaturedGear
    return restApiClient.getFeaturedGear('en', limit)
  } else {
    const payload = await getPayloadClient()
    const gear = await payload.find({
      collection: 'gear',
      where: {
        status: { equals: 'current' }
      },
      sort: ['-featured', '-rating', 'category'], // Featured first, then by rating, then by category
      limit,
      depth: 2,
    })
    return gear.docs
  }
}

export async function getAllGear(category?: string) {
  if (isBrowser) {
    return restApiClient.getAllGear('en', category)
  } else {
    const payload = await getPayloadClient()
    const whereClause: any = {}
    if (category) {
      whereClause.category = { equals: category }
    }
    
    const gear = await payload.find({
      collection: 'gear',
      where: whereClause,
      sort: '-featured',
      depth: 2,
    })
    return gear.docs
  }
}

export async function getGearBySlug(slug: string) {
  if (isBrowser) {
    return restApiClient.getGearBySlug(slug, 'en')
  } else {
    const payload = await getPayloadClient()
    const gear = await payload.find({
      collection: 'gear',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 3,
    })
    
    if (gear.docs.length === 0) {
      return null
    }
    
    return gear.docs[0]
  }
}


export async function getSettings(locale: string = 'en') {
  if (isBrowser) {
    return restApiClient.getSettings(locale)
  } else {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({
      slug: 'settings',
      locale: locale as any,
      depth: 2,
    })
    return settings
  }
}

export async function getSiteMetadata(locale: string = 'en') {
  if (isBrowser) {
    // TODO: Add REST API support for site metadata
    throw new Error('getSiteMetadata not yet supported in browser mode')
  } else {
    const payload = await getPayloadClient()
    const metadata = await payload.findGlobal({
      slug: 'site-metadata' as any,
      locale: locale as any,
      depth: 2,
    })
    return metadata
  }
}

// Re-export utilities
export { getLocalizedValue, formatDate } from '../utils/localization'
export { getResponsiveImageUrls } from './payload-client'