import { SITE_CONFIG } from '@/config/site.config'
import { getSiteMetadata } from '@/lib/api/payload-client'
import { getCachedGlobal } from '@/lib/utils/getGlobals'

interface BaseStructuredDataProps {
  locale: 'en'
  pageType: 'homepage' | 'gallery' | 'galleryList' | 'image' | 'blog' | 'blogList' | 'about'
  pageData?: any
  customData?: {
    title?: string
    description?: string
    image?: string
    url?: string
    author?: string
    datePublished?: string
    dateModified?: string
  }
}

interface PersonSchema {
  "@context": "https://schema.org"
  "@type": "Person"
  "@id": string
  name: string
  jobTitle: string
  description: string
  url: string
  image: string
  sameAs: string[]
  knowsAbout: string[]
  hasOccupation: {
    "@type": "Occupation"
    name: string
    occupationLocation: {
      "@type": "Place"
      name: string
    }
  }
  email?: string
  telephone?: string
}

interface WebSiteSchema {
  "@context": "https://schema.org"
  "@type": "WebSite"
  "@id": string
  name: string
  description: string
  url: string
  author: { "@id": string }
  potentialAction: {
    "@type": "SearchAction"
    target: {
      "@type": "EntryPoint"
      urlTemplate: string
    }
    "query-input": string
  }
  inLanguage: string[]
  datePublished: string
  dateModified: string
  logo?: {
    "@type": "ImageObject"
    url: string
  }
}

export async function generateStructuredData({
  locale,
  pageType,
  pageData,
  customData = {}
}: BaseStructuredDataProps) {
  // Fetch CMS data
  const settings = await getCachedGlobal('settings', 2)().catch(() => null) as any
  let siteMetadata: any
  try {
    siteMetadata = await getSiteMetadata(locale)
  } catch (error) {
    console.warn('Could not fetch site metadata for structured data')
  }

  const baseUrl = `${SITE_CONFIG.url.base}/${locale}`
  
  // Extract common data with proper fallbacks
  const personalName = siteMetadata?.personal?.name?.[locale as keyof typeof siteMetadata.personal.name] || 
                      settings?.personal?.name || 
                      SITE_CONFIG.personal.name
                      
  const personalTitle = siteMetadata?.personal?.title?.[locale as keyof typeof siteMetadata.personal.title] || 
                       "Photographer"
                       
  const personalBio = siteMetadata?.personal?.bio?.[locale as keyof typeof siteMetadata.personal.bio] || 
                     customData.description ||
                     `Professional ${SITE_CONFIG.site.type} capturing visual stories`
                     
  const personalLocation = siteMetadata?.personal?.location || "Worldwide"
  const personalImage = siteMetadata?.personal?.profileImage?.url || 
                       customData.image ||
                       `${SITE_CONFIG.url.base}/og-image.jpg`
                       
  const siteTitle = settings?.site?.name || 
                   (siteMetadata?.site?.name?.[locale as keyof typeof siteMetadata.site.name]) || 
                   SITE_CONFIG.site.name
                   
  const siteDescription = settings?.site?.description || 
                         (siteMetadata?.site?.description?.[locale as keyof typeof siteMetadata.site.description]) || 
                         customData.description ||
                         `${SITE_CONFIG.site.type} portfolio showcasing visual stories`

  // Build social links
  const socialLinks = [
    ...(siteMetadata?.social?.instagram ? [siteMetadata.social.instagram] : []),
    ...(siteMetadata?.social?.twitter ? [siteMetadata.social.twitter] : []),
    ...(siteMetadata?.social?.facebook ? [siteMetadata.social.facebook] : []),
    ...(siteMetadata?.social?.linkedin ? [siteMetadata.social.linkedin] : []),
    ...(settings?.social?.instagram ? [settings.social.instagram] : []),
    ...(settings?.social?.twitter ? [settings.social.twitter] : []),
    // Fallback to config if CMS values missing
    ...((!siteMetadata?.social?.instagram && !settings?.social?.instagram && SITE_CONFIG.social.instagram) ? [SITE_CONFIG.social.instagram] : []),
    ...((!siteMetadata?.social?.twitter && !settings?.social?.twitter && SITE_CONFIG.social.twitter) ? [SITE_CONFIG.social.twitter] : []),
  ].filter(Boolean)

  // Base Person Schema - used across all pages
  const personSchema: PersonSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_CONFIG.url.base}/#person`,
    "name": personalName,
    "jobTitle": personalTitle,
    "description": personalBio,
    "url": SITE_CONFIG.url.base,
    "image": personalImage,
    "sameAs": socialLinks,
    "knowsAbout": siteMetadata?.personal?.expertise || ["Photography", "Visual Arts", "Digital Photography", SITE_CONFIG.site.type],
    "hasOccupation": {
      "@type": "Occupation",
      "name": personalTitle,
      "occupationLocation": {
        "@type": "Place",
        "name": personalLocation
      }
    },
    ...(siteMetadata?.personal?.email && {
      "email": siteMetadata.personal.email
    }),
    ...(siteMetadata?.personal?.telephone && {
      "telephone": siteMetadata.personal.telephone
    })
  }

  // Base WebSite Schema - used across all pages
  const websiteSchema: WebSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url.base}/#website`,
    "name": (siteMetadata?.site?.name?.[locale as keyof typeof siteMetadata.site.name]) || `${personalName} ${siteTitle}`,
    "description": siteDescription,
    "url": SITE_CONFIG.url.base,
    "author": {
      "@id": `${SITE_CONFIG.url.base}/#person`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": siteMetadata?.site?.languages || [locale, "en", "ta"],
    "datePublished": siteMetadata?.site?.establishedDate || settings?.site?.establishedDate || "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    ...(siteMetadata?.site?.logo?.url && {
      "logo": {
        "@type": "ImageObject",
        "url": siteMetadata.site.logo.url
      }
    })
  }

  // Page-specific schemas
  const pageSpecificSchemas: any[] = []

  switch (pageType) {
    case 'homepage':
      // Add featured gallery schema if available
      if (pageData?.featuredGallery) {
        const gallery = pageData.featuredGallery
        pageSpecificSchemas.push({
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          "@id": `${baseUrl}/galleries/${gallery.slug}#gallery`,
          "name": `${personalName} Photography Gallery - ${gallery.title?.[locale as keyof typeof gallery.title] || gallery.title?.en || ''}`,
          "description": gallery.description?.[locale as keyof typeof gallery.description] || gallery.description?.en || '',
          "url": `${baseUrl}/galleries/${gallery.slug}`,
          "author": { "@id": `${SITE_CONFIG.url.base}/#person` },
          "creator": { "@id": `${SITE_CONFIG.url.base}/#person` },
          "numberOfItems": gallery.imageCount || gallery.images?.length || 0,
          "genre": "Photography",
          "keywords": gallery.tags?.[locale as keyof typeof gallery.tags] || gallery.tags?.en || [],
          ...(gallery.coverImage && {
            "image": {
              "@type": "ImageObject",
              "url": typeof gallery.coverImage === 'string' ? gallery.coverImage : gallery.coverImage?.url,
              "name": gallery.title?.[locale as keyof typeof gallery.title] || gallery.title?.en || '',
              "author": { "@id": `${SITE_CONFIG.url.base}/#person` }
            }
          })
        })
      }

      // Add organization schema if business info exists
      const businessInfo = siteMetadata?.business || settings?.business
      if (businessInfo) {
        pageSpecificSchemas.push({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "@id": `${SITE_CONFIG.url.base}/#organization`,
          "name": businessInfo.name || `${personalName} Photography`,
          "description": businessInfo.description?.[locale as keyof typeof businessInfo.description] || `Professional ${SITE_CONFIG.site.type} services`,
          "url": SITE_CONFIG.url.base,
          "founder": { "@id": `${SITE_CONFIG.url.base}/#person` },
          "serviceType": businessInfo.serviceType || "Photography Services",
          "areaServed": businessInfo.serviceArea || personalLocation,
          ...(businessInfo.address && {
            "address": {
              "@type": "PostalAddress",
              "addressLocality": businessInfo.address.city,
              "addressRegion": businessInfo.address.region,
              "addressCountry": businessInfo.address.country,
              ...(businessInfo.address.postalCode && {
                "postalCode": businessInfo.address.postalCode
              })
            }
          }),
          ...(businessInfo.services && {
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": businessInfo.name || "Photography Services",
              "itemListElement": businessInfo.services.map((service: any) => ({
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": service.name,
                  "description": service.description?.[locale as keyof typeof service.description] || service.description
                }
              }))
            }
          })
        })
      }
      break

    case 'gallery':
      if (pageData) {
        pageSpecificSchemas.push({
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          "@id": `${customData.url}#gallery`,
          "name": customData.title || pageData.title?.[locale as keyof typeof pageData.title] || '',
          "description": customData.description || pageData.description?.[locale as keyof typeof pageData.description] || '',
          "url": customData.url,
          "author": { "@id": `${SITE_CONFIG.url.base}/#person` },
          "creator": { "@id": `${SITE_CONFIG.url.base}/#person` },
          "numberOfItems": pageData.imageCount || pageData.images?.length || 0,
          "genre": "Photography",
          "keywords": pageData.tags?.[locale as keyof typeof pageData.tags] || pageData.tags?.en || [],
          "dateCreated": pageData.createdAt,
          "dateModified": pageData.updatedAt,
          ...(pageData.coverImage && {
            "image": {
              "@type": "ImageObject",
              "url": typeof pageData.coverImage === 'string' ? pageData.coverImage : pageData.coverImage?.url,
              "name": customData.title || '',
              "author": { "@id": `${SITE_CONFIG.url.base}/#person` }
            }
          })
        })
      }
      break

    case 'image':
      if (pageData) {
        pageSpecificSchemas.push({
          "@context": "https://schema.org",
          "@type": "Photograph",
          "@id": `${customData.url}#photograph`,
          "name": customData.title || pageData.title?.[locale as keyof typeof pageData.title] || '',
          "description": customData.description || pageData.description?.[locale as keyof typeof pageData.description] || '',
          "url": customData.url,
          "contentUrl": pageData.imageUrls?.full || pageData.url,
          "thumbnailUrl": pageData.imageUrls?.thumbnail,
          "author": { "@id": `${SITE_CONFIG.url.base}/#person` },
          "creator": { "@id": `${SITE_CONFIG.url.base}/#person` },
          "copyrightHolder": { "@id": `${SITE_CONFIG.url.base}/#person` },
          "dateCreated": pageData.captureDate || pageData.createdAt,
          "dateModified": pageData.updatedAt,
          "genre": "Photography",
          "keywords": pageData.tags?.[locale as keyof typeof pageData.tags] || pageData.tags?.en || [],
          ...(pageData.location && {
            "contentLocation": {
              "@type": "Place",
              "name": pageData.location.name,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": pageData.location.city,
                "addressRegion": pageData.location.region,
                "addressCountry": pageData.location.country
              }
            }
          }),
          ...(pageData.technical && {
            "exifData": {
              "@type": "PropertyValue",
              "name": "Camera Settings",
              "value": [
                pageData.technical.cameraBody,
                pageData.technical.lensGear,
                `f/${pageData.technical.aperture}`,
                `${pageData.technical.shutterSpeed}s`,
                `ISO ${pageData.technical.iso}`
              ].filter(Boolean).join(", ")
            }
          })
        })
      }
      break

    case 'galleryList':
      // CollectionPage for galleries listing
      pageSpecificSchemas.push({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${baseUrl}/galleries#collection`,
        "name": `${personalName} Photography Galleries`,
        "description": customData.description || `Browse ${personalName}'s photography gallery collection`,
        "url": `${baseUrl}/galleries`,
        "author": { "@id": `${SITE_CONFIG.url.base}/#person` },
        "creator": { "@id": `${SITE_CONFIG.url.base}/#person` },
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": pageData?.galleries?.length || 0,
          "itemListElement": pageData?.galleries?.map((gallery: any, index: number) => ({
            "@type": "ImageGallery",
            "position": index + 1,
            "name": gallery.title?.[locale as keyof typeof gallery.title] || gallery.title?.en || '',
            "description": gallery.description?.[locale as keyof typeof gallery.description] || gallery.description?.en || '',
            "url": `${baseUrl}/galleries/${gallery.slug}`,
            "author": { "@id": `${SITE_CONFIG.url.base}/#person` },
            "numberOfItems": gallery.imageCount || gallery.images?.length || 0,
            ...(gallery.coverImage && {
              "image": {
                "@type": "ImageObject",
                "url": typeof gallery.coverImage === 'string' ? gallery.coverImage : gallery.coverImage?.url
              }
            })
          })) || []
        }
      })
      break

    case 'blog':
      if (pageData) {
        pageSpecificSchemas.push({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${customData.url}#article`,
          "headline": customData.title || pageData.title?.[locale as keyof typeof pageData.title] || '',
          "description": customData.description || pageData.excerpt?.[locale as keyof typeof pageData.excerpt] || '',
          "url": customData.url,
          "author": { "@id": `${SITE_CONFIG.url.base}/#person` },
          "publisher": { "@id": `${SITE_CONFIG.url.base}/#person` },
          "datePublished": pageData.publishDate || pageData.createdAt,
          "dateModified": pageData.updatedAt,
          "genre": pageData.category || "Photography",
          "keywords": pageData.tags?.[locale as keyof typeof pageData.tags] || pageData.tags?.en || [],
          "inLanguage": locale,
          ...(pageData.featuredImage && {
            "image": {
              "@type": "ImageObject",
              "url": typeof pageData.featuredImage === 'string' ? pageData.featuredImage : pageData.featuredImage?.url,
              "name": customData.title || '',
              "author": { "@id": `${SITE_CONFIG.url.base}/#person` }
            }
          })
        })
      }
      break
  }

  // Combine all schemas
  const allSchemas = [
    personSchema,
    websiteSchema,
    ...pageSpecificSchemas
  ]

  return allSchemas
}

type StructuredDataProps = BaseStructuredDataProps

export default async function StructuredData(props: StructuredDataProps) {
  const schemas = await generateStructuredData(props)
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas)
      }}
    />
  )
}