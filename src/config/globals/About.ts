import type { GlobalConfig } from 'payload'
import { createGlobalHook } from '@/lib/utils/revalidation-hooks'
import { createKeywordsHook } from '@/lib/utils/field-hooks'

const About: GlobalConfig = {
  slug: 'about',
  hooks: createGlobalHook('about'),
  admin: {
    description: 'About page content and settings',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => ['admin', 'editor'].includes(user?.role || ''),
  },
  fields: [
    // Page Header
    {
      name: 'header',
      type: 'group',
      label: 'Page Header',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          defaultValue: 'About Me',
        },
        {
          name: 'subtitle',
          type: 'text',
          defaultValue: 'Photographer & Visual Storyteller',
        },
        {
          name: 'heroImage',
          type: 'text',
          admin: {
            description: 'Hero image URL',
          },
        },
      ],
    },

    // Gear Section
    {
      name: 'gearSection',
      type: 'group',
      label: 'Photography Gear Section',
      fields: [
        {
          name: 'showGearSection',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Show the photography gear section at the bottom of the about page',
          },
        },
        {
          name: 'gearTitle',
          type: 'text',
          defaultValue: 'My Photography Gear',
          localized: true,
          admin: {
            description: 'Title for the gear section',
            condition: (data, siblingData) => siblingData?.showGearSection,
          },
        },
        {
          name: 'gearDescription',
          type: 'textarea',
          defaultValue: 'The tools that help me capture and create the images I share with the world.',
          localized: true,
          admin: {
            description: 'Description text below the gear section title',
            condition: (data, siblingData) => siblingData?.showGearSection,
          },
        },
        {
          name: 'maxGearItems',
          type: 'number',
          defaultValue: 12,
          min: 3,
          max: 24,
          admin: {
            description: 'Maximum number of gear items to show',
            condition: (data, siblingData) => siblingData?.showGearSection,
          },
        },
      ],
    },

    // Flexible Content Blocks for About Page
    {
      name: 'contentBlocks',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: [
        // Hero/Intro Block
        {
          slug: 'heroSection',
          labels: {
            singular: 'Hero Section',
            plural: 'Hero Sections',
          },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'Your full name',
              },
            },
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'Professional title (e.g., "Photographer & Developer")',
              },
            },
            {
              name: 'location',
              type: 'text',
              localized: true,
              admin: {
                description: 'Your location (optional)',
              },
            },
            {
              name: 'introduction',
              type: 'richText',
              required: true,
              localized: true,
              admin: {
                description: 'Brief introduction paragraph',
              },
            },
            {
              name: 'profileImage',
              type: 'relationship',
              relationTo: 'images',
              admin: {
                description: 'Profile photo',
              },
            },
            {
              name: 'layout',
              type: 'select',
              defaultValue: 'image-right',
              options: [
                { label: 'Image on Right', value: 'image-right' },
                { label: 'Image on Left', value: 'image-left' },
                { label: 'Image Above Text', value: 'image-top' },
                { label: 'Centered', value: 'centered' },
              ],
              admin: {
                description: 'How to arrange the hero content',
              },
            },
          ],
        },

        // Text Paragraph Block
        {
          slug: 'textParagraph',
          labels: {
            singular: 'Text Paragraph',
            plural: 'Text Paragraphs',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              admin: {
                description: 'Section title (optional)',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              localized: true,
              admin: {
                description: 'Paragraph content',
              },
            },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'standard',
              options: [
                { label: 'Standard', value: 'standard' },
                { label: 'Large Text', value: 'large' },
                { label: 'Centered', value: 'centered' },
                { label: 'Narrow Column', value: 'narrow' },
                { label: 'Wide Column', value: 'wide' },
              ],
              admin: {
                description: 'Text styling and layout',
              },
            },
          ],
        },

        // Quote Block
        {
          slug: 'quoteBlock',
          labels: {
            singular: 'Quote',
            plural: 'Quotes',
          },
          fields: [
            {
              name: 'quote',
              type: 'textarea',
              required: true,
              localized: true,
              admin: {
                description: 'The quote text',
              },
            },
            {
              name: 'author',
              type: 'text',
              localized: true,
              admin: {
                description: 'Quote author or context (optional)',
              },
            },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'large',
              options: [
                { label: 'Large Quote', value: 'large' },
                { label: 'Emphasized', value: 'emphasized' },
                { label: 'Callout Box', value: 'callout' },
                { label: 'Minimal', value: 'minimal' },
              ],
            },
          ],
        },

        // Image Block
        {
          slug: 'imageBlock',
          labels: {
            singular: 'Image',
            plural: 'Images',
          },
          fields: [
            {
              name: 'image',
              type: 'relationship',
              relationTo: 'images',
              required: true,
              admin: {
                description: 'Image to display',
              },
            },
            {
              name: 'caption',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Image caption (optional)',
              },
            },
            {
              name: 'size',
              type: 'select',
              defaultValue: 'medium',
              options: [
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' },
                { label: 'Full Width', value: 'full' },
              ],
              admin: {
                description: 'Image size',
              },
            },
            {
              name: 'alignment',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
              admin: {
                condition: (data, siblingData) => siblingData?.size !== 'full',
              },
            },
          ],
        },

        // Skills/List Block
        {
          slug: 'skillsList',
          labels: {
            singular: 'Skills List',
            plural: 'Skills Lists',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'Section title (e.g., "Photography Skills", "Technologies")',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Optional description before the list',
              },
            },
            {
              name: 'skills',
              type: 'array',
              required: true,
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Skill or technology name',
                  },
                },
                {
                  name: 'description',
                  type: 'text',
                  admin: {
                    description: 'Brief description (optional)',
                  },
                },
              ],
              admin: {
                description: 'List of skills, technologies, or specializations',
              },
            },
            {
              name: 'layout',
              type: 'select',
              defaultValue: 'grid',
              options: [
                { label: 'Grid (2-3 columns)', value: 'grid' },
                { label: 'List (vertical)', value: 'list' },
                { label: 'Inline (horizontal)', value: 'inline' },
                { label: 'Tags', value: 'tags' },
              ],
              admin: {
                description: 'How to display the skills',
              },
            },
          ],
        },

        // Text + Image Block
        {
          slug: 'textImageBlock',
          labels: {
            singular: 'Text + Image',
            plural: 'Text + Image Blocks',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              admin: {
                description: 'Section title (optional)',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              localized: true,
              admin: {
                description: 'Text content',
              },
            },
            {
              name: 'image',
              type: 'relationship',
              relationTo: 'images',
              required: true,
              admin: {
                description: 'Accompanying image',
              },
            },
            {
              name: 'layout',
              type: 'select',
              defaultValue: 'image-right',
              options: [
                { label: 'Image on Right', value: 'image-right' },
                { label: 'Image on Left', value: 'image-left' },
                { label: 'Image Above Text', value: 'image-top' },
                { label: 'Text Above Image', value: 'text-top' },
              ],
              admin: {
                description: 'Arrangement of text and image',
              },
            },
            {
              name: 'imageSize',
              type: 'select',
              defaultValue: 'medium',
              options: [
                { label: 'Small (30%)', value: 'small' },
                { label: 'Medium (50%)', value: 'medium' },
                { label: 'Large (70%)', value: 'large' },
              ],
              admin: {
                condition: (data, siblingData) => ['image-left', 'image-right'].includes(siblingData?.layout),
              },
            },
          ],
        },

        // Gallery Showcase Block
        {
          slug: 'galleryShowcase',
          labels: {
            singular: 'Gallery Showcase',
            plural: 'Gallery Showcases',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              admin: {
                description: 'Section title (optional)',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Description before gallery (optional)',
              },
            },
            {
              name: 'gallery',
              type: 'relationship',
              relationTo: 'galleries',
              required: true,
              admin: {
                description: 'Gallery to showcase',
              },
            },
            {
              name: 'maxImages',
              type: 'number',
              defaultValue: 6,
              admin: {
                description: 'Maximum number of images to show',
              },
            },
            {
              name: 'showGalleryLink',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show "View Full Gallery" link?',
              },
            },
          ],
        },

        // Social Links Block
        {
          slug: 'socialLinks',
          labels: {
            singular: 'Social Links',
            plural: 'Social Links Blocks',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              admin: {
                description: 'Section title (optional)',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
              admin: {
                description: 'Description before links (optional)',
              },
            },
            {
              name: 'links',
              type: 'array',
              required: true,
              fields: [
                {
                  name: 'platform',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Platform name (e.g., "Instagram", "GitHub")',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Profile URL',
                  },
                },
                {
                  name: 'username',
                  type: 'text',
                  admin: {
                    description: 'Username/handle (optional)',
                  },
                },
                {
                  name: 'description',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Brief description (optional)',
                  },
                },
              ],
            },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'buttons',
              options: [
                { label: 'Button Style', value: 'buttons' },
                { label: 'Icon Grid', value: 'icons' },
                { label: 'Simple List', value: 'list' },
              ],
              admin: {
                description: 'How to display the social links',
              },
            },
          ],
        },

        // Spacer/Divider Block
        {
          slug: 'spacer',
          labels: {
            singular: 'Spacer',
            plural: 'Spacers',
          },
          fields: [
            {
              name: 'size',
              type: 'select',
              defaultValue: 'medium',
              options: [
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' },
                { label: 'Extra Large', value: 'xl' },
              ],
              admin: {
                description: 'Amount of spacing',
              },
            },
            {
              name: 'showDivider',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Show a visual divider line?',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Flexible content blocks for your About page - arrange paragraphs, images, and sections as needed',
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
            description: 'Custom page title for the About page (overrides default). Leave empty to use site default.',
            placeholder: 'e.g., "About [Your Name] | Professional Photographer & Visual Artist"',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          maxLength: 160,
          admin: {
            description: 'Custom meta description for search engines (150-160 characters). Leave empty to use auto-generated description.',
            placeholder: 'Learn about [Your Name], a professional photographer specializing in landscape and wildlife photography...',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'SEO keywords for the About page. Include your name, photography specialties, and location - supports comma-separated input!',
            placeholder: 'professional photographer, landscape photography, [your city], photo services',
          },
          hooks: {
            beforeChange: [createKeywordsHook({ maxItems: 20, maxLength: 50 })],
          },
        },
        {
          name: 'ogImage',
          type: 'text',
          admin: {
            description: 'Custom OpenGraph image URL for social sharing. Leave empty to use profile image or default.',
            placeholder: 'https://example.com/about-social-image.jpg',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'Custom canonical URL if different from default. Usually leave empty.',
            placeholder: 'https://example.com/about',
          },
        },
        {
          name: 'schema',
          type: 'group',
          label: 'Person Schema Data',
          fields: [
            {
              name: 'jobTitle',
              type: 'text',
              localized: true,
              admin: {
                description: 'Professional job title for structured data (overrides config setting)',
                placeholder: 'Professional Photographer & Visual Artist',
              },
            },
            {
              name: 'worksFor',
              type: 'text',
              admin: {
                description: 'Company or organization name (if applicable)',
                placeholder: 'Your Photography Studio',
              },
            },
            {
              name: 'alumniOf',
              type: 'text',
              admin: {
                description: 'Educational background (school, university, etc.)',
                placeholder: 'School of Visual Arts, Photography Institute',
              },
            },
            {
              name: 'awards',
              type: 'text',
              hasMany: true,
              admin: {
                description: 'Notable awards or recognitions',
                placeholder: 'International Photography Award 2023',
              },
            },
            {
              name: 'knowsLanguage',
              type: 'text',
              hasMany: true,
              admin: {
                description: 'Languages you speak',
                placeholder: 'English, Tamil, French',
              },
            },
          ],
          admin: {
            description: 'Enhanced person schema data for rich search results',
          },
        },
      ],
      admin: {
        description: 'Search Engine Optimization and structured data settings for the About page',
      },
    },
  ],
}

export default About