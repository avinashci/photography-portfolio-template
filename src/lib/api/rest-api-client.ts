// REST API client for PayloadCMS
import type { 
  PayloadGallery, 
  PayloadImage, 
  PayloadBlogPost, 
  PayloadAbout, 
  PayloadGear
} from './payload-client'

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_API_URL || ''
  : 'http://localhost:3000'

class RestApiClient {
  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Galleries
  async getGalleries(locale: string = 'en'): Promise<PayloadGallery[]> {
    const result = await this.fetchApi<{ docs: PayloadGallery[] }>(`/api/galleries?locale=${locale}&sort=-createdAt&depth=2`)
    
    // Add image count and latest 3 images for each gallery
    const galleriesWithImageCount = await Promise.all(
      result.docs.map(async (gallery) => {
        try {
          // Get total count
          const totalImages = await this.fetchApi<{ totalDocs: number }>(`/api/images?where[gallery][equals]=${gallery.id}&where[_status][equals]=published&locale=${locale}&limit=0`)
          
          // Get latest 3 images
          const latestImages = await this.fetchApi<{ docs: PayloadImage[] }>(`/api/images?where[gallery][equals]=${gallery.id}&where[_status][equals]=published&locale=${locale}&sort=-createdAt&limit=3&depth=1`)
          
          return {
            ...gallery,
            imageCount: totalImages.totalDocs,
            images: latestImages.docs,
          }
        } catch (error) {
          // If error fetching image count, default to 0
          return {
            ...gallery,
            imageCount: 0,
            images: [],
          }
        }
      })
    )
    
    return galleriesWithImageCount
  }

  async getGalleryBySlug(slug: string, locale: string = 'en'): Promise<PayloadGallery | null> {
    try {
      const result = await this.fetchApi<{ docs: PayloadGallery[] }>(`/api/galleries?where[slug][equals]=${slug}&locale=${locale}&limit=1&depth=3`)
      
      if (result.docs.length === 0) {
        return null
      }
      
      const gallery = result.docs[0]
      
      // Get images for this gallery (only published)
      const images = await this.fetchApi<{ docs: PayloadImage[]; totalDocs?: number }>(`/api/images?where[gallery][equals]=${gallery.id}&where[_status][equals]=published&locale=${locale}&sort=order&depth=1`)
      
      gallery.images = images.docs
      gallery.imageCount = images.totalDocs || images.docs.length
      
      return gallery
    } catch (error) {
      return null
    }
  }

  // Images
  async getImageById(id: string, locale: string = 'en'): Promise<PayloadImage | null> {
    try {
      const image = await this.fetchApi<PayloadImage>(`/api/images/${id}?locale=${locale}&depth=2`)
      // Check if image is published (for non-authenticated users)
      if (image && (image as any)._status !== 'published') {
        return null
      }
      return image
    } catch (error) {
      return null
    }
  }

  async getImageBySlug(slug: string, locale: string = 'en'): Promise<PayloadImage | null> {
    try {
      const result = await this.fetchApi<{ docs: PayloadImage[] }>(`/api/images?where[slug][equals]=${slug}&locale=${locale}&limit=1&depth=2`)
      
      if (result.docs.length === 0) {
        return null
      }
      
      const image = result.docs[0]
      // Check if image is published (for non-authenticated users)
      if (image && (image as any)._status !== 'published') {
        return null
      }
      return image
    } catch (error) {
      return null
    }
  }

  // Blog Posts
  async getBlogPosts(locale: string = 'en', limit = 10): Promise<PayloadBlogPost[]> {
    const result = await this.fetchApi<{ docs: PayloadBlogPost[] }>(`/api/blog-posts?locale=${locale}&limit=${limit}&sort=-publishDate&depth=2`)
    return result.docs
  }

  async getBlogPostBySlug(slug: string, locale: string = 'en'): Promise<PayloadBlogPost | null> {
    try {
      const result = await this.fetchApi<{ docs: PayloadBlogPost[] }>(`/api/blog-posts?where[slug][equals]=${slug}&locale=${locale}&limit=1&depth=3`)
      return result.docs.length > 0 ? result.docs[0] : null
    } catch (error) {
      return null
    }
  }

  // Other collections using PayloadCMS native REST API
  async getAboutPage(locale: string = 'en'): Promise<PayloadAbout | null> {
    try {
      const result = await this.fetchApi<PayloadAbout>(`/api/globals/about?locale=${locale}&depth=3`)
      return result
    } catch (error) {
      return null
    }
  }

  async getHomePage(locale: string = 'en'): Promise<any | null> {
    try {
      const result = await this.fetchApi<any>(`/api/globals/home?locale=${locale}&depth=3`)
      return result
    } catch (error) {
      return null
    }
  }

  async getFeaturedGear(locale: string = 'en', limit = 6): Promise<PayloadGear[]> {
    try {
      const result = await this.fetchApi<{ docs: PayloadGear[] }>(`/api/gear?where[featured][equals]=true&where[status][equals]=current&locale=${locale}&limit=${limit}&sort=-rating&depth=2`)
      return result.docs
    } catch (error) {
      return []
    }
  }

  async getAllGear(locale: string = 'en', category?: string): Promise<PayloadGear[]> {
    try {
      const categoryFilter = category ? `&where[category][equals]=${category}` : ''
      const result = await this.fetchApi<{ docs: PayloadGear[] }>(`/api/gear?locale=${locale}${categoryFilter}&sort=-featured&depth=2`)
      return result.docs
    } catch (error) {
      return []
    }
  }

  async getGearBySlug(slug: string, locale: string = 'en'): Promise<PayloadGear | null> {
    try {
      const result = await this.fetchApi<{ docs: PayloadGear[] }>(`/api/gear?where[slug][equals]=${slug}&locale=${locale}&limit=1&depth=3`)
      return result.docs.length > 0 ? result.docs[0] : null
    } catch (error) {
      return null
    }
  }


  async getSettings(locale: string = 'en'): Promise<any | null> {
    try {
      const result = await this.fetchApi<any>(`/api/globals/settings?locale=${locale}&depth=2`)
      return result
    } catch (error) {
      return null
    }
  }
}

// Create singleton instance
export const restApiClient = new RestApiClient()

// Export helper functions with the same signature as the server-side client
export const getGalleries = (locale: string = 'en') => restApiClient.getGalleries(locale)
export const getGalleryBySlug = (slug: string, locale: string = 'en') => restApiClient.getGalleryBySlug(slug, locale)
export const getImageById = (id: string, locale: string = 'en') => restApiClient.getImageById(id, locale)
export const getImageBySlug = (slug: string, locale: string = 'en') => restApiClient.getImageBySlug(slug, locale)
export const getBlogPosts = (locale: string = 'en', limit = 10) => restApiClient.getBlogPosts(locale, limit)
export const getBlogPostBySlug = (slug: string, locale: string = 'en') => restApiClient.getBlogPostBySlug(slug, locale)
export const getAboutPage = (locale: string = 'en') => restApiClient.getAboutPage(locale)
export const getHomePage = (locale: string = 'en') => restApiClient.getHomePage(locale)
export const getFeaturedGear = (locale: string = 'en', limit = 6) => restApiClient.getFeaturedGear(locale, limit)
export const getAllGear = (locale: string = 'en', category?: string) => restApiClient.getAllGear(locale, category)
export const getGearBySlug = (slug: string, locale: string = 'en') => restApiClient.getGearBySlug(slug, locale)
export const getSettings = (locale: string = 'en') => restApiClient.getSettings(locale)

// Re-export types and utilities
export type { 
  PayloadGallery, 
  PayloadImage, 
  PayloadBlogPost, 
  PayloadAbout, 
  PayloadGear
} from './payload-client'

export { getLocalizedValue, formatDate } from '../utils/localization'
export { getResponsiveImageUrls } from './payload-client'