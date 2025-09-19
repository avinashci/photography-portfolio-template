import type { CollectionConfig } from 'payload'
import { createCollectionHook } from '@/lib/utils/revalidation-hooks'
import { createKeywordsHook, createTagsHook } from '@/lib/utils/field-hooks'

const Images: CollectionConfig = {
  slug: 'images',
  hooks: createCollectionHook('images'),
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'gallery', 'photographyStyle', 'featured'],
    description: 'Individual images with basic metadata',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'editor' || user?.role === 'photographer') return true
      // Use PayloadCMS built-in draft/publish system
      return { _status: { equals: 'published' } }
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
        description: 'Main title of the image',
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
      admin: {
        description: 'Detailed description of the image',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      admin: {
        description: 'Brief caption for the image',
      },
    },
    {
      name: 'altText',
      type: 'text',
      required: true,
      admin: {
        description: 'Alternative text for accessibility (required)',
      },
    },

    // Image URLs
    {
      name: 'imageUrls',
      type: 'group',
      fields: [
        {
          name: 'full',
          type: 'text',
          required: true,
          admin: {
            description: 'Full resolution image URL',
          },
        },
        {
          name: 'large',
          type: 'text',
          admin: {
            description: 'Large size image URL (1920px width)',
          },
        },
        {
          name: 'medium',
          type: 'text',
          admin: {
            description: 'Medium size image URL (1024px width)',
          },
        },
        {
          name: 'thumbnail',
          type: 'text',
          admin: {
            description: 'Thumbnail URL (400px width)',
          },
        },
      ],
      admin: {
        description: 'Image URLs for different sizes',
      },
    },

    // Gallery Relationship
    {
      name: 'gallery',
      type: 'relationship',
      relationTo: 'galleries',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Gallery this image belongs to',
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
      ],
      admin: {
        position: 'sidebar',
        description: 'Photography style/genre of this image',
      },
    },

    // Location Information
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          admin: {
            description: 'Location name (e.g., Yosemite National Park)',
          },
        },
        {
          name: 'coordinates',
          type: 'group',
          fields: [
            {
              name: 'latitude',
              type: 'number',
              admin: {
                description: 'GPS latitude',
              },
            },
            {
              name: 'longitude',
              type: 'number',
              admin: {
                description: 'GPS longitude',
              },
            },
          ],
          admin: {
            description: 'GPS coordinates',
          },
        },
        {
          name: 'country',
          type: 'text',
          admin: {
            description: 'Country where photo was taken',
          },
        },
        {
          name: 'region',
          type: 'text',
          admin: {
            description: 'State/Region/Province',
          },
        },
        {
          name: 'city',
          type: 'text',
          admin: {
            description: 'City or nearest town',
          },
        },
      ],
      admin: {
        description: 'Where the photo was taken',
      },
    },

    // Technical Metadata
    {
      name: 'technical',
      type: 'group',
      fields: [
        {
          name: 'cameraBody',
          type: 'relationship',
          relationTo: 'gear',
          required: false,
          admin: {
            description: 'Select camera body from gear collection (shows all gear for now)',
          },
        },
        {
          name: 'lensGear',
          type: 'relationship',
          relationTo: 'gear',
          required: false,
          admin: {
            description: 'Select lens from gear collection (shows all gear for now)',
          },
        },
        {
          name: 'aperture',
          type: 'text',
          admin: {
            description: 'Aperture setting (e.g., f/8)',
          },
        },
        {
          name: 'shutterSpeed',
          type: 'text',
          admin: {
            description: 'Shutter speed (e.g., 1/125s)',
          },
        },
        {
          name: 'iso',
          type: 'number',
          admin: {
            description: 'ISO value (e.g., 400)',
          },
        },
        {
          name: 'focalLength',
          type: 'number',
          admin: {
            description: 'Focal length in mm (e.g., 35)',
          },
        },
        {
          name: 'flash',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Was flash used?',
          },
        },
      ],
      admin: {
        description: 'Camera settings and technical information',
      },
    },

    // Processing & Publishing
    {
      name: 'processing',
      type: 'group',
      fields: [
        {
          name: 'postProcessing',
          type: 'textarea',
          admin: {
            description: 'Post-processing techniques used',
          },
        },
        {
          name: 'software',
          type: 'text',
          admin: {
            description: 'Software used for editing (e.g., Lightroom, Photoshop)',
          },
        },
        {
          name: 'technique',
          type: 'select',
          options: [
            { label: 'Single Exposure', value: 'single' },
            { label: 'HDR', value: 'hdr' },
            { label: 'Focus Stacking', value: 'focus-stacking' },
            { label: 'Panoramic', value: 'panoramic' },
            { label: 'Time Blend', value: 'time-blend' },
            { label: 'Composite', value: 'composite' },
          ],
          hasMany: true,
        },
      ],
      admin: {
        description: 'Post-processing information',
      },
    },

    // Keywords and Tags
    {
      name: 'keywords',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Keywords for search and categorization - supports comma-separated input! Type "landscape, nature, mountains" and they\'ll split automatically when you save.',
      },
      hooks: {
        beforeChange: [createKeywordsHook({ maxItems: 20, maxLength: 50 })],
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Tags for organizing and filtering - supports comma-separated input! Type "featured, portfolio, prints-available" and they\'ll split automatically when you save.',
      },
      hooks: {
        beforeChange: [createTagsHook({ maxItems: 15 })],
      },
    },

    // File Metadata
    {
      name: 'fileInfo',
      type: 'group',
      fields: [
        {
          name: 'filename',
          type: 'text',
          admin: {
            description: 'Original filename',
          },
        },
        {
          name: 'filesize',
          type: 'number',
          admin: {
            description: 'File size in bytes',
          },
        },
        {
          name: 'mimeType',
          type: 'text',
          admin: {
            description: 'MIME type (e.g., image/jpeg)',
          },
        },
        {
          name: 'dimensions',
          type: 'group',
          fields: [
            {
              name: 'width',
              type: 'number',
              admin: {
                description: 'Image width in pixels',
              },
            },
            {
              name: 'height',
              type: 'number',
              admin: {
                description: 'Image height in pixels',
              },
            },
          ],
          admin: {
            description: 'Image dimensions',
          },
        },
      ],
      admin: {
        description: 'File metadata and technical details',
      },
    },

    // Usage Rights and Licensing (Optional - inherits from Site Settings by default)
    {
      name: 'rights',
      type: 'group',
      fields: [
        {
          name: 'useCustomRights',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Override default copyright settings for this image?',
          },
        },
        {
          name: 'customCopyright',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData.useCustomRights,
            description: 'Custom copyright holder (overrides site default)',
          },
        },
        {
          name: 'license',
          type: 'select',
          options: [
            { label: 'All Rights Reserved', value: 'all-rights-reserved' },
            { label: 'Creative Commons BY', value: 'cc-by' },
            { label: 'Creative Commons BY-SA', value: 'cc-by-sa' },
            { label: 'Creative Commons BY-NC', value: 'cc-by-nc' },
            { label: 'Public Domain', value: 'public-domain' },
            { label: 'Custom License', value: 'custom' },
          ],
          defaultValue: 'all-rights-reserved',
          admin: {
            condition: (data, siblingData) => siblingData.useCustomRights,
            description: 'Custom license type (overrides site default)',
          },
        },
        {
          name: 'customAttribution',
          type: 'text',
          admin: {
            condition: (data, siblingData) => siblingData.useCustomRights,
            description: 'Custom attribution text (if different from default)',
          },
        },
        {
          name: 'availableForPrint',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Available for print sales?',
          },
        },
        {
          name: 'availableForLicense',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Available for commercial licensing?',
          },
        },
        {
          name: 'specialNotes',
          type: 'textarea',
          admin: {
            description: 'Special licensing notes or restrictions (optional)',
          },
        },
      ],
      admin: {
        description: 'Usage rights - uses site defaults unless custom settings are enabled',
      },
    },

    // Style-Specific Metadata (Conditional)
    {
      name: 'styleMetadata',
      type: 'group',
      fields: [
        // Landscape Photography
        {
          name: 'landscape',
          type: 'group',
          fields: [
            {
              name: 'weather',
              type: 'select',
              options: [
                { label: 'Clear', value: 'clear' },
                { label: 'Cloudy', value: 'cloudy' },
                { label: 'Stormy', value: 'stormy' },
                { label: 'Foggy', value: 'foggy' },
                { label: 'Windy', value: 'windy' },
                { label: 'Rain', value: 'rain' },
                { label: 'Snow', value: 'snow' },
              ],
              hasMany: true,
              admin: {
                description: 'Weather conditions during capture',
              },
            },
            {
              name: 'timeOfDay',
              type: 'select',
              options: [
                { label: 'Blue Hour (Morning)', value: 'blue-hour-morning' },
                { label: 'Golden Hour (Morning)', value: 'golden-hour-morning' },
                { label: 'Sunrise', value: 'sunrise' },
                { label: 'Midday', value: 'midday' },
                { label: 'Afternoon', value: 'afternoon' },
                { label: 'Golden Hour (Evening)', value: 'golden-hour-evening' },
                { label: 'Sunset', value: 'sunset' },
                { label: 'Blue Hour (Evening)', value: 'blue-hour-evening' },
                { label: 'Night', value: 'night' },
              ],
            },
            {
              name: 'season',
              type: 'select',
              options: [
                { label: 'Spring', value: 'spring' },
                { label: 'Summer', value: 'summer' },
                { label: 'Fall/Autumn', value: 'fall' },
                { label: 'Winter', value: 'winter' },
              ],
            },
            {
              name: 'elevation',
              type: 'number',
              admin: {
                description: 'Elevation in meters',
              },
            },
          ],
          admin: {
            condition: (data) => data.photographyStyle === 'landscape',
            description: 'Landscape-specific shooting conditions',
          },
        },

        // Astrophotography
        {
          name: 'astrophotography',
          type: 'group',
          fields: [
            {
              name: 'subject',
              type: 'select',
              options: [
                { label: 'Milky Way', value: 'milky-way' },
                { label: 'Star Trails', value: 'star-trails' },
                { label: 'Moon', value: 'moon' },
                { label: 'Planets', value: 'planets' },
                { label: 'Deep Sky Objects', value: 'deep-sky' },
                { label: 'Meteor Shower', value: 'meteor-shower' },
                { label: 'Aurora', value: 'aurora' },
              ],
              hasMany: true,
            },
            {
              name: 'moonPhase',
              type: 'select',
              options: [
                { label: 'New Moon', value: 'new' },
                { label: 'Waxing Crescent', value: 'waxing-crescent' },
                { label: 'First Quarter', value: 'first-quarter' },
                { label: 'Waxing Gibbous', value: 'waxing-gibbous' },
                { label: 'Full Moon', value: 'full' },
                { label: 'Waning Gibbous', value: 'waning-gibbous' },
                { label: 'Third Quarter', value: 'third-quarter' },
                { label: 'Waning Crescent', value: 'waning-crescent' },
              ],
            },
            {
              name: 'lightPollution',
              type: 'select',
              options: [
                { label: 'Bortle 1 - Excellent Dark Sky', value: 'bortle-1' },
                { label: 'Bortle 2 - Typical Dark Sky', value: 'bortle-2' },
                { label: 'Bortle 3 - Rural Sky', value: 'bortle-3' },
                { label: 'Bortle 4 - Rural/Suburban', value: 'bortle-4' },
                { label: 'Bortle 5 - Suburban Sky', value: 'bortle-5' },
                { label: 'Bortle 6 - Bright Suburban', value: 'bortle-6' },
                { label: 'Bortle 7+ - Urban/City', value: 'bortle-7-plus' },
              ],
            },
            {
              name: 'exposureTime',
              type: 'number',
              admin: {
                description: 'Total exposure time in minutes',
              },
            },
            {
              name: 'stackedImages',
              type: 'number',
              admin: {
                description: 'Number of images stacked/blended',
              },
            },
          ],
          admin: {
            condition: (data) => data.photographyStyle === 'astrophotography',
            description: 'Astrophotography-specific details',
          },
        },

        // Wildlife Photography
        {
          name: 'wildlife',
          type: 'group',
          fields: [
            {
              name: 'species',
              type: 'text',
              admin: {
                description: 'Species name (common or scientific)',
              },
            },
            {
              name: 'behavior',
              type: 'select',
              options: [
                { label: 'Feeding', value: 'feeding' },
                { label: 'Hunting', value: 'hunting' },
                { label: 'Playing', value: 'playing' },
                { label: 'Resting', value: 'resting' },
                { label: 'Migrating', value: 'migrating' },
                { label: 'Mating', value: 'mating' },
                { label: 'Parenting', value: 'parenting' },
                { label: 'Territorial', value: 'territorial' },
              ],
              hasMany: true,
            },
            {
              name: 'distance',
              type: 'number',
              admin: {
                description: 'Distance to subject in meters',
              },
            },
            {
              name: 'habitat',
              type: 'text',
              admin: {
                description: 'Habitat type (forest, savanna, etc.)',
              },
            },
          ],
          admin: {
            condition: (data) => data.photographyStyle === 'wildlife',
            description: 'Wildlife-specific information',
          },
        },

        // Street Photography
        {
          name: 'street',
          type: 'group',
          fields: [
            {
              name: 'subjectMatter',
              type: 'text',
              admin: {
                description: 'Description of the subject/scene',
              },
            },
            {
              name: 'candid',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Was this a candid shot?',
              },
            },
            {
              name: 'permission',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Did you get permission from subjects?',
              },
            },
            {
              name: 'socialContext',
              type: 'textarea',
              admin: {
                description: 'Social context or story behind the image',
              },
            },
          ],
          admin: {
            condition: (data) => data.photographyStyle === 'street',
            description: 'Street photography context',
          },
        },
      ],
      admin: {
        description: 'Style-specific metadata (appears based on photography style selected)',
      },
    },

    // Usage Statistics
    {
      name: 'usage',
      type: 'group',
      fields: [
        {
          name: 'viewCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of times viewed',
          },
        },
        {
          name: 'downloadCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
            description: 'Number of times downloaded',
          },
        },
        {
          name: 'lastViewed',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'Last time this image was viewed',
          },
        },
      ],
      admin: {
        description: 'Usage statistics and analytics',
      },
    },

    // Publishing Controls
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this image?',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Order in gallery (lower numbers appear first)',
      },
    },

    // Dates
    {
      name: 'captureDate',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'When was this photo taken?',
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
            description: 'Custom page title for this image (overrides default). Leave empty to use image title.',
            placeholder: 'e.g., "Majestic Mountain Sunrise | Landscape Photography"',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          maxLength: 160,
          admin: {
            description: 'Custom meta description for search engines (150-160 characters). Leave empty to use image description.',
            placeholder: 'A breathtaking sunrise over snow-capped mountains captured during...',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'SEO keywords for this image. Include photography style, subject, location, technique.',
            placeholder: 'sunrise photography, mountain landscape, golden hour, nature',
          },
          hooks: {
            beforeChange: [createKeywordsHook({ maxItems: 20, maxLength: 50 })],
          },
        },
        {
          name: 'ogImage',
          type: 'text',
          admin: {
            description: 'Custom OpenGraph image URL for social sharing. Leave empty to use this image.',
            placeholder: 'https://example.com/social-image.jpg',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'Custom canonical URL if different from default. Usually leave empty.',
            placeholder: 'https://example.com/galleries/gallery-name/image-name',
          },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Check to prevent search engines from indexing this image page',
          },
        },
        {
          name: 'imageSchema',
          type: 'group',
          label: 'Image Schema Data',
          fields: [
            {
              name: 'photographicGenre',
              type: 'select',
              options: [
                { label: 'Landscape Photography', value: 'landscape' },
                { label: 'Portrait Photography', value: 'portrait' },
                { label: 'Wildlife Photography', value: 'wildlife' },
                { label: 'Street Photography', value: 'street' },
                { label: 'Astrophotography', value: 'astrophotography' },
                { label: 'Macro Photography', value: 'macro' },
                { label: 'Documentary Photography', value: 'documentary' },
                { label: 'Architectural Photography', value: 'architectural' },
                { label: 'Abstract Photography', value: 'abstract' },
                { label: 'Travel Photography', value: 'travel' },
              ],
              admin: {
                description: 'Photography genre for structured data',
              },
            },
            {
              name: 'copyrightNotice',
              type: 'text',
              admin: {
                description: 'Copyright notice for this specific image (overrides site default)',
                placeholder: '© 2024 Photographer Name. All rights reserved.',
              },
            },
            {
              name: 'creditText',
              type: 'text',
              admin: {
                description: 'Photo credit text for attribution',
                placeholder: 'Photo by Photographer Name',
              },
            },
          ],
          admin: {
            description: 'Additional metadata for rich image results in search engines',
          },
        },
      ],
      admin: {
        description: 'Search Engine Optimization and structured data settings for this image',
      },
    },
  ],
  
  timestamps: true,
  versions: {
    drafts: true,
    maxPerDoc: 2,
  },
}

export default Images