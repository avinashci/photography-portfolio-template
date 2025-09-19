import type { CollectionConfig } from 'payload'
import { createCollectionHook } from '@/lib/utils/revalidation-hooks'

const Comments: CollectionConfig = {
  slug: 'comments',
  admin: {
    useAsTitle: 'content',
    defaultColumns: ['author.name', 'relatedTo.type', 'status', 'createdAt'],
    description: 'User comments on images and blog posts with moderation workflow',
    group: 'Content',
    listSearchableFields: ['author.name', 'content'],
  },
  access: {
    // Only admins can read all comments
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      // Public API will handle filtering approved comments
      return { status: { equals: 'approved' } }
    },
    // Only admins can create/update/delete (API handles public creation)
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // Author Information
    {
      name: 'author',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          maxLength: 100,
          admin: {
            description: 'Commenter name (publicly visible)',
          },
        },
      ],
    },

    // Comment Content
    {
      name: 'content',
      type: 'textarea',
      required: true,
      minLength: 1,
      maxLength: 1000,
      admin: {
        description: 'Comment content (max 1000 characters)',
        rows: 4,
      },
    },

    // Related Content
    {
      name: 'relatedTo',
      type: 'group',
      admin: {
        description: 'What this comment is related to',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Image', value: 'image' },
            { label: 'Blog Post', value: 'blog-post' },
          ],
          defaultValue: 'image',
        },
        {
          name: 'itemId',
          type: 'text',
          required: true,
          admin: {
            description: 'ID of the related image or blog post',
          },
        },
        {
          name: 'itemSlug',
          type: 'text',
          required: true,
          admin: {
            description: 'Slug of the related content for easy reference',
          },
        },
        {
          name: 'itemTitle',
          type: 'text',
          admin: {
            description: 'Title of the related content for admin reference',
          },
        },
      ],
    },

    // Moderation Status
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: '📝 Draft (Pending Moderation)', value: 'draft' },
        { label: '✅ Approved', value: 'approved' },
        { label: '❌ Rejected', value: 'rejected' },
        { label: '🚫 Spam', value: 'spam' },
      ],
      admin: {
        description: 'Moderation status - only approved comments are shown publicly',
        position: 'sidebar',
      },
    },

    // Moderation Notes
    {
      name: 'moderatorNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes for moderation decisions',
        condition: (data) => ['rejected', 'spam'].includes(data.status),
        rows: 2,
        position: 'sidebar',
      },
    },

    // Security & Anti-Spam Fields
    {
      name: 'security',
      type: 'group',
      admin: {
        description: 'Security information for spam detection',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'ipAddress',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'IP address for rate limiting and spam detection',
          },
        },
        {
          name: 'userAgent',
          type: 'textarea',
          admin: {
            readOnly: true,
            description: 'User agent string',
            rows: 2,
          },
        },
        {
          name: 'submissionTime',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Time taken to submit form (spam detection)',
          },
        },
        {
          name: 'honeypot',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Honeypot field value (should be empty)',
          },
        },
      ],
    },

    // Moderation Metadata
    {
      name: 'moderatedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
        condition: (data) => data.status !== 'draft',
      },
    },
    {
      name: 'moderatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        condition: (data) => data.status !== 'draft',
      },
    },

    // Spam Score (for future ML integration)
    {
      name: 'spamScore',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        description: 'Automated spam detection score (0-100)',
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // Set moderation metadata when status changes
        if (operation === 'update' && data.status !== 'draft') {
          data.moderatedAt = new Date()
          if (req.user) {
            data.moderatedBy = req.user.id
          }
        }
        return data
      },
    ],
  },
  // Database indexes for performance - using Payload v3 format
  indexes: [
    {
      fields: ['relatedTo.type', 'relatedTo.itemId', 'status', 'createdAt'],
    },
    {
      fields: ['security.ipAddress', 'createdAt'],
    },
    {
      fields: ['status', 'createdAt'],
    },
  ],
}

export default Comments