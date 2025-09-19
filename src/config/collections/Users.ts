import type { CollectionConfig } from 'payload'

const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: false, // Disable email verification for now
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Admin',
  },
  access: {
    // Restrict access based on user roles
    create: ({ req: { user } }) => user?.role === 'admin',
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Photographer', value: 'photographer' },
        { label: 'Viewer', value: 'viewer' },
      ],
      defaultValue: 'viewer',
      required: true,
      admin: {
        description: 'User role determines access permissions',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Brief biography or description',
      },
    },
    {
      name: 'avatar',
      type: 'relationship',
      relationTo: 'images',
      admin: {
        description: 'Profile picture',
      },
    },
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'defaultLanguage',
          type: 'select',
          options: [
            { label: 'English', value: 'en' },
          ],
          defaultValue: 'en',
        },
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive email notifications for new content',
          },
        },
      ],
    },
  ],
  timestamps: true,
}

export default Users