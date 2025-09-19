# 🏗️ Technical Architecture Guide

Comprehensive overview of the photography portfolio's technical stack, architecture, and implementation details.

## 🚀 Technology Stack

### Core Framework & Runtime
- **Next.js**: 15.4.6 (App Router, React 19 compatible)
- **React**: 19.1.0 (Latest stable with Server Components)
- **TypeScript**: 5.7.2 (Strict mode enabled)
- **Node.js**: ≥20.0.0 (18 is EOL)

### Content Management
- **Payload CMS**: 3.52.0 (Latest v3, NOT v2.x syntax)
- **Database**: MongoDB 6.18.0 with Mongoose 8.17.1
- **Rich Text**: @payloadcms/richtext-lexical
- **File Storage**: Local file system (configurable for S3/CDN)

### Styling & UI
- **Tailwind CSS**: 4.1.12 (v4.x syntax, NOT v3.x)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Next.js font optimization

### Internationalization & Features
- **i18n**: next-intl 4.3.4 for multilingual support
- **Themes**: next-themes 0.4.6 for light/dark mode
- **Image Optimization**: Next.js Image component with modern formats

### Development & Build
- **Package Manager**: pnpm (NOT npm or yarn)
- **Linting**: ESLint with strict TypeScript rules
- **Type Generation**: Automatic Payload schema → TypeScript types

## 🏛️ Architecture Overview

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │───▶│   (Payload)     │───▶│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • App Router    │    │ • CMS API       │    │ • Collections   │
│ • Server Comp.  │    │ • Admin Panel   │    │ • Global Data   │
│ • Static Gen.   │    │ • Auth System   │    │ • File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Application Structure
```
src/
├── app/                     # Next.js 15 App Router
│   ├── [locale]/           # Internationalized routes (en/ta)
│   │   ├── page.tsx        # Homepage
│   │   ├── about/          # About page
│   │   ├── galleries/      # Gallery listing & detail pages
│   │   │   └── [slug]/     # Dynamic gallery pages
│   │   │       └── images/[imageSlug]/  # Individual image pages
│   │   └── journals/       # Blog/journal pages
│   ├── (payload)/          # Payload CMS admin routes
│   ├── api/                # API routes & webhooks
│   └── globals.css         # Global styles
├── components/
│   ├── admin/              # Payload admin customizations
│   ├── frontend/           # Public-facing components
│   │   ├── layout/         # Layout components
│   │   ├── content/        # Content display components
│   │   └── ui/             # Reusable UI elements
│   ├── providers/          # React context providers
│   └── ui/                 # shadcn/ui components
├── config/                 # Payload CMS configuration
│   ├── collections/        # Data collections (Images, Galleries, etc.)
│   ├── globals/            # Global settings (About, Home, Settings)
│   └── fields/             # Reusable field configurations
├── lib/
│   ├── api/                # API clients & data fetching
│   ├── i18n/               # Internationalization setup
│   ├── utils/              # Utility functions
│   └── validations/        # Schema validations
└── middleware.ts           # Next.js middleware (i18n routing)
```

## 📊 Data Architecture

### Content Collections

#### Images Collection
```typescript
{
  id: string
  title: { en: string, ta?: string }
  description?: { en: string, ta?: string }
  image: Media                    // File upload
  altText: { en: string, ta?: string }

  // Photography Metadata
  location?: {
    name: string
    coordinates?: { lat: number, lng: number }
  }
  captureDate?: Date
  camera?: string
  lens?: string
  settings?: {
    aperture?: string
    shutterSpeed?: string
    iso?: number
    focalLength?: string
  }

  // Organization
  tags?: string[]
  photographyStyle?: 'landscape' | 'portrait' | 'street' | 'wildlife' | ...

  // Rights Management
  rights?: {
    photographer?: string
    copyrightHolder?: string
    license?: 'all-rights-reserved' | 'cc-by' | 'cc-by-sa' | ...
    useCustomRights?: boolean
  }

  // SEO
  seo?: {
    metaTitle?: { en: string, ta?: string }
    metaDescription?: { en: string, ta?: string }
    keywords?: string[]
    noIndex?: boolean
  }
}
```

#### Galleries Collection
```typescript
{
  id: string
  title: { en: string, ta?: string }
  slug: string
  description?: { en: string, ta?: string }
  excerpt?: { en: string, ta?: string }

  // Content
  coverImage?: Media
  images?: Image[]              // Relationship to Images

  // Metadata
  location?: string
  captureDate?: Date
  photographyStyle?: string[]
  tags?: string[]

  // SEO
  seo?: { /* same structure as Images */ }

  // Publishing
  status: 'draft' | 'published'
  publishedAt?: Date
}
```

#### Blog Posts Collection
```typescript
{
  id: string
  title: { en: string, ta?: string }
  slug: string
  subtitle?: { en: string, ta?: string }

  // Content
  featuredImage?: Media
  excerpt?: { en: string, ta?: string }
  contentBlocks: Array<{
    blockType: 'richText' | 'image' | 'gallery' | 'imageLayout'
    // Block-specific content
  }>

  // Metadata
  category?: string
  tags?: string[]
  readingTime?: number

  // Photography Context
  photographyLocation?: string
  relatedGalleries?: Gallery[]

  // SEO & Publishing
  seo?: { /* same structure */ }
  status: 'draft' | 'published'
  publishedAt?: Date
}
```

### Global Settings

#### Site Settings
```typescript
{
  // Site Identity
  site: {
    name: { en: string, ta?: string }
    tagline?: { en: string, ta?: string }
    description: { en: string, ta?: string }
    keywords?: string[]
    logo?: Media
    favicon?: Media
  }

  // Contact Information
  contact: {
    email?: string
    phone?: string
    address?: { en: string, ta?: string }
    socialMedia?: {
      instagram?: string
      twitter?: string
      facebook?: string
      linkedin?: string
    }
  }

  // Features
  features: {
    enableJournal: boolean
    enableGear: boolean
    enableContact: boolean
    enableMultiLanguage: boolean
  }

  // SEO
  seo: {
    metaTitle?: { en: string, ta?: string }
    metaDescription: { en: string, ta?: string }
    ogImage?: Media
    noIndex?: boolean
  }
}
```

## 🔄 Data Flow Architecture

### Request Flow
```
1. User Request → Next.js Middleware (i18n routing)
2. Middleware → App Router (locale-specific routes)
3. App Router → Server Components (data fetching)
4. Server Components → Payload API (content retrieval)
5. Payload API → MongoDB (database queries)
6. Response → Static Generation/SSR → Client
```

### Content Management Flow
```
1. Admin User → Payload Admin Panel (/admin)
2. Content Creation/Edit → Payload Collections API
3. API Validation → MongoDB Storage
4. Webhook Triggers → Next.js Revalidation
5. Static Regeneration → Updated Public Site
```

## 🌐 Internationalization Architecture

### Route Structure
```
/en/                          # English routes
├── galleries/
├── galleries/[slug]/
├── journals/
└── about/

/en/                          # Tamil routes (if enabled)
├── galleries/
├── galleries/[slug]/
├── journals/
└── about/
```

### Content Localization
- **Database**: All text fields support `{ en: string, ta?: string }`
- **Fallbacks**: English content shown if translation missing
- **URL Generation**: Automatic locale-aware link generation
- **SEO**: Proper hreflang tags for international SEO

### Implementation
```typescript
// Middleware handles locale detection
export function middleware(request: NextRequest) {
  return createLocalizedRoute(request, {
    locales: ['en'],
    defaultLocale: 'en'
  })
}

// Components receive locale from params
export async function generateMetadata({ params: { locale } }) {
  const content = await getLocalizedContent(locale)
  return generateSEOMetadata(content, locale)
}
```

## 🖼️ Image Processing Architecture

### File Upload Flow
```
1. Admin Upload → Payload Media Collection
2. File Validation → Size/Type/Security Checks
3. File Storage → Local Filesystem (configurable)
4. Image Processing → Automatic Size Generation
5. Metadata Extraction → EXIF Data → Database
6. Response → File URLs + Metadata
```

### Image Optimization
```typescript
// Next.js Image component with optimization
<Image
  src={imageUrl}
  alt={altText}
  width={width}
  height={height}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  loading={priority ? 'eager' : 'lazy'}
  // Automatic format optimization (WebP/AVIF)
/>
```

### Responsive Image Strategy
- **Sizes Generated**: thumbnail (400w), medium (800w), large (1200w), full (original)
- **Format Optimization**: Automatic WebP/AVIF serving for supported browsers
- **Loading Strategy**: Above-fold eager, below-fold lazy
- **Placeholder Strategy**: Blur placeholders for smooth loading

## 🔍 SEO Architecture

### Metadata Generation
```typescript
// Dynamic metadata for each page type
export async function generateMetadata({ params, searchParams }) {
  const { locale, slug } = params

  // Fetch content from Payload
  const content = await getContentBySlug(slug, locale)

  // Generate optimized metadata
  return {
    title: generateTitle(content, locale),
    description: generateDescription(content, locale),
    openGraph: generateOpenGraph(content, locale),
    twitter: generateTwitterCard(content, locale),
    alternates: generateAlternates(slug, locale),
    other: generateStructuredData(content, locale)
  }
}
```

### Structured Data (JSON-LD)
- **Person Schema**: About page photographer information
- **ImageObject Schema**: Individual image pages
- **ImageGallery Schema**: Gallery collection pages
- **BlogPosting Schema**: Journal/blog posts
- **Organization Schema**: Site-wide business information
- **WebSite Schema**: Search action and site navigation

### Sitemap Generation
```typescript
// Dynamic sitemap with content from CMS
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const galleries = await getPublishedGalleries()
  const posts = await getPublishedPosts()

  return [
    ...staticRoutes,
    ...galleries.map(gallery => ({
      url: `${baseUrl}/${gallery.locale}/galleries/${gallery.slug}`,
      lastModified: gallery.updatedAt,
      priority: 0.8
    })),
    ...posts.map(post => ({
      url: `${baseUrl}/${post.locale}/journals/${post.slug}`,
      lastModified: post.updatedAt,
      priority: 0.6
    }))
  ]
}
```

## 🔐 Security Architecture

### Authentication & Authorization
- **Admin Authentication**: Payload's built-in auth system
- **Session Management**: Secure HTTP-only cookies
- **Role-Based Access**: Admin, Editor, User roles
- **API Protection**: Route-level permissions

### Content Security
```typescript
// Security headers in next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: https:; ..."
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]
```

### Input Validation
- **Payload Validation**: Built-in field validation
- **File Upload Security**: MIME type and size validation
- **XSS Prevention**: Content sanitization
- **SQL Injection Prevention**: MongoDB parameterized queries

## ⚡ Performance Architecture

### Rendering Strategy
- **Static Generation**: Pre-built pages for galleries, posts
- **Incremental Regeneration**: On-demand updates when content changes
- **Server Components**: Reduced client-side JavaScript
- **Client Components**: Interactive elements only

### Caching Layers
```typescript
// Next.js caching configuration
export const revalidate = 3600  // ISR revalidation
export const dynamic = 'force-static'  // Static generation

// Custom cache headers
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
```

### Bundle Optimization
- **Code Splitting**: Route-based automatic splitting
- **Tree Shaking**: Unused code elimination
- **Image Optimization**: Next.js automatic optimization
- **Font Optimization**: Next.js font optimization

## 🛠️ Development Workflow

### Type Safety
```typescript
// Generated types from Payload schema
import type { Gallery, Image, BlogPost } from '@/payload-types'

// Type-safe API calls
const galleries: Gallery[] = await getGalleries()
const gallery: Gallery = await getGalleryBySlug(slug)
```

### Hot Reload & Development
- **Fast Refresh**: React component updates without state loss
- **Type Checking**: Real-time TypeScript validation
- **Payload Admin**: Live CMS updates during development
- **Environment Isolation**: Separate dev/staging/prod databases

### Build Process
```bash
# Type generation from Payload schema
pnpm generate:types

# Production build with optimizations
pnpm build

# Pre-deployment validation
pnpm build:check
```

## 📚 Key Patterns & Best Practices

### Component Architecture
```typescript
// Server Components (default in App Router)
async function GalleryPage({ params }: { params: { slug: string } }) {
  const gallery = await getGalleryBySlug(params.slug)
  return <GalleryDisplay gallery={gallery} />
}

// Client Components (when needed)
'use client'
function InteractiveGallery({ images }: { images: Image[] }) {
  const [selectedImage, setSelectedImage] = useState(null)
  // Interactive functionality
}
```

### Error Handling
```typescript
// Error boundaries for graceful failures
export default function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
    </div>
  )
}

// Not found handling
export default function NotFound() {
  return <div>Gallery not found</div>
}
```

### Environment Configuration
```typescript
// Site configuration with environment overrides
export const SITE_CONFIG = {
  personal: {
    name: process.env.NEXT_PUBLIC_SITE_OWNER_NAME || 'Photographer Name',
    email: process.env.NEXT_PUBLIC_SITE_OWNER_EMAIL || 'contact@example.com'
  },
  site: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Photography Portfolio'
  }
}
```

## 🔄 Data Synchronization

### Content Updates
1. **Admin Creates Content** → Payload CMS
2. **Auto-Save** → MongoDB
3. **Webhook Trigger** → Next.js revalidation
4. **Static Regeneration** → Updated pages
5. **CDN Invalidation** → Fresh content served

### Real-time Features
- **Admin Preview**: Live preview of changes
- **Draft Mode**: Preview unpublished content
- **Incremental Updates**: Only changed pages regenerated

---

## 🎯 Architecture Benefits

### For Users
- **Fast Loading**: Static generation + CDN
- **SEO Optimized**: Server-side rendering
- **Accessible**: Semantic HTML + ARIA
- **Mobile Optimized**: Responsive design

### For Content Managers
- **User-Friendly CMS**: Intuitive admin interface
- **Real-time Preview**: See changes immediately
- **Multilingual Support**: Easy translation management
- **Media Management**: Drag-drop file uploads

### For Developers
- **Type Safety**: End-to-end TypeScript
- **Modern Stack**: Latest Next.js + React features
- **Scalable**: Modular component architecture
- **Maintainable**: Clear separation of concerns

This architecture provides a robust, scalable, and maintainable foundation for professional photography portfolios that can grow with business needs.