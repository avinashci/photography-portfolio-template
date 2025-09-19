import type { Field } from 'payload'

/**
 * Enhanced SEO Field Schema for CMS Collections
 * 
 * This creates a comprehensive SEO block that can be added to any collection
 * to provide full control over search engine optimization from the CMS.
 */

export const seoField: Field = {
  name: 'seo',
  type: 'group',
  admin: {
    description: 'Search engine optimization settings. Leave empty to use auto-generated values.',
  },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        description: 'Custom page title for search engines (50-60 characters recommended). Leave empty to auto-generate.',
        placeholder: 'Auto-generated from content title',
      },
      maxLength: 100,
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        description: 'Page description for search results (150-160 characters recommended). Leave empty to auto-generate.',
        placeholder: 'Auto-generated from content description',
      },
      maxLength: 200,
    },
    {
      name: 'keywords',
      type: 'text',
      admin: {
        description: 'Comma-separated keywords (optional). Auto-generated from tags if not provided.',
        placeholder: 'photography, landscape, travel, etc.',
      },
    },
    {
      name: 'canonicalUrl',
      type: 'text',
      admin: {
        description: 'Custom canonical URL (advanced users only). Leave empty for auto-generation.',
        placeholder: 'https://yoursite.com/custom-url',
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      admin: {
        description: 'Prevent search engines from indexing this page',
      },
      defaultValue: false,
    },
    {
      name: 'noFollow',
      type: 'checkbox',
      admin: {
        description: 'Prevent search engines from following links on this page',
      },
      defaultValue: false,
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'images',
      admin: {
        description: 'Custom image for social media sharing. Leave empty to use featured image or auto-select.',
      },
    },
    {
      name: 'ogTitle',
      type: 'text',
      admin: {
        description: 'Custom title for social media sharing. Leave empty to use meta title.',
        placeholder: 'Auto-generated from meta title',
      },
      maxLength: 95,
    },
    {
      name: 'ogDescription',
      type: 'textarea',
      admin: {
        description: 'Custom description for social media sharing. Leave empty to use meta description.',
        placeholder: 'Auto-generated from meta description',
      },
      maxLength: 200,
    },
    {
      name: 'twitterCard',
      type: 'select',
      admin: {
        description: 'Twitter card type for this content',
      },
      defaultValue: 'summary_large_image',
      options: [
        {
          label: 'Large Image',
          value: 'summary_large_image',
        },
        {
          label: 'Summary',
          value: 'summary',
        },
      ],
    },
    {
      name: 'structuredDataType',
      type: 'select',
      admin: {
        description: 'Schema.org structured data type (auto-detected based on content type)',
      },
      options: [
        { label: 'Auto-detect', value: 'auto' },
        { label: 'Article', value: 'Article' },
        { label: 'ImageObject', value: 'ImageObject' },
        { label: 'Person', value: 'Person' },
        { label: 'Organization', value: 'Organization' },
        { label: 'CreativeWork', value: 'CreativeWork' },
        { label: 'WebPage', value: 'WebPage' },
      ],
      defaultValue: 'auto',
    },
  ],
}

/**
 * Simplified SEO field for collections that need basic SEO
 */
export const basicSeoField: Field = {
  name: 'seo',
  type: 'group',
  admin: {
    description: 'Basic SEO settings',
  },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        description: 'Custom page title (leave empty to auto-generate)',
      },
      maxLength: 100,
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        description: 'Page description for search results (leave empty to auto-generate)',
      },
      maxLength: 200,
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      admin: {
        description: 'Hide from search engines',
      },
      defaultValue: false,
    },
  ],
}

/**
 * Photography-specific SEO enhancements
 */
export const photographySeoField: Field = {
  name: 'photoSeo',
  type: 'group',
  admin: {
    description: 'Photography-specific SEO enhancements',
  },
  fields: [
    {
      name: 'altText',
      type: 'text',
      admin: {
        description: 'Image alt text for accessibility and SEO',
      },
    },
    {
      name: 'imageTitle',
      type: 'text',
      admin: {
        description: 'Image title attribute (appears on hover)',
      },
    },
    {
      name: 'geoLocation',
      type: 'group',
      admin: {
        description: 'Geographic information for location-based SEO',
      },
      fields: [
        {
          name: 'latitude',
          type: 'number',
          admin: {
            description: 'Latitude coordinate',
          },
        },
        {
          name: 'longitude',
          type: 'number',
          admin: {
            description: 'Longitude coordinate',
          },
        },
        {
          name: 'locationName',
          type: 'text',
          admin: {
            description: 'Human-readable location name',
          },
        },
      ],
    },
    {
      name: 'photographyKeywords',
      type: 'select',
      hasMany: true,
      admin: {
        description: 'Photography-specific keywords and styles',
      },
      options: [
        { label: 'Landscape Photography', value: 'landscape-photography' },
        { label: 'Portrait Photography', value: 'portrait-photography' },
        { label: 'Street Photography', value: 'street-photography' },
        { label: 'Wildlife Photography', value: 'wildlife-photography' },
        { label: 'Astrophotography', value: 'astrophotography' },
        { label: 'Macro Photography', value: 'macro-photography' },
        { label: 'Travel Photography', value: 'travel-photography' },
        { label: 'Architecture Photography', value: 'architecture-photography' },
        { label: 'Fine Art Photography', value: 'fine-art-photography' },
        { label: 'Commercial Photography', value: 'commercial-photography' },
      ],
    },
  ],
}