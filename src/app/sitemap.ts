import { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/api/payload-client'
import { SITE_CONFIG } from '@/config/site.config'

/**
 * Enhanced sitemap generation with SEO optimizations
 * 
 * Generates comprehensive XML sitemap with proper priorities,
 * change frequencies, and multilingual support for SEO.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url.base
  const payload = await getPayloadClient()
  
  // Static pages for both locales
  const staticPages = [
    '',
    '/about',
    '/galleries', 
    '/journal',
    '/terms',
    '/privacy',
    '/image-rights'
  ]
  
  const locales = ['en']
  
  // SEO-optimized page priorities and frequencies
  const pageConfig: Record<string, { priority: number; frequency: any }> = {
    '': { priority: 1.0, frequency: 'weekly' },
    '/about': { priority: 0.9, frequency: 'monthly' },
    '/galleries': { priority: 0.9, frequency: 'weekly' },
    '/journal': { priority: 0.8, frequency: 'weekly' },
    '/terms': { priority: 0.3, frequency: 'yearly' },
    '/privacy': { priority: 0.3, frequency: 'yearly' },
    '/image-rights': { priority: 0.3, frequency: 'yearly' },
  }

  // Initialize the sitemap URLs array
  const staticUrls: MetadataRoute.Sitemap = []

  // Generate static page URLs for each locale
  for (const locale of locales) {
    for (const page of staticPages) {
      const config = pageConfig[page] || { priority: 0.5, frequency: 'monthly' }
      staticUrls.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: config.frequency,
        priority: config.priority,
        alternates: {
          languages: {
            en: `${baseUrl}/en${page}`,
          }
        }
      })
    }
  }
  
  try {
    // Get all galleries
    const galleries = await payload.find({
      collection: 'galleries',
      limit: 1000,
      sort: '-createdAt'
    })
    
    // Get all blog posts
    const blogPosts = await payload.find({
      collection: 'blog-posts',
      limit: 1000,
      sort: '-publishDate'
    })
    
    // Gallery URLs
    const galleryUrls: MetadataRoute.Sitemap = []
    for (const gallery of galleries.docs) {
      for (const locale of locales) {
        galleryUrls.push({
          url: `${baseUrl}/${locale}/galleries/${gallery.slug}`,
          lastModified: new Date(gallery.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: {
            languages: {
              en: `${baseUrl}/en/galleries/${gallery.slug}`,
            }
          }
        })
      }
    }
    
    // Blog post URLs  
    const blogUrls: MetadataRoute.Sitemap = []
    for (const post of blogPosts.docs) {
      for (const locale of locales) {
        blogUrls.push({
          url: `${baseUrl}/${locale}/journal/${post.slug}`,
          lastModified: new Date(post.updatedAt),
          changeFrequency: 'monthly',
          priority: 0.7,
          alternates: {
            languages: {
              en: `${baseUrl}/en/journal/${post.slug}`,
            }
          }
        })
      }
    }
    
    return [...staticUrls, ...galleryUrls, ...blogUrls]
    
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least static pages if dynamic content fails
    return staticUrls
  }
}