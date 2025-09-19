import type { GlobalConfig } from 'payload'
import { createGlobalHook } from '@/lib/utils/revalidation-hooks'
import { createKeywordsHook } from '@/lib/utils/field-hooks'

const Home: GlobalConfig = {
  slug: 'home',
  hooks: createGlobalHook('home'),
  admin: {
    description: 'Homepage content and settings',
  },
  fields: [
    // Hero Section
    {
      name: 'hero',
      type: 'group',
      label: 'Hero Section',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          // No default value - should be set via CMS
          admin: {
            description: 'Main hero title',
          },
        },
        {
          name: 'subtitle',
          type: 'text',
          required: true,
          defaultValue: 'Photography Portfolio',
          admin: {
            description: 'Hero subtitle',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue: 'Capturing the extraordinary beauty of our natural world through the lens of passion and precision.',
          admin: {
            description: 'Hero description text (optional - leave empty for minimal hero)',
          },
        },
        {
          name: 'quote',
          type: 'text',
          admin: {
            description: 'Optional inspirational quote to display instead of title/subtitle',
          },
        },
        {
          name: 'quoteAuthor',
          type: 'text',
          admin: {
            description: 'Author of the quote (required if quote is provided)',
            condition: (_, siblingData) => siblingData?.quote,
          },
        },
        {
          name: 'heroImages',
          type: 'relationship',
          relationTo: 'images',
          hasMany: true,
          maxRows: 10,
          admin: {
            description: 'Select images for the hero carousel. Images will auto-advance every 5 seconds. All image metadata (title, description, etc.) will be pulled from the selected images.',
            allowEdit: false,
          },
        },
      ],
    },
    
    // Featured Content
    {
      name: 'featured',
      type: 'group',
      label: 'Featured Content',
      fields: [
        {
          name: 'showFeaturedGalleries',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show featured galleries section on homepage',
          },
        },
        {
          name: 'featuredGalleriesTitle',
          type: 'text',
          defaultValue: 'Featured Gallery',
          admin: {
            condition: (_, siblingData) => siblingData?.showFeaturedGalleries,
          },
        },
        {
          name: 'featuredGalleriesDescription',
          type: 'textarea',
          defaultValue: 'Explore my latest and most celebrated photography collections',
          admin: {
            condition: (_, siblingData) => siblingData?.showFeaturedGalleries,
          },
        },
      ],
    },

    // About Preview
    {
      name: 'aboutPreview',
      type: 'group',
      label: 'About Preview Section',
      fields: [
        {
          name: 'showAboutPreview',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'aboutTitle',
          type: 'text',
          defaultValue: 'Behind the Lens',
          admin: {
            condition: (_, siblingData) => siblingData?.showAboutPreview,
          },
        },
        {
          name: 'aboutText',
          type: 'textarea',
          defaultValue: 'A passionate photographer dedicated to capturing the beauty and essence of the natural world.',
          admin: {
            condition: (_, siblingData) => siblingData?.showAboutPreview,
          },
        },
      ],
    },

    // SEO
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Settings',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          defaultValue: 'Professional Photography Portfolio',
          admin: {
            description: 'Custom page title for homepage (overrides auto-generated title)',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          defaultValue: 'Professional photography portfolio showcasing stunning visual stories and moments captured through the lens.',
          maxLength: 160,
          admin: {
            description: 'Meta description for search engines (150-160 characters recommended)',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'SEO keywords for the homepage (in addition to site-wide keywords) - supports comma-separated input!',
            placeholder: 'landscape photography, portfolio, fine art',
          },
          hooks: {
            beforeChange: [createKeywordsHook({ maxItems: 20, maxLength: 50 })],
          },
        },
        {
          name: 'ogImage',
          type: 'text',
          admin: {
            description: 'Custom OpenGraph image URL for social sharing. Leave empty to use first hero image.',
            placeholder: 'https://example.com/og-homepage.jpg',
          },
        },
        {
          name: 'twitterImage',
          type: 'text',
          admin: {
            description: 'Custom Twitter card image URL. Leave empty to use OG image or first hero image.',
            placeholder: 'https://example.com/twitter-homepage.jpg',
          },
        },
      ],
    },
  ],
}

export default Home