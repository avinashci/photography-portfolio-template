# 🎨 Customization Guide

Complete guide for customizing the photography portfolio template for your own use.

## 🚀 Quick Customization (5 minutes)

### 1. Personal Information
Edit `.env.local` to update your basic information:

```bash
# Replace with your details
NEXT_PUBLIC_SITE_OWNER_NAME="Your Full Name"
NEXT_PUBLIC_SITE_OWNER_EMAIL="contact@yoursite.com"
NEXT_PUBLIC_SITE_OWNER_LOCATION="Your City, Country"
NEXT_PUBLIC_SITE_OWNER_TITLE="Professional Photographer"

# Site branding
NEXT_PUBLIC_SITE_NAME="Your Photography Brand"
NEXT_PUBLIC_SITE_DESCRIPTION="Your unique photography style description"
NEXT_PUBLIC_SERVER_URL="https://yoursite.com"
```

### 2. Site Configuration
Update `src/config/site.config.ts`:

```typescript
export const SITE_CONFIG = {
  personal: {
    name: 'Your Name',
    title: 'Professional Photographer',
    email: 'your@email.com',
    location: 'Your City, Country'
  },
  site: {
    name: 'Your Photography Brand',
    title: 'Professional Photography Portfolio',
    description: 'Your unique value proposition...',
    keywords: 'your, photography, specialties'
  },
  social: {
    instagram: 'https://instagram.com/yourusername',
    twitter: 'https://twitter.com/yourusername'
  }
}
```

## 🎯 Content Management

### Admin Panel Setup
1. **Access Admin Panel**: Visit `http://localhost:3000/admin`
2. **Create Admin Account**: First-time setup
3. **Configure Globals**: Update site-wide settings

### Site Settings Configuration

#### 1. Site Information
Navigate to **Globals** → **Settings** → **Site**:
- **Site Name**: Your business/brand name
- **Tagline**: Descriptive subtitle
- **Description**: SEO description for your site
- **Logo**: Upload your brand logo
- **Favicon**: Upload site icon

#### 2. Contact Information
Navigate to **Globals** → **Settings** → **Contact**:
- **Email**: Primary contact email
- **Phone**: Contact phone number
- **Address**: Business location
- **Social Media**: Links to your profiles

#### 3. Feature Toggles
Navigate to **Globals** → **Settings** → **Features**:
- **Enable Journal**: Blog/article section
- **Enable Gear**: Equipment reviews section
- **Enable Contact**: Contact page
- **Enable Multi-Language**: Secondary language support

### Personal Information
Navigate to **Globals** → **Site Metadata** → **Personal**:
- **Name**: Your full name
- **Title**: Professional title
- **Location**: Geographic location
- **Bio**: Personal biography (rich text)
- **Avatar**: Profile photo

### About Page
Navigate to **Globals** → **About**:
- **Hero Section**: Main about content
- **Biography**: Detailed personal story
- **Profile Images**: Multiple photos
- **Professional Information**: Experience, specialties
- **Awards & Recognition**: Achievements

## 📸 Content Creation

### Creating Galleries

#### 1. New Gallery
Navigate to **Collections** → **Galleries** → **Create New**:
- **Title**: Gallery name (English/Tamil)
- **Slug**: URL-friendly identifier (auto-generated)
- **Description**: Gallery overview
- **Excerpt**: Short description for listings
- **Cover Image**: Main gallery thumbnail

#### 2. Gallery Metadata
- **Location**: Where photos were taken
- **Capture Date**: When gallery was shot
- **Photography Style**: Landscape, portrait, etc.
- **Tags**: Searchable keywords

#### 3. SEO Optimization
- **Meta Title**: Custom page title
- **Meta Description**: Search engine description
- **Keywords**: SEO keywords
- **OG Image**: Social media sharing image

### Adding Images

#### 1. Image Upload
Navigate to **Collections** → **Images** → **Create New**:
- **Image File**: High-quality photo upload
- **Title**: Descriptive image name
- **Description**: Detailed caption
- **Alt Text**: Accessibility description

#### 2. Photography Metadata
- **Location**: GPS coordinates or place name
- **Capture Date**: When photo was taken
- **Camera Settings**:
  - Camera model
  - Lens used
  - Aperture (f-stop)
  - Shutter speed
  - ISO
  - Focal length

#### 3. Organization
- **Photography Style**: Category classification
- **Tags**: Searchable keywords
- **Rights Information**: Copyright details

### Creating Blog Posts

#### 1. New Journal Entry
Navigate to **Collections** → **Blog Posts** → **Create New**:
- **Title**: Article title
- **Slug**: URL identifier
- **Subtitle**: Secondary title
- **Featured Image**: Main article image
- **Excerpt**: Article summary

#### 2. Content Blocks
Use flexible content blocks:
- **Rich Text**: Written content
- **Single Image**: Individual photos
- **Image Layouts**: Multiple image arrangements
- **Gallery Grid**: Photo collections

#### 3. Advanced Layouts
Choose from various image layouts:
- **Two Column**: Side-by-side images
- **Three Grid**: Three-image arrangement
- **Gallery Grid**: Multiple photo grid
- **Full Width**: Spanning full container
- **Full Bleed**: Edge-to-edge display

## 🌍 Multi-Language Setup

### Enabling Secondary Language

#### 1. Environment Configuration
```bash
# Enable secondary language
NEXT_PUBLIC_ENABLE_SECONDARY_LOCALE="true"
NEXT_PUBLIC_SECONDARY_LOCALE="ta"           # Language code
NEXT_PUBLIC_SECONDARY_LOCALE_NAME="தமிழ்"     # Display name
NEXT_PUBLIC_SECONDARY_LOCALE_FLAG="🇮🇳"      # Flag emoji
```

#### 2. Translation Files
Create/edit translation files in `src/lib/i18n/messages/`:

**English** (`en.json`):
```json
{
  "navigation": {
    "home": "Home",
    "galleries": "Galleries",
    "about": "About",
    "journal": "Journal",
    "contact": "Contact"
  },
  "gallery": {
    "viewGallery": "View Gallery",
    "images": "images"
  }
}
```

**Tamil** (`ta.json`):
```json
{
  "navigation": {
    "home": "முகப்பு",
    "galleries": "காட்சியகங்கள்",
    "about": "பற்றி",
    "journal": "இதழ்",
    "contact": "தொடர்பு"
  },
  "gallery": {
    "viewGallery": "காட்சியகத்தைப் பார்க்கவும்",
    "images": "படங்கள்"
  }
}
```

#### 3. Content Translation
In the admin panel, all content fields support multiple languages:
- **Title**: `{ en: "English", ta: "தமிழ்" }`
- **Description**: Separate content for each language
- **Auto-fallback**: English shown if translation missing

## 🎨 Visual Customization

### Styling Configuration

#### 1. Color Scheme
Edit `src/config/site.config.ts`:
```typescript
export const SITE_CONFIG = {
  theme: {
    primaryColor: 'slate',      // Tailwind color
    fontSans: 'Inter',          // Google Font
    fontSerif: 'Playfair Display',
    defaultTheme: 'system'      // light, dark, system
  }
}
```

#### 2. Environment Styling
```bash
# Visual customization
NEXT_PUBLIC_PRIMARY_COLOR="slate"      # Color theme
NEXT_PUBLIC_FONT_SANS="Inter"          # Sans-serif font
NEXT_PUBLIC_FONT_SERIF="Playfair Display"  # Serif font
NEXT_PUBLIC_DEFAULT_THEME="system"     # Theme preference
```

### Logo and Branding

#### 1. Logo Upload
- Navigate to **Globals** → **Settings** → **Site**
- Upload logo image (SVG preferred for scalability)
- Logo appears in navigation header

#### 2. Favicon
- Upload favicon in **Settings** → **Site** → **Favicon**
- Supports ICO, PNG formats
- Automatically appears in browser tabs

### Social Media Links

#### 1. Configuration
```typescript
// In site.config.ts
social: {
  instagram: 'https://instagram.com/yourusername',
  twitter: 'https://twitter.com/yourusername',
  facebook: 'https://facebook.com/yourusername',
  linkedin: 'https://linkedin.com/in/yourusername'
}
```

#### 2. Environment Variables
```bash
NEXT_PUBLIC_INSTAGRAM_URL="https://instagram.com/yourusername"
NEXT_PUBLIC_TWITTER_URL="https://twitter.com/yourusername"
# Leave empty to hide: NEXT_PUBLIC_FACEBOOK_URL=""
```

## 📊 SEO Customization

### Global SEO Settings

#### 1. Site Metadata
Navigate to **Globals** → **Settings** → **SEO**:
- **Meta Title**: Default page title format
- **Meta Description**: Site description for search engines
- **OG Image**: Default social media sharing image
- **Keywords**: Site-wide SEO keywords

#### 2. Homepage SEO
Navigate to **Globals** → **Home** → **SEO**:
- Custom homepage metadata
- Featured content for social sharing
- Structured data configuration

### Content-Specific SEO

#### 1. Gallery SEO
For each gallery:
- **Custom Meta Title**: Override default title
- **Meta Description**: Gallery-specific description
- **Keywords**: Relevant photography keywords
- **OG Image**: Custom social sharing image

#### 2. Image SEO
For each image:
- **Alt Text**: Required for accessibility and SEO
- **Title**: Descriptive image title
- **Keywords**: Image-specific tags
- **Location Data**: Geographic SEO benefits

## 🔧 Advanced Customization

### Custom Homepage Content

#### 1. Hero Section
Navigate to **Globals** → **Home**:
- **Hero Content**: Main homepage message
- **Featured Galleries**: Showcase selections
- **Call-to-Action**: Primary action button

#### 2. Homepage Layout
Edit `src/app/[locale]/page.tsx` for layout changes:
```typescript
export default async function HomePage({ params: { locale } }) {
  const homeData = await getHomePageData(locale)

  return (
    <main>
      <HeroSection content={homeData.hero} />
      <FeaturedGalleries galleries={homeData.featured} />
      <AboutPreview content={homeData.aboutPreview} />
    </main>
  )
}
```

### Navigation Customization

#### 1. Menu Items
Edit `src/components/frontend/layout/Navigation.tsx`:
```typescript
const navigationItems = [
  { href: '/galleries', label: t('navigation.galleries') },
  { href: '/about', label: t('navigation.about') },
  { href: '/journal', label: t('navigation.journal') },
  { href: '/contact', label: t('navigation.contact') },
  // Add custom menu items
]
```

#### 2. Feature Toggles
Use environment variables to show/hide sections:
```bash
NEXT_PUBLIC_SHOW_ABOUT_PAGE="true"
NEXT_PUBLIC_SHOW_JOURNAL="true"
NEXT_PUBLIC_SHOW_GEAR="false"
NEXT_PUBLIC_SHOW_CONTACT="true"
```

### Custom Content Types

#### 1. Adding New Fields
Edit collection configurations in `src/config/collections/`:
```typescript
// Add custom field to Images collection
{
  name: 'photographyAwards',
  type: 'text',
  label: 'Photography Awards',
  admin: {
    description: 'Awards won for this image'
  }
}
```

#### 2. Custom Components
Create new components in `src/components/frontend/`:
```typescript
// Custom image display component
export function CustomImageDisplay({ image }: { image: Image }) {
  return (
    <div className="custom-image-layout">
      <img src={image.url} alt={image.altText} />
      {image.photographyAwards && (
        <div className="awards">{image.photographyAwards}</div>
      )}
    </div>
  )
}
```

## 📱 Mobile & Responsive

### Responsive Configuration
The template is mobile-first responsive by default:
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Images**: Automatic responsive sizing
- **Navigation**: Mobile-friendly hamburger menu
- **Layouts**: Adaptive grid systems

### Touch Optimizations
- **Touch Targets**: Minimum 44px touch areas
- **Swipe Gestures**: Gallery navigation
- **Zoom Support**: Image detail views
- **Loading**: Optimized for mobile networks

## ✅ Customization Checklist

### Basic Setup
- [ ] Update personal information in `.env.local`
- [ ] Configure site settings in admin panel
- [ ] Upload logo and favicon
- [ ] Set up social media links
- [ ] Configure about page content

### Content Creation
- [ ] Create first photo gallery
- [ ] Upload and organize images
- [ ] Write about page biography
- [ ] Add contact information
- [ ] Create initial blog posts (optional)

### SEO Optimization
- [ ] Set up Google Search Console
- [ ] Configure meta titles and descriptions
- [ ] Add structured data keywords
- [ ] Optimize image alt text
- [ ] Submit sitemap to search engines

### Advanced Features
- [ ] Set up multi-language (if needed)
- [ ] Configure analytics (if enabled)
- [ ] Customize color scheme and fonts
- [ ] Add custom content fields
- [ ] Test mobile responsiveness

---

🎉 **Your photography portfolio is now fully customized and ready to showcase your work!**

**Next Steps**: See `05-MAINTENANCE-GUIDE.md` for ongoing maintenance and updates.