import type { CollectionConfig } from 'payload'
import { createCollectionHook } from '@/lib/utils/revalidation-hooks'
import { createKeywordsHook, createTagsHook } from '@/lib/utils/field-hooks'

const Galleries: CollectionConfig = {
  slug: 'galleries',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'photographyStyle', 'featured', 'published'],
    description: 'Photo galleries for organizing and presenting collections of images',
  },
  hooks: createCollectionHook('galleries'),
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'editor' || user?.role === 'photographer') return true
      return { published: { equals: true } }
    },
    create: ({ req: { user } }) => ['admin', 'editor', 'photographer'].includes(user?.role || ''),
    update: ({ req: { user } }) => ['admin', 'editor', 'photographer'].includes(user?.role || ''),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // Basic Information
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Gallery title',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version of title',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Detailed description of the gallery',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short excerpt for gallery previews',
      },
    },


    // Photography Style
    {
      name: 'photographyStyle',
      type: 'select',
      required: true,
      options: [
        { label: 'Landscape', value: 'landscape' },
        { label: 'Astrophotography', value: 'astrophotography' },
        { label: 'Wildlife', value: 'wildlife' },
        { label: 'Street Photography', value: 'street' },
        { label: 'Portrait', value: 'portrait' },
        { label: 'Macro', value: 'macro' },
        { label: 'Documentary', value: 'documentary' },
        { label: 'Architectural', value: 'architectural' },
        { label: 'Abstract', value: 'abstract' },
        { label: 'Travel', value: 'travel' },
        { label: 'Mixed', value: 'mixed' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Primary photography style of this gallery',
      },
    },

    // Organization
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Tags for organization and filtering - supports comma-separated input!',
      },
      hooks: {
        beforeChange: [createTagsHook({ maxItems: 15 })],
      },
    },

    // Cover Image
    {
      name: 'coverImage',
      type: 'text',
      admin: {
        description: 'URL of the cover image for this gallery',
        placeholder: 'https://example.com/image.jpg',
      },
    },

    // Publishing and Display
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Is this gallery published?',
        hidden: true,
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this gallery on homepage?',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Display order (lower numbers appear first)',
      },
    },

    // SEO Settings
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Settings',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          localized: true,
          admin: {
            description: 'Custom page title for this gallery (overrides default). Leave empty to use gallery title.',
            placeholder: 'e.g., "Stunning Landscape Photography | Wildlife Adventures"',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          maxLength: 160,
          admin: {
            description: 'Custom meta description for search engines (150-160 characters recommended). Leave empty to use gallery excerpt.',
            placeholder: 'Explore breathtaking landscape photography captured during my adventures in...',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'SEO keywords and phrases for this gallery. Add relevant photography terms, locations, styles - supports comma-separated input!',
            placeholder: 'landscape photography, nature photos, mountain landscapes',
          },
          hooks: {
            beforeChange: [createKeywordsHook({ maxItems: 20, maxLength: 50 })],
          },
        },
        {
          name: 'ogImage',
          type: 'text',
          admin: {
            description: 'Custom OpenGraph image URL for social sharing. Leave empty to use cover image.',
            placeholder: 'https://example.com/social-image.jpg',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'Custom canonical URL if different from default. Usually leave empty.',
            placeholder: 'https://example.com/galleries/custom-url',
          },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Check to prevent search engines from indexing this gallery (for private/draft galleries)',
          },
        },
      ],
      admin: {
        description: 'Search Engine Optimization settings for this gallery',
      },
    },

    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'When was this gallery published?',
        hidden: true,
      },
    },
  ],
  timestamps: true,
  versions: {
    drafts: true,
    maxPerDoc: 2,
  },
}

export default Galleries