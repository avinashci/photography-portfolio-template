import type { CollectionConfig } from 'payload'

const Gear: CollectionConfig = {
  slug: 'gear',
  admin: {
    useAsTitle: 'name',
    description: 'Photography gear and equipment details',
    defaultColumns: ['name', 'category', 'brand', 'status', 'featured'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'category',
      type: 'select',
      label: 'Equipment Category',
      required: true,
      options: [
        { label: 'Camera Body', value: 'camera-body' },
        { label: 'Lens', value: 'lens' },
        { label: 'Tripod', value: 'tripod' },
        { label: 'Filter', value: 'filter' },
        { label: 'Lighting', value: 'lighting' },
        { label: 'Storage', value: 'storage' },
        { label: 'Computer/Laptop', value: 'computer' },
        { label: 'Software', value: 'software' },
        { label: 'Accessories', value: 'accessories' },
        { label: 'Bags/Cases', value: 'bags' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'name',
      type: 'text',
      label: 'Equipment Name',
      required: true,
      localized: true,
    },
    {
      name: 'brand',
      type: 'text',
      label: 'Brand/Manufacturer',
      required: true,
    },
    {
      name: 'model',
      type: 'text',
      label: 'Model Number/Name',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Equipment Description',
      required: false,
      localized: true,
    },
    {
      name: 'sampleWork',
      type: 'relationship',
      relationTo: 'images',
      label: 'Sample Work Created with This Gear',
      hasMany: true,
    },
    {
      name: 'purchaseInfo',
      type: 'group',
      label: 'Purchase Information',
      fields: [
        {
          name: 'purchaseDate',
          type: 'date',
          label: 'Purchase Date',
        },
        {
          name: 'price',
          type: 'number',
          label: 'Purchase Price (USD)',
        },
        {
          name: 'retailer',
          type: 'text',
          label: 'Purchased From',
        },
        {
          name: 'affiliateLink',
          type: 'text',
          label: 'Affiliate/Purchase Link',
        },
      ],
    },
    {
      name: 'rating',
      type: 'number',
      label: 'Personal Rating (1-5)',
      min: 1,
      max: 5,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Gear',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Current Status',
      options: [
        { label: 'Currently Using', value: 'current' },
        { label: 'Previously Owned', value: 'previous' },
        { label: 'Wishlist', value: 'wishlist' },
        { label: 'Borrowed/Rented', value: 'borrowed' },
      ],
      defaultValue: 'current',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }: any) => {
        // Only trigger revalidation if not during seed/migration
        if (!req?.user?.bypassRevalidation) {
          try {
            const url = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/revalidate`
            const secret = process.env.REVALIDATE_SECRET
            
            if (secret) {
              await fetch(`${url}?secret=${secret}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collection: 'gear', doc }),
              })
              console.log('✅ Successfully triggered revalidation for gear:', doc.slug)
            }
          } catch (error) {
            console.error('❌ Gear revalidation failed:', error)
          }
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }: any) => {
        // Only trigger revalidation if not during seed/migration
        if (!req?.user?.bypassRevalidation) {
          try {
            const url = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/api/revalidate`
            const secret = process.env.REVALIDATE_SECRET
            
            if (secret) {
              await fetch(`${url}?secret=${secret}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collection: 'gear', doc }),
              })
              console.log('✅ Successfully triggered revalidation for gear deletion:', doc.slug)
            }
          } catch (error) {
            console.error('❌ Gear deletion revalidation failed:', error)
          }
        }
      },
    ],
  },
  timestamps: true,
}

export default Gear