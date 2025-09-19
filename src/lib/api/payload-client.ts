import { getPayload } from 'payload'
import configPromise from '../../config/payload.config'

// PayloadCMS client instance
let payloadClient: Awaited<ReturnType<typeof getPayload>> | null = null

export async function getPayloadClient() {
  if (!payloadClient) {
    payloadClient = await getPayload({ config: configPromise })
  }
  return payloadClient
}

// Type definitions for our data structures
export interface PayloadImage {
  id: string
  slug: string
  title: {
    en: string
    ta: string
  }
  description: {
    en: string
    ta: string
  }
  caption?: {
    en: string
    ta: string
  }
  alt: {
    en: string
    ta: string
  }
  imageUrls: {
    full: string
    thumbnail: string
    medium: string
  }
  location?: {
    name?: string | {
      en: string
      ta: string
    } | null
    coordinates?: {
      lat: number
      lng: number
    } | {
      latitude?: number | null
      longitude?: number | null
    }
    city?: string | {
      en: string
      ta: string
    } | null
    region?: string | {
      en: string
      ta: string
    } | null
    country?: string | {
      en: string
      ta: string
    } | null
  }
  captureDate: string
  gallery?: PayloadGallery
  tags: {
    en: string[]
    ta: string[]
  }
  
  // Technical metadata
  technical?: {
    cameraBody?: {
      id: string
      brand: string
      model: string
      name: {
        en: string
        ta: string
      }
      category: string
    }
    lensGear?: {
      id: string
      brand: string
      model: string
      name: {
        en: string
        ta: string
      }
      category: string
    }
    aperture?: string
    shutterSpeed?: string
    iso?: number
    focalLength?: number
    flash?: boolean
  }
  fileInfo?: {
    dimensions: {
      width: number
      height: number
    }
    fileSize: number
    colorSpace: string
    software: string
  }
  
  // Photography style metadata
  photographyStyle?: 'landscape' | 'street' | 'wildlife' | 'astrophotography' | 'macro' | 'portrait'
  styleMetadata?: {
    landscape?: {
      season: string
      timeOfDay: string
      weather: string
      elevation?: number
    }
    street?: {
      cityDistrict: string
      sceneType: string
      subjectInteraction: string
    }
    wildlife?: {
      species: string
      behavior: string
      habitat: string
      distance: number
    }
    astrophotography?: {
      moonPhase: string
      bortle: number
      targets: string[]
      exposureCount: number
    }
  }
  
  // Rights and licensing
  rights?: {
    useCustomRights: boolean
    customCopyright?: string
    license?: 'all-rights-reserved' | 'cc-by' | 'cc-by-sa' | 'cc-by-nc' | 'public-domain' | 'custom'
    customAttribution?: string
    availableForPrint?: boolean
    availableForLicense?: boolean
    specialNotes?: string
  }
  
  // SEO Fields
  seo?: {
    metaTitle?: {
      en?: string
      ta?: string
    }
    metaDescription?: {
      en?: string
      ta?: string
    }
    keywords?: string[]
    ogImage?: string
    canonicalUrl?: string
    noIndex?: boolean
    imageSchema?: {
      photographicGenre?: string
      copyrightNotice?: string
      creditText?: string
    }
  }
  
  createdAt: string
  updatedAt: string
}

export interface PayloadGallery {
  id: string
  title: {
    en: string
    ta: string
  }
  slug: string
  description: {
    en: string
    ta: string
  }
  excerpt?: {
    en: string
    ta: string
  }
  images?: PayloadImage[]
  imageCount: number
  tags?: {
    en: string[]
    ta: string[]
  }
  featured: boolean
  coverImage?: PayloadImage
  status: 'published' | 'draft'
  photographyStyle?: 'landscape' | 'astrophotography' | 'wildlife' | 'street' | 'portrait' | 'macro' | 'documentary' | 'architectural' | 'abstract' | 'travel' | 'mixed'
  
  // SEO Fields
  seo?: {
    metaTitle?: {
      en?: string
      ta?: string
    }
    metaDescription?: {
      en?: string
      ta?: string
    }
    keywords?: string[]
    ogImage?: string
    canonicalUrl?: string
    noIndex?: boolean
  }
  
  createdAt: string
  updatedAt: string
}

export interface PayloadBlogPost {
  id: string
  title: {
    en: string
    ta: string
  }
  slug: string
  subtitle?: {
    en: string
    ta: string
  }
  excerpt: {
    en: string
    ta: string
  }
  tripDates?: {
    en: string
    ta: string
  }
  author?: string
  contentBlocks: {
    en: any[]
    ta: any[]
  }
  tags: {
    en: string[]
    ta: string[]
  }
  featuredImage?: PayloadImage
  gallery?: PayloadGallery
  featured?: boolean
  publishedAt?: string
  _status: 'published' | 'draft'
  
  // SEO Fields
  seo?: {
    metaTitle?: {
      en?: string
      ta?: string
    }
    metaDescription?: {
      en?: string
      ta?: string
    }
    keywords?: string[]
    ogImage?: string
    canonicalUrl?: string
    noIndex?: boolean
    schema?: {
      articleType?: string
      readingTime?: number
      photographyLocation?: string
    }
  }
  
  createdAt: string
  updatedAt: string
}

export interface PayloadAbout {
  id: string
  title: string
  heroSection: {
    name: {
      en: string
      ta: string
    }
    title: {
      en: string
      ta: string
    }
    location: {
      en: string
      ta: string
    }
    introduction: {
      en: string
      ta: string
    }
    description: {
      en: string
      ta: string
    }
    profileImage?: PayloadImage
  }
  philosophy: {
    quote: {
      en: string
      ta: string
    }
    description: {
      en: any // Lexical rich text
      ta: any
    }
  }
  favoriteLocations: Array<{
    name: {
      en: string
      ta: string
    }
    emoji: string
    description: {
      en: string
      ta: string
    }
    coverImage?: PayloadImage
    gallery?: PayloadGallery
  }>
  technicalSkills: {
    developmentDescription: {
      en: string
      ta: string
    }
    frontendTechnologies: Array<{ name: string }>
    backendTechnologies: Array<{ name: string }>
    photographyDescription: {
      en: string
      ta: string
    }
    specializations: Array<{ name: string }>
    techniques: Array<{ name: string }>
  }
  personalMission: {
    title: {
      en: string
      ta: string
    }
    description: {
      en: string
      ta: string
    }
    websiteDescription: {
      en: string
      ta: string
    }
  }
  socialLinks: Array<{
    platform: string
    url: string
    username?: string
  }>
  
  // SEO Fields
  seo?: {
    metaTitle?: {
      en?: string
      ta?: string
    }
    metaDescription?: {
      en?: string
      ta?: string
    }
    keywords?: string[]
    ogImage?: string
    canonicalUrl?: string
    schema?: {
      jobTitle?: {
        en?: string
        ta?: string
      }
      worksFor?: string
      alumniOf?: string
      awards?: string[]
      knowsLanguage?: string[]
    }
  }
  
  createdAt: string
  updatedAt: string
}

export interface PayloadGear {
  id: string
  name: {
    en: string
    ta: string
  }
  slug: string
  category: string
  brand: string
  model: string
  description: {
    en: any // Lexical rich text
    ta: any
  }
  specifications: {
    keySpecs: Array<{
      spec: string
      value: string
    }>
    weight?: string
    dimensions?: string
  }
  usage: {
    primaryUse: string[]
    whyIUseIt: {
      en: any // Lexical rich text
      ta: any
    }
    pros: Array<{ point: string }>
    cons: Array<{ point: string }>
  }
  images: Array<{
    image: PayloadImage
    caption?: {
      en: string
      ta: string
    }
    isPrimary: boolean
  }>
  sampleWork?: PayloadImage[]
  purchaseInfo?: {
    purchaseDate?: string
    price?: number
    retailer?: string
    affiliateLink?: string
  }
  rating?: number
  featured: boolean
  status: 'current' | 'previous' | 'wishlist' | 'borrowed'
  createdAt: string
  updatedAt: string
}

export interface PayloadSiteMetadata {
  id: string
  personal: {
    name: {
      en: string
      ta: string
    }
    fullName?: {
      en: string
      ta: string
    }
    title: {
      en: string
      ta: string
    }
    location?: {
      en: string
      ta: string
    }
    email?: string // Made optional for portfolio-only sites
    bio?: {
      en: any // Lexical rich text
      ta: any
    }
    avatar?: PayloadImage
  }
  legal?: {
    copyrightHolder?: {
      en: string
      ta: string
    }
    copyrightYear?: number
    defaultLicense?: 'all-rights-reserved' | 'cc-by' | 'cc-by-sa' | 'cc-by-nc' | 'public-domain' | 'custom'
    defaultAttribution?: {
      en: string
      ta: string
    }
    availableForPrint?: boolean
    availableForLicense?: boolean
    businessName?: {
      en: string
      ta: string
    }
    businessRegistration?: string
    taxId?: string
  }
  professional?: {
    yearsExperience?: number
    specialties?: string[]
    certifications?: Array<{
      name: string
      organization: string
      year?: number
      url?: string
    }>
    equipment?: string[]
    services?: Array<{
      name: string
      description?: {
        en: string
        ta: string
      }
      price?: string
    }>
  }
  createdAt: string
  updatedAt: string
}


// API functions
export async function getGalleries(locale: string = 'en') {
  const payload = await getPayloadClient()
  
  const galleries = await payload.find({
    collection: 'galleries',
    locale: locale as any,
    sort: '-createdAt',
    depth: 2, // Include related images
  })
  
  return galleries.docs as unknown as PayloadGallery[]
}

export async function getGalleryBySlug(slug: string, locale: string = 'en') {
  const payload = await getPayloadClient()
  
  const galleries = await payload.find({
    collection: 'galleries',
    where: {
      slug: {
        equals: slug
      }
    },
    locale: locale as any,
    limit: 1,
    depth: 3, // Include images and their metadata
  })
  
  if (galleries.docs.length === 0) {
    return null
  }
  
  const gallery = galleries.docs[0] as unknown as PayloadGallery
  
  // Get all images for this gallery (only published)
  const images = await payload.find({
    collection: 'images',
    where: {
      gallery: {
        equals: gallery.id
      },
      _status: {
        equals: 'published'
      }
    },
    sort: 'order',
    depth: 1,
  })
  
  gallery.images = images.docs as unknown as PayloadImage[]
  gallery.imageCount = images.totalDocs
  
  return gallery
}

export async function getImageById(id: string, locale: string = 'en') {
  const payload = await getPayloadClient()
  
  const image = await payload.findByID({
    collection: 'images',
    id,
    locale: locale as any,
    depth: 2, // Include gallery data
  })
  
  // Check if image is published (for non-authenticated users)
  if (image && (image as any)._status !== 'published') {
    return null
  }
  
  return image as unknown as PayloadImage
}

export async function getBlogPosts(locale: string = 'en', limit = 10) {
  const payload = await getPayloadClient()
  
  const posts = await payload.find({
    collection: 'blog-posts',
    locale: locale as any,
    sort: '-publishDate',
    limit,
    depth: 2,
  })
  
  return posts.docs as unknown as PayloadBlogPost[]
}

export async function getBlogPostBySlug(slug: string, locale: string = 'en') {
  const payload = await getPayloadClient()
  
  const posts = await payload.find({
    collection: 'blog-posts',
    where: {
      slug: {
        equals: slug
      }
    },
    locale: locale as any,
    limit: 1,
    depth: 3,
  })
  
  if (posts.docs.length === 0) {
    return null
  }
  
  return posts.docs[0] as unknown as PayloadBlogPost
}

export async function getAboutPage(locale: string = 'en') {
  const payload = await getPayloadClient()
  
  const about = await payload.findGlobal({
    slug: 'about' as any,
    locale: locale as any,
    depth: 3,
  })
  
  return about as unknown as PayloadAbout
}

export async function getFeaturedGear(locale: string = 'en', limit = 6) {
  const payload = await getPayloadClient()
  
  const gear = await payload.find({
    collection: 'gear',
    where: {
      featured: {
        equals: true
      },
      status: {
        equals: 'current'
      }
    },
    locale: locale as any,
    sort: '-rating',
    limit,
    depth: 2,
  })
  
  return gear.docs as unknown as PayloadGear[]
}

export async function getAllGear(locale: string = 'en', category?: string) {
  const payload = await getPayloadClient()
  
  const whereClause: any = {}
  if (category) {
    whereClause.category = { equals: category }
  }
  
  const gear = await payload.find({
    collection: 'gear',
    where: whereClause,
    locale: locale as any,
    sort: '-featured',
    depth: 2,
  })
  
  return gear.docs as unknown as PayloadGear[]
}

export async function getGearBySlug(slug: string, locale: string = 'en') {
  const payload = await getPayloadClient()
  
  const gear = await payload.find({
    collection: 'gear',
    where: {
      slug: {
        equals: slug
      }
    },
    locale: locale as any,
    limit: 1,
    depth: 3,
  })
  
  if (gear.docs.length === 0) {
    return null
  }
  
  return gear.docs[0] as unknown as PayloadGear
}

export async function getSiteMetadata(locale: string = 'en') {
  const payload = await getPayloadClient()
  
  const metadata = await payload.findGlobal({
    slug: 'site-metadata' as any,
    locale: locale as any,
    depth: 2,
  })
  
  return metadata as unknown as PayloadSiteMetadata
}

// Search functionality
export interface SearchResults {
  galleries: PayloadGallery[]
  images: PayloadImage[]
  blogPosts: PayloadBlogPost[]
  totalResults: number
}

export async function searchContent(
  query: string,
  locale: string = 'en',
  type?: 'galleries' | 'images' | 'blog' | 'all',
  limit = 20
): Promise<SearchResults> {
  if (!query || query.trim().length < 2) {
    return {
      galleries: [],
      images: [],
      blogPosts: [],
      totalResults: 0
    }
  }

  const payload = await getPayloadClient()
  const searchTerm = query.trim()

  // Create search conditions for different content types
  const createSearchCondition = (fields: string[]) => ({
    or: fields.map(field => ({
      [field]: {
        contains: searchTerm
      }
    }))
  })

  const results: SearchResults = {
    galleries: [],
    images: [],
    blogPosts: [],
    totalResults: 0
  }

  try {
    // Search galleries if type is 'all' or 'galleries'
    if (!type || type === 'all' || type === 'galleries') {
      const galleries = await payload.find({
        collection: 'galleries',
        where: {
          and: [
            { published: { equals: true } },
            createSearchCondition([
              'title',
              'description',
              'excerpt',
              'tags'
            ])
          ]
        },
        limit,
        depth: 2,
        locale: locale as any
      })
      results.galleries = galleries.docs as unknown as PayloadGallery[]
    }

    // Search images if type is 'all' or 'images'
    if (!type || type === 'all' || type === 'images') {
      const images = await payload.find({
        collection: 'images',
        where: {
          and: [
            { _status: { equals: 'published' } },
            createSearchCondition([
              'title',
              'description',
              'caption',
              'altText',
              'tags',
              'location.name',
              'location.city',
              'location.region',
              'location.country',
              'photographyStyle'
            ])
          ]
        },
        limit,
        depth: 2,
        locale: locale as any
      })
      results.images = images.docs as unknown as PayloadImage[]
    }

    // Search blog posts if type is 'all' or 'blog'
    if (!type || type === 'all' || type === 'blog') {
      const blogPosts = await payload.find({
        collection: 'blog-posts',
        where: {
          and: [
            { _status: { equals: 'published' } },
            createSearchCondition([
              'title',
              'subtitle',
              'excerpt',
              'tags'
            ])
          ]
        },
        limit,
        depth: 2,
        locale: locale as any
      })
      results.blogPosts = blogPosts.docs as unknown as PayloadBlogPost[]
    }

    results.totalResults = results.galleries.length + results.images.length + results.blogPosts.length

  } catch (error) {
    console.error('Search content error:', error)
    // Return empty results on error instead of throwing
  }

  return results
}

// Re-export localization helpers for backward compatibility
export { getLocalizedValue, formatDate } from '../utils/localization'

// Helper function to build responsive image URLs
export function getResponsiveImageUrls(image: PayloadImage) {
  return {
    thumbnail: image.imageUrls.thumbnail,
    medium: image.imageUrls.medium,
    full: image.imageUrls.full,
  }
}