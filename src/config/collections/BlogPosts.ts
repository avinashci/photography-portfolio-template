import type { CollectionConfig } from 'payload'
import { createCollectionHook } from '@/lib/utils/revalidation-hooks'
import { createKeywordsHook, createTagsHook } from '@/lib/utils/field-hooks'

const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  hooks: createCollectionHook('blog-posts'),
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'featured'],
    description: 'Photography blog posts and articles',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'editor' || user?.role === 'photographer') return true
      return { 
        _status: { equals: 'published' }
      }
    },
    create: ({ req: { user } }) => ['admin', 'editor', 'photographer'].includes(user?.role || ''),
    update: ({ req: { user } }) => ['admin', 'editor', 'photographer'].includes(user?.role || ''),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // Basic Content
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Blog post title',
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
      name: 'subtitle',
      type: 'text',
      admin: {
        description: 'Optional subtitle (appears below title in smaller text)',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short excerpt for blog post previews',
      },
    },
    {
      name: 'tripDates',
      type: 'text',
      admin: {
        description: 'Date range for trips/events (e.g. "March 15-20, 2024" or "Summer 2023")',
      },
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        description: 'Author name for this post (optional)',
      },
    },
    // Flexible Content Blocks
    {
      name: 'contentBlocks',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: [
        // Text-Only Section
        {
          slug: 'textSection',
          labels: {
            singular: 'Text Section',
            plural: 'Text Sections',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Section title (optional)',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              admin: {
                description: 'Main text content',
              },
            },
            {
              name: 'layout',
              type: 'select',
              defaultValue: 'standard',
              options: [
                { label: 'Standard', value: 'standard' },
                { label: 'Wide', value: 'wide' },
                { label: 'Centered', value: 'centered' },
                { label: 'Narrow', value: 'narrow' },
              ],
              admin: {
                description: 'Text layout style',
              },
            },
          ],
        },

        // Images-Only Section
        {
          slug: 'imageSection',
          labels: {
            singular: 'Image Section',
            plural: 'Image Sections',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Section title (optional)',
              },
            },
            {
              name: 'images',
              type: 'relationship',
              relationTo: 'images' as const,
              hasMany: true,
              required: true,
              admin: {
                description: 'Images for this section',
              },
            },
            {
              name: 'layout',
              type: 'select',
              required: true,
              defaultValue: 'single',
              options: [
                { label: 'Single Image', value: 'single' },
                { label: 'Two Images Side by Side', value: 'two-column' },
                { label: 'Three Images Grid', value: 'three-grid' },
                { label: 'Gallery Grid', value: 'gallery-grid' },
                { label: 'Full Width Hero', value: 'full-width' },
                { label: 'Full Bleed (Edge to Edge)', value: 'full-bleed' },
              ],
              admin: {
                description: 'How to display the images',
              },
            },
            {
              name: 'aspectRatio',
              type: 'select',
              options: [
                { label: 'Original', value: 'original' },
                { label: 'Square (1:1)', value: 'square' },
                { label: 'Landscape (16:9)', value: 'landscape' },
                { label: 'Portrait (4:5)', value: 'portrait' },
              ],
              defaultValue: 'original',
              admin: {
                description: 'Force specific aspect ratio (optional)',
              },
            },
            {
              name: 'caption',
              type: 'textarea',
              admin: {
                description: 'Caption for the image(s)',
              },
            },
          ],
        },

        // Text + Image Combination
        {
          slug: 'textImageSection',
          labels: {
            singular: 'Text + Image Section',
            plural: 'Text + Image Sections',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Section title (optional)',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              admin: {
                description: 'Text content',
              },
            },
            {
              name: 'image',
              type: 'relationship',
              relationTo: 'images' as const,
              required: true,
              admin: {
                description: 'Featured image for this section',
              },
            },
            {
              name: 'layout',
              type: 'select',
              required: true,
              defaultValue: 'image-left',
              options: [
                { label: 'Image Left, Text Right', value: 'image-left' },
                { label: 'Text Left, Image Right', value: 'text-left' },
                { label: 'Image Above Text', value: 'image-top' },
                { label: 'Text Above Image', value: 'text-top' },
                { label: 'Image Background with Text Overlay', value: 'overlay' },
              ],
              admin: {
                description: 'How to arrange text and image',
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
                description: 'Image size relative to text',
                condition: (_, siblingData) => ['image-left', 'text-left'].includes(siblingData?.layout),
              },
            },
          ],
        },

        // Gallery Showcase
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
              admin: {
                description: 'Section title (optional)',
              },
            },
            {
              name: 'gallery',
              type: 'relationship',
              relationTo: 'galleries' as const,
              required: true,
              admin: {
                description: 'Gallery to showcase',
              },
            },
            {
              name: 'displayStyle',
              type: 'select',
              defaultValue: 'grid',
              options: [
                { label: 'Grid View', value: 'grid' },
                { label: 'Carousel', value: 'carousel' },
                { label: 'Masonry', value: 'masonry' },
                { label: 'Featured + Thumbnails', value: 'featured-thumbs' },
              ],
              admin: {
                description: 'How to display the gallery',
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
          ],
        },

        // Image Carousel/Collage with Text
        {
          slug: 'imageCarouselText',
          labels: {
            singular: 'Image Carousel with Text',
            plural: 'Image Carousel with Text',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Section title (optional)',
              },
            },
            {
              name: 'content',
              type: 'richText',
              required: true,
              admin: {
                description: 'Text content to display alongside images',
              },
            },
            {
              name: 'images',
              type: 'relationship',
              relationTo: 'images' as const,
              hasMany: true,
              required: true,
              minRows: 2,
              admin: {
                description: 'Images for carousel or collage (minimum 2)',
              },
            },
            {
              name: 'displayMode',
              type: 'select',
              required: true,
              defaultValue: 'carousel',
              options: [
                { label: 'Carousel (swipeable)', value: 'carousel' },
                { label: 'Grid Collage', value: 'grid-collage' },
                { label: 'Masonry Collage', value: 'masonry-collage' },
                { label: 'Stacked Layout', value: 'stacked' },
              ],
              admin: {
                description: 'How to display the images',
              },
            },
            {
              name: 'textPosition',
              type: 'select',
              required: true,
              defaultValue: 'right',
              options: [
                { label: 'Text on Right', value: 'right' },
                { label: 'Text on Left', value: 'left' },
                { label: 'Text Above Images', value: 'top' },
                { label: 'Text Below Images', value: 'bottom' },
              ],
              admin: {
                description: 'Where to position the text relative to images',
              },
            },
            {
              name: 'imageRatio',
              type: 'select',
              defaultValue: 'auto',
              options: [
                { label: 'Original Ratios', value: 'auto' },
                { label: 'Square (1:1)', value: 'square' },
                { label: 'Landscape (3:2)', value: 'landscape' },
                { label: 'Portrait (2:3)', value: 'portrait' },
              ],
              admin: {
                description: 'Force specific aspect ratio for images',
              },
            },
            {
              name: 'textSize',
              type: 'select',
              defaultValue: 'medium',
              options: [
                { label: 'Small (30%)', value: 'small' },
                { label: 'Medium (40%)', value: 'medium' },
                { label: 'Large (50%)', value: 'large' },
                { label: 'Extra Large (75%)', value: 'xlarge' },
              ],
              admin: {
                description: 'Text area size relative to images',
                condition: (_, siblingData) => ['left', 'right'].includes(siblingData?.textPosition),
              },
            },
          ],
        },

        // Flexible Content Block
        {
          slug: 'flexibleContent',
          labels: {
            singular: 'Flexible Content Block',
            plural: 'Flexible Content Blocks',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Section title (optional)',
              },
            },
            {
              name: 'elements',
              type: 'blocks',
              required: true,
              minRows: 1,
              blocks: [
                {
                  slug: 'textElement',
                  labels: {
                    singular: 'Text Element',
                    plural: 'Text Elements',
                  },
                  fields: [
                    {
                      name: 'content',
                      type: 'richText',
                      required: true,
                      admin: {
                        description: 'Text content',
                      },
                    },
                    {
                      name: 'style',
                      type: 'select',
                      defaultValue: 'paragraph',
                      options: [
                        { label: 'Paragraph', value: 'paragraph' },
                        { label: 'Large Text', value: 'large' },
                        { label: 'Small Text', value: 'small' },
                        { label: 'Highlighted', value: 'highlighted' },
                        { label: 'Quote Style', value: 'quote' },
                      ],
                      admin: {
                        description: 'Text styling',
                      },
                    },
                    {
                      name: 'alignment',
                      type: 'select',
                      defaultValue: 'left',
                      options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                      ],
                      admin: {
                        description: 'Text alignment',
                      },
                    },
                  ],
                },
                {
                  slug: 'imageElement',
                  labels: {
                    singular: 'Image Element',
                    plural: 'Image Elements',
                  },
                  fields: [
                    {
                      name: 'image',
                      type: 'relationship',
                      relationTo: 'images' as const,
                      required: true,
                      admin: {
                        description: 'Image to display',
                      },
                    },
                    {
                      name: 'size',
                      type: 'select',
                      defaultValue: 'full',
                      options: [
                        { label: 'Full Width', value: 'full' },
                        { label: 'Large (75%)', value: 'large' },
                        { label: 'Medium (50%)', value: 'medium' },
                        { label: 'Small (33%)', value: 'small' },
                        { label: 'Thumbnail (25%)', value: 'thumbnail' },
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
                        description: 'Image alignment',
                      },
                    },
                    {
                      name: 'aspectRatio',
                      type: 'select',
                      defaultValue: 'original',
                      options: [
                        { label: 'Original', value: 'original' },
                        { label: 'Square (1:1)', value: 'square' },
                        { label: 'Landscape (16:9)', value: 'landscape' },
                        { label: 'Portrait (4:5)', value: 'portrait' },
                      ],
                      admin: {
                        description: 'Force specific aspect ratio',
                      },
                    },
                  ],
                },
                {
                  slug: 'spacer',
                  labels: {
                    singular: 'Spacer',
                    plural: 'Spacers',
                  },
                  fields: [
                    {
                      name: 'height',
                      type: 'select',
                      defaultValue: 'medium',
                      options: [
                        { label: 'Small (1rem)', value: 'small' },
                        { label: 'Medium (2rem)', value: 'medium' },
                        { label: 'Large (4rem)', value: 'large' },
                        { label: 'Extra Large (6rem)', value: 'extra-large' },
                      ],
                      admin: {
                        description: 'Spacing height',
                      },
                    },
                  ],
                },
              ],
              admin: {
                description: 'Add text, images, and spacing elements in any order',
              },
            },
            {
              name: 'layout',
              type: 'select',
              defaultValue: 'standard',
              options: [
                { label: 'Standard Width', value: 'standard' },
                { label: 'Wide Layout', value: 'wide' },
                { label: 'Full Width', value: 'full-width' },
                { label: 'Centered Narrow', value: 'narrow' },
              ],
              admin: {
                description: 'Overall section layout',
              },
            },
          ],
        },

        // Quote/Callout
        {
          slug: 'quoteSection',
          labels: {
            singular: 'Quote Section',
            plural: 'Quote Sections',
          },
          fields: [
            {
              name: 'quote',
              type: 'textarea',
              required: true,
              admin: {
                description: 'The quote text',
              },
            },
            {
              name: 'author',
              type: 'text',
              admin: {
                description: 'Quote author (optional)',
              },
            },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'large',
              options: [
                { label: 'Large Quote', value: 'large' },
                { label: 'Emphasized Quote', value: 'emphasized' },
                { label: 'Callout Box', value: 'callout' },
                { label: 'Minimal', value: 'minimal' },
              ],
              admin: {
                description: 'Visual style for the quote',
              },
            },
          ],
        },
      ],
      admin: {
        description: 'Flexible content blocks - arrange text, images, and other elements as you want',
      },
    },

    // Featured Image
    {
      name: 'featuredImage',
      type: 'relationship',
      relationTo: 'images' as const,
      admin: {
        description: 'Featured image for this post',
      },
    },

    // Content Organization
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Photography Tips', value: 'photography-tips' },
        { label: 'Travel Photography', value: 'travel' },
        { label: 'Gear Reviews', value: 'gear-reviews' },
        { label: 'Post-Processing', value: 'post-processing' },
        { label: 'Behind the Scenes', value: 'behind-scenes' },
        { label: 'Location Guides', value: 'location-guides' },
        { label: 'Technical Tutorials', value: 'tutorials' },
        { label: 'Personal Stories', value: 'stories' },
        { label: 'Industry News', value: 'news' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Blog post category',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Tags for organization and SEO - supports comma-separated input!',
      },
      hooks: {
        beforeChange: [createTagsHook({ maxItems: 15 })],
      },
    },

    // Related Content
    {
      name: 'relatedGallery',
      type: 'relationship',
      relationTo: 'galleries' as const,
      admin: {
        description: 'Gallery related to this blog post',
      },
    },

    // Content Details
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Estimated reading time in minutes (manual entry)',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'All Levels', value: 'all-levels' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Target audience level',
      },
    },

    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Feature this post on homepage?',
      },
    },


    // Analytics
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Total views of this post',
      },
    },

    // Internal audit field - not editable by users
    {
      name: 'authorId',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Internal: User ID who created this post (for audit)',
      },
      hooks: {
        beforeChange: [
          ({ req, operation }) => {
            if (operation === 'create' && req.user) {
              return req.user.id
            }
          },
        ],
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
            description: 'Custom page title for this blog post (overrides default). Leave empty to use post title.',
            placeholder: 'e.g., "Chasing Northern Lights in Iceland | Photography Adventure"',
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          localized: true,
          maxLength: 160,
          admin: {
            description: 'Custom meta description for search engines (150-160 characters). Leave empty to use excerpt.',
            placeholder: 'Join me on an incredible journey through Iceland as I chase the elusive Northern Lights...',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'SEO keywords for this blog post. Include photography terms, locations, techniques - supports comma-separated input!',
            placeholder: 'travel photography, iceland photography, northern lights, aurora borealis',
          },
          hooks: {
            beforeChange: [createKeywordsHook({ maxItems: 20, maxLength: 50 })],
          },
        },
        {
          name: 'ogImage',
          type: 'text',
          admin: {
            description: 'Custom OpenGraph image URL for social sharing. Leave empty to use featured image.',
            placeholder: 'https://example.com/social-image.jpg',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: {
            description: 'Custom canonical URL if different from default. Usually leave empty.',
            placeholder: 'https://example.com/journal/custom-url',
          },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Check to prevent search engines from indexing this blog post',
          },
        },
        {
          name: 'schema',
          type: 'group',
          label: 'Article Schema Data',
          fields: [
            {
              name: 'articleType',
              type: 'select',
              defaultValue: 'BlogPosting',
              options: [
                { label: 'Blog Post', value: 'BlogPosting' },
                { label: 'News Article', value: 'NewsArticle' },
                { label: 'Travel Guide', value: 'TravelGuide' },
                { label: 'How-To Guide', value: 'HowTo' },
                { label: 'Review', value: 'Review' },
              ],
              admin: {
                description: 'Type of article for structured data',
              },
            },
            {
              name: 'readingTime',
              type: 'number',
              admin: {
                description: 'Estimated reading time in minutes (auto-calculated if left empty)',
                placeholder: '5',
              },
            },
            {
              name: 'photographyLocation',
              type: 'text',
              admin: {
                description: 'Main location featured in this article for travel/location-based content',
                placeholder: 'Reykjavik, Iceland',
              },
            },
          ],
          admin: {
            description: 'Additional structured data for rich search results',
          },
        },
      ],
      admin: {
        description: 'Search Engine Optimization and structured data settings for this blog post',
      },
    },
  ],
  timestamps: true,
  versions: {
    drafts: true,
    maxPerDoc: 2,
  },
}

export default BlogPosts