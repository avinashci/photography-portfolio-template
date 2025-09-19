import type { Config } from '@/config/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type GlobalSlug = keyof Config['globals']

async function getGlobal(slug: GlobalSlug, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 * In development, optionally disable caching for immediate updates
 */
export const getCachedGlobal = (slug: GlobalSlug, depth = 0) => {
  // For development, you can disable caching by setting this environment variable
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_CACHE === 'true') {
    return () => getGlobal(slug, depth)
  }
  
  return unstable_cache(async () => getGlobal(slug, depth), [slug], {
    tags: [`global_${slug}`],
    revalidate: process.env.NODE_ENV === 'development' ? false : 60, // No cache in dev, 60s in prod
  })
}
