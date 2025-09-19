// storage-adapter-import-placeholder
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { createOptimizedMongooseAdapter } from '@/lib/db/serverless-connection'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

// Import your existing collections
import Users from './collections/Users'
import Images from './collections/Images'
import Galleries from './collections/Galleries'
import BlogPosts from './collections/BlogPosts'
import Gear from './collections/Gear'
import Comments from './collections/Comments'

// Import your existing globals
import Settings from './globals/Settings'
import Home from './globals/Home'
import About from './globals/About'
import SiteMetadata from './globals/SiteMetadata'

// Import working template components
import { defaultLexical } from './fields/defaultLexical'
import { getServerSideURL } from '@/lib/utils/getURL'
import { SITE_CONFIG } from './site.config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/admin/dashboard/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/admin/dashboard/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: createOptimizedMongooseAdapter(
    process.env.MONGODB_URI || SITE_CONFIG.database.fallbackUri
  ),
  collections: [
    Users,
    Images,
    Galleries,
    BlogPosts,
    Gear,
    Comments,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Settings, Home, About, SiteMetadata],
  localization: {
    locales: SITE_CONFIG.i18n.locales.map(locale => ({
      label: locale.name,
      code: locale.code as any,
    })),
    defaultLocale: SITE_CONFIG.i18n.defaultLocale as any,
    fallback: true,
  },
  plugins: [
    // Add your existing SEO plugin but with collection names that match yours
    // seoPlugin({
    //   collections: ['blog-posts', 'galleries', 'images'],
    //   uploadsCollection: 'images',
    //   generateTitle: ({ doc }) => `${doc?.title?.value || doc?.title} | Your Name Photography`,
    //   generateDescription: ({ doc }) => doc?.meta?.description?.value || doc?.meta?.description || doc?.excerpt?.value || doc?.excerpt,
    // }),
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here-change-this',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  }
})