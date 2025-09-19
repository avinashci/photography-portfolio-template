import type { GlobalConfig } from 'payload'
import { createGlobalHook } from '@/lib/utils/revalidation-hooks'

const SiteMetadata: GlobalConfig = {
  slug: 'site-metadata',
  label: 'Site Metadata',
  hooks: createGlobalHook('site-metadata'),
  admin: {
    group: 'Settings',
    description: 'Personal identity and branding - your name, title, bio, and professional info (site settings managed separately)',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    // Personal Information
    {
      name: 'personal',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
          defaultValue: 'Your Name',
          admin: {
            description: 'Personal name (e.g., "Your Full Name")',
          },
        },
        {
          name: 'fullName',
          type: 'text',
          localized: true,
          admin: {
            description: 'Full formal name (if different from display name)',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          defaultValue: 'Professional Photographer',
          admin: {
            description: 'Professional title (e.g., "Professional Photographer", "Visual Artist")',
          },
        },
        {
          name: 'location',
          type: 'text',
          localized: true,
          admin: {
            description: 'Current location/city',
          },
        },
        {
          name: 'email',
          type: 'email',
          required: false,
          admin: {
            description: 'Contact email (optional - leave empty for portfolio-only sites)',
          },
        },
        {
          name: 'bio',
          type: 'richText',
          localized: true,
          admin: {
            description: 'Short biography for about sections',
          },
        },
        {
          name: 'avatar',
          type: 'relationship',
          relationTo: 'images',
          admin: {
            description: 'Profile photo/avatar',
          },
        },
      ],
      admin: {
        description: 'Personal information and identity',
      },
    },

    // NOTE: Site name, description, SEO, and logo are managed in Settings global
    // This focuses only on personal identity and core branding

    // NOTE: Social media links are managed in Settings global
    // This avoids duplication and keeps settings centralized

    // Legal & Copyright (Default settings for all images)
    {
      name: 'legal',
      type: 'group',
      fields: [
        {
          name: 'copyrightHolder',
          type: 'text',
          localized: true,
          admin: {
            description: 'Copyright holder name (defaults to personal name if empty)',
          },
        },
        {
          name: 'copyrightYear',
          type: 'number',
          defaultValue: new Date().getFullYear(),
          admin: {
            description: 'Copyright start year',
          },
        },
        {
          name: 'defaultLicense',
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
            description: 'Default license type for all images (can be overridden per image)',
          },
        },
        {
          name: 'defaultAttribution',
          type: 'text',
          localized: true,
          admin: {
            description: 'Default attribution text (optional, for Creative Commons licenses)',
          },
        },
        {
          name: 'availableForPrint',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Default: Are images available for print by default?',
          },
        },
        {
          name: 'availableForLicense',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Default: Are images available for licensing by default?',
          },
        },
        {
          name: 'businessName',
          type: 'text',
          localized: true,
          admin: {
            description: 'Legal business name (if different from personal name)',
          },
        },
        {
          name: 'businessRegistration',
          type: 'text',
          admin: {
            description: 'Business registration number (optional)',
          },
        },
        {
          name: 'taxId',
          type: 'text',
          admin: {
            description: 'Tax identification number (optional, private)',
          },
        },
      ],
      admin: {
        description: 'Legal and copyright defaults - images inherit these unless custom rights are enabled',
      },
    },

    // NOTE: Detailed contact info (phone, address, etc.) is managed in Settings global
    // Personal email above is sufficient for basic portfolio sites

    // Professional Information
    {
      name: 'professional',
      type: 'group',
      fields: [
        {
          name: 'yearsExperience',
          type: 'number',
          admin: {
            description: 'Years of professional experience',
          },
        },
        {
          name: 'specialties',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'Photography specialties (e.g., "Portrait", "Landscape", "Wedding")',
          },
        },
        {
          name: 'certifications',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'organization',
              type: 'text',
              required: true,
            },
            {
              name: 'year',
              type: 'number',
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                description: 'Link to certification details (optional)',
              },
            },
          ],
          admin: {
            description: 'Professional certifications and awards',
          },
        },
        {
          name: 'equipment',
          type: 'text',
          hasMany: true,
          admin: {
            description: 'Primary equipment/camera gear',
          },
        },
        {
          name: 'services',
          type: 'array',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'price',
              type: 'text',
              admin: {
                description: 'Price range or "Contact for pricing"',
              },
            },
          ],
          admin: {
            description: 'Photography services offered',
          },
        },
      ],
      admin: {
        description: 'Professional credentials and services',
      },
    },
  ],
}

export default SiteMetadata