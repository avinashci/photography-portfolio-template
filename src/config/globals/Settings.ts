import type { GlobalConfig } from 'payload'
import { createGlobalHook } from '@/lib/utils/revalidation-hooks'
import { createKeywordsHook } from '@/lib/utils/field-hooks'

const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Site Settings',
  hooks: createGlobalHook('settings'),
  admin: {
    group: 'Settings',
    description: 'Global site settings and configuration',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // Site Identity
    {
      name: 'site',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
          // No default value - should be set via CMS
          admin: {
            description: 'Site name/title',
          },
        },
        {
          name: 'tagline',
          type: 'text',
          localized: true,
          admin: {
            description: 'Site tagline/subtitle',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
          // No default value - should be set via CMS
          admin: {
            description: 'Site description for SEO',
          },
        },
        {
          name: 'domain',
          type: 'text',
          required: true,
          admin: {
            description: 'Website domain (e.g., "yoursite.com" - used for structured data and social links)',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'Full website URL (e.g., "https://yoursite.com" - used in metadata and sharing)',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          hasMany: true,
          localized: true,
          admin: {
            description: 'SEO keywords for the site - supports comma-separated input!',
          },
          hooks: {
            beforeChange: [createKeywordsHook({ maxItems: 20, maxLength: 50 })],
          },
        },
        {
          name: 'favicon',
          type: 'relationship',
          relationTo: 'images',
          admin: {
            description: 'Site favicon',
          },
        },
      ],
      admin: {
        description: 'Basic site information',
      },
    },

    // NOTE: Contact info (email) is handled in SiteMetadata global
    // This avoids duplication and keeps personal data separate

    // Social Media Links
    {
      name: 'social',
      type: 'group',
      fields: [
        {
          name: 'instagram',
          type: 'text',
          admin: {
            description: 'Instagram profile URL',
          },
        },
        {
          name: 'twitter',
          type: 'text',
          admin: {
            description: 'Twitter/X profile URL',
          },
        },
        {
          name: 'twitterHandle',
          type: 'text',
          admin: {
            description: 'Twitter/X username (without @, e.g., "yourhandle" - used for social sharing)',
          },
        },
        {
          name: 'facebook',
          type: 'text',
          admin: {
            description: 'Facebook page URL',
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          admin: {
            description: 'LinkedIn profile URL',
          },
        },
        {
          name: 'youtube',
          type: 'text',
          admin: {
            description: 'YouTube channel URL',
          },
        },
        {
          name: 'tiktok',
          type: 'text',
          admin: {
            description: 'TikTok profile URL',
          },
        },
        {
          name: 'pinterest',
          type: 'text',
          admin: {
            description: 'Pinterest profile URL',
          },
        },
        {
          name: 'flickr',
          type: 'text',
          admin: {
            description: 'Flickr profile URL',
          },
        },
        {
          name: 'behance',
          type: 'text',
          admin: {
            description: 'Behance portfolio URL',
          },
        },
        {
          name: 'fiveHundredPx',
          type: 'text',
          admin: {
            description: '500px profile URL',
          },
        },
      ],
      admin: {
        description: 'Social media profiles',
      },
    },

    // Header Branding
    {
      name: 'branding',
      type: 'group',
      fields: [
        {
          name: 'logoUrl',
          type: 'text',
          admin: {
            description: 'Logo image URL (leave empty to show text instead)',
          },
        },
        {
          name: 'logoAlt',
          type: 'text',
          defaultValue: 'Logo',
          admin: {
            condition: (data, siblingData) => siblingData.logoUrl,
            description: 'Logo alt text for accessibility',
          },
        },
        {
          name: 'logoHeight',
          type: 'number',
          defaultValue: 40,
          min: 20,
          max: 100,
          admin: {
            condition: (data, siblingData) => siblingData.logoUrl,
            description: 'Logo height in pixels (20-100)',
          },
        },
        {
          name: 'title',
          type: 'text',
          localized: true,
          // No default value - should be set via CMS
          admin: {
            description: 'Header title text (fallback when no logo or additional text)',
          },
        },
        {
          name: 'subtitle',
          type: 'text',
          localized: true,
          defaultValue: 'Photography',
          admin: {
            description: 'Header subtitle text (fallback when no logo or additional text)',
          },
        },
      ],
      admin: {
        description: 'Header branding settings - Logo URL takes priority, text is fallback',
      },
    },

    // Navigation Settings
    {
      name: 'navigation',
      type: 'group',
      fields: [
        {
          name: 'header',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
          admin: {
            description: 'Header navigation items',
          },
        },
        {
          name: 'footer',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
          admin: {
            description: 'Footer navigation items',
          },
        },
      ],
      admin: {
        description: 'Navigation menus',
      },
    },

    // NOTE: Homepage content is managed in the Home global
    // This avoids duplication and provides a dedicated interface for homepage editing

    // SEO Settings
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'defaultTitle',
          type: 'text',
          localized: true,
          admin: {
            description: 'Default page title template',
          },
        },
        {
          name: 'titleSeparator',
          type: 'text',
          defaultValue: ' | ',
          admin: {
            description: 'Separator for page titles',
          },
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          localized: true,
          admin: {
            description: 'Default meta description',
          },
        },
        {
          name: 'defaultImage',
          type: 'relationship',
          relationTo: 'images',
          admin: {
            description: 'Default social sharing image',
          },
        },
        {
          name: 'googleAnalyticsId',
          type: 'text',
          admin: {
            description: 'Google Analytics tracking ID',
          },
        },
        {
          name: 'googleSiteVerification',
          type: 'text',
          admin: {
            description: 'Google Site Verification code',
          },
        },
        {
          name: 'robots',
          type: 'textarea',
          admin: {
            description: 'Custom robots.txt content',
          },
        },
      ],
      admin: {
        description: 'SEO and analytics settings',
      },
    },

    // Photography Settings
    {
      name: 'photography',
      type: 'group',
      fields: [
        {
          name: 'watermark',
          type: 'group',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: false,
            },
            {
              name: 'image',
              type: 'relationship',
              relationTo: 'images',
              admin: {
                condition: (data, siblingData) => siblingData.enabled,
              },
            },
            {
              name: 'opacity',
              type: 'number',
              min: 0,
              max: 100,
              defaultValue: 50,
              admin: {
                condition: (data, siblingData) => siblingData.enabled,
                description: 'Watermark opacity (0-100)',
              },
            },
            {
              name: 'position',
              type: 'select',
              options: [
                { label: 'Bottom Right', value: 'bottom-right' },
                { label: 'Bottom Left', value: 'bottom-left' },
                { label: 'Top Right', value: 'top-right' },
                { label: 'Top Left', value: 'top-left' },
                { label: 'Center', value: 'center' },
              ],
              defaultValue: 'bottom-right',
              admin: {
                condition: (data, siblingData) => siblingData.enabled,
              },
            },
          ],
          admin: {
            description: 'Watermark settings for images',
          },
        },
        {
          name: 'imageQuality',
          type: 'group',
          fields: [
            {
              name: 'thumbnail',
              type: 'number',
              min: 1,
              max: 100,
              defaultValue: 80,
              admin: {
                description: 'Thumbnail quality (1-100)',
              },
            },
            {
              name: 'medium',
              type: 'number',
              min: 1,
              max: 100,
              defaultValue: 85,
              admin: {
                description: 'Medium size quality (1-100)',
              },
            },
            {
              name: 'large',
              type: 'number',
              min: 1,
              max: 100,
              defaultValue: 90,
              admin: {
                description: 'Large size quality (1-100)',
              },
            },
          ],
          admin: {
            description: 'Image quality settings for different sizes',
          },
        },
        {
          name: 'protections',
          type: 'group',
          fields: [
            {
              name: 'rightClickDisabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Disable right-click on images',
              },
            },
            {
              name: 'dragDisabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Disable image dragging',
              },
            },
            {
              name: 'printDisabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Disable printing pages with images',
              },
            },
          ],
          admin: {
            description: 'Image protection settings',
          },
        },
      ],
      admin: {
        description: 'Photography-specific settings',
      },
    },

    // Performance Settings
    {
      name: 'performance',
      type: 'group',
      fields: [
        {
          name: 'lazyLoading',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable lazy loading for images',
          },
        },
        {
          name: 'webpEnabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Serve WebP images when supported',
          },
        },
        {
          name: 'cacheMaxAge',
          type: 'number',
          defaultValue: 86400,
          admin: {
            description: 'Cache max age in seconds (86400 = 24 hours)',
          },
        },
        {
          name: 'preloadCriticalImages',
          type: 'number',
          defaultValue: 3,
          admin: {
            description: 'Number of critical images to preload',
          },
        },
      ],
      admin: {
        description: 'Performance optimization settings',
      },
    },

    // Footer & Legal
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'copyrightStatement',
          type: 'text',
          localized: true,
          defaultValue: 'All photographs © {year}. All rights reserved.',
          admin: {
            description: 'Copyright statement for all images (use {year} for current year)',
          },
        },
        {
          name: 'imageRightsNotice',
          type: 'textarea',
          localized: true,
          defaultValue: 'Unauthorized use of images is strictly prohibited. For licensing inquiries, please contact us.',
          admin: {
            description: 'Notice about image usage rights',
          },
        },
        // NOTE: Professional info (business name, certifications) is handled in SiteMetadata global
        // This avoids duplication and keeps personal/business data separate
        {
          name: 'legalPages',
          type: 'group',
          fields: [
            {
              name: 'showTerms',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'showPrivacy',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'showImageRights',
              type: 'checkbox',
              defaultValue: true,
            },
          ],
          admin: {
            description: 'Which legal pages to show in footer',
          },
        },
        {
          name: 'showSocialMedia',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show social media links in footer',
          },
        },
      ],
      admin: {
        description: 'Footer content and legal information',
      },
    },

    // Maintenance
    {
      name: 'maintenance',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Enable maintenance mode',
          },
        },
        {
          name: 'message',
          type: 'richText',
          admin: {
            condition: (data, siblingData) => siblingData.enabled,
            description: 'Maintenance mode message',
          },
        },
        {
          name: 'allowedIPs',
          type: 'text',
          hasMany: true,
          admin: {
            condition: (data, siblingData) => siblingData.enabled,
            description: 'IP addresses allowed during maintenance',
          },
        },
      ],
      admin: {
        description: 'Site maintenance settings',
      },
    },
  ],
}

export default Settings